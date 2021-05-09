let {channel} = require('./create-channel.js');

class FakeServerSystem{
	constructor(port){
		this._port = port;
	}
	createEventData(){
		// no-op
	}
	broadcastEvent(){
		// no-op
	}
	listenForEvent(){
		// no-op
	}
}

class FakeServer{
	constructor(port){
		this._port = port;
	}
	log(){
		// no-op
	}
	registerSystem(){
		return new FakeServerSystem(this._port);
	}
}

global.server = new FakeServer(channel.port2);
