import React, { useContext } from 'react';
import { Button, Slider } from '@mui/material';
import * as Icons from '../Icons/Icon';

import { ThemeContext } from '../contexts/ThemeContext';
import classes from './PlayerStyles.module.scss';

type ControllerProps = {
  className?: string;
  volume: number;
  muted: boolean;
  onVolumeChange: (value: number) => void;
  onMutedChange: () => void;
};

function VolumeControl({
  volume,
  muted,
  onVolumeChange,
  onMutedChange,
  className = '',
}: ControllerProps) {
  const { theme } = useContext(ThemeContext);
  let level;
  if (!volume || muted) {
    level = 'mute';
  } else if (volume <= 0.5) {
    level = 'low';
  } else {
    level = 'high';
  }

  return (
    <div
      className={`player__volume_control ${classes.volumeController} ${className}`}
      attr-muted={!volume || muted ? 'yes' : 'no'}
    >
      <Button onClick={onMutedChange}>
        <Icons.VolumeIcon level={level} color={theme.colors.secondaryColor} />
      </Button>
      <Slider
        sx={{ color: theme.colors.primaryColor }}
        value={volume}
        onChange={(_event: Event, value: number | number[]) => {
          if (!Array.isArray(value)) {
            onVolumeChange(value);
          }
        }}
        min={0}
        max={1}
        step={0.001}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => {
          if (!value) return 'mute';
          if (value === 1) return 'full';
          return `${Math.floor(value * 100)}`;
        }}
        data-background-color={theme.colors.toolTipColor}
        data-color="black"
      />
    </div>
  );
}

VolumeControl.defaultProps = {
  className: '',
};

export default React.memo(VolumeControl);
