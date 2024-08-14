
import translate from "../../utils/translate";

const Legend = ({
  x,
  y,
  width,
  height,
  lang,
  atlasMode,

  defaultDirections,
  visibleDirections,
  setVisibleDirections,
  defaultSeries,
  visibleSeries,
  setVisibleSeries,

  navigationMetric,
  setNavigationMetric,
  navigationSources,
}) => {
  return (
    <foreignObject
      // x={legendX}
      // y={topLabelsHeight + rowHeight * (visibleSeries.length - 1) + gutter * 3}
      // width={width - legendX - gutter * 3}
      // height={rowHeight}
      x={x}
      y={y}
      width={width}
      height={height}
    >
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        className="legend"
      >
        <div className="legend-container">
          <h4>
            {translate('GuerreEtCroissance', 'legend-title', lang)}
          </h4>
          <ul>
            <li>
              <span
                style={{
                  height: '.3rem',
                  borderBottom: '2px solid red',
                  display: 'inline-block',
                }}
              ></span>
              <span>{translate('GuerreEtCroissance', 'legend-slope', lang)}</span>
            </li>
            <li>
              <span
                style={{
                  color: '#336D7C'
                }}
              >
                +1%/{translate('GuerreEtCroissance', 'year', lang)}
              </span>
              <span>{translate('GuerreEtCroissance', 'legend-growth', lang)}</span>
            </li>
            <li>
              <span>
                <span
                  style={{
                    color: 'red'
                  }}
                >
                  -1%
                </span>
                <span
                  style={{
                    color: 'green'
                  }}
                >
                  +2%
                </span>
              </span>
              <span>{translate('GuerreEtCroissance', 'legend-loss', lang)}</span>
            </li>
          </ul>
        </div>
        <div className="controls-container">
          {
            atlasMode ?
              <div className="filters-container ui-group-container">
                <h5>
                  {translate('GuerreEtCroissance', 'filters-directions-title', lang)}
                </h5>
                <ul>
                  {
                    defaultDirections
                      .map(direction => {
                        const isVisible = visibleDirections.includes(direction)
                        const handleClick = () => {
                          if (isVisible && visibleDirections.length > 1) {
                            setVisibleDirections(
                              defaultDirections.filter(dir => visibleDirections.includes(dir) && dir !== direction)
                              // visibleDirections.filter(d => d !== direction)
                            )
                          } else if (!isVisible) {
                            setVisibleDirections(
                              // [...visibleDirections, direction]
                              defaultDirections.filter(dir => visibleDirections.includes(dir) || dir === direction)
                            )
                          }
                        }
                        return (

                          <li onClick={handleClick} key={direction}>
                            <input
                              type="radio"
                              checked={isVisible}
                              onChange={() => { }}
                            />
                            <label style={{ fontWeight: isVisible ? 'bold' : '' }}>
                              {/* {label} */}
                              {direction}
                            </label>
                          </li>
                          // <li style={{ fontWeight: isVisible ? 800 : 400, opacity: isVisible ? 1 : .5, cursor: 'pointer' }} onClick={handleClick} key={direction}>
                          //   {direction}
                          // </li>
                        )
                      })
                  }
                </ul>
                <h5>
                  {translate('GuerreEtCroissance', 'filters-series-title', lang)}
                </h5>
                <ul>
                  {
                    defaultSeries
                      .map(series => {
                        const isVisible = visibleSeries.includes(series)
                        const handleClick = () => {
                          if (isVisible && visibleSeries.length > 1) {
                            setVisibleSeries(
                              defaultSeries.filter(
                                s => visibleSeries.includes(s) && s !== series
                                // d => d !== series
                              )
                            )
                          } else if (!isVisible) {
                            setVisibleSeries(
                              defaultSeries.filter(s => visibleSeries.includes(s) || s === series)
                              // [...visibleSeries, series]
                            )
                          }
                        }
                        // <li style={{ fontWeight: isVisible ? 800 : 400, opacity: isVisible ? 1 : .5, cursor: 'pointer' }} onClick={handleClick} key={series}>

                        return (
                          <li onClick={handleClick} key={series}>
                            <input
                              type="radio"
                              checked={isVisible}
                              onChange={() => { }}
                            />
                            <label style={{ fontWeight: isVisible ? 'bold' : '' }}>
                              {/* {label} */}
                              {translate('GuerreEtCroissance', series, lang)}
                            </label>
                          </li>
                        )
                      })
                  }
                </ul>

              </div>
              : null
          }
          {
            visibleSeries.includes('navigation') ?
              <div
                className="navigation-ui-container ui-group-container"
              >
                <h5>
                  <strong>{translate('GuerreEtCroissance', 'navigation-interface-title', lang)}</strong>
                </h5>
                <ul>
                  {
                    navigationSources.map(({ id, label }) => {
                      return (
                        <li
                          key={id}
                          onClick={() => setNavigationMetric(id)}
                        >
                          <input
                            type="radio"
                            checked={id === navigationMetric}
                            onChange={() => setNavigationMetric(id)}
                          />
                          <label style={{ fontWeight: id === navigationMetric ? 'bold' : '' }}>{label}</label>
                        </li>
                      )
                    })
                  }
                </ul>
              </div>
              : null
          }

        </div>
      </div>

    </foreignObject>
  )
}

export default Legend;