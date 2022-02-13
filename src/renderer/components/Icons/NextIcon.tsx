import { SvgIcon } from '@mui/material';
import Color from '../common/Color';
import classes from './IconStyles.module.scss';

type PropType = {
  color: Color | string;
};

function NextIcon({ color, ...extraProps }: PropType) {
  let derivedColor: string;
  if (typeof color === 'string') {
    derivedColor = color || 'black';
  } else {
    derivedColor =
      (color && color.toRGBAString && color.toRGBAString()) || 'black';
  }

  return (
    <SvgIcon
      viewBox="0 0 493.796 493.796"
      className={classes.playerIcon}
      sx={{ color: derivedColor, height: '100%', width: '100%' }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...extraProps}
    >
      <path
        d="M355.938,200.956L81.414,12.128c-11.28-7.776-23.012-11.88-33.056-11.88c-22.052,0-36.672,18.496-36.672,48.26v397.036
			c0,14.54,4.228,26.688,10.496,35.144c6.364,8.572,16.32,13.108,27.076,13.108c10.04,0,21.308-4.112,32.584-11.876l274.276-188.828
			c17.632-12.152,27.3-28.508,27.296-46.076C383.414,229.456,373.594,213.1,355.938,200.956z"
      />
      <path d="M456.446,493.672l-0.293-0.004c-0.048,0-0.095,0.004-0.143,0.004H456.446z" />
      <path
        d="M455.638,0L444.29,0.032c-14.86,0-27.724,12.112-27.724,26.992v439.368c0,14.896,12.652,27.124,27.532,27.124
				l12.055,0.152c14.805-0.079,25.957-12.412,25.957-27.252V26.996C482.11,12.116,470.51,0,455.638,0z"
      />
    </SvgIcon>
  );
}

export default NextIcon;
