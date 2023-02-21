import React from 'react';
import { NavLink as Link } from 'react-router-dom';


function HomeSummary({ lang = 'fr', summary }) {
  const messages = {
    intro: {
      fr: 'découvrir les différentes parties de l’étude de cas',
      en: 'discover the different parts of the case study'
    },
    atlas: {
      fr: 'Accéder à l\'atlas de toutes les visualisations',
      en: 'Access all visualizations\' atlas'
    },
    chapter: {
      fr: 'Chapitre',
      en: 'Chapter'
    }
  }
  return (
    <div className="HomeSummary">
      <div className="contents">
      <div className="intro">
        {messages.intro[lang]}
      </div>
      <ul className="chapters-links-container">
        {
          summary
            .filter(item => item.routeGroup === 'chapter')
            .filter(item => item.routes[lang])
            .map((item, itemIndex) => {
              const title = item.titles[lang];
              const route = `/${lang}/${item.routes[lang]}`;
              const notAChapter = title.toLowerCase().includes('conclusion');
              return (
                <li key={itemIndex}>
                  <Link to={route}>
                    <h4 className="pretitle" style={{opacity: notAChapter ? 0 : 1}}>{notAChapter ? '.' : `${messages.chapter[lang]} ${itemIndex + 1}`}</h4>
                    <h3 className="title">{title}</h3>
                  </Link>
                </li>
              )
            })
        }
      </ul>
      <div className="atlas-link-container">
        {/* @todo this is a react-snap trick that should be cleaned some day, removing it somehow breaks the pages building process */}
        <Link to={navigator.userAgent === "ReactSnap" ? '/fr/atlas' : `/${lang}/atlas`}>
          <h3 className="title">{messages.atlas[lang]}</h3>
        </Link>
      </div>
      </div>
    </div>
  )
}

export default HomeSummary;