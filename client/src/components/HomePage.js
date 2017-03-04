import React from 'react'; 

import {Card, CardHeader } from 'material-ui/Card';
import ClustersCard from '../containers/ClustersCard';

const HomePage = () => {
  return (
    <Card style={{padding: "1em"}}>
      <CardHeader title="ECS Pilot" subtitle="Welcome" actAsExpander={false} showExpandableButton={false} />
      <ClustersCard />
    </Card>
  );
};

export default HomePage;
