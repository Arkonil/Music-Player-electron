import { Button, Tooltip } from '@mui/material';
import React from 'react';
// import { BaseColorClass } from '../common/Color';
import Color from '../common/Color';
// import classes from './CurrentPlayer.module.scss';

type PropType = {
  toolTip: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  IconComponent: React.FC<{ color: string | Color }>;
  color: string | Color;
};

function MediaButton({ toolTip, onClick, IconComponent, color }: PropType) {
  return (
    <Tooltip title={toolTip} arrow enterDelay={500} leaveDelay={0}>
      <div>
        <Button onClick={onClick}>
          <IconComponent color={color} />
        </Button>
      </div>
    </Tooltip>
  );
}

export default MediaButton;
