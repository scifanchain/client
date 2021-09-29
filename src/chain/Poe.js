import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Grid, Message, Icon, Input, Menu, Segment } from 'semantic-ui-react';

import { useSubstrate } from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
// Polkadot-JS utilities for hashing data.
import { blake2AsHex } from '@polkadot/util-crypto';


export function Main(props) {
  // Establish an API to talk to our Substrate node.
  const { api } = useSubstrate();
  // Get the selected user from the `AccountSelector` component.
  const { accountPair, stage } = props;
  // React hooks for all the state variables we track.
  // Learn more at: https://reactjs.org/docs/hooks-intro.html
  const [status, setStatus] = useState('');
  const [digest, setDigest] = useState(stage.digest ? stage.digest : '');
  const [owner, setOwner] = useState('');
  const [block, setBlock] = useState(0);
  const [unlockError, setUnlockError] = useState(null);
  const [showModal, setShowModal] = useState(false)

  const [activeItem, setActiveItem] = useState('check')

  const activeCheck = () => {
    setActiveItem('check');
  }

  const passwordInput = useRef('');

  // 对内容进行hash，触发poe校验
  const handlePoE = () => {
    const allContent = {
      stage: stage,
      Submitter_address: accountPair.address,
    }
    const jsonContent = JSON.stringify(allContent)
    const hash = blake2AsHex(jsonContent, 256);
    console.log(hash);
    setDigest(hash);
    queryPoE();
    if (block === 0) {
      setActiveItem('unlock');
      document.getElementById('unlock-menu').disabled = '';
    }
  }

  const queryPoE = () => {
    let unsubscribe;

    // Polkadot-JS API query to the `proofs` storage item in our pallet.
    // This is a subscription, so it will always get the latest value,
    // even if it changes.
    console.log(digest);
    api.query.poe
      .proofs(digest, (result) => {
        // Our storage item returns a tuple, which is represented as an array.
        setOwner(result[0].toString());
        setBlock(result[1].toNumber());
        console.log(result[0]);
        console.log(result[1]);
      })
      .then((unsub) => {
        unsubscribe = unsub;
      });

    // This tells the React hook to update whenever the file digest changes
    // (when a new file is chosen), or when the storage subscription says the
    // value of the storage item has updated.
    return () => unsubscribe && unsubscribe();
  }

  // React hook to update the owner and block number information for a file.
  useEffect(() => {
    queryPoE();
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
      return setUnlockError('解锁失败，可能密码不正确，请重新尝试。');
    }
    setActiveItem('poe')
  }

  const PoEPanel = () => {
    return (
      <div>
        {digest && activeItem === 'check' &&
          <p>点击下面的Hash按钮，验证当前版本的内容是否已在链上存证。</p>
        }
        {!digest && activeItem === 'check' &&
          <p>当前版本的内容尚未存证。如果想在链上存证，请点击以下按钮Hash当前版本。</p>
        }
        {activeItem === 'check' &&
          <Button onClick={handlePoE}>Hash</Button>
        }
        {!isClaimed &&
          <div>
            <Message success
              icon='check circle'
              header='根据本篇内容生成的以下Hash已在链上存证。'
              content={digest}
            />
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
          </div>
        }
        {isClaimed && digest && activeItem === 'unlock' &&
          <div>
            <Message success
              icon='hashtag'
              header='根据本篇内容生成以下Hash，请解锁账号后，提交存证。'
              content={digest}
            />
            {accountPair.isLocked &&
              <Input type='password' placeholder='令牌密码...' action ref={passwordInput} onChange={getPassword}>
                <input />
                <Button type='submit' onClick={checkAccount}>解锁账号</Button>
              </Input>
            }
            {unlockError &&
              <Message compact size='mini' negative style={{ marginLeft: 1 + 'rem' }}>{unlockError}</Message>
            }
            {!unlockError && !accountPair.isLocked &&
              < Message compact size='mini' success style={{ marginLeft: 1 + 'rem' }}><Icon name='lock open' /> 账号已解锁。</Message>
            }
          </div>
        }
        {activeItem === 'unlock' && !digest &&
          <div>
            <p>请先验证存证状态，查看当前作品的Hash值。</p>
          </div>
        }
        {
          activeItem === 'poe' &&
          <Form success={!!digest && !isClaimed()} warning={isClaimed()}>
            <Form.Field>
              <p>点击以下按钮即可提交当前版本到链上进行存证。存证的Hash内容由作品的内容、创作者、创作时间、更新时间、历史版本等构成，具有唯一性。作品存证后，即可得到适当的通证奖励（主网上线后）。</p>
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
              </Button.Group>
            </Form.Field>
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
        }
      </div >
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
      <Grid>
        <Grid.Column width={3}>
          <Menu fluid vertical tabular>
            <Menu.Item
              name='存证状态'
              active={activeItem === 'check'}
              onClick={activeCheck}
            />
            <Menu.Item disabled
              id='unlock-menu'
              name='解锁账号'
              active={activeItem === 'unlock'}
              onClick={activeUnlok}
            />
            <Menu.Item
              name='上链存证' disabled
              active={activeItem === 'poe'}
              onClick={activePoE}
            />
            {!isClaimed && activeItem === 'revode' &&
              <Menu.Item
              name='撤消存证' disabled
                active={activeItem === 'revoke'}
                onClick={activeRevoke}
              />
            }
          </Menu>
        </Grid.Column>

        <Grid.Column stretched width={13}>
          <Segment>
            <PoEPanel />
          </Segment>
        </Grid.Column>
      </Grid>
    </Grid.Column>
  );
}

export default function Poe(props) {
  const { api } = useSubstrate();
  return (api.query.poe && api.query.poe.proofs
    ? <Main {...props} /> : null);
}