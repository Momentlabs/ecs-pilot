import React, {PropTypes } from 'react';
// import {Link} from 'react-router';

import * as c from '../styles/colors';
import * as defaultStyles from '../styles/default';
import TitleBox from './common/TitleBox';
import Task from './Task';

const Tasks = ({deepTasks}) => {

  const noOfContainers = deepTasks.reduce( (total, dt) => {
    return (total += dt.task.containers.length); 
  }, 0);

  const styles= {
    container: {
      // outline: "2px solid red"
    },
    title: {
      padding: defaultStyles.smallAbsoluteSpace,
      marginBottom: defaultStyles.primaryAbsoluteSpace,
      // outline: "1px solid black"
    },
    taskContainer: {
      // outline: "1px dotted blue"
    }
  };

  return(
    <div style={styles.container}>
      <TitleBox 
        title="Tasks" 
        subtitle={`${noOfContainers} containers in ${deepTasks.length} tasks`} 
        altColor
        style={styles.title}
      />
      <div style={styles.taskContainer}>
        {deepTasks.map( (dt) => <Task key={dt.task.taskArn} deepTask={dt}/>)}
      </div>
    </div>
  );
};

Tasks.propTypes = {
  // tasksMap: PropTypes.object.isRequired,
  deepTasks: PropTypes.array.isRequired,
  clusterName: PropTypes.string.isRequired
  // children: PropTypes.element
};

export default Tasks;