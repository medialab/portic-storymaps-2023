
import { useRef, useState } from 'react';
import Md from 'react-markdown';
import Measure from 'react-measure';
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

function CommentedVideo({
  src,
  legend,
  width,
  height,
}) {
  const [captionDimensions, setCaptionDimensions] = useState({
    width: 100,
    height: 100
  });
  return (
    <figure className="CommentedVideo">
      <Measure
        bounds
        onResize={contentRect => {
          setCaptionDimensions(contentRect.bounds)
        }}
      >
        {({ measureRef }) => (
          <>
            <iframe
              src={src}
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
              height={height - captionDimensions.height}
            />
            <figcaption ref={measureRef}>
              <Md>{legend}</Md>
            </figcaption>
          </>
        )}
      </Measure>
    </figure>
  )
}

export default CommentedVideo;