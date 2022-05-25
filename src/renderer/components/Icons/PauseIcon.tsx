import React from 'react';

function PauseIcon() {
  return (
    <svg viewBox="0 0 39.989 39.989" className="player__icon pause">
      <path
        className="level1"
        d="M19.995,0 C8.952,0,0,8.952,0,19.994 c0,11.043,8.952,19.995,19.995,19.995 s19.995-8.952,19.995-19.995 C39.989,8.952,31.037,0,19.995,0z"
      />
      <path
        className="level2"
        d="M18.328,26.057c0,0.829-0.671,1.5-1.5,1.5 s-1.5-0.671-1.5-1.5 V14.724 c0-0.829,0.671-1.5,1.5-1.5 s1.5,0.671,1.5,1.5 V26.057z"
      />
      <path
        className="level2"
        d="M24.661,26.057 c0,0.829-0.671,1.5-1.5,1.5 s-1.5-0.671-1.5-1.5 V14.724 c0-0.829,0.671-1.5,1.5-1.5 s1.5,0.671,1.5,1.5 V26.057z"
      />
    </svg>
  );
}

export default React.memo(PauseIcon);
