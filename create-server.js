let {channel} = require('./create-channel.js');

class FakeServerSystem{
	constructor(port){
		let that = this;
		this._port = port;
		this.eventDataMap = new Map();
		this.eventMap = new Map();
		this._port.onmessage = function(event){
			let {data} = event;
			let {eventIdentifier, eventData} = data;
			let eventCallback = that.eventMap.get(eventIdentifier);
			if(eventCallback !== undefined) {
				eventCallback(eventData);
			}
		}
	}
	createEventData(eventIdentifier){
		return this.eventDataMap.get(eventIdentifier);
	}
	broadcastEvent(eventIdentifier, eventData){
		this._port.postMessage({eventIdentifier, eventData});
		return true;
	}
	listenForEvent(eventIdentifier, eventCallback){
		this.eventMap.set(eventIdentifier, eventCallback);
		return true;
	}
	registerEventData(eventIdentifier, eventData){
		this.eventDataMap.set(eventIdentifier, eventData);
		return true;
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
		let serverSystem =  new FakeServerSystem(this._port);
		this._serverSystem = serverSystem;
		return serverSystem;
	}
}

global.server = new FakeServer(channel.port2);
