import React, { useEffect, useState, render } from 'react';
import { Switch, Route, Link, useHistory, useParams, Redirect  } from 'react-router-dom';

import { Button, Dimmer, Loader, Grid, Sticky, Message, Input, Divider } from 'semantic-ui-react';
import EditorJS from '@editorjs/editorjs';

import { get, put, post } from '../utils/Request';


export default function EditStage() {
    const history = useHistory();
    const storage = window.localStorage;

    // 接收跳转参数
    const params = useParams();

    const [titleError, setTitleError] = useState('')
    const [contentError, setContentError] = useState('')
    const [dataStage, setDataStage] = useState({})
    const [accountAddress, setAccountAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [stageTitle, setStageTitle] = useState('')
    const [stageContent, setStageContent] = useState('')
    const [error, setError] = useState('');


    useEffect(() => {
        get('api/stages/' + params.stage_id + '/', {}, true)
            .then(function (res) {
                // 处理成功情况
                setLoading(false);
                console.log(res.data);
                setStageTitle(res.data.title);
                setStageContent(res.data.content)

                // 加载编辑器
                const editor = new EditorJS({
                    holder: 'editorjs',
                    data: res.data.content,
                    readOnly: false,
                    onChange: () => {
                        editor.save().then((outputData) => {
                            setStageContent(outputData)
                        }).catch
                            ((error) => {
                                console.log('Saving failed: ', error)
                            });
                    }
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


    // 标题值改变
    // todo: 验证是否有重名标题，有的话给出提示
    function handleChange(e) {
        setStageTitle(e.target.value)
        if (stageTitle.length >= 1) {
            setTitleError('')
        }
        console.log(stageTitle)
    }

    // 验证标题是否为空
    function titleValidated() {
        if (stageTitle.length < 1) {
            setTitleError("标题不能为空")
            return false
        } else {
            setTitleError('')
        }
        return true
    }

    // 验证内容
    function contentValidated() {
        console.log(dataStage);
        if (stageContent.length < 1) {
            setContentError("内容为空。如果你是从别的地方复制过来的内容，请在编辑器中做些修改，这样编辑器才能获取到内容。")
            return false
        }
        return true
    }

    // 提交
    const postStage = () => {
        if (titleValidated() && contentValidated()) {
            put(
                'works/stage/update/' + params.stage_id + '/',
                { "title": stageTitle, "content": stageContent, "owner": storage.getItem('scifanchain_user_id') },
                true
            ).then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error);
                });
            // history.push('/space/stage/' + params.stage_id);
         
            window.location = '/space/stage/' + params.stage_id;
            
        }
    }

    return (
        <div>
            <Button as={Link} to={'/space/stage/' + params.stage_id}>返回</Button>
            <Button.Group floated='right'>
                <Button onClick={postStage}>提交修改</Button>
            </Button.Group>
            <Divider />
            {contentError &&
                <Message>{contentError}</Message>
            }
            <div className='editor-wrap'>
                <Input fluid className='stage-title-input' onChange={handleChange} value={ stageTitle }/>
                <div id='editorjs' className='editor-content'></div>
                <Button fluid style={{ marginTop: '1rem' }} onClick={postStage}>提交修改</Button>
            </div>

        </div>
    )
}

