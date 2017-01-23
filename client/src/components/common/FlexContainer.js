import React, {PropTypes } from 'react';
// import {Link} from 'react-router';

// Since this component is simple and static, there's no parent component for it.
const FlexContainer = (props) => {
  console.log("FlexContainer:render()", "props:", props);
  const {alignItems, children, right, top, bottom, left, width} = props;

  const styles = {
    container: {
      // right: right,
      // left: left,
      // top: top,
      // bottom: bottom,
      // position: "absolute",
      width: width,
      display: "WebkitBox",
      display: "WebkitInlineFlex",
      display: 'inline-flex',
      "WebkitFlexFlow": "row wrap",
      flexDirection: "row",
      justifyContent: 'center',
      alignItems: alignItems,
      // alignContent: 'space-between',
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
  alignItems: "flex-start"
};

FlexContainer.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  alignItems: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array, PropTypes.string])
};

export default FlexContainer;