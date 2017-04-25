import React from 'react';

import {Card, CardMedia, CardTitle } from 'material-ui/Card';

const LandingPage = () => {
  return (
    <Card>
      <CardMedia
        overlay={<CardTitle title="ECS Pilot" subtitle="Visualize and Control Your Clusters" />} 
      >
        <img src="/static/images/ContainerPilot.jpg" alt="Container ship pulled by pilot boat" />
      </CardMedia>
    </Card>
  );
};

export default LandingPage;
