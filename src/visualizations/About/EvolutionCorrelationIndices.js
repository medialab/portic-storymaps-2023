import CommentedImage from '../../components/CommentedImage';


export default function EvolutionCorrelationIndices({lang, width, height}) {
  const commentedImageLegend = {
    fr: `La couleur correspond au niveau de corrélation des indices entre 1750 et 1789. La taille du rectangle est égale à la variation du coefficient de corrélation en pourcentage entre la période 1718-1760 et 1750-1789 (la ligne horizontale correspond à 0 et le rectangle est compris entre -100% et +100%). Pour Bayonne, où les valeurs sont supérieures à 100%, le rectangle a été tronqué.`,
    en: `The colour corresponds to the level of correlation of the indices between 1750 and 1789. The size of the rectangle is equal to the variation of the coefficient of correlation as a percentage, in the periods 1718-1760 and 1750-1789 (the horizontal line corresponds to 0 and the rectangle is situated between -100% and +100%). For Bayonne, where the values are superior to 100%, the rectangle has been truncated.`,
  }
  const images = [
    `${process.env.BASE_PATH}/assets/evolution-correlations-indices.png`,
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