package server

import (
  "fmt"
  "time"
  "net/http"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/GeertJohan/go.rice"
  "github.com/gorilla/context"
  "github.com/gorilla/mux"
  "github.com/jdrivas/sl"
  "github.com/joho/godotenv"
  "github.com/Sirupsen/logrus"
)

func init() {
  configureLogs()
}

// LOG CONSTANTS
const (
  SERVER_STARTING = "server_starting"
)
const ServerName = "ecs-pilot"

// VAR KEY CONSTANTS
const (
  CLUSTER_NAME_VAR = "clusterName"
)

// This is essentially a constant set up at the top by DoServe
// that is ... a global for the package .....
var baseSession *session.Session

func DoServe(address string, sess *session.Session, local bool) error {
  // TODO: This doesn't have a way to stop from the outside ....
  if sess == nil {
    return fmt.Errorf("AWS session  must be non-nil")
  }
  baseSession = sess

  // TODO: This is for development ONLY>
  // Let's figure out a way to turn this off.
  // Load the environemnt (ie get the secret)
  err := godotenv.Load();
  if err != nil {
    log.Error(nil, "Couldn't load environment variables from local system.", err)
  }

  log.Debug(logrus.Fields{"serverName": ServerName, "action:": SERVER_STARTING,}, "Call server Go routine")
  go func() {
    serve(address)
  }()
  return nil
}

func serve(address string) (err error) {
  fields := logrus.Fields{"serverAddress": address, "serverName": ServerName, "action": SERVER_STARTING}
  log.Info(fields, "Starting server.")

  // Routes
  r := mux.NewRouter().StrictSlash(true)

  // API
  r.Handle("/sessionId", ApiAccess(SessionIdController, baseSession, true))
  r.Handle("/clusters", ApiAccess(ClusterController, baseSession, true))
  r.Handle(fmt.Sprintf("/deepTasks/{%s}", CLUSTER_NAME_VAR), ApiAccess(DeepTaskController, baseSession, true));
  r.Handle(fmt.Sprintf("/instances/{%s}", CLUSTER_NAME_VAR), ApiAccess(InstancesController, baseSession, true));
  r.Handle(fmt.Sprintf("/tasks/{%s}", CLUSTER_NAME_VAR), ApiAccess(TasksController, baseSession, true));
  r.Handle("/security_groups", ApiAccess(SecurityGroupsController, baseSession, true));

  // r.HandleFunc("/sessionId", ApiAccess(SessionIdController, baseSession, true));
  // r.HandleFunc("/clusters", ApiAccess(ClusterController, baseSession, true));
  // r.HandleFunc(fmt.Sprintf("/deepTasks/{%s}", CLUSTER_NAME_VAR), ApiAccess(DeepTaskController, baseSession, true));
  // r.HandleFunc(fmt.Sprintf("/instances/{%s}", CLUSTER_NAME_VAR), ApiAccess(InstancesController, baseSession, true));
  // r.HandleFunc(fmt.Sprintf("/tasks/{%s}", CLUSTER_NAME_VAR), ApiAccess(TasksController, baseSession, true));
  // r.HandleFunc("/security_groups", ApiAccess(SecurityGroupsController, baseSession, true));

  // Look for static files otherwise.
  // r.PathPrefix("/").Handler(http.FileServer(http.Dir("./public")));
  r.PathPrefix("/").Handler(http.FileServer(rice.MustFindBox("public").HTTPBox()))

  // General Middleware
  // handlerChain := 
  //   context.ClearHandler(LogHandler(CorsHandler(JWTHandler(AwsSessionHandler(r, baseSession, true)))))
  handlerChain := context.ClearHandler(LogHandler(r))

  // Serve it up.
  err = http.ListenAndServe(address, handlerChain)
  log.Error(fields, "Shutting down.", err)
  return err
}

func IndexController(w http.ResponseWriter, r *http.Request) {
  f := logrus.Fields{
    "host": r.Host, 
    "hostAddr": r.RemoteAddr, 
    "method": r.Method, 
    "url":  r.URL.String(),
    "requestTime": 0,
  }
  log.Info(f, "Serving index.html.");
  http.ServeFile(w, r, "./public/index.html")
}

// Configure the pipeline or local or non-local use. 
// TODO: Actually implement this. Probably the local case
// is to use the session passed in (delegateWtithJWT := false) an dremove the JWTHandler.
func ApiAccess(handler http.HandlerFunc, baseSession *session.Session, delegateWithJWT bool) http.Handler {
  return CorsHandler(JWTHandler(AwsSessionHandler(handler, baseSession, delegateWithJWT)));
}
// TODO: For the moment I'm really only using this for DEV to seperate development on client and server.
// I don't expect that I'll necessarily want to actually enable this
// so some solution for proper production use needs to be determined once I decide how this will really be 
// deployed.
// To be clear: this is badness and should not surivice a production release.
func CorsHandler(handler http.Handler) http.Handler {
  return http.HandlerFunc( func (w http.ResponseWriter, r * http.Request) {
    log.Info(nil, "Setting CORS header.")
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Contorl-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")

    // TODO: Fill this out.
    if r.Method == "OPTIONS" {
      w.WriteHeader(http.StatusOK);
    } else {
      handler.ServeHTTP(w,r)
    }
  })

}

func LogHandler(handler http.Handler) http.Handler {
  return http.HandlerFunc( func (w http.ResponseWriter, r *http.Request) {
    start := time.Now()
    f := logrus.Fields{
      "host": r.Host, 
      "hostAddr": r.RemoteAddr, 
      "method": r.Method, 
      "url":  r.URL.String(),
      "requestTime": 0,
    }
    log.Info(f, ServerName + ": Started request." )

    handler.ServeHTTP(w,r)

    f["requestTime"] = time.Since(start)
    // TODO: Need to determine what the response will be.
    log.Info(f, ServerName + ": Completed request")  
  })
}

// Log control
var log = sl.New();
const (
  jsonLog = "json"
  textLog = "text"
  debug = true;
  verbose = false;
)

func configureLogs() {
  SetFormatter(jsonLog)
  updateLogLevel()
}
func SetLogLevel(l logrus.Level) {
  log.SetLevel(l)
}

func SetFormatter(level string) {
  switch textLog {
  case jsonLog:
    f := new(logrus.JSONFormatter)
    log.SetFormatter(f)
  case textLog:
    f := new(sl.TextFormatter)
    f.FullTimestamp = true
    log.SetFormatter(f)
  }
}

func updateLogLevel() {
  l := logrus.InfoLevel
  if debug || verbose {
    l = logrus.DebugLevel
  }
  log.SetLevel(l)
}

