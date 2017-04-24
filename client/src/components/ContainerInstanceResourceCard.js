import React, {PropTypes } from 'react';
import { registeredTcpPortsValue, registeredUdpPortsValue,
         registeredCpuValue,registeredMemoryValue,
         remainingCpuValue, remainingMemoryValue,
         remainingTcpPortsValue, remainingUdpPortsValue
       } from '../ecs/instance';

import SimpleTable from './common/SimpleTable';
import DetailCard from './common/DetailCard';


// Since this component is simple and static, there's no parent component for it.
const ContainerInstanceResourceCard = ({ instance, width }) => {
  const ci = instance.containerInstance;
  // const styles = {
  //   container: {
  //     outline: "0px solid black"
  //   }
  // };
  const cpuReg = registeredCpuValue(ci);
  const cpuRem = remainingCpuValue(ci);
  const memReg = registeredMemoryValue(ci);
  const memRem = remainingMemoryValue(ci);
  let resourceData = {
    header: ["Resource", "Registered", "Remaining", "Used"],
    rows: [
      ["CPU", cpuReg, cpuRem, cpuReg - cpuRem],
      ["Memory", memReg, memRem, memReg - memRem]
    ],
  };
  const tcpPorts = remainingTcpPortsValue(ci).map( (p) => ({value: p, remain: registeredTcpPortsValue(ci).includes(p)}));
  const tcpData = tcpPorts.map( (p) => ["tcp-port", p.value, (p.remaining) ? p.value : "-", (p.remaining) ? "-" : p.value]);
  resourceData.rows = resourceData.rows.concat(tcpData);
  const udpPorts = remainingUdpPortsValue(ci).map( (p) => ({value: p, remain: registeredUdpPortsValue(ci).includes(p)}));
  let udpData = udpPorts.map( (p) => ["udp-port", p.value, (p.remaining) ? p.value : "-", (p.remaining) ? "-" : p.value]);
  if (udpData.length <= 0) { udpData = [["<no-udp>"]];}
  resourceData.rows = resourceData.rows.concat(udpData);


  return (
    <DetailCard width={width} title="Instance Resources" subtitle="" >
      <SimpleTable data={resourceData} />
    </DetailCard>
  );
};

// ContainerInstanceResourceCard.contextTypes = {
//   muiTheme: PropTypes.object.isRequired
// };

ContainerInstanceResourceCard.defaultProps = {
  width: "40em",
};

ContainerInstanceResourceCard.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  instance: PropTypes.object.isRequired,
};

export default ContainerInstanceResourceCard;