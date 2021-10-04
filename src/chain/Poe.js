import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [isBusy, setIsBusy] = useState(false);

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

  // 链上验证
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

  // 取消验证
  const cancelPoE = () => {
    setDigest('')
  }

  // We can say a file digest is claimed if the stored block number is not 0.
  function isClaimed() {
    return block !== 0;
  }

  // 获取密码
  function getPassword(e) {
    passwordInput.current = e.target.value;
  }

  // 解锁帐户
  const unlock = (
    () => {
      if (!accountPair || !accountPair.isLocked) {
        return;
      }
      setIsBusy(true);
      setTimeout(() => {
        try {
          accountPair.decodePkcs8(passwordInput.current);
          setUnlockError(null)
        } catch (error) {
          setIsBusy(false);
          console.log(error);
          return setUnlockError('解锁失败，请更换密码重新尝试。');
        }

        setIsBusy(false);
      }, 0);
    }
  );

  return (
    <Message>
      <p>
        通过加密之后的Hash(哈希)值来与链上存证数据比对，以查验当前内容是否在链上存证。
      </p>
      <Button onClick={queryPoE} color='teal'>验证Hash值</Button>
      {digest &&
        <Button onClick={cancelPoE}>取消验证</Button>
      }
      {digest && block === 0 &&
        <Message warning
          icon='sync'
          header='本版本的内容没有在链上存证。'
          content={digest}
        />
      }
      {block !== 0 && digest &&
        <Message success
          icon='check circle'
          header='本版本内容已在链上存证。'
          content={digest}
        />
      }

      {digest && isClaimed && accountPair.isLocked &&
        <div>
          <p>进行链上存证或撤消操作，需要用令牌密码解锁您的令牌（钱包）账号。<br />
            <span style={{ color: 'orange', fontSize: 1+ 'rem' }}>提醒：令牌密码是生成钱包时所设置的密码，与网站的登录密码不同。</span>
          </p>
          <Input type='password' placeholder='令牌密码...' onChange={getPassword} action>
            <input />
            <Button type='submit' onClick={unlock} loading={isBusy}>解锁令牌账号</Button>
          </Input>
          {unlockError &&
            <span style={{ marginLeft: 1 + 'rem', color: 'orange', fontSize: 1 + 'rem' }}><Icon name='stop circle' /> {unlockError}</span>
          }
        </div>
      }
      {!unlockError && !accountPair.isLocked &&
        <span style={{ color: 'green', fontSize: 1 + 'rem' }}><Icon name='lock open' /> 令牌账号已解锁。</span>
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

export default function Poe(props) {
  const { api } = useSubstrate();
  return (api.query.poe && api.query.poe.proofs
    ? <Main {...props} /> : null);
}