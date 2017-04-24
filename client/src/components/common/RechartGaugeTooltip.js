import React, { PropTypes } from 'react';
// import { Link, IndexLink } from 'react-router';

export default class RechartGaugeTooltip extends React.Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {
    // console.log("RechartGaugeTooltip:Render() - props", this.props);
    return (
      <div>Hello</div>
    );
  }
}

RechartGaugeTooltip.propTypes = {
  label: PropTypes.string,
  payload: PropTypes.array,
  type: PropTypes.string
};
