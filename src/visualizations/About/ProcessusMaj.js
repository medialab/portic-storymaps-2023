import CommentedImage from '../../components/CommentedImage';


export default function ProcessusMaj({lang, width, height}) {
  const commentedImageLegend = {
    fr: `Schématisation de l'infrastructure de mise à jour simultanée des contenus permettant une écriture collective des textes, des données et des visualisations`,
    en: `Diagram of the simultaneous content update infrastructure enabling collective writing of texts, data, and visualizations`
  }
  const images = [
    `${process.env.BASE_PATH}/assets/processus-maj-automatique.png`,
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