export class Coupon {
    public code: string;
    public coins: number;
    public ram: number;
    public disk: number;
    public cpu: number;
    public servers: number;

    constructor(data: object) {
        this.code = data['code'];
        this.coins = data['coins'];
        this.ram = data['ram'];
        this.disk = data['disk'];
        this.cpu = data['cpu']
        this.servers = data['servers'];
    }
}
