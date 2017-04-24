import React, { PropTypes } from 'react';

import moment from 'moment';

import { shortArn } from '../helpers/aws';
import { uptimeString } from '../helpers/time';
import { mergeStyles } from '../helpers/ui';
import * as defaultStyles from '../styles/default';

import FlexContainer from './common/FlexContainer';
import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';

const ContainerInstanceDetail = ({ instance, style }) => {

  const { ec2Instance } = instance;
  const styles = {
    container: {
      marginBottom: defaultStyles.rowGutter,
      // outline: "1px solid green"
    }
  };
  const mergedStyles = mergeStyles(styles, style, "container");

  return (
    <FlexContainer style={mergedStyles.container}>
{/*}    <MetricGroup title={`Container Instance ${containerInstance.containerInstanceArn}`} style={mergedStyles.container} > {*/}
      <MetricGroup title={`EC2 Instance: ${ec2Instance.instanceId}`} columns={4} >
        <FlowedMetric title="Uptime" value={uptimeString(ec2Instance.launchTime)} columns={4}/>
        <FlowedMetric title="Launch" value={moment.unix(ec2Instance.launchTime).format()} columns={4} />
      </MetricGroup>
      <MetricGroup title="AMI" columns={3}>
        <FlowedMetric title="AMI ID" value={ec2Instance.imageId} columns={3}/>
        <FlowedMetric title="Image Arch" value={ec2Instance.architecture} columns={3} />
      </MetricGroup>
      <MetricGroup title="IAM" columns={2} >
        <FlowedMetric title="Profile" value={shortArn(ec2Instance.iamInstanceProfile.arn)} columns={2}/>
        <FlowedMetric title="Key" value={ec2Instance.keyName} columns={2}/>
      </MetricGroup>
{/*}    </MetricGroup> {*/}
    </FlexContainer>
  );
};

ContainerInstanceDetail.propTypes = {
  instance: PropTypes.object.isRequired,
  style: PropTypes.object,
};

ContainerInstanceDetail.defaultProps = {
  style: {},
};

export default ContainerInstanceDetail;
