import React from 'react';
import Color from '../common/Color';

import * as Icons from '../Icons/Icon';
import MediaButton from './MediaButton';
import PlayPauseButton from './PlayPauseButton';

import classes from './PlayerStyles.module.scss';
import { useTheme } from '../contexts/ThemeContext';

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
  // console.log('Rendering PlaybackController');
  const { theme } = useTheme();

  let RepeatIcon: React.FC<{ color: string | Color }>;
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
      className={`player__controller ${classes.playBackController} ${className}`}
    >
      {/* Shuffle Button */}
      <MediaButton
        toolTip={`${isShuffleOn ? 'Disable' : 'Enable'} Shuffle`}
        onClick={onShuffleButtonClick}
        IconComponent={Icons.ShuffleIcon}
        color={
          isShuffleOn ? theme.colors.primaryColor : theme.colors.secondaryColor
        }
      />
      {/* Previous Button */}
      <MediaButton
        toolTip="Previous"
        onClick={onPreviousButtonClick}
        IconComponent={Icons.PreviousIcon}
        color={theme.colors.secondaryColor}
      />
      {/* Play Pause Button */}
      <PlayPauseButton
        onClick={onAudioStateChange}
        primaryColor={theme.colors.primaryColor}
        secondaryColor={theme.colors.secondaryColor}
        isPlaying={isPlaying}
      />
      {/* Next Button */}
      <MediaButton
        toolTip="Next"
        onClick={onNextButtonClick}
        IconComponent={Icons.NextIcon}
        color={theme.colors.secondaryColor}
      />
      {/* Repeat Button */}
      <MediaButton
        toolTip={`Repeat ${nextRepeatState[repeatState]}`}
        onClick={onRepeatButtonClick}
        IconComponent={RepeatIcon}
        color={
          repeatState === 'off'
            ? theme.colors.secondaryColor
            : theme.colors.primaryColor
        }
      />
    </div>
  );
}

PlaybackController.defaultProps = {
  className: '',
};

export default React.memo(PlaybackController);
