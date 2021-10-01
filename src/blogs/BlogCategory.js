import React, { useEffect, useState } from 'react';
import { Switch, Route, Link, useHistory } from 'react-router-dom';
import moment from 'moment';

import { Button, List, Icon, Pagination, Menu } from 'semantic-ui-react';
import { get } from '../utils/Request';


export default function BlogCategory() {
    const [activeItem, setActiveItem] = useState('home');
    const handleItemClick = (e, { name }) => {
        setActiveItem(name)
    };

    const [categories, setCategories] = useState([])

    useEffect(() => {
        get('api/blogs/categories/').then((res) => {
            setCategories(res.data.results);
            console.log(res.data.results);
        })
    }, [])

    const categoryList = categories.map((cat) => (
        <Menu.Item key={cat.id}
            name={cat.name}
            active={activeItem === cat.name}
            content={cat.name}
            onClick={handleItemClick}
        />
    ));

    return (
        <Menu pointing vertical>
            {categoryList}
        </Menu>
    )
}