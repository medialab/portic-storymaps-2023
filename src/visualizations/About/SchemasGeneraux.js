import CommentedImage from '../../components/CommentedImage';


export default function SchemasGeneraux({lang, width, height}) {
  const commentedImageLegend = {
    fr: `Diagrammes représentant les modélisations informatiques inventées pour transformer en données les différentes sources historiques`,
    en: `Diagrams representing computer models invented to transform various historical sources into data`
  }
  const images = [
    `${process.env.BASE_PATH}/assets/modele-navigocorpus.png`,
    `${process.env.BASE_PATH}/assets/modele-pointcall.png`,
    `${process.env.BASE_PATH}/assets/modele-toflit18.png`,
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