import React, { PropTypes } from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Cluster, { CLUSTER_ACTIVE } from '../ecs/cluster';
import * as colors from '../styles/colors';

const clusterRowFormat = ({status}) => {
  return (status === CLUSTER_ACTIVE) ? {background: colors.stableBG} : {};
};

// import {Link} from 'react-router';
const clusterItems = (clusters) => {
  Cluster.byName(clusters);
  return clusters.map((cluster) => {
    return (
      <TableRow key={cluster.clusterName} displayBorder={false} style={clusterRowFormat(cluster)}>
        <TableRowColumn >{cluster.clusterName}</TableRowColumn>
        <TableRowColumn>{cluster.status}</TableRowColumn>
        <TableRowColumn>{cluster.registeredContainerInstanceCount}</TableRowColumn>
        <TableRowColumn>{cluster.activeServiceCount}</TableRowColumn>
        <TableRowColumn>{cluster.pendingTasksCount}</TableRowColumn>
        <TableRowColumn>{cluster.runningTasksCount}</TableRowColumn>
      </TableRow>
    );
  });
};

// Since this component is simple and static, there's no parent container for it.
const ClusterList = ({clusters, onCellClick}) => {
  return (
    <Table onCellClick={onCellClick} selectable={true} >
      <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
        <TableRow>
          <TableHeaderColumn tooltip="Cluster Name">Name</TableHeaderColumn>
          <TableHeaderColumn tooltip="Active/Inactive">Status</TableHeaderColumn>
          <TableHeaderColumn tooltip="Currently running container instances.">Instances</TableHeaderColumn>
          <TableHeaderColumn tooltip="Services running on this cluster.">Services</TableHeaderColumn>
          <TableHeaderColumn tooltip="Tasks pending for execution.">Pending</TableHeaderColumn>
          <TableHeaderColumn tooltip="Tasks running on the cluster (including in services)">Running</TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody displayRowCheckbox={false} showRowHover={true} children={clusterItems(clusters)} />
    </Table>
  );
};

ClusterList.propTypes = {
  clusters: PropTypes.array.isRequired,
  onCellClick: PropTypes.func
};

export default ClusterList;