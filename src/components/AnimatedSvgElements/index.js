import { useSpring, animated } from '@react-spring/web';

export function AnimatedGroup({
    children,
    style,
    ...props
}) {
    const animatedProps = useSpring(props);

    return (
        <animated.g {...animatedProps} style={style}>
            {children}
        </animated.g>
    )
}
export function AnimatedForeignObject({
  children,
  style,
  ...props
}) {
  const animatedProps = useSpring(props);

  return (
      <animated.foreignObject {...animatedProps} style={style}>
          {children}
      </animated.foreignObject>
  )
}

export function AnimatedText({
  children,
  style,
  onClick,
  ...props
}) {
  const animatedProps = useSpring(props);

  return (
      <animated.text {...animatedProps} onClick={onClick} style={style}>
          {children}
      </animated.text>
  )
}


export function AnimatedCircle({
  children,
  style,
  ...props
}) {
  const animatedProps = useSpring(props);

  return (
      <animated.circle {...animatedProps} style={style}>
          {children}
      </animated.circle>
  )
}


export function AnimatedLine({
  children,
  style,
  ...props
}) {
  const animatedProps = useSpring(props);

  return (
      <animated.line {...animatedProps} style={style}>
          {children}
      </animated.line>
  )
}

export function AnimatedPath({
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

export function AnimatedRect({
  ...props
}) {
  const animatedProps = useSpring(props);

  return (
      <animated.rect {...animatedProps} />
  )
}