var serverSystem = server.registerSystem(0, 0);

function Coordinate(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
}
function Position(coordinate, tickingArea) {
    this.coordinate = coordinate
    this.tickingArea = tickingArea
}
function BlockType(blockIdentifier, blockState) {
    this.blockIdentifier = blockIdentifier
    this.blockState = blockState
}

serverSystem.initialize = function () {

    const scriptLoggerConfig = serverSystem.createEventData("minecraft:script_logger_config");
    scriptLoggerConfig.data.log_errors = true;
    scriptLoggerConfig.data.log_information = true;
    scriptLoggerConfig.data.log_warnings = true;
    serverSystem.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);

    serverSystem.registerEventData(
        "worldedit:getPosition",
        {
            position: new Position(
                new Coordinate(undefined, undefined, undefined),
                undefined
            ),
            playerID: undefined
        }
    )
    serverSystem.registerEventData(
        "worldedit:getBlockType",
        {
            blockType: new BlockType(undefined, undefined),
            playerID: undefined
        }
    )
    serverSystem.registerEventData("worldedit:ExecutionRequest", { playerID: undefined })

    serverSystem.listenForEvent("minecraft:player_placed_block", (eventData) => {

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

        let getblockTypeEventData = serverSystem.createEventData("worldedit:getBlockType")
        getblockTypeEventData.data.blockType = blockType
        getblockTypeEventData.data.playerID = eventData.data.player.id
        serverSystem.broadcastEvent("worldedit:getBlockType", getblockTypeEventData)

    })
    serverSystem.listenForEvent("minecraft:entity_created", (eventData) => {
        //displayChat(JSON.stringify(eventData,null,'    '))
        var entity = eventData.data.entity;
        if (entity.__identifier__ === "worldedit:select") {
            var position = serverSystem.getComponent(entity, "minecraft:position").data;

            displayChat(`\nSelecting position:\nx:${position.x}\ny:${position.y}\nz:${position.z}`);

            positionArray.push(position);
            if (positionArray.length >= 3) {
                displayChat("\nWarning:Positions exceeded.The first position is ignored.");
                positionArray.shift();
            }
            //serverSystem.destroyEntity(entity);
        }
        else if (entity.__identifier__ === "worldedit:execute") {
            displayChat("§b NZ is JULAO!")

            //displayChat(`/fill ${positionArray[0].x} ${positionArray[0].y} ${positionArray[0].z} ${positionArray[1].x} ${positionArray[1].y} ${positionArray[1].z} ${block.__identifier__.slice("minecraft:".length)}`);
            //serverSystem.executeCommand(`/fill ${positionArray[0].x} ${positionArray[0].y} ${positionArray[0].z} ${positionArray[1].x} ${positionArray[1].y} ${positionArray[1].z} ${block.__identifier__.slice("minecraft:".length)}`, (commandResultData) => { ; });
            var minPosition = {
                x: Math.min(positionArray[0].x, positionArray[1].x),
                y: Math.min(positionArray[0].y, positionArray[1].y),
                z: Math.min(positionArray[0].z, positionArray[1].z),
            }
            var maxPosition = {
                x: Math.max(positionArray[0].x, positionArray[1].x),
                y: Math.max(positionArray[0].y, positionArray[1].y),
                z: Math.max(positionArray[0].z, positionArray[1].z)
            }

            displayChat(minPosition.x)
            displayChat(minPosition.y)
            displayChat(minPosition.z)
            displayChat(maxPosition.x)
            displayChat(maxPosition.y)
            displayChat(maxPosition.z)

            for (var x = minPosition.x; x <= maxPosition.x; x++) {
                for (var y = minPosition.y; y <= maxPosition.y; y++) {
                    for (var z = minPosition.z; z <= maxPosition.z; z++) {
                        displayChat("Position:")
                        displayChat(x)
                        displayChat(y)
                        displayChat(z)
                        generate(x, y, z)
                    }
                }
            }


            //serverSystem.destroyEntity(entity);
        }
    })

    serverSystem.listenForEvent("minecraft:block_interacted_with", (eventData) => {
        //TODO:Verify whether the player is permitted to use this addon.
        let handContainer = serverSystem.getComponent(eventData.data.player, "minecraft:hand_container").data
        let mainHandItem = handContainer[0].__identifier__
        switch (mainHandItem) {
            case "minecraft:wooden_axe": {
                //Set position.
                let position = new Position(
                    new Coordinate(undefined, undefined, undefined),
                    undefined
                )

                position.coordinate = eventData.data.block_position
                position.tickingArea = serverSystem.getComponent(eventData.data.player, "minecraft:tick_world").data.ticking_area

                let getPositionEventData = serverSystem.createEventData("worldedit:getPosition")
                getPositionEventData.data.position = position
                getPositionEventData.data.playerID = eventData.data.player.id
                serverSystem.broadcastEvent("worldedit:getPosition", getPositionEventData)

                break;
            }
            case "minecraft:stone_axe": {
                //Execute.
                let executeRequestEventData = serverSystem.createEventData("worldedit:ExecutionRequest")
                executeRequestEventData.data.playerID = eventData.data.player.id
                serverSystem.broadcastEvent("worldedit:ExecutionRequest", executeRequestEventData)
                break;
            }
        }

    })

    serverSystem.listenForEvent("worldedit:ExecutionResponse", (eventData) => {
        //displayObject(eventData)
        for (let block of eventData.data.blockArray) setBlock(block)
    })
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

function setBlock(block) {

    displayChat("§b We all agree, NZ is JULAO!")
    displayObject(block)
    let blockType = block.blockType
    let position = block.position
    let coordinate = position.coordinate

    serverSystem.executeCommand(`/setblock ${coordinate.x} ${coordinate.y} ${coordinate.z} ${blockType.blockIdentifier.slice(blockType.blockIdentifier.indexOf(":") + 1)}`, (commandResultData) => {

        displayObject(commandResultData);
        displayChat("Position now:")
        displayObject(coordinate)

        var targerBlock = serverSystem.getBlock(position.tickingArea, coordinate.x, coordinate.y, coordinate.z)

        displayChat(JSON.stringify(targerBlock, null, '    '))

        var targetBlockStateComponent = serverSystem.getComponent(targerBlock, "minecraft:blockstate")
        targetBlockStateComponent.data = blockType.blockState
        serverSystem.applyComponentChanges(targerBlock, targetBlockStateComponent)
    });
}