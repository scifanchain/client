import React, { useState, useEffect } from 'react';
import { Container, Dimmer, Loader, Grid, Card, Image, Button, Sticky, Message } from 'semantic-ui-react';

import { useSubstrate } from '../substrate-lib';

function Main() {
    const { api } = useSubstrate();

    const [myBalance, setMyBalance] = useState(0)
    const [myNonce, setMyNonce] = useState(0)

    useEffect(() => {
        const get_balance = async () => {
            // Retrieve the last timestamp
            const now = await api.query.timestamp.now();
            const address = '5EpmugXyBqwbW1e9wEByBtJtAcyMjxgZvbR3pZbjix6ngGzo';
            // Retrieve the account balance & nonce via the system module
            const { nonce, data: balance } = await api.query.system.account(address);
            // setMyBalance(balance.free)
            // setMyNonce(nonce)

            console.log(`${now}: balance of ${balance.free} and a nonce of ${nonce}`);

            const a = JSON.stringify({ balance, nonce })
            console.log(a)

            // Do something
            console.log(api.genesisHash.toHex());

            return a
            
        };
        get_balance().then((res) => {
            console.log(res);
            const b = JSON.parse(res)
            console.log(parseInt(b.nonce))
            setMyBalance(b.balance.free)
            setMyNonce(parseInt(b.nonce))
            console.log("complate");
        });
    }, [myBalance, myNonce]);

    return (
        <Card.Group>
            <Card>
                <Card.Content>
                    <Image
                        floated='right'
                        size='mini'
                        src='/images/avatar/large/steve.jpg'
                    />
                    <Card.Header>账户余额</Card.Header>
                    <Card.Meta>{myBalance}</Card.Meta>
                    <Card.Description>
                        Steve wants to add you to the group <strong>best friends</strong>
                    </Card.Description>
                </Card.Content>
                <Card.Content extra>
                    <div className='ui two buttons'>
                        <Button basic color='green'>
                            Approve
                        </Button>
                        <Button basic color='red'>
                            Decline
                        </Button>
                    </div>
                </Card.Content>
            </Card>
            <Card>
                <Card.Content>
                    <Image
                        floated='right'
                        size='mini'
                        src='/images/avatar/large/molly.png'
                    />
                    <Card.Header>交易次数</Card.Header>
                    <Card.Meta>{myNonce}</Card.Meta>
                    <Card.Description>
                        Molly wants to add you to the group <strong>musicians</strong>
                    </Card.Description>
                </Card.Content>
                <Card.Content extra>
                    <div className='ui two buttons'>
                        <Button basic color='green'>
                            Approve
                        </Button>
                        <Button basic color='red'>
                            Decline
                        </Button>
                    </div>
                </Card.Content>
            </Card>
            <Card>
                <Card.Content>
                    <Image
                        floated='right'
                        size='mini'
                        src='/images/avatar/large/jenny.jpg'
                    />
                    <Card.Header>Jenny Lawrence</Card.Header>
                    <Card.Meta>New User</Card.Meta>
                    <Card.Description>
                        Jenny requested permission to view your contact details
                    </Card.Description>
                </Card.Content>
                <Card.Content extra>
                    <div className='ui two buttons'>
                        <Button basic color='green'>
                            Approve
                        </Button>
                        <Button basic color='red'>
                            Decline
                        </Button>
                    </div>
                </Card.Content>
            </Card>
        </Card.Group>
    );
}

export default function Balance(props) {
    const { api } = useSubstrate();
    return api.rpc && api.rpc.state && api.rpc.state.getMetadata
        ? <Main {...props} />
        : null;
}
