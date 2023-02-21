/**
 * @param {Object} props
 * @param {String} props.id
 * @param {Number} [props.lineGap=10]
 * @param {String} [props.color='black']
 * @param {Number} [props.angle=45]
 * @param {Number} [props.strokeWidth=1]
 * @returns {React.ReactElement}
 * @exemple
 * ```
 * <>
 *      <DiagonalHatching id='hatch' lineGap={5} color='red' />
 *      <path d="M10,10 H80" fill="url(#hatch)" />
 * </>
 * ```
 */

export default function DiagonalHatching({
    id,
    lineGap = 10,
    color = 'black',
    angle = 45,
    strokeWidth = 1,
    ...props
}) {
    return (
        <pattern id={id} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle} 0 0)`} width={lineGap} height="10">
            <line
                x1="0" y1="0" x2="0" y2="10"
                style={{
                    stroke: color,
                    strokeWidth
                }}
            />
        </pattern>
    )
}