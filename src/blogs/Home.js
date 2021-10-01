import React, { useEffect, useState, createRef, createContext } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { Grid, List, Button, Menu, Image, Container } from 'semantic-ui-react';

import { useRecoilState } from 'recoil';
import { usernameState } from '../StateManager';

import config from '../config';
import { get } from '../utils/Request';

import BlogList from './BlogList';
import BlogCategory from './BlogCategory';


export default function BlogHome() {


    return (
        <Container fluid>
            <Grid>
                <Grid.Row>
                    <Grid.Column textAlign='center' width={3} style={{ marginBottom: 1 + 'rem' }}>
                        <BlogCategory />
                    </Grid.Column>
                    <Grid.Column width={10}>
                        <BlogList />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Container>
    )
}