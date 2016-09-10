package interactive

import (
  "fmt"
  "os"
  "time"
  "text/tabwriter"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/ecs"


  // THIS WILL UNDOUBTADLY CAUSE PROBLEMS
  // "awslib"
  "github.com/jdrivas/awslib"
)

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

func doListClusters(sess *session.Session) (error) {
  clusters,  err := awslib.GetAllClusterDescriptions(sess)
  if err != nil {
    return err
  }

  fmt.Printf("%s%s: there are %d clusters.%s\n", 
  emphColor, time.Now().Local().Format(humanTimeFormat), len(clusters), resetColor)
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

  // for i, cluster := range clusters {
  //   w
  //   fmt.Printf("%d. %s\n", i+1, clusterShortString(cluster))
  //   fmt.Printf("   %s\n", *cluster.ClusterArn)

  // }
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