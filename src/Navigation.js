import React, { useState } from 'react'
import { Menu, Image, Dropdown } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import { Link, useLocation  } from 'react-router-dom'

import { useRecoilState } from 'recoil';
import { usernameState } from './StateManager';

import { RemoveAuthorToken } from './utils/Storage';
import config from './config';

function Navigation() {
    // 导航图标激活样式
    const location = useLocation(); //URL路径
    const [activeItem, setActiveItem] = useState(location.pathname.substr(1))
    const handleItemClick = (e, { name }) => {
        setActiveItem(name)
    };

    // 同步用户
    const [username, setUsername] = useRecoilState(usernameState);

    // 用户注销
    const handleLogout = () => {
        RemoveAuthorToken();
        setUsername('')
    };

    return (
        <Menu pointing inverted id='TopNav'>
            {/* <Image src={`${process.env.PUBLIC_URL}/assets/scifanchain_logo_black_white.png`} size='mini' /> */}
            <Menu.Item header as={Link} to='/'
                name='home'
                active={activeItem === '/home'}
                content="赛凡首页"
                onClick={handleItemClick}>
            </Menu.Item>
            <Menu.Item as={Link} to='/works'
                name='works'
                active={activeItem === 'works'}
                content="作品"
                onClick={handleItemClick}>
            </Menu.Item>
            <Menu.Item as={Link} to='/community'
                name='community'
                active={activeItem === 'community'}
                content="社区"
                onClick={handleItemClick}>
            </Menu.Item>
            <Menu.Item as={Link} to='/blogs'
                name='blogs'
                active={activeItem === 'blogs'}
                content="博客"
                onClick={handleItemClick}>
            </Menu.Item>
            {/* <Menu.Item as={Link} to='/era'
                name='时空桥'
                active={activeItem === '时空桥'}
                onClick={handleItemClick}>
            </Menu.Item> */}
            {username &&
                <Menu.Menu position='right'>
                    <Menu.Item>
                        <Image src={config.URL + 'media/avatars/2021/' + username + '.svg'} avatar id='AvatarTiny' />
                    </Menu.Item>
                    <Dropdown
                        text={username} pointing className='link item'>
                        <Dropdown.Menu>
                            {/* <Dropdown.Item as={Link} to='/space/home'>我的空间</Dropdown.Item> */}
                            <Dropdown.Item as={Link} to='/space/profile'>个人资料</Dropdown.Item>
                            <Dropdown.Item as={Link} to='/space/works'>我的作品</Dropdown.Item>
                            <Dropdown.Item as={Link} to='/space/wallet'>我的钱包</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={handleLogout}>
                                退出
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu.Menu>
            }
            {!username &&
                <Menu.Menu position='right'>
                    <Menu.Item as={Link} to='/sign-in'
                        name='登录'
                        active={activeItem === '登录'}
                        onClick={handleItemClick}>
                    </Menu.Item>
                    <Menu.Item as={Link} to='/sign-up'
                        name='注册'
                        active={activeItem === '注册'}
                        onClick={handleItemClick}>
                    </Menu.Item>
                </Menu.Menu>
            }

        </Menu>
    );
};

export default Navigation;