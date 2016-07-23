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
  "github.com/op/go-logging"
  // "io"
  "os"
  "bytes"
  "ecs-pilot/interactive"
  "ecs-pilot/ecslib"
  "encoding/json"
  // "path/filepath"
  // "strings"
  // "time"
)

var (
  app                               *kingpin.Application
  log = logging.MustGetLogger("ecs-pilot")
  verbose                           bool
  region                            string

  // Prompt for Commands
  interactiveCmd *kingpin.CmdClause

  // List clusters
  cluster *kingpin.CmdClause
  listClusters *kingpin.CmdClause

  // Task Definitions
  taskDefinition *kingpin.CmdClause
  listTaskDefinitions *kingpin.CmdClause
  describeTaskDefinition *kingpin.CmdClause
  emptyTaskDefinition *kingpin.CmdClause
  taskDefinitionArn string
)

func init() {
  app = kingpin.New("ecs-pilot", "A tool to manage AWS ECS.")
  app.Flag("verbose", "Describe what is happening, as it happens.").Short('v').BoolVar(&verbose)

  app.Flag("region", "Manage continers in this AWS region.").Default("us-east-1").StringVar(&region)

  interactiveCmd = app.Command("interactive", "Prompt for commands.")

  cluster = app.Command("cluster", "Operate on clusters.")
  listClusters = cluster.Command("list", "List the avaialble clusters.")

  taskDefinition = app.Command("task-definition", "Operate on task definitions.")
  listTaskDefinitions = taskDefinition.Command("list", "list the registered task-definitions.")
  describeTaskDefinition = taskDefinition.Command("describe", "Print the details for a task-definition.")
  describeTaskDefinition.Arg("task-definition-arn", "The ARN for the task-definition to describe.").Required().StringVar(&taskDefinitionArn)
  emptyTaskDefinition = taskDefinition.Command("empty", "Print out an empty task defintion in JSON format.")


  kingpin.CommandLine.Help = `A command-line AWS ECS tool.`
  logging.SetLevel(logging.ERROR, "")
}

func main() {


  // Parse the command line to fool with flags and get the command we'll execeute.
  command := kingpin.MustParse(app.Parse(os.Args[1:]))
  if verbose {
    logging.SetLevel(logging.DEBUG,"")
  }

  // The AWS library doesn't read configuariton information
  // out of .aws/config, just the credentials from .aws/credentials.
  config := defaults.Get().Config

  log.Debugf("Default region: \"%s\"\n", *config.Region)
  if *config.Region == "" {
    config.Region = aws.String(region)
  }
  log.Debugf("Using Region: %s", *config.Region)


  // List of commands as parsed matched against functions to execute the commands.
  commandMap := map[string]func(*ecs.ECS) {
    listClusters.FullCommand(): doListCluster,
    listTaskDefinitions.FullCommand(): doListTaskDefinitions,
    describeTaskDefinition.FullCommand(): doDescribeTaskDefinition,
    emptyTaskDefinition.FullCommand(): doEmptyTaskDefinition,
  }

  ecs_svc := ecs.New(session.New(config))

  // Execute the command.
  if interactiveCmd.FullCommand() == command {
    interactive.DoInteractive(ecs_svc, config)
  } else {
    commandMap[command](ecs_svc)
  }
}

func doListCluster(svc *ecs.ECS) {
  clusters,  err := ecslib.GetClusters(svc)
  if err == nil {
    fmt.Println("Clusters")
    for i, cluster := range clusters {
      fmt.Printf("%d: %s\n", i+1, *cluster.Arn)
    }
  } else {
    log.Errorf("Can't get clusters: %s\n", err)
    return
  }
}

func doListTaskDefinitions(svc *ecs.ECS) {
  arns, err := ecslib.ListTaskDefinitions(svc)
  if err == nil {
    fmt.Printf("There are (%d) task definitions.\n", len(arns))
    for i, arn := range arns {
      fmt.Printf("%d: %s.\n", i+1, *arn)
    }
  } else {
    log.Errorf("Can't get task defintion arns: %s.\n", err)
  }
}

func doDescribeTaskDefinition(svc *ecs.ECS) {
  taskDefinition, err := ecslib.GetTaskDefinition(taskDefinitionArn, svc)
  if err == nil {
    b, err := json.Marshal(taskDefinition)
    if err == nil {
      var out bytes.Buffer
      json.Indent(&out, b, "", "\t")
      // fmt.Printf("%s\n", b)
      out.WriteTo(os.Stdout)
    } else {
      fmt.Printf("Couldn't marhsall task definition into JSON: %s\n", err)
    }
    // fmt.Printf("%s\n", taskDefinition)
  } else {
    log.Errorf("Can't get TaskDefinition for: \"%S\".\nError: %s", taskDefinitionArn, err)
  }
}

func doEmptyTaskDefinition(svc *ecs.ECS) {
  var tdi = ecs.RegisterTaskDefinitionInput {
    ContainerDefinitions: []*ecs.ContainerDefinition{
      &ecs.ContainerDefinition{
        Command: []*string{
          aws.String("COMMAND"),
        },
        Cpu: aws.Int64(1024),
      },
    },
    Family: aws.String(""),
    Volumes: []*ecs.Volume{
      &ecs.Volume{},
    },
  }
  fmt.Printf("%+v\n.", tdi)
}
