import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { SubstrateContextProvider, useSubstrate } from '../substrate-lib';

import EditorJS from '@editorjs/editorjs';

import { Button, Dimmer, Loader, Divider, Icon } from 'semantic-ui-react';
import { get } from '../utils/Request';

import Poe from '../chain/Poe';


function PoE() {
    // 接收跳转参数
    const params = useParams();

    const storage = window.localStorage;
    const { apiState, keyring, keyringState, apiError } = useSubstrate();

    const [accountAddress, setAccountAddress] = useState('');
    const [stageContent, setStageContent] = useState('')

    useEffect(() => {
        get('authors/my_wallets/' + storage.getItem('scifanchain_user_id') + '/', {}, true).then((res) => {
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

    if (apiState === 'ERROR') return message(apiError);
    else if (apiState !== 'READY') return loader('正在连接赛凡链……');

    if (keyringState !== 'READY') {
        return loader('Loading accounts (please review any extension\'s authorization)');
    }

    return (
        <div>
            {accountPair &&
                <Poe accountPair={accountPair} />
            }
            <Divider />
        </div>
    )
}

function Stage() {
    // 接收跳转参数
    const params = useParams();

    const [stageTitle, setStageTitle] = useState('')
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);


    // 加载数据
    useEffect(() => {
        get('api/stages/' + params.stage_id + '/', {}, true)
            .then(function (res) {
                // 处理成功情况
                setLoading(false);
                console.log(res.data);
                setStageTitle(res.data.title);

                // 加载编辑器
                const editor = new EditorJS({
                    holder: 'editorjs',
                    data: res.data.content,
                    readOnly: true,
                    minHeight: 0,
                })

                setError('');
                // console.log(response);
            })
            .catch(function (error) {
                // 处理错误情况
                setLoading(false)
                setStageContent({})
                setError('很抱歉，没有获取到数据！')
                console.log(error);
            });
    }, []);

    return (
        <div>
            <div style={{height: 4+'rem'}}>
                <Button.Group floated='right'>
                    <Button icon as={Link} to={'/space/stage/edit/' + params.stage_id} style={{ marginBottom: 1 + 'rem' }}>
                        <Icon name='edit' /> 修改</Button>
                </Button.Group>
            </div>
            <div className='editor-wrap'>
                <h2 className='stage-title' id='stageTitle'>{stageTitle}</h2>
                <div id="editorjs" className='editor-content'></div>
            </div>
        </div>
    )
}

export default function StageDetail() {
    return (
        <div>
            <SubstrateContextProvider>
                <PoE />
            </SubstrateContextProvider>
            <Stage />
        </div>
    );
}