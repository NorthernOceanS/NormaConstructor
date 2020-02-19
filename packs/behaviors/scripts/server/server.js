var serverSystem = server.registerSystem(0, 0);

import { Coordinate, Position, BlockType } from '../utils';
import { Block } from './block'

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
    serverSystem.registerEventData("NormaConstructor:command", { command: undefined, playerID: undefined })
    serverSystem.registerEventData("NormaConstructor:ExecutionRequest", { playerID: undefined })

    serverSystem.listenForEvent("minecraft:player_placed_block", (eventData) => getBlockType(eventData))
    //TODO:Consider switching to "minecraft:entity_use_item"
    serverSystem.listenForEvent("minecraft:block_interacted_with", (eventData) => {
        let playerID = eventData.data.player.id
        //TODO:Verify whether the player is permitted to use this addon.
        let handContainer = serverSystem.getComponent(eventData.data.player, "minecraft:hand_container").data
        let mainHandItem = handContainer[0].__identifier__
        switch (mainHandItem) {
            case "minecraft:wooden_axe": {
                //Set position.
                getPosition(eventData)
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
                let executeRequestEventData = serverSystem.createEventData("NormaConstructor:ExecutionRequest")
                executeRequestEventData.data.playerID = playerID
                serverSystem.broadcastEvent("NormaConstructor:ExecutionRequest", executeRequestEventData)
                break;
            }
            case "minecraft:wooden_sword": {
                displayObject(serverSystem.getComponent(eventData.data.player, "minecraft:rotation"))
            }
        }
    })
    serverSystem.listenForEvent("minecraft:entity_use_item", (eventData) => {
        //TODO:Inspect why the log function here doesn't work...properly.(?)
        server.log("AAAAAAAAAAAAAAAA")
    })
    serverSystem.listenForEvent("NormaConstructor:generateWithBlockArray", (eventData) => { for (let block of eventData.data.blockArray) setBlock(block) })
    serverSystem.listenForEvent("NormaConstructor:generateWithRawData", (eventData) => {
        displayObject(eventData)
        let generator = JSON.parse(eventData.data.generator)
        displayObject(generator)
        let blockArray = generator.generate()
        
        for (let block of blockArray) setBlock(block)
    })
    serverSystem.listenForEvent("NormaConstructor:setBlock", (eventData) => setBlock(eventData.data.block))
}

serverSystem.update = function () {
};

function displayObject(object) {
    displayChat(JSON.stringify(object, null, '    '))
}
function displayChat(message) {
    let eventData = serverSystem.createEventData("minecraft:display_chat_event");
    if (eventData) {
        eventData.data.message = message;
        serverSystem.broadcastEvent("minecraft:display_chat_event", eventData);
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

    let getblockTypeEventData = serverSystem.createEventData("NormaConstructor:getBlockType")
    getblockTypeEventData.data.blockType = blockType
    getblockTypeEventData.data.playerID = eventData.data.player.id
    serverSystem.broadcastEvent("NormaConstructor:getBlockType", getblockTypeEventData)

}
function getPosition(eventData) {
    let position = new Position(
        new Coordinate(undefined, undefined, undefined),
        undefined
    )

    position.coordinate = eventData.data.block_position
    position.tickingArea = serverSystem.getComponent(eventData.data.player, "minecraft:tick_world").data.ticking_area

    let getPositionEventData = serverSystem.createEventData("NormaConstructor:getPosition")
    getPositionEventData.data.position = position
    getPositionEventData.data.playerID = eventData.data.player.id
    serverSystem.broadcastEvent("NormaConstructor:getPosition", getPositionEventData)
}
function sendCommand(command, playerID) {
    let commandEventData = serverSystem.createEventData("NormaConstructor:command")
    commandEventData.data.command = command
    commandEventData.data.playerID = playerID
    serverSystem.broadcastEvent("NormaConstructor:command", commandEventData)
}
function setBlock(block) {

    displayChat("§b We all agree, NZ is JULAO!")
    let blockType = block.blockType
    let position = block.position
    let coordinate = position.coordinate

    let tileData = Block.getData(blockType.blockIdentifier, { data: blockType.blockState })
    //Thank you, WavePlayz!

    serverSystem.executeCommand(`/setblock ${coordinate.x} ${coordinate.y} ${coordinate.z} ${blockType.blockIdentifier.slice(blockType.blockIdentifier.indexOf(":") + 1)} ${tileData}`, (commandResultData) => {

        var targerBlock = serverSystem.getBlock(position.tickingArea, coordinate.x, coordinate.y, coordinate.z)

        var targetBlockStateComponent = serverSystem.getComponent(targerBlock, "minecraft:blockstate")
        targetBlockStateComponent.data = blockType.blockState
        serverSystem.applyComponentChanges(targerBlock, targetBlockStateComponent)
    });
}