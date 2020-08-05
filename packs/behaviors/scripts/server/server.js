var serverSystem = server.registerSystem(0, 0);

import { Coordinate, Position, BlockType, Direction, Block } from '../constructor';
import { blockStateTranslator } from './translator'
import { utils } from '../utils'

let blockStateToTileDataTable = new Map()

let compiler = {
    clone: function ({ startCoordinate, endCoordinate, targetCoordinate }) {
        displayObject(startCoordinate)
        displayObject(endCoordinate)
        displayObject(targetCoordinate)

        for (let x = startCoordinate.x; (startCoordinate.x < endCoordinate.x) ? (x <= endCoordinate.x) : (x >= endCoordinate.x); x = x + ((startCoordinate.x < endCoordinate.x) ? 32 : -32))
            for (let y = startCoordinate.y; (startCoordinate.y < endCoordinate.y) ? (y <= endCoordinate.y) : (y >= endCoordinate.y); y = y + ((startCoordinate.y < endCoordinate.y) ? 32 : -32))
                for (let z = startCoordinate.z; (startCoordinate.z < endCoordinate.z) ? (z <= endCoordinate.z) : (z >= endCoordinate.z); z = z + ((startCoordinate.z < endCoordinate.z) ? 32 : -32)) {
                    displayObject({ x, y, z })
                    serverSystem.executeCommand(`/clone ${x} ${y} ${z} 
                    ${(startCoordinate.x < endCoordinate.x) ? Math.min(x + 31 * ((startCoordinate.x < endCoordinate.x) ? 1 : -1), endCoordinate.x) : Math.max(x + 31 * ((startCoordinate.x < endCoordinate.x) ? 1 : -1), endCoordinate.x)} 
                    ${(startCoordinate.y < endCoordinate.y) ? Math.min(y + 31 * ((startCoordinate.y < endCoordinate.y) ? 1 : -1), endCoordinate.y) : Math.max(y + 31 * ((startCoordinate.y < endCoordinate.y) ? 1 : -1), endCoordinate.y)} 
                    ${(startCoordinate.z < endCoordinate.z) ? Math.min(z + 31 * ((startCoordinate.z < endCoordinate.z) ? 1 : -1), endCoordinate.z) : Math.max(z + 31 * ((startCoordinate.z < endCoordinate.z) ? 1 : -1), endCoordinate.z)} 
                    ${targetCoordinate.x + x - startCoordinate.x} 
                    ${targetCoordinate.y + y - startCoordinate.y} 
                    ${targetCoordinate.z + z - startCoordinate.z} 
                    masked force`,
                        (commandResultData) => {
                            displayObject(commandResultData)
                        })
                }
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

        let tileData = undefined

        if (blockStateToTileDataTable.has(JSON.stringify(blockType.blockState))) {
            tileData = blockStateToTileDataTable.get(JSON.stringify(blockType.blockState))
        }
        else {
            tileData = blockStateTranslator.getData(blockType.blockIdentifier, { "data": blockType.blockState })
            blockStateToTileDataTable.set(JSON.stringify(blockType.blockState), tileData)
        }

        displayObject(startCoordinate)
        displayObject(endCoordinate)

        //Bypass the restriction of 32767 blocks
        for (let x = startCoordinate.x; x <= endCoordinate.x; x += 32)
            for (let y = startCoordinate.y; y <= endCoordinate.y; y += 32)
                for (let z = startCoordinate.z; z <= endCoordinate.z; z += 32) {
                    serverSystem.executeCommand(`/fill ${x} ${y} ${z} ${Math.min(x + 31, endCoordinate.x)} ${Math.min(y + 31, endCoordinate.y)} ${Math.min(z + 31, endCoordinate.z)} ${blockType.blockIdentifier.slice(blockType.blockIdentifier.indexOf(":") + 1)} ${tileData} destroy`, (commandResultData) => {
                        //displayObject(commandResultData)
                    });
                }
        return []
    }
}

let playerOption = {}
serverSystem.initialize = function () {

    const scriptLoggerConfig = serverSystem.createEventData("minecraft:script_logger_config");
    scriptLoggerConfig.data.log_errors = true;
    scriptLoggerConfig.data.log_information = true;
    scriptLoggerConfig.data.log_warnings = true;
    serverSystem.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);

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
    serverSystem.registerEventData("NormaConstructor:ExecutionRequest", { playerID: undefined })

    serverSystem.listenForEvent("NormaConstructor:setServerSideOption", (eventData) => {
        if (playerOption[eventData.data.playerID] == undefined) playerOption[eventData.data.playerID] = new Object()
        playerOption[eventData.data.playerID][eventData.data.option.key] = eventData.data.option.value
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
        if (playerOption[utils.misc.generatePlayerIDFromUniqueID(eventData.data.player.__unique_id__)]["__requestAdditionalPosition"]) serveDataEventData.data.position = getPosition(eventData)
        if (playerOption[utils.misc.generatePlayerIDFromUniqueID(eventData.data.player.__unique_id__)]["__requestAdditionalDirection"]) serveDataEventData.data.direction = getDirection(eventData)
        serveDataEventData.data.playerID = utils.misc.generatePlayerIDFromUniqueID(eventData.data.player.__unique_id__)
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

    //I suppose I have to make an explanation.
    //The input ("get data") mechanism is drasticly changed due to the 1.16 update as "block_interacted_with" is no longer useful.
    //Now the server serves the data through one event:"serveData".
    //When a block is placed, except that all three types of data will be sent in one event, things remain largely the same.
    //For position and direction, it is now initiated through fake food. Then the following code will obtain player's direction, and list what types of data the player request. 
    //Then the client will process the data. For position, the client will track the position the player is looking at in advance, and with direction it can calculate the block position.
    //Finally...it won't obtain blocktype as additional data ever since...?
    serverSystem.listenForEvent("minecraft:entity_use_item", (eventData) => {
        displayObject(eventData)
        if (eventData.data.item_stack.__identifier__.startsWith("normaconstructor:")) {
            let playerID = utils.misc.generatePlayerIDFromUniqueID(eventData.data.entity.__unique_id__)
            let command = eventData.data.item_stack.__identifier__.slice(eventData.data.item_stack.__identifier__.indexOf(":") + 1)

            if (command == "get_position" || command == "get_direction") {
                let additionalData = {
                    direction: serverSystem.getComponent(eventData.data.entity, "minecraft:rotation").data,
                    tickingArea: serverSystem.getComponent(eventData.data.entity, "minecraft:tick_world").data.ticking_area,
                    playerRequest: {
                        "position": ((command == "get_position") || playerOption[playerID]["__requestAdditionalPosition"]),
                        "direction": ((command == "get_direction") || playerOption[playerID]["__requestAdditionalDirection"]),
                        "blockType": playerOption[playerID]["__requestAdditionalBlockType"]
                    }
                }
                sendCommand("get_data", playerID, additionalData)
            }
            else if (command == "get_air") {
                let serveDataEventData = serverSystem.createEventData("NormaConstructor:serveData")
                serveDataEventData.data.blockType = new BlockType("minecraft:air", null)
                serveDataEventData.data.playerID = utils.misc.generatePlayerIDFromUniqueID(eventData.data.entity.__unique_id__)
                serverSystem.broadcastEvent("NormaConstructor:serveData", serveDataEventData)
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
}

serverSystem.update = function () {
};

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

    let tileData = undefined

    if (blockStateToTileDataTable.has(JSON.stringify(blockType.blockState))) {
        tileData = blockStateToTileDataTable.get(JSON.stringify(blockType.blockState))
    }
    else {
        tileData = blockStateTranslator.getData(blockType.blockIdentifier, { "data": blockType.blockState })
        blockStateToTileDataTable.set(JSON.stringify(blockType.blockState), tileData)
    }

    //TODO:
    //It currently use destroy mode to force replace the old block, but will leave tons of items.
    //Might change to set air block first.
    serverSystem.executeCommand(`/setblock ${coordinate.x} ${coordinate.y} ${coordinate.z} ${blockType.blockIdentifier.slice(blockType.blockIdentifier.indexOf(":") + 1)} ${tileData} destroy`, (commandResultData) => {

        // var targerBlock = serverSystem.getBlock(position.tickingArea, coordinate.x, coordinate.y, coordinate.z)

        // var targetBlockStateComponent = serverSystem.getComponent(targerBlock, "minecraft:blockstate")
        // targetBlockStateComponent.data = blockType.blockState
        // serverSystem.applyComponentChanges(targerBlock, targetBlockStateComponent)
    });
}
