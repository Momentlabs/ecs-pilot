package server

import (
  // "fmt"
  "encoding/json"
  "net/http"
)

type Cluster struct {
  ActiveServiceCount  int64
  ClusterName string
  PendingTasksCount int64
  RegisteredContainerInstanceCount int64
  RunningTasksCount int64
  Status string
}

var Clusters = []Cluster {
  Cluster{
    ActiveServiceCount: 0,
    ClusterName: "minecraft",
    PendingTasksCount: 0,
    RegisteredContainerInstanceCount: 0,
    RunningTasksCount: 0,
    Status: "CLUSTER_INACTIVE",
  },
  Cluster{
    ActiveServiceCount: 0,
    ClusterName: "craft-staging",
    PendingTasksCount: 2,
    RegisteredContainerInstanceCount: 2,
    RunningTasksCount: 8,
    Status: "CLUSTER_INACTIVE",
  },
}

func ClusterController(w http.ResponseWriter, req *http.Request) {
  log.Info(nil, "Entering ClusterController.")
  json.NewEncoder(w).Encode(Clusters)
}