import React, { useEffect, useState } from 'react';
import { Container, Table, Grid, Header } from 'semantic-ui-react';
import moment from 'moment';

import { mnemonicGenerate } from '@polkadot/util-crypto';
import keyring from '@polkadot/ui-keyring';

import {get, post} from '../utils/Request'


function Main() {
  // 同步用户状态

  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState({})

  const [account, setAccount] = useState('')

  useEffect(() => {
    // 创建pair
    const mnemonic = mnemonicGenerate();
    const pair = keyring.createFromUri(mnemonic, { name: state.username });
    const chain_account = keyring.saveAccount(pair, state.password);
    console.log(chain_account)


    axios({
      method: 'get',
      url: 'https://api.scifanchain.com/authors/me/',
    }).then(response => {
      setLoading(false)
      setAuthor(response.data)

      keyring.loadAll({ ss58Format: 42, type: 'sr25519' });
      setAccount(keyring.getAccount(response.data.chain_address))

      console.log(keyring.getAccount(response.data.chain_address))

      // console.log(response.data.refresh_token)
      // console.log(response.data)
    }).catch(err => {
      setLoading(false)
      console.log(err)
    });
  }, [])

  
  return (
    <Container>
      <Grid>
        <Grid.Column>
          <Header as='h3' textAlign='center' color='violet' attached='top'>钱包地址</Header>
          <Table celled striped size='small' attached>
            <Table.Body>
              <Table.Row>
                <Table.Cell width={2} textAlign='right'>
                  <strong>用户名</strong>
                </Table.Cell>
                <Table.Cell width={4}>
                  <strong>{author.username}</strong>
                </Table.Cell>

              </Table.Row>
              {mnemonic &&
                <Table.Row>
                  <Table.Cell width={2} textAlign='right'>
                    <strong>助记词</strong>
                  </Table.Cell>
                  <Table.Cell width={4}>
                    <strong>{mnemonic}</strong>
                  </Table.Cell>
                  <Table.Cell width={4}>
                    <strong>助记词是您地址丢失后重要的找回信息，请立即复制保存！本系统不会保留您的助记词。</strong>
                  </Table.Cell>
                </Table.Row>
              }
              <Table.Row>
                <Table.Cell width={2} textAlign='right'>
                  <strong>公钥</strong>
                </Table.Cell>
                <Table.Cell width={4}>
                  <strong>{account.publicKey}</strong>
                </Table.Cell>

              </Table.Row>
              <Table.Row>
                <Table.Cell width={2} textAlign='right'>
                  <strong>钱包地址</strong>
                </Table.Cell>
                <Table.Cell width={4}>
                  <strong>{author.chain_address}</strong>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Grid.Column>
      </Grid>
    </Container>
  )
}

export default Main;


