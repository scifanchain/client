import React from 'react';
import { Switch, Route } from 'react-router-dom'
import {PrivateRoute} from './PrivateRoute'

import Home from './Home';
import Galaxy from './Galaxy';
import SignIn from './author/SignIn';
import SignUp from './author/SignUp';
import Profile from './author/Profile';
import Stage from './story/Stage';
import Finance from './chain/Finance';
import Era from './Era';
import SpaceHome from './space/Home';
import Stars from './Stars';
import Community from './Community';
import Expedition from './Expedition';
// import Test from './Test';

// import 404 from './404'


export default function Content() {
    return (
      <Switch>
        <Route path='/sign-in' component={SignIn} />
        <Route path='/sign-up' component={SignUp} />
        <Route path='/profile' component={Profile} />
        <Route path='/finance' component={Finance} />
        <Route path='/galaxy' component={Galaxy} />
        <PrivateRoute path='/space' component={SpaceHome} />
        <Route path='/era' component={Era} />
        <Route path='/stars' component={Stars} />
        <Route path='/community' component={Community} />
        <Route path='/expedition' component={Expedition} />
        <Route path='/stage/:stage_id' component={Stage} />
        <Route path='/' exact component={Home} />
        {/* <Route path='/test' exact component={Test} /> */}
      </Switch>
    )
}