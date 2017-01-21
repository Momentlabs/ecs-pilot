import React, {PropTypes } from 'react';
import * as c from '../../styles/colors';

// import {Link} from 'react-router';

const ItemPair = ({itemOne, itemTwo, firstItemHeader}) => {

  const styles = { 
    container: {
      width: "inherit",
      display: 'flex',
      justifyContent: "space-between",
      outline: "0px dotted blue"
    },
    itemOne: {
      // color: (firstItemHeader ? c.subtitle : "inherit"),
      color: c.subtitle,
      alignSelf: "flex-start",
      outline: "0px solid red"
    },
    itemTwo: {
      alignSelf: "flex-end",
      outline: "0px solid green"
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.itemOne}>{itemOne}</div>
      <div style={styles.itemTwo}>{itemTwo}</div>
    </div>
  );
};

ItemPair.defaultProps = {
  itemOne: "Remove me",
  itemTwo: "",
  firstItemHeader: false
};

ItemPair.propTypes = {
  itemOne: PropTypes.oneOfType([PropTypes.number,PropTypes.string]).isRequired,
  itemTwo: PropTypes.oneOfType([PropTypes.number,PropTypes.string]).isRequired,
  firstItemHeader: PropTypes.bool
};

export default ItemPair;