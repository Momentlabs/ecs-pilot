import React, {PropTypes } from 'react';

import * as c from '../../styles/colors';

import { PieChart, Pie, Cell, Text} from 'recharts';

function renderColor(entry, index, colors) {
  return (<Cell key={`cell-${index}`} fill={colors[index]} />);
}

function percentValue(amount, total) {
  return ((amount/total)*100).toFixed(0);
}

// TODO: Figure out a cleaner way to do this.
// We're passing a lot of noise into the data arary for this.
function renderLabel(o) {
  const { value, total, index, gaugeSize, labelWidth, fontSize } = o;
  if (index === 0) {
    return(
      <Text
        x={Math.ceil(gaugeSize/2) + 2}
        y={Math.ceil(gaugeSize/2)}
        width={labelWidth}
        textAnchor="middle"
        verticalAnchor="middle"
        style={{fontSize: fontSize, fontWeight: 'bold'}}
      >
        {`${percentValue(value, total)}%`}
      </Text>
    );
  } else {
    return undefined;
  }
};

 // TODO: Remove to somewhere general?
function resourceColors(rUsed, rRemain) {
  const lowLevel = 0.15;
  const warnLevel = 0.33;
  const usage = rRemain / (rUsed + rRemain);

  if (usage < lowLevel) {
    return [c.resourceUsed, c.resourceLow];
  } else if (usage < warnLevel) {
    return [c.resourceUsed, c.resourceWarn];
  } else {
    return [c.resourceUsed, c.resourceOk];
  }
}

// Since this component is simple and static, there's no parent component for it.
const GuageRechart = (props) => {
  const { size, colors, amount, total, outerRadius, innerRadius, title } = props;

  const renderColors = colors ? colors : resourceColors(amount, total - amount);

  const data = [
    {value: amount, total: total, gaugeSize: size, labelWidth: 30, fontSize: 16}, 
    {value: (total-amount), total: total, guageSize: size, labelWidth: 30, fontSize: 16}
  ];

  // console.log("GaugeRechart:render()", "props:", props);

  const or = outerRadius === undefined ? Math.ceil(size / 2) : outerRadius;
  const ir = innerRadius === undefined ? or - Math.ceil(size / 10) : innerRadius;
  const flexFlow = "column nowrap";
  const justifyContent = "flex-end";
  const alignItems = "center";
  // const alignContent = "space-between";
  const styles = {
    container: {
      // height: size+30,
      // width: size + 30,
      display: "WebkitBox", 
      display: "WebkitFlex", // eslint-disable-line no-dupe-keys
      display: 'flex', // eslint-disable-line no-dupe-keys
      WebkitFlexFlow: flexFlow,
      flexFlow: flexFlow,
      WebkitJustifyContent: justifyContent,
      justifyContent: justifyContent,
      WebkitAlignItems: alignItems,
      alignItems: alignItems,
      padding: 10,
      // outline: "1px solid black",
    },
    chartBox: {
      // outline: "2px solid red"
    },
    chart: {
    },
    guage: {
      // outline: "1px solid red"
    },
    title: {
      textAlign: "center",
      fontWeight: "bold",
      fontSize: "12pt",
      padding: 0,
      margin: 0,
      color: c.metricName,
      // outline: '1px solid black',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chartBox}>
        <PieChart width={size} height={size} style={styles.chart}>
          <Pie
            style={styles.gauge}
            isAnimationActive={false}
            data={data}
            outerRadius={or}
            innerRadius={ir}
            paddingAngle={10}
            startAngle={0}
            endAngle={360}
            labelLine={false}
            label={renderLabel}
          >
            {data.map( (entry, index) => renderColor(entry, index, renderColors))}
          </Pie>
        </PieChart>
      </div>
      <div style={styles.title}>{title}</div>
    </div>
  );
};

GuageRechart.contextTypes = {
  muiTheme: PropTypes.object.isRequired
};

GuageRechart.defaultProps = {
  title: "",
  size: 60,    
  outerRadius: undefined,
  innerRadius: undefined,
};

GuageRechart.propTypes = {
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  colors: PropTypes.array,
  outerRadius: PropTypes.number,
  innerRadius: PropTypes.number,
  title: PropTypes.string,
  amount: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

export default GuageRechart;