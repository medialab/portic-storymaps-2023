import CommentedImage from '../../components/CommentedImage';


export default function MaquettesVisualisations({lang, width, height}) {
  const commentedImageLegend = {
    fr: `Maquettes utilisées pendant l'écriture simultanée des contenus textuels et des visualisations de la publication`,
    en: `Sketches used during the simultaneous writing of textual contents and visualizations`,
  }
  const images = [
    `${process.env.BASE_PATH}/assets/drafts/correlation-des-prix-mode-carte.jpg`,
    `${process.env.BASE_PATH}/assets/drafts/correlation-des-prix-mode-reseau.jpg`,
    `${process.env.BASE_PATH}/assets/drafts/diversite-des-styles-de-navigation-au-long-cours.jpg`,
    `${process.env.BASE_PATH}/assets/drafts/diversite-du-commerce-marseillais.jpg`,
    `${process.env.BASE_PATH}/assets/drafts/evolution-et-croissance-du-commerce-et-de-la-navigation-de-marseille-au-18eme-siecle.jpg`,
    `${process.env.BASE_PATH}/assets/drafts/le-commerce-avec-le-levant-fortement-impacte-par-la-guerre.jpg`,
    `${process.env.BASE_PATH}/assets/drafts/marseille-exportatrice-des-produits-du-sud-est.jpg`,
    `${process.env.BASE_PATH}/assets/drafts/marseille-port-structurant-de-la-cote-mediterranneenne.jpg`,
    `${process.env.BASE_PATH}/assets/drafts/part-des-etrangers-dans-la-navigation-marseillaise.jpg`,
    `${process.env.BASE_PATH}/assets/drafts/qui-assure-la-navigation-en-guerre.jpg`,
  ];
  return (
    <CommentedImage
      lang={lang}
      src={images}
      width={width}
      height={height}
      legend={commentedImageLegend[lang]}
    />
  );
}