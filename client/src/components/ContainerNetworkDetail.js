import React, { PropTypes } from 'react';

import * as defaultStyles from '../styles/default';
import { mergeStyles } from '../helpers/ui';
import { containerBindingsTableData, containerLinksTableData } from '../ecs/deepTask';
import { containerResourceTableData, containerULimitsTableData } from '../ecs/deepTask';

import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';
import SimpleTable from './common/SimpleTable';
// import ContainerBindingsDetail from './ContainerBindingsDetail';



const ContainerNetworkDetail = ({ deepTask, style }) => {

  const styles = {
    container: {
      marginBottom: defaultStyles.primaryAbsoluteSpace,
      outline: "0px solid black"
    }, 
    table: {
      backgroundColor: defaultStyles.metricBackgroundColor
    }
  };
  const mergedStyles = mergeStyles(styles, style, "container");

  return (
    <MetricGroup title="Container Network" style={mergedStyles.container}>
      <MetricGroup title="Port Bindings">
        <SimpleTable data={containerBindingsTableData(deepTask)} style={mergedStyles.table} />
      </MetricGroup>
      <MetricGroup title="ContainerLinks" >
        <SimpleTable data={containerLinksTableData(deepTask)} style={mergedStyles.table} />
      </MetricGroup>
      <MetricGroup title="Compute Resources" >
        <SimpleTable data={containerResourceTableData(deepTask)} style={mergedStyles.table} />
      </MetricGroup>
      <MetricGroup title="ULimits" >
        <SimpleTable data={containerULimitsTableData(deepTask)} style={mergedStyles.table} />
      </MetricGroup>
    </MetricGroup>
  );
};

//       {Object.keys(bindings).map( (cName) => <ContainerBindingsDetail bindings={bindings[cName]} name={cName}/>)}

ContainerNetworkDetail.propTypes = {
  deepTask: PropTypes.object.isRequired,
  style: PropTypes.object
};

ContainerNetworkDetail.defaultProps = {
  style: {}
};

export default ContainerNetworkDetail;
