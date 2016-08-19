package awslib

import (
  // "strings"
  "fmt"
  // "errors"
  // "time"  
  // "io"
  "os"
  "os/user"
  "github.com/aws/aws-sdk-go/aws"
  "github.com/aws/aws-sdk-go/aws/credentials"
  "github.com/aws/aws-sdk-go/aws/defaults"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/iam"
  // "github.com/op/go-logging"
)

// TODO: Verify that this  "does the right thing" if the creds file doesn't exist.
// Also, consider filling it out by looking at a 'config' file as well.
func GetConfig(profile string) (*aws.Config) {
  config := defaults.Get().Config

  user, err  :=  user.Current()
  if err != nil {
    fmt.Printf("ecs-pilot: Could't get the current user from the OS: \n", err)
    os.Exit(1)
  }
  credFile := user.HomeDir + "/.aws/credentials"
  creds := credentials.NewSharedCredentials(credFile, profile)  
  config.Credentials = creds

  if *config.Region == "" {
    config.Region = aws.String("us-east-1")
  }
  return config
}

// TODO: This needs to also check for keys being set 
// in the environment.
func GetDefaultConfig() (*aws.Config) {
  profile := os.Getenv("AWS_PROFILE")
  if profile == "" {
    profile = "default"
  }
  return GetConfig(profile)
}

func AccountDetailsString(config *aws.Config) (details string) {

 // Provide a description of the account and region that's being used.
  iamSvc := iam.New(session.New(config))
  params := &iam.ListAccountAliasesInput{
    MaxItems: aws.Int64(100),
  }
  resp, err := iamSvc.ListAccountAliases(params)
  if err == nil {
    if len(resp.AccountAliases) == 1 {
      details += fmt.Sprintf("Account: %s", *resp.AccountAliases[0])
    } else {
      details += fmt.Sprintf("Account: ")
      for i, alias := range resp.AccountAliases {
        details += fmt.Sprintf("%d. %s ", i+1, *alias)
      }
    }
  } else {
    details += fmt.Sprintf("Couldn't get account aliases: %s.\n", err)
  }
  details += fmt.Sprintf(" Region: %s", *config.Region)

  return details
}