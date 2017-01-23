package server

import (
  "fmt"
  "time"
  "net/http"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/gorilla/context"
  "github.com/gorilla/mux"
  "github.com/jdrivas/sl"
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
var awsSession *session.Session

func DoServe(address string, sess *session.Session) error {
  // TODO: This doesn't have a way to stop from the outside ....
  if sess == nil {
    return fmt.Errorf("AWS session  must be non-nil")
  }
  awsSession = sess
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

  // Single Page app
  r.HandleFunc("/", IndexController)
  r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static/"))))

  // REST API
  r.HandleFunc("/clusters", ClusterController)
  r.HandleFunc(fmt.Sprintf("/deepTasks/{%s}", CLUSTER_NAME_VAR), DeepTaskController)
  r.HandleFunc(fmt.Sprintf("/instances/{%s}", CLUSTER_NAME_VAR), InstancesController)
  r.HandleFunc(fmt.Sprintf("/tasks/{%s}", CLUSTER_NAME_VAR), TasksController)
  r.HandleFunc(fmt.Sprintf("/security_groups"), SecurityGroupsController)

  // Middleware
  handlerChain := context.ClearHandler(LogHandler(CorsHandler(r)))

  // Server it up.
  err = http.ListenAndServe(address, handlerChain)
  log.Error(fields, "Shutting down.", err)
  return err
}


func IndexController(w http.ResponseWriter, r *http.Request) {
  http.ServeFile(w, r, "./static/index.html")
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
    handler.ServeHTTP(w,r)
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

