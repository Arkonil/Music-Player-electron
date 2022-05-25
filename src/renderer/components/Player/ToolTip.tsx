import React from 'react';

const ToolTip = React.forwardRef(
  (_props, ref: React.ForwardedRef<HTMLDivElement>) => {
    return (
      <div className="player__progress-bar__tool-tip">
        <div ref={ref} hidden>
          <div className="tool-tip-value" />
        </div>
      </div>
    );
  }
);

export default ToolTip;
