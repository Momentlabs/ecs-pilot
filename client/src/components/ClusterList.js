import React, { PropTypes } from 'react';
import Cluster from '../ecs/cluster';

import { mergeStyles } from '../helpers/ui';
import * as defaultStyles from '../styles/default';
import { KeyGenerator } from '../helpers/ui';

import Bar from './common/Bar';
import MetricGrid from './common/MetricGrid';
import GridTitle from './common/GridTitle';
import FlowedMetric from './common/FlowedMetric';


function makeClickedOn(cluster, onClusterSelect) {
  return function() {
    onClusterSelect(cluster.clusterName);
  };
}

// TODO: Refactor ClusterList into ClusterItem and wherever ClusterList
// is currently being used, replace with the current ClusterList render
// or something like it.
// TODO: Similarly refactor this clusterBar into common/MetricBar (getting rid of what
// we currently have). Add the expandable functionality like in MetricGroup.
// then refactor Instances, Tasks to use these MetricBars.
const clusterBar = (c, onClusterSelect, k) => {
  const styles = {
    container: {
      // paddingBottom: defaultStyles.primaryAbsoluteSpace,
      marginBottom: defaultStyles.primaryAbsoluteSpace
    },
    metric: {
      // marginRight: defaultStyles.metricSeparator
    }
  };

  return(
  <Bar title={c.clusterName} subtitle={c.status} onSelect={makeClickedOn(c, onClusterSelect)} style={styles.container} key={k} >
      <MetricGrid title={`${c.clusterName}`} columns={6} >
        <GridTitle title={c.clusterName} subtitle={c.status} columns={2} />
        <FlowedMetric title="Instances" value={c.registeredContainerInstancesCount} defaultValue={0} />
        <FlowedMetric title="Services" value={c.activeServicesCount} defaultValue={0} />
        <FlowedMetric title="Pending" value={c.pendingTasksCount} defaultValue={0} />
        <FlowedMetric title="Running" value={c.runningTasksCount} defaultValue={0}/>
      </MetricGrid>
  </Bar>
  );
};

const ClusterList = ({clusters, onClusterSelect, style}) => {
  const styles = {
    container: {
      // outline: "1px solid black"
    }
  };
  const mergedStyles = mergeStyles(styles, style, "container");

  let k = new KeyGenerator();
  Cluster.byName(clusters);
  return ( 
    <div style={mergedStyles.container} >
      {clusters.map( (c) => clusterBar(c, onClusterSelect, k.nextKey()))}
    </div>
  );
};

ClusterList.propTypes = {
  clusters: PropTypes.array.isRequired,
  onClusterSelect: PropTypes.func
};

export default ClusterList;