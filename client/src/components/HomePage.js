import React, { PropTypes } from 'react'; 

import {Card, CardHeader, CardText} from 'material-ui/Card';
import ClustersCard from '../containers/ClustersCard';
// import {Link} from 'react-router';

// Since this component is simple and static, there's no parent container for it.
const HomePage = (props) => {
  const { userName, nickname } = props;
  let displayName = (nickname) ? nickname : userName;
  displayName = (displayName) ? displayName : "";

  return (
    <Card style={{padding: "1em"}}>
      <CardHeader title="ECS Pilot" subtitle="Welcome" actAsExpander={false} showExpandableButton={false} />
      <ClustersCard />
    </Card>
  );
};

export default HomePage;
