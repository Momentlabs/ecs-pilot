package main

import (
  "bytes"
  "encoding/json"
  "fmt"
  "os"
  "ecs-pilot/interactive"
  "ecs-pilot/version"
  "github.com/alecthomas/kingpin"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/ecs"
  "github.com/jdrivas/sl"
  "github.com/Sirupsen/logrus"

  // THIS WILL CERTAINLY CAUSE PROBLEMS.
  // "awslib"
  "github.com/jdrivas/awslib"
)

const(
  jsonLog = "json"
  textLog = "text"
)


var(
  log = sl.New()

  app                               *kingpin.Application
  verbose                           bool
  debug                             bool
  printVersion                      bool
  region                            string
  profileArg                        string
  credFileArg                       string
  logsFormatArg                     string

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
  app.Flag("debug", "Detailed log output.").Short('d').BoolVar(&debug)
  app.Flag("region", "Manage continers in this AWS region.").Default("us-east-1").StringVar(&region)
  app.Flag("log-format", "Chosose text or json output.").Default(jsonLog).EnumVar(&logsFormatArg, jsonLog, textLog)

  app.Flag("profile", "AWS profile for credentials.").Default("minecraft").StringVar(&profileArg)
  app.Flag("config-file", "AWS profile for credentials.").StringVar(&credFileArg)

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

}

func main() {

  // Parse the command line to fool with flags and get the command we'll execeute.
  command := kingpin.MustParse(app.Parse(os.Args[1:]))
  configureLogs()

  sess, err := awslib.GetSession(profileArg, credFileArg)
  if err != nil { 
  fmt.Printf("Can't get aws session from %s[%s]\n", credFileArg, profileArg)
    os.Exit(-1)
  }

  // awsConfig := awslib.GetConfig(profileArg, credFileArg)
  awsConfig := sess.Config
  region := *awsConfig.Region
  accountAliases, err := awslib.GetAccountAliases(awsConfig)
  if err == nil {
    log.Debug(logrus.Fields{"account": accountAliases, "region": region}, "ecs-pilot startup.")
  }
 
  // Perhaps use the EC2 DescribeAccountAttributes to get at interesting infromation.
  // List of commands as parsed matched against functions to execute the commands.
  commandMap := map[string]func(*ecs.ECS) {
    versionCmd.FullCommand(): doPrintVersion,
    listClusters.FullCommand(): doListCluster,
    listTaskDefinitions.FullCommand(): doListTaskDefinitions,
    // describeTaskDefinition.FullCommand(): doDescribeTaskDefinition,
    emptyTaskDefinition.FullCommand(): doEmptyTaskDefinition,
    defaultTaskDefinition.FullCommand(): doDefaultTaskDefinition,
  }

  ecs_svc := ecs.New(session.New(awsConfig))

  // Execute the command.
  if interactiveCmd.FullCommand() == command {
    interactive.DoInteractive(sess, awsConfig)
  } else {
    commandMap[command](ecs_svc)
  }
}


func doListCluster(svc *ecs.ECS) {
  clusters,  err := awslib.GetClusters(svc)
  if err == nil {
    fmt.Println("Clusters")
    for i, cluster := range clusters {
      fmt.Printf("%d: %s\n", i+1, *cluster)
    }
  } else {
    log.Error(nil, "Can't get clusters.", err)
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
    log.Error(nil, "Can't get task defintion arns.", err)
  }
}

// func doDescribeTaskDefinition(svc *ecs.ECS) {
//   taskDefinition, err := awslib.GetTaskDefinition(taskDefinitionArn, sess)
//   if err == nil {
//     b, err := json.Marshal(taskDefinition)
//     if err == nil {
//       var out bytes.Buffer
//       json.Indent(&out, b, "", "\t")
//       // fmt.Printf("%s\n", b)
//       out.WriteTo(os.Stdout)
//     } else {
//       fmt.Printf("Couldn't marhsall task definition into JSON: %s\n", err)
//     }
//     // fmt.Printf("%s\n", taskDefinition)
//   } else {
//     log.Error(logrus.Fields{"task-def-arn": taskDefinitionArn,},"Can't get TaskDefinition.", err)
//   }
// }

func doEmptyTaskDefinition(svc *ecs.ECS) {
  tdi := awslib.CompleteEmptyTaskDefinition()
  printAsJsonObject(tdi)
}

func doDefaultTaskDefinition(svc *ecs.ECS) {
  tdi := awslib.DefaultTaskDefinition()
  printAsJsonObject(tdi)
}

func doPrintVersion(svc *ecs.ECS) {
  fmt.Println(version.Version)
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

func configureLogs() {

  switch logsFormatArg {
  case jsonLog:
    log.SetFormatter(new(logrus.JSONFormatter))
  case textLog:
    f := new(sl.TextFormatter)
    f.FullTimestamp = true
    log.SetFormatter(f)
    awslib.SetLogFormatter(f)
  }

  l := logrus.InfoLevel
  if debug || verbose {
    l = logrus.DebugLevel
  }
  log.SetLevel(l)
  awslib.SetLogLevel(l)
}


