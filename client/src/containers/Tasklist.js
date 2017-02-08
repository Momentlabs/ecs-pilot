// import React, { PropTypes } from 'react';
// // import { Link, IndexLink } from 'react-router';
// import { bindActionCreators } from 'redux';
// import { connect } from 'react-redux';

// // import * as tasklistActions from '../actions/task';
// import * as deepTaskActions from '../actions/deepTask';

// import Tasks from '../components/Tasks';


// export default class Tasklist extends React.Component {
  
//   static defaultProps = {
//     // tasksMap: {},
//     deepTasks: []
//   }

//   static propTypes = {
//     // actions: PropTypes.object.isRequired,
//     clusterName: PropTypes.string.isRequired,
//     // tasksMap: PropTypes.object,
//     deepTasks: PropTypes.array,
//   }

//   constructor(props, context) {
//     super(props, context);
//     this.componentWillMount = this.componentWillMount.bind(this);
//   }

//   componentWillMount() {
//     // console.log("Tasklist:componentWillMount", "state:", this.state, "props:", this.props);
//     // this.props.actions.requestTasks(this.props.clusterName);
//     // this.props.actions.requestDeepTasks(this.props.clusterName);
//   }

//   render() {
//     console.log("TaskList#render", "state:", this.state, "props:", this.props);
//     const {deepTasks, clusterName} = this.props;
//     return (
//       <Tasks deepTasks={deepTasks} clusterName={clusterName} />
//     );
//   }
// }

