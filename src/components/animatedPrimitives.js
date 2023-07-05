import { useSpring, animated } from '@react-spring/web';

export function Line({
  onClick,
  ...props
}) {
  const mouseProps = Object.keys(props).filter(key => key.includes('Mouse'))
  .reduce((res, key) => ({...res, [key]: props[key]}), {});
    const animatedProps = useSpring(props);

    return (
        <animated.line onClick={onClick} {...animatedProps} {...mouseProps} />
    )
}

export function Rect({
  onClick,
  ...props
}) {
  const mouseProps = Object.keys(props).filter(key => key.includes('Mouse'))
  .reduce((res, key) => ({...res, [key]: props[key]}), {});
    const animatedProps = useSpring(props);

    return (
        <animated.rect onClick={onClick} {...animatedProps} {...mouseProps} />
    )
}

export function Path({
  onClick,
  ...props
}) {
  const mouseProps = Object.keys(props).filter(key => key.includes('Mouse'))
  .reduce((res, key) => ({...res, [key]: props[key]}), {});
    const animatedProps = useSpring(props);

    return (
        <animated.path onClick={onClick} {...animatedProps} {...mouseProps} />
    )
}


export function Text({
  onClick,
  children,
  ...props
}) {
  const mouseProps = Object.keys(props).filter(key => key.includes('Mouse'))
  .reduce((res, key) => ({...res, [key]: props[key]}), {});
    const animatedProps = useSpring(props);

    return (
        <animated.text onClick={onClick} {...animatedProps} {...mouseProps}>
          {children}
        </animated.text>
    )
}


export const G =({children, className, onClick, ...inputProps})  => {
  const props = useSpring(inputProps);
  return (
    <animated.g className={className} onClick={onClick} {...props}>
      {children}
    </animated.g>
  )
}