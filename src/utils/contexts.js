import React, { createContext, useState } from 'react';

/**
 * Context used for communicating user setting as lang, theme…
 * @exemple
 * ```
 * import { VisualisationContext } from '../utils/contexts'
 * // get list of page viz
 * const { list } = useContext(VisualisationContext);
 * ```
 */

export const VisualisationContext = React.createContext({});

/**
 * Context used for communicating currently displayed visualization
 */
export const VisualizationControlContext = React.createContext({})

/**
 * Context used for datasets values passing
 */
 export const DatasetsContext = React.createContext({

})
