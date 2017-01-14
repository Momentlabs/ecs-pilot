import React, {PropTypes} from 'react';
// import {Link} from 'react-router';

import { VictoryPie, VictoryTheme, VictoryContainer } from 'victory';

// TOD: Perhaps these magic numbers should be obtained from somehwere else.
const width = 20;
const height = 0;
const padding = {bottom:-20, top: 0};

// Since this component is simple and static, there's no parent container for it.
// The tooltip is not working.
const VictoryGauge = ({data, x, y, colorScale}) => {
  return (
    <VictoryContainer height={20} padding={padding}>
      <VictoryPie 
        theme={VictoryTheme.material}
        data={data}
        x={x}
        y={y}
        height="20px"
        colorScale={colorScale}
        padding={padding}
        startAngle={-90}
        endAngle={90}
        innerRadius={25}
        padAngle={3}
      />
    </VictoryContainer>
  );
};

VictoryGauge.propTypes = {
  data: PropTypes.array.isRequired,
  x: PropTypes.string.isRequired,
  y: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  colorScale: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired
};

export default VictoryGauge;
