import React, { PropTypes } from 'react';
import { PieChart, Pie, Cell, Text} from 'recharts';

const renderColor  = (entry, index, colors) => {
  return (<Cell key={`cell-${index}`} fill={colors[index]} />);
};

const percentValue = (amount, total) => {
  const percent = ((amount/total)*100).toFixed(0);
  return percent;
};

// Gratutious hack. Render the single value
// in the middle of the chart. This doesn't
// render slices rather just the one value.
const renderLabel = (o) => { // eslint-disable-line react/no-multi-comp
  const {value, total, index, gaugeSize} = o;
  if (index === 0) {
    return (
        <Text 
          x={Math.ceil(gaugeSize/2) + 2} 
          y={Math.ceil(gaugeSize/2)}
          width={30} 
          textAnchor="middle"
          verticalAnchor="middle"
          style={{fontSize: 16, fontWeight: 'bold'}}
        >
          {`${percentValue(value, total)}%`}
        </Text>
    );
  } else {
    return(undefined);
  }
};

// TODO: This whole thing needs to be rewritten to leverage a flexbox containing it.
// TODO: Fix the tool-tips on this. They look horrible.
const RechartGauge = (props, context) => { // eslint-disable-line react/no-multi-comp
  // console.log("RechartGauge() - props", props);
  const {size, colors, amount, total, outerRadius, innerRadius, title, cx, cy, rightOffset, leftOffset}  = props;
  const {card} = context.muiTheme;
  const lOffset = leftOffset ? leftOffset : "auto";
  const rOffset = rightOffset ? rightOffset : "auto";
  const xOffset = cx ? cx : 0;
  const yOffset = cy ? cy : 0;
  const data = [{value: amount, total: total, gaugeSize: size}, {value: (total-amount), total: total, guageSize: size}];
  const padAngle = 10;
  const subColor = card.subtitleColor;

  const styles = {
    container: {
      width: size,
      height: size,
      position: "absolute",
      right: rOffset-xOffset,
      left: lOffset,
      top: 10,
      outline: "0px dotted blue"
    },
    chart: {
      padding: "0px 0px 0px 0px", 
      marginTop:0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      overflow: "visible", 
      outline: '0px solid black'
    },
    title: {
      textAlign: "center",
      fontWeight: "bold",
      fontSize: '12pt',
      color: subColor,
      width: size,
      padding: "0px 0px px 0px 0px", 
      marginTop: 10,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      overflow: "visible", 
      position: "absolute",
      // left: lOffset-xOffset,
      outline: '0px solid red',
    }
  };

  // TODO: Two of these in a row with different data seem to be off on the vertical by one pixel!
  return(
    <div style={styles.container}>
      <PieChart width={(size)} height={size} style={styles.chart}>
        <Pie
          isAnimationActive={true} 
          data={data}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          paddingAngle={padAngle}
          startAngle={0}
          endAngle={360}
          labelLine={false}
          label={renderLabel}>
          {data.map( (entry, index) => renderColor(entry, index, colors))}
        </Pie>
      </PieChart>
      <p style={styles.title}>
        {title}
      </p>
    </div>
  );
};

RechartGauge.contextTypes = {
  muiTheme: PropTypes.object.isRequired
};
RechartGauge.defaultProps ={
  cx: undefined,
  cy: undefined,
  rightOffset: undefined,
  leftOffset: undefined,
  title: "",
};

RechartGauge.propTypes = {
  size: PropTypes.number.isRequired,
  cx: PropTypes.number,
  cy: PropTypes.number,
  rightOffset: PropTypes.number,
  leftOffset: PropTypes.number,
  colors: PropTypes.array.isRequired,
  outerRadius: PropTypes.number.isRequired,
  innerRadius: PropTypes.number.isRequired,
  amount: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  title: PropTypes.string
};

export default RechartGauge;
