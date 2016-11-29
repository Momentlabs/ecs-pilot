package interactive

import(

  "fmt"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/ecs"
  // "io"
  "os"
  
  // "strings"
  "text/tabwriter"
  "time"

  // "awslib"
  "github.com/jdrivas/awslib"
)

func doListServices(clusterName string, sess *session.Session) (err error) {

  services, failures, err := awslib.DescribeServices(clusterName, sess)
  if len(failures) > 0 {
    fmt.Printf("%sFailures in listing services.%s\n", failColor, resetColor)
    printFailures(failures)
  }

  if err == nil {
    if len(services) == 0 {
      fmt.Printf("%sThere are no services on this cluster.%s\n", warnColor, resetColor)
    } else {
      printShortServices(services);
    }
  }

  return err
}

func doDescribeService(serviceName, clusterName string, sess *session.Session) (err error) {

  s, failures, err := awslib.DescribeService(serviceName, clusterName, sess)

  if len(failures) > 0 {
    fmt.Printf("%sFailures in describing service.%s\n", failColor, resetColor)
    printFailures(failures)
  }

  if err == nil {
    fmt.Printf("%sService ARN: %s, TaskDefinitinArn: %s%s\n", 
      titleColor, *s.ServiceArn, *s.TaskDefinition, resetColor)
    printService(s)
  }
  return err
}

func doCreateService(serviceName, taskDefinitionArn, clusterName string, 
  instanceCount int64, sess *session.Session) (error) {

  service, err := awslib.CreateService(serviceName, clusterName, taskDefinitionArn, instanceCount, sess)
  if err == nil {
    fmt.Printf("%sCreated Service: %s\n", successColor, resetColor)
    // fmt.Printf("%s%#v%s\n", titleColor, *service, resetColor)
    printService(service)
    fmt.Printf("%sWill notify when the service is stable.%s\n", infoColor, resetColor)
    awslib.OnServiceStable(serviceName, clusterName, sess, func(error) {
      if err == nil {
        fmt.Printf("\n%sService is now stable: %s on cluster %s%s\n", successColor, serviceName, clusterName, resetColor)
        s, _, err := awslib.DescribeService(serviceName, clusterName, sess)
        if err != nil { printService(s) }
      } else {
        fmt.Printf("\n%sError waiting for service to stabilize: %s on cluster %s: %s%s\n", 
          failColor, serviceName, clusterName, err, resetColor)
      }
    })
  } else {
    err = fmt.Errorf("%sFailed to create service: %s on cluster %s with TaskDefinition %s: %s%s\n", 
      failColor, serviceName, clusterName, taskDefinitionArn, err, resetColor)
  }

  return err
}

func doUpdateServiceDesiredCount(serviceName, clusterName string, instanceCount int64, sess *session.Session) (error) {
  s, err := awslib.UpdateServiceDesiredCount(serviceName, clusterName, instanceCount, sess)

  if err == nil {
    printService(s)
    fmt.Printf("%sDesired instance count updated for %s on cluster %s.%s\n", successColor, serviceName, clusterName, resetColor)
  }
  return err
}

func doRestartService(serviceName, clusterName string, sess *session.Session) (error) {

  start := time.Now()
  err := awslib.RestartService(serviceName, clusterName, sess, func(s *ecs.Service, err error) {
    if err == nil {
      fmt.Printf("\n%s%sService restarted (%s): %s on cluster %s%s\n", 
        successColor, nowString(), shortDurationString(time.Since(start)), serviceName, clusterName, resetColor)
      fmt.Printf("%sWill update when service is stable.%s\n", infoColor, resetColor)
      awslib.OnServiceStable(serviceName, clusterName, sess, func(err error){
        if err == nil {
          fmt.Printf("\n%s%sService is now stable (%s): %s on cluster %s%s\n", 
            successColor, nowString(), shortDurationString(time.Since(start)), serviceName, clusterName, resetColor)
          s, failures, err :=  awslib.DescribeService(serviceName, clusterName, sess)
          if len(failures) > 0 { printFailures(failures) }
          if err == nil { 
            printShortService(s)
          } else {
            fmt.Printf("%sFailure to get updated Service Description: %s%s\n", failColor, err, resetColor)
          }
        } else {
          fmt.Printf("\n%sError waiting for service to become stable after restart: %s on cluster %s: %s%s\n",
            failColor, serviceName, clusterName, err, resetColor)
        }
      })
    } else {
      fmt.Printf("%sError on service restart: %s on cluster %s: %s%s\n", 
        failColor, serviceName, clusterName, err, resetColor)
    }
  })

  if err == nil {
    fmt.Printf("%s%sService restarting: %s on cluster %s%s\n", 
      successColor, nowString(), serviceName, clusterName, resetColor)
    fmt.Printf("%sUpdates on progress to follow....%s\n", infoColor, resetColor)
  }

  return err
}

func doDeleteService(serviceName, clusterName string, sess *session.Session) (error) {

  service, err := awslib.DeleteService(serviceName, clusterName, sess)
  if err == nil {
    fmt.Printf("%sDeleted Service: %s\n", successColor, resetColor)
    // fmt.Printf("%s%#v%s\n", titleColor, *service, resetColor)
    printService(service)
    fmt.Printf("%sService deleting. Will update when inactive.%s\n", successColor, resetColor)
    awslib.OnServiceInactive(serviceName, clusterName, sess, func(error) {
      if err == nil {
        fmt.Printf("\n%sService is now Inactive: %s on cluster %s%s\n", successColor, serviceName, clusterName, resetColor)
      } else {
        fmt.Printf("\n%sError waiting for service to become inactive: %s on cluster %s: %s%s\n",
          failColor, serviceName, clusterName, err, resetColor)
      }
    })
  }

  return err
}


func doPrintShortServiceHeader() (w *tabwriter.Writer) {
  w = tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
  fmt.Fprintf(w, "%sName\tCluster\tTaskDefinition\tRole\tStatus\tCreated\tDesired\tRunning\tPending\tMax%%\tMin%%%s\n", titleColor, resetColor)
  return w
}

func doPrintShortService(w *tabwriter.Writer, s *ecs.Service) {
  fmt.Fprintf(w, "%s%s\t%s\t%s\t%s\t%s\t%s\t%d\t%d\t%d\t%d\t%d%s\n", nullColor,
    *s.ServiceName, awslib.ShortArnString(s.ClusterArn), awslib.ShortArnString(s.TaskDefinition), 
    awslib.ShortArnString(s.RoleArn), *s.Status, s.CreatedAt.Local().Format(time.RFC1123), 
    *s.DesiredCount, *s.RunningCount, *s.PendingCount, 
    *s.DeploymentConfiguration.MaximumPercent, *s.DeploymentConfiguration.MinimumHealthyPercent,
    resetColor)
}


func printShortService(s *ecs.Service) {  printShortServices([]*ecs.Service{s}) }
func printShortServices(services []*ecs.Service) {
  w := doPrintShortServiceHeader()
  for _, s := range services {
    doPrintShortService(w, s)
  }
  w.Flush()
}
func printService(s *ecs.Service) {
  w := doPrintShortServiceHeader()
  doPrintShortService(w, s)
  w.Flush()

  // Load Balancers
  fmt.Printf("\n%sLoad Balancers (%d)%s\n", titleColor, len(s.LoadBalancers), resetColor)
  if len(s.LoadBalancers) == 0 {
    fmt.Printf("There were no Load Blancers for this service.\n")
  } else {
    w := tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
    fmt.Fprintf(w, "%sName\tContainer\tPort\tTargetGroup%s\n", titleColor, resetColor)
    for _, lb := range s.LoadBalancers {
      fmt.Fprintf(w,"%s%s\t%s\t%d\t%s%s\n", nullColor,
        *lb.LoadBalancerName, *lb.ContainerName, *lb.ContainerPort, awslib.ShortArnString(lb.TargetGroupArn),
        resetColor)
    }
    w.Flush()
  }

  // Deployments
  fmt.Printf("\n%sDeployments (%d) %s\n", titleColor, len(s.Deployments), resetColor)
  if len(s.Deployments) == 0 {
    fmt.Printf("There are no deployments for this service.\n")
  } else {
    w := tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
    fmt.Fprintf(w, "%sId\tTaskDefinition\tCreated\tUpdate\tStatus\tDesired\tRunning\tPending%s\n", titleColor, resetColor)
    for _, d := range s.Deployments {
      fmt.Fprintf(w, "%s%s\t%s\t%s\t%s\t%s\t%d\t%d\t%d%s\n", nullColor,
        *d.Id, awslib.ShortArnString(d.TaskDefinition), 
        d.CreatedAt.Local().Format(time.RFC1123), d.UpdatedAt.Local().Format(time.RFC1123),
        *d.Status, *d.DesiredCount, *d.RunningCount, *d.PendingCount,
        resetColor)
    }      
    w.Flush()
  }

  // Events
  fmt.Printf("\n%sService Events (%d)%s\n", titleColor, len(s.Events), resetColor)
  if len(s.Events) == 0 {
    fmt.Printf("There are no service events for this service.\n")
  } else {
      w := tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
      fmt.Fprintf(w, "%sId\tTime\tMessage%s\n", titleColor, resetColor)
      for _, e := range s.Events {
        fmt.Fprintf(w, "%s%s\t%s\t%s%s\n", nullColor, 
        *e.Id, e.CreatedAt.Local().Format(time.RFC1123), *e.Message, resetColor)
      }
      w.Flush()
  }
}

