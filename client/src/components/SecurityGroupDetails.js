import React, { PropTypes } from 'react';

import { permEntriesByProto } from '../ecs/securityGroup';

import * as defaultStyles from '../styles/default';
import { mergeStyles } from '../helpers/ui';

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
  return(
    <MetricGroup title={entries.protoName} >
      {entries.map( (e) => renderPermissions(e))}
    </MetricGroup>
  );
}

const SecurityGroupDetails = ({ securityGroup, style }) => {

  const egressByProto = permEntriesByProto(securityGroup.ipPermissionsEgress);
  const ingressByProto = permEntriesByProto(securityGroup.ipPermissions);

  const styles = {
    container: {
      marginBottom: defaultStyles.primaryAbsoluteSpace,
      outline: "0px solid black"
    }
  };
  const mergedStyles = mergeStyles(styles, style, "container");

  console.log("SecurityGroupDetails:render()", "egressByProto", egressByProto, "ingressByProto:", ingressByProto);

  return (
    <MetricGroup title="Security Group" style={mergedStyles.container}>
      <MetricGroup title={securityGroup.groupName}>
        <FlowedMetric title="Owner" value={securityGroup.ownerId}/>
        <FlowedMetric title="VPC" value={securityGroup.vpcId}/>
      </MetricGroup>
      <MetricGroup title="Ingress">
        {Object.keys(ingressByProto).map( (k) => renderPortPermissions(ingressByProto[k]))}
      </MetricGroup>
      <MetricGroup title="Egress">
        {Object.keys(egressByProto).map( (k) => renderPortPermissions(egressByProto[k]))}
      </MetricGroup>
    </MetricGroup>
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
