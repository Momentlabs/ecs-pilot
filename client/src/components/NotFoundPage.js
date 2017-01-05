import React from 'react';
import { Link, browserHistory } from 'react-router';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';

const buttonStyle = { margin: 12 };
// Since this component is simple and static, there's no parent container for it.
const NotFoundPage = () => {
  return (
    <Card className="container-fluid">
      <CardHeader title="Our Bad!" subtitle={'"' + browserHistory.getCurrentLocation().pathname + '" is invalid!'}/>
      <CardText>Couldn't find what you were looking for, plasee try again.</CardText>
      <Link to="/">
        <RaisedButton label="Home" primary={true} style={buttonStyle} />
      </Link>
    </Card>
  );
};

export default NotFoundPage;