import CommentedImage from '../../components/CommentedImage';


export default function PhotoDatasprint({lang, width, height}) {
  const commentedImageLegend = {
    fr: `Photographies prises durant le datasprint PORTIC 2023`,
    en: `Photographs taken during the PORTIC 2023 datasprint`,
  }
  const images = [
    `${process.env.BASE_PATH}/assets/photo-datasprint-1.jpg`,
    `${process.env.BASE_PATH}/assets/photo-datasprint-2.jpg`,
    `${process.env.BASE_PATH}/assets/photo-datasprint-3.jpg`,
    `${process.env.BASE_PATH}/assets/photo-datasprint-4.jpg`,
    `${process.env.BASE_PATH}/assets/photo-datasprint-5.jpg`,
    `${process.env.BASE_PATH}/assets/photo-datasprint-6.jpeg`,
    `${process.env.BASE_PATH}/assets/photo-datasprint-7.png`,
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