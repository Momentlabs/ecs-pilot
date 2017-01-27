import React, {PropTypes } from 'react';
import { Card, CardTitle } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import List from 'material-ui/List';

// Since this component is simple and static, there's no parent container for it.

// rough, very rough
const computeWidth = (title) => {
  let size = "18em";
  if (title.length > 15) {
    size = "36em";
  }
  return size;
 };

const DetailCard = ({title, subtitle, width, noFootLine, children}) => {

  const boxWidth = width ? width : computeWidth(title);

  const styles = {
    container: { 
      width: boxWidth,
      height: "auto",
      // padding: '1em',
      margin: '1em',
      // alignSelf: 'flex-start', 
      // textAlign: 'center',
      boxShadow: "unset",
      // outline: "1px dotted blue"
    },
    listContainer: {
      // height: "auto";
      display: "WebkitBox",
      display: "WebkitFlex",
      display: "flex",
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
      <Divider/>
      <div style={styles.listContainer}>
        <List style={styles.list}>
          {children}
        </List>
        {noFootLine ? undefined :  <Divider />}
      </div>
    </Card>
  );
};

DetailCard.defaultProps = {
  subtitle: "Something",
  noFootLine: false
};

DetailCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  noFootLine: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array])
};

export default DetailCard;