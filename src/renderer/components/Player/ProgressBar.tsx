/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useRef, useEffect } from 'react';
import { toOpacityString, toSaturationString } from '../common/Color';

type DrawingTools = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  maxWidth: number;
  maxHeight: number;
  numberOfBars: number;
  lingradActive: CanvasGradient;
  lingradInactive: CanvasGradient;
  shadowLength: number;
};

const getSample = (
  array: Float32Array,
  size: number
): [Float32Array, boolean] => {
  console.warn('Doing Heavy Calculations');
  const arr = Float32Array.from(array);
  if (size >= arr.length) {
    return [arr, true];
  }

  const interval = Math.floor(arr.length / size);
  const sample = new Float32Array(size);

  for (let i = size; i--; ) {
    for (let j = interval; j--; ) {
      sample[i] += Math.abs(arr[i * interval + j]);
    }
  }
  const max = Math.max(...sample);
  if (max) {
    for (let i = size; i--; ) {
      sample[i] /= max;
    }
  }
  return [sample, Boolean(max)];
};

type PropType = {
  className?: string;
  array: Float32Array;
  barGap?: number;
  barWidth?: number;
  shadowBlur?: number;
  shadowLength?: number;
  handleActiveRadius?: number;
  handleInactiveRadius?: number;
  padding?: number;
  currentProgress: number;
  onChange: (value: number) => void;
  shouldRecalculate: boolean;
  toolTipHandler: (
    event: React.MouseEvent<HTMLCanvasElement>,
    value: number,
    isMouseOver: boolean
  ) => void;
};

function ProgressBar({
  array,
  onChange,
  toolTipHandler,
  currentProgress,
  shouldRecalculate,
  className = '',
  barGap = 1,
  padding = 10,
  barWidth = 1,
  shadowBlur = 10,
  shadowLength = 0.5,
  handleActiveRadius = 7,
  handleInactiveRadius = 5,
}: PropType) {
  const multiplierChange = useRef(0.05);
  const sampleArray = useRef(new Float32Array(10));
  const isMouseOver = useRef(false);
  const shouldDrawLine = useRef(false);
  const multiplier = useRef(1);
  const mouseOnHandle = useRef(false);
  const progress = useRef(currentProgress);

  const colors = useRef({
    track: '#000000',
    handle: '#000000',
    shadow: '#000000',
  });

  const canvasRef = useRef(document.createElement('canvas'));
  const raf = useRef(0);
  const timeout = useRef<number>(0);

  const drawingTools = useRef<DrawingTools | null>(null);

  // Extra Functions
  const bezierCurve = (t: number): number => {
    return !isMouseOver.current
      ? 3 * t * (1 - t) * (1 - t) * 1.8 + 3 * t * t * (1 - t) * 0.7 + t * t * t
      : t * t * t;
  };

  // Drawing Functions
  const readyCanvas = (): boolean => {
    const canvas = canvasRef.current;
    canvas.width = canvas.getClientRects()[0].width;
    canvas.height = canvas.getClientRects()[0].height;
    const context = canvas.getContext('2d');
    if (context === null) {
      console.error({ canvas });
      throw new Error('Could not create canvas context');
    }
    const maxWidth = canvas.width - 2 * padding;
    const maxHeight = canvas.height - 2 * padding;
    let numberOfBars =
      1 + Math.floor((maxWidth - barGap) / (barWidth + barGap));
    let isWorthRendering: boolean;
    [sampleArray.current, isWorthRendering] = getSample(array, numberOfBars);
    numberOfBars = sampleArray.current.length;

    const lingradActive = context.createLinearGradient(
      padding,
      padding,
      padding,
      padding + maxHeight
    );

    const lingradInactive = context.createLinearGradient(
      padding,
      padding,
      padding,
      padding + maxHeight
    );

    context.lineCap = 'round';
    context.shadowColor = colors.current.shadow;
    context.shadowBlur = shadowBlur ?? 10;

    drawingTools.current = {
      canvas,
      context,
      maxWidth,
      maxHeight,
      numberOfBars,
      lingradActive,
      lingradInactive,
      shadowLength: shadowLength ?? 0,
    };

    return isWorthRendering;
  };
  const drawBars = () => {
    if (drawingTools.current === null) {
      console.error('drawing tools can not be used as it is null');
      return;
    }
    const {
      canvas,
      context,
      maxHeight,
      lingradActive,
      lingradInactive,
      shadowLength,
    } = drawingTools.current;

    // Clearing Canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Calculating Dimensions
    const barMiddle = {
      x: padding + barGap / 2,
      y: padding + maxHeight / 2,
    };
    let change = 0;
    const currentMultiplier = bezierCurve(multiplier.current);
    const slicePosition = Math.floor(
      progress.current * sampleArray.current.length
    );
    const factor = currentMultiplier * (barMiddle.y - padding);
    const minWidth = Math.max((barGap + barWidth) * 0.5, 1);

    context.lineWidth = barWidth + (1 - currentMultiplier) * barGap;

    // Active Part

    const activeColor = colors.current.track;
    const activeColorShadow = toOpacityString(
      activeColor,
      1 - multiplier.current * 0.5
    );
    lingradActive.addColorStop(0, activeColor);
    lingradActive.addColorStop(0.499, activeColor);
    lingradActive.addColorStop(0.5, activeColorShadow);
    lingradActive.addColorStop(1, activeColorShadow);

    context.strokeStyle = lingradActive;
    context.beginPath();
    for (const item of sampleArray.current.slice(0, slicePosition)) {
      change = Math.max(minWidth, item * factor);
      context.moveTo(barMiddle.x, barMiddle.y - change);
      context.lineTo(barMiddle.x, barMiddle.y + change * shadowLength);
      barMiddle.x += barWidth + barGap;
    }
    context.stroke();

    // Inactive Part

    const inactiveColor = toSaturationString(colors.current.track, 0);
    const inactiveColorShadow = toOpacityString(
      inactiveColor,
      1 - multiplier.current * 0.5
    );
    lingradInactive.addColorStop(0, inactiveColor);
    lingradInactive.addColorStop(0.499, inactiveColor);
    lingradInactive.addColorStop(0.5, inactiveColorShadow);
    lingradInactive.addColorStop(1, inactiveColorShadow);

    context.strokeStyle = lingradInactive;
    context.beginPath();
    for (const item of sampleArray.current.slice(slicePosition)) {
      change = Math.max(minWidth, item * factor);
      context.moveTo(barMiddle.x, barMiddle.y - change);
      context.lineTo(barMiddle.x, barMiddle.y + change * shadowLength);
      barMiddle.x += barWidth + barGap;
    }
    context.stroke();
  };

  const drawLine = () => {
    if (drawingTools.current === null) {
      console.error('drawing tools can not be used as it is null');
      return;
    }
    const { canvas, context, maxHeight } = drawingTools.current;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Calculating Dimensions
    const barMiddle = {
      y: (padding + maxHeight / 2) | 0,
      x1: 0,
      x2: 0,
      x3: 0,
    };
    barMiddle.x1 = padding + barGap / 2;
    barMiddle.x3 = canvas.width - barMiddle.x1;
    barMiddle.x2 =
      progress.current * barMiddle.x3 + (1 - progress.current) * barMiddle.x1;

    context.lineWidth = Math.max(4, barWidth + barGap);

    // Active Part
    const activeColor = colors.current.track;
    context.beginPath();
    context.strokeStyle = activeColor;
    context.moveTo(barMiddle.x1, barMiddle.y);
    context.lineTo(barMiddle.x2, barMiddle.y);
    context.stroke();

    // Inactive Part
    const inactiveColor = toSaturationString(colors.current.track, 0);
    context.beginPath();
    context.strokeStyle = inactiveColor;
    context.moveTo(barMiddle.x2, barMiddle.y);
    context.lineTo(barMiddle.x3, barMiddle.y);
    context.stroke();

    // Handle
    context.arc(
      barMiddle.x2,
      barMiddle.y,
      mouseOnHandle.current ? handleActiveRadius : handleInactiveRadius,
      0,
      2 * Math.PI,
      false
    );

    context.fillStyle = colors.current.handle;

    context.fill();

    context.arc(
      barMiddle.x2,
      barMiddle.y,
      mouseOnHandle.current ? handleActiveRadius / 2 : handleInactiveRadius / 2,
      0,
      1 * Math.PI,
      false
    );
    context.fillStyle = '#fff';

    context.fill();
  };

  const draw = async (type: string, setupAgain = false): Promise<void> => {
    if (setupAgain) {
      shouldDrawLine.current = !readyCanvas();
    }
    let progressType = type;
    if (shouldDrawLine.current) {
      progressType = 'line';
      multiplier.current = 0;
    }

    switch (progressType) {
      case 'bar':
        drawBars();
        break;
      case 'line':
        drawLine();
        break;
      default:
        throw new Error(`Invalid type: ${progressType}`);
    }
  };

  // Animation
  const expandAnimation = () => {
    window.cancelAnimationFrame(raf.current);
    const update = () => {
      if (!shouldDrawLine.current && multiplier.current < 1) {
        multiplier.current = Math.min(
          1,
          multiplier.current + multiplierChange.current
        );
        if (multiplier.current) draw('bar');
        else draw('line');
        raf.current = window.requestAnimationFrame(update);
      }
    };
    raf.current = window.requestAnimationFrame(update);
  };
  const contractAnimation = () => {
    window.cancelAnimationFrame(raf.current);
    const update = () => {
      if (multiplier.current > 0) {
        multiplier.current = Math.max(
          0,
          multiplier.current - multiplierChange.current
        );
        if (multiplier.current) draw('bar');
        else draw('line');
        raf.current = window.requestAnimationFrame(update);
      }
    };
    raf.current = window.requestAnimationFrame(update);
  };

  // Event Handlers
  const mouseClickHandler = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawingTools.current === null) {
      console.error('drawing tools can not be used as it is null');
      return;
    }
    const { left: l } = e.currentTarget.getBoundingClientRect();
    let targetValue = (e.clientX - l - padding) / drawingTools.current.maxWidth;
    targetValue = Math.max(0, Math.min(1, targetValue));

    const stepCount = 10;
    const step = (targetValue - progress.current) / stepCount;
    let currentStep = 0;

    const moveToTarget = () => {
      if (currentStep < stepCount) {
        progress.current += step;
        currentStep++;
        draw('line');
        raf.current = requestAnimationFrame(moveToTarget);
      } else {
        cancelAnimationFrame(raf.current);
        progress.current = targetValue;
        onChange(progress.current);
      }
    };

    raf.current = requestAnimationFrame(moveToTarget);
  };
  const mouseEnterHandler = () => {
    isMouseOver.current = true;
    if (shouldDrawLine.current) {
      draw('line');
      return;
    }
    contractAnimation();
  };
  const mouseLeaveHandler = (e: React.MouseEvent<HTMLCanvasElement>) => {
    mouseOnHandle.current = false;
    isMouseOver.current = false;
    if (shouldDrawLine.current) {
      draw('line');
    } else {
      expandAnimation();
    }
    toolTipHandler(e, 0, false);
  };
  const mouseMoveHandler = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawingTools.current === null) {
      console.error('drawing tools can not be used as it is null');
      return;
    }

    const { left: l } = e.currentTarget.getBoundingClientRect();
    let position = (e.clientX - l - padding) / drawingTools.current.maxWidth;
    const isMouseOver = position >= 0 && position <= 1;

    position = Math.max(0, Math.min(1, position));
    if (mouseOnHandle.current) {
      progress.current = position;
      draw('line');
    }
    toolTipHandler(e, position, isMouseOver);
  };
  const mouseDownHandler = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawingTools.current === null) {
      console.error('drawing tools can not be used as it is null');
      return;
    }

    const { top: t, left: l } = e.currentTarget.getBoundingClientRect();
    const x =
      progress.current * drawingTools.current.maxWidth +
      padding +
      barGap / 2 +
      l;
    const y =
      drawingTools.current.maxHeight / (1 + drawingTools.current.shadowLength) +
      padding +
      t;
    const r = handleActiveRadius;
    if (
      x - r < e.clientX &&
      e.clientX < x + r &&
      y - r < e.clientY &&
      e.clientY < y + r
    ) {
      mouseOnHandle.current = true;
      console.log('mouse is on handle');
    } else {
      mouseOnHandle.current = false;
    }
    draw('line');
  };

  const mouseUpHandler = () => {
    if (mouseOnHandle.current) {
      console.log('onMouseUpHandler');
      onChange(progress.current);
      mouseOnHandle.current = false;
      draw('line');
    }
  };

  const onResize = () => {
    clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => {
      draw('bar', true);
    }, 250);
  };

  useEffect(() => {
    colors.current = {
      track: getComputedStyle(document.documentElement).getPropertyValue(
        '--accent-color'
      ),
      handle: getComputedStyle(document.documentElement).getPropertyValue(
        '--primary-color'
      ),
      shadow: getComputedStyle(document.documentElement).getPropertyValue(
        '--c-black'
      ),
    };
  });

  useEffect(() => {
    draw('bar', true);
  }, []);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else if (!mouseOnHandle.current) {
      progress.current = currentProgress;

      if (shouldRecalculate) {
        let waitFor = 0;
        if (!shouldDrawLine.current) {
          contractAnimation();
          waitFor = 500;
        }

        setTimeout(() => {
          draw(isMouseOver.current ? 'line' : 'bar', true);
          expandAnimation();
        }, waitFor);
      } else {
        draw(isMouseOver.current ? 'line' : 'bar', false);
      }
    }
  }, [
    currentProgress,
    shouldRecalculate,
    isMouseOver,
    shouldDrawLine,
    mouseOnHandle,
  ]);

  window.addEventListener('resize', onResize);

  return (
    <div className={`player__progress-bar ${className}`}>
      <canvas
        ref={canvasRef}
        onClick={mouseClickHandler}
        onMouseEnter={mouseEnterHandler}
        onMouseLeave={mouseLeaveHandler}
        onMouseMove={mouseMoveHandler}
        onMouseDown={mouseDownHandler}
        onMouseUp={mouseUpHandler}
      />
    </div>
  );
}

ProgressBar.defaultProps = {
  className: '',
  barGap: 1,
  barWidth: 1,
  shadowLength: 0.5,
  shadowBlur: 10,
  handleActiveRadius: 7,
  handleInactiveRadius: 5,
  padding: 13.66,
};

export default ProgressBar;
