import React, { PropTypes } from 'react';

import * as defaultStyles from '../styles/default';
import { mergeStyles } from '../helpers/ui';

import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';


const EC2NetworkDetail = ({ instance, style }, context) => {

  console.log("EC2NetworkDEtails", "style:", style);
  const { ec2Instance } = instance;
  const styles = {
    container: {
      marginBottom: defaultStyles.primaryAbsoluteSpace,
      // boxShadow: defaultStyles.shadow,
      // outline: "0px solid black"
    },
    group: {

    }
  };
  const mergedStyles = mergeStyles(styles, style, "container");

  return (
    <MetricGroup title="Network" style={mergedStyles.container}>
      <MetricGroup title="Public Network"  style={mergedStyles.group} >
        <FlowedMetric title="Public IP" value={ec2Instance.ipAddress} />
      </MetricGroup>
      <MetricGroup title="Virtual Private Network" >
        <FlowedMetric title="Private IP" value={ec2Instance.privateIpAddress} />
        <FlowedMetric title="VPC ID" value={ec2Instance.vpcId} />
        <FlowedMetric title="Subnet" value={ec2Instance.subnetId} />
      </MetricGroup>
    </MetricGroup>
  );
};


EC2NetworkDetail.propTypes = {
  instance: PropTypes.object.isRequired,
};

EC2NetworkDetail.defaultProps = {
};

export default EC2NetworkDetail;
