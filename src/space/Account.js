import React, { useEffect, useState, useRef } from 'react';
import { Button, Icon, Message, Modal, Header, Table, Card, Input, Container, Form } from 'semantic-ui-react'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useHistory } from 'react-router-dom';

import { useSubstrate } from '../substrate-lib';

import { mnemonicGenerate } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

// import { Keyring } from '@polkadot/keyring';
// import { keyring } from '@polkadot/ui-keyring';

import { get, post } from '../utils/Request';

// 本地存诸
const storage = window.localStorage;

function Main() {
    const { api, keyring } = useSubstrate();

    const history = useHistory();

    const [mnemonic, setMnemonic] = useState('')
    const [publicKey, setPublicKey] = useState('')
    const [address, setAddress] = useState('')
    const [hasAddress, setHasAddress] = useState(true)
    const [openLoginModal, setOpenLoginModal] = useState(false)

    const [state, setState] = useState({
        name: '',
        password: '',
        password_repeat: '',
    });

    const [myBalance, setMyBalance] = useState('')
    const [myNonce, setMyNonce] = useState(0)

    const name_ref = useRef('');
    const password_ref = useRef('');
    const password_repeat_ref = useRef('');

    const allow_name = useRef(false);
    const allow_password = useRef(false);
    const allow_password_repeat = useRef(false);

    const [validate_name, setValidateName] = useState(false);
    const [validate_password, setValidatePassword] = useState(false);
    const [validate_password_repeat, setValidatePasswordRepeat] = useState(false);
    const [validated, setValidated] = useState(false);

    function handleChange(e) {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
        switch (e.target.name) {
            case 'name':
                name_ref.current = e.target.value;
                validName();
                break;
            case 'password':
                password_ref.current = e.target.value;
                validPassword();
                break;
            case 'password_repeat':
                password_repeat_ref.current = e.target.value;
                validPasswordRepeat();
                break;
            default:
        }
    };

    // 验证名称
    function validName() {
        if (!/^[\u4E00-\u9FA5a-zA-Z0-9_]{2,20}$/.test(name_ref.current)) {
            setValidateName(
                '用户名可由汉字、英文字母、数字、下划线组成，2-20位。'
            );
            allow_name.current = false;
        } else {
            setValidateName(false);
            allow_name.current = true;
        }
        submitCheck();
    };

    // 验证密码
    function validPassword() {
        if (
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,20}$/.test(
                password_ref.current
            )
        ) {
            setValidatePassword(
                '密码6-20位，至少包含1个大写字母，1个小写字母和1个数字。'
            );
            allow_password.current = false;
        } else {
            setValidatePassword(false);
            allow_password.current = true;
        }
        submitCheck();
    }

    // 验证密码重复
    function validPasswordRepeat() {
        if (password_ref.current !== password_repeat_ref.current) {
            setValidatePasswordRepeat('两次输入的密码不一致，请重新输入。');
            allow_password_repeat.current = false;
        } else {
            setValidatePasswordRepeat(false);
            allow_password_repeat.current = true;
        }
        submitCheck();
    }

    function submitCheck() {
        if (
            allow_name.current &&
            allow_password.current &&
            allow_password_repeat.current
        ) {
            setValidated(true);
        } else {
            setValidated(false);
        }
    }

    const getBalance = async (add) => {
        // Retrieve the last timestamp
        const now = await api.query.timestamp.now();
        // Retrieve the account balance & nonce via the system module
        const { nonce, data: balance } = await api.query.system.account(add);

        console.log(`${now}: balance of ${balance.free} and a nonce of ${nonce}`);

        const account = { balance, nonce }

        return account;

    };

    useEffect(() => {
        get('authors/my_wallets/' + storage.getItem('scifanchain_user_id') + '/', {}, true)
            .then((res) => {
                console.log(res)
                if (res.data.address) {
                    setAddress(res.data.address)
                    setPublicKey(res.data.publickey)
                    getBalance(res.data.address).then((res) => {
                        console.log(res.nonce.toHuman());
                        setMyBalance(res.balance.free.toHuman())
                        setMyNonce(res.nonce.toHuman())
                        console.log("complete");
                    });
                }
                else {
                    setHasAddress(false)
                }
            });
    }, [])

    const generateMnemonic = () => {
        // 生成助记词
        const mnemonic = mnemonicGenerate();
        setMnemonic(mnemonic)
    }

    // 显示助记词
    const MnemonicMessage = () => (
        <div>
            <Header as='h2'>助记词</Header>
            <p>由于私钥不方便记忆，因此通常用助记词来代替私钥。助记词是私钥的另一种展现形式。一般由12或24个英文单词组成，只要你记住这些单词，按照顺序在钱包中输入，就能恢复钱包并且进行任意操作。如果别人拿到了你的助记词，就相当于拿到了你的私钥，就可以对你的资产进行掌控，所以建议务必保管好以下助记词：</p>
            <Message size='huge' color='black'>
                {mnemonic}
            </Message>
            <Message
                warning
                header='保管助记词的建议：'
                list={[
                    '不要向任何人泄露自己的助记词；',
                    '用纸笔抄写下来收藏，或将其记录在不联网的设备中；',
                ]}
            />
            <ModalConfirm />
        </div>
    )


    // 生成keypari
    const generateKeypair = () => {
        // add the account, encrypt the stored JSON with an account-specific password
        const { pair, json } = keyring.addUri(mnemonic, state.password, { name: state.name });

        setPublicKey(u8aToHex(pair.publicKey))
        setAddress(pair.address)

        // 清除mnemonic
        setMnemonic('')

        console.log('address', pair.address);
    }

    // 显示keypair
    const KeypariMessage = () => (
        <div>
            <Message>
                <Message.Header>Address</Message.Header>
                <p style={{ color: 'orange' }}>{address}</p>
                <p>钱包账号的Address地址供您对外公开。</p>
            </Message>
            <Message>
                <Message.Header>PublicKey</Message.Header>
                <p style={{ color: 'orange' }}>{publicKey}</p>
                <p>公钥与地址类似。</p>
            </Message>
            <Button onClick={saveWallet}>完成保存</Button>
        </div>
    );

    // 提交保存
    const saveWallet = () => {
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
                'name': state.name,
                'publickey': publicKey,
                'address': address
            }).then((res) => {
                console.log(res);
                setHasAddress(true)
            })
        } else {
            setOpenLoginModal(true)
        }
    };

    const toLogin = () => {
        setOpenLoginModal(false)
        history.push('/sign-in');
    };


    function confirmReducer(state, action) {
        switch (action.type) {
            case 'OPEN_MODAL':
                return { open: true, dimmer: action.dimmer }
            case 'CLOSE_MODAL':
                return { open: false }
            default:
                throw new Error()
        }
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
    };

    function ModalConfirm() {
        const [state, dispatch] = React.useReducer(confirmReducer, {
            open: false,
            dimmer: undefined,
        })
        const { open, dimmer } = state

        return (
            <div>
                <Button onClick={() => dispatch({ type: 'OPEN_MODAL', dimmer: 'blurring' })}>
                    下一步：生成账号密钥
                </Button>

                <Modal
                    dimmer={dimmer}
                    open={open}
                    onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                >
                    <Modal.Header>请确保您已将以下助记词备份到了安全的地方</Modal.Header>
                    <Modal.Content>
                        <Header size='large' color='violet'>
                            {mnemonic}
                        </Header>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={() => dispatch({ type: 'CLOSE_MODAL' })}>
                            返回
                        </Button>
                        <Button positive onClick={generateKeypair}>
                            确定并继续下一步
                        </Button>
                    </Modal.Actions>
                </Modal>
            </div>
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

                </Card>
                <Card>
                    <Card.Content>
                        <Card.Header>交易次数</Card.Header>
                        <Card.Meta>{myNonce}</Card.Meta>
                    </Card.Content>
                </Card>
            </Card.Group>
        )
    };

    const AddressTable = () => (
        <Table celled striped>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell colSpan='3'>赛凡通证</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                <Table.Row>
                    <Table.Cell collapsing>
                        <Icon name='address book outline' /> 地址
                    </Table.Cell>
                    <Table.Cell>{address}</Table.Cell>
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
                    <Table.Cell>{publicKey}</Table.Cell>
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
    );


    return (
        <div>
            {!hasAddress && !mnemonic && !address &&
                <div style={{ paddingTop: 1 + 'em' }}>
                    <Container fluid>
                        <Header as='h2'>您还没有赛凡链钱包， 现在来生成吧！</Header>
                        <p>
                            数字钱包是区块链的重要工具，它对您在赛凡世界的虚拟资产进行守护与管理。赛凡链钱包是去中心化的链上钱包，为方便用户使用，将钱包地址和公钥托管于客户端。
                        </p>
                        <p>
                            为了进一步增强安全性，赛凡链上钱包采用密码对私钥做二次加密。钱包的加密和存储与您在赛凡官网上的账号不同，是在区块链底层进行加密与存储的。这也是为什么你使用钱包进行交易的时候，总需要进行授权，这背后其实涉及了钱包使用密码进行私钥解密，然后再使用私钥对交易进行签名等复杂的过程。
                        </p>
                    </Container>
                    <Message>
                        <Message.Header>请为您的钱包账户设置独立的名称和密码 </Message.Header>
                        <p>
                            为保障安全，链上钱包账户与您在网站的账户是分别独立设置的，链上钱包账户由链端认证。您在链上的关键性操作如存证、转移Token等，都需要输入钱包密码进行验证，所以请牢记此密码。
                        </p>
                        <Form>
                            <Form.Group widths='equal'>
                                <Form.Field
                                    id='form-input-name'
                                    control={Input}
                                    label='账户名称'
                                    name='name'
                                    placeholder='name'
                                    onChange={handleChange}
                                    error={validate_name}
                                />
                                <Form.Field
                                    id='form-input-password'
                                    control={Input}
                                    label='密码'
                                    name='password'
                                    placeholder='password'
                                    type='password'
                                    onChange={handleChange}
                                    error={validate_password}
                                />
                                <Form.Field
                                    id='form-input-password-repeat'
                                    control={Input}
                                    label='重复密码'
                                    name='password_repeat'
                                    placeholder='password'
                                    type='password'
                                    onChange={handleChange}
                                    error={validate_password_repeat}
                                />
                            </Form.Group>
                        </Form>
                    </Message>
                    <Button onClick={generateMnemonic} className={validated ? 'positive' : 'disabled'}>下一步：生成助记词</Button>
                </div >
            }
            {!hasAddress && mnemonic &&
                <MnemonicMessage />
            }

            {!hasAddress && address &&
                <KeypariMessage />
            }
            {hasAddress && address &&
                <Container fluid>
                    <AccountCard />
                    <AddressTable />
                </Container>
            }
            <ModalLogin />
        </div>
    )
}

export default function Address() {
    return <Main />
}
