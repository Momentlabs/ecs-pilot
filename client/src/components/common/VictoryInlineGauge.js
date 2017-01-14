import React, {PropTypes} from 'react';
// import {Link} from 'react-router';

import { VictoryPie, VictoryTheme, VictoryContainer, VictoryTooltip } from 'victory';

// TOD: Perhaps these magic numbers should be obtained from somehwere else.
const InlineWidth = 40;
const InlineHeight = 40;
const InlinePadding = {bottom:-15, top: -15};

// Since this component is simple and static, there's no parent container for it.
// The tooltip is not working.
const VictoryInlineGuauge = ({data, x, y, colorScale}) => {
  return (
    <VictoryContainer theme={VictoryTheme.material} width={40} height={40}>
      <VictoryPie 
        theme={VictoryTheme.material}
        data={data}
        x={x}
        y={y}
        width={InlineWidth}
        height={InlineHeight}
        padding={InlinePadding}
        colorScale={colorScale}
        labelComponent={<VictoryTooltip 
          x={-100} data={data} orientation="left" horizontal={true} renderInPortal={true}
          pointerLength={0}
          />}
        startAngle={-90}
        endAngle={90}
        innerRadius={11}
        padAngle={3}
      />
    </VictoryContainer>
  );
};

VictoryInlineGuauge.propTypes = {
  data: PropTypes.array.isRequired,
  x: PropTypes.string.isRequired,
  y: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  colorScale: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired
};

export default VictoryInlineGuauge;
