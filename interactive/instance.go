package interactive

import (
  "fmt"
  "time"
  "github.com/aws/aws-sdk-go/aws"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/ecs"
  "github.com/aws/aws-sdk-go/service/ec2"

  // THIS WILL UNDOUBTADLY CAUSE PROBLEMS
  // "awslib"
  "github.com/jdrivas/awslib"

)

func doListContainerInstances(sess *session.Session) (error) {
  instanceArns, err := awslib.GetContainerInstances(interClusterName, sess)
  if err != nil {
    return err
  }

  fmt.Printf("%d instances for cluster \"%s\"\n", len(instanceArns), interClusterName)
  for i, instance := range instanceArns {
    fmt.Printf("%d: %s\n", i+1, *instance)
  }

  return nil
}

func doDescribeContainerInstance(sess *session.Session) (error) {
  ciMap, err := awslib.GetContainerInstanceDescription(interClusterName, interContainerArn, sess)
  if err == nil {
    ec2InstanceMap, err := awslib.DescribeEC2Instances(ciMap, sess)
    if err != nil {
      fmt.Printf("%s\n", ContainerInstanceMapToString(ciMap, map[string]*ec2.Instance{}))
      return err
    }
    fmt.Printf("%s\n", ContainerInstanceMapToString(ciMap, ec2InstanceMap))
  }
  return err
}

func doDescribeAllContainerInstances(sess *session.Session) (error) {
  ciMap, err := awslib.GetAllContainerInstanceDescriptions(interClusterName, sess)
  if err == nil {
    if len(ciMap) <= 0 {
      fmt.Printf("There are no containers for: %s.\n", interClusterName)
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
  thisClusterName := interClusterName // TODO: Check if this is a copying the string over for the OnWait routines below.
  nameTag := fmt.Sprintf("%s - ecs instance", interClusterName)
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
  awslib.OnInstanceRunning(resp, sess, func(err error) { 
    if err == nil {
      instances, err := awslib.GetInstancesForIds(iIds, sess)
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
    awslib.OnContainerInstanceActive(thisClusterName, waitForId, sess, func(cis *ecs.ContainerInstance, err error) {
      if err == nil {
        inst, err := awslib.GetInstanceForId(waitForId, sess)
        if err == nil {
          fmt.Printf("\nACTIVE: on cluster %s (%s)\n\tContainerInstance %s\n", thisClusterName, time.Since(startTime), *cis.ContainerInstanceArn)
          fmt.Printf("EC2Instance: %s\n", shortInstanceString(inst))
        } else {
          fmt.Printf("\nError getting instance details: %s\n", err)
          fmt.Printf("On cluster %s ContainerInstance %s on EC2 instance %s is now active (%s)\n", thisClusterName, *cis.ContainerInstanceArn, waitForId, time.Since(startTime))
        }
      } else {
        log.Errorf("\nFailed on waiting for instance active: %s", err)
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