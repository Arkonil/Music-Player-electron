/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import Split, { SplitProps } from 'react-split';

import './common.scss';

interface PropsType extends SplitProps  {
  className?: string;
  children: React.ReactNode[];
};

function ResizableChildContainer({
  className = '',
  children,
  ...splitProps
}: PropsType) {
  const {direction} = splitProps;
  return (
    <Split
      className={`resizable-child-container rcc--${direction} ${className}`}
      direction={direction}
      snapOffset={0}
      gutterSize={5}
      expandToMin
      {...splitProps}
    >
      {children}
    </Split>
  );
}

ResizableChildContainer.defaultProps = {
  className: '',
};

export default ResizableChildContainer;
