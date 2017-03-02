import React, { PropTypes } from 'react';
// import {Link} from 'react-router';

import {Card, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';


const LandingPage = () => {

  const styles = {
    container: {
      outline: "0px solid black"
    }
  };

  return (
    <Card>
      <CardMedia
        overlay={<CardTitle title="ECS Pilot" subtitle="Visualize and Control Your Clusters" />} 
      >
        <img src="ContainerPilot.jpg" />
      </CardMedia>
    </Card>
  );
};

LandingPage.propTypes = {
  // aProp: PropTypes.string.isRequired,
  // children: PropTypes.element
};

LandingPage.defaultProps = {
  // aProp: "Remove me"
};

export default LandingPage;
