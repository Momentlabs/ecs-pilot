import React, { PropTypes} from 'react'; 
import { connect } from 'react-redux';
import * as c from '../styles/colors';

import ClustersCard from '../containers/ClustersCard';
import SessionId from './SessionID';
const HomePage = ({ sessionId, totalClusters, totalRunningTasks, totalInstances }) => {
  // console.log("HomePage:render()", "sessionId:", sessionId);
  const accountAlias = (sessionId &&
                        sessionId.accountAliases && 
                        (sessionId.accountAliases.length > 0)) ? sessionId.accountAliases[0] : "AWS Account";
  const accountNumber = (sessionId && sessionId.accountNumber) ? sessionId.accountNumber : "";
  const region = (sessionId && sessionId.region)  ? sessionId.region : "<Unknown>";
  const userId = (sessionId && sessionId.userId) ? sessionId.userId : "";

  const styles = {
    conatiner: {
      // margin: "1em",
      padding: "1em",
      backgroundColor: c.metricBackground,
      outline: "1px solid black",
    }
  };

  return (
    <div style={styles.container}>
{/*      <CardHeader title="ECS Pilot" subtitle="Welcome" actAsExpander={false} showExpandableButton={false} /> */}
      <SessionId 
        accountAlias={accountAlias}
        accountId={accountNumber}
        userId={userId}
        region={region}
        totalClusters={totalClusters}
        totalRunningTasks={totalRunningTasks}
        totalInstances={totalInstances}
      />
      <ClustersCard />
    </div>
  );
};

HomePage.defaultProps = {
  totalClusters: 0,
  totalRunningTasks: 0,
  totalInstances: 0,
  sessionId: {}
};

HomePage.propTypes = {
  totalClusters: PropTypes.number,
  totalRunningTasks: PropTypes.number,
  totalInstances: PropTypes.number,
  sessionId: PropTypes.object
};

const mapStateToProps = (state) => {
  // console.log("HomePage#mapStateToProps()", "state:", state, "ownProps:", ownProps);
  const { sessionId, clusters } = state;
  return { 
    totalClusters: clusters.length,
    totalRunningTasks: clusters.reduce( (t,cnt) => t+cnt.runningTasksCount, 0),
    totalInstances: clusters.reduce( (t,cnt) => t+cnt.registeredContainerInstancesCount, 0),
    sessionId: sessionId
  };
};

export default connect(mapStateToProps)(HomePage);
// export default HomePage;
