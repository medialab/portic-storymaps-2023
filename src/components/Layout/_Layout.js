import React from "react";
import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import { SettingsContext } from "../../utils/contexts";

import Header from './Header';
import Footer from './Footer';

import routes from '../../summary';

export default function Layout ({
  ...props
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const {lang} = useParams();
  const onLangChange = () => {
    const otherLang = lang === 'fr' ? 'en' : 'fr';

    const { pathname } = location;
    // @todo this is dirty, refactor this to be handled based on the routes config JSON ?
    if (pathname.includes('atlas')) {
      const visualizationId = pathname.split('/atlas/').pop();
      navigate(`/${ln}/atlas/${visualizationId || ''}`);
    } else {
      const pathOtherLang = location.pathname.split('/').pop();
      const routeItem = routes.find(route => {
        return route.routes[lang] === pathOtherLang;
      });
      if (routeItem) {
        navigate(`/${otherLang}/page/${routeItem.routes[otherLang]}`);
      } else {
        navigate(`/${otherLang}/`);
      }
    }
  }
  return (
      <SettingsContext.Provider value={{lang}}>
        <Header lang={lang} onLangChange={onLangChange} {...props} />
        
        <main className="wrapper">
          <Outlet />
        </main>
        <Footer />
      </SettingsContext.Provider>
  );
}