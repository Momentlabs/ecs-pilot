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
  "github.com/chzyer/readline"
  "github.com/jdrivas/sl"
  "github.com/mgutz/ansi"
  "github.com/Sirupsen/logrus"


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
  currentSession *session.Session
)


var (

  interApp *kingpin.Application

  interExit *kingpin.CmdClause
  interQuit *kingpin.CmdClause
  interVerbose *kingpin.CmdClause
  verbose bool
  debugCmd *kingpin.CmdClause
  debug bool
  interTestString []string

  useClusterCmd *kingpin.CmdClause

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

  clusterNameArg string
  interContainerArn string

  // Services
  serviceCmd *kingpin.CmdClause
  listServicesCmd *kingpin.CmdClause
  describeServiceCmd *kingpin.CmdClause
  createServiceCmd *kingpin.CmdClause
  restartServiceCmd *kingpin.CmdClause
  updateServiceDesiredCountCmd *kingpin.CmdClause
  deleteServiceCmd *kingpin.CmdClause
  serviceNameArg string
  instanceCountArg int64

  // Tasks
  interTask *kingpin.CmdClause
  interListTasks *kingpin.CmdClause
  statusTasks *kingpin.CmdClause
  interDescribeAllTasks *kingpin.CmdClause
  interDescribeTask *kingpin.CmdClause
  interRunTask *kingpin.CmdClause
  taskDefinitionArnArg string
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

  log = sl.New()

)

func init() {

  taskEnv = make(map[string]string)

  interApp = kingpin.New("", "Interactive mode.").Terminate(doTerminate)

  // state
  debugCmd = interApp.Command("debug", "toggle debug logging and description.")
  interVerbose = interApp.Command("verbose", "toggle verbose mode.")
  interExit = interApp.Command("exit", "exit the program. <ctrl-D> works too.")
  interQuit = interApp.Command("quit", "exit the program.")

  useClusterCmd = interApp.Command("use", "Set the cluster use as default.")
  useClusterCmd.Arg("cluster-name", "New default cluster.").Required().Action(setCurrent).StringVar(&clusterNameArg)

  // Cluster Commands
  interCluster = interApp.Command("cluster", "the context for cluster commands")
  createCluster = interCluster.Command("create", "create a new cluster.")
  createCluster.Arg("cluster-name", "the name of the cluster to create.").Required().Action(setCurrent).StringVar(&clusterNameArg)

  clusterUseCmd := interCluster.Command("use", "start using the named cluster in future commands.")
  clusterUseCmd.Arg("cluster-name", "the name of the cluster you want to start using.").Required().Action(setCurrent).StringVar(&clusterNameArg)

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


  // Task Commands
  interTask = interApp.Command("task", "the context for task commands.")
  interListTasks = interTask.Command("list", "the context for listing tasks")
  interListTasks.Arg("cluster-name", "Short name of cluster with tasks to list.").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  statusTasks = interTask.Command("status", "the context for listing tasks")
  statusTasks.Arg("cluster-name", "Short name of cluster with tasks to list.").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  interDescribeTask = interTask.Command("describe", "Details assocaited with a running task.")
  interDescribeTask.Arg("task-arn", "Arn for the task to describe.").Required().StringVar(&interTaskArn)
  interDescribeTask.Arg("cluster-name", "Short ARN for the cluster where this task executes.").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  interDescribeAllTasks = interTask.Command("describe-all", "describe all the tasks associatd with a cluster.")
  interDescribeAllTasks.Arg("cluster-name", "Short name of the cluster with tasks to describe").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  interRunTask = interTask.Command("run", "Run a new task.")
  interRunTask.Arg("task-definition", "The definition of the task to run.").Required().StringVar(&taskDefinitionArnArg)
  interRunTask.Arg("cluster-name", "short name of the cluster to run the task on.").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)
  interRunTask.Arg("environment", "Key values for the container environment.").StringMapVar(&taskEnv)

  interStopTask = interTask.Command("stop", "Stop a task.")
  interStopTask.Arg("task-arn", "ARN of the task to stop (from task list)").Required().StringVar(&interTaskArn)
  interStopTask.Arg("cluster-name", "short name of the cluster the task is running on.").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  // Service Commands
  serviceCmd = interApp.Command("service", "the context for service commands.")

  listServicesCmd = serviceCmd.Command("list", "list the services on the cluster.")
  listServicesCmd.Arg("cluster-name", "Cluster where we'll find the services.").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  describeServiceCmd = serviceCmd.Command("describe", "Print details about a service.")
  describeServiceCmd.Arg("service-name", "Name of service to describe.").Required().StringVar(&serviceNameArg)
  describeServiceCmd.Arg("cluster-name", "Cluster for the service.").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  createServiceCmd = serviceCmd.Command("create", "Create a new service.")
  createServiceCmd.Arg("service-name", "Name of new service.").Required().StringVar(&serviceNameArg)
  createServiceCmd.Arg("task-definition", "Task definition for new service.").Required().StringVar(&taskDefinitionArnArg)
  createServiceCmd.Arg("instance-count", "Number of instances of task definition to run in new service.").Required().Int64Var(&instanceCountArg)
  createServiceCmd.Arg("cluster-name", "Cluster for the new service.").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  restartServiceCmd = serviceCmd.Command("restart", "Restart the service.")
  restartServiceCmd.Arg("service-name", "Name of service to restart.").Required().StringVar(&serviceNameArg)
  restartServiceCmd.Arg("cluster-name", "Cluster for the service.").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  updateServiceDesiredCountCmd = serviceCmd.Command("update-count", "Update the desired instance count for the service.")
  updateServiceDesiredCountCmd.Arg("service-name", "Name of service to update.").Required().StringVar(&serviceNameArg)
  updateServiceDesiredCountCmd.Arg("instance-count", "Number of instances of task definition to run in updated service.").Required().Int64Var(&instanceCountArg)
  updateServiceDesiredCountCmd.Arg("cluster-name", "Cluster for the update service.").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  deleteServiceCmd = serviceCmd.Command("delete", "Delete a service.")
  deleteServiceCmd.Arg("service-name", "Name of service to delete.").Required().StringVar(&serviceNameArg)
  deleteServiceCmd.Arg("cluster-name", "Cluster for the service.").Default(defaultCluster).Action(setCurrent).StringVar(&clusterNameArg)

  // Task Definition.
  interTaskDefinition = interApp.Command("task-definition", "the context for task definitions.")
  interListTaskDefinitions = interTaskDefinition.Command("list", "list the existing task definntions.")

  interDescribeTaskDefinition = interTaskDefinition.Command("describe", "Describe all the registered task definitions.")
  interDescribeTaskDefinition.Arg("task-definition-arn", "arn of task definition to describe.").Required().StringVar(&taskDefinitionArnArg)

  registerTaskDefinition = interTaskDefinition.Command("register", "Register a task definition.") 
  registerTaskDefinition.Arg("config", "Configuration desecription for task definition.").Required().StringVar(&taskConfigFileName)

}


func doICommand(line string, ecsSvc *ecs.ECS, ec2Svc *ec2.EC2, awsConfig *aws.Config, sess *session.Session) (err error) {

  // Globals (arg variables) keep their state through iterations
  // through doICommand. So we reset them here.
  interTestString = []string{}
  taskEnv = make(map[string]string)

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
      case debugCmd.FullCommand(): err = doDebug()
      case interVerbose.FullCommand(): err = doVerbose()
      case interExit.FullCommand(): err = doQuit(sess)
      case interQuit.FullCommand(): err = doQuit(sess)

      case createCluster.FullCommand(): err = doCreateCluster(sess)
      case deleteCluster.FullCommand(): err = doDeleteCluster(sess)
      case interListClusters.FullCommand(): err = doListClusters(sess)
      case interDescribeCluster.FullCommand(): err = doDescribeCluster(sess)

      case interListTasks.FullCommand(): err = doListTasks(sess)
      case statusTasks.FullCommand(): err = doStatusTasks(clusterNameArg, sess)
      case interDescribeTask.FullCommand(): err = doDescribeTask(sess)
      case interDescribeAllTasks.FullCommand(): err = doDescribeAllTasks(sess)
      case interRunTask.FullCommand(): err = doRunTask(sess)
      case interStopTask.FullCommand(): err = doStopTask(sess)

      case listServicesCmd.FullCommand(): err = doListServices(currentCluster, sess)
      case describeServiceCmd.FullCommand(): err = doDescribeService(serviceNameArg, currentCluster, sess)
      case createServiceCmd.FullCommand(): err = doCreateService(serviceNameArg, taskDefinitionArnArg, currentCluster, instanceCountArg, sess)
      case restartServiceCmd.FullCommand(): err = doRestartService(serviceNameArg, currentCluster, sess)
      case updateServiceDesiredCountCmd.FullCommand(): err = doUpdateServiceDesiredCount(serviceNameArg, currentCluster, instanceCountArg, sess)
      case deleteServiceCmd.FullCommand(): err = doDeleteService(serviceNameArg, currentCluster, sess)

      case interListContainerInstances.FullCommand(): err = doListContainerInstances(sess)
      case interDescribeContainerInstance.FullCommand(): err = doDescribeContainerInstance(sess)
      case interDescribeAllContainerInstances.FullCommand(): err = doDescribeAllContainerInstances(sess)
      case interCreateContainerInstance.FullCommand(): err = doCreateContainerInstance(sess)
      case interTerminateContainerInstance.FullCommand(): err = doTerminateContainerInstance(sess)

      case interListTaskDefinitions.FullCommand(): err = doListTaskDefinitions(sess)
      case interDescribeTaskDefinition.FullCommand(): err = doDescribeTaskDefinition(sess)
      case registerTaskDefinition.FullCommand(): err = doRegisterTaskDefinition(sess)
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
        nc := *pe.Value
        there, err := cCache.Contains(nc, currentSession)
        if there {
          currentCluster = nc
        } else {
          if err != nil {
            fmt.Printf("Failed to find cluster: %s\n", err)
          } else {
            fmt.Printf("Failed to find cluster \"%s\".\n", nc)
          }
        }
      }
    }
  }

  return nil
}

func doTest() (error) {
  fmt.Println("Test command executed.")
  return nil
}

func toggleDebug() bool {
  debug = !debug
  return debug
}

func doDebug() (error) {

  if toggleDebug() {
    fmt.Println("Debug is on.")
  } else {
    fmt.Println("Debug is off.")
  }
  configureLogs()
  return nil
}

func toggleVerbose() bool {
  verbose = !verbose
  return verbose
}

func doVerbose() (error) {
  if toggleVerbose() {
    fmt.Println("Verbose is on.")
  } else {
    fmt.Println("Verbose is off.")
  }
  configureLogs()
  return nil
}

func configureLogs() {
  formatter := new(sl.TextFormatter)
  formatter.FullTimestamp = true
  log.SetFormatter(formatter)
  if debug || verbose {
    log.SetLevel(logrus.DebugLevel)
    awslib.SetLogLevel(logrus.DebugLevel)
  } else {
    log.SetLevel(logrus.InfoLevel)
    awslib.SetLogLevel(logrus.InfoLevel)
  }
}

func doQuit(sess *session.Session) (error) {
  doListClusters(sess)
  return io.EOF
}

func doTerminate(i int) {}

func promptLoop(process func(string) (error)) (err error) {
  for moreCommands := true; moreCommands; {
    prompt := fmt.Sprintf("%spilot [%s%s%s]:%s ", titleEmph, infoColor, currentCluster, titleEmph, resetColor)
    line, err := readline.Line(prompt)
    if err == io.EOF {
      moreCommands = false
    } else if err != nil {
      fmt.Printf("%sReadline Error: %s%s\n", failColor, err, resetColor)
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
  currentSession = sess
  ecs_svc := ecs.New(sess)
  ec2_svc := ec2.New(sess)
  readline.SetHistoryPath("./.ecs-pilot_history")
  xICommand := func(line string) (err error) {return doICommand(line, ecs_svc, ec2_svc, defaultConfig, sess)}
  err := promptLoop(xICommand)
  if err != nil {fmt.Printf("%sError exiting prompter: %s%s\n", failColor, err, resetColor)}
}

