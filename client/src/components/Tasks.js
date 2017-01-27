import React, {PropTypes } from 'react';
// import {Link} from 'react-router';

import { Card, CardTitle } from 'material-ui/Card';
import Task from './Task';

const Tasks = ({deepTasks}) => {

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

Tasks.propTypes = {
  // tasksMap: PropTypes.object.isRequired,
  deepTasks: PropTypes.array.isRequired,
  clusterName: PropTypes.string.isRequired
  // children: PropTypes.element
};

export default Tasks;