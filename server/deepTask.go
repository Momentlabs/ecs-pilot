package server

import (
  "fmt"
  "github.com/aws/aws-sdk-go/private/protocol/json/jsonutil"
  "github.com/gorilla/mux"
  "github.com/Sirupsen/logrus"
  "net/http"

  // "awslib"
  "github.com/jdrivas/awslib"

)

func DeepTaskController(w http.ResponseWriter, r *http.Request) {
  vars := mux.Vars(r)
  clusterName := vars[CLUSTER_NAME_VAR];
  f := logrus.Fields{"controller": "DeepTaskController", "cluster": clusterName}

  sess, err := getAWSSession(r)
  if err != nil {
    log.Error(f, "Fail to find appropriate AWS Session", err)
    http.Error(w, fmt.Sprintf("Failed to find appropriate AWS Session: %s", err), http.StatusFailedDependency )
    return
  }

  // this takes an awful long time ....
  deepTasks, err := awslib.GetDeepTaskList(clusterName, sess)
  if err != nil {
    log.Error(f, "Failed to obtain DeepTasks from AWS.", err)
    http.Error(w, fmt.Sprintf("Failed to obtain DeepTasks from AWS: %s", err), http.StatusFailedDependency)
    return
  }
  f["numberOfDeepTasks"] = len(deepTasks)
  log.Debug(f, "Got deepTasks from AWS.")

  response, err  := jsonutil.BuildJSON(deepTasks)
  if err != nil {
    log.Error(f, "Failed to marshall JSON on clusters.", err)
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