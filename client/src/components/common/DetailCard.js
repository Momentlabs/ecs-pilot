import React, {PropTypes } from 'react';
import { Card, CardTitle } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import * as defaultStyles from '../../styles/default';
import { mergeStyles } from '../../helpers/ui';
// import * as c from '../../styles/colors';

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
  return  (bs == undefined || bs == false) ? "unset" : defaultStyles.shadow;
};

const DetailCard = ({title, subtitle, width, noFootLine, noTopLine, boxShadow, children, style}) => {

  const boxWidth = width ? width : computeWidth(title);

  const styles = {
    container: { 
      width: boxWidth,
      height: "auto",
      // marginTop: "1em",
      // marginBottom: "1em",
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

  const mergedStyles = mergeStyles(styles, style, "container");
  return (
    <Card style={mergedStyles.container}>
      <CardTitle title={title} subtitle={subtitle}/>
      {noTopLine ? undefined : <Divider/>}
      <div style={mergedStyles.listContainer}>
        {children}
        {noFootLine ? undefined :  <Divider />}
      </div>
    </Card>
  );
};


DetailCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  noFootLine: PropTypes.bool,
  noTopLine: PropTypes.bool,
  style: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  boxShadow: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array])
};

DetailCard.defaultProps = {
  style: {},
  width: "auto",
  boxShadow: true,
  subtitle: "Something",
  noFootLine: true,
  noTopLine: true,
};

export default DetailCard;