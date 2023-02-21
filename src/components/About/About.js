import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';

import translate from '../../utils/translate';

import Content from '../../content/fr/about.mdx'

export default function About ({
    ...props
}) {
    const { lang } = useParams();
    return (
        <>
            <h1 className='title'>{ translate('about', 'title', lang) }</h1>
            <Content />
        </>
    );
}