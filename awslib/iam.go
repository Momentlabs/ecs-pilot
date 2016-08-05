package awslib

import (
  // "strings"
  "fmt"
  // "errors"
  // "time"  
  // "io"
  "github.com/aws/aws-sdk-go/aws"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/iam"
  // "github.com/spf13/viper"
  // "github.com/op/go-logging"
)

func AccountDetailsString(config *aws.Config) (details string) {

 // Provide a description of the account and region that's being used.
  iamSvc := iam.New(session.New(config))
  params := &iam.ListAccountAliasesInput{
    MaxItems: aws.Int64(100),
  }
  resp, err := iamSvc.ListAccountAliases(params)
  if err == nil {
    if len(resp.AccountAliases) == 1 {
      details += fmt.Sprintf("Account: %s.\n", *resp.AccountAliases[0])
    } else {
      details += fmt.Sprintf("Account:\n")
      for i, alias := range resp.AccountAliases {
        details += fmt.Sprintf("%d. %s.\n", i+1, *alias)
      }
    }
  } else {
    details += fmt.Sprintf("Couldn't get account aliases: %s.\n", err)
  }
  details += fmt.Sprintf("Region: %s.\n", *config.Region)

  return details
}