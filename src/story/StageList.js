import React, { useEffect, useState } from 'react';
import { List } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import config from '../config';
import { get } from '../utils/Request';

function StageList () {
    const [loading, setLoading] = useState(true);
    const [stages, setStages] = useState([])
    const [error, setError] = useState('')

    useEffect(() => {
        get(config.API_URL + 'api/stages/')
            .then(function (response) {
                // 处理成功情况
                setLoading(false)
                setStages(response.data.results)
                setError('')
                console.log(response);
            })
            .catch(function (error) {
                // 处理错误情况
                setLoading(false)
                setStages([])
                setError('很抱歉，没有获取到数据！')
                console.log(error);
            });
    }, [])

    const stageList = stages.map((stage) => (
        <List.Item key={stage.id} as={Link} to={
            {
                pathname: '/stage/' + stage.id,
            }
        }>
            {stage.title}
            <p>{ stage.created}</p>
            <p>{ stage.owner.username}</p>
        </List.Item>
    ));

  // history.push({ pathname: "/stage/" + stage.id })
    
    return(
        <div>
            { loading &&　
            <div className="text-center">
                <div className="spinner-border text-secondary" role="status">
                    <span className="sr-only">正在加载...</span>
                </div>
            </div>
            }

            {!loading && !error && 
                <List>{stageList}</List>
            }
        </div>
    )
}

export default StageList