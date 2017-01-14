// import React, { PropTypes } from 'react';
import React from 'react';
// import { Link, IndexLink } from 'react-router';

import { Card, CardHeader } from 'material-ui/Card';
import { Tabs, Tab } from 'material-ui/Tabs';

import Cluster from '../ecs/cluster';
import ClusterList from '../components/ClusterList';
import ClusterCard from './ClusterCard';

const CLUSTER_TAB = "Clusters";

export default class ClustersCard extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      // this sets the tab that we view on render, so setting
      // it here means we view this tab initially.
      value: CLUSTER_TAB, 
      clusters: [],
      clusterTabNames: new Set()
    };

    this.onCellClick = this.onCellClick.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.clustersTab = this.clustersTab.bind(this);
    this.newClusterTab = this.newClusterTab.bind(this);
    this.tabs = this.tabs.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    console.log("ClustersCard:constructor()");
  }

  componentWillMount() {
    console.log("ClustersCard:willMount(). State: ", this.state);
    this.setState({
      clusters: [],
    });

    Cluster.getClusters()
    .then((clustersResponse) => {
      console.log("ClustersCard:willMount - Clusters: ", clustersResponse);
      this.setState({
        clusters: clustersResponse.data
      });
    })
    .catch((error) => {throw(error);}); // TODO add better error handling on timeout.
  }

  componentWillUnmount() {
    console.log("ClustersCard:willUnmount(). State:", this.state);
    this.setState({
      clusters: [],
    });
  }

  // We push the name of the cluster we've created a tab for onto the array carried around
  // by state.
  // this.tabs() will render these when called to.
  onCellClick (rowNumber, columnId) {
    let cluster = this.state.clusters[rowNumber];
    console.log("ClustersCard:onCellClick - row column", rowNumber, columnId, ", cluster:", cluster.clusterName);
    this.state.clusterTabNames.add(cluster.clusterName);
    this.setState({
      // Adding a cluster to render details in a new tab.
      clusterTabNames: this.state.clusterTabNames, 
      // switch to that cluster immediately.
      value: cluster.clusterName});
  }

  handleTabChange (value) {
    console.log("ClustersCard:handleTabChange() - value", value);
    this.setState({value: value});
  }

  // This is the "home" list of clusters. It's always rendered.
  clustersTab() {
    const clusters = this.state.clusters;
    console.log("ClustersCard:clustersTab() = State:", this.state, "Clusters:", clusters);
    let sub = "There are no clusters in this region.";
    if (clusters.length > 0) {
      sub = `There are ${clusters.length} clusters in this region.`;
    }
    return(
      <Tab key={"Cluster"} label={"Clusters"} value={CLUSTER_TAB} style={{"textTransform": "none"}}>
        <Card style={{margin: "0em"}}>
          <CardHeader title="Clusters" subtitle={sub} actAsExpander={false} showExpandableButton={false} />
            {(clusters.length > 0) ? <ClusterList onCellClick={this.onCellClick} clusters={this.state.clusters}/> : <div/>}
        </Card>
      </Tab>
    );
  }

  // Render a tab to describe a cluster.
  newClusterTab(cluster) {
    console.log("ClustersCard:newClusterTab() - State: ", this.state, "Cluster:",cluster);
    let name = cluster.clusterName;
    return (
      <Tab key={name} label={name} value={name} style={{"textTransform": "none"}}>
        <ClusterCard cluster={cluster} />
      </Tab>
    );
  }

  // Produce the array of tabs that we will render will use.
  tabs() {
    console.log("ClustersCard:tabs() - State:", this.state);

    // start off with the list of clusters always as the first (and in the begining, only, tab)
    let tabs = [this.clustersTab()]; 

    // Then for each cluster we've chosen to display, get the cluster data.
    let tabClusters = Array.from(this.state.clusterTabNames).map( (clusterName) => {
      console.log("ClustersCard:tabs() - looking for a cluster named:", clusterName);
      return this.state.clusters.find( (cluster) => cluster.clusterName === clusterName );
    });

    // for each cluster we've got data for render the tab and put the results into the tabs array.
    console.log("ClustersCard:tabs() after the maps - tabClusters:", tabClusters);
    tabClusters.map( (cluster) => this.newClusterTab(cluster) ).map( (clusterTab) => tabs.push(clusterTab));

    return tabs;
  }

  render() {
    console.log("ClustersCard:render() - State:", this.state);
    return (
      <Tabs label="Clusters" onChange={this.handleTabChange} value={this.state.value} >
        {this.tabs()}
      </Tabs>
    );
  }
}

// ClustersCard.propTypes = {
//   clusters: PropTypes.array,
// };
