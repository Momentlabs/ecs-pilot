package main

import (
  "bytes"
  "encoding/json"
  "fmt"
  // "io"
  "os"
  // "path/filepath"
  // "strings"
  // "time"
  "ecs-pilot/interactive"
  "ecs-pilot/awslib"
  "github.com/aws/aws-sdk-go/aws"
  // "github.com/aws/aws-sdk-go/aws/credentials"
  // "github.com/aws/aws-sdk-go/aws/defaults"
  "github.com/aws/aws-sdk-go/aws/session"
  // "github.com/aws/aws-sdk-go/aws/awsutil"
  "github.com/aws/aws-sdk-go/service/ecs"
  // "github.com/aws/aws-sdk-go/service/iam"
  "github.com/op/go-logging"
  "gopkg.in/alecthomas/kingpin.v2"
)

type Version struct {
  Major int 
  Minor int
  Name string
  Status string
  Hash string
}

var(
  version = Version{ Major: 0, Minor: 1, Name: "Launch", Status: "development", }
  app                               *kingpin.Application
  log = logging.MustGetLogger("ecs-pilot")
  verbose                           bool
  printVersion                      bool
  region                            string

  // Prompt for Commands
  interactiveCmd *kingpin.CmdClause
  versionCmd *kingpin.CmdClause

  // List clusters
  cluster *kingpin.CmdClause
  listClusters *kingpin.CmdClause

  // Task Definitions
  taskDefinition *kingpin.CmdClause
  listTaskDefinitions *kingpin.CmdClause
  describeTaskDefinition *kingpin.CmdClause
  emptyTaskDefinition *kingpin.CmdClause
  defaultTaskDefinition *kingpin.CmdClause
  taskDefinitionArn string
)

func init() {

  app = kingpin.New("ecs-pilot", "A tool to manage AWS ECS.")
  app.Flag("verbose", "Describe what is happening, as it happens.").Short('v').BoolVar(&verbose)
  app.Flag("region", "Manage continers in this AWS region.").Default("us-east-1").StringVar(&region)

  versionCmd = app.Command("version","Print the version number and exit.")
  interactiveCmd = app.Command("interactive", "Prompt for commands.")

  cluster = app.Command("cluster", "Operate on clusters.")
  listClusters = cluster.Command("list", "List the avaialble clusters.")

  taskDefinition = app.Command("task-definition", "Operate on task definitions.")
  listTaskDefinitions = taskDefinition.Command("list", "list the registered task-definitions.")
  describeTaskDefinition = taskDefinition.Command("describe", "Print the details for a task-definition.")
  describeTaskDefinition.Arg("task-definition-arn", "The ARN for the task-definition to describe.").Required().StringVar(&taskDefinitionArn)
  emptyTaskDefinition = taskDefinition.Command("empty", "Print out an full but empty task defintion in JSON format.")
  defaultTaskDefinition = taskDefinition.Command("default", "Print a default task definition in JSON format.")


  kingpin.CommandLine.Help = `A command-line AWS ECS tool.`
  logging.SetLevel(logging.ERROR, "")
}

func main() {

  // Parse the command line to fool with flags and get the command we'll execeute.
  command := kingpin.MustParse(app.Parse(os.Args[1:]))
  if verbose {
    logging.SetLevel(logging.DEBUG,"")
  }

  awsConfig := awslib.GetDefaultConfig()
  log.Debugf("Default region: \"%s\"\n", *awsConfig.Region)
  if *awsConfig.Region == "" {
    awsConfig.Region = aws.String(region)
  }
  fmt.Printf("%s\n", awslib.AccountDetailsString(awsConfig))

  // Perhaps use the EC2 DescribeAccountAttributes to get at interesting infromation.
  // List of commands as parsed matched against functions to execute the commands.
  commandMap := map[string]func(*ecs.ECS) {
    versionCmd.FullCommand(): doPrintVersion,
    listClusters.FullCommand(): doListCluster,
    listTaskDefinitions.FullCommand(): doListTaskDefinitions,
    describeTaskDefinition.FullCommand(): doDescribeTaskDefinition,
    emptyTaskDefinition.FullCommand(): doEmptyTaskDefinition,
    defaultTaskDefinition.FullCommand(): doDefaultTaskDefinition,
  }

  ecs_svc := ecs.New(session.New(awsConfig))

  // Execute the command.
  if interactiveCmd.FullCommand() == command {
    interactive.DoInteractive(awsConfig)
  } else {
    commandMap[command](ecs_svc)
  }
}

func doPrintVersion(svc *ecs.ECS) {
  fmt.Printf("Version: %d.%d %s <%s>\n", version.Major, version.Minor, version.Name, version.Status)
}

func doListCluster(svc *ecs.ECS) {
  clusters,  err := awslib.GetClusters(svc)
  if err == nil {
    fmt.Println("Clusters")
    for i, cluster := range clusters {
      fmt.Printf("%d: %s\n", i+1, *cluster)
    }
  } else {
    log.Errorf("Can't get clusters: %s\n", err)
    return
  }
}

func doListTaskDefinitions(svc *ecs.ECS) {
  arns, err := awslib.ListTaskDefinitions(svc)
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
  taskDefinition, err := awslib.GetTaskDefinition(taskDefinitionArn, svc)
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
  tdi := awslib.CompleteEmptyTaskDefinition()
  printAsJsonObject(tdi)
}

func doDefaultTaskDefinition(svc *ecs.ECS) {
  tdi := awslib.DefaultTaskDefinition()
  printAsJsonObject(tdi)
}

func printAsJsonObject(o interface{}) {
  v, err := json.Marshal(o)
  if err == nil {
    var out bytes.Buffer
    json.Indent(&out, v, "", "  ")
    out.WriteTo(os.Stdout)
    fmt.Println("")
  } else {
    fmt.Printf("Couldn't marshall object to into JSON: %s.\n", err)
    fmt.Printf("Object: %+v", o)
  }
}



