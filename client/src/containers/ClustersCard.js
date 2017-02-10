import React, { PropTypes }from 'react';

import  * as serverActions from '../actions/serverData';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'material-ui/Card';
import { Tabs, Tab } from 'material-ui/Tabs';
import FontIcon from 'material-ui/FontIcon';

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

    this.displayCluster = this.displayCluster.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.clustersTab = this.clustersTab.bind(this);
    this.newClusterTab = this.newClusterTab.bind(this);
    this.tabs = this.tabs.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    // this.tabClose = this.tabClose.bind(this);
    this.closeTab = this.closeTab.bind(this);
    this.makeCloseTab = this.makeCloseTab.bind(this);
  }

  // componentWillReceiveProps(nextProps) {
  //   console.log("ClustersCard#componentWillReceiveProps - nextProps:", nextProps);
  // }

  componentWillMount() {
    // console.log("ClustersCard:willMount()", "State:", this.state, "Props:", this.props);
    this.props.actions.requestClusters();
  }

  // We push the name of the cluster we've for which we've created a tab
  // onto the array carried around by state.
  // this.tabs() will render these when called to.
  //  onCellClick(rowNumber, columnId) (we're not using column right now.)
  displayCluster (rowNumber) {
    let cluster = this.props.clusters[rowNumber];
    // console.log("ClustersCard:displayCluster - row column", rowNumber, columnId, ", cluster:", cluster.clusterName);
    this.state.clusterTabNames.add(cluster.clusterName);
    this.props.actions.selectCluster(cluster.clusterName);
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
        <Card style={{margin: "0em", boxShadow: "unset"}}>
          <CardHeader title="Clusters" subtitle={sub} actAsExpander={false} showExpandableButton={false} />
            {(clusters.length > 0) ? <ClusterList onClusterSelect={this.displayCluster} clusters={this.props.clusters}/> : <div/>}
        </Card>
      </Tab>
    );
  }

  // need to pass the clustName into close a tab.
  makeCloseTab(clusterName) {
    return (event) => {
      this.closeTab(clusterName);
      this.props.actions.deselectCluster(clusterName);
    };
  }

  // Delete the cluster and set the current tab to the base.
  closeTab(clusterName){
    console.log("ClusterCard:tabClose()", "clusterName:", clusterName);
    this.state.clusterTabNames.delete(clusterName);
    this.setState({value: CLUSTER_TAB});
  }

  // Render a tab to describe a cluster.
  newClusterTab(cluster) {
    // console.log("ClustersCard:newClusterTab()", "State: ", this.state, "Cluster:",cluster);
    let name = cluster.clusterName;

    const styles = {
      tab: {
        textTransform: "none",
        // display: "WebkitBox",
        // display: "WebkitFlex",
        // display: 'flex',
        // flexDirection: 'row',
        // justifyContent: 'center',
        // alignItems: "center",
        // alignContent: 'center',
        // outline: "2px solid red",
      },
      cont: {
        // background: "blue",
        // width: 200,
        // display: "WebkitBox",
        // display: "WebkitFlex",
        // WebkitFlexDirection: "row",
        // flexDirection: "row",
        // justifyContent: "center",
        // alignItems: "center",
        // outline: "2px solid black"
      },
      label: {
        fontSize: "small",
        // paddingRight: 10,
        // outline: "2px solid red"
      },
      icon: {
        color: "white", 
        fontSize: "small",
        paddingLeft: 5,
        // outline: "2px solid red"
      }
    };
    let icon = <div style={styles.cont}><span style={styles.label}>{name}</span><FontIcon onClick={this.makeCloseTab(cluster.clusterName)} style={styles.icon} className="material-icons">clear</FontIcon></div>
    return (
      <Tab
        key={name} 
        value={name}
        label={icon}
        style={styles.tab}>
        <ClusterCard style={{dropShadow: "unset"}} cluster={cluster} />
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

  tabTemplate() {

  }

  render() {
    // console.log("ClustersCard:render()", "State:", this.state, "Props:", this.props);
    const styles = {
      tab: { // everything: title and content
        // outline: "2px solid green",
      },
      contentContainer: { // don't know!
        // outline: "3px solid red"
      },
      inkBar: { // highlight underbar of chosen container (background is the display color.)
        // color: "green",
        // background: "green", 
        // outline: "2px solid green",
      },
      tabTemplate: {// box containing all the insides of the tab (content I'd say)
        // outline: "0px solid purple",
      },
      tabItemContainer: { // box containing all tabs.
        // outline: "2px solid red",
      },
    };
    return (
      <Tabs
      style={styles.tab}
      // tabTemplate={this.tabTemplate}
      inkBarStyle={styles.inkBar}
      tabItemContainerStyle={styles.tabItemContainer}
      tabTemplateStyle={styles.tabTemplate}
      contentContainerStyle={styles.containerContainer}
      onChange={this.handleTabChange} 
      value={this.state.value} 
      children={this.tabs()}
      />
    );
  }
}


const mapStateToProps = (state) => { 
  // console.log("ClustersCard#mapStateToProps - state", state);
  return ({clusters: state.clusters}); 
};
const mapDispatchToProps = (dispatch, ownProps) => { 
  // console.log("ClustersCard#mapDispatchToProps - ownProps", ownProps);
  return ({actions: bindActionCreators(serverActions, dispatch)}); 
};

export default connect(mapStateToProps, mapDispatchToProps)(ClustersCard);
