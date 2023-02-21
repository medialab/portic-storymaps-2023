import React, { useState } from 'react';

import Measure from 'react-measure'

import BoatsIllustration from '../../components/BoatsIllustration';


const BoatsContainer = ({
  hourOfTime,
  hourDuration
}) => {
  const [dimensions, setDimensions] = useState({});
  return (
    <Measure 
      bounds
      onResize={contentRect => {
        setDimensions(contentRect.bounds)
      }}
    >
      {({ measureRef }) => (
        <div ref={measureRef} className="boats-container">
          <BoatsIllustration 
            hourOfTime={hourOfTime} 
            hourDuration={hourDuration}
            {...{...dimensions}} 
          />
        </div>
      )}
    </Measure>
  )
}

export default BoatsContainer;