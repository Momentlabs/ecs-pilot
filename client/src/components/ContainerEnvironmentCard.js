import React, { PropTypes } from 'react';
import { containerEnvironmentTableData } from '../ecs/deepTask';
import SimpleTable from './common/SimpleTable';
import DetailCard from './common/DetailCard';


const ContainerEnvironmentCard = ({deepTask, width}) => {

  const data = {
    header: ["Container", "Key", "Value", "Override"],
    rows: containerEnvironmentTableData(deepTask)
  };

  // By Key
  data.rows.sort( (a,b) => {
    const x = a[1];
    const y = b[1];
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  });

  console.log("ContainerEnvironmentCard:render()", "deepTasks:", deepTask, "data:", data);

  // const styles = {
  //   container: {
  //     outline: "0px solid black"
  //   }
  // };

  return (
    <DetailCard width={width} title="" subtitle={false}>
      <SimpleTable data={data} caption="Environment Variables" />
    </DetailCard>
  );
};

// ContainerEnvironmentCard.contextTypes = {
//   muiTheme: PropTypes.object.isRequired
// };

ContainerEnvironmentCard.propTypes = {
  deepTask: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

ContainerEnvironmentCard.defaultProps = {
  width: "40em"
};

export default ContainerEnvironmentCard;
