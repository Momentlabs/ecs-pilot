package interactive

import (
  "fmt"
  "os"
  "text/tabwriter"
  "github.com/aws/aws-sdk-go/service/ecs"

  // THIS WILL UNDOUBTADLY CAUSE PROBLEMS
  // "awslib"
  "github.com/jdrivas/awslib"

)

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


func doDescribeTaskDefinition(svc *ecs.ECS) (error) {

  td, err := awslib.GetTaskDefinition(interTaskDefinitionArn, svc)
    if err == nil {
    w := tabwriter.NewWriter(os.Stdout, 4, 10, 2, ' ', 0)
    fmt.Fprintf(w, "%sFamily\tRevision\tNetwork\tStatus\tIAM Role\tARN%s\n", titleColor, resetColor)
    fmt.Fprintf(w,"%s%s\t%d\t%s\t%s\t%s\t%s%s\n", nullColor,
      *td.Family, *td.Revision, *td.NetworkMode, *td.Status, 
      awslib.ShortArnString(td.TaskRoleArn), awslib.ShortArnString(td.TaskDefinitionArn), resetColor)
    w.Flush()
    // for _, a := range td.RequiresAttributes {
    //   fmt.Printf("Attribute: %s\n", *a.Name)
    // }
    w = tabwriter.NewWriter(os.Stdout, 8, 10, 2, ' ', 0)
    fmt.Fprintf(w, "%s#\tContainer\tMemory\tCPU\tEssential\tImage%s\n", titleColor, resetColor)
    for i, c := range td.ContainerDefinitions {
      fmt.Fprintf(w,"%s%d.\t%s\t%d\t%d\t%t\t%s%s\n", nullColor, i+1,
        *c.Name, *c.Memory, *c.Cpu, *c.Essential, *c.Image, resetColor)
      // fmt.Fprintf(w,"%s\tEntrypoint: %s%s\n", nullColor, collectStringPointers(c.EntryPoint), resetColor)
      // fmt.Fprintf(w, "%s\tCMD: %s%s\n", nullColor, collectStringPointers(c.Command), resetColor)
      // fmt.Fprintln(w, "")
    }
    w.Flush()
    // Volumes

    if verbose {
      fmt.Printf("%s\n", td)
    }
  }

  return err
}

func doRegisterTaskDefinition(svc *ecs.ECS) (error) {
  file, err := os.Open(taskConfigFileName)
  if err != nil { return err}

  resp, err := awslib.RegisterTaskDefinitionWithJSON(file, svc)
  if err == nil {
    fmt.Printf("Got the following response:\n %+v\n", resp)
  } else {
    err = fmt.Errorf("Couldn't register the task definition: %s.", err)
  }

  return err
}

