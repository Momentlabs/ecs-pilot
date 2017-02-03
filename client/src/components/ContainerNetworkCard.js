import React, {PropTypes } from 'react';
import { containerBindingsTableData, containerLinksTableData } from '../ecs/deepTask';

import SimpleTable from './common/SimpleTable';
import DetailCard from './common/DetailCard';

// Since this component is simple and static, there's no parent component for it.
const ContainerNetworkCard = ({ deepTask, width }, context) => {

  const styles = {
    container: {
      outline: "0px solid black"
    }
  };

  return (
    <DetailCard width={width} title="Container Network" subtitle={`Network mode: ${deepTask.taskDefinition.networkMode}`} style={styles.container}>
      <SimpleTable data={containerBindingsTableData(deepTask)} caption="Port Bindings" />
      <SimpleTable data={containerLinksTableData(deepTask)} caption="Container Links" />
    </DetailCard>
  );
};

// ContainerNetworkCard.contextTypes = {
//   muiTheme: PropTypes.object.isRequired
// };

ContainerNetworkCard.defaultProps = {
  width: "40em",
};

ContainerNetworkCard.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string,PropTypes.number]),
  deepTask: PropTypes.object.isRequired,
  // children: PropTypes.element
};

export default ContainerNetworkCard;