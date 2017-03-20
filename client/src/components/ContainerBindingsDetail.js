import React, { PropTypes } from 'react';

import * as defaultStyles from '../styles/default';
import { mergeStyles } from '../helpers/ui';

import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';
import FlexContainer from './common/FlexContainer';



function renderBinding(bind) {
  return (
    <MetricGroup>
      <FlowedMetric title="IP" value={bind.bindIP} />
      <FlowedMetric title="Container" value={bind.containerPort} />
      <FlowedMetric title="Host" value={bind.hostPort} />
      <FlowedMetric title="Protocol" value={bind.protocol} />
    </MetricGroup>
  );
}

const ContainerBindingsDetail = ({ bindings, name, style }) => {

  const styles = {
    container: {
      marginBottom: defaultStyles.primaryAbsoluteSpace,
      outline: "0px solid black"
    }
  };
  const mergedStyles = mergeStyles(styles, style, "container");


  return (
    <MetricGroup title={`Container: ${name}`} style={mergedStyles.container} >
      <FlexContainer flexDirection="column" separateWidth={defaultStyles.smallAbsoluteSpace}>
        {bindings.map( (b) => renderBinding(b))}
      </FlexContainer>
    </MetricGroup>
  );
};


ContainerBindingsDetail.propTypes = {
  bindings: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
  style: PropTypes.object
};

ContainerBindingsDetail.defaultProps = {
  style: {}
};

export default ContainerBindingsDetail;
