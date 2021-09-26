import React, { Component, useState, useEffect } from 'react'
import { Container, Menu, Button, Modal, Dropdown } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import { Link } from 'react-router-dom'
import { useRecoilState } from 'recoil';
import { usernameState } from './StateManager';

function Navigation() {
	// 导航图标激活样式
	const [activeItem, setActiveItem] = useState('home')
    const handleItemClick = (e, { name }) => {
        setActiveItem(name)
    }

    // 本地存储
    const storage = window.localStorage;

    // 同步用户
    const [username, setUsername] = useRecoilState(usernameState)
    
    // 用户注销
    const handleLogout = () => {
        window.localStorage.removeItem('scifanchain_username');
        window.localStorage.removeItem('scifanchain_access_token');
        window.localStorage.removeItem('scifanchain_refresh_token');
        window.localStorage.removeItem('scifanchain_expired_time');
        setUsername('')
    }

    return (
        <Menu pointing inverted>
            {/* <Image src={`${process.env.PUBLIC_URL}/assets/scifanchain_logo_black_white.png`} size='mini' /> */}
            <Menu.Item header>赛凡链</Menu.Item>
            <Menu.Item as={Link} to='/'
                name='home'
                active={activeItem === 'home'}
                content="首页"
                onClick={handleItemClick}>
            </Menu.Item>
            <Menu.Item as={Link} to='/galaxy'
                name='银河书'
                active={activeItem === '银河书'}
                onClick={handleItemClick}>
            </Menu.Item>
            <Menu.Item as={Link} to='/stars'
                name='超级星球'
                active={activeItem === '超级星球'}
                onClick={handleItemClick}>
            </Menu.Item>
            <Menu.Item as={Link} to='/era'
                name='时空桥'
                active={activeItem === '时空桥'}
                onClick={handleItemClick}>
            </Menu.Item>
            <Menu.Item as={Link} to='/finance'
                name='社区'
                active={activeItem === '社区'}
                onClick={handleItemClick}>
            </Menu.Item>
            <Menu.Menu position='right'>
                {username &&
                    <Dropdown text={username} pointing className='link item'>
                        <Dropdown.Menu>
                            <Dropdown.Item as={Link} to='/space/home'>我的空间</Dropdown.Item>
                            <Dropdown.Item as={Link} to='/space/works'>我的作品</Dropdown.Item>
                            <Dropdown.Item as={Link} to='/space/wallet'>我的钱包</Dropdown.Item>
                            <Dropdown.Item as={Link} to='/space/profile'>账号设置</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={handleLogout}>
                                退出
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                }
                {!username &&
                    <Menu.Item as={Link} to='/sign-in'
                        name='登录'
                        active={activeItem === '登录'}
                        onClick={handleItemClick}>
                    </Menu.Item>
                }
                {!username &&
                    <Menu.Item as={Link} to='/sign-up'
                        name='注册'
                        active={activeItem === '注册'}
                        onClick={handleItemClick}>
                    </Menu.Item>
                }
            </Menu.Menu>
        </Menu>
    )
}

export default Navigation