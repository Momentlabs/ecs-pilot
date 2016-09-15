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
  cluster, err := awslib.CreateCluster(currentCluster, svc)
  if err == nil {
    printCluster(cluster)
  }
  return err
}

func doDeleteCluster(svc *ecs.ECS) (error) {
  cluster, err := awslib.DeleteCluster(currentCluster, svc)
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

  // for i, cluster := range clusters {
  //   w
  //   fmt.Printf("%d. %s\n", i+1, clusterShortString(cluster))
  //   fmt.Printf("   %s\n", *cluster.ClusterArn)

  // }
  return nil
}

func doDescribeCluster(sess *session.Session) (error) {
  // ecsSvc := ecs.New(sess)
  // cs, err := awslib.DescribeCluster(currentCluster, ecsSvc)
  // if err != nil { return err }

  // dtm, err := awslib.GetDeepTasks(currentCluster, sess)
  // if err != nil { return err }

  // w := tabwriter.NewWriter(os.Stdout, 4, 10, 2, ' ', 0)
  // fmt.Fprintf(w, "%sName\tStatus\tInstances\tPending\tRunning%s\n", titleColor, resetColor)
  // ic := len(cs)
  // color := nullColor
  // if ic > 0 {color = successColor}
  // fmt.Fprintf(w, "%s%s\t%s\t%d\t%d\t%d%s\n", color, *c.ClusterName, *c.Status, 
  //   instanceCount, *c.PendingTasksCount, *c.RunningTasksCount, resetColor)
  // w.Flush()

  cimap, _, err := awslib.GetContainerMaps(currentCluster, sess)
  if err != nil { return err }

  totals := cimap.Totals()
  w := tabwriter.NewWriter(os.Stdout, 4, 10, 2, ' ', 0)
  fmt.Fprintf(w,"%s%s: Total Resources: %s%s\n", titleColor, 
    time.Now().Local().Format(time.RFC1123), currentCluster,
    resetColor)
  fmt.Fprintf(w,"%sInst\tTask-R\tTask-P\tCPU-A\tCPU-R\tMEM-A\tMEM-R%s\n", titleColor, resetColor)
  fmt.Fprintf(w,"%s%d\t%d\t%d\t%s\t%s\t%s\t%s%s\n", nullColor,
    cimap.InstanceCount(), totals.RunningTasks, totals.PendingTasks,
    totals.Registered.StringFor("CPU"), totals.Remaining.StringFor("CPU"),
    totals.Registered.StringFor("MEMORY"), totals.Remaining.StringFor("MEMORY"),
    resetColor)
  w.Flush()

  w = tabwriter.NewWriter(os.Stdout, 4, 10, 2, ' ', 0)
  fmt.Fprintf(w,"%sAddress\tType\tUptime\tTasks\tCPU-A\tCPU-R\tMEM-A\t-MEM-R%s\n", titleColor, resetColor)
  w.Flush()  



  // clusters, err := awslib.DescribeCluster(currentCluster, svc)
  // if err == nil  {
  //   if len(clusters) <= 0 {
  //     fmt.Printf("Couldn't get any clusters for %s.\n", currentCluster)
  //   } else {
  //     printCluster(clusters[0])
  //   }
  // }
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