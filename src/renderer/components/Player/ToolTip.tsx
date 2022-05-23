import React from 'react';
import classes from '../../style/Player.module.scss';
import { useTheme } from '../contexts/ThemeContext';

const ToolTip = React.forwardRef(
  (_props, ref: React.ForwardedRef<HTMLDivElement>) => {
    const { theme } = useTheme();
    return (
      <div className={`player__progress_bar__tooltip ${classes.toolTip}`}>
        <div ref={ref} hidden>
          <div
            style={{
              backgroundColor: theme.colors.toolTipColor,
              color: 'black',
            }}
          />
          <div style={{ borderTopColor: theme.colors.toolTipColor }} />
        </div>
      </div>
    );
  }
);

export default ToolTip;
