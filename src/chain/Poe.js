import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Message, Icon, Input, Loader, } from 'semantic-ui-react';

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
  const [digest, setDigest] = useState('');
  const [owner, setOwner] = useState('');
  const [block, setBlock] = useState(0);
  const [unlockError, setUnlockError] = useState(null);

  const passwordInput = useRef('');


  // 哈希内容
  const hashStage = (address, stage) => {
    const allContent = {
      Submitter_address: address,
      stage: stage,
    }
    const jsonContent = JSON.stringify(allContent)
    const hash = blake2AsHex(jsonContent, 256);
    setDigest(hash);
    return hash;
  }


  // 链上查询
  const queryPoE = () => {
    const hash = hashStage(accountPair.address, stage);

    let unsubscribe;

    // Polkadot-JS API query to the `proofs` storage item in our pallet.
    // This is a subscription, so it will always get the latest value,
    // even if it changes.
    api.query.poe
      .proofs(hash, (result) => {
        // Our storage item returns a tuple, which is represented as an array.
        setOwner(result[0].toString());
        setBlock(result[1].toNumber());
        console.log(result[0].toString());
        console.log(result[1].toNumber());
      })
      .then((unsub) => {
        unsubscribe = unsub;
      });

    // This tells the React hook to update whenever the file digest changes
    // (when a new file is chosen), or when the storage subscription says the
    // value of the storage item has updated.
    return () => unsubscribe && unsubscribe();
  }

  // We can say a file digest is claimed if the stored block number is not 0.
  function isClaimed() {
    return block !== 0;
  }

  function getPassword(e) {
    passwordInput.current = e.target.value
  }

  function checkAccount(e) {
    try {
      accountPair.decodePkcs8(passwordInput.current);
      setUnlockError(null)
    } catch (error) {
      console.log(error);
      setUnlockError('解锁失败，请更换密码重新尝试。');
    }
    finally {
      console.log("completed");
    }
  }

  const PoEPanel = () => {
    return (
      <Message>
        <Message.Header>查验内容存证状态</Message.Header>
        <p>
          通过加密之后的Hash(哈希)值来与链上存证数据比对，以查验当前内容是否在链上存证。
        </p>
        <Button onClick={queryPoE}>Hash</Button>
        {digest && block === 0 &&
          <Message warning
            icon='sync'
            header='本内容没有在链上存证。'
            content={digest}
          />
        }
        {block !== 0 &&
          <Message success
            icon='check circle'
            header='本内容已在链上存证。'
            content={digest}
          />
        }

        {digest && isClaimed && accountPair.isLocked &&
          <div>
            <p>进行链上存证或撤消操作，需要解锁您的令牌（钱包）账号。</p>
            <Input type='password' placeholder='令牌密码...' action ref={passwordInput} onChange={getPassword}>
              <input />
              <Button type='submit' onClick={checkAccount}>解锁钱包账号</Button>
          </Input>
          {unlockError &&
            <span style={{ marginLeft: 1 + 'rem', color: 'orange' }}><Icon name='lock' /> {unlockError}</span>
          }
          </div>
        }
        {!unlockError && !accountPair.isLocked &&
          <span style={{ color: 'green' }}><Icon name='lock open' /> 钱包账号已解锁。</span>
        }
        {!accountPair.isLocked &&
          <div style={{ marginTop: 1 + 'rem' }}>
            <TxButton
              accountPair={accountPair}
              color={'teal'}
              label='撤消存证'
              setStatus={setStatus}
              type='SIGNED-TX'
              disabled={!isClaimed()}
              attrs={{
                palletRpc: 'poe',
                callable: 'revokeProof',
                inputParams: [digest],
                paramFields: [true]
              }}
            />
            <TxButton
              color={'teal'}
              accountPair={accountPair}
              label={'提交存证'}
              setStatus={setStatus}
              type='SIGNED-TX'
              disabled={isClaimed()}
              attrs={{
                palletRpc: 'poe',
                callable: 'createProof',
                inputParams: [digest],
                paramFields: [true]
              }}
            />
          </div>
        }
        {status &&
          <Message positive>
            <Message.Header></Message.Header>
            <p>
              {status}
            </p>
          </Message>
        }
      </Message>
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