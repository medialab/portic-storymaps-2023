import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';

import Loader from '../Loader';
import VisualizationController from '../../visualizations/index';

import visualizationsMetas from '../../content/viz.json';
import { fetchDataCsv } from '../../utils/fetch';
import './StandaloneVisualization.scss'

export default function StandaloneVisualization({
    ...props
}) {
    const { vizId, lang } = useParams();

    const [datasets, setDatasets] = useState(undefined);
    const [loadingState, setLoadingState] = useState('none');

    useEffect(() => {
        if (!!vizId === false || visualizationsMetas[vizId] === undefined) {
            setLoadingState('none');
            return;
        }

        setLoadingState('process');
        const { outputs, ...metas } = visualizationsMetas[vizId];
        const payload = new Map();

        Promise.all(
            outputs.map(fileToLoad =>
                fetchDataCsv(fileToLoad).catch(error => null)
            )
        )
        .then((datasets) => {
            for (let i = 0; i < datasets.length; i++) {
                const dataset = datasets[i];
                if (dataset === null) { continue; }
                payload.set(outputs[i], dataset);
            }
            setDatasets(payload);
            setLoadingState('successed');
        })
        .catch((error) => {
            setLoadingState('failed');
            console.log(error);
        })

    }, [vizId])

    return (
        <div className="StandaloneVisualization">
            {
                loadingState === 'successed' ?
                    <VisualizationController
                        { ...{
                            vizId,
                            lang,
                            datasets
                        } }
                        dimensions={{
                            width: 1200,
                            height: 800
                        }}
                    />
                    :
                    {
                        'process': <Loader message='En cours de chargement' />,
                        'failed': <Loader message='Erreur de chargement' />,
                        'none': null
                    }[loadingState]
            }
        </div>
    )
}