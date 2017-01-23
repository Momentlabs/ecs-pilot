import React, { PropTypes } from 'react';
// import { Link, IndexLink } from 'react-router';


import { Card, CardHeader, CardText } from 'material-ui/Card';

import InstancesCard from './InstancesCard';
import Tasklist from './Tasklist';

export default class ClusterCard extends React.Component {

  static propTypes = {
    cluster: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context);
  }

  render() {
    const {cluster} = this.props;
    return (
      <Card>
        <CardHeader title={"Cluster: " + cluster.clusterName} subtitle={cluster.clusterArn} />
        <InstancesCard clusterName={cluster.clusterName}/>
        <Tasklist clusterName={cluster.clusterName} />
        <CardText />
      </Card>
    );
  }
}
