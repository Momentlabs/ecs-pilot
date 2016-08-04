package awslib

import (
  // "strings"
  "fmt"
  // "errors"
  // "time"  
  // "io"
  "encoding/base64"
  "github.com/aws/aws-sdk-go/aws"
  // "github.com/aws/aws-sdk-go/aws/session"
  // "github.com/aws/aws-sdk-go/service/ecs"
  "github.com/aws/aws-sdk-go/service/ec2"
  // "github.com/spf13/viper"
  // "github.com/op/go-logging"
)


// Returns a map of *ec2.Instance keyed on the associated InstanceId.
func DescribeEC2Instances(ciMap ContainerInstanceMap, ec2_svc *ec2.EC2) (map[string]*ec2.Instance, error) {
  // ec2_svc := ec2.New(session.New(config))
  params := &ec2.DescribeInstancesInput {
    DryRun: aws.Bool(false),
    InstanceIds: ciMap.GetEc2InstanceIds(),
  }
  instances := make(map[string]*ec2.Instance)
  resp, err := ec2_svc.DescribeInstances(params)
  if err == nil {
    for _, reservation := range resp.Reservations {
      for _, instance := range reservation.Instances {
       instances[*instance.InstanceId] = instance
      }
    }
  }
  return instances, err
}

// func GetSecurityGrouoDescriptions(groupNames []*string, config *aws.Config ) ([]*ec2.SecurityGroup, error) {
//   ec2_svc := ec2.New(session.New(config))
//   params := &ec2.DescribeSecurityGroupsInput{
//     DryRun: aws.Bool(false),
//     GroupNames: groupNames,
//   }
//   resp, err := ec2_svc.DescribeSecurityGroups(params)
//   groups := []*ec2.SecurityGroup{}
//   if err != nil {
//     groups = resp.SecurityGroups
//   }
//   return groups, err
// }


func LaunchInstanceWithTags(clusterName string, tags []*ec2.Tag, ec2Svc *ec2.EC2) (*ec2.Reservation, error) {

  res, err := LaunchInstance(clusterName, ec2Svc)
  if err == nil {
    params := &ec2.DescribeInstancesInput{
      DryRun: aws.Bool(false),
      Filters: []*ec2.Filter{ 
        { 
          Name: aws.String("reservation-id"),
          Values: []*string{res.ReservationId,},
        },
      },
    }
    err = ec2Svc.WaitUntilInstanceExists(params)
    if err == nil {
      instanceIds := []*string{}
      for _, instance := range res.Instances {
        instanceIds = append(instanceIds, instance.InstanceId)
      }
      params := &ec2.CreateTagsInput{
        DryRun: aws.Bool(false),
        Resources: instanceIds,
        Tags: tags,
      }
      _, _ = ec2Svc.CreateTags(params)
    }
  }

  return res, err
}

// 
// TODO
// This needs to be refactored:
// 1. Remove cluster name
// 2. Need to find a middle ground in providing configuration inputs between everything in RunInstancesInput and
//    what we currently have.
func LaunchInstance(clusterName string, ec2Svc *ec2.EC2) (*ec2.Reservation, error) {

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

  resp, err := ec2Svc.RunInstances(params)
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

//
// Obviously this all needs to be paramaterized.
// Not yet sure how we're going to do this.
// Some set of named configuration infomration available in 
// some files somewhere but that all might want to Llive a level up
// in which case each of these things might need to be put into 
// some structure that is passed into the LaunchInstance Methods.
//

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

func OnInstanceRunning(reservation *ec2.Reservation, ec2_svc *ec2.EC2, do func(error)) {
  go func() {
    params := &ec2.DescribeInstancesInput{
      DryRun: aws.Bool(false),
      Filters: []*ec2.Filter{ 
        { 
          Name: aws.String("reservation-id"),
          Values: []*string{reservation.ReservationId,},
        },
      },
    }
    err := ec2_svc.WaitUntilInstanceRunning(params)
    do(err)
  }()
}

func TerminateInstance(instanceId *string, ec2Svc *ec2.EC2) (*ec2.TerminateInstancesOutput, error) {
  params := &ec2.TerminateInstancesInput{
    InstanceIds: []*string{ aws.String(*instanceId) },
    DryRun: aws.Bool(false),
  }
  resp, err := ec2Svc.TerminateInstances(params)
  return resp, err
}

func OnInstanceTerminated(instanceId *string, ec2Svc *ec2.EC2, do func(error)) {
  go func() {
    params := &ec2.DescribeInstancesInput{
      DryRun: aws.Bool(false),
      InstanceIds: []*string{instanceId,},
    }
    err := ec2Svc.WaitUntilInstanceTerminated(params)
    do(err)
  }()
}
