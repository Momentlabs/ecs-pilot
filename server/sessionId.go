package server

import (
  "fmt"
  "net/http"
  "github.com/aws/aws-sdk-go/private/protocol/json/jsonutil"
  "github.com/Sirupsen/logrus"

  "github.com/jdrivas/awslib"
)

type SessionId struct {
  Region string `json:"region" locationName:"region"`
  AccountAliases []string `json:"accountAliases" locationName:"accountAliases"`
  AccountNumber string `json:"accountNumber" locationName:"accountNumber"`
  UserId string `json:"userId" locationName:"userId"`
  UserName string `json:"userName" locationName:"userName"`
}

func SessionIdController(w http.ResponseWriter, r *http.Request) {

  f := logrus.Fields{
    "controller": "SessionIdController",
  }

  sess, err := getAWSSession(r)
  if err != nil {
    log.Error(f, "Fail to find appropriate AWS Session", err)
    http.Error(w, fmt.Sprintf("Failed to find appropriate AWS Session: %s", err), http.StatusFailedDependency )
    return
  }

  awsConfig := sess.Config
  sessionId := &SessionId{
    Region: *awsConfig.Region,
  }

  accountAliases, err := awslib.GetAccountAliases(awsConfig)
  if err != nil {
    accountAliases = []*string{} // TODO: MIGHT BE BETTER TO RETURN EMPTY ARRAY.
  }
  sessionId.AccountAliases = awslib.StringSlice(accountAliases)
  f["numAliases"] = len(accountAliases)
  for i, a := range sessionId.AccountAliases {
    f[fmt.Sprintf("acountAliase[%s]" ,i)] = a
  }
  log.Debug(f, "Account Aliasess")

  idOutput, err := awslib.GetCurrentAccountIdentity(sess)
  if err == nil {
    sessionId.AccountNumber = *idOutput.Account
    sessionId.UserId = *idOutput.UserId
  }

  sessIdJson, err := jsonutil.BuildJSON(sessionId)
  if err != nil {
    log.Error(f, "Failed to marshall JSON for SessionID", err)
    http.Error(w, "Failed to marhsall JSON ID for response", http.StatusInternalServerError)
    return
  }

  _, err = w.Write(sessIdJson)
  if err != nil {
    log.Error(f, "Failed to write JSON response", err)
  } else {
    f["json"] = string(sessIdJson)
    log.Debug(f, "Sent repsonse")
  }
}