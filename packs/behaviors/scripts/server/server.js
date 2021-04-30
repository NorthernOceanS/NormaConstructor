import system from '../system.js';
import '../plugin/index.js';
import { emptyPlatform, Coordinate, Position, BlockType, Direction, Block } from 'norma-core';

import { blockStateTranslator } from '../translator.js'
import { utils } from '../utils.js'

emptyPlatform.use(system);

const serverSystem = server.registerSystem(0, 0);
system.inject({
    createRuntime: function (id) {
        let user = system.getUser(id);
        return {};
    }
})
serverSystem.initialize = function () {
    const scriptLoggerConfig = serverSystem.createEventData("minecraft:script_logger_config");
    scriptLoggerConfig.data.log_errors = true;
    scriptLoggerConfig.data.log_information = true;
    scriptLoggerConfig.data.log_warnings = true;
    serverSystem.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);

    let blockStateToTileDataTable = new Map()

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

            let tileData = undefined

            if (blockStateToTileDataTable.has(JSON.stringify(blockType.blockState))) {
                tileData = blockStateToTileDataTable.get(JSON.stringify(blockType.blockState))
            }
            else {
                tileData = blockStateTranslator.getData(blockType.blockIdentifier, { "data": blockType.blockState })
                blockStateToTileDataTable.set(JSON.stringify(blockType.blockState), tileData)
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
                        ${tileData} replace`, (commandResultData) => { }
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

    function registerNewUser(playerID) {
        system.createUser(playerID)
        //TODO:Separate the following initialization process from the function.
        user.session["__requestAdditionalPosition"] = false;
        user.session["__requestAdditionalBlockType"] = false;
        user.session["__requestAdditionalDirection"] = false;
    }

    serverSystem.listenForEvent("minecraft:entity_use_item", (eventData) => {
        if (eventData.data.item_stack.__identifier__.startsWith("normaconstructor:")) {
            let playerID = utils.misc.generatePlayerIDFromUniqueID(eventData.data.entity.__unique_id__)
            let user = system.hasUser(playerID) ? system.getUser(playerID) : registerNewUser(playerID)
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

    function playerActionHandler({ type }) {
        switch (eventData.data.command) {
            case "get_data": {
                logger.logObject("debug", eventData.data.additionalData)

                let serveData = { blockType: undefined, position: undefined, direction: undefined }

                let direction = eventData.data.additionalData.direction
                if (eventData.data.additionalData.playerRequest["direction"]) serveData.direction = direction

                if (eventData.data.additionalData.isGetAir) serveData.blockType = new BlockType("minecraft:air", null)

                if (eventData.data.additionalData.playerRequest["position"] || eventData.data.additionalData.playerRequest["blockType"]) {
                    let rawCoordinate = coordinatePlayerLookingAt
                    if (rawCoordinate == null) {
                        logger.log("error", "Unable to get the block position. Please retry.")
                    }
                    else {
                        let coordinate = rawCoordinate
                        function isCoordinatePlaneFacing(num) {
                            return Math.floor(num) == num
                        }
                        if (isCoordinatePlaneFacing(rawCoordinate.x)) coordinate.x -= ((-180 <= direction.y && direction.y < 0) ? 0 : 1)
                        if (isCoordinatePlaneFacing(rawCoordinate.y)) coordinate.y -= ((-90 <= direction.x && direction.x < 0) ? 0 : 1)
                        if (isCoordinatePlaneFacing(rawCoordinate.z)) coordinate.z -= ((-90 <= direction.y && direction.y < 90) ? 0 : 1)
                        coordinate.x = Math.floor(coordinate.x)
                        coordinate.y = Math.floor(coordinate.y)
                        coordinate.z = Math.floor(coordinate.z)

                        let position = new Position(coordinate, eventData.data.additionalData.tickingArea)

                        if (eventData.data.additionalData.playerRequest["position"]) serveData.position = position
                        if (eventData.data.additionalData.playerRequest["blockType"]) {
                            let queryBlockTypeEventData = clientSystem.createEventData("NormaConstructor:queryBlockType")
                            queryBlockTypeEventData.data.position = position
                            queryBlockTypeEventData.data.playerID = playerID
                            clientSystem.broadcastEvent("NormaConstructor:queryBlockType", queryBlockTypeEventData)
                        }
                    }
                }
                storeData(user, serveData.blockType, serveData.position, serveData.direction)
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
                logger.logObject("debug", null)
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
                    let command = tag.split(' ')
                    if (command[0] == "add" && command[1] == "b") {
                        storeData(user, new BlockType(command[2], JSON.parse(command[3])), undefined, undefined)
                    }
                    else if (command[0] == "set" && command[1] == "o") {
                        user.getCurrentState()[command[2]] = command[3]
                    }
                }
                eventData.data.additionalData.forEach((tag) => {
                    if (tag) parseTag(tag)
                })
                break;
            }
        }
    }

    function execute() {
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
        serverSystem.executeCommand(`/setblock ${coordinate.x} ${coordinate.y} ${coordinate.z} ${blockType.blockIdentifier.slice(blockType.blockIdentifier.indexOf(":") + 1)} ${tileData} replace`, (commandResultData) => {

            // var targerBlock = serverSystem.getBlock(position.tickingArea, coordinate.x, coordinate.y, coordinate.z)

            // var targetBlockStateComponent = serverSystem.getComponent(targerBlock, "minecraft:blockstate")
            // targetBlockStateComponent.data = blockType.blockState
            // serverSystem.applyComponentChanges(targerBlock, targetBlockStateComponent)
        });
    }

    serverSystem.shutdown=function(){
        
    }
    
}