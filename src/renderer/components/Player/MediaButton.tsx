import React from 'react';
import { Button, Tooltip } from '@mui/material';

type PropType = {
  toolTip: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  IconComponent: React.FC;
  enabled?: boolean;
};

function MediaButton({
  toolTip,
  IconComponent,
  enabled = false,
  onClick,
}: PropType) {
  return (
    <Tooltip title={toolTip} arrow enterDelay={500} leaveDelay={0}>
      <div attr-enabled={enabled.toString()}>
        <Button onClick={onClick}>
          <IconComponent />
        </Button>
      </div>
    </Tooltip>
  );
}

MediaButton.defaultProps = {
  enabled: false,
};

export default MediaButton;
