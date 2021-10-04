import React, { useEffect, useState } from 'react';
import { Switch, Route, Link, useHistory } from 'react-router-dom';
import moment from 'moment';

import { Button, List, Icon, Pagination } from 'semantic-ui-react';
import { get } from '../utils/Request';


export default function StageList() {
    const [loading, setLoading] = useState(true);
    const [stages, setStages] = useState([])
    const [error, setError] = useState('')
    const [countPage, setCountPage] = useState(0)
    const [nextPage, setNextPage] = useState(null)
    const [prevPage, setPrevPage] = useState(null)
    const [activePage, setActivePage] = useState(1)

    useEffect(() => {
        get('works/stage_list_by_author/?page=' + activePage)
            .then(function (res) {
                // 处理成功情况
                setLoading(false)
                setStages(res.data.results)
                setCountPage(Math.ceil(res.data.count / 20))
                setNextPage(res.data.next)
                setPrevPage(res.data.previous)
                setError('')
                console.log(res);
            })
            .catch(function (error) {
                // 处理错误情况
                setLoading(false)
                setStages([])
                setError('很抱歉，没有获取到数据！')
                console.log(error);
            });
        console.log(activePage)
    }, [activePage,])

    // 分页
    const PaginationForStageList = () => (
        <Pagination activePage={activePage} totalPages={countPage} onPageChange={handlePaginationChange} />
    )

    const handlePaginationChange = (e, { activePage }) => setActivePage(activePage)

    // 列表
    const stageList = stages.map((stage) => (
        <List.Item key={stage.id}>
            <List.Content floated='right'>
                <Button size='mini' animated='vertical'>
                    <Button.Content hidden>编辑</Button.Content>
                    <Button.Content visible>
                        <Icon name='write square' />
                    </Button.Content>
                </Button>
            </List.Content>
            <List.Content>
                <List.Header as={Link} to={
                    {
                        pathname: '/space/stage/' + stage.id,
                    }
                }>
                    {stage.title}
                </List.Header>
                <p class='title-sub'>{moment(stage.created).format("YYYY年MM月DD日HH时mm分")}</p>
                <List.Description>{stage.summary}</List.Description>
            </List.Content>

        </List.Item>
    ));

    return (
        <div>
            {loading &&
                <div className="text-center">
                    <div className="spinner-border text-secondary" role="status">
                        <span className="sr-only">正在加载...</span>
                    </div>
                </div>
            }

            {!loading && !error &&
                <List divided relaxed>{stageList}</List>
            }
            {(nextPage || prevPage) &&
                <PaginationForStageList />
            }

        </div>
    )
}