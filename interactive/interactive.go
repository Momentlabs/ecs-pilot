package interactive 

import (
  "gopkg.in/alecthomas/kingpin.v2"
  "github.com/bobappleyard/readline"
  "strings"
  "fmt"
  "io"
  "time"
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
  taskEnv map[string]string

  // Task Defintions
  interTaskDefinition *kingpin.CmdClause
  interListTaskDefinitions *kingpin.CmdClause
  interDescribeTaskDefinition *kingpin.CmdClause
  registerTaskDefinition *kingpin.CmdClause
  taskConfigFileName string
  // interTaskDefinitionArn string
)

func init() {

  taskEnv = make(map[string]string)

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
  interRunTask.Arg("environment", "Key values for the container environment.").StringMapVar(&taskEnv)
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


func doICommand(line string, ecsSvc *ecs.ECS, ec2Svc *ec2.EC2, awsConfig *aws.Config) (err error) {

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
      case interExit.FullCommand(): err = doQuit(ecsSvc)
      case interQuit.FullCommand(): err = doQuit(ecsSvc)
      case createCluster.FullCommand(): err = doCreateCluster(ecsSvc)
      case deleteCluster.FullCommand(): err = doDeleteCluster(ecsSvc)
      case interListClusters.FullCommand(): err = doListClusters(ecsSvc)
      case interDescribeCluster.FullCommand(): err = doDescribeCluster(ecsSvc)
      case interListTasks.FullCommand(): err = doListTasks(ecsSvc)
      case interDescribeAllTasks.FullCommand(): err = doDescribeAllTasks(ecsSvc)
      case interListContainerInstances.FullCommand(): err = doListContainerInstances(ecsSvc)
      case interDescribeContainerInstance.FullCommand(): err = doDescribeContainerInstance(ecsSvc, ec2Svc)
      case interDescribeAllContainerInstances.FullCommand(): err = doDescribeAllContainerInstances(ecsSvc, ec2Svc)
      case interCreateContainerInstance.FullCommand(): err = doCreateContainerInstance(ecsSvc, ec2Svc)
      case interTerminateContainerInstance.FullCommand(): err = doTerminateContainerInstance(ecsSvc, ec2Svc)
      case interListTaskDefinitions.FullCommand(): err = doListTaskDefinitions(ecsSvc)
      case interDescribeTaskDefinition.FullCommand(): err = doDescribeTaskDefinition(ecsSvc)
      case registerTaskDefinition.FullCommand(): err = doRegisterTaskDefinition(ecsSvc)
      case interRunTask.FullCommand(): err = doRunTask(ecsSvc)
      case interStopTask.FullCommand(): err = doStopTask(ecsSvc)
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
    fmt.Printf("%d: %s\n", i+1, *cluster)
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

func doDescribeContainerInstance(svc *ecs.ECS, ec2_svc *ec2.EC2) (error) {
  ciMap, err := awslib.GetContainerInstanceDescription(interClusterName, interContainerArn, svc)
  if err == nil {
    ec2InstanceMap, err := awslib.DescribeEC2Instances(ciMap, ec2_svc)
    if err != nil {
      fmt.Printf("%s\n", ContainerInstanceMapToString(ciMap, map[string]*ec2.Instance{}))
      return err
    }
    fmt.Printf("%s\n", ContainerInstanceMapToString(ciMap, ec2InstanceMap))
  }
  return err
}

func doDescribeAllContainerInstances(svc *ecs.ECS, ec2_svc *ec2.EC2) (error) {
  ciMap, err := awslib.GetAllContainerInstanceDescriptions(interClusterName, svc)
  if err == nil {
    if len(ciMap) <= 0 {
      fmt.Printf("There are no containers for: %s.\n", interClusterName)
    } else {
      ec2InstanceMap, err := awslib.DescribeEC2Instances(ciMap, ec2_svc)
      if err != nil {
        fmt.Printf("%s", ContainerInstanceMapToString(ciMap, map[string]*ec2.Instance{}))
        return err
      } else {
        fmt.Printf("%s", ContainerInstanceMapToString(ciMap, ec2InstanceMap))
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
    s += fmt.Sprintf("%s", iString)
    if ci.Failure != nil {
      s += fmt.Sprintf("\n+v", *ci.Failure)
    }
  } 
  return s
}

func ContainerInstanceDescriptionToString(container *ecs.ContainerInstance, instance *ec2.Instance) (string){
  s := ""
  s += fmt.Sprintf("Container Instance ARN: %s\n", *container.ContainerInstanceArn)
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
  // s += fmt.Sprintf("There are (%d) attributes.\n", len(container.Attributes))
  // for i, attr := range container.Attributes {
  //   s += fmt.Sprintf("\t%d.  %s\n", i+1, attributeString(attr))
  // }
  s += fmt.Sprintf("Associated EC2 Instance:\n")
  if instance != nil {
    s += EC2InstanceToString(*instance, "\t")
    } else {
      s += fmt.Sprintf("No instance informaiton.")
    }
  return s
}

func EC2InstanceToString(instance ec2.Instance, indent string) (s string) {
  s += fmt.Sprintf("%sLocation: %s\n", indent, *instance.Placement.AvailabilityZone)
  s += fmt.Sprintf("%sPublic IP: %s\n", indent, *instance.PublicIpAddress)
  s += fmt.Sprintf("%sPublic DNS: %s\n", indent, *instance.PublicDnsName)
  s += fmt.Sprintf("%sPrivate IP: %s\n", indent, *instance.PrivateIpAddress)
  s += fmt.Sprintf("%sPrivate DNS: %s\n", indent, *instance.PrivateDnsName)
  s += fmt.Sprintf("%sInstance Type: %s\n", indent, *instance.InstanceType)
  s += fmt.Sprintf("%sMonitoring: %s\n", indent, *instance.Monitoring.State)
  s += fmt.Sprintf("%sArchitecture: %s\n", indent, *instance.Architecture)
  if instance.InstanceLifecycle != nil {
    s += fmt.Sprintf("%sLifecyle: %s\n", indent, *instance.InstanceLifecycle)
  }
  s += fmt.Sprintf("%sLaunch Time: %s\n", indent, instance.LaunchTime.Local())
  uptime := time.Since(*instance.LaunchTime)
  s +=  fmt.Sprintf("%sUptime: %d days, %d hours, %d minutes\n", indent, 
    int(uptime.Hours())/24, int(uptime.Hours()) % 24, int(uptime.Minutes())%60)
  s += fmt.Sprintf("%sKey pair name: %s\n", indent, *instance.KeyName)
  s += fmt.Sprintf("%sSecurity Groups: there are (%d) Security Groups for this instance:\n", 
    indent, len(instance.SecurityGroups))
  for i, groupid := range instance.SecurityGroups {
    s += fmt.Sprintf("%s%s%d. %s\n", indent, indent, i+1, *groupid.GroupName)
  }
  s += fmt.Sprintf("%sIMA Instance Profile - arn: %s", indent, *instance.IamInstanceProfile.Arn)
  s += fmt.Sprintf("%sVPC ID: %s\n", indent, *instance.VpcId)
  s += fmt.Sprintf("%sSubnetId %s\n", indent, *instance.SubnetId)
  s += fmt.Sprintf("%sState: %s\n", indent, *instance.State.Name)
  if instance.StateReason != nil {
    s += fmt.Sprintf("%sState Transition Code: %s  Reason: %s", indent, *instance.StateReason.Code, *instance.StateReason.Message)
  }
  if instance.StateTransitionReason != nil {
    s += fmt.Sprintf("%sState Transition Reason: %s\n", indent, *instance.StateTransitionReason)
  }
  if len(instance.Tags) > 0 {
    s += fmt.Sprintf("%sTags:\n", indent)
    for i, tag := range instance.Tags {
      s += fmt.Sprintf("%s%s%d. \"%s\" = \"%s\"\n", indent, indent, i+1, *tag.Key, *tag.Value)
    }
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

func doCreateContainerInstance(svc *ecs.ECS, ec2Svc *ec2.EC2) (error) {
  thisClusterName := interClusterName // TODO: Check if this is a copying the string over for the OnWait routines below.
  nameTag := fmt.Sprintf("%s - ecs instance", interClusterName)
  tags := []*ec2.Tag{
    {
      Key: aws.String("Name"),
      Value: aws.String(nameTag),
    },
  }
  resp, err := awslib.LaunchInstanceWithTags(thisClusterName, tags, ec2Svc)
  if err != nil {
    return err
  }

  if len(resp.Instances) == 1 {
    inst := resp.Instances[0]
    fmt.Printf("On cluster %s launched instance: ", thisClusterName)
    if verbose {
      fmt.Printf("%#v\n", inst)
    } else {
      fmt.Printf("%s\n", shortInstanceString(inst))
    }
  } else {
    fmt.Printf("Launched (%d) EC2Instances:\n", len(resp.Instances))
    if verbose {
      fmt.Printf("%#v\n",resp) 
    } else {
      for i, inst := range resp.Instances {
        fmt.Printf("\t%d.%s\n", i+1, shortInstanceString(inst))
      }
    }
  }

  // This is for the onwait call back.
  iIds := make([]*string, 0)
  for _, inst := range resp.Instances {
    iIds = append(iIds, inst.InstanceId)
  }
  startTime := time.Now()
  awslib.OnInstanceRunning(resp, ec2Svc, func(err error) { 
    if err == nil {
      instances, err := awslib.GetInstancesForIds(iIds, ec2Svc)
      if err == nil {
        if len(instances) == 1 {
          fmt.Printf("\nEC2 Instance running (%s): %s\n", time.Since(startTime), shortInstanceString(instances[0]))
        } else {
          fmt.Printf("\nThere are%d) EC2 Instances running. (%s)\n", len(instances), time.Since(startTime))
          for i, inst := range instances {
            fmt.Printf("\t%d. %s\n", i+1, shortInstanceString(inst))
          }
        }
      } else {
        fmt.Printf("\nError when trying to get Instance Descriptions: %s\n", err)
        fmt.Printf("But (%d) instances should be running for cluster %s - (will notify on Status OK):\n", len(iIds), thisClusterName)
        for i, instId := range iIds {
          fmt.Printf("\t%d. %s\n", i+1, instId)
        }
      }
    } else {
      fmt.Printf("\nError on waiting for instance to start running.\n")
      fmt.Printf("error: %s.\n", err)
    } 
  })

  // TODO: For now we'll just look for 1 instnace. This is the use case here anyway.
  // Maybe launch this from within the OnInstanceRunning callback?
  if iIds[0] != nil {
    waitForId := *iIds[0]
    fmt.Printf("Will notify when ContainerInstance for EC2 Instance %s is Active.\n", waitForId)
    awslib.OnContainerInstanceActive(thisClusterName, waitForId, svc, func(cis *ecs.ContainerInstance, err error) {
      if err == nil {
        inst, err := awslib.GetInstanceForId(waitForId, ec2Svc)
        if err == nil {
          fmt.Printf("ACTIVE: on cluster %s (%s)\n\tContainerInstance %s\n", thisClusterName, time.Since(startTime), *cis.ContainerInstanceArn)
          fmt.Printf("EC2Instance: %s\n", shortInstanceString(inst))
        } else {
          fmt.Printf("Error getting instance details: %s\n", err)
          fmt.Printf("On cluster %s ContainerInstance %s on EC2 instance %s is now active (%s)\n", thisClusterName, *cis.ContainerInstanceArn, waitForId, time.Since(startTime))
        }
      } else {
        fmt.Printf("Failed on waiting for instance active.\n")
      }
    })
  } 

  // Don't think we need this anymore.
  // awslib.OnInstanceOk(resp, ec2Svc, func(err error) {
  //   if err == nil {
  //     fmt.Printf("Instance Status OK on cluster %s:\n", thisClusterName)
  //     for i, instance := range resp.Instances {
  //       fmt.Printf("\t%d. %s\n", i+1, *instance.InstanceId)
  //     } 
  //   } else {
  //     fmt.Errorf("Failed on waiting for instance to get to OK status - %s", err)
  //   }
  // })

  return nil
}

func shortInstanceString(inst *ec2.Instance) (s string) {
  if inst != nil {
    s += fmt.Sprintf("%s %s in %s", *inst.InstanceId, *inst.InstanceType, *inst.Placement.AvailabilityZone)
    if inst.PublicIpAddress != nil {
      s += fmt.Sprintf(" - %s", *inst.PublicIpAddress)
    }
    } else {
      s += "<nil>"
    }
  return s
}

func doTerminateContainerInstance(svc *ecs.ECS, ec2Svc *ec2.EC2) (error) {
  resp, err := awslib.TerminateContainerInstance(interClusterName, interContainerArn, svc, ec2Svc)
  if err != nil {
    return err
  }
  termInstances := resp.TerminatingInstances
  if len(termInstances) > 1 {
    fmt.Printf("Got (%d) instances terminating, expecting only 1.", len(resp.TerminatingInstances))
  }
  fmt.Printf("Terminated container instance \n\t%s\n", interContainerArn)
  fmt.Printf("Terminating (%d) EC2 Instances:\n", len(termInstances))
  for i, ti := range termInstances {
    fmt.Printf("%d. %s going from %s (%d) => %s (%d)\n", i+1, *ti.InstanceId, *ti.PreviousState.Name, *ti.PreviousState.Code, *ti.CurrentState.Name, *ti.CurrentState.Code)
  }

  instanceToWatch := resp.TerminatingInstances[0].InstanceId
  awslib.OnInstanceTerminated(instanceToWatch, ec2Svc, func(err error) {
    if err == nil {
      fmt.Printf("EC2 Instance Termianted: %s.\n", *instanceToWatch)
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

func ContainerTaskMapToString(ctMap awslib.ContainerTaskMap) (s string) {
  for _, ct := range ctMap {
    tString := ""
    s += "===============================\n"
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
  s += fmt.Sprintf("Container Instance ARN: %s\n", *task.ContainerInstanceArn)

  if len(task.Containers) > 1 {
    s += fmt.Sprintf("There are (%d) associated containers.\n", len(task.Containers))
  }
  for _, container := range task.Containers {
    s += fmt.Sprintf("* Container Name: %s\n", *container.Name)
    s += fmt.Sprintf("Container Arn: %s\n", *container.ContainerArn)
    containerReason := "<empty>"
    if container.Reason != nil {containerReason = *container.Reason}
    s += fmt.Sprintf("Reason: %s\n", containerReason)
    s += fmt.Sprintf("Last Status: %s\n", *container.LastStatus)
    if container.ExitCode != nil {
      s += fmt.Sprintf("Exit Code: %d\n", *container.ExitCode)
    } else {
      s += fmt.Sprintf("Exit Code: %s\n", "<empty>")
      }
    s += fmt.Sprintf("Container Network Bindings:\n")
    for j, network := range container.NetworkBindings {
      s +=  fmt.Sprintf("\t%d. IP: %s", j+1, *network.BindIP)
      s += fmt.Sprintf(" Conatiner Port: %d -> Host Port: %d", *network.ContainerPort, *network.HostPort)
      s += fmt.Sprintf("  (%s)\n", *network.Protocol)
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
  containerEnvMap := make(awslib.ContainerEnvironmentMap)
  if len(taskEnv) > 0 {
    taskDef, err  := awslib.GetTaskDefinition(interTaskDefinitionArn, svc)
    if err != nil {
      return err
    }
    containerDefs := taskDef.ContainerDefinitions
    containerNames := make([]string, len(containerDefs))
    for _, containerDef := range containerDefs {
      containerNames = append(containerNames, *containerDef.Name)
      containerEnvMap[*containerDef.Name] = taskEnv
    }
    if len(containerDefs) > 1 {
      fmt.Printf("There were (%d) containers in this task. Environment setting on a per container basis not currently supported. Environment sent to all containers.")
    }
  }

  runTaskOut, err := awslib.RunTaskWithEnv(interClusterName, interTaskDefinitionArn, containerEnvMap, svc)
  if err == nil {
    printTaskDescription(runTaskOut.Tasks, runTaskOut.Failures)
    if len(runTaskOut.Tasks) > 0 {
      taskToWaitOn := *runTaskOut.Tasks[0].TaskArn
      awslib.OnTaskRunning(interClusterName, taskToWaitOn, svc, func(taskDescrip *ecs.DescribeTasksOutput, err error) {
        if err == nil {
          fmt.Printf("Task is now running on cluster %s.\n", interClusterName)
          printTaskDescription(taskDescrip.Tasks, taskDescrip.Failures)
          fmt.Printf("%s.\n", containerEnvironmentsString(&containerEnvMap))
        } else {
          fmt.Printf("Problem waiting for task: %s on cluster %s to start.\n", taskToWaitOn, interClusterName)
          fmt.Printf("Error: %s.\n", err)
        }
      })
    }
  }
  return err
}

func printTaskDescription(tasks []*ecs.Task, failures []*ecs.Failure) {
  fmt.Printf("There are (%d) failures.\n", len(failures))
  for i, failure := range failures {
    fmt.Printf("%d: %s.\n", i+1, failure)
  }
  fmt.Printf("There are (%d) tasks.\n", len(tasks))
  for i, task := range tasks {
    fmt.Printf("%d: %s.\n", i+1, shortTaskString(task))
  }
}

func shortTaskString(task *ecs.Task) (s string) {
  s += fmt.Sprintf("%s - %s.\n", *task.TaskArn, *task.LastStatus)
  containers := task.Containers
  switch {
  case len(containers) == 1:
    s += shortContainerString(containers[0])
  case len(containers ) >1:
    s += fmt.Sprintf("There were (%d) containers for this task.", len(containers))
    for i, c := range containers {
      s += fmt.Sprintf("%d. %s\n", i+1, shortContainerString(c))
    }
  case len(containers) <= 0:
    s += "There were NO contianers attached to this task!"
  }
  return s
}

func shortContainerString(container *ecs.Container) (s string) {
  s += fmt.Sprintf("%s - %s.", *container.Name, *container.LastStatus)
  bindings := container.NetworkBindings
  switch {
  case len(bindings) == 1:
    s += fmt.Sprintf(" %s", bindingString(bindings[0]))
  case len(bindings) >1:
    s += "\n"
    for i, bind := range bindings {
      fmt.Sprintf("\t%d. %s", i+1, bindingString(bind))
    }
  case len(bindings) <= 0:
    s += "\n"
  }

  return s
}

func bindingString(bind *ecs.NetworkBinding) (s string) {
  s += fmt.Sprintf("%s - container: %d -> host: %d (%s)", *bind.BindIP, *bind.ContainerPort, *bind.HostPort, *bind.Protocol)
  return s
}

func doStopTask(svc *ecs.ECS) (error) {
  fmt.Printf("Stopping the task: %s.\n", interTaskArn)
  resp, err := awslib.StopTask(interClusterName, interTaskArn, svc)
  if err == nil {
    fmt.Println("This task is scheduled to stop.")
    fmt.Printf("%s\n", ContainerTaskDescriptionToString(resp.Task))
    awslib.OnTaskStopped(interClusterName, interTaskArn, svc, func(dto *ecs.DescribeTasksOutput, err error){
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

func containerEnvironmentsString(cenvs *awslib.ContainerEnvironmentMap) (s string) {
  if cenvs == nil { return s }
  for cName, cEnv := range *cenvs {
    if len(cEnv) > 0 {
      s += fmt.Sprintf("Container %s environment: ", cName)
      for key, value := range cEnv {
        s += fmt.Sprintf(" %s=%s", key, value)
      }
    }
  }
  return s
}
//
// Interpreter upport functions.
//

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
    logging.SetLevel(logging.DEBUG,"")
  } else {
    fmt.Println("Verbose is off.")
    logging.SetLevel(logging.ERROR,"")
  }
  return nil
}

func doQuit(ecsSvc *ecs.ECS) (error) {
  clusters, err := awslib.GetAllClusterDescriptions(ecsSvc)
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

func clusterShortString(c *ecs.Cluster) (s string) {
  s += fmt.Sprintf("%s has %d instances with %d running and %d pending tasks.", *c.ClusterName, 
    *c.RegisteredContainerInstancesCount, *c.RunningTasksCount, *c.PendingTasksCount)
  return s
}

// This gets called from the main program, presumably from the 'interactive' command on main's command line.
func DoInteractive(defaultConfig *aws.Config) {
  awsSession := session.New(defaultConfig)
  ecs_svc := ecs.New(awsSession)
  ec2_svc := ec2.New(awsSession)
  xICommand := func(line string) (err error) {return doICommand(line, ecs_svc, ec2_svc, defaultConfig)}
  prompt := "> "
  err := promptLoop(prompt, xICommand)
  if err != nil {fmt.Printf("Error - %s.\n", err)}
}

