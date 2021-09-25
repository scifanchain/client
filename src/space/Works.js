import React, { useEffect, useState } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { mnemonicGenerate, cryptoWaitReady } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import keyring from '@polkadot/ui-keyring';


export default function Works() {

    useEffect(() => {
        cryptoWaitReady().then(() => {
            // load all available addresses and accounts
            // keyring.loadAll({ ss58Format: 42, type: 'sr25519' });

            // const mnemonic = mnemonicGenerate(12);

            // add the account, encrypt the stored JSON with an account-specific password
            // const { pair, json } = keyring.addUri(mnemonic, 'myStr0ngP@ssworD', { name: 'mnemonic acc' });

            // additional initialization here, including rendering
            console.log("that's fine.")
            // console.log(pair)
            // console.log(json)
            
            const accounts = keyring.getAccounts();

            accounts.forEach(({ address, meta, publicKey }) => {
                const pair = keyring.getPair(address);

                // display the locked account status
                
                console.log(address, pair.isLocked);
            }
               
            );

        });
    },[])

    return (
        <div>my works.</div>
    )
}

