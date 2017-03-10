import React, { PropTypes } from 'react';
// import { Link, IndexLink } from 'react-router';

import FlexContainer from './FlexContainer';

import KeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import KeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';



export default class MetricBar extends React.Component {

   
  static defaultProps = {
    showExpandableButton: false,
    onExpandChange: undefined,
    children: []
  }

  static propTypes = {
    showExpandableButton: PropTypes.bool,
    onExpandChange: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.array])
  }

  constructor(props, context) {
    super(props, context);

    // console.log("MetricBar:constructor() - entrance", "state:", this.state, "props:", props, "context:", context);

    this.componentWillMount = this.componentWillMount.bind(this);
    this.expandIcon = this.expandIcon.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.state = {
      expandIcon: {},
      expanded: false
    };

    // console.log("MetricBar:constructor() - exit", "state:", this.state, "props:", props, "context:", context);
  }

  componentWillMount() {
    // console.log("MetricBar:componentWillMount()", "state:", this.state, "props:", this.props);
    this.setState({
      expandIcon: this.expandIcon(this.state.expanded)
     });
  }

  expandIcon(expanded) {

    const styles = {
      expandIcon: {
        padding: "0 12 0 20",
        alignSelf: "center",
        // outline: "1px solid black"
      }
    };

    return (
        (expanded) ?
          <KeyboardArrowUp onClick={this.handleClick} style={styles.expandIcon} /> :
          <KeyboardArrowDown onClick={this.handleClick} style={styles.expandIcon} />
      );
  }

  handleClick(event) {
    console.log("MetricBar:handleClick()", "event:", event);
    event.preventDefault();
    const {expanded } = this.state;
    const {onExpandChange} = this.props;

    const newExpanded = !expanded;
    if (onExpandChange) {
      onExpandChange(newExpanded);
    }

    this.setState({
      expandIcon: this.expandIcon(newExpanded),
      expanded: newExpanded,
    });
  }

  render() {
    // console.log("MetricBar:render()", "state:", this.state, "props:", this.props);
    const {expandIcon} = this.state;
    const {children, showExpandableButton} = this.props;
    return (
      <FlexContainer alignItems="center" >
        {children}
        {showExpandableButton ? expandIcon : []}
      </FlexContainer>
    );
  }
}

