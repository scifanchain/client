import React, { useEffect, useState } from 'react';
import { Switch, Route, Link, useHistory, useParams} from 'react-router-dom';

import EditorJS from '@editorjs/editorjs';

import { Button, List, Icon, Header, Divider } from 'semantic-ui-react';
import { get } from '../utils/Request';


export default function StageDetail() {
    const storage = window.localStorage;
    
    const [accountAddress, setAccountAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [stageTitle, setStageTitle] = useState('')
    const [stageContent, setStageContent] = useState('')
    const [error, setError] = useState('');

    // 接收跳转参数
    const params = useParams();

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
    }, [])

    useEffect(() => {
        get('authors/my_wallets/' + storage.getItem('scifanchain_user_id') + '/', {}, true).then((res) => {
            setAccountAddress(res.data.address)
        }, []);
    });


    return (
        <div>
            <Button as={Link} to={'/space/stage/edit/' + params.stage_id}>编辑</Button>
            <Button.Group floated='right'>
                <Button>验证</Button>
                <Button.Or text='>'/>
                <Button>存证</Button>
            </Button.Group>
           <Divider/>
            <div className='editor-wrap'>
                <h2 className='stage-title'>{stageTitle}</h2>
                <div id="editorjs" className='editor-content'></div>
            </div>
        </div>
        )
       
        
}