package interactive

import (
  "fmt"
  "os"
  // "strings"
  "time"
  "text/tabwriter"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/ecs"


  // THIS WILL UNDOUBTADLY CAUSE PROBLEMS
  // "awslib"
  "github.com/jdrivas/awslib"
)

type ClusterCache map[string]bool

var cCache = make(ClusterCache,0)

func (cc *ClusterCache) update(sess *session.Session) (error) {
  clusterArns, err := awslib.GetClusters(sess)
  if err != nil { return err }

  cc.empty()
  for _, a := range clusterArns {
    n := awslib.ShortArnString(a)
    (*cc)[n] = true
  }
  return err
}

func (cc *ClusterCache) empty() {
  for k, _ := range *cc {
    delete(*cc,k)
  }
}

func (cc *ClusterCache) contains(v string, sess *session.Session) (contains bool, err error) {
  if (*cc)[v] { return true, nil }

  err = cc.update(sess)
  if err != nil { return false, err }

  if (*cc)[v] { return true, nil }
  return false, nil
}

func doCreateCluster(sess *session.Session) (error) {
  dup, err := cCache.contains(currentCluster, sess);
  if err != nil { return err }
  if !dup {
    return fmt.Errorf("Duplicate cluster: %s already exists.", currentCluster)
  }

  cluster, err := awslib.CreateCluster(currentCluster, sess)
  if err == nil {
    cCache.update(sess)
    printCluster(cluster)
  }
  return err
}

func doDeleteCluster(sess *session.Session) (error) {
  cluster, err := awslib.DeleteCluster(currentCluster, sess)
  if err == nil {
    cCache.update(sess)
    printCluster(cluster)
  }
  return err
}

func doListClusters(sess *session.Session) (error) {
  clusters,  err := awslib.GetAllClusterDescriptions(sess)
  if err != nil {
    return err
  }

  fmt.Printf("%s%s: there are %d clusters.%s\n", titleColor, 
    time.Now().Local().Format(humanTimeFormat), len(clusters), resetColor)
  w := tabwriter.NewWriter(os.Stdout, 4, 10, 2, ' ', 0)
  fmt.Fprintf(w, "%sName\tStatus\tInstances\tPending\tRunning%s\n", titleColor, resetColor)
  for _, c := range clusters {
    instanceCount := *c.RegisteredContainerInstancesCount
    color := nullColor
    if instanceCount > 0 {color = successColor}
    fmt.Fprintf(w, "%s%s\t%s\t%d\t%d\t%d%s\n", color, *c.ClusterName, *c.Status, 
      instanceCount, *c.PendingTasksCount, *c.RunningTasksCount, resetColor)
  }      
  w.Flush()
  return nil
}

func doDescribeCluster(sess *session.Session) (error) {

  cimap, _, err := awslib.GetContainerMaps(currentCluster, sess)
  if err != nil { return err }
  if len(cimap) == 0 {
    fmt.Printf("%sThis cluster has no instances attached to it.%s\n", warnColor, resetColor)
    return nil
  }

  totals := cimap.Totals()

  fmt.Printf("%s%s%s\n", titleColor, time.Now().Local().Format(time.RFC1123), resetColor)

  fmt.Printf("\n%sCluster \"%s\" stats:%s\n", titleColor, currentCluster , resetColor)
  w := tabwriter.NewWriter(os.Stdout, 4, 10, 2, ' ', 0)
  fmt.Fprintf(w,"%sInst\tTasks Running\tTasks Pending\tCPU-A\tCPU-R\tMEM-A\tMEM-R%s\n", titleColor, resetColor)
  fmt.Fprintf(w,"%s%d\t%d\t%d\t%s\t%s\t%s\t%s%s\n", nullColor,
    cimap.InstanceCount(), totals.RunningTasks, totals.PendingTasks,
    totals.Remaining.StringFor(awslib.CPU), totals.Registered.StringFor(awslib.CPU),
    totals.Remaining.StringFor(awslib.MEMORY), totals.Registered.StringFor(awslib.MEMORY),
    resetColor)
  w.Flush()

  imap, err := awslib.DescribeEC2Instances(cimap, sess)
  if err != nil { return err }

  fmt.Printf("%s\nContainer Instance Stats:%s\n", titleColor, resetColor)
  w = tabwriter.NewWriter(os.Stdout, 4, 10, 2, ' ', 0)
  fmt.Fprintf(w,"%sPublic Address\tAgent\tUptime\tTasks\tCPU-A\tCPU-R\tMEM-A\tMEM-R\tARN%s\n", titleColor, resetColor)
  for arn, ci := range cimap {
    ec2I := imap[*ci.Instance.Ec2InstanceId]
    i := ci.Instance
    uptime := "<none>"
    if ec2I.LaunchTime != nil {
      uptime = awslib.ShortDurationString(time.Since(*ec2I.LaunchTime))
    }
    tasks := *i.RunningTasksCount + *i.PendingTasksCount
    fmt.Fprintf(w,"%s%s\t%t\t%s\t%d\t%s\t%s\t%s\t%s\t%s%s\n", nullColor,
      *ec2I.PublicIpAddress, *i.AgentConnected, uptime, tasks, 
      ci.RemainingResources().StringFor(awslib.CPU), ci.RegisteredResources().StringFor(awslib.CPU),
      ci.RemainingResources().StringFor(awslib.MEMORY), ci.RegisteredResources().StringFor(awslib.MEMORY),
      awslib.ShortArnString(&arn), resetColor)
  }
  w.Flush()

  fmt.Printf("%s\nEC2 Instance Stats:%s\n", titleColor, resetColor)
  w = tabwriter.NewWriter(os.Stdout, 4, 10, 2, ' ', 0)
  fmt.Fprintf(w,"%sInstance ID\tType\tImage Arch\tImageID\tPublic IP\tPrivate IP\tVPC\tSubnet\tIAM Profile\tKeyName%s\n", titleColor, resetColor)
  for ec2id, ec2I := range imap {
    iamProfile  := awslib.ShortArnString(ec2I.IamInstanceProfile.Arn)
    fmt.Fprintf(w, "%s%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s%s\n", nullColor,
      ec2id, *ec2I.InstanceType, *ec2I.Architecture, *ec2I.ImageId, 
      *ec2I.PublicIpAddress, *ec2I.PrivateIpAddress, *ec2I.VpcId, 
      *ec2I.SubnetId, iamProfile, *ec2I.KeyName, resetColor)
  }
  w.Flush()

  fmt.Printf("%s\nEC2 Instance Security Groups:%s\n", titleColor, resetColor)  
  for ec2id, ec2I := range imap {
    fmt.Printf("%s\nInstance: %s: %s%s\n", titleColor, ec2id, *ec2I.PublicIpAddress, resetColor)
      for _, sgId := range ec2I.SecurityGroups {
        sg, err := awslib.DescribeSecurityGroup(*sgId.GroupId, sess)
        if err != nil {
          fmt.Printf("Error getting security group: %s", err)
          break
        }
        w = tabwriter.NewWriter(os.Stdout, 4, 10, 2, ' ', 0)
        fmt.Fprintf(w,"%sGroup ID\tGroup Name\tDescription\tVpcId%s\n",titleColor, resetColor)
        fmt.Fprintf(w, "%s%s\t%s\t%s\t%s%s\n", nullColor, *sg.GroupId, *sg.GroupName, *sg.Description, *sg.VpcId, resetColor)
        w.Flush()

        fmt.Printf("%sInbound Permisions%s\n", titleColor, resetColor)
        w = tabwriter.NewWriter(os.Stdout, 4, 10, 2, ' ', 0)
        fmt.Fprintf(w, "%sProto\tPorts\tRanges\tSGroups\tPrefixes%s\n", titleColor, resetColor)
        for _, ipp := range sg.IpPermissions {
          proto, ports, sGroups, ipRanges, prefixes := awslib.IpPermissionStrings(ipp)
          fmt.Fprintf(w,"%s%s\t%s\t%s\t%s\t%s%s\n", nullColor,
            proto, ports, ipRanges, sGroups, prefixes, resetColor)
        }
        w.Flush()        

        fmt.Printf("%sOutbound Permisions%s\n", titleColor, resetColor)
        w = tabwriter.NewWriter(os.Stdout, 4, 10, 2, ' ', 0)
        fmt.Fprintf(w, "%sProto\tPorts\tRanges\tSGroups\tPrefixes%s\n", titleColor, resetColor)
        for _, ipp := range sg.IpPermissionsEgress {
          proto, ports, sGroups, ipRanges, prefixes := awslib.IpPermissionStrings(ipp)
          fmt.Fprintf(w,"%s%s\t%s\t%s\t%s\t%s%s\n", nullColor, 
            proto, ports, ipRanges, sGroups, prefixes, resetColor)
        }
        w.Flush()
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

func clusterShortString(c *ecs.Cluster) (s string) {
  h := ""
  r := ""
  if *c.RegisteredContainerInstancesCount > 0  {  
    h = successColor
    r = resetColor
  }
  s += fmt.Sprintf("%s%s%s has %s%d%s instances with %s%d%s running and %d pending tasks.", h, *c.ClusterName, r,
    h, *c.RegisteredContainerInstancesCount,r, h,*c.RunningTasksCount,r, *c.PendingTasksCount)
  return s
}