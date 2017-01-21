import React, { PropTypes }from 'react';
import  * as clusterActions from '../actions/cluster';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'material-ui/Card';
import { Tabs, Tab } from 'material-ui/Tabs';

import ClusterList from '../components/ClusterList';
import ClusterCard from './ClusterCard';


const CLUSTER_TAB = "Clusters";
class ClustersCard extends React.Component {


  static defaultProps = {
    clusters:[]
  };

  static propTypes = {
    clusters: PropTypes.array,
    actions: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      value: CLUSTER_TAB,  // The tab we see on render.
      clusterTabNames: new Set() // a collection of tabNames that we are managing.
    };

    this.onCellClick = this.onCellClick.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.clustersTab = this.clustersTab.bind(this);
    this.newClusterTab = this.newClusterTab.bind(this);
    this.tabs = this.tabs.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    // console.log("ClustersCard:constructor()");
  }

  // componentWillReceiveProps(nextProps) {
  //   console.log("ClustersCard#componentWillReceiveProps - nextProps:", nextProps);
  // }

  componentWillMount() {
    console.log("ClustersCard:willMount()", "State:", this.state, "Props:", this.props);
    this.props.actions.requestClusters();
  }

  // We push the name of the cluster we've for which we've created a tab
  // onto the array carried around by state.
  // this.tabs() will render these when called to.
  //  onCellClick(rowNumber, columnId) (we're not using column right now.)
  onCellClick (rowNumber) {
    let cluster = this.props.clusters[rowNumber];
    // console.log("ClustersCard:onCellClick - row column", rowNumber, columnId, ", cluster:", cluster.clusterName);
    this.state.clusterTabNames.add(cluster.clusterName);
    this.setState({value: cluster.clusterName});
  }

  handleTabChange (value) {
    // console.log("ClustersCard:handleTabChange() - value", value);
    this.setState({value: value});
  }

  // This is the "home" list of clusters. It's always rendered.
  clustersTab() {
    const clusters = this.props.clusters;
    // console.log("ClustersCard:clustersTab() = State:", this.state, "Clusters:", clusters);
    let sub = "There are no clusters in this region.";
    if (clusters.length > 0) {
      sub = `There are ${clusters.length} clusters in this region.`;
    }
    return(
      <Tab key={"Cluster"} label={"Clusters"} value={CLUSTER_TAB} style={{"textTransform": "none"}}>
        <Card style={{margin: "0em"}}>
          <CardHeader title="Clusters" subtitle={sub} actAsExpander={false} showExpandableButton={false} />
            {(clusters.length > 0) ? <ClusterList onCellClick={this.onCellClick} clusters={this.props.clusters}/> : <div/>}
        </Card>
      </Tab>
    );
  }

  // Render a tab to describe a cluster.
  newClusterTab(cluster) {
    // console.log("ClustersCard:newClusterTab()", "State: ", this.state, "Cluster:",cluster);
    let name = cluster.clusterName;
    return (
      <Tab key={name} label={name} value={name} style={{"textTransform": "none"}}>
        <ClusterCard cluster={cluster} />
      </Tab>
    );
  }

  // Produce the array of cluster home tab and cluster description tabs to render.
  tabs() {
    // console.log("ClustersCard:tabs()", "State:", this.state, "Props:", this.props);

    // start off with the list of clusters always as the first (and in the begining, only, tab)
    let tabs = [this.clustersTab()]; 

    // Then for each cluster we've chosen to display, get the cluster data.
    let tabClusters = Array.from(this.state.clusterTabNames).map( (clusterName) => {
      // console.log("ClustersCard:tabs() - looking for a cluster named:", clusterName);
      return this.props.clusters.find( (cluster) => cluster.clusterName === clusterName );
    });

    // for each cluster we've got data for render the tab and put the results into the tabs array.
    // console.log("ClustersCard:tabs() after the maps - tabClusters:", tabClusters);
    tabClusters.map( (cluster) => this.newClusterTab(cluster) ).map( (clusterTab) => tabs.push(clusterTab));

    return tabs;
  }

  render() {
    console.log("ClustersCard:render()", "State:", this.state, "Props:", this.props);
    return (
      <Tabs label="Clusters" onChange={this.handleTabChange} value={this.state.value} >
        {this.tabs()}
      </Tabs>
    );
  }
}


const mapStateToProps = (state) => { 
  console.log("ClustersCard#mapStateToProps - state", state);
  return ({clusters: state.clusters}); 
};
const mapDispatchToProps = (dispatch, ownProps) => { 
  console.log("ClustersCard#mapDispatchToProps - ownProps", ownProps);
  return ({actions: bindActionCreators(clusterActions, dispatch)}); 
};

export default connect(mapStateToProps, mapDispatchToProps)(ClustersCard);
