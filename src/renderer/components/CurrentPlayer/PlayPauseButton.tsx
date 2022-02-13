import { Button, Tooltip} from "@mui/material";
import Color from "../common/Color";
import {PlayIcon, PauseIcon } from '../Icons/Icon';

type PropType = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  isPlaying: boolean;
  primaryColor: string | Color;
  secondaryColor: string | Color;
}

function PlayPauseButton({onClick, isPlaying, primaryColor, secondaryColor}: PropType) {
    return (
        <Tooltip title={isPlaying ? 'Pause': 'Play'} arrow enterDelay={500} leaveDelay={0}>
          <div>
              <Button onClick={onClick} disableRipple>
                  {isPlaying ? (
                      <PauseIcon outerColor={secondaryColor} innerColor={primaryColor} />
                  ) : (
                      <PlayIcon outerColor={secondaryColor} innerColor={primaryColor} />
                  )}
              </Button>
          </div>
        </Tooltip>
    );
}

export default PlayPauseButton;
