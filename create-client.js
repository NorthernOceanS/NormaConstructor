class FakeClientSystem{
	constructor(){
		// no-op
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
	constructor(){
		// no-op
	}
	log(){
		// no-op
	}
	registerSystem(){
		return new FakeClientSystem();
	}
}

global.client = new FakeClient();
