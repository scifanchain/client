import React, { useState } from 'react';
import { Container, Menu, Divider } from 'semantic-ui-react'

export default function Footer() {
    const { activeItem, setActiveItem } = useState('closest')

    const handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    return (
        <Container fluid>
            <Divider />
            <Menu fluid text>
                <Menu.Item header>&copy; 赛凡网络 2021</Menu.Item>
                <Menu.Item
                    name='closest'
                    active={activeItem === 'closest'}
                    content="白皮书"
                    onClick={handleItemClick}
                />
                <Menu.Item
                    name='mostComments'
                    active={activeItem === 'mostComments'}
                    content="用户手册"
                    onClick={handleItemClick}
                />
                <Menu.Item
                    name='mostPopular'
                    active={activeItem === 'mostPopular'}
                    content="文档"
                    onClick={handleItemClick}
                />
            </Menu>
        </Container>
    )
}