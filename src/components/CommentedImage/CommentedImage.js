
import Md from 'react-markdown';

function CommentedImage({
  src,
  width,
  height,
  legend
}) {
  return (
    <div className="CommentedImage">
      <img
          src={src}
          {...{ width, height }}
          style={{ objectFit: 'contain' }}
      />
      <figcaption>
        <Md>{legend}</Md>
      </figcaption>
    </div>
  )
}

export default CommentedImage;