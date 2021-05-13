let {channel} = require('./create-channel.js');

let serverSystem = server._serverSystem;
let clientSystem = client._clientSystem;

function TimeoutPromise(ms) {
	return new Promise((reslove, reject) => {
		setTimeout(()=>{reslove()}, ms);
	});
}

(async function(){
	serverSystem.initialize();
	clientSystem.initialize();
	await TimeoutPromise(0)
	channel.port2.postMessage({
		eventIdentifier: "minecraft:client_entered_world",
		eventData: {data: {player:{__unique_id__: 1}}}
	});
	await TimeoutPromise(0);
	for(let i = 0; i < 20; i++) {
		let wait = TimeoutPromise(1000/20);
		serverSystem.update && serverSystem.update();
		clientSystem.update && clientSystem.update();
		await wait;
	}
	await TimeoutPromise(0);
	clientSystem.shutdown && clientSystem.shutdown();
	serverSystem.shutdown && serverSystem.shutdown();
})();
