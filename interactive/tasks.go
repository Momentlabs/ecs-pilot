package interactive 

import (
  "fmt"
  "os"
  "strings"
  "time"
  "text/tabwriter"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/ecs"

  // THIS WILL UNDOUBTADLY CAUSE PROBLEMS
  // "awslib"
  "github.com/jdrivas/awslib"

)

// TODO: figure out a way to display port-host bindings on the listing.
func doListTasks(sess *session.Session) (error) {
  dtm,  err:= awslib.GetDeepTasks(currentCluster, sess)
  if err != nil { return err }
  // arns, err := awslib.ListTasksForCluster(currentCluster, svc)
  // tasksMap, err := awslib.GetAllTaskDescriptions(currentCluster, svc)
  // TODO: research into inflectors for go.
  if err == nil {
    fmt.Printf("%sCluster: %s%s\n", titleColor, currentCluster, resetColor)
    w := tabwriter.NewWriter(os.Stdout, 4, 10, 2, ' ', 0)
    fmt.Fprintf(w, "%sInstance\tBindings\tContainers\tUptime\tTTS\tStatus\tTask Definition\tTask ARN%s\n", titleColor, resetColor)
    for arn, dt := range dtm {
      // ct := tasksMap[*arn]
      t := dt.Task
      // fmt.Fprintf(w, "%s%s\t%s%s\n", nullColor, collectContainerNames(containerTask.Task), *arn, resetColor)
      fmt.Fprintf(w, "%s%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s%s\n", nullColor, 
        dt.PublicIpAddress(), collectBindings(t), collectContainerNames(t), dt.UptimeString(), dt.TimeToStartString(),
        *t.LastStatus, awslib.ShortArnString(t.TaskDefinitionArn), awslib.ShortArnString(&arn), resetColor)
      // fmt.Fprintf(w, "%s\t%s%s\n", nullColor, *arn, resetColor)
      // fmt.Fprintln(w)
    }
    w.Flush()
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

func collectBindings(task *ecs.Task) (string) {
  s := ""
  for _, c := range task.Containers {
    bdgs := c.NetworkBindings
    if len(bdgs) == 0 {continue}
    s += *c.Name + ": "
    for _, b := range bdgs {
      s += fmt.Sprintf("%d->%d, ", *b.ContainerPort, *b.HostPort)
    }
    s = strings.Trim(s,", ")
  }
  return s
}

func doDescribeTask(sess *session.Session) (error) {
  dt, err := awslib.GetDeepTask(currentCluster, interTaskArn, sess)
  if err != nil {
    return err
  }
  t := dt.Task
  // ec2 := dt.EC2Instance
  up := 0 * time.Minute
  if u, err := dt.Uptime(); err == nil { up = u }
  w := tabwriter.NewWriter(os.Stdout, 4, 10, 2, ' ', 0)
  fmt.Fprintf(w, "%sAddress\tCluster\tTaskDefinition\tUptime\tStatus\tARN%s\n", titleColor, 
    dt.PublicIpAddress(), awslib.ShortArnString(t.ClusterArn), awslib.ShortArnString(t.TaskDefinitionArn),
    up, *t.LastStatus, *t.TaskArn, resetColor)
  w.Flush()

  return nil
}

func doDescribeAllTasks(svc *ecs.ECS) (error) {
  resp, err := awslib.GetAllTaskDescriptions(currentCluster, svc)

  if err == nil {
    if len(resp) <= 0 {
      fmt.Printf("No tasks for %s.\n", currentCluster)
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
  }

  runTaskOut, err := awslib.RunTaskWithEnv(currentCluster, interTaskDefinitionArn, containerEnvMap, svc)
  if err == nil {
    fmt.Printf("%sStarting task.%s\n", successColor, resetColor)
    printTaskDescription(runTaskOut.Tasks, runTaskOut.Failures, false)
    if len(runTaskOut.Tasks) > 0 {
      taskToWaitOn := *runTaskOut.Tasks[0].TaskArn
      awslib.OnTaskRunning(currentCluster, taskToWaitOn, svc, func(taskDescrip *ecs.DescribeTasksOutput, err error) {
        if err == nil {
          fmt.Printf("\n%sTask is now running on cluster %s%s\n", successColor, currentCluster, resetColor)
          printTaskDescription(taskDescrip.Tasks, taskDescrip.Failures, true)
          fmt.Printf("%s\n", containerEnvironmentsString(&containerEnvMap))
        } else {
          fmt.Printf("\n%sProblem starting task: %s on cluster %s.%s\n", 
            failColor, awslib.ShortArnString(&taskToWaitOn), currentCluster, resetColor)
          fmt.Printf("%sError: %s.%s\n", warnColor, err, resetColor)
          if taskDescrip != nil {
            tasks := taskDescrip.Tasks
            failures := taskDescrip.Failures
            if len(tasks) == 1 {
              task := tasks[0]
              fmt.Printf("Task is: %s", *task.LastStatus)
              if task.StoppedReason != nil {
                fmt.Printf(" beacuse: %s\n", *task.StoppedReason)
              } else {
                fmt.Println()
              }
              if len(task.Containers) == 0 {
                fmt.Printf("Received no containers in the description.\n")
              }
              w := tabwriter.NewWriter(os.Stdout, 8, 10, 2, ' ', 0)
              fmt.Fprintf(w, "%sContainer\tLast Status\tStopped Reason%s\n", titleColor, resetColor)
              for _, c := range task.Containers {
                ls := "<nil>"
                if c.LastStatus != nil { ls = *c.LastStatus }
                r := "<nil>"
                if c.Reason != nil { r = *c.Reason}
                fmt.Fprintf(w, "%s%s\t%s\t%s%s\n", nullColor, *c.Name, ls, r, resetColor)
              }
              w.Flush()
            } else {
              fmt.Printf("Expected 1, but there were (%d) tasks.\n", len(tasks))
              for i, task := range tasks {
                fmt.Printf("%d, Task: %ss\n%v", i+1, task.TaskArn, task)
              }
            }
            for _, failure := range failures {
              fmt.Printf("Failure: %#v", failure)
            }
          }
        }
      })
    }
  }
  return err
}


func doStopTask(sess *session.Session) (error) {
  fmt.Printf("%sStopping the task: %s%s\n", warnColor, interTaskArn, resetColor)
  resp, err := awslib.StopTask(currentCluster, interTaskArn, sess)
  if err == nil {
    t := resp.Task
    fmt.Printf("%sTask scheduled to stop.\n%s", successColor, resetColor)
    // fmt.Printf("%s\n", ContainerTaskDescriptionToString(resp.Task))
    w := tabwriter.NewWriter(os.Stdout, 8, 10, 2, ' ', 0)
    var uptime time.Duration = 0
    if t.CreatedAt != nil && t.StoppedAt != nil {
      uptime = t.StoppedAt.Sub(*t.StartedAt)
    }
    fmt.Fprintf(w, "%sCluster\tTask\tTask Definition\tContainerInstance\tStatus\tUptime%s\n", titleColor, resetColor)
    fmt.Fprintf(w, "%s%s\t%s\t%s\t%s\t%s\t%s%s\n", nullColor,
      awslib.ShortArnString(t.ClusterArn), awslib.ShortArnString(t.TaskArn), awslib.ShortArnString(t.TaskDefinitionArn),
      awslib.ShortArnString(t.ContainerInstanceArn), *t.LastStatus, shortDurationString(uptime),
      resetColor)
    w.Flush()

    awslib.OnTaskStopped(currentCluster, interTaskArn, sess, func(dto *ecs.DescribeTasksOutput, err error){
      if err == nil {
        fmt.Printf("\n%sTask: %s: %s is now stopped.%s\n", warnColor, currentCluster, interTaskArn,resetColor)
      } else {
        fmt.Printf("\n%sThere was a problem waiting for task %s on cluster %s to stop.%s\n", 
          failColor, interTaskArn, currentCluster, resetColor)
        fmt.Printf("\n%sError: %s.%s\n", warnColor, err, resetColor)
      }
    })
  }
  return err
}


//
// Print support.
//

func printTaskDescription(tasks []*ecs.Task, failures []*ecs.Failure, printStartUp bool) {
  if len(failures) == 0 {
    if verbose {
      fmt.Printf("There were no failures.")
    }
  } else {
    w := tabwriter.NewWriter(os.Stdout, 8, 10, 2, ' ', 0)
    fmt.Fprintf(w, "%sResource\tARN%s\n", titleColor, resetColor)
    for _, failure := range failures {
      fmt.Fprintf(w, "%s%s\t%s%s\n", nullColor, awslib.ShortArnString(failure.Arn), *failure.Reason)
    }
    w.Flush()
  }
  if len(tasks) == 0 {
    fmt.Printf("There were no tasks!")
  }
  w := tabwriter.NewWriter(os.Stdout, 8, 10, 2, ' ', 0)
  if printStartUp {
    fmt.Fprintf(w, "%sCluster\tTaskDefinition\tContainers\tState\tStart\tARN%s\n", titleColor, resetColor)
    for _, t := range tasks {
      fmt.Fprintf(w, "%s%s\t%s\t%s\t%s\t%s\t%s%s\n", nullColor, 
        awslib.ShortArnString(t.ClusterArn), awslib.ShortArnString(t.TaskDefinitionArn), 
        collectContainerNames(t), *t.LastStatus, t.StartedAt.Sub(*t.CreatedAt),
        awslib.ShortArnString(t.TaskArn), resetColor)
    }
  } else {
    fmt.Fprintf(w, "%sCluster\tTaskDefinition\tContainers\tState\tARN%s\n", titleColor, resetColor)
    for _, t := range tasks {
      fmt.Fprintf(w, "%s%s\t%s\t%s\t%s\t%s%s\n", nullColor, 
        awslib.ShortArnString(t.ClusterArn), awslib.ShortArnString(t.TaskDefinitionArn), 
        collectContainerNames(t), *t.LastStatus, awslib.ShortArnString(t.TaskArn), resetColor)
    }
  }
  w.Flush()
}

func bindingString(bind *ecs.NetworkBinding) (s string) {
  s += fmt.Sprintf("%s - container: %d -> host: %d (%s)", *bind.BindIP, *bind.ContainerPort, *bind.HostPort, *bind.Protocol)
  return s
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



func shortContainerString(container *ecs.Container) (s string) {
  s += fmt.Sprintf("%s - %s", *container.Name, *container.LastStatus)
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

