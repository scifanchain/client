import React, { useState, createRef, useEffect } from 'react';
import { Container, Dimmer, Loader, Grid, Header, Button, Message, Divider, Icon, Segment } from 'semantic-ui-react';
import { useLocation, useParams } from 'react-router-dom'

import { SubstrateContextProvider, useSubstrate } from '../substrate-lib';
import { DeveloperConsole } from '../substrate-lib/components';

import ReactMarkdown from 'react-markdown';

import axios from 'axios'

import Poe from '../chain/Poe'

import StageEditor from '../widget/StageEditor';

import MenuLeft from '../widget/Menus';
import { get } from '../utils/Request';

function Main() {

    const [accountAddress, setAccountAddress] = useState('5GTUkiFUo2tZNtprDYnn8PvG5tus6AUHTp12YyUo8ZeJEKK8');
    const { apiState, keyring, keyringState, apiError } = useSubstrate();

    const [loading, setLoading] = useState(true);
    const [stage, setStage] = useState([])
    const [error, setError] = useState('')
    const [showEditor, setShowEditor] = useState(false)

    // 接收跳转参数
    const params = useParams();

    // 加载数据
    useEffect(() => {
        let token = window.localStorage.getItem("scifanchain_access_token")
        axios.defaults.headers.common["Authorization"] = "Bearer " + token;
        axios.get('https://api.scifanchain.com/stages/' + params.stage_id)
            .then(function (response) {
                // 处理成功情况
                setLoading(false)
                setStage(response.data)
                setError('')
                // console.log(response);
            })
            .catch(function (error) {
                // 处理错误情况
                setLoading(false)
                setStage({})
                setError('很抱歉，没有获取到数据！')
                console.log(error);
            });
    }, [])

    useEffect(() => {
        get('authors/my_wallets/14/', {}, true).then((res) => {
            setAccountAddress(res.data.address)
        }, []);
    });

    // 获取当前账户
    const accountPair =
        accountAddress &&
        keyringState === 'READY' &&
        keyring.getPair(accountAddress);

    const loader = text =>
        <Dimmer active inverted>
            <Loader size='small'>{text}</Loader>
        </Dimmer>;

    const message = err =>
        <Grid centered columns={2} padded>
            <Grid.Column>
                <Message negative compact floating
                    header='Error Connecting to Substrate'
                    content={`${JSON.stringify(err, null, 4)}`}
                />
            </Grid.Column>
        </Grid>;

    if (apiState === 'ERROR') return message(apiError);
    else if (apiState !== 'READY') return loader('正在连接赛凡链……');

    if (keyringState !== 'READY') {
        return loader('Loading accounts (please review any extension\'s authorization)');
    }

    const onEdit = () => {
        setShowEditor(true)
    }

    const onCancel = () => {
        setShowEditor(false)
    }

    return (
        <div>
            {!loading && !error &&
                <Container>
                    <Grid columns={2}>
                        <Grid.Column width={4}>

                        </Grid.Column>
                        <Grid.Column width={12}>
                            {showEditor &&
                                <div>
                                    <Container textAlign='right' style={{ marginBottom: '1rem' }}>
                                        <Button.Group basic size='small'>
                                            <Button icon='reply' onClick={onCancel} />
                                            <Button icon='save' />
                                        </Button.Group>
                                    </Container>
                                    <StageEditor stage={stage} style={{ clear: 'both' }} />
                                </div>
                            }
                            {!showEditor &&
                                <div>
                                    <Poe accountPair={accountPair} />
                                    <Grid.Row>
                                        <Button.Group basic size='small' floated='right'>
                                            <Button icon='edit' onClick={onEdit} />
                                            <Button icon='share alternate' />
                                            <Button icon='download' />
                                        </Button.Group>
                                        <Header as="h1" id='stageTitle'>{stage.title}</Header>
                                    </Grid.Row>

                                    <Divider horizontal>
                                        <Header as='h4'>
                                            <Icon name='recycle' />
                                            开放创作
                                        </Header>
                                    </Divider>
                                    <Grid.Row>
                                        <div id='stageContent' style={{ marginBottom: '2rem', textAlign: 'justify' }}>
                                            <ReactMarkdown children={stage.content} />
                                        </div>
                                    </Grid.Row>
                                </div>
                            }
                        </Grid.Column>
                    </Grid>
                </Container>
            }
            <DeveloperConsole />
        </div>
    );
}

export default function Stage() {
    return (
        <SubstrateContextProvider>
            <Main />
        </SubstrateContextProvider>
    );
}