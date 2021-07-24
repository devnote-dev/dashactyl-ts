// This is NOT a usable code example, just testing

import { Dashactyl } from '../src';

const client = new Dashactyl('https://client.dynox.us/', 'some_api_key');

(async () => {
    console.log(await client.ping(), 'ms');

    const user = await client.users.fetch('622146791659405313');
    console.log(user.tag);
})();
