let {channel} = require('./create-channel.js');

let serverSystem = server._serverSystem;
let clientSystem = client._clientSystem;

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
