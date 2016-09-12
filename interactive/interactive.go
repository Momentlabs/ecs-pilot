package interactive 

import (
  "strings"
  "fmt"
  "io"
  "time"
  "github.com/alecthomas/kingpin"
  "github.com/aws/aws-sdk-go/aws"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/ecs"
  "github.com/aws/aws-sdk-go/service/ec2"
  // "github.com/bobappleyard/readline"
  "github.com/chzyer/readline"
  "github.com/op/go-logging"
  "github.com/mgutz/ansi"

  // THIS WILL UNDOUBTADLY CAUSE PROBLEMS
  // "awslib"
  "github.com/jdrivas/awslib"

)

var (
  nullColor = fmt.Sprintf("%s", "\x00\x00\x00\x00\x00\x00\x00")
  defaultColor = fmt.Sprintf("%s%s", "\x00\x00", ansi.ColorCode("default"))
  defaultShortColor = fmt.Sprintf("%s", ansi.ColorCode("default"))

  emphBlueColor = fmt.Sprintf(ansi.ColorCode("blue+b"))
  emphRedColor = fmt.Sprintf(ansi.ColorCode("red+b"))
  emphColor = emphBlueColor

  titleColor = fmt.Sprintf(ansi.ColorCode("default+b"))
  titleEmph = emphBlueColor
  infoColor = emphBlueColor
  successColor = fmt.Sprintf(ansi.ColorCode("green+b"))
  warnColor = fmt.Sprintf(ansi.ColorCode("yellow+b"))
  failColor = emphRedColor
  resetColor = fmt.Sprintf(ansi.ColorCode("reset"))
)

var (
  humanTimeFormat = time.RFC1123
  // logTimeFormat = 
)

const defaultCluster = "minecraft"
var (
  currentCluster = defaultCluster
)


var (

  interApp *kingpin.Application

  interExit *kingpin.CmdClause
  interQuit *kingpin.CmdClause
  interVerbose *kingpin.CmdClause
  verbose bool
  interTestString []string

  // Clusters
  interCluster *kingpin.CmdClause
  createCluster *kingpin.CmdClause
  deleteCluster *kingpin.CmdClause
  interListClusters *kingpin.CmdClause
  interDescribeCluster *kingpin.CmdClause

  // Containers
  instance *kingpin.CmdClause
  interListContainerInstances *kingpin.CmdClause
  interDescribeContainerInstance *kingpin.CmdClause
  interDescribeAllContainerInstances *kingpin.CmdClause
  interCreateContainerInstance *kingpin.CmdClause
  interTerminateContainerInstance *kingpin.CmdClause

  // interClusterName string
  clusterNameArg string
  interContainerArn string

  // Tasks
  interTask *kingpin.CmdClause
  interListTasks *kingpin.CmdClause
  interDescribeAllTasks *kingpin.CmdClause
  interDescribeTask *kingpin.CmdClause
  interRunTask *kingpin.CmdClause
  interTaskDefinitionArn string
  interStopTask *kingpin.CmdClause
  interTaskArn string
  taskEnv map[string]string

  // Task Defintions
  interTaskDefinition *kingpin.CmdClause
  interListTaskDefinitions *kingpin.CmdClause
  interDescribeTaskDefinition *kingpin.CmdClause
  registerTaskDefinition *kingpin.CmdClause
  taskConfigFileName string
  // interTaskDefinitionArn string

  log *logging.Logger

)

func init() {

  taskEnv = make(map[string]string)
  log = logging.MustGetLogger("ecs-pilot/interactive")

  interApp = kingpin.New("", "Interactive mode.").Terminate(doTerminate)

  // state
  interVerbose = interApp.Command("verbose", "toggle verbose mode.")
  interExit = interApp.Command("exit", "exit the program. <ctrl-D> works too.")
  interQuit = interApp.Command("quit", "exit the program.")

  // Cluster Commands
  interCluster = interApp.Command("cluster", "the context for cluster commands")
  createCluster = interCluster.Command("create", "create a new cluster.")
  createCluster.Arg("cluster-name", "the name of the cluster to create.").Required().Action(setCurrent).StringVar(&clusterNameArg)

  deleteCluster = interCluster.Command("delete", "delete a cluster.")
  deleteCluster.Arg("cluster=name", "the name of the cluster to delete.").Required().Action(setCurrent).StringVar(&clusterNameArg)

  interListClusters = interCluster.Command("list", "list the clusters")
  interDescribeCluster = interCluster.Command("describe", "Show the details of a particular cluster.")
  interDescribeCluster.Arg("cluster-name", "Short name of cluster to desecribe.").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  // Instance Commands
  instance = interApp.Command("instance", "the context for container instances commands.")
  interListContainerInstances = instance.Command("list", "list containers attached to a cluster.")
  interListContainerInstances.Arg("cluster-name", "Short name of cluster to look for instances in").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  interDescribeContainerInstance = instance.Command("describe", "deatils assocaited with a container instance")
  interDescribeContainerInstance.Arg("instance-arn", "ARN of the container instance").Required().StringVar(&interContainerArn)
  interDescribeContainerInstance.Arg("cluster-name", "Short name of cluster for the instance").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  interDescribeAllContainerInstances = instance.Command("describe-all", "details for all conatiners instances in a cluster.")
  interDescribeAllContainerInstances.Arg("cluster-name", "Short name of cluster for instances").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  interCreateContainerInstance = instance.Command("create", "start up a new instance for a cluster")
  interCreateContainerInstance.Arg("cluster-name", "Short name of cluster to for new instance.").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  interTerminateContainerInstance = instance.Command("terminate", "stop a container instnace.")
  interTerminateContainerInstance.Arg("instance-arn", "ARN of the container instance to terminate.").Required().StringVar(&interContainerArn)
  interTerminateContainerInstance.Arg("cluster-name", "Short name of cluster for instance to stop").Required().Action(setCurrent).StringVar(&clusterNameArg)


  interTask = interApp.Command("task", "the context for task commands.")
  interListTasks = interTask.Command("list", "the context for listing tasks")
  interListTasks.Arg("cluster-name", "Short name of cluster with tasks to list.").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  interDescribeTask = interTask.Command("describe", "Details assocaited with a running task.")
  interDescribeTask.Arg("task-arn", "Arn for the task to describe.").Required().StringVar(&interTaskArn)
  interDescribeTask.Arg("cluster-name", "Short ARN for the cluster where this task executes.").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  interDescribeAllTasks = interTask.Command("describe-all", "describe all the tasks associatd with a cluster.")
  interDescribeAllTasks.Arg("cluster-name", "Short name of the cluster with tasks to describe").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  interRunTask = interTask.Command("run", "Run a new task.")
  interRunTask.Arg("task-definition", "The definition of the task to run.").Required().StringVar(&interTaskDefinitionArn)
  interRunTask.Arg("cluster-name", "short name of the cluster to run the task on.").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)
  interRunTask.Arg("environment", "Key values for the container environment.").StringMapVar(&taskEnv)

  interStopTask = interTask.Command("stop", "Stop a task.")
  interStopTask.Arg("task-arn", "ARN of the task to stop (from task list)").Required().StringVar(&interTaskArn)
  interStopTask.Arg("clusnter-name", "short name of the cluster the task is running on.").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  // Task Definition.
  interTaskDefinition = interApp.Command("task-definition", "the context for task definitions.")
  interListTaskDefinitions = interTaskDefinition.Command("list", "list the existing task definntions.")

  interDescribeTaskDefinition = interTaskDefinition.Command("describe", "Describe all the registered task definitions.")
  interDescribeTaskDefinition.Arg("task-definition-arn", "arn of task definition to describe.").Required().StringVar(&interTaskDefinitionArn)

  registerTaskDefinition = interTaskDefinition.Command("register", "Register a task definition.") 
  registerTaskDefinition.Arg("config", "Configuration desecription for task definition.").Required().StringVar(&taskConfigFileName)

}


func doICommand(line string, ecsSvc *ecs.ECS, ec2Svc *ec2.EC2, awsConfig *aws.Config, sess *session.Session) (err error) {

  // This is due to a 'peculiarity' of kingpin: it collects strings as arguments across parses.
  interTestString = []string{}

  // Prepare a line for parsing
  line = strings.TrimRight(line, "\n")
  fields := []string{}
  fields = append(fields, strings.Fields(line)...)
  if len(fields) <= 0 {
    return nil
  }

  command, err := interApp.Parse(fields)

  if err != nil {
    fmt.Printf("Command error: %s.\nType help for a list of commands.\n", err)
    return nil
  } else {
      switch command {
      case interVerbose.FullCommand(): err = doVerbose()
      case interExit.FullCommand(): err = doQuit(sess)
      case interQuit.FullCommand(): err = doQuit(sess)

      case createCluster.FullCommand(): err = doCreateCluster(ecsSvc)
      case deleteCluster.FullCommand(): err = doDeleteCluster(ecsSvc)
      case interListClusters.FullCommand(): err = doListClusters(sess)
      case interDescribeCluster.FullCommand(): err = doDescribeCluster(ecsSvc)

      case interListTasks.FullCommand(): err = doListTasks(sess)
      case interDescribeTask.FullCommand(): err = doDescribeTask(sess)
      case interDescribeAllTasks.FullCommand(): err = doDescribeAllTasks(ecsSvc)
      case interRunTask.FullCommand(): err = doRunTask(ecsSvc)
      case interStopTask.FullCommand(): err = doStopTask(sess)

      case interListContainerInstances.FullCommand(): err = doListContainerInstances(sess)
      case interDescribeContainerInstance.FullCommand(): err = doDescribeContainerInstance(sess)
      case interDescribeAllContainerInstances.FullCommand(): err = doDescribeAllContainerInstances(sess)
      case interCreateContainerInstance.FullCommand(): err = doCreateContainerInstance(sess)
      case interTerminateContainerInstance.FullCommand(): err = doTerminateContainerInstance(ecsSvc, ec2Svc)

      case interListTaskDefinitions.FullCommand(): err = doListTaskDefinitions(ecsSvc)
      case interDescribeTaskDefinition.FullCommand(): err = doDescribeTaskDefinition(ecsSvc)
      case registerTaskDefinition.FullCommand(): err = doRegisterTaskDefinition(ecsSvc)
    }
  }
  return err
}


// TODO: finish the thought.
// map[string]interface{}{
//   "cluster-name": currentCluster
// }

func setCurrent(pc *kingpin.ParseContext) (error) {

  for _, pe := range pc.Elements {
    c := pe.Clause
    switch c.(type) {
    // case *kingpin.CmdClause : fmt.Printf("CmdClause: %s\n", (c.(*kingpin.CmdClause)).Model().Name)
    // case *kingpin.FlagClause : fmt.Printf("ArgClause: %s\n", c.(*kingpin.FlagClause).Model().Name)
    case *kingpin.ArgClause : 
      fc := c.(*kingpin.ArgClause)
      if fc.Model().Name == "cluster-name" {
        currentCluster = *pe.Value
      }
    }
  }

  return nil
}

func doTest() (error) {
  fmt.Println("Test command executed.")
  return nil
}

func toggleVerbose() bool {
  verbose = !verbose
  return verbose
}

func doVerbose() (error) {
  if toggleVerbose() {
    fmt.Println("Verbose is on.")
    logging.SetLevel(logging.DEBUG,"ecs-pilot")
    logging.SetLevel(logging.DEBUG, "ecs-pilot/interactive")
    logging.SetLevel(logging.DEBUG, "ecs-pilot/awslib")
  } else {
    fmt.Println("Verbose is off.")
    logging.SetLevel(logging.ERROR,"")
  }
  return nil
}

func doQuit(sess *session.Session) (error) {
  clusters, err := awslib.GetAllClusterDescriptions(sess)
  if err != nil {
    fmt.Printf("doQuit: Error getting cluster data: %s\n", err)
  } else {
    for i, cluster := range clusters {
      if *cluster.RegisteredContainerInstancesCount >= 0 {
        fmt.Printf("%d. ECS Cluster %s\n", i+1, clusterShortString(cluster))
      } 
    }
  }
  return io.EOF
}

func doTerminate(i int) {}

func promptLoop(process func(string) (error)) (err error) {
  for moreCommands := true; moreCommands; {
    prompt := fmt.Sprintf("%s[%s%s%s]:%s ", titleEmph, infoColor, currentCluster, titleEmph, resetColor)
    line, err := readline.Line(prompt)
    if err == io.EOF {
      moreCommands = false
    } else if err != nil {
      fmt.Printf("%sError! %s%s\n", failColor, err, resetColor)
    } else {
      readline.AddHistory(line)
      err = process(line)
      if err == io.EOF {
        moreCommands = false
      } else if err != nil {
        fmt.Printf("%sError: %s%s\n", failColor, err, resetColor)
      }
    }
  }
  return nil
}


// This gets called from the main program, presumably from the 'interactive' command on main's command line.
func DoInteractive(sess *session.Session, defaultConfig *aws.Config) {
  ecs_svc := ecs.New(sess)
  ec2_svc := ec2.New(sess)
  xICommand := func(line string) (err error) {return doICommand(line, ecs_svc, ec2_svc, defaultConfig, sess)}
  err := promptLoop(xICommand)
  if err != nil {fmt.Printf("%sError! %s.%s\n", failColor, err, resetColor)}
}

