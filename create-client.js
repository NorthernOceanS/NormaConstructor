let {channel} = require('./create-channel.js');

class FakeClientSystem{
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
