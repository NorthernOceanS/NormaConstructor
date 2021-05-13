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
channel.port2.postMessage({
	eventIdentifier: "minecraft:client_entered_world",
	eventData: {data: {player:{__unique_id__: 1}}}
});
//serverSystem.update();
//clientSystem.update();
clientSystem.shutdown();
serverSystem.shutdown();
})();
