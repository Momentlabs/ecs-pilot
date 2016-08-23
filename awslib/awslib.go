package awslib

import (
  "github.com/op/go-logging"
)

var(
  log *logging.Logger
  awslibConfig libConfig
)


func init() {
  log = logging.MustGetLogger("ecs-pilot/awslib")
  logging.SetLevel(logging.INFO, "ecs-pilot/awslib")
  awslibConfig = NewConfig()
}

func SetLogLevel(l logging.Level) {
  logging.SetLevel(l,"ecs-pilot/awslib")
}

type libConfig map[string]string

const(
  InstCredFileKey = "instance-cred-file"
  InstCredProfileKey = "instance-cred-profile"
  InstDefaultRegionKey ="instance-region-key"
)

func NewConfig() (libConfig) {
  config := make(libConfig)
  defaults := [][2]string{
    {InstCredFileKey,"./.instance_credentials"},
    {InstCredProfileKey, "minecraft"},
    {InstDefaultRegionKey, "us-east-1"},
  }
  for _, d := range defaults {
    config[d[0]] = d[1]
  }
  return config
}