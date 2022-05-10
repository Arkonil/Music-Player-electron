/* eslint-disable @typescript-eslint/no-shadow */
import React, { useRef, useEffect, useContext } from 'react';
import { toOpacityString, toSaturationString } from '../common/Color';
import classes from './PlayerStyles.module.scss';
import { ThemeContext } from '../contexts/ThemeContext';

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
    // numberOfBars = arr.length;
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
  // console.log(sample);
  return [sample, Boolean(max)];
};

type PropType = {
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
// TODO: Modify it \/
/**
 * Audio Progress Bar Component
 * @param {Float32Array} array Array of audio samples
 * @param {number} barGap Gap between bars (in number of pixels)
 * @param {number} barWidth Width of bars (in number of pixels)
 * @param {number} shadowBlur size of shadow effect
 * @param {number} shadowLength ratio of shadow length and bar length (inside [0, 1])
 * @param {number} handleActiveRadius Radius of slider handle when mouse down (in number of pixels)
 * @param {number} handleInactiveRadius Radius of slider handle when mouse up (in number of pixels)
 * @param {number} padding Padding of component
 * @param {number} currentProgress initial value of progress meter
 * @param {Function} onChange callback function to be called when slider is changed
 * @param {Object} style Object containing css style properties
 * @param {boolean} shouldRecalculate whether to recalculate sample array
 *
 */
function ProgressBar({
  array,
  onChange,
  toolTipHandler,
  currentProgress,
  shouldRecalculate,
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

  const theme = useContext(ThemeContext);
  const colors = useRef({
    track: theme.colors.primaryColor,
    handle: theme.colors.secondaryColor,
    shadow: theme.colors.mainColor,
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
    // : 3 * t * (1 - t) * (1 - t) * -0.8 + 3 * t * t * (1 - t) * 0.3 + t * t * t;
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

    // shadowLength = shadowLength || 0;
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
    context.shadowColor = theme.colors.mainColor;
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
      y: padding + maxHeight / 2, // (1 + shadowLength),
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
    lingradActive.addColorStop(0.5, activeColor);
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
    lingradInactive.addColorStop(0.5, inactiveColor);
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
      y: padding + maxHeight / 2, // (1 + shadowLength),
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
    // context.fillStyle = mouseOnHandle.current
    //   ? handleActiveColor.toHSLAString()
    //   : handleInactiveColor.toHSLAString() || handleActiveColor.toHSLAString();
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
        // multiplier.current ? draw("bar") : draw("line");
        raf.current = window.requestAnimationFrame(update);
      }
    };
    raf.current = window.requestAnimationFrame(update);
  };
  const contractAnimation = () => {
    // console.log("in contractAnimation");
    window.cancelAnimationFrame(raf.current);
    const update = () => {
      if (multiplier.current > 0) {
        multiplier.current = Math.max(
          0,
          multiplier.current - multiplierChange.current
        );
        if (multiplier.current) draw('bar');
        else draw('line');
        // multiplier.current ? this.draw("bar") : this.draw("line");
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
    // console.log("onMouseClickHandler");
    const { left: l } = e.currentTarget.getBoundingClientRect();
    let targetValue = (e.clientX - l - padding) / drawingTools.current.maxWidth;
    targetValue = Math.max(0, Math.min(1, targetValue));
    // console.log({target: targetValue, current: progress.current});

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
    // console.log("onMouseMoveHandler");
    const { left: l } = e.currentTarget.getBoundingClientRect();
    let position = (e.clientX - l - padding) / drawingTools.current.maxWidth;
    const isMouseOver = position >= 0 && position <= 1;
    // console.log(e.clientX, e.clientY)
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
    // console.log("onMouseDownHandler");
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
    draw('bar', true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentProgress,
    shouldRecalculate,
    isMouseOver,
    shouldDrawLine,
    mouseOnHandle,
  ]);

  window.addEventListener('resize', onResize);

  return (
    <div className={classes.progressBar}>
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
  barGap: 1,
  barWidth: 1,
  shadowLength: 0.5,
  shadowBlur: 10,
  handleActiveRadius: 7,
  handleInactiveRadius: 5,
  padding: 13.66,
};

export default ProgressBar;
