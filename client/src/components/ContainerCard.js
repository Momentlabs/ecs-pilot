import React, {PropTypes } from 'react';

import DetailCard from './common/DetailCard';

// Since this component is simple and static, there's no parent component for it.
const ContainerCard = ({ecsContainer}, context) => {
  console.log("ContainerCard:render()", "ecsContainer:", ecsContainer);
  const title = ecsContainer.name;
  const subtitle = ecsContainer.lastStatus;

  return (
    <DetailCard title={title} subtitle={subtitle}>
    </DetailCard>
  );
};

// ContainerCard.contextTypes = {
//   muiTheme: PropTypes.object.isRequired
// };

// ContainerCard.defaultProps = {
//   title: "",
//   subtitle: "",
// };

ContainerCard.propTypes = {
  // title: PropTypes.string,
  // subtitle: PropTypes.string,
  ecsContainer: PropTypes.object.isRequired,
  // children: PropTypes.element
};

export default ContainerCard;