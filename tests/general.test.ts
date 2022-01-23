// This is NOT a usable code example, just testing

import Client from '../src/client';

const client = new Client('https://some.good.host', 'some_api_key');

client.users.fetch(5).then(console.log);
