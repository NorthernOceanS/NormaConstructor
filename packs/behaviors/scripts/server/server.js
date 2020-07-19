var serverSystem = server.registerSystem(0, 0);

import { Coordinate, Position, BlockType, Direction, Block } from '../constructor';
import { blockStateTranslator } from './translator'
import { utils } from '../utils'

let blockStateToTileDataTable = new Map()

let generator = {
    "19260817": function (positionArray, blockTypeArray, directionArray, option, playerID) {
        let blockArray = []

        displayChat("§b NZ is JULAO!", playerID)

        let minCoordinate = new Coordinate(
            Math.min(positionArray[0].coordinate.x, positionArray[1].coordinate.x),
            Math.min(positionArray[0].coordinate.y, positionArray[1].coordinate.y),
            Math.min(positionArray[0].coordinate.z, positionArray[1].coordinate.z),
        )
        let maxCoordinate = new Coordinate(
            Math.max(positionArray[0].coordinate.x, positionArray[1].coordinate.x),
            Math.max(positionArray[0].coordinate.y, positionArray[1].coordinate.y),
            Math.max(positionArray[0].coordinate.z, positionArray[1].coordinate.z)
        )

        displayChat("§b Yes, NZ is JULAO!", playerID)

        for (let x = minCoordinate.x; x <= maxCoordinate.x; x++) {
            for (let y = minCoordinate.y; y <= maxCoordinate.y; y++) {
                for (let z = minCoordinate.z; z <= maxCoordinate.z; z++) {

                    let tickingArea = positionArray[0].tickingArea
                    let block = serverSystem.getBlock(tickingArea, new Coordinate(x, y, z))
                    let blockType = new BlockType(undefined, undefined)
                    blockType.blockIdentifier = block.__identifier__
                    blockType.blockState = serverSystem.getComponent(block, "minecraft:blockstate").data

                    blockArray.push(new Block(
                        new Position(
                            new Coordinate(
                                x - positionArray[0].coordinate.x + positionArray[2].coordinate.x,
                                y - positionArray[0].coordinate.y + positionArray[2].coordinate.y,
                                z - positionArray[0].coordinate.z + positionArray[2].coordinate.z
                            ),
                            positionArray[2].tickingArea
                        ),
                        blockType)
                    )
                }
            }
        }
        return blockArray
    },
    "20010705": function (positionArray, blockTypeArray, directionArray, option, playerID) {
        let blockArray = []

        displayChat("§b NZ is JULAO!")

        let x_min = Math.min(positionArray[0].coordinate.x, positionArray[1].coordinate.x)
        let z_min = Math.min(positionArray[0].coordinate.z, positionArray[1].coordinate.z)

        let x_max = Math.max(positionArray[0].coordinate.x, positionArray[1].coordinate.x)
        let z_max = Math.max(positionArray[0].coordinate.z, positionArray[1].coordinate.z)

        let y_start = (Math.abs(positionArray[0].coordinate.y - 69) < Math.abs(positionArray[1].coordinate.y - 69)) ? positionArray[0].coordinate.y : positionArray[1].coordinate.y

        displayChat("§b Yes, NZ is JULAO!")

        fill({
            data: {
                "coordinate_start": new Coordinate(x_min, y_start, z_min), "coordinate_end": new Coordinate(x_max, 255, z_max), "blockType": {
                    "blockIdentifier": "minecraft:air",
                    "blockState": null
                }
            }
        })

        return []
    }
}
let compiler={}

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

            let handContainer = serverSystem.getComponent(eventData.data.player, "minecraft:hand_container").data
            let offHandItem = handContainer[1]
            if (offHandItem.__identifier__ == "minecraft:shield") {//Since the player can't place air, holding a shield will represent so. 
                blockType.blockIdentifier = "minecraft:air"
                blockType.blockState = null
            }
            else {
                let tickingArea = serverSystem.getComponent(eventData.data.player, "minecraft:tick_world").data.ticking_area
                let block = serverSystem.getBlock(tickingArea, eventData.data.block_position)
                blockType.blockIdentifier = block.__identifier__
                blockType.blockState = serverSystem.getComponent(block, "minecraft:blockstate").data
            }

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
            else sendCommand(command, playerID)
        }
    })
    serverSystem.listenForEvent("NormaConstructor:ExecutionResponse", (eventData) => {
        for (let buildInstruction of eventData.data.buildInstructions) {
            //I know it looks silly... "Compatible reason".
            if (!buildInstruction.hasOwnProperty("type")) setBlock(buildInstruction)
            else {
                let blocks=compiler[buildInstruction.type](buildInstruction.data)
                for(let block of blocks) setBlock(block)
            }
        }
    })
    //TODO:
    //Deprecated. Shall be removed.
    serverSystem.listenForEvent("NormaConstructor:generateByServer", (eventData) => {
        let blockArray = generator[eventData.data.serverGeneratorIdentifier](
            eventData.data.positionArray,
            eventData.data.blockTypeArray,
            eventData.data.directionArray,
            eventData.data.option,
            eventData.data.playerID
        )
        for (let block of blockArray) setBlock(block)
    })
    serverSystem.listenForEvent("NormaConstructor:setBlock", (eventData) => setBlock(eventData.data.block))
    serverSystem.listenForEvent("NormaConstructor:fill", (eventData) => fill(eventData))
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

function fill(eventData) {
    let blockType = eventData.data.blockType
    let coordinate_start = eventData.data.coordinate_start
    let coordinate_end = eventData.data.coordinate_end

    if (coordinate_start.x >= coordinate_end.x) {
        let temp = coordinate_start.x
        coordinate_start.x = coordinate_end.x
        coordinate_end.x = temp
    }
    if (coordinate_start.y >= coordinate_end.y) {
        let temp = coordinate_start.y
        coordinate_start.y = coordinate_end.y
        coordinate_end.y = temp
    }
    if (coordinate_start.z >= coordinate_end.z) {
        let temp = coordinate_start.z
        coordinate_start.z = coordinate_end.z
        coordinate_end.z = temp
    }

    let tileData = undefined

    if (blockStateToTileDataTable.has(JSON.stringify(blockType.blockState))) {
        tileData = blockStateToTileDataTable.get(JSON.stringify(blockType.blockState))
    }
    else {
        tileData = blockStateTranslator.getData(blockType.blockIdentifier, { "data": blockType.blockState })
        blockStateToTileDataTable.set(JSON.stringify(blockType.blockState), tileData)
    }

    displayObject(coordinate_start)
    displayObject(coordinate_end)

    //Bypass the restriction of 32767 blocks
    for (let x = coordinate_start.x; x <= coordinate_end.x; x += 32)
        for (let y = coordinate_start.y; y <= coordinate_end.y; y += 32)
            for (let z = coordinate_start.z; z <= coordinate_end.z; z += 32) {
                serverSystem.executeCommand(`/fill ${x} ${y} ${z} ${Math.min(x + 31, coordinate_end.x)} ${Math.min(y + 31, coordinate_end.y)} ${Math.min(z + 31, coordinate_end.z)} ${blockType.blockIdentifier.slice(blockType.blockIdentifier.indexOf(":") + 1)} ${tileData} destroy`, (commandResultData) => {
                    //displayObject(commandResultData)
                });
            }
}