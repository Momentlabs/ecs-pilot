import React, {PropTypes } from 'react';

import * as c from '../../styles/colors';
import Subheader from 'material-ui/Subheader';


// Since this component is simple and static, there's no parent component for it.
const DetailSubheader = ({listKey, children}, context) => {
  const k = listKey ? listKey : "key-0";
  const styles = {
    container: {
      color: c.metricTitle,
      fontSize: "larger",
      paddingTop: "1em",
      outline: "0px solid black"
    }
  }

  return (<Subheader key={k} style={styles.container}>{children}</Subheader>
  );
};

// DetailSubheader.contextTypes = {
//   muiTheme: PropTypes.object.isRequired
// };

// DetailSubheader.defaultProps = {
// };

DetailSubheader.propTypes = {
  listKey: PropTypes.string,
  children: PropTypes.node
};

export default DetailSubheader;