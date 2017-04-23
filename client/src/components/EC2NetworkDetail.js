import React, { PropTypes } from 'react';

import * as defaultStyles from '../styles/default';
import { mergeStyles } from '../helpers/ui';

import FlexContainer from './common/FlexContainer';
import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';


const EC2NetworkDetail = ({ instance, style }) => {

  // console.log("EC2NetworkDEtails", "style:", style);
  const { ec2Instance } = instance;
  const styles = {
    container: {
      marginBottom: defaultStyles.rowGutter,
      // boxShadow: defaultStyles.shadow,
      // outline: "1px solid black"
    },
  };
  const mergedStyles = mergeStyles(styles, style, "container");

  return (
    <FlexContainer style={mergedStyles.container}>
      <MetricGroup title="Network" columns={4}>
        <FlowedMetric title="Public IP" value={ec2Instance.ipAddress} columns={2}/>
        <FlowedMetric title="Private IP" value={ec2Instance.privateIpAddress} columns={2}/>
        <FlowedMetric title="Subnet" value={ec2Instance.subnetId} columns={2} />
        <FlowedMetric title="VPC ID" value={ec2Instance.vpcId} columns={2}/>
      </MetricGroup>
    </FlexContainer>
  );
};


EC2NetworkDetail.propTypes = {
  style: PropTypes.object,
  instance: PropTypes.object.isRequired,
};

EC2NetworkDetail.defaultProps = {
  style:{}
};

export default EC2NetworkDetail;
