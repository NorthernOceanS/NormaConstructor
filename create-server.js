class FakeServerSystem{
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

class FakeServer{
	constructor(){
		// no-op
	}
	log(){
		// no-op
	}
	registerSystem(){
		return new FakeServerSystem();
	}
}

global.server = new FakeServer();
