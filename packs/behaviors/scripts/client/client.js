var clientSystem = client.registerSystem(0, 0);

var playerID = undefined
var generatorIndex = 0
var globalSettings = {
    "generateByServer": true,
}
var tick = 0
var blockQuery = []

import { Coordinate, Position, BlockType, Block, Usage, Description, Generator } from '../utils'
let generatorArray = [];
(function () {
    generatorArray.push(
        new Generator(
            new Description("Create a solid rectangle with two points.",
                new Usage(
                    ["First point", "Second point"],
                    ["BlockType"],
                    {})
            ),

            {
                "positionArrayLengthRequired": 2,
                "blockTypeArrayLengthRequired": 1
            },
            [undefined, undefined],
            [undefined],

            function (position) {
                displayObject(position)
                let indexOfVacancy = this.positionArray.indexOf(undefined)
                if (indexOfVacancy == -1) displayChat("Too many positions!New one is ignored")
                else this.positionArray[indexOfVacancy] = position
            },
            function (blockType) {
                displayObject(blockType)
                let indexOfVacancy = this.blockTypeArray.indexOf(undefined)
                if (indexOfVacancy == -1) displayChat("Too many blockTypes!New one is ignored")
                else this.blockTypeArray[indexOfVacancy] = blockType
            },
            function (index) {
                if (index === undefined)
                    for (index = this.positionArray.length - 1; index >= 0; index--)
                        if (this.positionArray[index] != undefined) break;
                if (index >= 0) this.positionArray[index] = undefined
                displayObject(this.positionArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.blockTypeArray.length - 1; index >= 0; index--)
                        if (this.blockTypeArray[index] != undefined) break;
                if (index >= 0) this.blockTypeArray[index] = undefined
                displayObject(this.blockTypeArray)
            },

            function () {
                let result = new String()
                if (this.blockTypeArray.indexOf(undefined) != -1)
                    result += "Too few blockTypes!Refusing to execute.\n"
                if (this.positionArray.indexOf(undefined) != -1)
                    result += "Too few positions!Refusing to execute."
                if (result == "") result = "success"

                return result;
            },
            function () {
                let blockArray = []

                displayChat("§b NZ is JULAO!")

                let positionArray = this.positionArray
                let blockTypeArray = this.blockTypeArray
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

                displayChat("§b Yes, NZ is JULAO!")

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
                this.positionArray = [undefined, undefined]
                this.blockTypeArray = [undefined]
            }
        )
    )

    generatorArray.push(
        new Generator(
            new Description("Test.",
                new Usage(
                    [],
                    [],
                    {})
            ),

            {},
            new Array(0),
            new Array(0),

            function (position) {
            },
            function (blockType) {
            },
            function (index) {
            },
            function (index) {
            },

            function () {
            },
            function () {
            },
            function () {
            }
        )
    )
}())


clientSystem.initialize = function () {

    clientSystem.registerEventData("NormaConstructor:generateWithBlockArray", { playerID: undefined, blockArray: undefined })
    clientSystem.registerEventData("NormaConstructor:generateWithRawData", { playerID: undefined, generator: undefined })
    clientSystem.registerEventData("NormaConstructor:setBlock", { playerID: undefined, block: undefined })

    clientSystem.listenForEvent("minecraft:client_entered_world", (eventData) => {
        playerID = eventData.data.player.id

        displayObject(generatorArray)

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
            generatorArray[generatorIndex].addPosition(eventData.data.position)
        }
    })
    clientSystem.listenForEvent("NormaConstructor:getBlockType", (eventData) => {
        if (playerID == eventData.data.playerID) {
            generatorArray[generatorIndex].addBlockType(eventData.data.blockType)
            client.log(JSON.stringify(eventData.data.blockType,null,"    "))
        }
    })
    clientSystem.listenForEvent("NormaConstructor:command", (eventData) => {
        if (playerID == eventData.data.playerID) {
            switch (eventData.data.command) {
                case "removeLastPosition": {
                    displayChat("Removing the last position...")
                    generatorArray[generatorIndex].removePosition()
                    break;
                }
                case "removeLastblockType": {
                    displayChat("Removing the last blockType...")
                    generatorArray[generatorIndex].removeBlockType()
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
            let validateResult = generatorArray[generatorIndex].validateParameter();
            if (validateResult != "success") displayChat("§c " + validateResult)
            else {
                displayChat("Execution started.")

                if (globalSettings["generateByServer"] == false) {
                    let blockArray = generatorArray[0].generate()
                    Array.prototype.push.apply(blockQuery, blockArray);
                }
                else {
                    let generateWithRawDataEventData = clientSystem.createEventData("NormaConstructor:generateWithRawData")
                    generateWithRawDataEventData.data.playerID = playerID
                    generateWithRawDataEventData.data.generator = JSON.stringify(generatorArray[generatorIndex],null,'')
                    displayObject(generateWithRawDataEventData)
                    clientSystem.broadcastEvent("NormaConstructor:generateWithRawData",generateWithRawDataEventData)
                    
                }

                generatorArray[generatorIndex].postGenerate()
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

        let generateWithBlockArrayEventData = clientSystem.createEventData("NormaConstructor:generateWithBlockArray")
        generateWithBlockArrayEventData.data.playerID = playerID
        generateWithBlockArrayEventData.data.blockArray = blockQuery.splice(0, 100)
        clientSystem.broadcastEvent("NormaConstructor:generateWithBlockArray", generateWithBlockArrayEventData)
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

