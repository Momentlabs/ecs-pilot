import React, {PropTypes } from 'react';
// import {Link} from 'react-router';
import {PieChart, Pie, Cell, Tooltip} from 'recharts';


const oRadius = 20;
const iRadius = 13;

const renderColor = (entry, index, colors) => {
  return (<Cell key={`cell-${index}`} fill={colors[index]} />);
};

// TODO: Need to clean up tooltips. Probably want to pass done a on hover function that
// can render in the level above.
const RechartInlineGauge = ({data, colors}) => {
  return (
    <div style={{padding: '0px 0px 0px 0px', margin: '20px 0px 20px 0px', border: '0px solid red', overflow: 'hidden'}}>
      <PieChart width={40} height={40} style={{padding: "0px 0px 0px 0px", margin: "0px 0px -22px 0px", border: "0px solid black"}}>
        <Pie
          isAnimationActive={false} 
          data={data} 
          outerRadius={oRadius} 
          innerRadius={iRadius}
          startAngle={0}
          endAngle={180}
          paddingAngle={10}>
          {data.map( (entry, index) => renderColor(entry, index, colors))}
        </Pie>
        <Tooltip 
          wrapperStyle={{border: '0px solid black'}} 
          itemStyle={{fontSize: 'xx-small'}}
          cursor={false}
          offset={0}
          coordinate={{x: 50, y:0}}
        />
      </PieChart>
    </div>
  );
};

RechartInlineGauge.propTypes = {
  data: PropTypes.array.isRequired,
  colors: PropTypes.array.isRequired
};

export default RechartInlineGauge;