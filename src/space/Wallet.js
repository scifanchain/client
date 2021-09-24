import React, { useEffect, useState } from 'react';
import { Button, Icon, Step, Divider, Message, Modal, Header } from 'semantic-ui-react'
import { useHistory } from 'react-router-dom';

import { mnemonicGenerate } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';

import { get, post } from '../utils/Request';

// 本地存诸
const storage = window.localStorage;

const StepExampleGroup = () => (
    <Step.Group>
        <Step active>
            <Icon name='truck' />
            <Step.Content>
                <Step.Title>生成助记词</Step.Title>
                <Step.Description>Choose your shipping options</Step.Description>
            </Step.Content>
        </Step>

        <Step>
            <Icon name='payment' />
            <Step.Content>
                <Step.Title>生成密钥对</Step.Title>
                <Step.Description>Enter billing information</Step.Description>
            </Step.Content>
        </Step>

        <Step disabled>
            <Icon name='info' />
            <Step.Content>
                <Step.Title>确认</Step.Title>
            </Step.Content>
        </Step>
    </Step.Group>
)

export default function Wallet() {
    const history = useHistory();
    
    const [mnemonic, setMnemonic] = useState('')
    const [publicKey, setPublicKey] = useState('')
    const [address, setAddress] = useState('')
    const [openLoginModal, setOpenLoginModal] = useState(false)

    useEffect(() => {
        get('api/wallets/14/', {}, true).then((res) => {
            console.log(res)
            setAddress(res.data.address)
            setPublicKey(res.data.publickey)
        }, [])
    })

    const generate_mnemonic = () => {
        // 生成助记词
        const mnemonic = mnemonicGenerate();
        setMnemonic(mnemonic)
    }

    // 显示助记词
    const MnemonicMessage = () => (
        <div style={{ paddingTop: 2 + 'em' }}>
            <Message size='massive' color='olive'>
                {mnemonic}
            </Message>
            <Button onClick={generate_keypair}>继续</Button>
        </div>
    )

    // 生成keypari
    const generate_keypair = () => {
        // 清除mnemonic
        setMnemonic('')

        // 创建keyring
        const keyring = new Keyring();
        const pair = keyring.addFromUri(mnemonic, { name: 'first pair' }, 'ed25519');
        setPublicKey(u8aToHex(pair.publicKey))
        setAddress(pair.address)

        console.log('address', pair.address);
    }

    // 显示keypair
    const KeypariMessage = () => (
        <div style={{ paddingTop: 2 + 'em' }}>
            <Message size='massive' color='olive'>
                {address}
            </Message>
            <Message size='massive' color='green'>
                {publicKey}
            </Message>
            <Button onClick={save_wallet}>完成</Button>
        </div>
    )

    // 提交保存
    const save_wallet = () => {
        // 对返回的tokon解码
        // 将解码后的字符串转为json对象
        const access_token = storage.getItem('scifanchain_access_token');
        if (access_token) {
            const payload = storage.getItem('scifanchain_access_token').split('.')[1]
            const payloadJson = JSON.parse(window.atob(payload))
            const user_id = payloadJson.user_id

            post('api/wallets/', {
                'username': storage.getItem('scifanchain_username'),
                'user_id': user_id,
                'publickey': publicKey,
                'address': address
            }).then((res) => {
                console.log(res);
            })
        } else {
            setOpenLoginModal(true)
        }
    }

    const toLogin = () => {
        setOpenLoginModal(false)
        history.push('/sign-in');
    }

    const ModalLogin = () => {
        return (
            <Modal
                basic
                onClose={() => setOpenLoginModal(false)}
                onOpen={() => setOpenLoginModal(true)}
                open={openLoginModal}
                size='small'
            >
                <Header icon>
                    <Icon name='archive' />
                    没有找到您的身份令牌
                </Header>
                <Modal.Content>
                    <p>
                        您的身份令牌很可能过期了。身份令牌对您的账号安全至关重要, 您必须重新登录，以获得新的身份令牌，才能申请钱包。
                    </p>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='green' inverted onClick={toLogin}>
                        重新登录
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }

    const Stages = () => {
        get('api/stages/', {}, true).then((res) => {
            console.log(res)
        })
    }

    return (
        <div>
            <StepExampleGroup />
            <Divider />
            <Button onClick={generate_mnemonic}>生成助记词</Button>
            {mnemonic &&
                <MnemonicMessage />
            }
            {address &&
                <KeypariMessage />
            }
            <ModalLogin />
        </div>
    )

}