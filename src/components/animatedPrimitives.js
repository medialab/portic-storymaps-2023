import { useSpring, animated } from '@react-spring/web';

export const Line = ({style, className, onClick, ...inputProps}) => {
  const props = useSpring(inputProps);
  return (
    <animated.line className={className} onClick={onClick} style={style} {...props} />
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