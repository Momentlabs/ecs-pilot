import React, {PropTypes } from 'react';
// import {Link} from 'react-router';

import { Card, CardTitle } from 'material-ui/Card';
import Task from './Task';

// Since this component is simple and static, there's no parent component for it.
// const showDetails = () => {
//   console.log("Tasks:showDetails()");
// };

const Tasks = ({deepTasks}) => {

  // console.log("Tasks:render", "tasksMap:", tasksMap);

  // const styles = {
  //   container: {
  //     outline: "0px solid black"
  //   }
  // };

  // const taskArns = Object.keys(tasksMap);
  // const noOfContainers = taskArns.reduce( (total, arn) => {
  //   return(total + tasksMap[arn].Task.containers.length);
  // }, 0);
  const noOfContainers = deepTasks.reduce( (total, dt) => {
    return (total += dt.task.containers.length); 
  }, 0);

  return(
    <Card>
      <CardTitle
        title="Tasks" subtitle={`${noOfContainers} containers in ${deepTasks.length} tasks`}>
        {deepTasks.map( (dt) => <Task key={dt.task.taskArn} deepTask={dt}/>)}
      </CardTitle>
    </Card>
  );
};

// Tasks.contextTypes = {
//   muiTheme: PropTypes.object.isRequired
// };

// Tasks.defaultProps = {
//   aProp: "Remove me"
// };

Tasks.propTypes = {
  // tasksMap: PropTypes.object.isRequired,
  deepTasks: PropTypes.array.isRequired,
  clusterName: PropTypes.string.isRequired
  // children: PropTypes.element
};

export default Tasks;