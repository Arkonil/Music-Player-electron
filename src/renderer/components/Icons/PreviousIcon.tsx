import { SvgIcon } from '@mui/material';
import Color from '../common/Color';
import classes from './IconStyles.module.scss';

type PropType = {
  color: Color | string;
};

function PrevIcon({ color, ...extraProps }: PropType) {
  let derivedColor: string;
  if (typeof color === 'string') {
    derivedColor = color || 'black';
  } else {
    derivedColor =
      (color && color.toRGBAString && color.toRGBAString()) || 'black';
  }
  return (
    <SvgIcon
      viewBox="0 0 493.52 493.52"
      className={classes.playerIcon}
      sx={{ color: derivedColor, height: '100%', width: '100%' }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...extraProps}
    >
      <path
        d="M447.126,0.236c-10.056,0-20.884,4.12-32.148,11.884L140.882,200.952c-17.644,12.152-27.252,28.504-27.252,46.06
 			c-0.004,17.56,9.78,33.924,27.428,46.076L415.39,481.784c11.284,7.768,22.568,11.736,32.604,11.736h0.012
 			c10.76,0,18.916-4.404,25.276-12.972c6.268-8.46,8.688-20.476,8.688-35.012V48.508C481.974,18.74,469.186,0.236,447.126,0.236z"
      />
      <path
        d="M53.106,0.036L39.894,0C25.018,0,11.55,12.112,11.55,26.996v439.42c0,14.884,13.024,27.1,27.908,27.1h0.456l12.948-0.072
 			c14.88,0,28.092-12.164,28.092-27.048V27.028C80.958,12.144,67.97,0.036,53.106,0.036z"
      />
    </SvgIcon>
  );
}

export default PrevIcon;
