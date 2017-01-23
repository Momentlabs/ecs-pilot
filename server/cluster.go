package server

import (
  "fmt"
  // "encoding/json"
  "github.com/aws/aws-sdk-go/aws"
  "github.com/aws/aws-sdk-go/service/ecs"
  "github.com/aws/aws-sdk-go/private/protocol/json/jsonutil"

  "net/http"
  "github.com/Sirupsen/logrus"

  "github.com/jdrivas/awslib"
)

// type Cluster struct {
//   ActiveServicesCount  int64
//   ClusterName string `json:"clusterName" type:"string"`
//   PendingTasksCount int64
//   RegisteredContainerInstanceCount int64
//   RunningTasksCount int64
//   Status string
// }

var TestClusters = []ecs.Cluster {
  ecs.Cluster{
    ActiveServicesCount: aws.Int64(0),
    ClusterName: aws.String("minecraft"),
    PendingTasksCount: aws.Int64(0),
    RegisteredContainerInstancesCount: aws.Int64(0),
    RunningTasksCount: aws.Int64(0),
    Status: aws.String("INACTIVE"),
  },
  ecs.Cluster{
    ActiveServicesCount: aws.Int64(0),
    ClusterName: aws.String("craft-staging"),
    PendingTasksCount: aws.Int64(2),
    RegisteredContainerInstancesCount: aws.Int64(2),
    RunningTasksCount: aws.Int64(8),
    Status: aws.String("ACTIVE"),
  },
}

func ClusterController(w http.ResponseWriter, req *http.Request) {
  f := logrus.Fields{"controller": "ClusterController"}
  clusters, err := awslib.GetAllClusterDescriptions(awsSession)
  if err != nil {
    log.Error(f, "Failed to get current set of clusters from AWS", err)
    http.Error(w, fmt.Sprintf("Failed to obtain clusters from AWS: %s", err), http.StatusFailedDependency)
    return
  }
  f["numberOfClusters"] = len(clusters)
  log.Debug(f, "Got clusters from Amazon")

  clusterJson, err  := jsonutil.BuildJSON(clusters)
  if err != nil {
    log.Error(f, "Failed to marshall JSON on clusters.", err)
    http.Error(w, "Failed to marshall JSON for response.", http.StatusInternalServerError)
    return
  }

  _, err = w.Write(clusterJson)
  if err != nil {
    log.Error(f, "Failed to write JSON response", err)
  } else {
    f["json"] = string(clusterJson)
    log.Debug(f, "Sent repsonse.")
  }
}
