package server

import (
  "fmt"
  "strings"
  // "encoding/json"
  // "github.com/aws/aws-sdk-go/aws"
  // "github.com/aws/aws-sdk-go/service/ecs"
  "github.com/aws/aws-sdk-go/private/protocol/json/jsonutil"
  // "github.com/gorilla/mux";
  "github.com/Sirupsen/logrus"
  "net/http"

  // "awslib"
  "github.com/jdrivas/awslib"
)

const SECURITY_GROUP_ID_KEY = "sgIds"
func SecurityGroupsController(w http.ResponseWriter, r *http.Request) {
  f := logrus.Fields{"controller": "SecurityGroupController"}
  queries := r.URL.Query()
  for k, v := range queries {
    f[k] = v
  }
  log.Debug(f, "Controller Enter")

  sess, err := getAWSSession(r)
  if err != nil {
    log.Error(f, "Fail to find appropriate AWS Session", err)
    http.Error(w, fmt.Sprintf("Failed to find appropriate AWS Session: %s", err), http.StatusFailedDependency )
    return
  }

  // TODO:
  // THIS seems wrong. Why am I getting an array back with only one element.
  // Either I'd expect a single string, or an array with as many elements as
  // comma separated strings?
  groupIds := strings.Split(queries[SECURITY_GROUP_ID_KEY][0], ",")
  // groupIds := queries[SECURITY_GROUP_ID_KEY];

  f["numOfIds"] = len(groupIds)
  f["groupIds"] = groupIds
  if len(groupIds) <= 0 {
    log.Error(f,
      fmt.Sprintf("Invalid requdyt. Did not receive security group IDS list in params (/%s?=id1,id2)", SECURITY_GROUP_ID_KEY),
      fmt.Errorf("Bad request paramaters"))
    http.Error(w, fmt.Sprintf("Did not receive security group IDS list in params (/%s?=id1,id2)", SECURITY_GROUP_ID_KEY), http.StatusBadRequest)
    return
  }

  result, err := awslib.DescribeSecurityGroups(groupIds, sess)
  if err != nil {
    log.Error(f, "Failed to obtain security groups from AWS", err)
    http.Error(w, fmt.Sprintf("Failed to obtain security groups from AWS: %s", err), http.StatusFailedDependency)
    return
  }
  f["numberOfGroups"] = len(result)
  log.Debug(f, "Got security groups from Amazon")

  responseJson, err  := jsonutil.BuildJSON(result)
  if err != nil {
    log.Error(f, "Failed to marshall security group JSON.", err)
    http.Error(w, "Failed to marshall security group JSON for response.", http.StatusInternalServerError)
  }

  _, err = w.Write(responseJson)
  if err != nil {
    log.Error(f, "Failed to write JSON response", err)
  } else {
    // f["json"] = string(clusterJson)
    log.Debug(f, "Sent repsonse.")
  }

}