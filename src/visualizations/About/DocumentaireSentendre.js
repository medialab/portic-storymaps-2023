import CommentedVideo from '../../components/CommentedVideo';


export default function DocumentaireSentendre({ lang, width, height }) {
  const legend = {
    fr: `S'entendre. L'interdisciplinarité en pratique. Documentaire réalisé par Fabien Luszezyszyn et Aymeric Poidevin.`,
    en: `S'entendre. L'interdisciplinarité en pratique. Documentary realized by Fabien Luszezyszyn and Aymeric Poidevin.`,
  };
  return (
    <CommentedVideo
      {...{
        width,
        height,
        legend: legend[lang],
        src: "https://www.youtube.com/embed/8MeV97HfqG4?si=WeuXxkt3OC6GC2a4"
      }}
    />
  );
}