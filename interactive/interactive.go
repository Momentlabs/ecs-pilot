package interactive 

import (
  "gopkg.in/alecthomas/kingpin.v2"
  "github.com/bobappleyard/readline"
  "strings"
  "fmt"
  "io"
  "github.com/aws/aws-sdk-go/aws"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/ecs"
  "github.com/aws/aws-sdk-go/service/ec2"
  "github.com/op/go-logging"
  "ecs-pilot/awslib"
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
  interClusterName string
  interContainerArn string

  // Tasks
  interTask *kingpin.CmdClause
  interListTasks *kingpin.CmdClause
  interDescribeAllTasks *kingpin.CmdClause
  interRunTask *kingpin.CmdClause
  interTaskDefinitionArn string
  interStopTask *kingpin.CmdClause
  interTaskArn string

  // Task Defintions
  interTaskDefinition *kingpin.CmdClause
  interListTaskDefinitions *kingpin.CmdClause
  interDescribeTaskDefinition *kingpin.CmdClause
  registerTaskDefinition *kingpin.CmdClause
  taskConfigFileName string
  // interTaskDefinitionArn string
)

func init() {
  interApp = kingpin.New("", "Interactive mode.").Terminate(doTerminate)

  // state
  interVerbose = interApp.Command("verbose", "toggle verbose mode.")
  interExit = interApp.Command("exit", "exit the program. <ctrl-D> works too.")
  interQuit = interApp.Command("quit", "exit the program.")

  interCluster = interApp.Command("cluster", "the context for cluster commands")
  createCluster = interCluster.Command("create", "create a new cluster.")
  createCluster.Arg("cluster-name", "the name of the cluster to create.").Required().StringVar(&interClusterName)
  deleteCluster = interCluster.Command("delete", "delete a cluster.")
  deleteCluster.Arg("cluster=name", "the name of the cluster to delete.").Required().StringVar(&interClusterName)
  interListClusters = interCluster.Command("list", "list the clusters")
  interDescribeCluster = interCluster.Command("describe", "Show the details of a particular cluster.")
  interDescribeCluster.Arg("cluster-name", "Short name of cluster to desecribe.").Required().StringVar(&interClusterName)

  instance = interApp.Command("instance", "the context for container instances commands.")
  interListContainerInstances = instance.Command("list", "list containers attached to a cluster.")
  interListContainerInstances.Arg("cluster-name", "Short name of cluster to look for instances in").Required().StringVar(&interClusterName)
  interDescribeContainerInstance = instance.Command("describe", "deatils assocaited with a container instance")
  interDescribeContainerInstance.Arg("cluster-name", "Short name of cluster for the instance").Required().StringVar(&interClusterName)
  interDescribeContainerInstance.Arg("instance-arn", "ARN of the container instance").Required().StringVar(&interContainerArn)
  interDescribeAllContainerInstances = instance.Command("describe-all", "details for all conatiners instances in a cluster.")
  interDescribeAllContainerInstances.Arg("cluster-name", "Short name of cluster for instances").Required().StringVar(&interClusterName)
  interCreateContainerInstance = instance.Command("create", "start up a new instance for a cluster")
  interCreateContainerInstance.Arg("cluster-name", "Short name of cluster to for new instance.").Required().StringVar(&interClusterName)
  interTerminateContainerInstance = instance.Command("terminate", "stop a container instnace.")
  interTerminateContainerInstance.Arg("cluster-name", "Short name of cluster for instance to stop").Required().StringVar(&interClusterName)
  interTerminateContainerInstance.Arg("instance-arn", "ARN of the container instance to terminate.").Required().StringVar(&interContainerArn)

  interTask = interApp.Command("task", "the context for task commands.")
  interListTasks = interTask.Command("list", "the context for listing tasks")
  interListTasks.Arg("cluster-name", "Short name of cluster with tasks to list.").Required().StringVar(&interClusterName)
  interDescribeAllTasks = interTask.Command("describe-all", "describe all the tasks associatd with a cluster.")
  interDescribeAllTasks.Arg("cluster-name", "Short name of the cluster with tasks to describe").Required().StringVar(&interClusterName)
  interRunTask = interTask.Command("run", "Run a new task.")
  interRunTask.Arg("cluster-name", "short name of the cluster to run the task on.").Required().StringVar(&interClusterName)
  interRunTask.Arg("task-definition", "The definition of the task to run.").Required().StringVar(&interTaskDefinitionArn)
  interStopTask = interTask.Command("stop", "Stop a task.")
  interStopTask.Arg("clusnter-name", "short name of the cluster the task is running on.").Required().StringVar(&interClusterName)
  interStopTask.Arg("task-arn", "ARN of the task to stop (from task list)").Required().StringVar(&interTaskArn)

  interTaskDefinition = interApp.Command("task-definition", "the context for task definitions.")
  interListTaskDefinitions = interTaskDefinition.Command("list", "list the existing task definntions.")
  interDescribeTaskDefinition = interTaskDefinition.Command("describe", "Describe all the registered task definitions.")
  interDescribeTaskDefinition.Arg("task-definition-arn", "arn of task definition to describe.").Required().StringVar(&interTaskDefinitionArn)
  registerTaskDefinition = interTaskDefinition.Command("register", "Register a task definition.") 
  registerTaskDefinition.Arg("config", "Configuration desecription for task definition.").Required().StringVar(&taskConfigFileName)

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
      case createCluster.FullCommand(): err = doCreateCluster(svc)
      case deleteCluster.FullCommand(): err = doDeleteCluster(svc)
      case interListClusters.FullCommand(): err = doListClusters(svc)
      case interDescribeCluster.FullCommand(): err = doDescribeCluster(svc)
      case interListTasks.FullCommand(): err = doListTasks(svc)
      case interDescribeAllTasks.FullCommand(): err = doDescribeAllTasks(svc)
      case interListContainerInstances.FullCommand(): err = doListContainerInstances(svc)
      case interDescribeContainerInstance.FullCommand(): err = doDescribeContainerInstance(svc, awsConfig)
      case interDescribeAllContainerInstances.FullCommand(): err = doDescribeAllContainerInstances(svc, awsConfig)
      case interCreateContainerInstance.FullCommand(): err = doCreateContainerInstance(svc, awsConfig)
      case interTerminateContainerInstance.FullCommand(): err = doTerminateContainerInstance(svc, awsConfig)
      case interListTaskDefinitions.FullCommand(): err = doListTaskDefinitions(svc)
      case interDescribeTaskDefinition.FullCommand(): err = doDescribeTaskDefinition(svc)
      case registerTaskDefinition.FullCommand(): err = doRegisterTaskDefinition(svc)
      case interRunTask.FullCommand(): err = doRunTask(svc)
      case interStopTask.FullCommand(): err = doStopTask(svc)
    }
  }
  return err
}

// Commands

func doCreateCluster(svc *ecs.ECS) (error) {
  cluster, err := awslib.CreateCluster(interClusterName, svc)
  if err == nil {
    printCluster(cluster)
  }
  return err
}

func doDeleteCluster(svc *ecs.ECS) (error) {
  cluster, err := awslib.DeleteCluster(interClusterName, svc)
  if err == nil {
    printCluster(cluster)
  }
  return err
}

func doListClusters(svc *ecs.ECS) (error) {
  clusters,  err := awslib.GetClusters(svc)
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
  clusters, err := awslib.DescribeCluster(interClusterName, svc)
  if err == nil  {
    if len(clusters) <= 0 {
      fmt.Printf("Couldn't get any clusters for %s.\n", interClusterName)
    } else {
      printCluster(clusters[0])
    }
  }
  return err
}

func printCluster(cluster *ecs.Cluster) {
  fmt.Printf("Name: \"%s\"\n", *cluster.ClusterName)
  fmt.Printf("ARN: %s\n", *cluster.ClusterArn)
  fmt.Printf("Registered instances count: %d\n", *cluster.RegisteredContainerInstancesCount)
  fmt.Printf("Pending tasks count: %d\n", *cluster.PendingTasksCount)
  fmt.Printf("Running tasks count: %d\n", *cluster.RunningTasksCount)
  fmt.Printf("Active services count: %d\n", *cluster.ActiveServicesCount)
  fmt.Printf("Status: %s\n", *cluster.Status)
}

func doListContainerInstances(svc *ecs.ECS) (error) {
  instanceArns, err := awslib.GetContainerInstances(interClusterName, svc)
  if err != nil {
    return err
  }

  fmt.Printf("%d instances for cluster \"%s\"\n", len(instanceArns), interClusterName)
  for i, instance := range instanceArns {
    fmt.Printf("%d: %s\n", i+1, *instance)
  }

  return nil
}

func doDescribeContainerInstance(svc *ecs.ECS, config *aws.Config) (error) {
  ciMap, err := awslib.GetContainerInstanceDescription(interClusterName, interContainerArn, svc)
  if err == nil {
    ec2InstanceMap, err := awslib.DescribeEC2Instances(ciMap, config)
    if err != nil {
      fmt.Printf("%s\n", ContainerInstanceMapToString(ciMap, map[string]*ec2.Instance{}))
      return err
    }
    fmt.Printf("%s\n", ContainerInstanceMapToString(ciMap, ec2InstanceMap))
  }
  return err
}

func doDescribeAllContainerInstances(svc *ecs.ECS, config *aws.Config) (error) {
  ciMap, err := awslib.GetAllContainerInstanceDescriptions(interClusterName, svc)
  if err == nil {
    if len(ciMap) <= 0 {
      fmt.Printf("There are no containers for: %s.\n", interClusterName)
    } else {
      ec2InstanceMap, err := awslib.DescribeEC2Instances(ciMap, config)
      if err != nil {
        fmt.Printf("%s\n", ContainerInstanceMapToString(ciMap, map[string]*ec2.Instance{}))
        return err
      } else {
        fmt.Printf("%s\n", ContainerInstanceMapToString(ciMap, ec2InstanceMap))
      }
    }
  }
  return err
}

func ContainerInstanceMapToString(ciMap awslib.ContainerInstanceMap, instances map[string]*ec2.Instance) (string) {
  s := ""
  for _, ci := range ciMap {
    iString := ""
    if ci.Instance != nil {
      ec2Id := *ci.Instance.Ec2InstanceId
      iString = fmt.Sprintf("%s", ContainerInstanceDescriptionToString(ci.Instance, instances[ec2Id]))
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

func ContainerInstanceDescriptionToString(container *ecs.ContainerInstance, instance *ec2.Instance) (string){
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
    s += fmt.Sprintf("\t%d.  %s\n", i+1, attributeString(attr))
  }
  s += fmt.Sprintf("Associated EC2 Instance:\n")
  if instance != nil {
    s += EC2InstanceToString(*instance, "\t")
    } else {
      s += fmt.Sprintf("No instance informaiton.")
    }

  return s
}

func EC2InstanceToString(instance ec2.Instance, indent string) (string) {
  s := ""
  s += fmt.Sprintf("%sPublic IP: %s\n", indent, *instance.PublicIpAddress)
  s += fmt.Sprintf("%sSecurity Groups: there are (%d) Security Groups for this instance:\n", indent, len(instance.SecurityGroups))
  for i, groupid := range instance.SecurityGroups {
    s += fmt.Sprintf("%s%s%d. %s\n", indent, indent, i+1, *groupid.GroupName)
  }
  s += fmt.Sprintf("%sIMA Instance Profile - arn: %s, id: %s\n", 
    indent, *instance.IamInstanceProfile.Arn, instance.IamInstanceProfile.Id)
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

func doCreateContainerInstance(svc *ecs.ECS, awsConfig *aws.Config) (error) {
  thisClusterName := interClusterName // TODO: This is not the right solution. Need to create a new string and copy.
  nameTag := fmt.Sprintf("%s - ecs instance", interClusterName)
  tags := []*ec2.Tag{
    {
      Key: aws.String("Name"),
      Value: aws.String(nameTag),
    },
  }
  resp, err := awslib.LaunchInstanceWithTags(thisClusterName, tags, awsConfig)
  if err != nil {
    return err
  }
  fmt.Printf("Launced Instance:\n%+v\n", resp)
  awslib.OnInstanceRunning(resp, ec2.New(session.New(awsConfig)), func(err error) {
    if err == nil {
      fmt.Printf("Started (%d) Instances on cluster %s:\n", len(resp.Instances), thisClusterName)
      for i, instance := range resp.Instances {
        fmt.Printf("\t%d. %s.\n", i+1, *instance.InstanceId)
      }
    } else {
      fmt.Printf("Error on waiting for instance to start running.\n")
      fmt.Printf("error: %s.\n", err)
    } 
  })

  return nil
}


func doTerminateContainerInstance(svc *ecs.ECS, awsConfig *aws.Config) (error) {
  resp, err := awslib.TerminateContainerInstance(interClusterName, interContainerArn, svc, awsConfig)
  if err != nil {
    return err
  }

  fmt.Printf("Terminated container instance %s.\n", interContainerArn)
  fmt.Printf("%+v\n", resp)

  if len(resp.TerminatingInstances) > 1 {
    fmt.Printf("Got (%d) instances terminating, excepting only 1.", len(resp.TerminatingInstances))
  }
  fmt.Printf("Terminating Instances:")
  for i, iStateChange := range resp.TerminatingInstances {
    fmt.Printf("%d. %s, ", i+1, *iStateChange.InstanceId)
  }
  fmt.Printf(".\n")
  instanceToWatch := resp.TerminatingInstances[0].InstanceId

  awslib.OnInstanceTerminated(instanceToWatch, ec2.New(session.New(awsConfig)), func(err error) {
    if err == nil {
      fmt.Printf("Instance Termianted: %s.\n", *instanceToWatch)
    } else {
      fmt.Printf("Error on waiting for instance to terminate.\n")
      fmt.Printf("error: %s.\n", err)
    }
  })
  return err
}

func doListTasks(svc *ecs.ECS) (error) {
  arns, err := awslib.ListTasksForCluster(interClusterName, svc)
  tasksMap, err := awslib.GetAllTaskDescriptions(interClusterName, svc)
  if err == nil {
   fmt.Printf("There are (%d) tasks for cluster: %s\n", len(arns), interClusterName)
    for i, arn := range arns {
      containerTask := tasksMap[*arn]
      fmt.Printf("%d: %s\n", i+1, collectContainerNames(containerTask.Task))
      fmt.Printf("\t%s.\n", *arn)
    }
  }
  return err
}

func collectContainerNames(task *ecs.Task) (string) {
  s := ""
  for _, container := range task.Containers {
    s += fmt.Sprintf("%s ", *container.Name)
  }
  return s
}

func doDescribeAllTasks(svc *ecs.ECS) (error) {
  resp, err := awslib.GetAllTaskDescriptions(interClusterName, svc)

  if err == nil {
    if len(resp) <= 0 {
      fmt.Printf("No tasks for %s.\n", interClusterName)
    } else {
      fmt.Printf("%s", ContainerTaskMapToString(resp))
    }
  }
  return err
}

func ContainerTaskMapToString(ctMap awslib.ContainerTaskMap) (string) {
  count := 1
  s := ""
  for _, ct := range ctMap {
    tString := ""
    if ct.Task != nil {
      tString = fmt.Sprintf("%d: %s", count, ContainerTaskDescriptionToString(ct.Task))
      count += 1
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
      s += fmt.Sprintf("\t%d. Name: %s\n", i+1, *container.Name)
      s += fmt.Sprintf("\tContainer Arn: %s\n", *container.ContainerArn)
      s += fmt.Sprintf("\tTask Arn: %s\n", *container.TaskArn)
      containerReason := "<empty>"
      if container.Reason != nil {containerReason = *container.Reason}
      s += fmt.Sprintf("\tReason: %s\n", containerReason)
      s += fmt.Sprintf("\tLast Status: %s\n", *container.LastStatus)
      if container.ExitCode != nil {
        s += fmt.Sprintf("\tExit Code: %d\n", *container.ExitCode)
      } else {
        s += fmt.Sprintf("\tExit Code: %s\n", "<empty>")
        }
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
  arns, err := awslib.ListTaskDefinitions(svc)
  if err == nil {
    fmt.Printf("There are (%d) task definitions.\n", len(arns))
    for i, arn := range arns {
      fmt.Printf("%d: %s.\n", i+1, *arn)
    }
  }
  return err
}

func doDescribeTaskDefinition(svc *ecs.ECS) (error) {

  taskDefinition, err := awslib.GetTaskDefinition(interTaskDefinitionArn, svc)
  if err == nil {
    fmt.Printf("%s\n", taskDefinition)
  }
  return err
}

func doRegisterTaskDefinition(svc *ecs.ECS) (error) {
  resp, err := awslib.RegisterTaskDefinition(taskConfigFileName, svc)
  if err == nil {
    fmt.Printf("Got the following response: %+v\n", resp)
  } else {
    fmt.Printf("Couldn't register the task definition: %s.\n", err)
  }

  return err
}

func doRunTask(svc *ecs.ECS) (error) {
  runTaskOut, err := awslib.RunTask(interClusterName, interTaskDefinitionArn, svc)
  if err == nil {
    fmt.Printf("There were (%d) failures running the task.\n", len(runTaskOut.Failures))
    for i, failure := range runTaskOut.Failures {
      fmt.Printf("%d: %s.\n", i+1, failure)
    }
    fmt.Printf("There were (%d) Tasks created.\n", len(runTaskOut.Tasks))
    for i, task := range runTaskOut.Tasks {
      fmt.Printf("%d: %s.\n", i+1, task)
    }
    if len(runTaskOut.Tasks) > 0 {
      taskToWaitOn := *runTaskOut.Tasks[0].TaskArn
      awslib.OnTaskRunning(interClusterName, taskToWaitOn, svc, func(err error) {
        if err == nil {
          fmt.Printf("Task: %s is now running on cluster %s.\n", taskToWaitOn, interClusterName)
        } else {
          fmt.Printf("Problem waiting for task: %s on cluster %s to start.\n", taskToWaitOn, interClusterName)
          fmt.Printf("Error: %s.\n", err)
        }
      })
    }
  }
  return err
}

func doStopTask(svc *ecs.ECS) (error) {
  fmt.Printf("Stopping the task: %s.\n", interTaskArn)
  resp, err := awslib.StopTask(interClusterName, interTaskArn, svc)
  if err == nil {
    fmt.Println("This task is scheduled to stop.")
    fmt.Printf("%s\n", ContainerTaskDescriptionToString(resp.Task))
    awslib.OnTaskStopped(interClusterName, interTaskArn, svc, func(err error){
      if err == nil {
        fmt.Printf("Task: %s on cluster %s is now stopped.\n", interTaskArn, interClusterName)
      } else {
        fmt.Printf("There was a problem waiting for task %s on cluster %s to stop.\n", interTaskArn, interClusterName)
        fmt.Printf("Error: %s.\n", err)
      }
    })
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

