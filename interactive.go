package main 

import (
  "gopkg.in/alecthomas/kingpin.v2"
  "github.com/bobappleyard/readline"
  "strings"
  "fmt"
  "io"
  "github.com/aws/aws-sdk-go/aws"
  "github.com/aws/aws-sdk-go/service/ecs"
  // "github.com/aws/aws-sdk-go/service/ec2"
  "github.com/op/go-logging"
)

var (

  interApp *kingpin.Application

  interExit *kingpin.CmdClause
  interQuit *kingpin.CmdClause
  interVerbose *kingpin.CmdClause
  iVerbose bool
  interTestString []string

  // Clusters
  interCluster *kingpin.CmdClause
  interListClusters *kingpin.CmdClause
  interDescribeCluster *kingpin.CmdClause

  // Containers
  interContainer *kingpin.CmdClause
  interListContainerInstances *kingpin.CmdClause
  interNewContainerInstance *kingpin.CmdClause
  interTerminateContainerInstance *kingpin.CmdClause
  clusterName string
  containerArn string

  // Tasks
  interTask *kingpin.CmdClause
  interListTasks *kingpin.CmdClause
  interListClusterTasks *kingpin.CmdClause
  interRunTask *kingpin.CmdClause
  taskDefinition string
  interStopTask *kingpin.CmdClause
  taskArn string

  // Task Defintions
  interTaskDefinition *kingpin.CmdClause
  interListTaskDefinitions *kingpin.CmdClause
)

func init() {
  interApp = kingpin.New("", "Interactive mode.").Terminate(doTerminate)

  // state
  interVerbose = interApp.Command("verbose", "toggle verbose mode.")
  interExit = interApp.Command("exit", "exit the program. <ctrl-D> works too.")
  interQuit = interApp.Command("quit", "exit the program.")

  interCluster = interApp.Command("cluster", "the context for cluster commands")
  interListClusters = interCluster.Command("list", "list the clusters")
  interDescribeCluster = interCluster.Command("describe", "Show the details of a particular cluster.")
  interDescribeCluster.Arg("cluster-name", "Short name of cluster to desecribe.").Required().StringVar(&clusterName)

  interContainer = interApp.Command("container", "the context for container instances commands.")
  interListContainerInstances = interContainer.Command("list", "list containers attached to a cluster.")
  interListContainerInstances.Arg("cluster-name", "Short name of cluster to look for instances in").Required().StringVar(&clusterName)
  interNewContainerInstance = interContainer.Command("new", "start up a new instance for a cluster")
  interNewContainerInstance.Arg("cluster-name", "Short name of cluster to for new instance.").Required().StringVar(&clusterName)
  interTerminateContainerInstance = interContainer.Command("stop", "stop a container instnace.")
  interTerminateContainerInstance.Arg("cluster-name", "Short name of cluster for instance to stop").Required().StringVar(&clusterName)
  interTerminateContainerInstance.Arg("instance-arn", "ARN of the instance to terminate.").Required().StringVar(&containerArn)

  interTask = interApp.Command("task", "the context for task commands.")
  interListTasks = interTask.Command("list", "the context for listing tasks")
  interListClusterTasks = interListTasks.Command("cluster", "listing tasks for a particular cluster")
  interListClusterTasks.Arg("cluster-name", "Short name of cluster with tasks to list.").Required().StringVar(&clusterName)
  interRunTask = interTask.Command("run", "Run a new task.")
  interRunTask.Arg("cluster-name", "short name of the cluster to run the task on.").Required().StringVar(&clusterName)
  interRunTask.Arg("task-definition", "The definition of the task to run.").Required().StringVar(&taskDefinition)
  interStopTask = interTask.Command("stop", "Stop a task.")
  interStopTask.Arg("clusnter-name", "short name of the cluster the task is running on.").Required().StringVar(&clusterName)
  interStopTask.Arg("task-arn", "ARN of the task to stop (from task list)").Required().StringVar(&taskArn)

  interTaskDefinition = interApp.Command("task-definition", "the context for task definitions.")
  interListTaskDefinitions = interTaskDefinition.Command("list", "list the existing task definntions.")

}


func doICommand(line string, svc *ecs.ECS, awsConfig *aws.Config) (err error) {

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
      case interExit.FullCommand(): err = doQuit()
      case interQuit.FullCommand(): err = doQuit()
      case interListClusters.FullCommand(): err = doListClusters(svc)
      case interDescribeCluster.FullCommand(): err = doDescribeCluster(svc)
      case interListClusterTasks.FullCommand(): err = doListClusterTasks(svc)
      case interListContainerInstances.FullCommand(): err = doListContainerInstances(svc)
      case interNewContainerInstance.FullCommand(): err = doNewContainerInstance(svc, awsConfig)
      case interTerminateContainerInstance.FullCommand(): err = doTerminateContainerInstance(svc, awsConfig)
      case interListTaskDefinitions.FullCommand(): err = doListTaskDefinitions(svc)
      case interRunTask.FullCommand(): err = doRunTask(svc)
      case interStopTask.FullCommand(): err = doStopTask(svc)
    }
  }
  return err
}

// Commands

func doListClusters(svc *ecs.ECS) (error) {
  clusters,  err := GetClusters(svc)
  if err != nil {
    return err
  }

  fmt.Printf("There are %d clusters\n", len(clusters))
  for i, cluster := range clusters {
    fmt.Printf("%d: %s\n", i+1, *cluster.Arn)
  }
  return nil
}

func doDescribeCluster(svc *ecs.ECS) (error) {
  clusters, err := GetClusterDescription(clusterName, svc)
  if err != nil {
    return err
  }
  cluster := clusters[0]
  printCluster(cluster)
  return nil
}

func printCluster(cluster *ecs.Cluster) {
  fmt.Printf("Active services count: %d\n", *cluster.ActiveServicesCount)
  fmt.Printf("ARN: %s\n", *cluster.ClusterArn)
  fmt.Printf("Name: \"%s\"\n", *cluster.ClusterName)
  fmt.Printf("Pending tasks count: %d\n", *cluster.PendingTasksCount)
  fmt.Printf("Registered instances count: %d\n", *cluster.RegisteredContainerInstancesCount)
  fmt.Printf("Running tasks count: %d\n", *cluster.RunningTasksCount)
  fmt.Printf("Status: %s\n", *cluster.Status)
}

func doListContainerInstances(svc *ecs.ECS) (error) {
  instanceArns, err := GetContainerInstances(clusterName, svc)
  if err != nil {
    return err
  }

  fmt.Printf("%d instances for cluster \"%s\"\n", len(instanceArns), clusterName)
  for i, instance := range instanceArns {
    fmt.Printf("%d: %s\n", i+1, *instance)
  }

  return nil
}

func doNewContainerInstance(svc *ecs.ECS, awsConfig *aws.Config) (error) {
  resp, err := LaunchContainerInstance(clusterName, awsConfig)
  if err != nil {
    return err
  }

  fmt.Printf("%+v", resp)
  return nil
}

func doTerminateContainerInstance(svc *ecs.ECS, awsConfig *aws.Config) (error) {
  resp, err := TerminateContainerInstance(clusterName, containerArn, svc, awsConfig)
  if err == nil {
    fmt.Printf("Terminated container instance %s.\n", containerArn)
    fmt.Printf("%+v", resp)
  }
  return err
}

func doListClusterTasks(svc *ecs.ECS) (error) {
  arns, err := ListTasksForCluster(clusterName, svc)
  if err == nil {
   fmt.Printf("There are (%d) tasks for cluster: %s\n", len(arns), clusterName)
    for i, arn := range arns {
      fmt.Printf("%d: %s\n", i+1, *arn)
    }
  }

  return err
}

func doListTaskDefinitions(svc *ecs.ECS) (error) {
  arns, err := ListTaskDefinitions(svc)
  if err == nil {
    fmt.Printf("There are (%d) task definitions.\n", len(arns))
    for i, arn := range arns {
      fmt.Printf("%d: %s\n.", i+1, *arn)
    }
  }
  return err
}

func doRunTask(svc *ecs.ECS) (error) {
  runTaskOut, err := RunTask(clusterName, taskDefinition, svc)
  if err == nil {
    fmt.Printf("There were (%d) failures running the task.\n", len(runTaskOut.Failures))
    for i, failure := range runTaskOut.Failures {
      fmt.Printf("%d: %s.\n", i+1, failure)
    }
    fmt.Printf("There were (%d) Tasks created.\n", len(runTaskOut.Tasks))
    for i, task := range runTaskOut.Tasks {
      fmt.Printf("%d: %s.\n", i+1, task)
    }
  }
  return err
}

func doStopTask(svc *ecs.ECS) (error) {
  fmt.Printf("Stopping the task: %s.\n", taskArn)
  resp, err := StopTask(clusterName, taskArn, svc)
  if err == nil {
    fmt.Println("This task was stopped:")
    fmt.Printf("%s", resp.Task)
  }
  return err
}

//
// Interpreter upport functions.
//


func doTest() (error) {
  fmt.Println("Test command executed.")
  return nil
}

func toggleVerbose() bool {
  iVerbose = !iVerbose
  return iVerbose
}

func doVerbose() (error) {
  if toggleVerbose() {
    fmt.Println("Verbose is on.")
    logging.SetLevel(logging.DEBUG,"")
  } else {
    fmt.Println("Verbose is off.")
    logging.SetLevel(logging.ERROR,"")
  }
  return nil
}

func doQuit() (error) {
  return io.EOF
}

func doTerminate(i int) {}

func promptLoop(prompt string, process func(string) (error)) (err error) {
  errStr := "Error - %s.\n"
  for moreCommands := true; moreCommands; {
    line, err := readline.String(prompt)
    if err == io.EOF {
      moreCommands = false
    } else if err != nil {
      fmt.Printf(errStr, err)
    } else {
      readline.AddHistory(line)
      err = process(line)
      if err == io.EOF {
        moreCommands = false
      } else if err != nil {
        fmt.Printf(errStr, err)
      }
    }
  }
  return nil
}

// This gets called from the main program, presumably from the 'interactive' command on main's command line.
func DoInteractive(svc *ecs.ECS, config *aws.Config) {
  xICommand := func(line string) (err error) {return doICommand(line, svc, config)}
  prompt := "> "
  err := promptLoop(prompt, xICommand)
  if err != nil {fmt.Printf("Error - %s.\n", err)}
}




