import Color from '../common/Color';
import classes from './IconStyles.module.scss';

type PropType = {
  outerColor: Color | string;
  innerColor: Color | string;
};

export default function PauseIcon({ outerColor, innerColor }: PropType) {
  const derivedOuterColor =
    typeof outerColor === 'string'
      ? outerColor
      : (outerColor && outerColor.toRGBAString()) || 'black';
  const derivedInnerColor =
    typeof innerColor === 'string'
      ? innerColor
      : (innerColor && innerColor.toRGBAString()) || 'white';

  return (
    <svg viewBox="0 0 39.989 39.989" className={classes.playerIcon}>
      <path
        fill={derivedOuterColor}
        d="M19.995,0
                C8.952,0,0,8.952,0,19.994
                c0,11.043,8.952,19.995,19.995,19.995
                s19.995-8.952,19.995-19.995
	            C39.989,8.952,31.037,0,19.995,0z"
      />
      <path
        fill={derivedInnerColor}
        d="
                M18.328,26.057c0,0.829-0.671,1.5-1.5,1.5
                s-1.5-0.671-1.5-1.5
                V14.724
                c0-0.829,0.671-1.5,1.5-1.5
	            s1.5,0.671,1.5,1.5
                V26.057z"
      />
      <path
        fill={derivedInnerColor}
        d="
                M24.661,26.057
                c0,0.829-0.671,1.5-1.5,1.5
                s-1.5-0.671-1.5-1.5
                V14.724
                c0-0.829,0.671-1.5,1.5-1.5
	            s1.5,0.671,1.5,1.5
                V26.057z"
      />
    </svg>
  );
}
