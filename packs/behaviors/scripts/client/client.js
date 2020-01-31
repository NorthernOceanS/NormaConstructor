var clientSystem = client.registerSystem(0, 0);
var playerID = undefined
var generatorIndex = 0
// let positionArray = []
// let blockTypeArray = []
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
function Block(position, blockType) {
    this.position = position
    this.blockType = blockType
}
function Generator(name, positionArray, positionArrayLengthRequired, blockTypeArray, blockTypeArrayLengthRequired, generator) {
    this.name = name;
    this.positionArray = positionArray
    this.positionArrayLengthRequired = positionArrayLengthRequired
    this.blockTypeArray = blockTypeArray
    this.blockTypeArrayLengthRequired = blockTypeArrayLengthRequired
    this.generator = generator
}
let generatorArray = []
generatorArray.push(new Generator("Create a solid rectangle with two points.", [], 2, [], 1, function () {

    displayChat("§b NZ is JULAO!")

    let positionArray = this.positionArray
    let blockTypeArray = this.blockTypeArray

    if (this.positionArrayLengthRequired != positionArray.length || this.blockTypeArrayLengthRequired != blockTypeArray.length) return [];

    displayChat("§b Yes, NZ is JULAO!")

    let blockArray = []

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

    // displayObject(minCoordinate)
    // displayObject(maxCoordinate)

    for (let x = minCoordinate.x; x <= maxCoordinate.x; x++) {
        for (let y = minCoordinate.y; y <= maxCoordinate.y; y++) {
            for (let z = minCoordinate.z; z <= maxCoordinate.z; z++) {
                // displayChat("Position:")
                // displayChat(x)
                // displayChat(y)
                // displayChat(z)
                blockArray.push(
                    new Block(
                        new Position(
                            new Coordinate(x, y, z),
                            positionArray[0].tickingArea
                        ),
                        blockTypeArray[0]
                    )
                )
            }
        }
    }
    return blockArray
}))

clientSystem.initialize = function () {

    clientSystem.registerEventData("worldedit:ExecutionResponse", { blockArray: undefined })

    clientSystem.listenForEvent("minecraft:client_entered_world", (eventData) => {
        playerID = eventData.data.player.id

        const scriptLoggerConfig = clientSystem.createEventData("minecraft:script_logger_config");
        scriptLoggerConfig.data.log_errors = true;
        scriptLoggerConfig.data.log_information = true;
        scriptLoggerConfig.data.log_warnings = true;
        clientSystem.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);

    })
    clientSystem.listenForEvent("worldedit:getPosition", (eventData) => {
        if (playerID == eventData.data.playerID) {
            displayObject(eventData.data.position)
            if (generatorArray[generatorIndex].positionArray.length >= generatorArray[generatorIndex].positionArrayLengthRequired) {
                displayChat("Too many positions.New one is ignored")
            }
            else {
                generatorArray[generatorIndex].positionArray.push(eventData.data.position)
            }
        }

    })
    clientSystem.listenForEvent("worldedit:getBlockType", (eventData) => {
        if (playerID == eventData.data.playerID) {
            displayObject(eventData.data.blockType)
            if (generatorArray[generatorIndex].blockTypeArray.length >= generatorArray[generatorIndex].blockTypeArrayLengthRequired) {
                displayChat("Too many blocktypes.New one is ignored")
            }
            else {
                generatorArray[generatorIndex].blockTypeArray.push(eventData.data.blockType)
            }
        }
    })
    clientSystem.listenForEvent("worldedit:ExecutionRequest", (eventData) => {
        if (playerID == eventData.data.playerID) {
            if (generatorArray[generatorIndex].blockTypeArrayLengthRequired > generatorArray[generatorIndex].blockTypeArray.length)
                displayChat("Too few blocktypes!Refusing to execute.")
            else if (generatorArray[generatorIndex].positionArrayLengthRequired > generatorArray[generatorIndex].positionArray.length)
                displayChat("Too few positions!Refusing to execute.")
            else {
                displayChat("Execution started.")
                displayObject(generatorArray[generatorIndex].blockTypeArray)
                displayObject(generatorArray[generatorIndex].positionArray)
                let blockArray = generatorArray[0].generator()
                //displayObject(blockArray)
                let executionResponseEventData = clientSystem.createEventData("worldedit:ExecutionResponse")
                executionResponseEventData.data.blockArray = blockArray
                clientSystem.broadcastEvent("worldedit:ExecutionResponse", executionResponseEventData)

                generatorArray[generatorIndex].blockTypeArray = []
                generatorArray[generatorIndex].positionArray = []
            }
        }
    })
};

clientSystem.update = function () {

};

function displayObject(object) {
    displayChat(JSON.stringify(object, null, '    '))
}
function displayChat(message) {
    let eventData = clientSystem.createEventData("minecraft:display_chat_event");
    if (eventData) {
        eventData.data.message = message;
        clientSystem.broadcastEvent("minecraft:display_chat_event", eventData);
    }
}