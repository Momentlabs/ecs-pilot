import React, {PropTypes } from 'react';
// import {Link} from 'react-router';

import { Card, CardTitle } from 'material-ui/Card';
import Task from './Task';

const Tasks = ({deepTasks}) => {

  const noOfContainers = deepTasks.reduce( (total, dt) => {
    return (total += dt.task.containers.length); 
  }, 0);

  return(
    <Card style={{boxShadow: "unset"}}>
      <CardTitle
        style={{boxShadow: "unset", padding: 20}} // TODO GET THIS MAGIC NUMBER OUT OF HERE!
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