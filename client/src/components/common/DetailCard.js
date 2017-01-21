import React, {PropTypes } from 'react';
import { Card, CardTitle } from 'material-ui/Card';
import List from 'material-ui/List';

// Since this component is simple and static, there's no parent container for it.

const DetailCard = ({title, subtitle, width, children}) => {
  const styles = {
    container: { 
      width: width,
      height: "auto",
      // padding: '1em',
      margin: '1em',
      // alignSelf: 'flex-start', 
      // right: anchor - offset,
      // backgroundColor: c.metricBackground,
      // height: boxSize, 
      // width: boxSize,
      // display: "inline-flex",
      // textAlign: 'center',
      // position: "absolute",
      // top: 0,
      // bottom: "auto",
      // marginTop: 10,
      // outline: "1px dotted blue"
    },
    list: {
      width: width,
      // alignSelf: "stretch",
      // outline: "1px solid black"
    }
  };
  return (
    <Card style={styles.container}>
      <CardTitle title={title} subtitle={subtitle} />
      <List style={styles.list}>
        {children}
      </List>

    </Card>
  );
};

DetailCard.defaultProps = {
  subtitle: "",
  width: 150
};

DetailCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  width: PropTypes.number,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array])
};

export default DetailCard;