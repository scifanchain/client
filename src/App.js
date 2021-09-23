import React from 'react';
import { BrowserRouter as Router, } from 'react-router-dom'
import { RecoilRoot } from 'recoil';

import Navigation from './Navigation';
import Container from './Container';
import Footer from './Footer'

export default function App() {
    return (
        <RecoilRoot>
            <Router>
                {<Navigation />}
                {<Container />}
                {<Footer />}
            </Router>
        </RecoilRoot>
    );
}