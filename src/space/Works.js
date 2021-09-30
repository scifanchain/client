import React, { useEffect, useState } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { mnemonicGenerate, cryptoWaitReady } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import keyring from '@polkadot/ui-keyring';

import { Button, Dimmer, Loader, Grid, Sticky, Message } from 'semantic-ui-react';

import StageList from './StageList';


export default function Works() {

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
    },[])

    return (
        <div>
            <Button as={Link} to={{ pathname: '/space/stage/create' }} style={{marginBottom: '2rem'}}>开始创作</Button>
            <StageList />
        </div>
    )
}

