import React, { PropTypes } from 'react';
// import { Link, IndexLink } from 'react-router';


import { Card, CardHeader, CardText } from 'material-ui/Card';

// import Instance from '../ecs/instance';
import InstancesCard from './InstancesCard';

export default class ClusterCard extends React.Component {

  constructor(props, context) {
    super(props, context);
    // this.state = {instances: undefined};
    // this.componentWillMount = this.componentWillMount.bind(this);
    // this.render = this.render.bind(this);
  }
  
// componentWillMount() {
//   console.log("ClusterCard:willMount(). State: ", this.state);
//   this.setState({
//     instances: undefined
//   });

//   Instance.getInstances(this.props.cluster.clusterName)
//   .then( (instancesResponse) => {
//     console.log("ClusterCard got instance data from server.")
//     let responseData = instancesResponse.data;
//     this.setState({instances: responseData});
//   })
//   .catch( (error) => {
//     console.log("ClusterCard:componentWillMount(getInstances():PromiseResolution: Error", error);
//     throw(error);
//   }); // TODO add better error handling on timeout.
// }

  render() {
    let cluster = this.props.cluster;
    return (
      <Card>
        <CardHeader title={"Cluster: " + cluster.clusterName} subtitle={cluster.clusterArn} />
        <InstancesCard clusterName={cluster.clusterName}/>
        <CardText />
      </Card>
    );
  }
}

ClusterCard.propTypes = {
  cluster: PropTypes.object.isRequired
};

