package main

import (
  "fmt"
  "github.com/aws/aws-sdk-go/aws"
  "github.com/aws/aws-sdk-go/aws/defaults"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/ecs"
  // "github.com/aws/aws-sdk-go/aws/awsutil"
  // "github.com/bobappleyard/readline"
  "gopkg.in/alecthomas/kingpin.v2"
  // "io"
  // "log"
  "os"
  // "path/filepath"
  // "strings"
  // "time"
)

var (
  app                               *kingpin.Application
  verbose                           bool
  region                            string

  // Prompt for Commands
  interactive *kingpin.CmdClause

  // List clusters
  cluster *kingpin.CmdClause
  listClusters *kingpin.CmdClause
  // Create an instance and attach it to a cluster.
)

func init() {
  app = kingpin.New("ecs-pilot", "A tool to manage AWS ECS.")
  app.Flag("verbose", "Describe what is happening, as it happens.").Short('v').BoolVar(&verbose)

  app.Flag("region", "Manage continers in this AWS region.").Default("us-east-1").StringVar(&region)

  interactive = app.Command("interactive", "Prompt for commands.")

  cluster = app.Command("cluster", "Operate on clusters.")
  listClusters = cluster.Command("list", "List the avaialble clusters.")


  kingpin.CommandLine.Help = `A command-line AWS ECS tool.`
}

func main() {

  // Parse the command line to fool with flags and get the command we'll execeute.
  command := kingpin.MustParse(app.Parse(os.Args[1:]))

  // The AWS library doesn't read configuariton information
  // out of .aws/config, just the credentials from .aws/credentials.
  config := defaults.Get().Config
  fmt.Printf("Default region: \"%s\"\n", *config.Region)
  if *config.Region == "" {
    config.Region = aws.String(region)
  }

  if verbose {
    fmt.Printf("Region: ")
    fmt.Println(*config.Region)
  }

  // List of commands as parsed matched against functions to execute the commands.
  commandMap := map[string]func(*ecs.ECS) {
    listClusters.FullCommand(): doListCluster,
  }

  ecs_svc := ecs.New(session.New(config))

  // Execute the command.
  if interactive.FullCommand() == command {
    DoInteractive(ecs_svc, config)
  } else {
    commandMap[command](ecs_svc)
  }
}

func doListCluster(svc *ecs.ECS) {
  clusters,  err := GetClusters(svc)
  if err != nil {
    fmt.Printf("Can't get clusters: %s\n", err)
    return
  }

  fmt.Println("Clusters")
  for i, cluster := range clusters {
    fmt.Printf("%d: %s\n", i+1, *cluster.Arn)
  }

}

// func doInteractive(svc *ecs.ECS) {
//   fmt.Println("Interactive not implemented yet.")
// }
