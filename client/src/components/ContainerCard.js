import React, {PropTypes } from 'react';

import DetailCard from './common/DetailCard';
import SimpleTable from './common/SimpleTable';

// Since this component is simple and static, there's no parent component for it.
const ContainerCard = ({ ecsContainer, containerDefinition, width }, context) => {
  // console.log("ContainerCard:render()", "ecsContainer:", ecsContainer, "containerDefinition: ", containerDefinition);
  const title = `Container: ${ecsContainer.name}`;
  const subtitle = `${ecsContainer.lastStatus}`;

  const containerData = {
    header: ["Property", "Value"],
    rows: [
      ["Command", containerDefinition.command ? containerDefinition.command.join(" ") : "<empty>"],
      ["Entry Point", containerDefinition.entryPoint ? containerDefinition.entryPoint.join(" ") : "<empty>"],
      ["Image", containerDefinition.image],
      ["Essential", containerDefinition.essential ? "yes" : "no"],
    ]
  };
  return (
    <DetailCard width={width} title={title} subtitle={subtitle}>
      <SimpleTable data={containerData}/>
    </DetailCard>
  );
};

// ContainerCard.contextTypes = {
//   muiTheme: PropTypes.object.isRequired
// };

ContainerCard.defaultProps = {
  width: "40em",
};

ContainerCard.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ecsContainer: PropTypes.object.isRequired,
  containerDefinition: PropTypes.object.isRequired,
};

export default ContainerCard;