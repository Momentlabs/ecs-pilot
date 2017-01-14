import React, {PropTypes } from 'react';
// import {Link} from 'react-router';
import Chart, { Doughnut } from 'react-chartjs';
Chart.defaults.global.response=true;
// Since this component is simple and static, there's no parent container for it.
const ChartJSInlineGauge = ({data}) => {
  return (
    <Doughnut 
      data={data}
      width={"40"}
      height={"40"}
    />
  );
};

ChartJSInlineGauge.propTypes = {
  data: PropTypes.object.isRequired
};

export default ChartJSInlineGauge;