import React, { PropTypes } from 'react';

import * as defaultStyles from '../styles/default';

import FlexContainer from './common/FlexContainer';
import FlowedMetric from './common/FlowedMetric';
import MetricGrid from './common/MetricGrid';
import GridTitle from './common/GridTitle';

import { CardTitle } from 'material-ui/Card';

const SessionId = ({ accountAlias, accountId, userId, region, totalClusters, totalRunningTasks, totalInstances }) => {

  const styles = {
    container: {
      padding: defaultStyles.primaryAbsoluteSpace,
      // outline: "2px solid red"
    },
    metricGroup: {
      marginRight: defaultStyles.columnGutter
    },
    accountDetail: {
      alignSelf: "flex-start",
      // outline: "1px solid black"
    },
    regionDetail: {
      alignSelf: "flex-start",
      textAlign: "right",
      // outline: "1px solid black"
    }
  };

  return (
    <FlexContainer flexWrap="wrap" justifyContent="space-between" style={styles.container}>
      <MetricGrid title="Amazon Web Services" style={styles.metricGroup} columns={5}>
        <GridTitle title="Amazon Web Services" />
        <FlowedMetric title="AWS Account" value={accountId}  width="auto" columns={2}  />
        <FlowedMetric title="Region" value={region} width="auto" columns={2} />
      </MetricGrid>
      <MetricGrid columns={4} >
        <GridTitle title="Clusters" />
        <FlowedMetric value={totalClusters} title="Clusters" />
        <FlowedMetric value={totalInstances} title="Instances" />
        <FlowedMetric value={totalRunningTasks} title="Tasks" />
      </MetricGrid>
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
