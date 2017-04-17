import React, {PropTypes } from 'react';

import * as defaultStyles from '../styles/default';

import { totalRegisteredCPU, totalRemainingCPU, totalRegisteredMemory, totalRemainingMemory } from '../ecs/instance';
import { totalContainers, runningContainers } from '../ecs/deepTask';
import Bar from './common/Bar';
import MetricGrid from './common/MetricGrid';
import GridTitle from './common/GridTitle';
import FlowedMetric from './common/FlowedMetric';
import GuageRechart from './common/GuageRechart';

const ClusterStatusCard = ({cluster, instances, deepTasks}) => {

  const styles = {
    container: {
      marginTop: defaultStyles.primaryAbsoluteSpace, // TODO: Fix the spacing on the TAB to get rid of this.
      marginBottom: defaultStyles.primaryAbsoluteSpace,
      // outline: "1px solid black"
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
      <Bar title={`Cluster: ${cluster.clusterName}`} subtitle={cluster.clusterArn} style={styles.container} >
        <MetricGrid columns={6} >
          <GridTitle title="Instance" />
          <FlowedMetric title="Instances" value={instances.length} defaultValue={0}  />

          <GridTitle title="Task" />
          <FlowedMetric title="Tasks" value={deepTasks.length} defaultValue={0} /> 
          <FlowedMetric title="Running" value={cluster.runningTasksCount} defaultValue={0}  /> 
          <FlowedMetric title="Pending" value={pendingTasks} defaultValue={0}  /> 

          <GridTitle title="Container" />
          <FlowedMetric title="Containers" value={totalContainers(deepTasks)} defaultValue={0}  /> 
          <FlowedMetric title="Running" value={runningContainers(deepTasks)} defaultValue={0}  /> 
          <GridTitle title="Resource Reservation" />
          <GuageRechart title="CPU" total={totalCPU} amount={usedCPU} />
          <GuageRechart title="Memory" total={totalMem} amount={usedMem}  />
        </MetricGrid>
      </Bar>
  );
};

// ClusterStatusCard.defaultProps = {
//   aProp: "Remove me"
// };

ClusterStatusCard.propTypes = {
  cluster: PropTypes.object.isRequired,
  instances: PropTypes.array.isRequired,
  deepTasks: PropTypes.array.isRequired
};

export default ClusterStatusCard;