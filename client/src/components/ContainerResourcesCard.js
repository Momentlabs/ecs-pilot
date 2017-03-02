import React, {PropTypes } from 'react';
import { containerResourceTableData, containerULimitsTableData } from '../ecs/deepTask';

import SimpleTable from './common/SimpleTable';
import DetailCard from './common/DetailCard';


// Since this component is simple and static, there's no parent component for it.
const ContainerResourcesCard = ({deepTask, width}, context) => {

  const styles = {
    container: {
      height: "15em",
      outline: "0px solid black"
    }
  };

  return (
    <DetailCard width={width} title="Container Resources" subtitle={``} style={styles.container}>
      <SimpleTable data={containerResourceTableData(deepTask)} caption="Resources" />
      <SimpleTable data={containerULimitsTableData(deepTask)} caption="Container ULimits" />
    </DetailCard>
  );
};

// ContainerResourcesCard.contextTypes = {
//   muiTheme: PropTypes.object.isRequired
// };

ContainerResourcesCard.defaultProps = {
  width: "40em",
};

ContainerResourcesCard.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  deepTask: PropTypes.object.isRequired,
  children: PropTypes.element
};

export default ContainerResourcesCard;