import CommentedVideo from '../../components/CommentedVideo';


export default function ModulesScreencast({lang, width, height}) {
  const legend = {
    fr: `Screencast du document en ligne de centralisation des objectifs et résultats des modules d'enquête du datasprint.`,
    en: `Screencast of the online document centralizing the objectives and results of the datasprint modules of enquiry.`,
  };
  return (
    <CommentedVideo
      {...{
        width,
        height,
        legend: legend[lang],
        src: "https://www.youtube.com/embed/mpQwTtmbdA8?si=y4eHqpPbqmRA-e2W"
      }}
    />
  );
}