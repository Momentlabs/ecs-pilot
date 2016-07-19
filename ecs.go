package main 

import (
  // "strings"
  "fmt"
  "errors"
  // "io"
  "encoding/base64"
  "github.com/aws/aws-sdk-go/aws"
  "github.com/aws/aws-sdk-go/aws/session"
  "github.com/aws/aws-sdk-go/service/ecs"
  "github.com/aws/aws-sdk-go/service/ec2"
  // "github.com/op/go-logging"
)


type Cluster struct {
  Arn *string
}

func GetClusters(svc *ecs.ECS) ([]Cluster, error) {

  params := &ecs.ListClustersInput {
    MaxResults: aws.Int64(100),
  } // TODO: this only will get the first 100 ....
  output, err := svc.ListClusters(params)

  if err != nil{
    return []Cluster{}, err
  }

  clusters := make([]Cluster, len(output.ClusterArns))
  for i, arn := range output.ClusterArns {
    clusters[i] = Cluster{Arn: arn}
  }

  return clusters, nil

}

func GetContainerInstances(clusterName string, svc *ecs.ECS)([]*string, error) {
  params := &ecs.ListContainerInstancesInput {
    Cluster: aws.String(clusterName),
    MaxResults: aws.Int64(100),
  }

  resp, err := svc.ListContainerInstances(params)

  if err != nil {
    return []*string{}, err
  }

  return resp.ContainerInstanceArns, nil
}

func GetClusterDescription(clusterName string, svc *ecs.ECS) ([]*ecs.Cluster, error) {
  
  params := &ecs.DescribeClustersInput {
    Clusters: []*string{aws.String(clusterName),},
  }

  resp, err := svc.DescribeClusters(params)
  if err != nil {
    return []*ecs.Cluster{}, err
  }

  return resp.Clusters, nil
}

func getUserData(clusterName string) (string) {

  user_data_template := `#!/bin/bash
echo ECS_CLUSTER=%s >> /etc/ecs/ecs.config
`
  user_data := fmt.Sprintf(user_data_template,clusterName)
  data := []byte(user_data)
  user_data_encoded := base64.StdEncoding.EncodeToString(data)

  return user_data_encoded
}

func getAmi() (string) {
  return "ami-55870742"
}

func getInstanceType() (string) {
  return "t2.medium"
}

func getKeyPairName() (string) {
  return "momentlabs-us-east-1"
}

func getInstanceProfileName() (string) {
  return "ecsInstanceRole"
}

func getSecurityGroupName() (string) {

  return "sg-a9f3d9d2"
}

func getBlockDeviceMappings() ([]*ec2.BlockDeviceMapping) {
  // This is paeculariar to the AMI.
  return []*ec2.BlockDeviceMapping{
      {
        // root
        DeviceName: aws.String("/dev/xvda"),
        Ebs: &ec2.EbsBlockDevice{
          DeleteOnTermination: aws.Bool(true),
          // This is not allowed from a volume.
          // Encrypted: aws.Bool(false),
          VolumeType: aws.String("gp2"),
          // GP2 has the IOPS predeterined.
          // Iops:  aws.Int64(100),
          // Thi is the snaphot for the AMI.
          SnapshotId: aws.String("snap-35a24c32"),
          // Below should be given in the snapshot size.
          // VolumeSize: aws.Int64(8)
        },
      },
      {
        // /data
        DeviceName: aws.String("/dev/xvdcz"),
        Ebs: &ec2.EbsBlockDevice{
          DeleteOnTermination: aws.Bool(true),
          Encrypted: aws.Bool(false),
          // Snapshot not needed for this it's /data/
          // SnapshotId: aws.String(""),
          VolumeSize: aws.Int64(22),
          VolumeType: aws.String("gp2"),
        },
      },
    }
}

func LaunchContainerInstance(clusterName string, config *aws.Config) (*ec2.Reservation, error) {

  // TOD: Need to add a name-tag.

  log.Debugf("LaunchContainer in region: %s\n", *config.Region)
  ec2_svc := ec2.New(session.New(config))

  params := &ec2.RunInstancesInput {
    // amzn-ami-2016.03.e-amazon-ecs-optimized-4ce33fd9-63ff-4f35-8d3a-939b641f1931-ami-55870742.3
    ImageId: aws.String(getAmi()),
    // ImageId: aws.String("ami-a88a46c5"),

    InstanceType: aws.String(getInstanceType()),
    KeyName: aws.String(getKeyPairName()),
    // SubnetId: aws.String("vpc-2eb68c4a"),
    MaxCount: aws.Int64(1),
    MinCount: aws.Int64(1),
    BlockDeviceMappings: getBlockDeviceMappings(),

    IamInstanceProfile: &ec2.IamInstanceProfileSpecification {
      // Arn: aws.String("arn:aws:iam::033441544097:instance-profile/ecsInstanceRole"),
      Name: aws.String(getInstanceProfileName()),
    },

    // The minecraft SG we've already created.
    SecurityGroupIds: []*string{
      aws.String(getSecurityGroupName()),
    },
    // I think I only need the ID.
    // Though the name for the above is:  Minecraft_Container_SG_useast1
    // SecurityGroups: []*string{
    //   aws.String("")
    // },

    UserData: aws.String(getUserData(clusterName)),

    Monitoring: &ec2.RunInstancesMonitoringEnabled{
      Enabled: aws.Bool(true),
    },

  }

  resp, err := ec2_svc.RunInstances(params)
  if err != nil {
    return nil, err
  }
  // Need to determine the following paramaters
  // ImageID
  // BlockDeviceMappings (this is particuarly important for the Container AMI, 
  //     which has 2 devices, a root and a data volume each with 'configurable' sizes.
  // Network Interfaces.
  // VPN.
  // Secrutiy Group.
  // KeyPair.
  // UserData - this is where we set up a script to set the param for which cluster to join.
  //
  // I'm thinking that ultimately these are things that hsould be set up in configuration
  // files with profiles that can be used.

  return resp, nil

}

func TerminateContainerInstance(clusterName string, containerArn string, ecs_svc *ecs.ECS, config *aws.Config) (*ec2.TerminateInstancesOutput, error) {

  dci_params := &ecs.DescribeContainerInstancesInput{
    ContainerInstances: []*string{aws.String(containerArn)},
    Cluster: aws.String(clusterName),
  }
  dci_resp, err := ecs_svc.DescribeContainerInstances(dci_params)
  if err != nil {
    return nil, err
  }

  var instanceId *string = nil
  for _, instance := range dci_resp.ContainerInstances {
    if *instance.ContainerInstanceArn == containerArn {
      instanceId = instance.Ec2InstanceId
    }
  }
  if instanceId == nil {
    errMessage := fmt.Sprintf("TerminateContainerInstance: Can't find the Ec2 Instance ID for container arn: %s", containerArn)
    return nil, errors.New(errMessage)
  }

  ec2_svc := ec2.New(session.New(config))
  params := &ec2.TerminateInstancesInput{
    InstanceIds: []*string{ aws.String(*instanceId) },
    DryRun: aws.Bool(false),
  }
  resp, err := ec2_svc.TerminateInstances(params)
  return resp, err
}

// TODO: Add overides.
func ListTasksForCluster(clusterName string, ecs_svc *ecs.ECS) ([]*string, error) {

  params := &ecs.ListTasksInput{
    Cluster: aws.String(clusterName),
    MaxResults: aws.Int64(100),
  }
  resp, err := ecs_svc.ListTasks(params)
  return resp.TaskArns, err
}

func RunTask(clusterName string, taskDef string, ecs_svc *ecs.ECS) (*ecs.RunTaskOutput, error) {

  params := &ecs.RunTaskInput{
    TaskDefinition: aws.String(taskDef),
    Cluster: aws.String(clusterName),
    Count: aws.Int64(1),
  }
  resp, err := ecs_svc.RunTask(params)
  return resp, err
}

func StopTask(clusterNamae string, taskArn string, ecs_svc *ecs.ECS) (*ecs.StopTaskOutput, error)  {
 params := &ecs.StopTaskInput{
    Task: aws.String(taskArn),
    Cluster: aws.String(clusterName),
  }
  resp, err := ecs_svc.StopTask(params)
  return resp, err
}

func ListTaskDefinitions(ecs_svc *ecs.ECS) ([]*string, error) {
  params := &ecs.ListTaskDefinitionsInput{
    MaxResults: aws.Int64(100),
  }
  resp, err := ecs_svc.ListTaskDefinitions(params)
  return resp.TaskDefinitionArns, err
}

