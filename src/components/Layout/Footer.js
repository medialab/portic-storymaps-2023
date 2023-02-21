import React from "react";
import { useParams } from 'react-router-dom';

import frContent from '../../content/fr/footer.mdx';
import enContent from '../../content/en/footer.mdx';

import './Footer.scss';

export default function Footer() {
    const { lang } = useParams();

    const Content = (lang === 'fr') ? frContent : enContent;

    return (
        <footer className="Footer">
            <div className="footer-contents">
                <Content />
            </div>
        </footer>
    );
}