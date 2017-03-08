import React from 'react'; 
import { connect } from 'react-redux'

import {Card, CardHeader } from 'material-ui/Card';
import ClustersCard from '../containers/ClustersCard';
import SessionId from './SessionID';
const HomePage = ({ sessionId }) => {
  console.log("HomePage:render()", "sessionId:", sessionId);
  const accountAlias = (sessionId &&
                        sessionId.accountAliases && 
                        (sessionId.accountAliases.length > 0)) ? sessionId.accountAliases[0] : "Account";
  const accountNumber = (sessionId && sessionId.accountNumber) ? sessionId.accountNumber : "";
  const region = (sessionId && sessionId.region)  ? sessionId.region : "<Unknown>";
  const userId = (sessionId && sessionId.userId) ? sessionId.userId : "<Unknown>";

  return (
    <Card style={{padding: "1em"}}>
{/*      <CardHeader title="ECS Pilot" subtitle="Welcome" actAsExpander={false} showExpandableButton={false} /> */}
      <SessionId 
        accountAlias={accountAlias}
        accountId={accountNumber}
        region={region}
        userId={userId}
      />
      <ClustersCard />
    </Card>
  );
};

const mapStateToProps = (state, ownProps) => {
  console.log("HomePage#mapStateToProps()", "state:", state, "ownProps:", ownProps);
  const { sessionId } = state;
  return { sessionId: sessionId };
}

export default connect(mapStateToProps)(HomePage);
// export default HomePage;
