import { useSpring, animated } from '@react-spring/web';

const isPropAnimatable = propName =>
  !['style', 'children', 'className'].includes(propName)
  && propName.indexOf('on') !== 0;


const getAnimatableProps = props => {
  const keys = Object.keys(props);
  const animatableKeys = keys.filter(isPropAnimatable);
  const nonAnimatableKeys = keys.filter(k => !isPropAnimatable(k));
  const animatableProps = animatableKeys.reduce((cur, key) => ({ ...cur, [key]: props[key] }), {});
  const nonAnimatableProps = nonAnimatableKeys.reduce((cur, key) => ({ ...cur, [key]: props[key] }), {});
  return {
    animatableProps,
    nonAnimatableProps,
  }
}

export function AnimatedGroup({
  children,
  ...props
}) {
  const { animatableProps, nonAnimatableProps } = getAnimatableProps(props);
  const animatedProps = useSpring(animatableProps);

  return (
    <animated.g {...animatedProps} {...nonAnimatableProps}>
      {children}
    </animated.g>
  )
}
export function AnimatedForeignObject({
  children,
  ...props
}) {
  const { animatableProps, nonAnimatableProps } = getAnimatableProps(props);
  const animatedProps = useSpring(animatableProps);

  return (
    <animated.foreignObject {...animatedProps} {...nonAnimatableProps}>
      {children}
    </animated.foreignObject>
  )
}

export function AnimatedText({
  children,
  ...props
}) {
  const { animatableProps, nonAnimatableProps } = getAnimatableProps(props);
  const animatedProps = useSpring(animatableProps);

  return (
    <animated.text {...animatedProps} {...nonAnimatableProps}>
      {children}
    </animated.text>
  )
}


export function AnimatedCircle({
  children,
  ...props
}) {
  const { animatableProps, nonAnimatableProps } = getAnimatableProps(props);
  const animatedProps = useSpring(animatableProps);

  return (
    <animated.circle {...animatedProps} {...nonAnimatableProps}>
      {children}
    </animated.circle>
  )
}


export function AnimatedLine({
  children,
  ...props
}) {
  const { animatableProps, nonAnimatableProps } = getAnimatableProps(props);
  const animatedProps = useSpring(animatableProps);
  return (
    <animated.line {...animatedProps} {...nonAnimatableProps}>
      {children}
    </animated.line>
  )
}

export function AnimatedPath({
  ...props
}) {
  const { animatableProps, nonAnimatableProps } = getAnimatableProps(props);
  const animatedProps = useSpring(animatableProps);

  return (
    <animated.path {...animatedProps} {...nonAnimatableProps} />
  )
}

export function AnimatedRect({
  ...props
}) {
  const { animatableProps, nonAnimatableProps } = getAnimatableProps(props);
  const animatedProps = useSpring(animatableProps);
  return (
    <animated.rect {...animatedProps} {...nonAnimatableProps} />
  )
}