import system from '../system.js';
import '../plugin/index.js';
import { emptyPlatform, Coordinate, Position, BlockType, Direction, Block } from 'norma-core';

import { utils } from '../utils.js'

emptyPlatform.use(system);

const serverSystem = server.registerSystem(0, 0);
system.inject({
    createRuntime: function (id) {
        let user = system.getUser(id);
        return {
            logger: loggerFactory(user)
        };
    }
})
serverSystem.initialize = function () {
    const scriptLoggerConfig = serverSystem.createEventData("minecraft:script_logger_config");
    scriptLoggerConfig.data.log_errors = true;
    scriptLoggerConfig.data.log_information = true;
    scriptLoggerConfig.data.log_warnings = true;
    serverSystem.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);

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
        let playerID = utils.misc.generatePlayerIDFromUniqueID(eventData.data.player.__unique_id__)
        let user = getUser(playerID)
        let logger = loggerFactory(user)
        handlePlayerRequest({
            requestType: "get_block_type", playerID, additionalData: {
                position: getPosition(eventData),
                blockType: getBlockType(eventData),
                direction: getDirection(eventData)
            }
        })
    })

    serverSystem.listenForEvent("minecraft:entity_hurt", (eventData) => {
        function getBlockType(eventData) {
            let blockType = new BlockType(undefined, undefined)

            let position = getPosition(eventData)
            let block = serverSystem.getBlock(position.tickingArea, position.coordinate)
            blockType.blockIdentifier = block.__identifier__
            blockType.blockState = serverSystem.getComponent(block, "minecraft:blockstate").data

            return blockType

        }
        function getPosition(eventData) {
            let position = new Position(
                new Coordinate(undefined, undefined, undefined),
                undefined
            )

            let { x, y, z } = serverSystem.getComponent(eventData.data.entity, "minecraft:position").data
            position.coordinate = new Coordinate(Math.floor(x), Math.floor(y), Math.floor(z))
            position.tickingArea = serverSystem.getComponent(eventData.data.attacker, "minecraft:tick_world").data.ticking_area

            return position
        }
        function getDirection(eventData) {
            let direction = new Direction(undefined, undefined)
            direction = serverSystem.getComponent(eventData.data.attacker, "minecraft:rotation").data
            return direction
        }

        if (eventData.data.entity.__identifier__.startsWith("normaconstructor:") && eventData.data.attacker.__identifier__ == "minecraft:player") {
            let playerID = utils.misc.generatePlayerIDFromUniqueID(eventData.data.attacker.__unique_id__)
            let user = getUser(playerID)
            let logger = loggerFactory(user)
            let requestType = eventData.data.entity.__identifier__.slice(eventData.data.entity.__identifier__.indexOf(":") + 1)
            handlePlayerRequest({
                requestType, playerID, additionalData: {
                    position: getPosition(eventData),
                    blockType: getBlockType(eventData),
                    direction: getDirection(eventData)
                }
            })
        }
    })

    serverSystem.listenForEvent("minecraft:entity_use_item", (eventData) => {
        displayObject(eventData)
        if (eventData.data.item_stack.__identifier__.startsWith("normaconstructor:") && eventData.data.use_method == "eat") {
            let playerID = utils.misc.generatePlayerIDFromUniqueID(eventData.data.entity.__unique_id__)
            let user = getUser(playerID)
            let logger = loggerFactory(user)
            let requestType = eventData.data.item_stack.__identifier__.slice(eventData.data.item_stack.__identifier__.indexOf(":") + 1)
            handlePlayerRequest({ requestType, playerID })
        }
    })
}

function registerNewUser(playerID) {
    let user = system.createUser(playerID)
    //TODO:Separate the following initialization process from this function.
    user.session["__requestAdditionalPosition"] = false;
    user.session["__requestAdditionalBlockType"] = false;
    user.session["__requestAdditionalDirection"] = false;
    user.session["__logLevel"] = "verbose";
    user.session["__on"] = true;

    return user;
}
function getUser(playerID) {
    return system.hasUser(playerID) ? system.getUser(playerID) : registerNewUser(playerID)
}

function handlePlayerRequest({ requestType, playerID, additionalData }) {
    let user = getUser(playerID)
    const logger = loggerFactory(user)
    logger.log("verbose", "NZ IS JULAO!")
    logger.logObject("verbose", { requestType, playerID, additionalData })
    switch (requestType) {
        case "get_position":
        case "get_direction":
        case "get_block_type": {
            if (requestType == "get_position" || user.session["__requestAdditionalPosition"]) user.addPosition(additionalData.position)
            if (requestType == "get_direction" || user.session["__requestAdditionalDirection"]) user.addDirection(additionalData.direction)
            if (requestType == "get_block_type" || user.session["__requestAdditionalBlockType"]) user.addBlockType(additionalData.blockType)
            break;
        }
        case "get_air": {
            user.addBlockType(new BlockType("minecraft:air", {}))
            break;
        }
        case "remove_last_position": {
            logger.log("info", "Removing the last position...")
            user.removePosition()
            break;
        }
        case "remove_last_blocktype": {
            logger.log("info", "Removing the last blockType...")
            user.removeBlockType()
            break;
        }
        case "remove_last_direction": {
            logger.log("info", "Removing the last direction...")
            user.removeDirection()
            break;
        }
        case "choose_next_generator": {
            logger.log("info", "Choosing next generator...")
            user.nextGenerator()
            logger.log("debug", "Current generator:")
            logger.logObject("debug", user.getCurrentGeneratorName())
            break;
        }
        case "show_saved_data": {
            //logger.log("info", "Current positionArray:")
            //logger.logObject("info", generatorArray[generatorIndex].positionArray)
            //logger.log("info", "Current blockTypeArray:")
            //logger.logObject("info", generatorArray[generatorIndex].blockTypeArray)
            //logger.log("info", "Current directionArray:")
            //logger.logObject("info", generatorArray[generatorIndex].directionArray)
            logger.log("info", "Current generator state:")
            logger.logObject("info", user.getCurrentState())
            logger.log("info", "Current session:")
            logger.logObject("info", user.session)
            break;
        }
        case "execute": {
            execute(user);
            break;
        }
        case "show_menu": {

            break;
        }
        case "read_tag": {
            function parseTag(tag) {
                let requestType = tag.split(' ')
                if (requestType[0] == "add" && requestType[1] == "b") {
                    storeData(user, new BlockType(requestType[2], JSON.parse(requestType[3])), undefined, undefined)
                }
                else if (requestType[0] == "set" && requestType[1] == "o") {
                    user.getCurrentState()[requestType[2]] = requestType[3]
                }
            }
            eventData.data.additionalData.forEach((tag) => {
                if (tag) parseTag(tag)
            })
            break;
        }
    }
}

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
async function execute(user) {
    let logger = loggerFactory(user);
    logger.log("info", "Start validating parameters...");
    let isVaild = await user.isValidParameter();
    if (isVaild) {
        logger.log("info", "Now Execution started.");

        let buildInstructions = await user.generate();
        if (buildInstructions === undefined) return;

        logger.logObject("verbose", buildInstructions)

        for (let buildInstruction of buildInstructions) {
            //I know it looks silly... "Compatibility reason".
            if (!buildInstruction.hasOwnProperty("type")) setBlock(buildInstruction)
            else {
                //Another compromise...
                //'Compliers' don't just complie: the fill() method can be invoked in which block will be placed directly.
                let blocks = compiler[buildInstruction.type](buildInstruction.data)
                for (let block of blocks) setBlock(block)
            }
        }
    }
}
function displayObject(object, playerID) {
    displayChat(JSON.stringify(object, null, '    '), playerID)
}
function displayChat(message, playerID) {
    //TODO:Allow sending chat to specified player.
    let eventData = serverSystem.createEventData("minecraft:display_chat_event");
    eventData.data.message = message;
    serverSystem.broadcastEvent("minecraft:display_chat_event", eventData);

}

function setBlock(block) {

    //displayChat("§b We all agree, NZ is JULAO!")
    let blockType = block.blockType
    let position = block.position
    let coordinate = position.coordinate
    // STILL thank you, WavePlayz!


    //TODO:
    //It currently use destroy mode to force replace the old block, but will leave tons of items.
    //Might change to set air block first.
    //NEW TODO: UNDERSTANDING WHAT THE FUDGE I WAS TALKING ABOUT HERE.
    serverSystem.executeCommand(`/setblock ${coordinate.x} ${coordinate.y} ${coordinate.z} ${blockType.blockIdentifier.slice(blockType.blockIdentifier.indexOf(":") + 1)} [${blockType.blockState == null ? "" : JSON.stringify(blockType.blockState).slice(1, -1)}] replace`, (commandResultData) => {

        // var targerBlock = serverSystem.getBlock(position.tickingArea, coordinate.x, coordinate.y, coordinate.z)

        // var targetBlockStateComponent = serverSystem.getComponent(targerBlock, "minecraft:blockstate")
        // targetBlockStateComponent.data = blockType.blockState
        // serverSystem.applyComponentChanges(targerBlock, targetBlockStateComponent)
    });
}
function loggerFactory(user) {
    return {
        displayChat, displayObject,
        log: function (level, message) {
            const colorMap = new Map([
                ["verbose", { num: 0, color: "§a" }],
                ["debug", { num: 1, color: "§6" }],
                ["info", { num: 2, color: "§b" }],
                ["warning", { num: 3, color: "§e" }],
                ["error", { num: 4, color: "§c" }],
                ["fatal", { num: 5, color: "§4" }]
            ])
            if (colorMap.get(level).num >= colorMap.get(user.session["__logLevel"]).num)
                this.displayChat(colorMap.get(level).color + "[" + level + "]" + message)
        },
        logObject: function (level, object) {
            this.log(level, JSON.stringify(object, null, '    '))
        }
    }
}


