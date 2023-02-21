import React, { useState } from 'react';
import { Routes, Route, HashRouter, Navigate } from "react-router-dom";

import Layout from './components/Layout';
import Home from './components/Home'
import StandaloneVisualization from './components/StandaloneVisualization';
import Atlas from './components/Atlas'

import routes from './content/summary';

import './styles/app.scss'

const langagesFlag = ['fr', 'en'];

export default function App() {
    return (
        <HashRouter>
            <div className="App">

                <Routes>
                    <Route key='lang' path="/:lang/" element=
                        {
                            // Header, Footer, Contexts and Outlet to include below routes
                            <Layout langagesFlag={langagesFlag} />
                        }
                    >
                        {
                            langagesFlag.map(lang => {
                                return routes
                                    .map(({
                                        titles,
                                        routes: inputRoutes,
                                        contents,
                                        Component: ThatComponent,
                                    }, index) => {
                                        const path = `${inputRoutes[lang]}`;
                                        return (
                                            <Route key={index} path={path} exact
                                                element={
                                                    <ThatComponent // ScrollyPage or PlainPage
                                                        Content={
                                                            contents[lang] ||
                                                            (() => <Navigate to="*" />) // redirect to 404 if no content for lang
                                                        }
                                                        chapter={index+1} // number of chapter
                                                        title={titles[lang]}
                                                    />
                                                }
                                            >
                                            </Route>
                                        )
                                    })
                            })
                        }
                        <Route key='visualization' path="visualization/">
                            <Route key='visualization' path=":vizId" element={<StandaloneVisualization />} />
                        </Route>
                        <Route key='atlas' path="atlas/">
                            <Route key='atlas' index element={<Atlas />} />
                            <Route key='atlas' path=":vizId" element={<Atlas />} />
                        </Route>
                        <Route key='home' index element={<Home />} />
                    </Route>
                    <Route
                        key='404'
                        path="*"
                        element={<Navigate to="fr" />}
                    />
                </Routes>
            </div>
        </HashRouter>
    );
}