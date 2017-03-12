import React, {PropTypes } from 'react';

import * as defaultStyles from '../styles/default';

import { totalRegisteredCPU, totalRemainingCPU, totalRegisteredMemory, totalRemainingMemory } from '../ecs/instance';
import { totalContainers, runningContainers } from '../ecs/deepTask';
import MetricBar from './common/MetricBar';
import MetricGroup from './common/MetricGroup'
import FlowedMetric from './common/FlowedMetric';
import GuageRechart from './common/GuageRechart';

import { CardTitle } from 'material-ui/Card';

const ClusterStatusCard = ({cluster, instances, deepTasks}) => {

  const styles = {
    container: {
      outline: "1px solid black"
    },
    metric: {
      width: defaultStyles.metricWidth,
      height: 77,
      marginRight: defaultStyles.metricSeparator,
    },
    lastMetric: {
      width: defaultStyles.metricWidth,
      height: 77,
      marginRight: 0,
    },
    gauge: {
      size: 50,
    }
  };
  let totalCPU = 100;
  let usedCPU = 0;
  let totalMem = 100;
  let usedMem = 0;
  if (deepTasks.length > 0) {
    totalCPU = totalRegisteredCPU(deepTasks);
    usedCPU = totalCPU - totalRemainingCPU(deepTasks);
    totalMem = totalRegisteredMemory(deepTasks);
    usedMem =  totalMem - totalRemainingMemory(deepTasks);
  }
  // const pendingTasks = (cluster.pendingTasksCount) ? cluster.pendingTasksCount : 0;
  const pendingTasks = 0;

  return (
    <CardTitle title={`Cluster: ${cluster.clusterName}`} subtitle={cluster.clusterArn}>
      <MetricBar >
        <MetricGroup title="Instance">
          <FlowedMetric title="Instances" value={instances.length} defaultValue={0} style={styles.lastMetric}/>
        </MetricGroup>
        <MetricGroup title="Task">
          <FlowedMetric title="Tasks" value={deepTasks.length} defaultValue={0} style={styles.metric} /> 
          <FlowedMetric title="Running" value={cluster.runningTasksCount} defaultValue={0} style={styles.metric} /> 
          <FlowedMetric title="Pending" value={pendingTasks} defaultValue={0} style={styles.lastMetric} /> 
        </MetricGroup>
        <MetricGroup title="Container">
          <FlowedMetric title="Containers" value={totalContainers(deepTasks)} defaultValue={0} style={styles.metric} /> 
          <FlowedMetric title="Running" value={runningContainers(deepTasks)} defaultValue={0} style={styles.lastMetric} /> 
        </MetricGroup>
        <MetricGroup title="Resource Reservation">
          <GuageRechart title="CPU" total={totalCPU} amount={usedCPU} size={styles.gauge.size}/>
          <GuageRechart title="Memory" total={totalMem} amount={usedMem} size={styles.gauge.size} />
        </MetricGroup>
      </MetricBar>
    </CardTitle>
  );
};

// ClusterStatusCard.contextTypes = {
//   muiTheme: PropTypes.object.isRequired
// };

// ClusterStatusCard.defaultProps = {
//   aProp: "Remove me"
// };

ClusterStatusCard.propTypes = {
  cluster: PropTypes.object.isRequired,
  instances: PropTypes.array.isRequired,
  deepTasks: PropTypes.array.isRequired
};

export default ClusterStatusCard;