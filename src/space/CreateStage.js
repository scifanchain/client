import React, { useEffect, useState } from 'react';
import { Switch, Route, Link, useHistory } from 'react-router-dom';

import { Button, Dimmer, Loader, Grid, Sticky, Message, Input } from 'semantic-ui-react';
import EditorJS from '@editorjs/editorjs';

import {post} from '../utils/Request'

export default function CreateStage() {
    const history = useHistory();
    const storage = window.localStorage;

    const [title, setTitle] = useState('')
    const [titleError, setTitleError] = useState('')
    const [contentError, setContentError] = useState('')
    const [dataStage, setDataStage] = useState({})


    useEffect(() => {
        const editor = new EditorJS({
            /** 
             * Id of Element that should contain the Editor 
             */
            holder: 'editorjs',
            autofocus: true,
            placeholder: '点击这里开始创作！',
            onChange: () => {
                editor.save().then((outputData) => {
                    setDataStage(outputData)
                }).catch
                    ((error) => {
                        console.log('Saving failed: ', error)
                    });
            }
        })
    }, [])
    

    // 标题值改变
    // todo: 验证是否有重名标题，有的话给出提示
    function handleChange(e) {
        setTitle(e.target.value)
        if (title.length >= 1) {
            setTitleError('')
        }
        console.log(title)
    }

    // 验证标题是否为空
    function titleValidated() {
        if (title.length < 1) {
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
        if (dataStage.blocks.length < 1) {
            setContentError("内容为空。如果你是从别的地方复制过来的内容，请在编辑器中做些修改，这样编辑器才能获取到内容。")
            return false
        }
        return true
    }

    // 提交
    const postStage = () => {
        if (titleValidated() && contentValidated()) {
            post('api/stages/', { "title": title, "content": dataStage, "owner": storage.getItem('scifanchain_user_id') }, true)
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error);
                });
            window.location = '/space/works/';
        }
    }

    return (
        <Grid>
            <Grid.Row>
                <Grid.Column width={12}>
                    <div className='editor-wrap'>
                        <Input fluid placeholder='故事标题...' className='stage-title-input' onChange={handleChange} />
                        <div id='editorjs' className='editor-content'></div>
                        <Button fluid style={{ marginTop: '1rem' }} onClick={postStage}>发表</Button>
                    </div>
                </Grid.Column>
                <Grid.Column width={4}>
                    
                </Grid.Column>
            </Grid.Row>
           
        </Grid>
    )
}

