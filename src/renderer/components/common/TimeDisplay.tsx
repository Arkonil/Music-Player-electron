import classes from './common.module.scss';

type PropType = {
  seconds: number;
  className: string;
  style?: React.CSSProperties;
};

function TimeDisplay({
  className,
  seconds = 0,
  style = {},
}: PropType): JSX.Element {
  const date = new Date(Math.round(seconds) * 1000);
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
    <div className={`${classes.timeDisplay} ${className}`} style={style}>
      <span>{displayString}</span>
    </div>
  );
}

TimeDisplay.defaultProps = {
  style: {},
};

export default TimeDisplay;
