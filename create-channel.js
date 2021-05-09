class FakeChannel{
	constructor(){
		this.port1 = new FakePort(null);
		this.port2 = new FakePort(this.port1);
		this.port1.setOpposite(this.port2);
	}
}

class FakePort{
	constructor(opposite){
		this._opposite = opposite;
	}
	setOpposite(opposite){
		this._opposite = opposite;
	}
	postMessage(data){
		let that = this;
		let event = {};
		event.data = data;
		setTimeout(()=> that._opposite.onmessage(event), 0);
	}
}

let channel = new FakeChannel();

exports.channel = channel;
