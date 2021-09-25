import React, { useState, createRef } from 'react';
import { Container, Dimmer, Loader, Grid, Sticky, Message } from 'semantic-ui-react';

import { SubstrateContextProvider, useSubstrate } from '../substrate-lib';
import { DeveloperConsole } from '../substrate-lib/components';

import Account from './Account';

function Main() {
    const [accountAddress, setAccountAddress] = useState(null);
    const { apiState, keyring, keyringState, apiError } = useSubstrate();

    const accountPair =
        accountAddress &&
        keyringState === 'READY' &&
        keyring.getPair(accountAddress);

    const loader = text =>
        <Dimmer active inverted>
            <Loader size='small'>{text}</Loader>
        </Dimmer>;

    const message = err =>
        <Grid centered columns={2} padded>
            <Grid.Column>
                <Message negative compact floating
                    header='Error Connecting to Substrate'
                    content={`${JSON.stringify(err, null, 4)}`}
                />
            </Grid.Column>
        </Grid>;

    if (apiState === 'ERROR') return message(apiError);
    else if (apiState !== 'READY') return loader('正在获取链端数据……');

    if (keyringState !== 'READY') {
        return loader('正在加载账户(please review any extension\'s authorization)');
    }

    const contextRef = createRef();

    return (
        <div ref={contextRef}>
            <Account/>
            <DeveloperConsole />
        </div>
    );
}

export default function Wallet() {
    return (
        <SubstrateContextProvider>
            <Main />
        </SubstrateContextProvider>
    );
}
