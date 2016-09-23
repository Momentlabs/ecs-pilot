package interactive

import (
  "fmt"
  "os"
  "text/tabwriter"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/ecs"

  // THIS WILL UNDOUBTADLY CAUSE PROBLEMS
  // "awslib"
  "github.com/jdrivas/awslib"

)

func doListTaskDefinitions(sess *session.Session) (error) {
  // arns, err := awslib.ListTaskDefinitions(svc)
  tds, err := awslib.ListTaskDefinitionFamilies(sess)
  if err == nil {
    w := tabwriter.NewWriter(os.Stdout, 4, 8, 3, ' ', 0)
    fmt.Fprintf(w, "%sTask Definition%s\n", titleColor, resetColor)
    for _, tdf := range tds {
      fmt.Fprintf(w,"%s%s%s\n", nullColor, *tdf, resetColor)
    }
    w.Flush()
  }
  return err
}


func doDescribeTaskDefinition(sess *session.Session) (error) {

  td, err := awslib.GetTaskDefinition(interTaskDefinitionArn, sess)
    if err == nil {
      describeTaskDefinition(td)
    if verbose {
      fmt.Printf("%s\n", td)
    }
  }

  return err
}


// Consider adding a test to ensure that file-name.json matche the family inside the jason.
// So that spigot-test.json => "family": "spigot-test".
// Keeps us from accidentially overwritting task-descriptions when we copy and past into a new .json file.
func doRegisterTaskDefinition(sess *session.Session) (error) {
  file, err := os.Open(taskConfigFileName)
  if err != nil { return err}

  resp, err := awslib.RegisterTaskDefinitionWithJSON(file, sess)
  if err == nil {
    td := resp.TaskDefinition
    // fmt.Printf("Got the following response:\n %+v\n", resp)
    fmt.Printf("%sRegistered TaskDefinition: %s:%d%s\n", successColor, *td.Family, *td.Revision, resetColor)
    describeTaskDefinition(td)
  } else {
    err = fmt.Errorf("Couldn't register the task definition: %s.", err)
  }

  return err
}

func describeTaskDefinition(td *ecs.TaskDefinition) {
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
  fmt.Fprintf(w, "\n%sContainer\tMemory\tCPU\tEssential\tImage%s\n", titleColor, resetColor)
  for _, c := range td.ContainerDefinitions {
    fmt.Fprintf(w,"%s%s\t%d\t%d\t%t\t%s%s\n", nullColor,
      *c.Name, *c.Memory, *c.Cpu, *c.Essential, *c.Image, resetColor)
    // fmt.Fprintf(w,"%s\tEntrypoint: %s%s\n", nullColor, collectStringPointers(c.EntryPoint), resetColor)
    // fmt.Fprintf(w, "%s\tCMD: %s%s\n", nullColor, collectStringPointers(c.Command), resetColor)
    // fmt.Fprintln(w, "")
  }
  w.Flush()
  // Network Bindings
  w = tabwriter.NewWriter(os.Stdout, 8, 10, 2, ' ', 0)
  fmt.Fprintf(w,"\n%sContainer\tCont Port\tHost Port\tProtocol%s\n", titleColor, resetColor)
  for _, c := range td.ContainerDefinitions {
    for _, pm := range c.PortMappings {
      fmt.Fprintf(w,"%s%s\t%d\t%d\t%s%s\n", nullColor, *c.Name, *pm.ContainerPort, *pm.HostPort, *pm.Protocol, resetColor)      
    }
  }
  w.Flush()

}

