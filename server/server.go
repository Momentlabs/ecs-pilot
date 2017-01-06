package server

import (
  "time"
  "net/http"
  "github.com/gorilla/context"
  "github.com/gorilla/mux"
  "github.com/jdrivas/sl"
  "github.com/Sirupsen/logrus"
)

func init() {
  configureLogs()
}

const (
  SERVER_STARTING = "server_starting"
)

const ServerName = "ecs-pilot"

func DoServe(address string) error {
  // TODO: This doesn't stop ....
  go func() {
    serve(address)
  }()
  return nil
}

func serve(address string) (err error) {
  fields := logrus.Fields{"serverAddress": address, "serverName": ServerName}
  log.Info(fields, "Starting server.")

  // Routes
  r := mux.NewRouter().StrictSlash(true)

  // Single Page app
  r.HandleFunc("/", IndexController)
  r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static/"))))

  // REST API
  r.HandleFunc("/clusters", ClusterController)

  // Middleware
  handlerChain := context.ClearHandler(LogHandler(r))

  // Server it up.
  err = http.ListenAndServe(address, handlerChain)
  log.Error(fields, "Shutting down.", err)
  return err
}


func IndexController(w http.ResponseWriter, r *http.Request) {
  http.ServeFile(w, r, "./static/index.html")
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

