import React, {PropTypes } from 'react';
// import {Link} from 'react-router';

// Since this component is simple and static, there's no parent component for it.
const FlexContainer = (props) => {
  // console.log("FlexContainer:render()", "props:", props);
  const {
    children, width,  justifyContent, alignItems, alignContent, 
    flexDirection, flexWrap
  } = props;

  const flexFlow = flexDirection + " " + flexWrap;
  const styles = {
    container: {
      width: width,
      display: "WebkitBox",
      display: "WebkitInlineFlex",
      display: 'inline-flex',
      WebkitFlexFlow: flexFlow,
      flexFlow: flexFlow,
      WebkitJustifyContent: justifyContent,
      justifyContent: justifyContent,
      WebkitAlignItems: alignItems,
      alignItems: alignItems,
      WebkitAlignContent: alignContent,
      alignContent: alignContent,
      // outline: "1px dashed black"
    }
  };

  return (
    <div style={styles.container}>
      {children}
    </div>
  );
};

FlexContainer.defaultProps = {
  width: "inherit",
  flexDirection: "row",
  flexWrap: "nowrap",
  justifyContent: "flex-start",
  alignItems: "stretch",
  alignContent: "stretch",
};

FlexContainer.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  flexDirection: PropTypes.string,
  flexWrap: PropTypes.string,
  justifyContent: PropTypes.string,
  alignItems: PropTypes.string,
  alignContent: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array, PropTypes.string])
};

export default FlexContainer;
