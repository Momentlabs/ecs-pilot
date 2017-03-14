import React, { PropTypes } from 'react';

import * as defaultStyles from '../styles/default';

import DetailCard from './common/DetailCard';
import TitleBox from './common/TitleBox';
import FlexContainer from './common/FlexContainer';
import FlowedMetric from './common/FlowedMetric';
import MetricGroup from './common/MetricGroup';

import { CardTitle } from 'material-ui/Card';

const SessionId = ({ accountAlias, accountId, userId, region, totalClusters, totalRunningTasks, totalInstances }) => {

  const styles = {
    container: {
      padding: defaultStyles.primaryAbsoluteSpace,
      // outline: "2px solid red"
    },
    metricGroup: {
      marginRight: defaultStyles.largerAbsoluteSpace 
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
    <FlexContainer flexWrap="wrap" justifyContent="flex-start" style={styles.container}>
      <MetricGroup title="Amazon Web Services" style={styles.metricGroup} >
        <FlowedMetric title="AWS Account" value={accountId}  width="auto"  />
        <FlowedMetric title="Region" value={region} width="auto" />
      </MetricGroup>
      <MetricGroup title="Clusters">
        <FlowedMetric value={totalClusters} title="Clusters" />
        <FlowedMetric value={totalInstances} title="Instances" />
        <FlowedMetric value={totalRunningTasks} title="Tasks" />
      </MetricGroup>
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
