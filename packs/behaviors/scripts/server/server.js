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
    }
}
let playerOption = {}
serverSystem.initialize = function () {

    const scriptLoggerConfig = serverSystem.createEventData("minecraft:script_logger_config");
    scriptLoggerConfig.data.log_errors = true;
    scriptLoggerConfig.data.log_information = true;
    scriptLoggerConfig.data.log_warnings = true;
    serverSystem.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);

    serverSystem.registerEventData("NormaConstructor:getPosition", {
        position: new Position(
            new Coordinate(undefined, undefined, undefined),
            undefined
        ),
        playerID: undefined
    })
    serverSystem.registerEventData("NormaConstructor:getBlockType", {
        blockType: new BlockType(undefined, undefined),
        playerID: undefined
    })
    serverSystem.registerEventData("NormaConstructor:getDirection", {
        direction: new Direction(undefined, undefined),
        playerID: undefined
    })
    serverSystem.registerEventData("NormaConstructor:displayChatToClient", {
        message: undefined,
        playerID: undefined
    })

    serverSystem.registerEventData("NormaConstructor:command", { command: undefined, playerID: undefined })
    serverSystem.registerEventData("NormaConstructor:ExecutionRequest", { playerID: undefined })

    serverSystem.listenForEvent("NormaConstructor:setServerSideOption", (eventData) => {
        if (playerOption[eventData.data.playerID] == undefined) playerOption[eventData.data.playerID] = new Object()
        playerOption[eventData.data.playerID][eventData.data.option.key] = eventData.data.option.value
    })
    serverSystem.listenForEvent("minecraft:player_placed_block", (eventData) => {
        getBlockType(eventData)

        //Ahh!!!!!!!!!!!!!!!!!!
        //I actually illegally sent the eventData. Thank god they have the same "block_position".
        if (playerOption[utils.misc.generatePlayerIDFromUniqueID(eventData.data.player.__unique_id__)]["__requestAdditionalPosition"]) getPosition(eventData)
        if (playerOption[utils.misc.generatePlayerIDFromUniqueID(eventData.data.player.__unique_id__)]["__requestAdditionalDirection"]) getDirection(eventData)
    })
    //TODO:Consider switching to "minecraft:entity_use_item"
    serverSystem.listenForEvent("minecraft:block_interacted_with", (eventData) => {
        let playerID = utils.misc.generatePlayerIDFromUniqueID(eventData.data.player.__unique_id__)
        //TODO:Verify whether the player is permitted to use this addon.
        let handContainer = serverSystem.getComponent(eventData.data.player, "minecraft:hand_container").data
        let mainHandItem = handContainer[0].__identifier__
        switch (mainHandItem) {
            case "minecraft:wooden_axe": {
                //Set position.
                getPosition(eventData)

                //I HATE IT!I HATE IT!I HATE IT!!!
                if (playerOption[playerID]["__requestAdditionalDirection"]) getDirection(eventData)
                if (playerOption[playerID]["__requestAdditionalBlockType"]) getBlockType(eventData)

                break;
            }
            case "minecraft:compass": {
                //Set direction.
                getDirection(eventData)

                //AND MORE!AND MORE!AND MORE!!!
                if (playerOption[playerID]["__requestAdditionalPosition"]) getPosition(eventData)
                if (playerOption[playerID]["__requestAdditionalBlockType"]) getBlockType(eventData)

                break;
            }
            case "minecraft:clock": {
                //TODO:Change it in the future.
                //Remove the last direction.
                sendCommand("removeLastDirection", playerID)
                break;
            }
            case "minecraft:stone_axe": {
                //Remove the last position.
                sendCommand("removeLastPosition", playerID)
                break;
            }
            case "minecraft:iron_axe": {
                //Remove the last blockType.
                sendCommand("removeLastblockType", playerID)
                break;
            }
            case "minecraft:golden_axe": {
                //Choose the next generator.
                sendCommand("chooseNextGenerator", playerID)
                break;
            }
            case "minecraft:diamond_axe": {
                //Show currently saved data.
                sendCommand("showSavedData", playerID)
                break;
            }
            case "minecraft:stick": {
                //Execute.
                sendCommand("execute", playerID)
                break;
            }
            case "minecraft:iron_sword": {
                sendCommand("showMenu", playerID)
                break;
            }
            case "minecraft:": {
                break;
            }
        }
    })
    serverSystem.listenForEvent("minecraft:entity_use_item", (eventData) => {
        //TODO:Inspect why the log function here doesn't work...properly.(?)
        server.log("AAAAAAAAAAAAAAAA")
    })
    serverSystem.listenForEvent("NormaConstructor:ExecutionResponse", (eventData) => { for (let block of eventData.data.blockArray) setBlock(block) })
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

    let blockTypeEventData = serverSystem.createEventData("NormaConstructor:getBlockType")
    blockTypeEventData.data.blockType = blockType
    blockTypeEventData.data.playerID = utils.misc.generatePlayerIDFromUniqueID(eventData.data.player.__unique_id__)
    serverSystem.broadcastEvent("NormaConstructor:getBlockType", blockTypeEventData)

}
function getPosition(eventData) {
    let position = new Position(
        new Coordinate(undefined, undefined, undefined),
        undefined
    )

    position.coordinate = eventData.data.block_position
    position.tickingArea = serverSystem.getComponent(eventData.data.player, "minecraft:tick_world").data.ticking_area

    let positionEventData = serverSystem.createEventData("NormaConstructor:getPosition")
    positionEventData.data.position = position
    positionEventData.data.playerID = utils.misc.generatePlayerIDFromUniqueID(eventData.data.player.__unique_id__)
    serverSystem.broadcastEvent("NormaConstructor:getPosition", positionEventData)
}
function getDirection(eventData) {
    let direction = new Direction(undefined, undefined)
    direction = serverSystem.getComponent(eventData.data.player, "minecraft:rotation").data

    let directionEventData = serverSystem.createEventData("NormaConstructor:getDirection")
    directionEventData.data.direction = direction
    directionEventData.data.playerID = utils.misc.generatePlayerIDFromUniqueID(eventData.data.player.__unique_id__)
    serverSystem.broadcastEvent("NormaConstructor:getDirection", directionEventData)
}
function sendCommand(command, playerID) {
    let commandEventData = serverSystem.createEventData("NormaConstructor:command")
    commandEventData.data.command = command
    commandEventData.data.playerID = playerID
    serverSystem.broadcastEvent("NormaConstructor:command", commandEventData)
}
function setBlock(block) {

    //displayChat("§b We all agree, NZ is JULAO!")
    let blockType = block.blockType
    let position = block.position
    let coordinate = position.coordinate
    //Thank you, WavePlayz!

    let tileData=undefined

    if (blockStateToTileDataTable.has(JSON.stringify(blockType.blockState))){
        tileData=blockStateToTileDataTable.get(JSON.stringify(blockType.blockState))
        displayChat(tileData)
    }
    else{
        tileData=blockStateTranslator.getData(blockType.blockIdentifier, { "data": blockType.blockState })
        blockStateToTileDataTable.set(JSON.stringify(blockType.blockState),tileData)
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