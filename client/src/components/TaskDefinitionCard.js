import React, {PropTypes } from 'react';
// import {Link} from 'react-router';
import { KeyGenerator } from '../helpers/ui';
import { shortArn } from '../helpers/aws';
import DetailSubheader from './common/DetailSubheader';


import DetailCard from '../components/common/DetailCard';
import DetailItem from '../components/common/DetailItem';

import { List } from 'material-ui/List';
import Divider from 'material-ui/Divider';

// Since this component is simple and static, there's no parent component for it.
const TaskDefinitionCard = ({taskDefinition, noFootLine, width}, context) => {
  // const styles = {
  //   container: {
  //     outline: "0px solid black"
  //   },
  // };

  let kg = new KeyGenerator(`tdArn:${taskDefinition.taskDefinitionArn}-`);
  return (
    <DetailCard title="Task Definition" width={width} subtitle={shortArn(taskDefinition.taskDefinitionArn)} noFootLine={noFootLine}>
    <List>
      <DetailItem name="Family" value={taskDefinition.family} key={kg.nextKey()}/>
      <DetailItem name="Revision" value={taskDefinition.revision} key={kg.nextKey()}/>
      <DetailItem name="Active" value={taskDefinition.status} key={kg.nextKey()}/>
      <DetailItem name="Network Mode" value={taskDefinition.networkMode} key={kg.nextKey()}/>
      <DetailItem name="ARN" value={shortArn(taskDefinition.taskDefinitionArn)} key={kg.nextKey()}/>
      <DetailSubheader key={kg.nextKey()}>Containers</DetailSubheader>
      <Divider key={kg.nextKey()}/>
      <DetailItem name="Name" value="Image" />
      {taskDefinition.containerDefinitions.map( (cd) => <DetailItem name={cd.name} value={shortArn(cd.image)} key={kg.nextKey()} />)}
    </List>
    </DetailCard>
  );
};

// TaskDefinitionCard.contextTypes = {
//   muiTheme: PropTypes.object.isRequired
// };

TaskDefinitionCard.defaultProps = {
  noFootLine: false,
  width: "40em",
};

TaskDefinitionCard.propTypes = {
  taskDefinition: PropTypes.object.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  noFootLine: PropTypes.bool
  // children: PropTypes.element
};

export default TaskDefinitionCard;