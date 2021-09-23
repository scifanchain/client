import React, { useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react'

import { mnemonicGenerate, cryptoWaitReady  } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';

export default function Wallet() {
    const [mnemonic, setMnemonic] = useState('')
    const [address, setAddress] = useState('')

    const generate_mnemonic = () => {
        // 创建keyring
        const keyring = new Keyring();
        // 生成助记词
        const mnemonic = mnemonicGenerate();
        setMnemonic(mnemonic)

        // 在keyring上用助记词生出密钥对
        // type ed25519
        const pair = keyring.addFromUri(mnemonic, { name: 'first pair' }, 'ed25519');

        // adjust the default ss58Format for Kusama
        // CxDDSH8gS7jecsxaRL9Txf8H5kqesLXAEAEgp76Yz632J9M
        console.log('address', pair.address);
    }

    return (
        <div>
            <Button onClick={generate_mnemonic}>生成钱包</Button>
        </div>
    )

}