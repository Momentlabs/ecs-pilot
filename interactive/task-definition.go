package interactive

import (
  "fmt"
  "github.com/aws/aws-sdk-go/service/ecs"

  // THIS WILL UNDOUBTADLY CAUSE PROBLEMS
  // "awslib"
  "github.com/jdrivas/awslib"

)



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


func printTaskDescription(tasks []*ecs.Task, failures []*ecs.Failure) {
  fmt.Printf("There are (%d) failures.\n", len(failures))
  for i, failure := range failures {
    fmt.Printf("%d: %s\n", i+1, failure)
  }
  fmt.Printf("There are (%d) tasks.\n", len(tasks))
  for i, task := range tasks {
    fmt.Printf("%d: %s\n", i+1, shortTaskString(task))
  }
}