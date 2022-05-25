import React from 'react';

import * as Icons from '../Icons/Icon';
import MediaButton from './MediaButton';
import PlayPauseButton from './PlayPauseButton';

type PropType = {
  onShuffleButtonClick: () => void;
  onPreviousButtonClick: () => void;
  onNextButtonClick: () => void;
  onRepeatButtonClick: () => void;
  onAudioStateChange: () => void;
  isPlaying: boolean;
  isShuffleOn: boolean;
  repeatState: string;
  className?: string;
};

const nextRepeatState: { [key: string]: string } = {
  off: 'all',
  all: 'one',
  one: 'off',
};

function PlaybackController({
  className,
  onShuffleButtonClick,
  onPreviousButtonClick,
  onNextButtonClick,
  onRepeatButtonClick,
  onAudioStateChange,
  isPlaying,
  isShuffleOn,
  repeatState,
}: PropType) {
  let RepeatIcon: React.FC;
  switch (repeatState) {
    case 'off':
    case 'all':
      RepeatIcon = Icons.RepeatIcon;
      break;
    case 'one':
      RepeatIcon = Icons.RepeatOnceIcon;
      break;
    default:
      throw new Error(`Invalid Argument: ${repeatState}`);
  }
  return (
    <div
      className={`player__controller ${className}`}
    >
      {/* Shuffle Button */}
      <MediaButton
        toolTip={`${isShuffleOn ? 'Disable' : 'Enable'} Shuffle`}
        onClick={onShuffleButtonClick}
        IconComponent={Icons.ShuffleIcon}
        enabled={isShuffleOn}
      />
      {/* Previous Button */}
      <MediaButton
        toolTip="Previous"
        onClick={onPreviousButtonClick}
        IconComponent={Icons.PreviousIcon}
      />
      {/* Play Pause Button */}
      <PlayPauseButton
        onClick={onAudioStateChange}
        isPlaying={isPlaying}
      />
      {/* Next Button */}
      <MediaButton
        toolTip="Next"
        onClick={onNextButtonClick}
        IconComponent={Icons.NextIcon}
      />
      {/* Repeat Button */}
      <MediaButton
        toolTip={`Repeat ${nextRepeatState[repeatState]}`}
        onClick={onRepeatButtonClick}
        IconComponent={RepeatIcon}
        enabled={repeatState !== 'off'}
      />
    </div>
  );
}

PlaybackController.defaultProps = {
  className: '',
};

export default React.memo(PlaybackController);
