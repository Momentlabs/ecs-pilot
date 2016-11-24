package interactive 

import (
  "fmt"
  "os"
  "sort"
  "strings"
  "time"
  "text/tabwriter"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/ecs"

  // THIS WILL UNDOUBTADLY CAUSE PROBLEMS
  // "awslib"
  "github.com/jdrivas/awslib"

)

func doListTasks(sess *session.Session) (error) {
  dtm,  err:= awslib.GetDeepTasks(currentCluster, sess)
  if err != nil { return err }
  // TODO: research into inflectors for go.
  if err == nil {
    fmt.Printf("%sCluster: %s%s\n", titleColor, currentCluster, resetColor)
    if len(dtm) > 0 {
      w := tabwriter.NewWriter(os.Stdout, 4, 10, 2, ' ', 0)
      // fmt.Fprintf(w, "%sInstance\tBindings\tContainers\tUptime\tTTS\tStatus\tTask Definition\tTask ARN%s\n", titleColor, resetColor)
      fmt.Fprintf(w, "%sPublic\tTask ARN\tTask Definition\tContainers\tBindings%s\n", titleColor, resetColor)
      for arn, dt := range dtm {
        t := dt.Task
        // fmt.Fprintf(w, "%s%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s%s\n", nullColor, 
        //   dt.PublicIpAddress(), awslib.CollectBindings(t), awslib.CollectContainerNames(t.Containers), dt.UptimeString(), dt.TimeToStartString(),
        //   *t.LastStatus, awslib.ShortArnString(t.TaskDefinitionArn), awslib.ShortArnString(&arn), resetColor)
        fmt.Fprintf(w, "%s%s\t%s\t%s\t%s\t%s%s\n", nullColor, 
          dt.PublicIpAddress(), awslib.ShortArnString(&arn),
          awslib.ShortArnString(t.TaskDefinitionArn),  awslib.CollectContainerNames(t.Containers), 
          awslib.CollectBindings(t), 
          resetColor)
      }
      w.Flush()
    } else {
      fmt.Printf("%sNo tasks in this cluster.%s\n", warnColor, resetColor)
    }
  }
  return err
}

func doStatusTasks(clusterName string, sess *session.Session) (error) {
 dtm,  err:= awslib.GetDeepTasks(currentCluster, sess)
  if err != nil { return err }
  // TODO: research into inflectors for go.
  if err == nil {
    fmt.Printf("%sCluster: %s%s\n", titleColor, currentCluster, resetColor)
    if len(dtm) > 0 {
      w := tabwriter.NewWriter(os.Stdout, 4, 10, 2, ' ', 0)
      fmt.Fprintf(w, "%sPublic\tPrivate\tContainers\tUptime\tTTS\tStatus\tTask Definition%s\n", titleColor, resetColor)
      // fmt.Fprintf(w, "%sInstance\tTask ARN\tStatus\tTask Definition\tContainers\tBindings%s\n", titleColor, resetColor)
      for _, dt := range dtm {
        t := dt.Task
        fmt.Fprintf(w, "%s%s\t%s\t%s\t%s\t%s\t%s\t%s%s\n", nullColor, 
          dt.PublicIpAddress(), dt.PrivateIpAddress(), awslib.CollectContainerNames(t.Containers), dt.UptimeString(), dt.TimeToStartString(),
          *t.LastStatus, awslib.ShortArnString(t.TaskDefinitionArn), resetColor)
      //   fmt.Fprintf(w, "%s%s\t%s\t%s\t%s\t%s\t%s%s\n", nullColor, 
      //     dt.PublicIpAddress(), awslib.ShortArnString(&arn), *t.LastStatus, 
      //     awslib.ShortArnString(t.TaskDefinitionArn),  awslib.CollectContainerNames(t.Containers), 
      //     awslib.CollectBindings(t), 
      //     resetColor)
      }
      w.Flush()
    } else {
      fmt.Printf("%sNo tasks in this cluster.%s\n", warnColor, resetColor)
    }
  }
  return nil
}

func doDescribeTask(sess *session.Session) (error) {
  dt, err := awslib.GetDeepTask(currentCluster, interTaskArn, sess)
  if err == nil { 
    printDeepTask(dt)
  }
  return nil
}

func doDescribeAllTasks(sess *session.Session) (error) {
  dtm, err := awslib.GetDeepTasks(currentCluster, sess)
  if err == nil {
    if len(dtm) <= 0 {
      fmt.Printf("No tasks for %s.\n", currentCluster)
    } else {
      for k, dt := range dtm {
        fmt.Printf("\n%sTask: %s%s\n", infoColor, k, resetColor)
        printDeepTask(dt)
      }
    }
  }
  return err
}


// yes, yes. Cut this up into smaller fuctions ....
func printDeepTask(dt *awslib.DeepTask) {

  // Task details
  fmt.Printf("\n%sTask%s\n", titleColor, resetColor)
  w := tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
  fmt.Fprintf(w, "%sTaskDefinintion\tARN\tInstnanceID\tTaskRole\tPublicIP\tPrivateIP\tNetwork Mode\tStatus%s\n", titleColor, resetColor) 
  roleArn := "<none>"
  if dt.TaskDefinition.TaskRoleArn != nil { roleArn = *dt.TaskDefinition.TaskRoleArn }
  fmt.Fprintf(w,"%s%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s%s\n", nullColor,
    awslib.ShortArnString(dt.TaskDefinition.TaskDefinitionArn), awslib.ShortArnString(dt.Task.TaskArn), *dt.GetInstanceID(), roleArn, dt.PublicIpAddress(), dt.PrivateIpAddress(), 
    *dt.TaskDefinition.NetworkMode, dt.LastStatus(), resetColor)
  w.Flush()

  // Volumes
  fmt.Printf("%s\nVolumes%s\n", titleColor, resetColor)
  if len(dt.TaskDefinition.Volumes) > 0 {
    w = tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
    fmt.Fprintf(w, "%sName\tHost Source Path%s\n", titleColor, resetColor)
    for _, v := range dt.TaskDefinition.Volumes {
      fmt.Fprintf(w,"%s%s\t%s%s\n", nullColor, *v.Name, *v.Host.SourcePath, resetColor)
    }
  } else {
    fmt.Printf("No volumes specified.\n")
  }
  w.Flush()

  //
  // Containers
  //

  // Basic status
  envs := make(map[string]map[string]string)
  fmt.Printf("\n%sContainers%s\n", titleColor, resetColor)
  w = tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
  fmt.Fprintf(w, "%sName\tEssential\tPrivelaged\tStatus\tReason%s\n", titleColor, resetColor)
  for _, c := range dt.Task.Containers {

    reason := "<none>"
    cdef, _ := awslib.GetContainerDefinition(*c.Name, dt.TaskDefinition)
    var priv bool
    if cdef.Privileged != nil { priv = *cdef.Privileged }
    if c.Reason != nil { reason = *c.Reason }
    fmt.Fprintf(w, "%s%s\t%t\t%t\t%s\t%s\t%s\n", nullColor, *c.Name, *cdef.Essential, priv,
      *c.LastStatus, reason, resetColor)
  }
  w.Flush()

  // Image
  w = tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
  fmt.Fprintf(w, "\n%sName\tUser\tImage\tWorking Dir%s\n", titleColor, resetColor)
  for _, c := range dt.Task.Containers {
    cdef, _ := awslib.GetContainerDefinition(*c.Name, dt.TaskDefinition)
    user := "<none>"
    if cdef.User != nil { user = *cdef.User }
    workingDirectory := "<none>"
    if cdef.WorkingDirectory != nil { workingDirectory = *cdef.WorkingDirectory }
    fmt.Fprintf(w,"%s%s\t%s\t%s\t%s%s\n", nullColor, *c.Name, user, *cdef.Image, workingDirectory, resetColor)
  }
  w.Flush()

  // Entrypoint/Command
  w = tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
  fmt.Fprintf(w, "\n%sName\tEntpryPoint\tCommand%s\n", titleColor, resetColor)
  for _, c := range dt.Task.Containers {
    cdef, _ := awslib.GetContainerDefinition(*c.Name, dt.TaskDefinition)
    ep := "<none>"
    if len(cdef.EntryPoint) > 0 { ep = awslib.JoinStringP(cdef.EntryPoint, ", ") }
    cmd := "<none>"
    if len(cdef.Command) > 0 { cmd = awslib.JoinStringP(cdef.Command, ", ") }
    fmt.Fprintf(w,"%s%s\t%s\t%s%s\n", nullColor, *c.Name, ep, cmd, resetColor)
  }
  w.Flush()

  // Mounts 
  fmt.Printf("\n%sMount Points:%s\n", titleColor, resetColor)
  var anyMounts bool
  for _, c := range dt.Task.Containers {
    cdef, _ := awslib.GetContainerDefinition(*c.Name, dt.TaskDefinition)
    if len(cdef.MountPoints) > 0 {
      anyMounts = true
      w = tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
      fmt.Fprintf(w, "%sContainer\tSource\tContainer\tReadonly%s\n", titleColor, resetColor)
      for _, mp := range cdef.MountPoints {
        fmt.Fprintf(w,"%s%s\t%s\t%s\t%t%s\n", nullColor, *c.Name, *mp.SourceVolume, *mp.ContainerPath, *mp.ReadOnly, resetColor)
      }
    } 
  }
  w.Flush()
  if !anyMounts {
    fmt.Printf("No mount points specified.\n")
  }

  // Resource Controls
  fmt.Printf("\n%sResource Controls:%s\n", titleColor, resetColor)
  w = tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
  fmt.Fprintf(w, "%sContainer\tCPU\tMemory Limit\tMemory Reservation%s\n", titleColor, resetColor)
  for _, c := range dt.Task.Containers {
    cdef, _ := awslib.GetContainerDefinition(*c.Name, dt.TaskDefinition)
    fmt.Fprintf(w,"%s%s\t%d\t%d\t%d%s\n", nullColor, *c.Name, *cdef.Cpu, *cdef.Memory, *cdef.MemoryReservation, resetColor)
  }
  w.Flush()

  fmt.Printf("%s\nUlimits:%s\n", titleColor, resetColor)
  w = tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
  fmt.Fprintf(w, "%sContainer\tName\tSoft Limit\tHard Limit%s\n", titleColor, resetColor)
  // var anyLimits bool
  for _, c := range dt.Task.Containers {
    cdef, _ := awslib.GetContainerDefinition(*c.Name, dt.TaskDefinition)
    if len(cdef.Ulimits) > 0 {
      // anyLimits = true
      for _, ul := range cdef.Ulimits {
        fmt.Fprintf(w,"%s%s\t%s\t%d\t%d%s\n", nullColor, *c.Name, *ul.Name, *ul.SoftLimit, *ul.HardLimit, resetColor)
      }
    } else {
      fmt.Fprintf(w, "%s%s\t%s%s\n", nullColor, *c.Name, "No ulimits", resetColor)
    }
  }
  w.Flush()
  // if !anyLimits { fmt.Printf("No ulimits specified.\n")}


  //  Network Bindings
  fmt.Printf("\n%sNetwork Bindings:%s\n", titleColor, resetColor)
  w = tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
  fmt.Fprintf(w, "%sContainer\tIP\tContainer\tHost\tProtocol%s\n", titleColor, resetColor)
  for _, c := range dt.Task.Containers {
    for _, b := range c.NetworkBindings {
      fmt.Fprintf(w,"%s%s\t%s\t%d\t%d\t%s%s\n", nullColor, *c.Name, *b.BindIP, 
        *b.ContainerPort, *b.HostPort, *b.Protocol, resetColor)
    }
  }
  w.Flush()

  // Links
  fmt.Printf("\n%sLinks:%s\n", titleColor, resetColor)
  w = tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
  fmt.Fprintf(w, "%sContainer\tLink%s\n", titleColor, 
    resetColor)
  for _, c := range dt.Task.Containers {
    cdef, _ := awslib.GetContainerDefinition(*c.Name, dt.TaskDefinition)
    if len(cdef.Links) > 0 {
      for _, l := range cdef.Links {
        fmt.Fprintf(w, "%s%s\t%s%s\n", nullColor, *c.Name, *l, resetColor)
      } 
    } else {
      fmt.Fprintf(w, "%s%s\t%s%s\n", nullColor, *c.Name, "no links", resetColor)
    }
  }
  w.Flush()

  // Logs
  fmt.Printf("\n%sLog Configuration:%s\n", titleColor, resetColor)
  w = tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
  fmt.Fprintf(w, "%sContainer\tLog Driver\tOptions%s\n", titleColor, 
    resetColor)
  td := dt.TaskDefinition
  for _, c := range td.ContainerDefinitions {
    lc := c.LogConfiguration
    fmt.Fprintf(w, "%s%s\t%s", nullColor, *c.Name, *lc.LogDriver)
    for _, k := range sortedKeys(lc.Options) {
      v, _ := lc.Options[k]
      fmt.Fprintf(w, "\t%s=%s", k, *v)
    }
    fmt.Fprintf(w, "%s\n", resetColor)
  }
  w.Flush()

  // Environments
  tel := mergeEnvs(envs)
  fmt.Printf("%s\nConatiner Environments:%s\n", titleColor, resetColor)
  if len(tel) > 0 {
    sort.Sort(ByKeyGroupedByContainer(tel))
    w = tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
    fmt.Fprintf(w, "%sContainer\tKey\tValue%s\n", titleColor, resetColor)
    for _, te := range tel {
      fmt.Fprintf(w, "%s%s\t%s\t%s%s\n", nullColor, te.Container, te.Key, te.Value, resetColor)
    }
    w.Flush()
  } else {
    fmt.Printf("There were no container environment variables for this task.\n")
  }
}

// Found in ContainerDefinition for the log options.
// Though, this looks like something you miight see throughout aws.
type optionMap map[string]*string
func (om optionMap) String() (s string) {
  for k, v := range om {
    s += fmt.Sprintf("%s: %s, ", k, *v)
  }
  s = strings.TrimSuffix(s,", ")
  return s
}
type taskEnvEntry struct {
  Container string
  Key string
  Value string
}

type taskEnvSort struct {
  list []*taskEnvEntry
  less func(tI, tJ *taskEnvEntry) (bool)
}

func (t taskEnvSort) Swap(i, j int) { t.list[i], t.list[j] = t.list[j], t.list[i] }
func (t taskEnvSort) Len() int { return  len(t.list) }
func (t taskEnvSort) Less(i, j int) bool { return t.less(t.list[i], t.list[j]) }

func ByKeyGroupedByContainer(tl []*taskEnvEntry) (taskEnvSort) {
  return taskEnvSort {
    list: tl,
    less: func(tI, tJ *taskEnvEntry) bool {
      if tI.Key == tJ.Key {
        return tI.Container < tJ.Container
      }
      return tI.Key < tJ.Key
    },
  }
}

func mergeEnvs(envs map[string]map[string]string) (el []*taskEnvEntry) {
  el = make([]*taskEnvEntry,0)
  for cName, env := range envs {
    for k, v := range env {
      tee := new(taskEnvEntry)
      tee.Container = cName
      tee.Key = k
      tee.Value = v
      el = append(el, tee)
    }
  }
  return el
}

func doRunTask(sess *session.Session) (error) {
  // svc := ecs.New(sess)
  containerEnvMap := make(awslib.ContainerEnvironmentMap)
  if len(taskEnv) > 0 {
    taskDef, err  := awslib.GetTaskDefinition(taskDefinitionArnArg, sess)
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

  runTaskOut, err := awslib.RunTaskWithEnv(currentCluster, taskDefinitionArnArg, containerEnvMap, sess)
  if err == nil {
    fmt.Printf("%sStarting task.%s\n", successColor, resetColor)
    printTaskDescription(runTaskOut.Tasks, runTaskOut.Failures, false)
    if len(runTaskOut.Tasks) > 0 {
      taskToWaitOn := *runTaskOut.Tasks[0].TaskArn
      awslib.OnTaskRunning(currentCluster, taskToWaitOn, sess, func(taskDescrip *ecs.DescribeTasksOutput, err error) {
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
    fmt.Printf("%sFailures (%d):%s\n", failColor, len(failures), resetColor)
    w := tabwriter.NewWriter(os.Stdout, 8, 10, 2, ' ', 0)
    fmt.Fprintf(w, "%s#\tResource\tResason%s\n", titleColor, resetColor)
    for i, failure := range failures {
      fmt.Fprintf(w, "%s%d.\t%s\t%s%s\n", nullColor, i+1, awslib.ShortArnString(failure.Arn), *failure.Reason, resetColor)
    }
    w.Flush()
  }

  if len(tasks) == 0 {
    fmt.Printf("%sThere were no tasks!%s\n", failColor, resetColor)
  } else {
    w := tabwriter.NewWriter(os.Stdout, 8, 10, 2, ' ', 0)
    if printStartUp {
      fmt.Fprintf(w, "%sCluster\tTaskDefinition\tContainers\tState\tStart\tARN%s\n", titleColor, resetColor)
      for _, t := range tasks {
        fmt.Fprintf(w, "%s%s\t%s\t%s\t%s\t%s\t%s%s\n", nullColor, 
          awslib.ShortArnString(t.ClusterArn), awslib.ShortArnString(t.TaskDefinitionArn), 
          awslib.CollectContainerNames(t.Containers), *t.LastStatus, t.StartedAt.Sub(*t.CreatedAt),
          awslib.ShortArnString(t.TaskArn), resetColor)
      }
    } else {
      fmt.Fprintf(w, "%sCluster\tTaskDefinition\tContainers\tState\tARN%s\n", titleColor, resetColor)
      for _, t := range tasks {
        fmt.Fprintf(w, "%s%s\t%s\t%s\t%s\t%s%s\n", nullColor, 
          awslib.ShortArnString(t.ClusterArn), awslib.ShortArnString(t.TaskDefinitionArn), 
          awslib.CollectContainerNames(t.Containers), *t.LastStatus, awslib.ShortArnString(t.TaskArn), resetColor)
      }
    }
    w.Flush()
  }
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


