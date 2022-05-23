import React from 'react';
import classes from './common.module.scss';

type PropType = {
  seconds: number;
  className?: string;
};

function TimeDisplay({ className, seconds = 0 }: PropType): JSX.Element {
  const date = new Date(Math.round(seconds || 0) * 1000);
  let displayString = '';
  try {
    if (seconds > 3600) {
      displayString = date.toISOString().substring(11, 19);
    } else {
      displayString = date.toISOString().substring(14, 19);
    }
  } catch (error) {
    console.log({ error, seconds, date });
  }

  return (
    <div className={`time_display ${classes.timeDisplay} ${className}`}>
      <span>{displayString}</span>
    </div>
  );
}

TimeDisplay.defaultProps = {
  className: '',
};

export default React.memo(TimeDisplay);
