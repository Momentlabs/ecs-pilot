// import React, { PropTypes } from 'react';
import React from 'react';
// import { Link, IndexLink } from 'react-router';

import Cluster from '../ecs/cluster';

import { Card, CardHeader } from 'material-ui/Card';
import ClusterList from '../components/ClusterList';

export default class ClustersCard extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.onCellClick=this.onCellClick.bind(this);
  }

  componentWillMount() {
    this.setState({clusters: []});
    Cluster.getClusters()
    .then((clusters) => this.setState({clusters: clusters }))
    .catch((error) => {throw(error);}); // TODO add better error handling on timeout.
  }

  onCellClick (rowNumber, columnId) {
    console.log("onCellClick", rowNumber, columnId);
  }

  render() {
    const clusters = this.state.clusters;
    let sub = "There are no clusters in this region.";
    if (clusters.length > 0) {
      sub = `There are ${clusters.length} clusters in this region.`;
    }
    
    return (
      <Card style={{margin: "1em"}}>
        <CardHeader title="Clusters" subtitle={sub} actAsExpander={false} showExpandableButton={false} />
        <ClusterList onCellClick={this.onCellClick} clusters={clusters}/>
      </Card>
    );
  }
}

// ClustersCard.propTypes = {
//   clusters: PropTypes.array,
// };
