import React, {PropTypes } from 'react';
// import {Link} from 'react-router';


// Since this component is simple and static, there's no parent component for it.
const ClusterStatusCard = ({aProp}, context) => {

  const styles = {
    container: {
      outline: "0px solid black"
    }
  };

  return (
    <div style={styles.container}>
    </div>
  );
};

ClusterStatusCard.contextTypes = {
  muiTheme: PropTypes.object.isRequired
};

ClusterStatusCard.defaultProps = {
  aProp: "Remove me"
};

ClusterStatusCard.propTypes = {
  aProp: PropTypes.string.isRequired,
  children: PropTypes.element
};

export default ClusterStatusCard;