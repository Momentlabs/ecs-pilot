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
      marginRight: defaultStyles.largerAbsoluteSpace,
    },
    webServicesMetrics: {
      marginRight: defaultStyles.metricSeparator,
    },
    lastWebServicesMetrics: {
      marginRight: 0,
    },
    metric: {
      width: defaultStyles.metricWidth,
      marginRight: defaultStyles.metricSeparator,
    },
    lastMetric: {
      width: defaultStyles.metricWidth,
      // height: "4em",
      marginRight: 0,
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
        <FlowedMetric title="AWS Account" value={accountId} valueFontSize="medium" style={styles.webServicesMetrics} />
        <FlowedMetric title="Region" value={region} valueFontSize="medium" sytle={styles.lastWebServicesMetricst}/>
      </MetricGroup>
      <MetricGroup title="Clusters">
        <FlowedMetric style={styles.metric} value={totalClusters} title="Clusters" />
        <FlowedMetric style={styles.metric} value={totalInstances} title="Instances" />
        <FlowedMetric style={styles.lastMetric} value={totalRunningTasks} title="Tasks" />
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
