import moment from 'moment';

export const uptimeString = (unixTime) => {
  const launch = moment.unix(unixTime);
  const upDur = moment.duration(moment().diff(launch));
  const y = upDur.years();
  const m = upDur.months();
  const d = upDur.days();
  const h = upDur.hours();
  const mn = upDur.minutes();
  const s = upDur.seconds();

  const ys = (y ===1 ) ? "year" : "years";
  const ms = (m === 1) ? "month" : "months";
  const ds = (d === 1) ? "day" : "days";
  const hs = (h === 1) ? "hour" : "hours";
  const mns = (mn === 1) ? "minute" : "minutes";
  const ss = (s === 1) ? "second" : "seconds";

  if (y > 0) {
    return `${y} ${ys}, ${m} ${ms} ${d} ${ds}`;
  } else if (m > 0) {
    return `${m} ${ms}, ${d} ${ds} and ${h} ${hs}`; 
  } else if (d > 0) {
    return `${d} ${ds}, ${h} ${hs} and ${mn} ${mns}`;
  } else if (h > 0) {
    return `${h} ${hs} ${mn} ${mns} and ${s} ${ss}`;
  } else {
    return `${mn} minutes and ${s} seconds`;
  }
};

// export const displayTime = (unixTime) => moment.unix(unixTime).format('dddd MMMM Do YYYY, h:mm:ss a');
export const displayTime = (unixTime) => moment.unix(unixTime).format('LLLL');
export const isoDisplayTime = (unixTime) => moment.unix(unixTime).format();