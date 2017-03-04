import React, {PropTypes } from 'react';

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
      width: "6em",
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

  return (
    <CardTitle title={`Cluster: ${cluster.clusterName}`} subtitle={cluster.clusterArn}>
      <MetricBar >
        <MetricGroup title="Instance">
          <FlowedMetric title="Instances" value={instances.length} width={styles.metric.width}/>
        </MetricGroup>
        <MetricGroup title="Task">
          <FlowedMetric title="Tasks" value={deepTasks.length} width={styles.metric.width} /> 
          <FlowedMetric title="Running" value={cluster.runningTasksCount} width={styles.metric.width} /> 
          <FlowedMetric title="Pending" value={cluster.pendingTasksCount} width={styles.metric.width} /> 
        </MetricGroup>
        <MetricGroup title="Container">
          <FlowedMetric title="Containers" value={totalContainers(deepTasks)} width={styles.metric.width} /> 
          <FlowedMetric title="Running" value={runningContainers(deepTasks)} width={styles.metric.width} /> 
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