
import { useRef, useState } from 'react';
import Md from 'react-markdown';
import Measure from 'react-measure';
import translate from '../../utils/translate';

import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

function CommentedImage({
  src,
  width,
  height,
  legend,
  lang
}) {
  const [captionDimensions, setCaptionDimensions] = useState({
    width: 100,
    height: 100
  });
  const [isOpen, setOpen] = useState(false);
  return (
    <figure className="CommentedImage">
      <Measure
      bounds
      onResize={contentRect => {
        setCaptionDimensions(contentRect.bounds)
      }}
    >
      {({ measureRef }) => (
        <>
        <img
            src={[src[0]]}
            {...{ width, height: height - captionDimensions.height }}
            style={{ objectFit: 'contain' }}
            onClick={() => setOpen(true)}
        />
        <figcaption ref={measureRef}>
          <Md>{legend}</Md>
        </figcaption>
        <div className="click-prompt" style={{height: `calc(100% - ${captionDimensions.height}px)`}}>
          <span>{translate('CommentedImage', 'click-prompt', lang)}</span>
        </div>
        </>
      )}
    </Measure>
    <Lightbox
        open={isOpen}
        close={() => setOpen(false)}
        slides={src.map(src => ({src}))}
        plugins={[Captions, Fullscreen, Slideshow, Thumbnails, Video, Zoom]}
      />
    </figure>
  )
}

export default CommentedImage;