import React, { PropTypes } from 'react';

// import * as defaultStyles from '../styles/default';
import { mergeStyles } from '../helpers/ui';
import * as defaultStyles from '../styles/default';

import { registeredCpuValue,registeredMemoryValue,
         remainingCpuValue, remainingMemoryValue,
       } from '../ecs/instance';



import FlexContainer from './common/FlexContainer';
import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';

const InstanceComputeResourceDetail = ({ instance, style }) => {

  const ci = instance.containerInstance;
  const styles = {
    container: {
      marginBottom: defaultStyles.rowGutter,
      // outline: "0px solid black"
    }
  };
  const mergedStyles = mergeStyles(styles, style, "container");

  return (
    <FlexContainer style={mergedStyles.container} >
{/*}    <MetricGroup title="Instance Compute Resources" style={mergedStyles.container}> {*/}
      <MetricGroup title="CPU" columns={2} >
        <FlowedMetric title="Registered" value={registeredCpuValue(ci)} columns={2} />
        <FlowedMetric title="Remaining" value={remainingCpuValue(ci)} columns={2} />
        <FlowedMetric title="Used" value={registeredCpuValue(ci) - remainingCpuValue(ci)} columns={2} />
      </MetricGroup>
      <MetricGroup title="Memory" columns={2} >
        <FlowedMetric title="Registered" value={registeredMemoryValue(ci)}  columns={2} />
        <FlowedMetric title="Remaining" value={remainingMemoryValue(ci)} columns={2} />
        <FlowedMetric title="Used" value={registeredMemoryValue(ci) - remainingMemoryValue(ci)} columns={2}/>
      </MetricGroup>
{/*}    </MetricGroup> {*/}
    </FlexContainer>
  );
};


InstanceComputeResourceDetail.propTypes = {
  style: PropTypes.object,
  instance: PropTypes.object
};

InstanceComputeResourceDetail.defaultProps = {
  style: {},
  instance: {}
};

export default InstanceComputeResourceDetail;
