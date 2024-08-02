
import Intro from "./Intro/Intro";
import TradeDynamics from "./DynamiqueDuCommerce";
import CorrelationPrix from "./CorrelationPrix";
import ExportationsSudEst from './ExportationsSudEst';
import MarseillePortStructurant from './MarseillePortStructurant';
import LevantNavigation from './LevantNavigation';
import DiversiteProduits from './DiversiteProduits';
import StylesNavigation from './StylesNavigation';
import PartDesEtrangersDansNavigation from './PartDesEtrangersDansNavigation';
import PartDesFrancaisDansProvenance from './PartDesFrancaisDansProvenance';
import EffetsGuerreSurLevant from './EffetsGuerreSurLevant';
import GuerreEtNavigation from './GuerreEtNavigation';
import GuerreEtLevant from './GuerreEtLevant';
import GuerreEtCroissance from './GuerreEtCroissance';
import FonctionnementPortFranc from './FonctionnementPortFranc';
import PhotoDatasprint from "./About/PhotosDatasprint";
import ModulesScreencast from "./About/ModulesScreencast";
import DocumentaireSentendre from "./About/DocumentaireSentendre";
import MaquettesVisualisations from "./About/MaquettesVisualisations";
import ProcessusMaj from "./About/ProcessusMaj";
import SchemasGeneraux from "./About/SchemasGeneraux";


const visualizations = {
  intro: Intro,
  "dynamique-du-commerce": TradeDynamics,
  "correlation-prix": CorrelationPrix,
  "exportations-sud-est": ExportationsSudEst,
  "marseille-port-structurant": MarseillePortStructurant,
  'levant-navigation': LevantNavigation,
  "part-des-etrangers-dans-navigation": PartDesEtrangersDansNavigation,
  "part-des-francais-dans-provenance": PartDesFrancaisDansProvenance,
  "diversite-produits-exportes": DiversiteProduits,
  "effets-guerre-sur-commerce-levant": EffetsGuerreSurLevant,
  "guerre-et-navigation": GuerreEtNavigation,
  "levant-navigation-guerre": GuerreEtLevant,
  "styles-navigation": StylesNavigation,
  "fonctionnement-port-franc": FonctionnementPortFranc,
  "impact-guerre-sur-commerce-et-navigation": GuerreEtCroissance,
  'photos-datasprint': PhotoDatasprint,
  'modules-screencast': ModulesScreencast,
  'documentaire-s-entendre': DocumentaireSentendre,
  'maquettes-visualisations': MaquettesVisualisations,
  'processus-maj': ProcessusMaj,
  'schemas-generaux': SchemasGeneraux,
};

/**
 * This script is the bridge between visualization code, visualizations list, and visualization callers in contents.
 * It returns a visualization component depending on the provided id
 * @param {Object} props
 * @param {String} props.vizId
 * @param {Map} props.datasets
 * @param {React.Ref} props.ref
 * @param {Object} props.dimensions
 * @param {Number} props.dimensions.width
 * @param {Number} props.dimensions.height
 * @param {'fr'|'en'} props.lang
 * @param {Object} [props.callerProps={}]
 * @returns {React.ReactElement} - React component
 */
export default function VisualizationController({
  vizId,
  datasets,
  dimensions,
  lang,
  callerProps,
  atlasMode,
}) {
  const { width, height } = dimensions;

  return (
    <div
      style={{ height }}
      onClick={(e) => e.stopPropagation()}
      className="VisualizationController viz-render"
    >
      {datasets === undefined && (
        <>Les données de cette visualisation n'ont pu être chargées.</>
      )}

      {vizId in visualizations ? (
        visualizations[vizId]({
          data: datasets,
          width,
          height,
          atlasMode,
          callerProps,
          lang,
        })
      ) : (
        <img
          src={`${process.env.BASE_PATH}/assets/drafts/${vizId}.jpg`}
          {...{ width, height }}
          style={{ objectFit: "contain" }}
        />
      )}
    </div>
  );
}
