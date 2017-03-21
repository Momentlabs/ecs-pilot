import React, { PropTypes } from 'react';

import * as defaultStyles from '../styles/default';
import { mergeStyles } from '../helpers/ui';

import { containerEnvironmentTableData } from '../ecs/deepTask';

import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';
import SimpleTable from './common/SimpleTable';

function compare(a,b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

const ContainerEnvironmentDetails = ({ deepTask, style }) => {

  const styles = {
    container: {
      marginBottom: defaultStyles.primaryAbsoluteSpace,
      background: defaultStyles.metricBackgroundColor,
      outline: "0px solid black"
    },
    tableContainer: {
      backgroundColor: defaultStyles.metricBackgroundColor,
      marginBottom: defaultStyles.primaryAbsoluteSpace,
    }
  };
  const mergedStyles = mergeStyles(styles, style, "container");

  const data={
    header: ["Container", "Key", "Value", "Override"],
    rows: containerEnvironmentTableData(deepTask)
  };
  data.rows.sort( (a, b) => compare(a[1], b[1]));

  return (
    <MetricGroup title="Container Environments" style={mergedStyles.container}>
      <MetricGroup style={mergedStyles.tableContainer} >
        <SimpleTable data={data} />
      </MetricGroup>
    </MetricGroup>
  );
};

ContainerEnvironmentDetails.propTypes = {
  deepTask: PropTypes.object.isRequired,
  style: PropTypes.object
};

ContainerEnvironmentDetails.defaultProps = {
  style: {}
};

export default ContainerEnvironmentDetails;
