import React, {PropTypes } from 'react';
// import {Link} from 'react-router';

// Since this component is simple and static, there's no parent component for it.
const FlexContainer = ({alignItems, children}) => {
  const styles = {
    container: {
      display: "WebkitBox",
      display: "WebkitFlex",
      display: 'flex',
      "-webkit-flex-flow": "row wrap",
      flexDirection: "row",
      // justifyContent: 'center',
      alignItems: alignItems,
      // alignContent: 'space-between',
      // outline: "2px solid black"
    }
  };

  return (
    <div style={styles.container}>
      {children}
    </div>
  );
};

FlexContainer.defaultProps = {
  alignItems: "flex-start"
};

FlexContainer.propTypes = {
  alignItems: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array])
};

export default FlexContainer;