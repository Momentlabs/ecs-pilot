package interactive

import (
  // "fmt"
  "ecs-pilot/server"
  "github.com/aws/aws-sdk-go/aws/session"
)

func doServer(serverAddressArg string, sess *session.Session, local bool) (error) {
  server.DoServe(serverAddressArg, sess, local)
  return nil;
}
