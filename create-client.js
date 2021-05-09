let {channel} = require('./create-channel.js');

class FakeClientSystem{
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

class FakeClient{
	constructor(port){
		this._port = port;
	}
	log(){
		// no-op
	}
	registerSystem(){
		return new FakeClientSystem(this._port);
	}
}

global.client = new FakeClient(channel.port1);
