package server

import (
  "fmt"
  // "encoding/json"
  // "github.com/aws/aws-sdk-go/aws"
  "github.com/aws/aws-sdk-go/service/ec2"
  "github.com/aws/aws-sdk-go/service/ecs"
  "github.com/aws/aws-sdk-go/private/protocol/json/jsonutil"
  "github.com/gorilla/mux";
  "github.com/Sirupsen/logrus"
  "net/http"

  // "awslib"
  "github.com/jdrivas/awslib"
)

// TODO: Put this into AWSlib?
type InstancePair struct {
  ContainerInstance *ecs.ContainerInstance  `json:"containerInstance" locationName:"containerInstance"`
  EC2Instance *ec2.Instance                 `json:"ec2Instance" locationName:"ec2Instance"`
}
type InstancesResponse struct {
  Instances []InstancePair                    `json:"instances" locationName:"instances"`
  ContainerInstanceFailures []*ecs.Failure     `json:"containerInstanceFailures" locationName:"containerInstanceFailures"` 
} 

func InstancesController(w http.ResponseWriter, req *http.Request) {
  vars := mux.Vars(req)
  clusterName := vars[CLUSTER_NAME_VAR];
  f := logrus.Fields{"controller": "InstancesController", "cluster": clusterName}

  // Should consider setting this up asynchronsously .....
  ciMap, ec2Map, err  := awslib.GetContainerMaps(clusterName, awsSession)
  if err != nil {
    log.Error(f, "Failed to obtain Container Instance Descriptions from AWS.", err)
    http.Error(w, fmt.Sprintf("Failed to obtain instances from AWS: %s", err), http.StatusFailedDependency)
    return
  }

  instances := make([]InstancePair, 0)
  failures := make([]*ecs.Failure, 0)
  for _, cie := range ciMap {
    ci := cie.Instance
    ei := ec2Map[*cie.Instance.Ec2InstanceId]
    if ci != nil {
      instances = append(instances, InstancePair{ContainerInstance: ci, EC2Instance: ei,})
    }
    if cie.Failure != nil {
      failures = append(failures, cie.Failure)
    }
  }
  f["numberOfInstances"] = len(instances)
  f["numberOfFailures"] = len(failures)
  log.Debug(f, "Got instance descriptions from AWS.")

  ir := InstancesResponse{
    Instances: instances,
    ContainerInstanceFailures: failures,
  }

  response, err  := jsonutil.BuildJSON(ir)
  if err != nil {
    log.Error(f, "Failed to marshall JSON on clusters.", err)
    http.Error(w, "Failed to marshall JSON for response.", http.StatusInternalServerError)
    return
  }


  // fmt.Printf("HEADERS on REQUEST:\n")
  // headers := w.Header();
  // headers.Set("Content-Type", "application/json")
  // for k,v := range headers {
  //   fmt.Printf("[%s]: %s\n", k, v)
  // }

  _, err = w.Write(response)
  if err != nil {
    log.Error(f, "Failed to write JSON response", err)
  } else {
    f["a-json"] = string(response)
    f["firstbyte"] = response[0]
    // f["nearError"] = string(response[8900:])
    log.Debug(f, "Sent repsonse.")
  }
}
