import React, { useEffect, useState } from 'react';
import { Switch, Route, Link, useHistory } from 'react-router-dom';
import moment from 'moment';

import { Button, List, Icon, Pagination } from 'semantic-ui-react';
import { get } from '../utils/Request';


export default function BlogList() {
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState([])
    const [error, setError] = useState('')
    const [countPage, setCountPage] = useState(0)
    const [nextPage, setNextPage] = useState(null)
    const [prevPage, setPrevPage] = useState(null)
    const [activePage, setActivePage] = useState(1)

    useEffect(() => {
        get('api/blogs/posts/')
            .then(function (res) {
                // 处理成功情况
                setLoading(false)
                setBlogs(res.data.results)
                setCountPage(Math.ceil(res.data.count / 20))
                setNextPage(res.data.next)
                setPrevPage(res.data.previous)
                setError('')
                console.log(res);
            })
            .catch(function (error) {
                // 处理错误情况
                setLoading(false)
                setBlogs([])
                setError('很抱歉，没有获取到数据！')
                console.log(error);
            });
        console.log(activePage)
    }, [activePage,])

    // 分页
    const PaginationForBlogList = () => (
        <Pagination activePage={activePage} totalPages={countPage} onPageChange={handlePaginationChange} />
    )

    const handlePaginationChange = (e, { activePage }) => setActivePage(activePage)

    // 列表
    const blogList = blogs.map((blog) => (
        <List.Item key={blog.id}>
            <List.Content>
                <List.Header as={Link} to={
                    {
                        pathname: '/blogs/' + blog.id,
                    }
                }>
                    {blog.title}
                </List.Header>
                <p style={{ paddingTop: 1 + 'rem', color: '#AAA'}}>发布于：{moment(blog.created).format("YYYY年MM月DD日HH时mm分")}</p>
                <List.Description>{blog.summary}</List.Description>
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
                <List divided relaxed>{blogList}</List>
            }
            {(nextPage || prevPage) &&
                <PaginationForBlogList />
            }

        </div>
    )
}