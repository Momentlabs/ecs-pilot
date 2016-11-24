package interactive

import (
  "fmt"
  "os"
  "time"
  "text/tabwriter"
  "github.com/aws/aws-sdk-go/aws"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/ecs"
  "github.com/aws/aws-sdk-go/service/ec2"
  // "github.com/Sirupsen/logrus"


  // THIS WILL UNDOUBTADLY CAUSE PROBLEMS
  // "awslib"
  "github.com/jdrivas/awslib"
)

func doListContainerInstances(sess *session.Session) (error) {
  ciMap, ecMap, err := awslib.GetContainerMaps(currentCluster, sess)
  if err != nil {return fmt.Errorf("Can't get container instances for %s: %s", currentCluster, err)}

  instanceNoun := "instances"
  if len(ciMap) == 1 { instanceNoun = "instance"}
  fmt.Printf("%s%s %s: %d %s.%s\n", 
    emphColor, time.Now().Local().Format(humanTimeFormat), currentCluster, len(ciMap), instanceNoun, resetColor)
  w := tabwriter.NewWriter(os.Stdout, 4, 2, 2, ' ', 0)
  fmt.Fprintf(w, "%sPublic Address\tInteral Address\tType\tActive\tUptime\tA-CPU\tR-CPU\tA-Mem\tR-Mem\tEC2ID\tARN%s\n", 
    titleColor, resetColor)
  for ciArn, awslibCi := range ciMap {
    ci := awslibCi.Instance
    ecI := ecMap[*ci.Ec2InstanceId]
    if ecI == nil {return fmt.Errorf("Got a nil address for the EC2 Instance.\n")}
    addr := "unassigned"
    if ecI.PublicIpAddress != nil { addr = *ecI.PublicIpAddress }
    iaddr := "unassigned"
    if ecI.PrivateIpAddress != nil { iaddr = *ecI.PrivateIpAddress }
    iType := "unknown"
    aCpu := getCpu(ci.RegisteredResources)
    rCpu := getCpu(ci.RemainingResources)
    aMem := getMemory(ci.RegisteredResources)
    rMem :=getMemory(ci.RemainingResources)
    uptime := shortDurationString(time.Since(*ecI.LaunchTime))

    eColor := nullColor
    if *ci.Status == "INACTIVE" {
      eColor = failColor
    } else {
      if rCpu < 200 {eColor = warnColor}
      if rMem < 512 {eColor = warnColor}
    }
    if ecI.InstanceType != nil {iType = *ecI.InstanceType}
    fmt.Fprintf(w, "%s%s\t%s\t%s\t%s\t%s\t%d\t%d\t%d\t%d\t%s\t%s%s\n", eColor,
      addr, iaddr, iType, *ci.Status, uptime, aCpu, rCpu, aMem, rMem, 
      *ci.Ec2InstanceId, awslib.ShortArnString(&ciArn),resetColor) 
  }
  w.Flush()

  return nil
}

func doDescribeContainerInstance(sess *session.Session) (error) {
  ciArn, err := awslib.LongArnString(interContainerArn, awslib.ContainerInstanceType, sess)
  if err != nil { return fmt.Errorf("Failed to get long arn from short arn (%s): %s", interContainerArn)}
  ciMap, err := awslib.GetContainerInstanceDescription(currentCluster, ciArn, sess)
  if err != nil {return fmt.Errorf("Error getting Container Instance description for %s: %s", ciArn, err)}

  ec2InstanceMap, err := awslib.DescribeEC2Instances(ciMap, sess)
  if err != nil { 
    fmt.Printf("%sError getting EC2 Instance data: %s%s", failColor, err, resetColor)
    ec2InstanceMap = map[string]*ec2.Instance{}
  }

  fmt.Printf("%s\n", ContainerInstanceMapToString(ciMap, ec2InstanceMap))
  return err
}

func doDescribeAllContainerInstances(sess *session.Session) (error) {
  ciMap, err := awslib.GetAllContainerInstanceDescriptions(currentCluster, sess)
  if err == nil {
    if len(ciMap) <= 0 {
      fmt.Printf("There are no containers for: %s.\n", currentCluster)
    } else {
      ec2InstanceMap, err := awslib.DescribeEC2Instances(ciMap, sess)
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
      s += fmt.Sprintf("\n+#v", *ci.Failure)
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
  s += fmt.Sprintf("%sKey Name: %s\n,", indent, *instance.KeyName)
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

func getCpu(resources []*ecs.Resource) (cpu int64) {
  for _, r := range resources {
    if *r.Name == "CPU" {
      cpu = *r.IntegerValue
      break
    }
  }
  return cpu
}

func getMemory(resources []*ecs.Resource) (mem int64) {
  for _, r := range resources {
    if *r.Name == "MEMORY" {
      mem = *r.IntegerValue
      break
    }
  }
  return mem
}

// TODO: Move this to the awslib functions.
// getValueString etc.
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

func doCreateContainerInstance(sess *session.Session) (error) {
  thisClusterName := currentCluster // TODO: Check if this is a copying the string over for the OnWait routines below.
  nameTag := fmt.Sprintf("%s - ecs instance", currentCluster)
  tags := []*ec2.Tag{
    {
      Key: aws.String("Name"),
      Value: aws.String(nameTag),
    },
  }
  resp, err := awslib.LaunchInstanceWithTags(thisClusterName, tags, sess)
  if err != nil {
    return err
  }

  if len(resp.Instances) == 1 {
    inst := resp.Instances[0]
    fmt.Printf("%sOn cluster %s launched instance: %s", successColor, thisClusterName, resetColor)
    if verbose {
      fmt.Printf("%#v\n", inst)
    } else {
      fmt.Printf("%s\n", shortInstanceString(inst))
    }
  } else {
    fmt.Printf("%sLaunched (%d) EC2Instances:%s\n", warnColor, len(resp.Instances), resetColor)
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
  awslib.OnInstanceRunning(resp, sess, func(err error) { 
    if err == nil {
      instances, err := awslib.GetInstancesForIds(iIds, sess)
      if err == nil {
        if len(instances) == 1 {
          fmt.Printf("\n%sEC2 Instance running (%s): %s%s\n", infoColor, time.Since(startTime), shortInstanceString(instances[0]), resetColor)
        } else {
          fmt.Printf("\nThere are%d) EC2 Instances running. (%s)\n", len(instances), time.Since(startTime))
          for i, inst := range instances {
            fmt.Printf("\t%d. %s\n", i+1, shortInstanceString(inst))
          }
        }
      } else {
        fmt.Printf("\n%sError when trying to get Instance Descriptions: %s%sn", failColor, err, resetColor)
        fmt.Printf("But (%d) instances should be running for cluster %s - (will notify on Status OK):\n", len(iIds), thisClusterName)
        for i, instId := range iIds {
          fmt.Printf("\t%d. %s\n", i+1, instId)
        }
      }
    } else {
      fmt.Printf("\n%sError on waiting for instance to start running.%s\n", failColor, resetColor)
      fmt.Printf("error: %s.\n", err)
    } 
  })

  // TODO: For now we'll just look for 1 instnace. This is the use case here anyway.
  // Maybe launch this from within the OnInstanceRunning callback?
  if iIds[0] != nil {
    waitForId := *iIds[0]
    fmt.Printf("Will notify when ContainerInstance for EC2 Instance %s is Active.\n", waitForId)
    awslib.OnContainerInstanceActive(thisClusterName, waitForId, sess, func(cis *ecs.ContainerInstance, err error) {
      if err == nil {
        inst, err := awslib.GetInstanceForId(waitForId, sess)
        if err == nil {
          fmt.Printf("\n%sACTIVE: on cluster %s (%s)%s\n\tContainerInstance %s\n", 
            successColor, thisClusterName, time.Since(startTime), resetColor, *cis.ContainerInstanceArn)
          fmt.Printf("\tEC2Instance: %s\n", shortInstanceString(inst))
        } else {
          fmt.Printf("\n%sError getting instance details: %s%s\n", failColor, err, resetColor)
          fmt.Printf("On cluster %s ContainerInstance %s on EC2 instance %s is now active (%s)\n", thisClusterName, *cis.ContainerInstanceArn, waitForId, time.Since(startTime))
        }
      } else {
        log.Error(nil, "Failed on waiting for instance active.", err)
      }
    })
  } 

  return nil
}

func shortInstanceString(inst *ec2.Instance) (s string) {
  if inst != nil {
    s += fmt.Sprintf("%s %s in %s", *inst.InstanceId, 
      *inst.InstanceType, *inst.Placement.AvailabilityZone)
    if inst.PublicIpAddress != nil {
      s += fmt.Sprintf(" - %s", *inst.PublicIpAddress)
    }
    } else {
      s += "<nil>"
    }
  return s
}

func doTerminateContainerInstance(sess *session.Session) (error) {

  ciArn, err := awslib.LongArnString(interContainerArn, awslib.ContainerInstanceType, sess)
  if err != nil { return err }
  resp, err := awslib.TerminateContainerInstance(currentCluster, ciArn, sess)
  if err != nil { return err }

  termInstances := resp.TerminatingInstances
  if len(termInstances) > 1 {
    fmt.Printf("%sGot (%d) instances terminating, expecting only 1.%s\nn", 
      warnColor, len(resp.TerminatingInstances), resetColor)
  }
  fmt.Printf("%sTerminated container instance \n\t%s%s\n", warnColor, interContainerArn, resetColor)
  fmt.Printf("Terminating (%d) EC2 Instances:\n", len(termInstances))
  for i, ti := range termInstances {
    fmt.Printf("%d. %s going from %s (%d) => %s (%d)\n", i+1, 
      *ti.InstanceId, *ti.PreviousState.Name, *ti.PreviousState.Code, 
      *ti.CurrentState.Name, *ti.CurrentState.Code)
  }

  instanceToWatch := resp.TerminatingInstances[0].InstanceId
  awslib.OnInstanceTerminated(instanceToWatch, sess, func(err error) {
    if err == nil {
      fmt.Printf("%sEC2 Instance Termianted: %s.%s\n", warnColor, *instanceToWatch, resetColor)
    } else {
      fmt.Printf("%sError on waiting for instance to terminate.%s\n", failColor, resetColor)
      fmt.Printf("error: %s.\n", err)
    }
  })
  return err
}