var clientSystem = client.registerSystem(0, 0);

var playerID = undefined
var generatorIndex = 0
var tick = 0
var blockQuery = []

import { Coordinate, Position, BlockType, Block, Parameter, LengthRequired, Usage, Description, Generator } from '../utils'

let generatorArray = []
generatorArray.push(
    new Generator(
        new Description("Create a solid rectangle with two points.", new Usage(["First point", "Second point"], ["BlockType"], [])),
        new Parameter([], [], []),
        new LengthRequired(2, 1, 0),
        function () {

            displayChat("§b NZ is JULAO!")

            let positionArray = this.parameter.positionArray
            let blockTypeArray = this.parameter.blockTypeArray

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

                        blockArray.push(new Block(
                            new Position(
                                new Coordinate(x, y, z),
                                positionArray[0].tickingArea
                            ),
                            blockTypeArray[0])
                        )
                    }
                }
            }
            return blockArray
        },
        function () {
            let result = new String()
            if (generatorArray[generatorIndex].lengthRequired.blockTypeArray > generatorArray[generatorIndex].parameter.blockTypeArray.length)
                result += "Too few blockTypes!Refusing to execute.\n"
            if (generatorArray[generatorIndex].lengthRequired.positionArray > generatorArray[generatorIndex].parameter.positionArray.length)
                result += "Too few positions!Refusing to execute."
            if (result == "") result = "success"

            return result;
        }
    )
)

generatorArray.push(
    new Generator(
        new Description("test", new Usage([], [], [])),
        new Parameter([], [], []),
        new LengthRequired(0, 0, 0),
        function () { },
        function () { }
    )
)

clientSystem.initialize = function () {

    clientSystem.registerEventData("NormaConstructor:ExecutionResponse", { blockArray: undefined })
    clientSystem.registerEventData("NormaConstructor:setBlock", { block: undefined })

    clientSystem.listenForEvent("minecraft:client_entered_world", (eventData) => {
        playerID = eventData.data.player.id

        const scriptLoggerConfig = clientSystem.createEventData("minecraft:script_logger_config");
        scriptLoggerConfig.data.log_errors = true;
        scriptLoggerConfig.data.log_information = true;
        scriptLoggerConfig.data.log_warnings = true;
        clientSystem.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);

        //Wait until the mobile version officially support scripting API.

        // let loadUIEventData = clientSystem.createEventData("minecraft:load_ui")
        // loadUIEventData.data.path = "HUD.html"
        // loadUIEventData.data.options = {
        //     absorbs_input: false,
        //     always_accepts_input: false,
        //     force_render_below: true,
        //     is_showing_menu: false,
        //     render_game_behind: true,
        //     render_only_when_topmost: false,
        //     should_steal_mouse: true
        // }
        // clientSystem.broadcastEvent("minecraft:load_ui", loadUIEventData)
        let loadUIEventData = clientSystem.createEventData("minecraft:load_ui")
        loadUIEventData.data.path = "menu/menu.html"
        //In case of EMERGENCY

        // loadUIEventData.data.options = {
        //     absorbs_input: false,
        //     always_accepts_input: false,
        //     force_render_below: true,
        //     is_showing_menu: false,
        //     render_game_behind: true,
        //     render_only_when_topmost: false,
        //     should_steal_mouse: true
        // }
        clientSystem.broadcastEvent("minecraft:load_ui", loadUIEventData)

        //Need to enable "Enable Content Log File" in "General"-"Profile"-"Content Log Settings"
        client.log("Logging started")
    })
    clientSystem.listenForEvent("NormaConstructor:getPosition", (eventData) => {
        if (playerID == eventData.data.playerID) {
            displayObject(eventData.data.position)
            if (generatorArray[generatorIndex].parameter.positionArray.length >= generatorArray[generatorIndex].lengthRequired.positionArray) {
                displayChat("Too many positions!New one is ignored")
            }
            else {
                generatorArray[generatorIndex].parameter.positionArray.push(eventData.data.position)
            }
        }

    })
    clientSystem.listenForEvent("NormaConstructor:getBlockType", (eventData) => {
        if (playerID == eventData.data.playerID) {
            displayObject(eventData.data.blockType)
            if (generatorArray[generatorIndex].parameter.blockTypeArray.length >= generatorArray[generatorIndex].lengthRequired.blockTypeArray) {
                displayChat("Too many blockTypes!New one is ignored")
            }
            else {
                generatorArray[generatorIndex].parameter.blockTypeArray.push(eventData.data.blockType)
            }
        }
    })
    clientSystem.listenForEvent("NormaConstructor:command", (eventData) => {
        if (playerID == eventData.data.playerID) {
            switch (eventData.data.command) {
                case "removeLastPosition": {
                    displayChat("Removing the last position...")
                    generatorArray[generatorIndex].parameter.positionArray.pop()
                    displayChat("Current positionArray:")
                    displayObject(generatorArray[generatorIndex].parameter.positionArray)
                    break;
                }
                case "removeLastblockType": {
                    displayChat("Removing the last blockType...")
                    generatorArray[generatorIndex].parameter.blockTypeArray.pop()
                    displayChat("Current blockTypeArray:")
                    displayObject(generatorArray[generatorIndex].parameter.blockTypeArray)
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
                    displayObject(generatorArray[generatorIndex].parameter.positionArray)
                    displayChat("Current blockTypeArray:")
                    displayObject(generatorArray[generatorIndex].parameter.blockTypeArray)
                    break;
                }
            }
        }
    })
    clientSystem.listenForEvent("NormaConstructor:ExecutionRequest", (eventData) => {
        if (playerID == eventData.data.playerID) {
            let validateResult = generatorArray[generatorIndex].parameterValidator();
            if (validateResult != "success") displayChat("§c " + validateResult)
            else {
                displayChat("Execution started.")
                let blockArray = generatorArray[0].mainGenerator()

                blockQuery = blockArray
                // let executionResponseEventData = clientSystem.createEventData("NormaConstructor:ExecutionResponse")
                // executionResponseEventData.data.blockArray = blockArray
                // clientSystem.broadcastEvent("NormaConstructor:ExecutionResponse", executionResponseEventData)
                generatorArray[0].mainGenerator()

                generatorArray[generatorIndex].parameter.blockTypeArray = []
                generatorArray[generatorIndex].parameter.positionArray = []
            }
        }
    })
    clientSystem.listenForEvent("minecraft:ui_event", (eventData) => {
        displayObject(eventData)
        if (eventData.data.slice(0, eventData.data.indexOf(":")) == "NormaConstructor") {
            let uiData = JSON.parse(eventData.data.slice(eventData.data.indexOf(":") + 1))
            displayObject(uiData)
            switch (uiData.type) {
                case "command": {
                    switch (uiData.data) {
                        case "closeMenu": {
                            let closeMenuEventData = clientSystem.createEventData("minecraft:unload_ui")
                            closeMenuEventData.data.path = "menu/menu.html"
                            displayObject(closeMenuEventData)
                            clientSystem.broadcastEvent("minecraft:unload_ui", closeMenuEventData)
                            break;
                        }
                        //Must wait until the UI is loaded
                        case "loadDescription": {
                            let sendUIEventData = clientSystem.createEventData("minecraft:send_ui_event")
                            sendUIEventData.data.eventIdentifier = "NormaConstructor:loadDescription"
                            sendUIEventData.data.data = JSON.stringify(
                                (function () {
                                    let descriptionArray = [];
                                    generatorArray.forEach(generator => {
                                        descriptionArray.push(generator.description)
                                    })
                                    return descriptionArray
                                }()), null, '    '
                            )
                            displayObject(sendUIEventData)
                            clientSystem.broadcastEvent("minecraft:send_ui_event", sendUIEventData)

                            break;
                        }
                    }
                    break;
                }
                case "displayChat": {
                    displayChat(uiData.data)
                    break;
                }
            }
        }
    })
};

clientSystem.update = function () {
    if ((++tick) % 5 == 0 && blockQuery.length > 0) {
        // let setBlockEventData = clientSystem.createEventData("NormaConstructor:setBlock")
        // setBlockEventData.data.block = blockQuery.pop()
        // clientSystem.broadcastEvent("NormaConstructor:setBlock", setBlockEventData)

        let executionResponseEventData = clientSystem.createEventData("NormaConstructor:ExecutionResponse")
        executionResponseEventData.data.blockArray = blockQuery.splice(0,100)
        clientSystem.broadcastEvent("NormaConstructor:ExecutionResponse", executionResponseEventData)
    }
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