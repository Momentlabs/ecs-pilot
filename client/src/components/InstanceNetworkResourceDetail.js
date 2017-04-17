import React, { PropTypes } from 'react';

import * as defaultStyles from '../styles/default';
import { mergeStyles } from '../helpers/ui';

import { registeredTcpPortsValue, registeredUdpPortsValue,
         remainingTcpPortsValue, remainingUdpPortsValue
       } from '../ecs/instance';



import FlexContainer from './common/FlexContainer';
import MetricGroup from './common/MetricGroup';
import FlowedMetric from './common/FlowedMetric';

const InstanceNetworkResourceDetail = ({ instance, style }, context) => {

  const ci = instance.containerInstance;
  const styles = {
    container: {
      marginBottom: defaultStyles.rowGutter,
      // outline: "0px solid black"
    }
  };
  const mergedStyles = mergeStyles(styles, style, "container");

  const tcp = remainingTcpPortsValue(ci).map( (p) => {return {t: ((registeredTcpPortsValue(ci).includes(p)) ? "in use" : "avail"), v: p}; });
  const udp = remainingUdpPortsValue(ci).map( (p) => {return {t: ((registeredUdpPortsValue(ci).includes(p)) ? "in use" : "avail"), v: p}; });

  // TODO: this could be made smarter depending on what we expect to see.
  const tcpCols = (tcp.length > 2) ? 3 : tcp.length;
  const udpCols = (udp.length > 3) ? 3 : udp.length;

  return(
    <FlexContainer style={mergedStyles.container}>
{/*}    <MetricGroup title="Instance Network Resources" style={mergedStyles.container}> {*/}
      <MetricGroup title="TCP Ports" columns={tcpCols}>
        {tcp.map( (p) => <FlowedMetric title={p.t} value={p.v} />)} 
      </MetricGroup>
      <MetricGroup title="UDP Ports" columns={udpCols}>
        {udp.map( (p) => <FlowedMetric title={p.t} value={p.v} />)}
      </MetricGroup>
{/*}    </MetricGroup> {*/}
  </FlexContainer>
  );
};


InstanceNetworkResourceDetail.propTypes = {
  instance: PropTypes.object
};

InstanceNetworkResourceDetail.defaultProps = {
  instance: {}
};

export default InstanceNetworkResourceDetail;













