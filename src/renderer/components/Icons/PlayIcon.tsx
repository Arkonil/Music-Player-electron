import React from 'react';

function PlayIcon() {
  return (
    <svg viewBox="0 0 459 459" className="player__icon play">
      <path
        className="level1"
        d="M229.5,0 C102.751,0,0,102.751,0,229.5 S102.751,459,229.5,459 S459,356.249,459,229.5 S356.249,0,229.5,0z"
      />
      <path
        className="level2"
        d="M310.292,239.651 l-111.764,76.084 c-3.761,2.56-8.63,2.831-12.652,0.704 c-4.022-2.128-6.538-6.305-6.538-10.855 V153.416 c0-4.55,2.516-8.727,6.538-10.855 c4.022-2.127,8.891-1.857,12.652,0.704 l111.764,76.084 c3.359,2.287,5.37,6.087,5.37,10.151 C315.662,233.564,313.652,237.364,310.292,239.651z"
      />
    </svg>
  );
}

export default React.memo(PlayIcon);
