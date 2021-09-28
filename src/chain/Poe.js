import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Grid, Message, Modal, Input, Menu, Segment } from 'semantic-ui-react';

import { useSubstrate } from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
// Polkadot-JS utilities for hashing data.
import { blake2AsHex } from '@polkadot/util-crypto';


export function Main(props) {
  // Establish an API to talk to our Substrate node.
  const { api } = useSubstrate();
  // Get the selected user from the `AccountSelector` component.
  const { accountPair } = props;
  // React hooks for all the state variables we track.
  // Learn more at: https://reactjs.org/docs/hooks-intro.html
  const [status, setStatus] = useState('');
  const [digest, setDigest] = useState('');
  const [owner, setOwner] = useState('');
  const [block, setBlock] = useState(0);
  const [unlockError, setUnlockError] = useState(null);
  const [showModal, setShowModal] = useState(false)

  const passwordInput = useRef('');

  // 对内容进行hash，触发poe校验
  const handlePoE = () => {
    let stageTitle = document.getElementById('stageTitle').innerHTML;
    let stageContent = document.getElementById('editorjs').innerHTML;
    const allContent = {
      title: stageTitle,
      Submitter_address: accountPair.address,
      content: stageContent
    }
    const jsonContent = JSON.stringify(allContent)
    const hash = blake2AsHex(jsonContent, 256);
    console.log(hash)
    setDigest(hash);
  }

  // React hook to update the owner and block number information for a file.
  useEffect(() => {
    let unsubscribe;

    // Polkadot-JS API query to the `proofs` storage item in our pallet.
    // This is a subscription, so it will always get the latest value,
    // even if it changes.
    api.query.poe
      .proofs(digest, (result) => {
        // Our storage item returns a tuple, which is represented as an array.
        setOwner(result[0].toString());
        setBlock(result[1].toNumber());
      })
      .then((unsub) => {
        unsubscribe = unsub;
      });

    return () => unsubscribe && unsubscribe();
    // This tells the React hook to update whenever the file digest changes
    // (when a new file is chosen), or when the storage subscription says the
    // value of the storage item has updated.
  }, [digest, api.query.templateModule]);

  // We can say a file digest is claimed if the stored block number is not 0.
  function isClaimed() {
    return block !== 0;
  }

  function getPassword(e) {
    passwordInput.current = e.target.value
  }

  function checkAccount() {
    if (!accountPair || !accountPair.isLocked) {
      return;
    }

    try {
      accountPair.decodePkcs8(passwordInput.current);
      setUnlockError(null)
    } catch (error) {
      console.log(error);
      return setUnlockError('解锁失败，可能密码不正确或遇到网络故章，请重新尝试。');
    }

  }

  function exampleReducer(state, action) {
    switch (action.type) {
      case 'OPEN_MODAL':
        return { open: true, dimmer: action.dimmer }
      case 'CLOSE_MODAL':
        return { open: false }
      case 'UNLOCK_AND_SIGN':
        checkAccount();
        return { open: false }
      default:
        throw new Error()
    }
  }

  function ModalUnlock() {
    const [state, dispatch] = React.useReducer(exampleReducer, {
      open: false,
      dimmer: undefined,
    })
    const { open, dimmer } = state

    return (
      <div>
        {/* <Button onClick={() => dispatch({ type: 'OPEN_MODAL', dimmer: 'blurring' })}>
          解锁
        </Button> */}
        <Modal
          size='tiny'
          dimmer={dimmer}
          open={open}
          onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
        >
          <Modal.Header>解锁你的账号</Modal.Header>
          <Modal.Content>
            <p>您需要解锁账号，才能向赛凡链签署存证数据。链上钱包密码与登录赛凡官网的密码不同。</p>
            <Input fluid placeholder='请输入链上钱包密码' type='password' ref={passwordInput} onChange={getPassword} />
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={() => dispatch({ type: 'CLOSE_MODAL' })}>
              返回
            </Button>
            <Button positive onClick={() => dispatch({ type: 'UNLOCK_AND_SIGN' })}>
              解锁账号并签署存证
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    )
  }


  const [activeItem, setActiveItem] = useState('check')

  const activeCheck = () => {
    setActiveItem('check');
  }

  const CheckPanel = () => {
    return (
      <div>
        <p>点击下面的Hash按钮，可以比对本篇内容的是否有在链上存证，或在存证之后是否有新的改动。</p>
        <Button onClick={handlePoE}>Hash</Button>
        {!isClaimed &&
          <Message success
            icon='check circle'
            header='根据本篇内容生成的以下Hash已在链上存证'
            content={digest}
          />
        }
        {isClaimed &&
          <p>尚未存证</p>
        }
      </div>
    )
  }

  const activeUnlok = () => {
    setActiveItem('unlock');
  }

  const activePoE = () => {
    setActiveItem('poe');
  }

  const activeRevoke = () => {
    setActiveItem('revoke');
  }

  // The actual UI elements which are returned from our component.
  return (
    <Grid.Column>
      {/* <Button.Group>
        <Button color='violet' onClick={handlePoE}>验证</Button>
      </Button.Group> */}

      <Grid>
        <Grid.Column width={3}>
          <Menu fluid vertical tabular>
            <Menu.Item
              name='存证状态'
              active={activeItem === 'check'}
              onClick={activeCheck}
            />
            <Menu.Item
              name='解锁账号'
              active={activeItem === 'unlock'}
              onClick={activeUnlok}
            />
            <Menu.Item
              name='上链存证'
              active={activeItem === 'poe'}
              onClick={activePoE}
            />
            <Menu.Item
              name='撤消存证'
              active={activeItem === 'revoke'}
              onClick={activeRevoke}
            />
          </Menu>
        </Grid.Column>

        <Grid.Column stretched width={13}>
          <Segment>
            <CheckPanel />
          </Segment>
        </Grid.Column>
      </Grid>

      {accountPair.isLocked &&
        <ModalUnlock />
      }

      <Form success={!!digest && !isClaimed()} warning={isClaimed()}>
        {/* Buttons for interacting with the component. */}
        {!accountPair &&
          <Form.Field>
            {/* Button to create a claim. Only active if a file is selected,
          and not already claimed. Updates the `status`. */}
            <Button.Group>
              <TxButton
                accountPair={accountPair}
                label={'提交存证'}
                setStatus={setStatus}
                type='SIGNED-TX'
                disabled={isClaimed() || !digest}
                attrs={{
                  palletRpc: 'poe',
                  callable: 'createProof',
                  inputParams: [digest],
                  paramFields: [true]
                }}
              />
              {/* Button to revoke a claim. Only active if a file is selected,
          and is already claimed. Updates the `status`. */}
              <TxButton
                accountPair={accountPair}
                label='撤消存证'
                setStatus={setStatus}
                type='SIGNED-TX'
                disabled={!isClaimed() || owner !== accountPair.address}
                attrs={{
                  palletRpc: 'poe',
                  callable: 'revokeProof',
                  inputParams: [digest],
                  paramFields: [true]
                }}
              />
            </Button.Group>
          </Form.Field>
        }

        {/* Status message about the transaction. */}
        {status &&
          <Message positive>
            <Message.Header></Message.Header>
            <p>
              {status}
            </p>
          </Message>
        }

      </Form>

      {unlockError &&
        <Message>{unlockError}</Message>
      }
    </Grid.Column>
  );
}

export default function Poe(props) {
  const { api } = useSubstrate();
  return (api.query.poe && api.query.poe.proofs
    ? <Main {...props} /> : null);
}