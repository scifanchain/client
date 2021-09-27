import React, { useEffect, useState } from 'react';
import { Switch, Route, Link } from 'react-router-dom';

import { Button, Dimmer, Loader, Grid, Sticky, Message, Input } from 'semantic-ui-react';
import EditorJS from '@editorjs/editorjs';

export default function CreateStage() {

    const editor = new EditorJS({
        /** 
         * Id of Element that should contain the Editor 
         */
        holder: 'editorjs',
        autofocus: true,
        placeholder: '点击这里开始创作！'
    })

    return (
        <div>
            <div className='editor-wrap'>
                <Input fluid placeholder='故事标题...' className='stage-title-input' />
                <div id='editorjs' className='editor-bg'></div>
                <Button fluid style={{marginTop: '1rem'}}>发表</Button>
            </div>
            
        </div>
    )
}

