import React, { useEffect, useState, createRef, createContext } from 'react';
import { Switch, Route,  Link } from 'react-router-dom';
import { Grid, List, Header, Menu, Container } from 'semantic-ui-react';

import StageEditor from '../widget/StageEditor';

import { useRecoilState } from 'recoil';
import { usernameState } from '../StateManager';


import Profile from './Profile'
import Works from './Works'
import Wallet from './Wallet'

// 本地存储
const storage = window.localStorage;
export const AuthorContext = createContext();

export function SpaceMenu() {
    const [activeItem, setActiveItem] = useState('home');
    const handleItemClick = (e, { name }) => setActiveItem(name);

    return (
        <Menu text vertical>
            <Menu.Item as={Link} to='/space'
                name='我的空间'
                active={activeItem === '我的空间'}
                onClick={handleItemClick}
            />
            <Menu.Item as={Link} to='/space/profile'
                name='个人资料'
                active={activeItem === '个人资料'}
                onClick={handleItemClick}
            />
            <Menu.Item as={Link} to='/space/works'
                name='我的作品'
                active={activeItem === '我的作品'}
                onClick={handleItemClick}
            />
            <Menu.Item as={Link} to='/space/wallet'
                name='我的钱包'
                active={activeItem === '我的钱包'}
                onClick={handleItemClick}
            />
        </Menu>
        
    )
}

export default function SpaceHome() {

    const [loading, setLoading] = useState(true);
    const [author, SetAuthor] = useState({})
    const [stages, SetStages] = useState([])
    const [error, setError] = useState('')

    // 同步用户状态
    const [username, setUsername] = useRecoilState(usernameState)


    const stageList = stages.map((stage) => (
        <List.Item key={stage.id} as={Link} to={
            {
                pathname: '/stage/' + stage.id,
                stage_id: stage.id
            }
        }>
            {stage.title}
        </List.Item>
    ));

    const contextRef = createRef();

    return (
        <Container fluid ref={contextRef}>
            <Grid>
                <Grid.Row>
                    <Grid.Column width={3}>
                        {/* <AuthorContext.Provider value={author}>
                            <Info />
                        </AuthorContext.Provider> */}
                        <SpaceMenu />
                    </Grid.Column>
                    <Grid.Column width={10}>
                        <Switch>
                            <Route path='/space/profile' component={Profile} />
                            <Route path='/space/works' component={Works} />
                            <Route path='/space/wallet' component={Wallet} />
                        </Switch>
                        {/* <StageEditor stage={{}} /> */}
                    </Grid.Column>
                </Grid.Row>
            </Grid>

        </Container>
    )
}