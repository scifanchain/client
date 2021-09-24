import React, { useEffect, useState } from 'react';
import { Button, Icon, Step, Divider, Message, Modal, Header, Table, Card, Image, Container } from 'semantic-ui-react'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useHistory } from 'react-router-dom';

import { useSubstrate } from '../substrate-lib';

import { mnemonicGenerate } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';
import { ApiPromise, WsProvider } from '@polkadot/api';

import config from '../config';

import { get, post } from '../utils/Request';

// 本地存诸
const storage = window.localStorage;

function Main() {
    const history = useHistory();

    const [mnemonic, setMnemonic] = useState('')
    const [publicKey, setPublicKey] = useState('')
    const [address, setAddress] = useState('')
    const [hasAddress, setHasAddress] = useState(true)
    const [openLoginModal, setOpenLoginModal] = useState(false)

    const [myBalance, setMyBalance] = useState(0)
    const [myNonce, setMyNonce] = useState(0)

    const get_balance = async (add) => {
        // Retrieve the last timestamp
        const now = await api.query.timestamp.now();
        // Retrieve the account balance & nonce via the system module
        const { nonce, data: balance } = await api.query.system.account(add);

        console.log(`${now}: balance of ${balance.free} and a nonce of ${nonce}`);

        const account = JSON.stringify({ balance, nonce })

        return account

    };

    useEffect(() => {
        get('authors/my_wallets/14/', {}, true).then((res) => {
            console.log(res)
            if (res.data.address) {
                setAddress(res.data.address)
                setPublicKey(res.data.publickey)
                get_balance(res.data.address).then((res) => {
                    console.log(res);
                    // 将字符串转为对象
                    const obj = JSON.parse(res)
                    console.log(parseInt(obj.nonce))
                    setMyBalance(obj.balance.free)
                    setMyNonce(parseInt(obj.nonce))
                    console.log("complete");
                });
            }
            else {
                setHasAddress(false)
            }
        });
    }, [])

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
            <Message size='small' color='olive'>
                {address}
            </Message>
            <Message size='small' color='olive'>
                {publicKey}
            </Message>
            <Button onClick={save_wallet}>完成提交</Button>
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

    const AccountCard = () => {
        return (
            <Card.Group>
                <Card>
                    <Card.Content>
                        <Card.Header>账户余额</Card.Header>
                        <Card.Meta>{myBalance}</Card.Meta>
                    </Card.Content>
                    <Card.Content extra>
                        <div className='ui two buttons'>
                            <Button basic color='green' icon>
                                <Icon name='world' />
                                转账
                            </Button>
                            <Button basic color='red'>
                                记录
                            </Button>
                        </div>
                    </Card.Content>
                </Card>
                <Card>
                    <Card.Content>
                        <Card.Header>交易次数</Card.Header>
                        <Card.Meta>{myNonce}</Card.Meta>
                    </Card.Content>
                    <Card.Content extra>
                        <div>
                            <Button basic color='green' fluid>
                                详情
                            </Button>
                        </div>
                    </Card.Content>
                </Card>
            </Card.Group>
        )
    }

    const AddressTable = () => {
        return (
            <Table celled striped>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell colSpan='3'>赛凡Wallet</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    <Table.Row>
                        <Table.Cell collapsing>
                            <Icon name='address book outline' /> 地址
                        </Table.Cell>
                        <Table.Cell>{ address }</Table.Cell>
                        <Table.Cell collapsing textAlign='right'>
                            <CopyToClipboard text={address}>
                                <Button
                                    basic
                                    circular
                                    compact
                                    size='mini'
                                    color='blue'
                                    icon='copy outline'
                                />
                            </CopyToClipboard>
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>
                            <Icon name='key' /> 公钥
                        </Table.Cell>
                        <Table.Cell>{ publicKey }</Table.Cell>
                        <Table.Cell textAlign='right'>
                            <CopyToClipboard text={publicKey}>
                                <Button
                                    basic
                                    circular
                                    compact
                                    size='mini'
                                    color='blue'
                                    icon='copy outline'
                                />
                            </CopyToClipboard>
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        )
    }

    return (
        <div>
            {!hasAddress &&
                <Button onClick={generate_mnemonic}>生成助记词</Button>
            }
            {!hasAddress && mnemonic &&
                <MnemonicMessage />
            }
            {!hasAddress && address  &&
                <KeypariMessage />
            }
            {hasAddress &&
                <Container fluid>
                    <AccountCard />
                    <AddressTable />
                </Container>
            }
            <ModalLogin />
        </div>
    )
}

export default function Address(props) {
    const { api } = useSubstrate();
    return api.rpc && api.rpc.state && api.rpc.state.getMetadata
        ? <Main {...props} />
        : null;
}
