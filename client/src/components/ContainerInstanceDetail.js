import React, { PropTypes } from 'react';

import moment from 'moment';

import { shortArn } from '../helpers/aws';
import { uptimeString } from '../helpers/time';
import * as defaultStyles from '../styles/default';


import Bar from './common/Bar';
import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';



const ContainerInstanceDetail = ({ instance }) => {

  const { ec2Instance, containerInstance } = instance;
  const styles = {
    container: {
      marginBottom: defaultStyles.primaryAbsoluteSpace,
    }
  };


  return (
    <MetricGroup title={`Container Instance ${containerInstance.containerInstanceArn}`} style={styles.container} >
      <MetricGroup title={`EC2 Instance: ${ec2Instance.instanceId}`} >
        <FlowedMetric title="Uptime" value={uptimeString(ec2Instance.launchTime)} />
        <FlowedMetric title="Launch" value={moment.unix(ec2Instance.launchTime).toISOString()} />
      </MetricGroup>
      <MetricGroup title="AMI">
        <FlowedMetric title="AMI ID" value={ec2Instance.imageId} />
        <FlowedMetric title="Image Arch" value={ec2Instance.architecture} />
      </MetricGroup>
      <MetricGroup title="IAM" >
        <FlowedMetric title="Profile" value={shortArn(ec2Instance.iamInstanceProfile.arn)} />
        <FlowedMetric title="Key" value={ec2Instance.keyName} />
      </MetricGroup>
    </MetricGroup>
  );
};


ContainerInstanceDetail.propTypes = {
  instance: PropTypes.object.isRequired,

};

ContainerInstanceDetail.defaultProps = {
  aProp: "Remove me"
};

export default ContainerInstanceDetail;
