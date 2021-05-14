let {eventCenter} = require('./create-event-center.js');

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
		let eventData = this.eventDataMap.get(eventIdentifier);
		if(eventData === undefined) {
			return {data: {}};
		} else {
			return {data: eventData};
		}
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
		let clientSystem =  new FakeClientSystem(this._port);
		this._clientSystem = clientSystem;
		return clientSystem;
	}
}

global.client = new FakeClient(eventCenter.createPort());
