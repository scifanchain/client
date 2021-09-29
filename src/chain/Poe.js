import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Grid, Message, Icon, Input, Menu, Segment } from 'semantic-ui-react';

import { useSubstrate } from '../substrate-lib';
import { TxButton } from '../substrate-lib/components';
// Polkadot-JS utilities for hashing data.
import { blake2AsHex } from '@polkadot/util-crypto';

import { put } from '../utils/Request';


export function Main(props) {
  // Establish an API to talk to our Substrate node.
  const { api } = useSubstrate();
  // Get the selected user from the `AccountSelector` component.
  const { accountPair, stage } = props;
  // React hooks for all the state variables we track.
  // Learn more at: https://reactjs.org/docs/hooks-intro.html
  const [status, setStatus] = useState('');
  const [digestOld, setDigestOld] = useState(stage.digest ? stage.digest : '');
  const [digest, setDigest] = useState('');
  const [owner, setOwner] = useState('');
  const [block, setBlock] = useState(0);
  const [unlockError, setUnlockError] = useState(null);
  const [showModal, setShowModal] = useState(false)

  const passwordInput = useRef('');


  // 哈希内容
  const HashStage = (address, stage) => {
    const allContent = {
      Submitter_address: address,
      stage: stage,
    }
    const jsonContent = JSON.stringify(allContent)
    const hash = blake2AsHex(jsonContent, 256);
    setDigest(hash);
  }


  // 链上查询
  const queryPoE = () => {
    let unsubscribe;

    // Polkadot-JS API query to the `proofs` storage item in our pallet.
    // This is a subscription, so it will always get the latest value,
    // even if it changes.
    api.query.poe
      .proofs(digest, (result) => {
        // Our storage item returns a tuple, which is represented as an array.
        console.log(digest);
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
    HashStage(accountPair.address, stage)
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
  }


  const PoEPanel = () => {
    return (
      <Message>
        <Message.Header>版本内容的存证状态</Message.Header>
        {digestOld &&
          <p>{digestOld}</p>
        }
        {!digestOld &&
          <p>之前的Hash值：{digestOld ? digestOld : '无'}</p>
        }
        <Button onClick={queryPoE}>Hash</Button>
        {digest &&
          <p>当前的Hash值：{digest}</p>
        }

        <div>
          {isClaimed &&
            <Message success
              icon='check circle'
              header='本篇内容已在链上存证。'
              content={digest}
            />
          }
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
          <TxButton
            color={''}
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

        </div>

      </Message>
    )
  }


  const PoEPanel2 = () => {
    return (
      <div>
        {digest && activeItem === 'check' &&
          <p>点击下面的Hash按钮，验证当前版本的内容是否已在链上存证。</p>
        }
        {!digest && activeItem === 'check' && !isClaimed &&
          <p>当前版本的内容尚未存证。如果想在链上存证，请点击以下按钮Hash当前版本。</p>
        }
        {activeItem === 'check' && !isClaimed &&
          <Button onClick={handlePoE}>Hash</Button>
        }
        {isClaimed &&
          <div>
            <Message success
              icon='check circle'
              header='本篇内容已在链上存证。'
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
            <div>本版本内容尚未存证。已根据现有内容生成以下Hash，请解锁账号后提交存证。</div>
            <p style={{ color: 'Orange' }}>{digest}</p>
            {accountPair.isLocked &&
              <Input type='password' placeholder='令牌密码...' action ref={passwordInput} onChange={getPassword}>
                <input />
                <Button type='submit' onClick={checkAccount}>解锁账号</Button>
              </Input>
            }
            {unlockError &&
              <span style={{ marginLeft: 1 + 'rem', color: 'red' }}>{unlockError}</span>
            }
            {!unlockError && !accountPair.isLocked &&
              <span style={{ marginLeft: 1 + 'rem', color: 'green' }}><Icon name='lock open' /> 账号已解锁。</span>
            }
          </div>
        }
        {activeItem === 'poe' &&
          <Form success={!!digest && !isClaimed()} warning={isClaimed()}>
            <Form.Field>
              <p>点击以下按钮即可提交当前版本到链上进行存证。存证的Hash内容由作品的内容、创作者、创作时间、更新时间、历史版本等构成，具有唯一性。作品存证后，即可得到适当的通证奖励（主网上线后）。</p>
              <Button.Group>
                <TxButton
                  color={''}
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

  // The actual UI elements which are returned from our component.
  return (
    <PoEPanel />
  );
}

export default function Poe(props) {
  const { api } = useSubstrate();
  return (api.query.poe && api.query.poe.proofs
    ? <Main {...props} /> : null);
}