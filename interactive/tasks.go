package interactive 

import (
  "fmt"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/ecs"

  // THIS WILL UNDOUBTADLY CAUSE PROBLEMS
  // "awslib"
  "github.com/jdrivas/awslib"

)


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

  runTaskOut, err := awslib.RunTaskWithEnv(interClusterName, interTaskDefinitionArn, containerEnvMap, svc)
  if err == nil {
    printTaskDescription(runTaskOut.Tasks, runTaskOut.Failures)
    if len(runTaskOut.Tasks) > 0 {
      taskToWaitOn := *runTaskOut.Tasks[0].TaskArn
      awslib.OnTaskRunning(interClusterName, taskToWaitOn, svc, func(taskDescrip *ecs.DescribeTasksOutput, err error) {
        if err == nil {
          fmt.Printf("\n%sTask is now running on cluster %s%s\n", highlightColor, interClusterName, resetColor)
          printTaskDescription(taskDescrip.Tasks, taskDescrip.Failures)
          fmt.Printf("%s.\n", containerEnvironmentsString(&containerEnvMap))
        } else {
          fmt.Printf("\n%sProblem waiting for task: %s on cluster %s to start.%s\n", 
            highlightColor, taskToWaitOn, interClusterName, resetColor)
          fmt.Printf("Error: %s.\n", err)

          if taskDescrip != nil {
            tasks := taskDescrip.Tasks
            failures := taskDescrip.Failures
            if len(tasks) == 1 {
              task := tasks[0]
              fmt.Printf("Task is: %s", *task.LastStatus)
                if task.StoppedReason != nil {
                  fmt.Printf(" beacuse: %s\n", *task.StoppedReason)
                  } else {
                    fmt.Printf("\n")
                  }
               if len(task.Containers) == 1 {
                container := task.Containers[0]
                fmt.Printf("Conatiner \"%s\" is %s because: %s.", *container.Name, *container.LastStatus, *container.Reason)
               }
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


func shortTaskString(task *ecs.Task) (s string) {
  s += fmt.Sprintf("%s - %s\n", *task.TaskArn, *task.LastStatus)
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

func bindingString(bind *ecs.NetworkBinding) (s string) {
  s += fmt.Sprintf("%s - container: %d -> host: %d (%s)", *bind.BindIP, *bind.ContainerPort, *bind.HostPort, *bind.Protocol)
  return s
}

func doStopTask(sess *session.Session) (error) {
  fmt.Printf("Stopping the task: %s.\n", interTaskArn)
  resp, err := awslib.StopTask(interClusterName, interTaskArn, sess)
  if err == nil {
    fmt.Println("%sThis task is scheduled to stop.%s", highlightColor, resetColor)
    fmt.Printf("%s\n", ContainerTaskDescriptionToString(resp.Task))
    awslib.OnTaskStopped(interClusterName, interTaskArn, sess, func(dto *ecs.DescribeTasksOutput, err error){
      if err == nil {
        fmt.Printf("\n%sTask: %s on cluster %s is now stopped.%s\n", highlightColor, interTaskArn, interClusterName, resetColor)
      } else {
        fmt.Printf("\nThere was a problem waiting for task %s on cluster %s to stop.\n", interTaskArn, interClusterName)
        fmt.Printf("\nError: %s.\n", err)
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