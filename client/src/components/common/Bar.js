import React, { PropTypes } from 'react';

import { mergeStyles } from '../../helpers/ui';
import FlexContainer from './FlexContainer';
import TitleBox from './TitleBox';
import KeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import KeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';

export default class Bar extends React.Component {
  
  static propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    showExpandableButton: PropTypes.bool,
    onExpandChange: PropTypes.func,
    onSelect: PropTypes.func,
    style: PropTypes.object
  };

  static defaultProps = {
    title: undefined,
    subtitle: undefined,
    showExpandableButton: false,
    onExpandChange: undefined,
    onSelect: undefined,
    style: {}
  };

  constructor(props, context) {
    super(props, context);

    this.copmonentWillMount = this.componentWillMount.bind(this);
    this.handleExpand = this.handleExpand.bind(this);

    this.state = {
      expandIcon: this.expandIcon(false, this.handleExpand),
      expanded: false
    };
  }

  componentWillMount() {
    this.setState({
      expandIcon: this.expandIcon(this.state.expanded)
    });
  };

  handleExpand(event) {
    console.log("Bar:handleExpand()", "event:", event);
    const { expanded } = this.state;
    const { onExpandChange } = this.props;

    event.preventDefault();

    const newExpanded = !expanded;
    if (onExpandChange) {
      onExpandChange(newExpanded);
    }

    this.setState({
      expandIcon: this.expandIcon(newExpanded, this.handleExpand),
      expanded: newExpanded
    });
  }

  expandIcon(expanded, handleExpand) {
    const styles = {
      padding: "0 0 0 0",
      alignSelf: "flex-start",
      // outline: "1px solid blue"
    };

    if (expanded) {
      return <KeyboardArrowUp onClick={handleExpand} style={styles} />;
    } else {
      return <KeyboardArrowDown onClick={handleExpand} style={styles} />;
    }
  }

  render() {
    const { expandIcon } = this.state;
    const { children, showExpandableButton, onSelect, title, subtitle, style } = this.props;

    const styles = {
      container: {
        // outline: "2px solid red"
      },
      childContainer: {
        // outline: "1px dotted black"
      }
    };
    const mergedStyles = mergeStyles(styles, style, "container");

    return (
      <FlexContainer 
        justifyContent="space-between" 
        flexWrap="wrap" 
        onClick={onSelect}
        style={mergedStyles.container} 
      >
        <FlexContainer flexDirection="column" justifyContent="space-between" onClick={this.handleExpand} style={styles.childContainer}  >
          <TitleBox title={title} subtitle={subtitle} />
          {showExpandableButton ? expandIcon : undefined}
        </FlexContainer>
        <FlexContainer>
          {children}
        </FlexContainer>
      </FlexContainer>
    );
  }
}

