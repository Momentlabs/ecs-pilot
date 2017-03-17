import React, { PropTypes } from 'react';

// import * as defaultStyles from '../styles/default';
import { mergeStyles } from '../helpers/ui';
import * as defaultStyles from '../styles/default';

import { registeredCpuValue,registeredMemoryValue,
         remainingCpuValue, remainingMemoryValue,
       } from '../ecs/instance';



import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';

const InstanceComputeResourceDetail = ({ instance, style }, context) => {

  const ci = instance.containerInstance;
  const styles = {
    container: {
      marginBottom: defaultStyles.primaryAbsoluteSpace
      // outline: "0px solid black"
    }
  };
  const mergedStyles = mergeStyles(styles, style, "container");

  return (
    <MetricGroup title="Instance Compute Resources" style={mergedStyles.container}>
      <MetricGroup title="CPU">
        <FlowedMetric title="Registered" value={registeredCpuValue(ci)} />
        <FlowedMetric title="Remaining" value={remainingCpuValue(ci)} />
        <FlowedMetric title="Used" value={registeredCpuValue(ci) - remainingCpuValue(ci)} />
      </MetricGroup>
      <MetricGroup title="Memory">
        <FlowedMetric title="Registered" value={registeredMemoryValue(ci)} />
        <FlowedMetric title="Remaining" value={remainingMemoryValue(ci)} />
        <FlowedMetric title="Used" value={registeredMemoryValue(ci) - remainingMemoryValue(ci)} />
      </MetricGroup>
    </MetricGroup>
  );
};


InstanceComputeResourceDetail.propTypes = {
  instance: PropTypes.object
};

InstanceComputeResourceDetail.defaultProps = {
  instance: {}
};

export default InstanceComputeResourceDetail;
