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
  interDescribeContainerInstance *kingpin.CmdClause
  interDescribeAllContainerInstances *kingpin.CmdClause
  interNewContainerInstance *kingpin.CmdClause
  interTerminateContainerInstance *kingpin.CmdClause
  clusterName string
  containerArn string

  // Tasks
  interTask *kingpin.CmdClause
  interListTasks *kingpin.CmdClause
  interDescribeAllTasks *kingpin.CmdClause
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
  interDescribeContainerInstance = interContainer.Command("describe", "deatils assocaited with a container instance")
  interDescribeContainerInstance.Arg("cluster-name", "Short name of cluster for the instance").Required().StringVar(&clusterName)
  interDescribeContainerInstance.Arg("instance-arn", "ARN of the container instance").Required().StringVar(&containerArn)
  interDescribeAllContainerInstances = interContainer.Command("describe-all", "details for all conatiners instances in a cluster.")
  interDescribeAllContainerInstances.Arg("cluster-name", "Short name of cluster for instances").Required().StringVar(&clusterName)
  interNewContainerInstance = interContainer.Command("new", "start up a new instance for a cluster")
  interNewContainerInstance.Arg("cluster-name", "Short name of cluster to for new instance.").Required().StringVar(&clusterName)
  interTerminateContainerInstance = interContainer.Command("stop", "stop a container instnace.")
  interTerminateContainerInstance.Arg("cluster-name", "Short name of cluster for instance to stop").Required().StringVar(&clusterName)
  interTerminateContainerInstance.Arg("instance-arn", "ARN of the container instance to terminate.").Required().StringVar(&containerArn)

  interTask = interApp.Command("task", "the context for task commands.")
  interListTasks = interTask.Command("list", "the context for listing tasks")
  interListTasks.Arg("cluster-name", "Short name of cluster with tasks to list.").Required().StringVar(&clusterName)
  interDescribeAllTasks = interTask.Command("describe-all", "describe all the tasks associatd with a cluster.")
  interDescribeAllTasks.Arg("cluster-name", "Short name of the cluster with tasks to describe").Required().StringVar(&clusterName)
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
      case interListTasks.FullCommand(): err = doListTasks(svc)
      case interDescribeAllTasks.FullCommand(): err = doDescribeAllTasks(svc)
      case interListContainerInstances.FullCommand(): err = doListContainerInstances(svc)
      case interDescribeContainerInstance.FullCommand(): err = doDescribeContainerInstance(svc)
      case interDescribeAllContainerInstances.FullCommand(): err = doDescribeAllContainerInstances(svc)
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

func doDescribeContainerInstance(svc *ecs.ECS) (error) {
  ciMap, err := GetContainerInstanceDescription(clusterName, containerArn, svc)
  if err == nil {
    // fmt.Printf("%s\n", ContainerInstanceMapToString(ciMap))
    fmt.Printf("%s\n", ciMap.toString())
  }
  return err
}

func doDescribeAllContainerInstances(svc *ecs.ECS) (error) {
  ciMap, err := GetAllContainerInstanceDescriptions(clusterName, svc)
  if err == nil {
    if len(ciMap) <= 0 {
      fmt.Printf("There are no containers for: %s.\n", clusterName)
    } else {
     fmt.Printf("%s\n", ciMap.toString())
    }
  }
  return err
}


func (ciMap ContainerInstanceMap) toString() (string) {
  s := ""
  for _, ci := range ciMap {
    iString := ""
    if ci.Instance != nil {
      iString = fmt.Sprintf("%s", ContainerInstanceDescriptionToString(ci.Instance))
    } else {
      iString = "No instance description"
    }
    fString := ""
    if ci.Failure != nil {
      fString = fmt.Sprintf("+v", *ci.Failure)
    }
    s += fmt.Sprintf("%s\n%s\n", iString, fString) 
  } 
  return s
}

func ContainerInstanceDescriptionToString(container *ecs.ContainerInstance) (string){
  s := ""
  s += fmt.Sprintf("Container ARN: %s\n", *container.ContainerInstanceArn)
  s += fmt.Sprintf("EC2-ID: %s\n", *container.Ec2InstanceId)
  s += fmt.Sprintf("Status:  %s\n", *container.Status)
  s += fmt.Sprintf("Running Task Count: %d.\n", *container.RunningTasksCount)
  s += fmt.Sprintf("Pending Task Count: %d\n", *container.PendingTasksCount)
  s += fmt.Sprintf("There are (%d) registered resources.\n", len(container.RegisteredResources))
  for i, resource := range container.RegisteredResources {
    s += fmt.Sprintf("\t %d. %s: %+v\n", i+1, *resource.Name, resourceValue(resource))
  }
  s += fmt.Sprintf("There are (%d) remaining resources.\n", len(container.RemainingResources))
  for i, resource := range container.RemainingResources {
    s += fmt.Sprintf("\t %d. %s: %+v\n", i+1, *resource.Name, resourceValue(resource))
  }
  s += fmt.Sprintf("Agent connected: %+v\n", *container.AgentConnected)
  status := ""
  if container.AgentUpdateStatus != nil {
    status = *container.AgentUpdateStatus
  } else {
    status = "never requested."
  }
  s += fmt.Sprintf("Agent updated status: %s\n", status)
  s += fmt.Sprintf("There are (%d) attributes.\n", len(container.Attributes))
  for i, attr := range container.Attributes {
    s+= fmt.Sprintf("\t%d.  %s\n", i+1, attributeString(attr))
  }

  return s
}

func resourceValue(r *ecs.Resource) (interface{}) {

  switch *r.Type {
    case "INTEGER": return *r.IntegerValue
    case "DOUBLE": return *r.DoubleValue
    case "LONG": return *r.LongValue
    case "STRINGSET": return stringArrayToString(r.StringSetValue)
  }
  return nil
}

func stringArrayToString(sA []*string) (string) {
  final := ""
  for i, s := range sA {
    if i == 0 {
      final = fmt.Sprintf("%s", *s)
    } else {
      final = fmt.Sprintf("%s, %s", final, *s)
    }
  }
  return final
}

func attributeString(attr *ecs.Attribute) (string) {
  value := ""
  if attr.Value == nil {
    value = "nil"
  } else {
    value = *attr.Value
  }
  return fmt.Sprintf("%s: %s", *attr.Name, value)
}

func doNewContainerInstance(svc *ecs.ECS, awsConfig *aws.Config) (error) {
  resp, err := LaunchContainerInstance(clusterName, awsConfig)
  if err != nil {
    return err
  }

  fmt.Printf("%+v\n", resp)
  return nil
}

func doTerminateContainerInstance(svc *ecs.ECS, awsConfig *aws.Config) (error) {
  resp, err := TerminateContainerInstance(clusterName, containerArn, svc, awsConfig)
  if err == nil {
    fmt.Printf("Terminated container instance %s.\n", containerArn)
    fmt.Printf("%+v\n", resp)
  }
  return err
}

func doListTasks(svc *ecs.ECS) (error) {
  arns, err := ListTasksForCluster(clusterName, svc)
  if err == nil {
   fmt.Printf("There are (%d) tasks for cluster: %s\n", len(arns), clusterName)
    for i, arn := range arns {
      fmt.Printf("%d: %s\n", i+1, *arn)
    }
  }
  return err
}

func doDescribeAllTasks(svc *ecs.ECS) (error) {
  resp, err := GetAllTaskDescriptions(clusterName, svc)

  if err == nil {
    if len(resp) <= 0 {
      fmt.Printf("No tasks for %s.\n", clusterName)
    } else {
      fmt.Printf("%s", resp.toString())
    }
  }
  return err
}

func (ctMap ContainerTaskMap) toString() (string) {
  s := ""
  for _, ct := range ctMap {
    tString := ""
    if ct.Task != nil {
      tString = fmt.Sprintf("%s", ContainerTaskDescriptionToString(ct.Task))
    } else {
      tString = "No task description"
    }
    fString := ""
    if ct.Failure != nil {
      fString = fmt.Sprintf("+v", *ct.Failure)
    }
    s += fmt.Sprintf("%s\n%s", tString, fString) 
  } 
  return s
}

func ContainerTaskDescriptionToString(task *ecs.Task) (string) {
  s := ""
  s += fmt.Sprintf("Task ARN: %s\n", *task.TaskArn)
  s += fmt.Sprintf("Cluster ARN: %s\n", *task.ClusterArn)
  s += fmt.Sprintf("Container ARN: %s\n", *task.ContainerInstanceArn)

  s += fmt.Sprintf("There are (%d) associated containers.\n", len(task.Containers))
  if len(task.Containers) > 0 {
    for i, container := range task.Containers {
      s += fmt.Sprintf("%d. Name: %s\n", i+1, *container.Name)
      s += fmt.Sprintf("\tContainer Arn: %s\n", *container.ContainerArn)
      s += fmt.Sprintf("\tTask Arn: %s\n", *container.TaskArn)
      // s += fmt.Sprintf("\tReason: %s\n", *container.Reason)
      s += fmt.Sprintf("\tLast Status: %s\n", *container.LastStatus)
      // s += fmt.Sprintf("\tExit Code: %d\n", *container.ExitCode)
      s += fmt.Sprintf("\tContainer Network Bindings:\n")
      for j, network := range container.NetworkBindings {
        s +=  fmt.Sprintf("\t\t%d. IP: %s", j+1, *network.BindIP)
        s += fmt.Sprintf(" Conatiner Port: %d -> Host Port: %d", *network.ContainerPort, *network.HostPort)
        s += fmt.Sprintf("  (%s)\n", *network.Protocol)
      }
    }
  }

  return s
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
    fmt.Printf("%s\n", ContainerTaskDescriptionToString(resp.Task))
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

