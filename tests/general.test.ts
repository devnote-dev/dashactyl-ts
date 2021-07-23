import { Dashactyl } from '../src';

const client = new Dashactyl('https://dynox.us/', '<fake_api_key>');

(async () => console.log(client.ping()))();
