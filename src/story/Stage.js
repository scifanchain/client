import React, { useState, createRef, useEffect } from 'react';
import { Container, Loader, Grid, Header, Button, Message, Divider, Icon, Segment } from 'semantic-ui-react';
import { useLocation, useParams } from 'react-router-dom'

import { SubstrateContextProvider, useSubstrate } from '../substrate-lib';
import { DeveloperConsole } from '../substrate-lib/components';


import MenuLeft from '../widget/Menus';
import StageDetail from '../space/StageDetail';


export default function Stage() {
  return (
    <Grid>
      <Grid.Row>
        <Grid.Column width={3}>
          <Header>作品属性</Header>
        </Grid.Column>
        <Grid.Column width={10}>
          <StageDetail />
        </Grid.Column>
        <Grid.Column width={3}>
          <Header>作者</Header>
          <Header>历史版本</Header>
        </Grid.Column>
      </Grid.Row>
    </Grid>

  )
}