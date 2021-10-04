import React, { useEffect, useState } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { mnemonicGenerate, cryptoWaitReady } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import keyring from '@polkadot/ui-keyring';

import { Button, Menu, Dimmer, Loader, Grid, Sticky, Message } from 'semantic-ui-react';

import StageList from './StageList';


export default function Works() {
    const [activeItem, setActiveItem] = useState('closest')
    const handleItemClick = (e, { name }) => setActiveItem({ name })

    useEffect(() => {
        cryptoWaitReady().then(() => {
            console.log("that's fine.")
            const accounts = keyring.getAccounts();

            accounts.forEach(({ address, meta, publicKey }) => {
                const pair = keyring.getPair(address);
                // display the locked account statu
                console.log(address, pair.isLocked);
            }

            );

        });
    }, [])

    return (
        <div>
            <Menu text floated='right'>
                <Menu.Item
                    name='closest'
                    active={activeItem === 'closest'}
                    content='故事集'
                    onClick={handleItemClick}
                />
                <Menu.Item
                    name='mostComments'
                    active={activeItem === 'mostComments'}
                    content='单篇作品'
                    onClick={handleItemClick}
                />
            </Menu>
            <Button as={Link} to={{ pathname: '/space/stage/create' }} style={{ marginBottom: '2rem' }}>开始创作</Button>
            <StageList />
        </div>
    )
}

