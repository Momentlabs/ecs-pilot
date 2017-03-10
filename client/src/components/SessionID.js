import React, { PropTypes } from 'react';

import DetailCard from './common/DetailCard';
import FlexContainer from './common/FlexContainer';
import FlowedMetric from './common/FlowedMetric';
import MetricGroup from './common/MetricGroup';

const SessionId = ({ accountAlias, accountId, userId, region, totalClusters, totalRunningTasks, totalInstances }) => {

  const styles = {
    container: {
      // backgroundColor: "black",
      // outline: "2px solid red"
    },
    metric: {
      width: "6em",
      // height: "4em",
      marginRight: 5,
    },
    lastMetric: {
      width: "6em",
      // height: "4em",
      marginRight: 0,
    }
  };
  // const uid = userId == "" ? "Region" : userId;
  const uid = "Region";

  return (
    <FlexContainer flexWrap="wrap" justifyContent="space-between">
        <DetailCard title={accountAlias} subtitle={accountId} />
{/*    <FlexContainer> 
        <DetailCard title={accountAlias} subtitle={accountId} />
        <DetailCard title={uid} subtitle={region} />
      </FlexContainer> */}
      <MetricGroup title="Clusters">
        <FlowedMetric style={styles.metric} value={totalClusters} title="Clusters" />
        <FlowedMetric style={styles.metric} value={totalInstances} title="Instances" />
        <FlowedMetric style={styles.lastMetric} value={totalRunningTasks} title="Tasks" />
      </MetricGroup>
        <DetailCard title={uid} subtitle={region} />
    </FlexContainer>
  );
};

SessionId.propTypes = {
  accountAlias: PropTypes.string.isRequired,
  accountId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  region: PropTypes.string.isRequired,
  totalClusters: PropTypes.number.isRequired,
  totalRunningTasks: PropTypes.number.isRequired,
  totalInstances: PropTypes.number.isRequired,
};

export default SessionId;
