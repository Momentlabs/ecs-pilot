import React from 'react';
// import {Link} from 'react-router';
import {Card, CardHeader, CardText} from 'material-ui/Card';

// Since this component is simple and static, there's no parent container for it.
const AboutPage = () => {
  return (
    <Card>
      <CardHeader title="Momentlabs"/>
        <CardText>We are building great things for developers and consumers.</CardText>
    </Card>
  );
};

export default AboutPage;