import { useRef, useEffect, ReactElement } from 'react';
import classes from './common.module.scss';

type PropType = {
  children:
    | string
    | ReactElement<{ href: string; children: string }>
    | ReactElement<{ href: string; children: string }>[];
  className?: string;
  animate?: boolean;
};

function Text({ children, className = '', animate }: PropType) {
  const box = useRef(document.createElement('div'));
  const animation = useRef<Animation | null>(null);

  useEffect(() => {
    // console.log({ animate, children });
    if (animate) {
      const boxWidth = box.current.clientWidth;
      const text = box.current.children[0];
      const textWidth = text.clientWidth;
      // let animation: Animation;
      if (textWidth > boxWidth) {
        // TODO: Set duration 1 meaningfully
        let duration1: number;
        if (typeof children === 'string') {
          // string
          duration1 = children.length * 1000;
        } else if (Array.isArray(children)) {
          // array
          duration1 =
            children
              .map((item) => item.props.children.length ?? 0)
              .reduce((a, b) => a + b + 2) * 1000;
        } else {
          // link
          duration1 = (children.props.children.length ?? 0) * 1000;
        }

        const duration2 = (duration1 * (boxWidth + textWidth)) / textWidth;
        animation.current = text.animate(
          [
            { transform: 'translateX(0)' },
            { transform: `translateX(${-textWidth}px)` },
          ],
          {
            duration: duration1,
            iterations: 1,
            easing: 'ease-in',
            delay: 2000,
          }
        );
        console.log({ firstAnimation: animation });
        animation.current.onfinish = () => {
          console.log('Animation Finished!');
          animation.current = text.animate(
            [
              { transform: `translateX(${boxWidth}px)` },
              { transform: `translateX(${-textWidth}px)` },
            ],
            {
              duration: duration2,
              iterations: Infinity,
            }
          );
        };
      }
    } else if (animation.current) animation.current.cancel();
    return () => {
      if (animation.current) animation.current.cancel();
    };
  }, [children, animate]);

  return (
    <div ref={box} className={`text ${classes.text} ${className}`}>
      <div data-animation={animate ? 'on' : 'off'}>{children}</div>
    </div>
  );
}

Text.defaultProps = {
  animate: false,
  className: '',
};

export default Text;
