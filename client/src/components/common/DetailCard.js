import React, {PropTypes } from 'react';
import { Card, CardTitle } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import * as c from '../../styles/colors';

// Since this component is simple and static, there's no parent container for it.

// rough, very rough
const computeWidth = (title) => {
  let size = "18em";
  if (title.length > 15) {
    size = "40em";
  }
  return size;
 };

const computeShadow = (bs) => {
  let shadow = `0px 0px 3px 1px ${c.metricName}`;
  switch (bs) {
    case true:
      break;
    case undefined:
    case false:
      shadow = "unset";
      break;
    default: 
      shadow = `${shadow.x} ${shadow.y} ${shadow.blur} ${shadow.radius} ${shadow.color}`;
  }
  return shadow;
};

const DetailCard = ({title, subtitle, width, noFootLine, noTopLine, boxShadow, children}) => {

  const boxWidth = width ? width : computeWidth(title);

  const styles = {
    container: { 
      width: boxWidth,
      height: "auto",
      marginTop: "1em",
      marginBottom: "1em",
      marginRight: "1em",
      // padding: '1em',
      // margin: '1em',
      // alignSelf: 'flex-start', 
      // textAlign: 'center',
      // boxShadow: "unset",
      boxShadow: computeShadow(boxShadow),
      // border: `1px solid ${c.metricName}`,
      // outline: "1px dotted blue"
    },
    listContainer: {
      // height: "auto";
      display: "WebkitBox",
      display: "WebkitFlex", // eslint-disable-line no-dupe-keys
      display: "flex", // eslint-disable-line no-dupe-keys
      WebkitFlexDirection: "column",
      flexDirection: "column",
      // // WebkitFlexFlow: "column",
      // // flexFlow: "column",
      justifyContent: "space-between",
      // alignItems: "center",
      // alignContent: "stretch",
      // outline: "1px solid green"
    },
    list: {
      // width: boxWidth,
      display: "inline",
      // alignSelf: "stretch",
      // outline: "1px solid green"
    },
    foot: {
      // outline: "2px solid red",
    },
    temp: {
      // background: "blue",
      // outline: "1px solid blue"
    }
  };
  return (
    <Card style={styles.container}>
      <CardTitle title={title} subtitle={subtitle} style={{border: "0px", outline: "0px"}}/>
      {noTopLine ? undefined : <Divider/>}
      <div style={styles.listContainer}>
        {children}
        {noFootLine ? undefined :  <Divider />}
      </div>
    </Card>
  );
};

DetailCard.defaultProps = {
  subtitle: "Something",
  noFootLine: true,
  noTopLine: true,
  boxShadow: true,
};

DetailCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  noFootLine: PropTypes.bool,
  boxShadow: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array])
};

export default DetailCard;