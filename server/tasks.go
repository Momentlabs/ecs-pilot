package server

import (
  "fmt"
  "github.com/aws/aws-sdk-go/private/protocol/json/jsonutil"
  "github.com/gorilla/mux"
  "net/http"
  "github.com/Sirupsen/logrus"

  // "awslib"
  "github.com/jdrivas/awslib"
)

func TasksController(w http.ResponseWriter, r *http.Request) {

  vars := mux.Vars(r)
  clusterName := vars[CLUSTER_NAME_VAR]
  f := logrus.Fields{"controller": "TaskController",}

  sess, err := getAWSSession(r)
  if err != nil {
    log.Error(f, "Fail to find appropriate AWS Session", err)
    http.Error(w, fmt.Sprintf("Failed to find appropriate AWS Session: %s", err), http.StatusFailedDependency )
    return
  }

  ctMap, err := awslib.GetAllTaskDescriptions(clusterName, sess)
  if err != nil {
    log.Error(f, "Failed to obtain Tasks from AWS.", err)
    http.Error(w, fmt.Sprintf("Failed to obtain AWS: %s"), http.StatusFailedDependency)
    return
  }
  f["numberOfTasks"] = len(ctMap)
  log.Debug(f, "Obtained tasks from AWS")

  response, err  := jsonutil.BuildJSON(ctMap)
  if err != nil {
    log.Error(f, "Failed to marshall JSON for the ctMap of tasks.", err)
    http.Error(w, "Failed to marshall JSON for response.", http.StatusInternalServerError)
    return
  }

  _, err = w.Write(response)
  if err != nil {
    log.Error(f, "Failed to write JSON response", err)
  } else {
    f["json"] = string(response)
    log.Debug(f, "Sent repsonse.")
  }
}