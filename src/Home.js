import React, { useEffect, useState, createRef } from 'react';
import { Grid, Advertisement, Segment, Button, Label, Header, Image } from 'semantic-ui-react'
import StageList from './story/StageList';
import List from './author/List';

const contextRef = createRef();

function Home() {

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column width={3}>
          <Segment.Group>
            <Segment secondary key='mini' size='mini'>
              <Button
                compact
                size='small'
                floated='right'
                onClick={() => dispatch({ type: 'clearLog' })}
              >
                换一批
              </Button>
              人物 <Label circular>{200}</Label>
            </Segment>
            <Segment>
              帕梅拉
            </Segment>
          </Segment.Group>

          <Segment.Group>
            <Segment secondary>
              <Button
                compact
                size='small'
                floated='right'
                onClick={() => dispatch({ type: 'clearLog' })}
              >
                换一批
              </Button>
              地点 <Label circular>{200}</Label>
            </Segment>
            <Segment >
              帕梅拉
            </Segment>
          </Segment.Group>

          <Segment.Group>
            <Segment secondary>
              <Button
                compact
                size='small'
                floated='right'
                onClick={() => dispatch({ type: 'clearLog' })}
              >
                换一批
              </Button>
              纪元 <Label circular>{200}</Label>
            </Segment>
            <Segment >
              帕梅拉
            </Segment>
          </Segment.Group>
        </Grid.Column>
        <Grid.Column width={10}>
          <Advertisement unit='panorama' test='无论是一个有想象力的创意，还是一篇科幻故事，都可以在以区块链为主导的Web3.0时代彰显其从前被忽视的价值。'
            style={{ width: "100%", marginBottom: "1rem" }}
          />
          <Header as='h3'>
            最新作品
          </Header>
          <StageList />
        </Grid.Column>
        <Grid.Column width={3}>
          <List />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default Home