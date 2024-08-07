import TradeDynamicsChart from "../../components/TradeDynamicsChart";

/**
 * TradeDynamics component - returns a set of <figures> containing a svg linechart/barchart
 *
 * @param {Object} props
 * @param {Object} props.rows keys: Marseille, Rouen, Bordeaux, Nantes, Bayonne, La Rochelle values: an integer for relative height in viz space
 * @param {string} props.kind possible values: total, imports, exports, total_no_colonial_product, total_no_colonial_trade, imports_no_colonial_product, exports_no_colonial_product, imports_no_colonial_trade, exports_no_colonial_trade
 * @param {string} props.regression possible values: reg, peace_reg_memory, peace_reg_no_memory
 * @param {width} props.number
 * @param {height} props.number
 * @param {atlasMode} props.boolean
 *
 **/

const TradeDynamics = ({ 
  data, 
  width, 
  height, 
  atlasMode, 
  callerProps, 
  lang
}) => {
  const rows = callerProps?.rows ? 
  {
    France: 1, 
    ...callerProps?.rows.split(',')
    .map(v => v.trim())
    .reduce((r, v) => ({...r, [v]: 2}), {})
  } 
  : 
  { France: 1, Marseille: 2, Bordeaux: 2 };
  const kind = callerProps?.kind || "exports";
  const regression = callerProps?.regression || "reg";
  return (
    <TradeDynamicsChart
      {
        ...{
          rows,
          kind,
          regression,
          datasets: data,
          width,
          height,
          atlasMode,
          lang,
        }
      }
    />
  );
};

export default TradeDynamics;
