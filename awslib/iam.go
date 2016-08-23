package awslib

import (
  // "strings"
  "fmt"
  // "errors"
  // "time"  
  // "io"
  "os"
  "os/user"
  "path/filepath"
  "github.com/aws/aws-sdk-go/aws"
  "github.com/aws/aws-sdk-go/aws/credentials"
  "github.com/aws/aws-sdk-go/aws/defaults"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/iam"
  // "github.com/op/go-logging"
)

// TODO: Verify that this  "does the right thing" if the creds file doesn't exist.
// Also, consider filling it out by looking at a 'config' file as well.
// profile is an AWS profile to use for creds, crefile is where creds
// are stored as profiles. You can specify a credFile of "" for
// the default of ~/.aws/credentials to be used.

// Look for credentials in a credential file provide by the credFile argument.
// If that string is "", look in ~/.aws/.credentials
// If there is no cred file then check the environment.
func GetConfig(profile string, credFile string) (*aws.Config) {
  config := defaults.Get().Config

  user, err  :=  user.Current()
  if err != nil {
    fmt.Printf("ecs-pilot: Could't get the current user from the OS: \n", err)
    os.Exit(1)
  }

  if credFile == "" { 
    credFile = filepath.Join(user.HomeDir, "/.aws/credentials")
  }
  _, err = os.Open(credFile)
  if err == nil {
    log.Debugf("Loading credentials from file: %s", credFile)
    creds := credentials.NewSharedCredentials(credFile, profile)  
    config.Credentials = creds
  } else {
    log.Debugf("Can't load credentials from file: %s", err)
    log.Debugf("Loading credentials from environment.")
    creds := credentials.NewEnvCredentials()
    config.Credentials = creds
  }

  // THIS SHOULD NEVER END UP IN PRODUCTION.
  // IT PRINTS OUT KEYS WHICH WOULD END UP IN LOGS.
  // credValue, err := config.Credentials.Get()
  // if err == nil {
  //   log.Debugf("Value of credential is: %#v", credValue)
  // } else {
  //   log.Debugf("Couldn't get the value of the credentials: %s", err)
  // }

  if *config.Region == "" {
    config.Region = aws.String("us-east-1")
  }
  return config
}

func GetDefaultConfig() (*aws.Config) {
  profile := os.Getenv("AWS_PROFILE")
  if profile == "" {
    profile = "default"
  }
  return GetConfig(profile, "")
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