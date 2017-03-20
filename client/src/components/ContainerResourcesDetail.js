import React, { PropTypes } from 'react';

import * as defaultStyles from '../styles/default';
import { mergeStyles } from '../helpers/ui';
import { containerResourceTableData, containerULimitsTableData } from '../ecs/deepTask';
import { containerBindingsTableData, containerLinksTableData } from '../ecs/deepTask';


import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';
import SimpleTable from './common/SimpleTable';




const ContainerResourcesDetail = ({ deepTask, style }) => {

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
    <MetricGroup title="Container Resources" style={mergedStyles.container} tabTitle>
      <MetricGroup title="Port Bindings">
        <div style={mergedStyles.table} >
          <SimpleTable data={containerBindingsTableData(deepTask)} style={mergedStyles.table} />
        </div>
      </MetricGroup>
      <MetricGroup title="ContainerLinks" >
        <div style={mergedStyles.table} >
          <SimpleTable data={containerLinksTableData(deepTask)} style={mergedStyles.table} />
        </div>
      </MetricGroup>
      <MetricGroup title="Compute Resources" >
        <div style={mergedStyles.table} >
          <SimpleTable data={containerResourceTableData(deepTask)} style={mergedStyles.table} />
        </div>
      </MetricGroup>
      <MetricGroup title="ULimits" >
        <div style={mergedStyles.table} >
          <SimpleTable data={containerULimitsTableData(deepTask)} style={mergedStyles.table} />
        </div>
      </MetricGroup>
    </MetricGroup>
  );
};


ContainerResourcesDetail.propTypes = {
  deepTask: PropTypes.object.isRequired,
  style: PropTypes.object
};

ContainerResourcesDetail.defaultProps = {
  style: {}
};

export default ContainerResourcesDetail;
