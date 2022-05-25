import { Button, Tooltip } from '@mui/material';
import { PlayIcon, PauseIcon } from '../Icons';

type PropType = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  isPlaying: boolean;
};

function PlayPauseButton({ onClick, isPlaying }: PropType) {
  return (
    <Tooltip
      title={isPlaying ? 'Pause' : 'Play'}
      arrow
      enterDelay={500}
      leaveDelay={0}
    >
      <div>
        <Button onClick={onClick} disableRipple>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </Button>
      </div>
    </Tooltip>
  );
}

export default PlayPauseButton;
