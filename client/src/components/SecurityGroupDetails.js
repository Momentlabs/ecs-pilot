import React, { PropTypes } from 'react';

import { permEntriesByProto } from '../ecs/securityGroup';

import * as defaultStyles from '../styles/default';
import { mergeStyles } from '../helpers/ui';

import FlexContainer from './common/FlexContainer';
import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';

// entry = { protoName <string>, portString <string>, permissions <[]string> }
function renderPermissions(pp) {
  return (
      // pp.permissions.map( (perm) => <FlowedMetric title={perm} value={pp.portString} />)
      pp.permissions.map( (perm) => <FlowedMetric title={pp.portString} value={perm} />)
  );
}

function renderPortPermissions(entries) {
  // console.log("renderPortPermissions", "entries", entries);

  const portCols = (entries.length > 0) ? 2 : entries.length;
  const protoName = (entries.length > 0) ? entries[0].proto : undefined;
  return(
    <MetricGroup title={protoName} columns={portCols} >
      {entries.map( (e) => renderPermissions(e))}
    </MetricGroup>
  );
}

const SecurityGroupDetails = ({ securityGroup, style }) => {

  const styles = {
    container: {
      marginBottom: defaultStyles.rowGutter,
      // outline: "0px solid black"
    },
    innerContainer: {
      marginTop: defaultStyles.rowGutter,
      // maxHeight: "20%",
      // overflow: "auto",
      // outline: "1px solid black"
    }
  };
  const mergedStyles = mergeStyles(styles, style, "container");

  const egressByProto = permEntriesByProto(securityGroup.ipPermissionsEgress);
  const ingressByProto = permEntriesByProto(securityGroup.ipPermissions);
  return (
    <FlexContainer flexDirection="column" style={mergedStyles.conatiner}>
{/*}    <MetricGroup title="Security Group" style={mergedStyles.container}> {*/}
      <MetricGroup title={securityGroup.groupName} columns={4} >
        <FlowedMetric title="Owner" value={securityGroup.ownerId} columns={2}/>
        <FlowedMetric title="VPC" value={securityGroup.vpcId} columns={2}/>
      </MetricGroup>
      <FlexContainer title="Ingress" style={mergedStyles.innerContainer}>
        {Object.keys(ingressByProto).map( (k) => renderPortPermissions(ingressByProto[k]))}
      </FlexContainer>
      <FlexContainer title="Egress" style={mergedStyles.innerContainer}>
        {Object.keys(egressByProto).map( (k) => renderPortPermissions(egressByProto[k]))}
      </FlexContainer>
{/*}    </MetricGroup> {*/}
    </FlexContainer>
  );
};

SecurityGroupDetails.propTypes = {
  securityGroup: PropTypes.object.isRequired,
  style: PropTypes.object
};

SecurityGroupDetails.defaultProps = {
  style: {}
};

export default SecurityGroupDetails;
