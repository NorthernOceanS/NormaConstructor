import system from '../system.js';
import '../plugin/index.js';
import { emptyPlatform, Coordinate, Position, BlockType, Direction, Block } from 'norma-core';

import { utils } from '../utils.js'

emptyPlatform.use(system);
const platform = {
    use: function (system) {
        var serverSystem = server.registerSystem(0, 0);
        this.init(serverSystem, system)
    },
    init: function (serverSystem, system) {
        system.inject(platform);
        serverSystem.initialize = function () {
            const scriptLoggerConfig = serverSystem.createEventData("minecraft:script_logger_config");
            scriptLoggerConfig.data.log_errors = true;
            scriptLoggerConfig.data.log_information = true;
            scriptLoggerConfig.data.log_warnings = true;
            serverSystem.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);

            let compiler = {
                raw: function (blockArray) {
                    return blockArray
                },
                clone: function ({ startCoordinate, endCoordinate, targetCoordinate }) {
                    if (startCoordinate.x >= endCoordinate.x) {
                        let temp = startCoordinate.x
                        startCoordinate.x = endCoordinate.x
                        endCoordinate.x = temp
                    }
                    if (startCoordinate.y >= endCoordinate.y) {
                        let temp = startCoordinate.y
                        startCoordinate.y = endCoordinate.y
                        endCoordinate.y = temp
                    }
                    if (startCoordinate.z >= endCoordinate.z) {
                        let temp = startCoordinate.z
                        startCoordinate.z = endCoordinate.z
                        endCoordinate.z = temp
                    }
                    for (let x = startCoordinate.x; x <= endCoordinate.x; x += 32)
                        for (let y = startCoordinate.y; y <= endCoordinate.y; y += 32)
                            for (let z = startCoordinate.z; z <= endCoordinate.z; z += 32)
                                serverSystem.executeCommand(`/clone ${x} ${y} ${z} 
                        ${Math.min(x + 31, endCoordinate.x)} 
                        ${Math.min(y + 31, endCoordinate.y)} 
                        ${Math.min(z + 31, endCoordinate.z)} 
                        ${targetCoordinate.x + x - startCoordinate.x} 
                        ${targetCoordinate.y + y - startCoordinate.y} 
                        ${targetCoordinate.z + z - startCoordinate.z} 
                        masked force`, (commandResultData) => { });

                    return []
                },
                fill: function ({ blockType, startCoordinate, endCoordinate }) {

                    if (startCoordinate.x >= endCoordinate.x) {
                        let temp = startCoordinate.x
                        startCoordinate.x = endCoordinate.x
                        endCoordinate.x = temp
                    }
                    if (startCoordinate.y >= endCoordinate.y) {
                        let temp = startCoordinate.y
                        startCoordinate.y = endCoordinate.y
                        endCoordinate.y = temp
                    }
                    if (startCoordinate.z >= endCoordinate.z) {
                        let temp = startCoordinate.z
                        startCoordinate.z = endCoordinate.z
                        endCoordinate.z = temp
                    }

                    //Bypass the restriction of 32767 blocks
                    for (let x = startCoordinate.x; x <= endCoordinate.x; x += 32)
                        for (let y = startCoordinate.y; y <= endCoordinate.y; y += 32)
                            for (let z = startCoordinate.z; z <= endCoordinate.z; z += 32)
                                serverSystem.executeCommand(`/fill ${x} ${y} ${z} 
                        ${Math.min(x + 31, endCoordinate.x)} 
                        ${Math.min(y + 31, endCoordinate.y)} 
                        ${Math.min(z + 31, endCoordinate.z)} 
                        ${blockType.blockIdentifier.slice(blockType.blockIdentifier.indexOf(":") + 1)} 
                        [${blockType.blockState == null ? "" : JSON.stringify(blockType.blockState).slice(1, -1)}] replace`, (commandResultData) => { }
                                );

                    return []
                },
                writeBuildingStructureToLog: function ({ startCoordinate, endCoordinate, referenceCoordinate, tickingArea }) {
                    if (startCoordinate.x >= endCoordinate.x) [startCoordinate.x, endCoordinate.x] = [endCoordinate.x, startCoordinate.x]
                    if (startCoordinate.y >= endCoordinate.y) [startCoordinate.y, endCoordinate.y] = [endCoordinate.y, startCoordinate.y]
                    if (startCoordinate.z >= endCoordinate.z) [startCoordinate.z, endCoordinate.z] = [endCoordinate.z, startCoordinate.z]
                    for (let x = startCoordinate.x; x <= endCoordinate.x; x++)
                        for (let y = startCoordinate.y; y <= endCoordinate.y; y++)
                            for (let z = startCoordinate.z; z <= endCoordinate.z; z++) {
                                let blockType = new BlockType(undefined, undefined)
                                let block = serverSystem.getBlock(tickingArea, new Coordinate(x, y, z))
                                blockType.blockIdentifier = block.__identifier__
                                blockType.blockState = serverSystem.getComponent(block, "minecraft:blockstate").data
                                server.log(JSON.stringify({ coordinate: new Coordinate(x - referenceCoordinate.x, y - referenceCoordinate.y, z - referenceCoordinate.z), blockType: blockType }, null, '    '))
                            }
                    return []
                }
            }

            serverSystem.registerEventData("NormaConstructor:displayChatToClient", {
                message: undefined,
                playerID: undefined
            })

            serverSystem.registerEventData("NormaConstructor:command", {
                command: undefined,
                additionalData: {
                    direction: new Direction(undefined, undefined),
                    tickingArea: undefined,
                    playerRequest: {
                        "position": false,
                        "direction": false,
                        "blockType": false
                    }
                },
                playerID: undefined
            })
            serverSystem.registerEventData("NormaConstructor:serveData", {
                blockType: undefined,
                position: undefined,
                direction: undefined,
                playerID: undefined
            })

            serverSystem.registerEventData("NZConstructor:blockFetchResponse", {
                blockType: undefined,
                playerID: undefined,
                requestID: undefined
            })

            serverSystem.registerEventData("NormaConstructor:ExecutionRequest", { playerID: undefined })


            serverSystem.listenForEvent("NormaConstructor:setServerSideOption", (eventData) => {
                if (!system.hasUser(eventData.data.playerID)) {
                    system.createUser(eventData.data.playerID);
                }
                let user = system.getUser(eventData.data.playerID)
                user.session[eventData.data.option.key] = eventData.data.option.value
            })
            serverSystem.listenForEvent("minecraft:player_placed_block", (eventData) => {
                //TODO: Break down the parameter.
                function getBlockType(eventData) {
                    let blockType = new BlockType(undefined, undefined)

                    let tickingArea = serverSystem.getComponent(eventData.data.player, "minecraft:tick_world").data.ticking_area
                    let block = serverSystem.getBlock(tickingArea, eventData.data.block_position)
                    blockType.blockIdentifier = block.__identifier__
                    blockType.blockState = serverSystem.getComponent(block, "minecraft:blockstate").data

                    return blockType

                }
                function getPosition(eventData) {
                    let position = new Position(
                        new Coordinate(undefined, undefined, undefined),
                        undefined
                    )

                    position.coordinate = eventData.data.block_position
                    position.tickingArea = serverSystem.getComponent(eventData.data.player, "minecraft:tick_world").data.ticking_area

                    return position
                }
                function getDirection(eventData) {
                    let direction = new Direction(undefined, undefined)
                    direction = serverSystem.getComponent(eventData.data.player, "minecraft:rotation").data
                    return direction
                }
                let serveDataEventData = serverSystem.createEventData("NormaConstructor:serveData")
                serveDataEventData.data.blockType = getBlockType(eventData)
                let playerID = utils.misc.generatePlayerIDFromUniqueID(eventData.data.player.__unique_id__)
                let user = system.getUser(playerID)
                if (user.session["__requestAdditionalPosition"]) serveDataEventData.data.position = getPosition(eventData)
                if (user.session["__requestAdditionalDirection"]) serveDataEventData.data.direction = getDirection(eventData)
                serveDataEventData.data.playerID = playerID
                serverSystem.broadcastEvent("NormaConstructor:serveData", serveDataEventData)
            })
            serverSystem.listenForEvent("NormaConstructor:queryBlockType", (eventData) => {
                let blockType = new BlockType(undefined, undefined)
                let block = serverSystem.getBlock(eventData.data.position.tickingArea, eventData.data.position.coordinate)
                blockType.blockIdentifier = block.__identifier__
                blockType.blockState = serverSystem.getComponent(block, "minecraft:blockstate").data

                let serveDataEventData = serverSystem.createEventData("NormaConstructor:serveData")
                serveDataEventData.data.blockType = blockType
                serveDataEventData.data.playerID = eventData.data.playerID
                serverSystem.broadcastEvent("NormaConstructor:serveData", serveDataEventData)
            })
            serverSystem.listenForEvent("NZConstructor:blockFetchRequest", (eventData) => {
                let blockType = new BlockType(undefined, undefined)
                let block = serverSystem.getBlock(eventData.data.position.tickingArea, eventData.data.position.coordinate)
                blockType.blockIdentifier = block.__identifier__
                blockType.blockState = serverSystem.getComponent(block, "minecraft:blockstate").data

                let blockFetchResponseEventData = serverSystem.createEventData("NZConstructor:blockFetchResponse")
                blockFetchResponseEventData.data.blockType = blockType
                blockFetchResponseEventData.data.playerID = eventData.data.playerID
                blockFetchResponseEventData.data.requestID = eventData.data.requestID
                serverSystem.broadcastEvent("NZConstructor:blockFetchResponse", blockFetchResponseEventData)
            })
            serverSystem.listenForEvent("NZConstructor:setBlock", (eventData) => {
                let { x, y, z, blockIdentifier, blockState } = eventData.data
                serverSystem.executeCommand(`/setblock ${x} ${y} ${z} ${blockIdentifier.slice(blockIdentifier.indexOf(":") + 1)} [${blockType.blockState == null ? "" : JSON.stringify(blockType.blockState).slice(1, -1)}] replace`, (commandResultData) => { })
            })

            //I suppose I have to make an explanation.
            //The input ("get data") mechanism is drasticly changed due to the 1.16 update as "block_interacted_with" is no longer useful.
            //Now the server serves the data through one event:"serveData".
            //When a block is placed, except that all three types of data will be sent in one event, things remain largely the same.
            //For position and direction, it is now initiated through fake food. Then the following code will obtain player's direction, and list what types of data the player request. 
            //Then the client will process the data. For position, the client will track the position the player is looking at in advance, and with direction it can calculate the block position.
            //Finally...it won't obtain blocktype as additional data ever since...?
            serverSystem.listenForEvent("minecraft:entity_use_item", (eventData) => {
                if (eventData.data.item_stack.__identifier__.startsWith("normaconstructor:")) {
                    let playerID = utils.misc.generatePlayerIDFromUniqueID(eventData.data.entity.__unique_id__)
                    let user = system.getUser(playerID)
                    let command = eventData.data.item_stack.__identifier__.slice(eventData.data.item_stack.__identifier__.indexOf(":") + 1)
                    //TODO: Explain how 'get_air' works.
                    if (command == "get_position" || command == "get_direction" || command == "get_air") {
                        let additionalData = {
                            direction: serverSystem.getComponent(eventData.data.entity, "minecraft:rotation").data,
                            tickingArea: serverSystem.getComponent(eventData.data.entity, "minecraft:tick_world").data.ticking_area,
                            playerRequest: {
                                "position": ((command == "get_position") || user.session["__requestAdditionalPosition"]),
                                "direction": ((command == "get_direction") || user.session["__requestAdditionalDirection"]),
                                "blockType": ((command == "get_air") ? false : user.session["__requestAdditionalBlockType"])
                            },
                            isGetAir: (command == "get_air")
                        }
                        sendCommand("get_data", playerID, additionalData)
                    }
                    else if (command == "read_tag") {
                        sendCommand(
                            command, playerID,
                            Array.from(serverSystem.getComponent(eventData.data.entity, "minecraft:tag").data, (tag) => {
                                if (tag.startsWith("nc:")) {
                                    return tag.slice(3)
                                }
                            })
                        )
                    }
                    else sendCommand(command, playerID)
                }
            })
            serverSystem.listenForEvent("NormaConstructor:ExecutionResponse", (eventData) => {
                for (let buildInstruction of eventData.data.buildInstructions) {
                    //I know it looks silly... "Compatibility reason".
                    if (!buildInstruction.hasOwnProperty("type")) setBlock(buildInstruction)
                    else {
                        //Another compromise...
                        //'Compliers' don't just complie: the fill() method can be invoked in which block will be placed directly.
                        let blocks = compiler[buildInstruction.type](buildInstruction.data)
                        for (let block of blocks) setBlock(block)
                    }
                }
            })
            function displayObject(object, playerID) {
                displayChat(JSON.stringify(object, null, '    '), playerID)
            }
            function displayChat(message, playerID) {
                if (playerID === undefined) {
                    let eventData = serverSystem.createEventData("minecraft:display_chat_event");
                    eventData.data.message = message;
                    serverSystem.broadcastEvent("minecraft:display_chat_event", eventData);
                }
                else {
                    let eventData = serverSystem.createEventData("NormaConstructor:displayChatToClient");
                    eventData.data.message = message;
                    eventData.data.playerID = playerID;
                    serverSystem.broadcastEvent("NormaConstructor:displayChatToClient", eventData);
                }
            }


            function sendCommand(command, playerID, additionalData) {
                let commandEventData = serverSystem.createEventData("NormaConstructor:command")
                commandEventData.data.command = command
                commandEventData.data.playerID = playerID
                commandEventData.data.additionalData = additionalData
                serverSystem.broadcastEvent("NormaConstructor:command", commandEventData)
            }
            function setBlock(block) {

                //displayChat("§b We all agree, NZ is JULAO!")
                let blockType = block.blockType
                let position = block.position
                let coordinate = position.coordinate
                //Thank you, WavePlayz!

                //TODO:
                //It currently use destroy mode to force replace the old block, but will leave tons of items.
                //Might change to set air block first.
                serverSystem.executeCommand(`/setblock ${coordinate.x} ${coordinate.y} ${coordinate.z} ${blockType.blockIdentifier.slice(blockType.blockIdentifier.indexOf(":") + 1)} [${blockType.blockState == null ? "" : JSON.stringify(blockType.blockState).slice(1, -1)}] replace`, (commandResultData) => {

                    // var targerBlock = serverSystem.getBlock(position.tickingArea, coordinate.x, coordinate.y, coordinate.z)

                    // var targetBlockStateComponent = serverSystem.getComponent(targerBlock, "minecraft:blockstate")
                    // targetBlockStateComponent.data = blockType.blockState
                    // serverSystem.applyComponentChanges(targerBlock, targetBlockStateComponent)
                });
            }

        }
    },
    createRuntime(id) {
        let user = system.getUser(id);
        return {};
    }


}



platform.use(system)
