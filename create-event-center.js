class FakeEventCenter{
	constructor(){
		this.ports = []
	}
	createPort(){
		let port = new FakePort(this);
		this.ports.push(port);
		return port;
	}
	broadcastMessage(data){
		for(let port of this.ports) {
			setTimeout(()=> port.onmessage({data}), 0);
		}
	}
}

class FakePort{
	constructor(eventCenter){
		this._eventCenter = eventCenter;
	}
	postMessage(data){
		this._eventCenter.broadcastMessage(data);
	}
}

let eventCenter = new FakeEventCenter();

exports.eventCenter = eventCenter;
