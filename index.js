import React from 'react';
import { hydrate, render } from "react-dom";

import App from './src/App';

const rootElement = document.getElementById('root');

if (rootElement.hasChildNodes()) {
    hydrate(<App />, rootElement);
} else {
    render(<App />, rootElement);
}