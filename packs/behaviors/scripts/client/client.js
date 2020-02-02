var clientSystem = client.registerSystem(0, 0);

var playerID = undefined
var generatorIndex = 0

//TODO:Wrap up the constructor && find better solution.
class Coordinate {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
class Position {
    constructor(coordinate, tickingArea) {
        this.coordinate = coordinate;
        this.tickingArea = tickingArea;
    }
}
class BlockType {
    constructor(blockIdentifier, blockState) {
        this.blockIdentifier = blockIdentifier;
        this.blockState = blockState;
    }
}
class Block {
    constructor(position, blockType) {
        this.position = position;
        this.blockType = blockType;
    }
}
class LengthRequired {
    constructor(positionArrayLengthRequired, blockTypeArrayLengthRequired) {
        this.positionArray = positionArrayLengthRequired;
        this.blockTypeArray = blockTypeArrayLengthRequired;
    }
}
//TODO:Refactor generator
class Generator {
    constructor(name, positionArray, blockTypeArray, lengthRequired, mainGenerator) {
        this.name = name;
        this.positionArray = positionArray;
        this.blockTypeArray = blockTypeArray;
        this.lengthRequired = lengthRequired;
        this.mainGenerator = mainGenerator;
    }
}

let generatorArray = []
generatorArray.push(new Generator("Create a solid rectangle with two points.", [], [], new LengthRequired(2, 1), function () {

    displayChat("§b NZ is JULAO!")

    let positionArray = this.positionArray
    let blockTypeArray = this.blockTypeArray

    if (this.lengthRequired.positionArray != positionArray.length || this.lengthRequired.blockTypeArray != blockTypeArray.length) return [];

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

    for (let x = minCoordinate.x; x <= maxCoordinate.x; x++) {
        for (let y = minCoordinate.y; y <= maxCoordinate.y; y++) {
            for (let z = minCoordinate.z; z <= maxCoordinate.z; z++) {
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

    clientSystem.registerEventData("NormaConstructor:ExecutionResponse", { blockArray: undefined })

    clientSystem.listenForEvent("minecraft:client_entered_world", (eventData) => {
        playerID = eventData.data.player.id

        const scriptLoggerConfig = clientSystem.createEventData("minecraft:script_logger_config");
        scriptLoggerConfig.data.log_errors = true;
        scriptLoggerConfig.data.log_information = true;
        scriptLoggerConfig.data.log_warnings = true;
        clientSystem.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);

        // let uiEventData = clientSystem.createEventData("minecraft:load_ui")
        // uiEventData.data.path = "HUD.html"
        // uiEventData.data.options = {
        //     absorbs_input: false,
        //     always_accepts_input: false,
        //     force_render_below: true,
        //     is_showing_menu: false,
        //     render_game_behind: true,
        //     render_only_when_topmost: false,
        //     should_steal_mouse: true
        // }
        // clientSystem.broadcastEvent("minecraft:load_ui", uiEventData)
        let uiEventData = clientSystem.createEventData("minecraft:load_ui")
        uiEventData.data.path = "menu/menu.html"
        clientSystem.broadcastEvent("minecraft:load_ui", uiEventData)

        //Need to enable "Enable Content Log File" in "General"-"Profile"-"Content Log Settings"
        client.log("Logging started")
    })
    clientSystem.listenForEvent("NormaConstructor:getPosition", (eventData) => {
        if (playerID == eventData.data.playerID) {
            displayObject(eventData.data.position)
            if (generatorArray[generatorIndex].positionArray.length >= generatorArray[generatorIndex].lengthRequired.positionArray) {
                displayChat("Too many positions!New one is ignored")
            }
            else {
                generatorArray[generatorIndex].positionArray.push(eventData.data.position)
            }
        }

    })
    clientSystem.listenForEvent("NormaConstructor:getBlockType", (eventData) => {
        if (playerID == eventData.data.playerID) {
            displayObject(eventData.data.blockType)
            if (generatorArray[generatorIndex].blockTypeArray.length >= generatorArray[generatorIndex].lengthRequired.blockTypeArray) {
                displayChat("Too many blockTypes!New one is ignored")
            }
            else {
                generatorArray[generatorIndex].blockTypeArray.push(eventData.data.blockType)
            }
        }
    })
    clientSystem.listenForEvent("NormaConstructor:command", (eventData) => {
        if (playerID == eventData.data.playerID) {
            switch (eventData.data.command) {
                case "removeLastPosition": {
                    displayChat("Removing the last position...")
                    generatorArray[generatorIndex].positionArray.pop()
                    displayChat("Current positionArray:")
                    displayObject(generatorArray[generatorIndex].positionArray)
                    break;
                }
                case "removeLastblockType": {
                    displayChat("Removing the last blockType...")
                    generatorArray[generatorIndex].blockTypeArray.pop()
                    displayChat("Current blockTypeArray:")
                    displayObject(generatorArray[generatorIndex].blockTypeArray)
                    break;
                }
                case "chooseNextGenerator": {
                    displayChat("Choosing next generator...")
                    generatorIndex = (generatorIndex + 1) % generatorArray.length
                    displayChat("Current generator:")
                    displayObject(generatorArray[generatorIndex])
                    break;
                }
                case "showSavedData": {
                    displayChat("Current positionArray:")
                    displayObject(generatorArray[generatorIndex].positionArray)
                    displayChat("Current blockTypeArray:")
                    displayObject(generatorArray[generatorIndex].blockTypeArray)
                    break;
                }
            }
        }
    })
    clientSystem.listenForEvent("NormaConstructor:ExecutionRequest", (eventData) => {
        if (playerID == eventData.data.playerID) {
            if (generatorArray[generatorIndex].lengthRequired.blockTypeArray > generatorArray[generatorIndex].blockTypeArray.length)
                displayChat("Too few blockTypes!Refusing to execute.")
            else if (generatorArray[generatorIndex].lengthRequired.positionArray > generatorArray[generatorIndex].positionArray.length)
                displayChat("Too few positions!Refusing to execute.")
            else {
                displayChat("Execution started.")
                let blockArray = generatorArray[0].mainGenerator()
                let executionResponseEventData = clientSystem.createEventData("NormaConstructor:ExecutionResponse")
                executionResponseEventData.data.blockArray = blockArray
                clientSystem.broadcastEvent("NormaConstructor:ExecutionResponse", executionResponseEventData)

                generatorArray[generatorIndex].blockTypeArray = []
                generatorArray[generatorIndex].positionArray = []
            }
        }
    })
    clientSystem.listenForEvent("minecraft:ui_event", (eventData) => {
        displayChat(eventData)
        if (eventData.data.slice(0, eventData.data.indexOf(":")) == "NormaConstructor") {
            let uiData = eventData.data.slice(eventData.data.indexOf(":") + 1)
            displayObject(uiData)
            switch (uiData) {
                case "closeMenu": {
                    let closeMenuEventData = clientSystem.createEventData("minecraft:unload_ui")
                    closeMenuEventData.data.path = "menu/menu.html"
                    displayObject(closeMenuEventData)
                    clientSystem.broadcastEvent("minecraft:unload_ui", closeMenuEventData)
                    break;
                }
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