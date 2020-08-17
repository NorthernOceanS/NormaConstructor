var clientSystem = client.registerSystem(0, 0);

var playerID = undefined
var generatorIndex = 0
var tick = 0
var buildInstructionsQuery = []

import { Coordinate, Position, BlockType, Block, Direction, Usage, Description, Generator } from '../constructor'
import { utils } from '../utils'
let generatorArray = [];
let coordinatePlayerLookingAt = undefined



clientSystem.initialize = function () {


    clientSystem.registerEventData("NormaConstructor:ExecutionResponse", { playerID: undefined, buildInstructions: undefined })
    clientSystem.registerEventData("NormaConstructor:setServerSideOption", { playerID: undefined, option: { key: undefined, value: undefined } })
    clientSystem.registerEventData("NormaConstructor:queryBlockType", {
        playerID: undefined,
        position: undefined
    })

    clientSystem.listenForEvent("minecraft:hit_result_continuous", (eventData) => { coordinatePlayerLookingAt = eventData.data.position })
    clientSystem.listenForEvent("minecraft:client_entered_world", (eventData) => {

        playerID = utils.misc.generatePlayerIDFromUniqueID(eventData.data.player.__unique_id__)

        //Logging:
        const scriptLoggerConfig = clientSystem.createEventData("minecraft:script_logger_config");
        scriptLoggerConfig.data.log_errors = true;
        scriptLoggerConfig.data.log_information = true;
        scriptLoggerConfig.data.log_warnings = true;
        clientSystem.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);

        //Set default setServerSideOption:(Yes I hate it too)
        setServerSideOption("__requestAdditionalPosition", false)
        setServerSideOption("__requestAdditionalBlockType", false)
        setServerSideOption("__requestAdditionalDirection", false)

        //Wait until the mobile version officially supports scripting API.

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

        //Need to enable "Enable Content Log File" in "General"-"Profile"-"Content Log Settings"
        client.log("Logging started")


    })



    clientSystem.listenForEvent("NormaConstructor:displayChatToClient", (eventData) => {
        if (playerID == eventData.data.playerID)
            displayChat(eventData.data.message)
    })
    clientSystem.listenForEvent("NormaConstructor:command", (eventData) => {
        if (playerID == eventData.data.playerID) {
            switch (eventData.data.command) {
                case "get_data": {
                    displayObject(eventData.data.additionalData)

                    let serveData = { blockType: undefined, position: undefined, direction: undefined }

                    let direction = eventData.data.additionalData.direction
                    if (eventData.data.additionalData.playerRequest["direction"]) serveData.direction = direction

                    if (eventData.data.additionalData.isGetAir) serveData.blockType = new BlockType("minecraft:air", null)

                    if (eventData.data.additionalData.playerRequest["position"] || eventData.data.additionalData.playerRequest["blockType"]) {
                        let rawCoordinate = coordinatePlayerLookingAt
                        if (rawCoordinate == null) {
                            displayChat("§c Unable to get the block position. Please retry.")
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
                    storeData(serveData.blockType, serveData.position, serveData.direction)
                    break;
                }
                case "remove_last_position": {
                    displayChat("Removing the last position...")
                    generatorArray[generatorIndex].removePosition()
                    break;
                }
                case "remove_last_blocktype": {
                    displayChat("Removing the last blockType...")
                    generatorArray[generatorIndex].removeBlockType()
                    break;
                }
                case "remove_last_direction": {
                    displayChat("Removing the last direction...")
                    generatorArray[generatorIndex].removeDirection()
                    break;
                }
                case "choose_next_generator": {
                    displayChat("Choosing next generator...")
                    generatorIndex = (generatorIndex + 1) % generatorArray.length
                    displayChat("Current generator:")
                    displayObject(generatorArray[generatorIndex])
                    break;
                }
                case "show_saved_data": {
                    displayChat("Current positionArray:")
                    displayObject(generatorArray[generatorIndex].positionArray)
                    displayChat("Current blockTypeArray:")
                    displayObject(generatorArray[generatorIndex].blockTypeArray)
                    displayChat("Current directionArray:")
                    displayObject(generatorArray[generatorIndex].directionArray)
                    displayChat("Current option:")
                    displayObject(generatorArray[generatorIndex].option)
                    break;
                }
                case "execute": {
                    execute();
                    break;
                }
                case "show_menu": {
                    let loadUIEventData = clientSystem.createEventData("minecraft:load_ui")
                    loadUIEventData.data.path = "menu/menu.html"
                    clientSystem.broadcastEvent("minecraft:load_ui", loadUIEventData)
                    break;
                }
            }
        }
    })
    clientSystem.listenForEvent("NormaConstructor:serveData", (eventData) => {
        displayChat("RECEIVE:")
        displayObject(eventData)
        if (playerID == eventData.data.playerID) {
            storeData(eventData.data.blockType, eventData.data.position, eventData.data.direction)

        }
    })

    clientSystem.listenForEvent("minecraft:ui_event", (eventData) => {
        if (eventData.data.slice(0, eventData.data.indexOf(":")) == "NormaConstructor") {
            let uiData = JSON.parse(eventData.data.slice(eventData.data.indexOf(":") + 1))

            switch (uiData.type) {
                //Must wait until the UI is loaded

                case "get": {
                    let sendUIEventData = clientSystem.createEventData("minecraft:send_ui_event")
                    sendUIEventData.data.eventIdentifier = "NormaConstructor:get"
                    sendUIEventData.data.data = JSON.stringify(generatorArray[generatorIndex].option[uiData.data], null, '    ')
                    clientSystem.broadcastEvent("minecraft:send_ui_event", sendUIEventData)
                    break;
                }
                case "set": {
                    generatorArray[generatorIndex].option[uiData.data.key] = uiData.data.value
                    break;
                }
                case "callUIHandler": {
                    generatorArray[generatorIndex].UIHandler(uiData.data)
                    break;
                }
                case "command": {
                    switch (uiData.data) {
                        case "reload": {
                            let sendUIEventData = clientSystem.createEventData("minecraft:send_ui_event")
                            sendUIEventData.data.eventIdentifier = "NormaConstructor:reload"
                            sendUIEventData.data.data = JSON.stringify({
                                description: generatorArray[generatorIndex].description,
                                option: generatorArray[generatorIndex].option
                            }, null, '    ')
                            clientSystem.broadcastEvent("minecraft:send_ui_event", sendUIEventData)
                            break;
                        }
                        case "execute": {
                            execute();
                            break;
                        }
                        case "closeMenu": {
                            let closeMenuEventData = clientSystem.createEventData("minecraft:unload_ui")
                            closeMenuEventData.data.path = "menu/menu.html"
                            clientSystem.broadcastEvent("minecraft:unload_ui", closeMenuEventData)
                            break;
                        }
                        case "chooseNextGenerator": {
                            generatorIndex = (generatorIndex + 1) % generatorArray.length
                            break;
                        }
                        case "chooseLastGenerator": {
                            generatorIndex = (generatorIndex - 1 + generatorArray.length) % generatorArray.length
                        }
                    }
                    break;
                }
                case "setServerSideOption": {
                    setServerSideOption(uiData.data.key, uiData.data.value)
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

    if ((++tick) % 5 == 0 && buildInstructionsQuery.length > 0) {

        let executionResponseEventData = clientSystem.createEventData("NormaConstructor:ExecutionResponse")
        executionResponseEventData.data.playerID = playerID
        executionResponseEventData.data.buildInstructions = buildInstructionsQuery.splice(0, 100)
        clientSystem.broadcastEvent("NormaConstructor:ExecutionResponse", executionResponseEventData)
    }
};

clientSystem.shutdown = function () {
    //TODO:Ask the server to delete the profile.(Maybe...not necessary.)
};

function storeData(blockType, position, direction) {
    if (blockType != undefined) generatorArray[generatorIndex].addBlockType(blockType)
    if (position != undefined) generatorArray[generatorIndex].addPosition(position)
    if (direction != undefined) generatorArray[generatorIndex].addDirection(direction)
    if (generatorArray[generatorIndex].option["__executeOnAllSatisfied"] && generatorArray[generatorIndex].validateParameter() == "success") execute()
}
function execute() {
    let validateResult = generatorArray[generatorIndex].validateParameter();
    if (validateResult != "success")
        displayChat("§c " + validateResult);
    else {
        displayChat("Execution started.");

        //The "buildInstructions" was named "blockArray" as it only consisted of blocks that are to be placed.
        let buildInstructions = generatorArray[generatorIndex].generate();
        buildInstructionsQuery = buildInstructionsQuery.concat(buildInstructions)
        //The following line is the original code which append the array to the query. Sadly, it will throw an error when there's too many blocks.
        //I...am not even sure if it is fixed.
        //Array.prototype.push.apply(buildInstructionsQuery, buildInstructions);

        generatorArray[generatorIndex].postGenerate();
    }
}
function setServerSideOption(key, value) {
    let setServerSideOptionEventData = clientSystem.createEventData("NormaConstructor:setServerSideOption")
    setServerSideOptionEventData.data.playerID = playerID
    setServerSideOptionEventData.data.option.key = key
    setServerSideOptionEventData.data.option.value = value
    clientSystem.broadcastEvent("NormaConstructor:setServerSideOption", setServerSideOptionEventData)
}

function displayObject(object) {
    displayChat(JSON.stringify(object, null, '    '))
}
function displayChat(message) {
    let eventData = clientSystem.createEventData("minecraft:display_chat_event");
    eventData.data.message = message;
    clientSystem.broadcastEvent("minecraft:display_chat_event", eventData);

}

///////////////////////////////////////////////////////////////////////////////////////////////////////
//Generators://////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////

/*(function () {
    generatorArray.push(
        new Generator(
            new Description("Test.",
                new Usage(
                    [],
                    [],
                    [],
                    [
                        { viewtype: "text", text: "NZ IS JULAO." },
                        {
                            viewtype: "button",
                            text: "Yes, NZ is JULAO.",
                            key: "CCC",
                            data: [
                                { value: "red", text: "Choosing red" },
                                { value: "blue", text: "Choosing blue" },
                                { value: "yellow", text: "Choosing yellow" }
                            ]
                        },
                        {
                            viewtype: "edittext",
                            text: "Of course, NZ is JULAO.",
                            key: "BBB",
                            default: 999
                        },
                        {
                            viewtype: "checkbox",
                            text: "We all agree, NZ is JULAO.",
                            key: "AAA",
                            data: [
                                { value: true, text: "Yes" },
                                { value: false, text: "OK." },
                            ]
                        }
                    ]
                )
            ),

            [],
            [],
            [],
            {
                "AAA": true,
                "BBB": 123,
                "CCC": "red"
            },

            function (position) {
                client.log(JSON.stringify(position, null, '    '))
            },
            function (blockType) {
                console.log(JSON.stringify(blockType, null, '    '))
            },
            function (direction) {
                console.log(JSON.stringify(direction, null, '    '))
            },
            function (index) {
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
}());*/

(function () {
    generatorArray.push(
        new Generator(
            new Description("Create a solid rectangle with two points.",
                new Usage(
                    ["First point", "Second point"],
                    ["BlockType"],
                    [],
                    [
                        {
                            viewtype: "button",
                            text: "Toggle quick execution.(Execute on all parameters satisfied)",
                            key: "__executeOnAllSatisfied",
                            data: [
                                { value: true, text: "On" },
                                { value: false, text: "Off" }
                            ]
                        }
                    ])
            ),

            [undefined, undefined],
            [undefined],
            [],
            {
                "positionArrayLengthRequired": 2,
                "blockTypeArrayLengthRequired": 1,
                "__executeOnAllSatisfied": false,
                "generateByServer": true
            },

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
            function (direction) {
                displayObject(direction)
                let indexOfVacancy = this.directionArray.indexOf(undefined)
                if (indexOfVacancy == -1) displayChat("Too many directions!New one is ignored")
                else this.directionArray[indexOfVacancy] = direction
            },
            function (index) {
                if (index === undefined)
                    for (index = this.positionArray.length - 1; index >= 0 && this.positionArray[index] == undefined; index--);
                if (index >= 0) this.positionArray[index] = undefined
                displayObject(this.positionArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.blockTypeArray.length - 1; index >= 0 && this.blockTypeArray[index] == undefined; index--);
                if (index >= 0) this.blockTypeArray[index] = undefined
                displayObject(this.blockTypeArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.directionArray.length - 1; index >= 0 && this.directionArray[index] == undefined; index--);
                if (index >= 0) this.directionArray[index] = undefined
                displayObject(this.directionArray)
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
                if (this.option.generateByServer) {
                    return [{
                        "type": "fill", "data": {
                            blockType: this.blockTypeArray[0],
                            startCoordinate: this.positionArray[0].coordinate,
                            endCoordinate: this.positionArray[1].coordinate
                        }
                    }]
                }
                else {
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
                }

            },
            function () {
                this.positionArray = [undefined, undefined]
                this.blockTypeArray = [undefined]
            }
        )
    )
}());

(function () {
    generatorArray.push(
        new Generator(
            new Description("Clone, ignoring direction.",
                new Usage(
                    [],
                    [],
                    [],
                    [])
            ),

            [undefined, undefined, undefined],
            [],
            [],
            {
                "positionArrayLengthRequired": 3,
                "blockTypeArrayLengthRequired": 0,
                "generateByServer": true
            },

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
            function (direction) {
                displayObject(direction)
                let indexOfVacancy = this.directionArray.indexOf(undefined)
                if (indexOfVacancy == -1) displayChat("Too many directions!New one is ignored")
                else this.directionArray[indexOfVacancy] = direction
            },
            function (index) {
                if (index === undefined)
                    for (index = this.positionArray.length - 1; index >= 0 && this.positionArray[index] == undefined; index--);
                if (index >= 0) this.positionArray[index] = undefined
                displayObject(this.positionArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.blockTypeArray.length - 1; index >= 0 && this.blockTypeArray[index] == undefined; index--);
                if (index >= 0) this.blockTypeArray[index] = undefined
                displayObject(this.blockTypeArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.directionArray.length - 1; index >= 0 && this.directionArray[index] == undefined; index--);
                if (index >= 0) this.directionArray[index] = undefined
                displayObject(this.directionArray)
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
                if (this.option.generateByServer)
                    return [{
                        "type": "clone",
                        "data": {
                            startCoordinate: this.positionArray[0].coordinate,
                            endCoordinate: this.positionArray[1].coordinate,
                            targetCoordinate: this.positionArray[2].coordinate
                        }
                    }]
                else return []
            },
            function () {
                this.positionArray = [undefined, undefined, undefined]
                this.blockTypeArray = []
            }
        )
    )
}());

(function () {
    generatorArray.push(
        new Generator(
            new Description("Create a line with given interval.",
                new Usage(
                    ["Start point"],
                    ["BlockType"],
                    ["Direction"],
                    [
                        {
                            viewtype: "edittext",
                            text: "Length:",
                            key: "length",
                        },
                        {
                            viewtype: "edittext",
                            text: "Interval:",
                            key: "interval",
                        }
                    ])
            ),

            [undefined],
            [undefined],
            [undefined],
            {
                "positionArrayLengthRequired": 1,
                "blockTypeArrayLengthRequired": 1,
                "directionArrayLengthRequired": 1,
                "length": 0,
                "interval": 0
            },

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
            function (direction) {
                displayObject(direction)
                let indexOfVacancy = this.directionArray.indexOf(undefined)
                if (indexOfVacancy == -1) displayChat("Too many directions!New one is ignored")
                else this.directionArray[indexOfVacancy] = direction
            },
            function (index) {
                if (index === undefined)
                    for (index = this.positionArray.length - 1; index >= 0 && this.positionArray[index] == undefined; index--);
                if (index >= 0) this.positionArray[index] = undefined
                displayObject(this.positionArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.blockTypeArray.length - 1; index >= 0 && this.blockTypeArray[index] == undefined; index--);
                if (index >= 0) this.blockTypeArray[index] = undefined
                displayObject(this.blockTypeArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.directionArray.length - 1; index >= 0 && this.directionArray[index] == undefined; index--);
                if (index >= 0) this.directionArray[index] = undefined
                displayObject(this.directionArray)
            },

            function () {
                let result = new String()
                if (this.blockTypeArray.indexOf(undefined) != -1)
                    result += "Too few blockTypes!Refusing to execute.\n"
                if (this.positionArray.indexOf(undefined) != -1)
                    result += "Too few positions!Refusing to execute."
                if (this.directionArray.indexOf(undefined) != -1)
                    result += "Too few directions!Refusing to execute."
                if (result == "") result = "success"

                return result;
            },
            function () {
                let blockArray = []

                displayChat("§b NZ is JULAO!")

                let positionArray = this.positionArray
                let blockTypeArray = this.blockTypeArray
                let directionArray = this.directionArray

                displayChat("§b Yes, NZ is JULAO!")


                let direction = (function () {
                    if (-45 <= directionArray[0].y && directionArray[0].y <= 45) return "+z"
                    else if (-135 <= directionArray[0].y && directionArray[0].y <= -45) return "+x"
                    else if (45 <= directionArray[0].y && directionArray[0].y <= 135) return "-x"
                    else return "-z"
                }());

                switch (direction) {
                    case "+z": {
                        let x = positionArray[0].coordinate.x
                        let y = positionArray[0].coordinate.y
                        for (let z = positionArray[0].coordinate.z; z < this.option.length + positionArray[0].coordinate.z; z += (this.option.interval + 1))
                            blockArray.push(new Block(
                                new Position(
                                    new Coordinate(x, y, z),
                                    positionArray[0].tickingArea
                                ),
                                blockTypeArray[0])
                            )
                        break;
                    }
                    case "-z": {
                        let x = positionArray[0].coordinate.x
                        let y = positionArray[0].coordinate.y
                        for (let z = positionArray[0].coordinate.z; z > -this.option.length + positionArray[0].coordinate.z; z -= (this.option.interval + 1))
                            blockArray.push(new Block(
                                new Position(
                                    new Coordinate(x, y, z),
                                    positionArray[0].tickingArea
                                ),
                                blockTypeArray[0])
                            )
                        break;
                    }
                    case "+x": {
                        let z = positionArray[0].coordinate.z
                        let y = positionArray[0].coordinate.y
                        for (let x = positionArray[0].coordinate.x; x < this.option.length + positionArray[0].coordinate.x; x += (this.option.interval + 1))
                            blockArray.push(new Block(
                                new Position(
                                    new Coordinate(x, y, z),
                                    positionArray[0].tickingArea
                                ),
                                blockTypeArray[0])
                            )
                        break;
                    }
                    case "-x": {
                        let z = positionArray[0].coordinate.z
                        let y = positionArray[0].coordinate.y
                        for (let x = positionArray[0].coordinate.x; x > -this.option.length + positionArray[0].coordinate.z; x -= (this.option.interval + 1))
                            blockArray.push(new Block(
                                new Position(
                                    new Coordinate(x, y, z),
                                    positionArray[0].tickingArea
                                ),
                                blockTypeArray[0])
                            )
                        break;
                    }
                }

                return blockArray
            },
            function () {
                this.positionArray = [undefined]
                this.blockTypeArray = [undefined]
                this.directionArray = [undefined]
            }
        )
    )
}());

(function () {
    generatorArray.push(
        new Generator(
            new Description("造马路",
                new Usage(
                    [],
                    [],
                    [],
                    [
                        {
                            viewtype: "edittext",
                            text: "长度:",
                            key: "length",
                        },
                        {
                            viewtype: "button",
                            text: "马路风格",
                            key: "roadStyle",
                            data: [
                                { value: "NS", text: "北冥/南冥", dataForUIHandler: "preset" },
                                { value: "DB", text: "东沙/冰岛", dataForUIHandler: "preset" },
                                { value: "custom", text: "自定", dataForUIHandler: "custom" }
                            ]
                        },
                        {
                            viewtype: "checkbox",
                            text: "加护栏",
                            key: "isBarred",
                            data: [
                                { value: true, text: "是" },
                                { value: false, text: "否" },
                            ]
                        },
                        {
                            viewtype: "edittext",
                            text: "每一边车道数:",
                            key: "numberOfLanesPerSide",
                        },
                        {
                            viewtype: "edittext",
                            text: "车道宽:",
                            key: "widthOfLanes",
                        },
                        {
                            viewtype: "edittext",
                            text: "白线间隔:",
                            key: "dashLineInterval",
                        },
                        {
                            viewtype: "edittext",
                            text: "白线长度:",
                            key: "dashLineLength",
                        },
                    ])
            ),

            [undefined],
            [],
            [undefined],
            {
                "length": 10,
                "roadStyle": "NS",
                "isBarred": false,
                "numberOfLanesPerSide": 2,
                "widthOfLanes": 5,
                "dashLineInterval": 3,
                "dashLineLength": 4
            },

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
            function (direction) {
                displayObject(direction)
                let indexOfVacancy = this.directionArray.indexOf(undefined)
                if (indexOfVacancy == -1) displayChat("Too many directions!New one is ignored")
                else this.directionArray[indexOfVacancy] = direction
            },
            function (index) {
                if (index === undefined)
                    for (index = this.positionArray.length - 1; index >= 0 && this.positionArray[index] == undefined; index--);
                if (index >= 0) this.positionArray[index] = undefined
                displayObject(this.positionArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.blockTypeArray.length - 1; index >= 0 && this.blockTypeArray[index] == undefined; index--);
                if (index >= 0) this.blockTypeArray[index] = undefined
                displayObject(this.blockTypeArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.directionArray.length - 1; index >= 0 && this.directionArray[index] == undefined; index--);
                if (index >= 0) this.directionArray[index] = undefined
                displayObject(this.directionArray)
            },

            function () {
                let result = new String()
                if (this.blockTypeArray.indexOf(undefined) != -1)
                    result += "Too few blockTypes!Refusing to execute.\n"
                if (this.positionArray.indexOf(undefined) != -1)
                    result += "Too few positions!Refusing to execute."
                if (this.directionArray.indexOf(undefined) != -1)
                    result += "Too few directions!Refusing to execute."
                if (result == "") result = "success"

                return result;
            },
            function () {
                let blockArray = []

                displayChat("§b NZ is JULAO!")

                let positionArray = this.positionArray
                let blockTypeArray = this.blockTypeArray
                let directionArray = this.directionArray
                let option = this.option

                displayChat("§b Yes, NZ is JULAO!")

                //{"blockIdentifier":"minecraft:stained_hardened_clay","blockState":{"color":"cyan"}}

                let materials
                if (option["roadStyle"] == "NS") materials = {
                    "surface": new BlockType("minecraft:stained_hardened_clay", { "color": "cyan" }),
                    "white_line": new BlockType("minecraft:concrete", { "color": "white" }),
                    "yellow_line": new BlockType("minecraft:stained_hardened_clay", { "color": "yellow" }),
                    "bar": new BlockType("minecraft:cobblestone_wall", { "wall_block_type": "cobblestone" })
                }
                else if (option["roadStyle"] == "DB") {
                    materials = {
                        "surface": new BlockType("minecraft:wool", { "color": "black" }),
                        "white_line": new BlockType("minecraft:wool", { "color": "white" }),
                        "yellow_line": new BlockType("minecraft:wool", { "color": "yellow" }),
                        "bar": new BlockType("minecraft:cobblestone_wall", { "wall_block_type": "cobblestone" })
                    }
                }
                else if (option["roadStyle"] == "custom") {
                    materials = {
                        "surface": blockTypeArray[0],
                        "white_line": blockTypeArray[1],
                        "yellow_line": blockTypeArray[2],
                        "bar": blockTypeArray[3]
                    }
                }

                let playerFacingAxis = (function () {
                    if (-45 <= directionArray[0].y && directionArray[0].y <= 45) return "+z"
                    else if (-135 <= directionArray[0].y && directionArray[0].y <= -45) return "+x"
                    else if (45 <= directionArray[0].y && directionArray[0].y <= 135) return "-x"
                    else return "-z"
                }());

                //This assumes the original facing axis is +x.
                let transform = (function (facingAxis) {
                    switch (facingAxis) {
                        case "+x": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => x,
                                (x, y, z) => y,
                                (x, y, z) => z
                            )
                            break;
                        }
                        case "-x": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => 2 * positionArray[0].coordinate.x - x,
                                (x, y, z) => y,
                                (x, y, z) => 2 * positionArray[0].coordinate.z - z
                            )
                            break;
                        }
                        case "+z": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => positionArray[0].coordinate.x - (z - positionArray[0].coordinate.z),
                                (x, y, z) => y,
                                (x, y, z) => positionArray[0].coordinate.z + (x - positionArray[0].coordinate.x)
                            )
                            break;
                        }
                        case "-z": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => positionArray[0].coordinate.x + (z - positionArray[0].coordinate.z),
                                (x, y, z) => y,
                                (x, y, z) => positionArray[0].coordinate.z - (x - positionArray[0].coordinate.x)
                            )
                            break;
                        }
                    }
                }(playerFacingAxis))



                let palette = [];

                for (let i = 0; i < option["numberOfLanesPerSide"]; i++) {
                    for (let j = 0; j < option["widthOfLanes"]; j++) palette.push("lane")
                    if (i < option["numberOfLanesPerSide"] - 1) palette.push("dash_line")
                }
                palette.push("division_line")
                for (let i = 0; i < option["numberOfLanesPerSide"]; i++) {
                    for (let j = 0; j < option["widthOfLanes"]; j++) palette.push("lane")
                    if (i < option["numberOfLanesPerSide"] - 1) palette.push("dash_line")
                }
                if (option["isBarred"]) palette[0] = palette[palette.length - 1] = "edge"

                const offset = (palette.length - 1) / 2;
                for (let i = 0; i < palette.length; i++) {
                    switch (palette[i]) {
                        case "edge": {
                            for (let coordinate of utils.coordinateGeometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"] - 1, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
                            ) {
                                blockArray.push(
                                    new Block(
                                        new Position(
                                            transform(coordinate),
                                            positionArray[0].tickingArea
                                        ),
                                        materials["surface"]
                                    )
                                )
                            }
                            for (let coordinate of utils.coordinateGeometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y + 1, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"] - 1, positionArray[0].coordinate.y + 1, positionArray[0].coordinate.z + i - offset)
                            ) {
                                blockArray.push(
                                    new Block(
                                        new Position(
                                            transform(coordinate),
                                            positionArray[0].tickingArea
                                        ),
                                        materials["bar"]
                                    )
                                )
                            }
                            break;
                        }
                        case "lane": {
                            for (let coordinate of utils.coordinateGeometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"] - 1, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
                            ) {
                                blockArray.push(
                                    new Block(
                                        new Position(
                                            transform(coordinate),
                                            positionArray[0].tickingArea
                                        ),
                                        materials["surface"]
                                    )
                                )
                            }
                            break;
                        }
                        case "dash_line": {
                            for (let j = 0; j <= option["length"] - 1; j++) {
                                let position = new Position(transform(new Coordinate(positionArray[0].coordinate.x + j, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)), positionArray[0].tickingArea)
                                if ((j % (option["dashLineInterval"] + option["dashLineLength"])) < option["dashLineInterval"]) //Black first.
                                    blockArray.push(new Block(position, materials["surface"]))
                                else
                                    blockArray.push(new Block(position, materials["white_line"]))
                            }
                            break;
                        }
                        case "division_line": {
                            for (let coordinate of utils.coordinateGeometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"] - 1, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
                            ) {
                                blockArray.push(
                                    new Block(
                                        new Position(
                                            transform(coordinate),
                                            positionArray[0].tickingArea
                                        ),
                                        materials["yellow_line"]
                                    )
                                )
                            }
                            break;
                        }
                    }
                }

                return blockArray
            },
            function () {
                this.positionArray = [undefined]
                if (this.option["roadStyle"] == "custom") this.blockTypeArray = [undefined, undefined, undefined, undefined]
                else this.blockTypeArray = []
                this.blockTypeArray = []
                this.directionArray = [undefined]
            },
            function (data) {
                if (data == "custom") {
                    displayChat("Using custom materials.")
                    displayChat("First block type for surface.")
                    displayChat("Second for white line.")
                    displayChat("Third for yellow line.")
                    displayChat("Fourth for bar.")
                    this.blockTypeArray = [undefined, undefined, undefined, undefined]
                }
                else {
                    displayChat("Using preset materials. Custom materials are erased!")
                    this.blockTypeArray = []
                }
            }
        )
    )
}());

(function () {
    generatorArray.push(
        new Generator(
            new Description("Construct railway",
                new Usage(
                    [],
                    [],
                    [],
                    [
                        {
                            viewtype: "edittext",
                            text: "Length:",
                            key: "length",
                        },
                        {
                            viewtype: "checkbox",
                            text: "加护栏",
                            key: "isBarred",
                            data: [
                                { value: true, text: "是" },
                                { value: false, text: "否" },
                            ]
                        }
                    ])
            ),

            [undefined],
            [],
            [undefined],
            {
                "length": 10,
                "isBarred": false
            },

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
            function (direction) {
                displayObject(direction)
                let indexOfVacancy = this.directionArray.indexOf(undefined)
                if (indexOfVacancy == -1) displayChat("Too many directions!New one is ignored")
                else this.directionArray[indexOfVacancy] = direction
            },
            function (index) {
                if (index === undefined)
                    for (index = this.positionArray.length - 1; index >= 0 && this.positionArray[index] == undefined; index--);
                if (index >= 0) this.positionArray[index] = undefined
                displayObject(this.positionArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.blockTypeArray.length - 1; index >= 0 && this.blockTypeArray[index] == undefined; index--);
                if (index >= 0) this.blockTypeArray[index] = undefined
                displayObject(this.blockTypeArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.directionArray.length - 1; index >= 0 && this.directionArray[index] == undefined; index--);
                if (index >= 0) this.directionArray[index] = undefined
                displayObject(this.directionArray)
            },

            function () {
                let result = new String()
                if (this.blockTypeArray.indexOf(undefined) != -1)
                    result += "Too few blockTypes!Refusing to execute.\n"
                if (this.positionArray.indexOf(undefined) != -1)
                    result += "Too few positions!Refusing to execute."
                if (this.directionArray.indexOf(undefined) != -1)
                    result += "Too few directions!Refusing to execute."
                if (result == "") result = "success"

                return result;
            },
            function () {
                let blockArray = []

                displayChat("§b NZ is JULAO!")

                let positionArray = this.positionArray
                let blockTypeArray = this.blockTypeArray
                let directionArray = this.directionArray
                let option = this.option

                displayChat("§b Yes, NZ is JULAO!")

                let directionMark = (function () {
                    if (-45 <= directionArray[0].y && directionArray[0].y <= 45) return "+z"
                    else if (-135 <= directionArray[0].y && directionArray[0].y <= -45) return "+x"
                    else if (45 <= directionArray[0].y && directionArray[0].y <= 135) return "-x"
                    else return "-z"
                }());

                let materials = {
                    "glass_pane": new BlockType("minecraft:glass_pane", null),
                    "iron_block": new BlockType("minecraft:iron_block", null),
                    "red_stone_torch": new BlockType("minecraft:redstone_torch", { "torch_facing_direction": "top" }),
                    "rail": utils.blockGeometry.setBlockDirection(new BlockType("minecraft:golden_rail", { "rail_data_bit": false, "rail_direction": 0 }), (directionMark == "+x" || directionMark == "-x") ? "x" : "z")
                }



                //This assumes the original facing axis is +x.
                let transform = (function (facingAxis) {
                    switch (facingAxis) {
                        case "+x": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => x,
                                (x, y, z) => y,
                                (x, y, z) => z
                            )
                            break;
                        }
                        case "-x": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => 2 * positionArray[0].coordinate.x - x,
                                (x, y, z) => y,
                                (x, y, z) => 2 * positionArray[0].coordinate.z - z
                            )
                            break;
                        }
                        case "+z": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => positionArray[0].coordinate.x - (z - positionArray[0].coordinate.z),
                                (x, y, z) => y,
                                (x, y, z) => positionArray[0].coordinate.z + (x - positionArray[0].coordinate.x)
                            )
                            break;
                        }
                        case "-z": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => positionArray[0].coordinate.x + (z - positionArray[0].coordinate.z),
                                (x, y, z) => y,
                                (x, y, z) => positionArray[0].coordinate.z - (x - positionArray[0].coordinate.x)
                            )
                            break;
                        }
                    }
                }(directionMark))

                let palette = ["rail", "redstone", "rail"];

                if (option["isBarred"]) {
                    palette.unshift("edge")
                    palette.push("edge")
                }

                const offset = (palette.length - 1) / 2;
                for (let i = 0; i < palette.length; i++) {
                    switch (palette[i]) {
                        case "edge": {
                            for (let coordinate of utils.coordinateGeometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"] - 1, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
                            ) {
                                blockArray.push(
                                    new Block(
                                        new Position(
                                            transform(coordinate),
                                            positionArray[0].tickingArea
                                        ),
                                        materials["iron_block"]
                                    )
                                )
                            }
                            for (let coordinate of utils.coordinateGeometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y + 1, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"] - 1, positionArray[0].coordinate.y + 1, positionArray[0].coordinate.z + i - offset)
                            ) {
                                blockArray.push(
                                    new Block(
                                        new Position(
                                            transform(coordinate),
                                            positionArray[0].tickingArea
                                        ),
                                        materials["glass_pane"]
                                    )
                                )
                            }
                            break;
                        }
                        case "rail": {
                            for (let coordinate of utils.coordinateGeometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"] - 1, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
                            ) {
                                blockArray.push(
                                    new Block(
                                        new Position(
                                            transform(coordinate),
                                            positionArray[0].tickingArea
                                        ),
                                        materials["iron_block"]
                                    )
                                )
                            }
                            for (let coordinate of utils.coordinateGeometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y + 1, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"] - 1, positionArray[0].coordinate.y + 1, positionArray[0].coordinate.z + i - offset)
                            ) {
                                blockArray.push(
                                    new Block(
                                        new Position(
                                            transform(coordinate),
                                            positionArray[0].tickingArea
                                        ),
                                        materials["rail"]
                                    )
                                )
                            }
                            break;
                        }
                        case "redstone": {
                            for (let coordinate of utils.coordinateGeometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"] - 1, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
                            ) {
                                blockArray.push(
                                    new Block(
                                        new Position(
                                            transform(coordinate),
                                            positionArray[0].tickingArea
                                        ),
                                        materials["iron_block"]
                                    )
                                )
                            }
                            for (let j = 0; j < option["length"] - 1; j++) {
                                let position = new Position(transform(new Coordinate(positionArray[0].coordinate.x + j, positionArray[0].coordinate.y + 1, positionArray[0].coordinate.z + i - offset)), positionArray[0].tickingArea)
                                if (j % 15 == 0) blockArray.push(new Block(position, materials["red_stone_torch"]))
                            }
                            break;
                        }
                    }
                }

                return blockArray
            },
            function () {
                this.positionArray = [undefined]
                this.blockTypeArray = []
                this.directionArray = [undefined]
            }
        )
    )
}());

(function () {
    generatorArray.push(
        new Generator(
            new Description("Create a triangle.(Broken)",
                new Usage(
                    [],
                    [],
                    [],
                    [])
            ),

            [undefined, undefined, undefined],
            [undefined],
            [],
            {},

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
            function (direction) {
                displayObject(direction)
                let indexOfVacancy = this.directionArray.indexOf(undefined)
                if (indexOfVacancy == -1) displayChat("Too many directions!New one is ignored")
                else this.directionArray[indexOfVacancy] = direction
            },
            function (index) {
                if (index === undefined)
                    for (index = this.positionArray.length - 1; index >= 0 && this.positionArray[index] == undefined; index--);
                if (index >= 0) this.positionArray[index] = undefined
                displayObject(this.positionArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.blockTypeArray.length - 1; index >= 0 && this.blockTypeArray[index] == undefined; index--);
                if (index >= 0) this.blockTypeArray[index] = undefined
                displayObject(this.blockTypeArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.directionArray.length - 1; index >= 0 && this.directionArray[index] == undefined; index--);
                if (index >= 0) this.directionArray[index] = undefined
                displayObject(this.directionArray)
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

                displayChat("§b Yes, NZ is JULAO!")

                let coordinateArray = utils.coordinateGeometry.generateFilledPlanarTriangle(
                    positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z,
                    positionArray[1].coordinate.x, positionArray[1].coordinate.y, positionArray[1].coordinate.z,
                    positionArray[2].coordinate.x, positionArray[2].coordinate.y, positionArray[2].coordinate.z)

                for (const coordinate of coordinateArray) {
                    blockArray.push(new Block(
                        new Position(
                            coordinate,
                            positionArray[0].tickingArea
                        ),
                        blockTypeArray[0])
                    )
                }

                return blockArray
            },
            function () {
                this.positionArray = [undefined, undefined, undefined]
                this.blockTypeArray = [undefined]
            }
        )
    )
}());

(function () {
    generatorArray.push(
        new Generator(
            new Description("Clear terrain",
                new Usage(
                    [],
                    [],
                    [],
                    [])
            ),

            [undefined, undefined],
            [],
            [],
            {
                "generateByServer": true
            },

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
            function (direction) {
                displayObject(direction)
                let indexOfVacancy = this.directionArray.indexOf(undefined)
                if (indexOfVacancy == -1) displayChat("Too many directions!New one is ignored")
                else this.directionArray[indexOfVacancy] = direction
            },
            function (index) {
                if (index === undefined)
                    for (index = this.positionArray.length - 1; index >= 0 && this.positionArray[index] == undefined; index--);
                if (index >= 0) this.positionArray[index] = undefined
                displayObject(this.positionArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.blockTypeArray.length - 1; index >= 0 && this.blockTypeArray[index] == undefined; index--);
                if (index >= 0) this.blockTypeArray[index] = undefined
                displayObject(this.blockTypeArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.directionArray.length - 1; index >= 0 && this.directionArray[index] == undefined; index--);
                if (index >= 0) this.directionArray[index] = undefined
                displayObject(this.directionArray)
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
                if (this.option.generateByServer) {
                    displayChat("§b NZ is JULAO!")

                    let x_min = Math.min(this.positionArray[0].coordinate.x, this.positionArray[1].coordinate.x)
                    let z_min = Math.min(this.positionArray[0].coordinate.z, this.positionArray[1].coordinate.z)

                    let x_max = Math.max(this.positionArray[0].coordinate.x, this.positionArray[1].coordinate.x)
                    let z_max = Math.max(this.positionArray[0].coordinate.z, this.positionArray[1].coordinate.z)

                    let y_start = (Math.abs(this.positionArray[0].coordinate.y - 69) < Math.abs(this.positionArray[1].coordinate.y - 69)) ? this.positionArray[0].coordinate.y : this.positionArray[1].coordinate.y

                    displayChat("§b Yes, NZ is JULAO!")

                    return [{
                        "type": "fill",
                        "data": {
                            "startCoordinate": new Coordinate(x_min, y_start, z_min),
                            "endCoordinate": new Coordinate(x_max, 255, z_max),
                            "blockType": {
                                "blockIdentifier": "minecraft:air",
                                "blockState": null
                            }
                        }
                    }]
                }
                else {
                    let blockArray = []

                    displayChat("§b NZ is JULAO!")

                    let positionArray = this.positionArray
                    let blockTypeArray = this.blockTypeArray

                    let x_min = Math.min(positionArray[0].coordinate.x, positionArray[1].coordinate.x)
                    let z_min = Math.min(positionArray[0].coordinate.z, positionArray[1].coordinate.z)

                    let x_max = Math.max(positionArray[0].coordinate.x, positionArray[1].coordinate.x)
                    let z_max = Math.max(positionArray[0].coordinate.z, positionArray[1].coordinate.z)

                    let y_start = (Math.abs(positionArray[0].coordinate.y - 69) < Math.abs(positionArray[1].coordinate.y - 69)) ? positionArray[0].coordinate.y : positionArray[1].coordinate.y

                    displayChat("§b Yes, NZ is JULAO!")

                    for (let x = x_min; x <= x_max; x++) {
                        for (let y = y_start; y <= 256; y++) {
                            for (let z = z_min; z <= z_max; z++) {

                                blockArray.push(new Block(
                                    new Position(
                                        new Coordinate(x, y, z),
                                        positionArray[0].tickingArea
                                    ),
                                    {
                                        "blockIdentifier": "minecraft:air",
                                        "blockState": null
                                    })
                                )
                            }
                        }
                    }

                    return blockArray
                }
            },
            function () {
                this.positionArray = [undefined, undefined]
                this.blockTypeArray = []
            }
        )
    )
}());
(function () {
    generatorArray.push(
        new Generator(
            new Description("Create polygon.",
                new Usage(
                    [],
                    [],
                    [],
                    [
                        {
                            viewtype: "edittext",
                            text: "Number of sides:",
                            key: "numberOfSides",
                        },
                        {
                            viewtype: "edittext",
                            text: "Radius:",
                            key: "r",
                        }
                    ])
            ),

            [undefined],
            [],
            [],
            {
                "numberOfSides": 6,
                "r": 10
            },

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
            function (direction) {
                displayObject(direction)
                let indexOfVacancy = this.directionArray.indexOf(undefined)
                if (indexOfVacancy == -1) displayChat("Too many directions!New one is ignored")
                else this.directionArray[indexOfVacancy] = direction
            },
            function (index) {
                if (index === undefined)
                    for (index = this.positionArray.length - 1; index >= 0 && this.positionArray[index] == undefined; index--);
                if (index >= 0) this.positionArray[index] = undefined
                displayObject(this.positionArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.blockTypeArray.length - 1; index >= 0 && this.blockTypeArray[index] == undefined; index--);
                if (index >= 0) this.blockTypeArray[index] = undefined
                displayObject(this.blockTypeArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.directionArray.length - 1; index >= 0 && this.directionArray[index] == undefined; index--);
                if (index >= 0) this.directionArray[index] = undefined
                displayObject(this.directionArray)
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

                let coordinateArray = []

                for (let theta = 0; theta <= 2 * Math.PI; theta += 2 * Math.PI / this.option.numberOfSides) {
                    coordinateArray = coordinateArray.concat(utils.coordinateGeometry.withBresenhamAlgorithm.generateLineWithTwoPoints(
                        positionArray[0].coordinate.x + this.option.r * Math.cos(theta), positionArray[0].coordinate.y, positionArray[0].coordinate.z + this.option.r * Math.sin(theta),
                        positionArray[0].coordinate.x + this.option.r * Math.cos(theta + 2 * Math.PI / this.option.numberOfSides), positionArray[0].coordinate.y, positionArray[0].coordinate.z + this.option.r * Math.sin(theta + 2 * Math.PI / this.option.numberOfSides)
                    ))
                }

                displayObject(coordinateArray)

                for (let coordinate of coordinateArray)
                    blockArray.push(new Block(
                        new Position(
                            coordinate,
                            positionArray[0].tickingArea
                        ),
                        new BlockType("minecraft:stained_hardened_clay", { "color": "cyan" })
                    ))

                return blockArray
            },
            function () {
                this.positionArray = [undefined]
                this.blockTypeArray = []
            }
        )
    )
}());
(function () {
    generatorArray.push(
        new Generator(
            new Description("Create circle.(on xz plane)",
                new Usage(
                    [],
                    [],
                    [],
                    [
                        {
                            viewtype: "edittext",
                            text: "Radius:(Must be integer?)",
                            key: "r",
                        }
                    ])
            ),

            [undefined],
            [undefined],
            [],
            {
                "r": 10
            },

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
            function (direction) {
                displayObject(direction)
                let indexOfVacancy = this.directionArray.indexOf(undefined)
                if (indexOfVacancy == -1) displayChat("Too many directions!New one is ignored")
                else this.directionArray[indexOfVacancy] = direction
            },
            function (index) {
                if (index === undefined)
                    for (index = this.positionArray.length - 1; index >= 0 && this.positionArray[index] == undefined; index--);
                if (index >= 0) this.positionArray[index] = undefined
                displayObject(this.positionArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.blockTypeArray.length - 1; index >= 0 && this.blockTypeArray[index] == undefined; index--);
                if (index >= 0) this.blockTypeArray[index] = undefined
                displayObject(this.blockTypeArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.directionArray.length - 1; index >= 0 && this.directionArray[index] == undefined; index--);
                if (index >= 0) this.directionArray[index] = undefined
                displayObject(this.directionArray)
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

                let coordinateArray = []

                utils.coordinateGeometry.withBresenhamAlgorithm.generate2DCircle(positionArray[0].coordinate.x, positionArray[0].coordinate.z, this.option.r
                ).forEach((coordinate) => {
                    coordinateArray.push(new Coordinate(coordinate.x, positionArray[0].coordinate.y, coordinate.y))
                })


                displayObject(coordinateArray)

                for (let coordinate of coordinateArray)
                    blockArray.push(new Block(
                        new Position(
                            coordinate,
                            positionArray[0].tickingArea
                        ),
                        blockTypeArray[0]
                    ))

                return blockArray
            },
            function () {
                this.positionArray = [undefined]
                this.blockTypeArray = [undefined]
            }
        )
    )
}());
(function () {
    generatorArray.push(
        new Generator(
            new Description("Create sphere.",
                new Usage(
                    [],
                    [],
                    [],
                    [
                        {
                            viewtype: "edittext",
                            text: "Radius:",
                            key: "r",
                        },
                        {
                            viewtype: "button",
                            text: "Hollow",
                            key: "isHollow",
                            data: [
                                { value: true, text: "Yes" },
                                { value: false, text: "No" }
                            ]
                        }
                    ])
            ),

            [undefined],
            [undefined],
            [],
            {
                "r": 10,
                "isHollow": false
            },

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
            function (direction) {
                displayObject(direction)
                let indexOfVacancy = this.directionArray.indexOf(undefined)
                if (indexOfVacancy == -1) displayChat("Too many directions!New one is ignored")
                else this.directionArray[indexOfVacancy] = direction
            },
            function (index) {
                if (index === undefined)
                    for (index = this.positionArray.length - 1; index >= 0 && this.positionArray[index] == undefined; index--);
                if (index >= 0) this.positionArray[index] = undefined
                displayObject(this.positionArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.blockTypeArray.length - 1; index >= 0 && this.blockTypeArray[index] == undefined; index--);
                if (index >= 0) this.blockTypeArray[index] = undefined
                displayObject(this.blockTypeArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.directionArray.length - 1; index >= 0 && this.directionArray[index] == undefined; index--);
                if (index >= 0) this.directionArray[index] = undefined
                displayObject(this.directionArray)
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

                let coordinateArray = this.option.isHollow ?
                    utils.coordinateGeometry.generateHollowSphere(positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z, this.option.r) :
                    utils.coordinateGeometry.generateSphere(positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z, this.option.r)




                displayObject(coordinateArray)

                for (let coordinate of coordinateArray)
                    blockArray.push(new Block(
                        new Position(
                            coordinate,
                            positionArray[0].tickingArea
                        ),
                        blockTypeArray[0]
                    ))

                return blockArray
            },
            function () {
                this.positionArray = [undefined]
                this.blockTypeArray = [undefined]
            }
        )
    )
}());
(function () {
    generatorArray.push(
        new Generator(
            new Description("Generate The Flag of Norma Federal Republic",
                new Usage(
                    [],
                    [],
                    [],
                    [
                        {
                            viewtype: "edittext",
                            text: "Height:(Must be even)",
                            key: "height",
                        }
                    ])
            ),

            [undefined],
            [],
            [],
            {
                "height": 10,
            },

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
            function (direction) {
                displayObject(direction)
                let indexOfVacancy = this.directionArray.indexOf(undefined)
                if (indexOfVacancy == -1) displayChat("Too many directions!New one is ignored")
                else this.directionArray[indexOfVacancy] = direction
            },
            function (index) {
                if (index === undefined)
                    for (index = this.positionArray.length - 1; index >= 0 && this.positionArray[index] == undefined; index--);
                if (index >= 0) this.positionArray[index] = undefined
                displayObject(this.positionArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.blockTypeArray.length - 1; index >= 0 && this.blockTypeArray[index] == undefined; index--);
                if (index >= 0) this.blockTypeArray[index] = undefined
                displayObject(this.blockTypeArray)
            },
            function (index) {
                if (index === undefined)
                    for (index = this.directionArray.length - 1; index >= 0 && this.directionArray[index] == undefined; index--);
                if (index >= 0) this.directionArray[index] = undefined
                displayObject(this.directionArray)
            },

            function () {
                let result = new String()
                if (this.blockTypeArray.indexOf(undefined) != -1)
                    result += "Too few blockTypes!Refusing to execute.\n"
                if (this.positionArray.indexOf(undefined) != -1)
                    result += "Too few positions!Refusing to execute."
                if (this.option.height % 2 != 0) result += "The height is odd!"
                if (result == "") result = "success"

                return result;
            },
            function () {
                let blockArray = []
                let positionArray=this.positionArray
                let option=this.option

                for (let x = positionArray[0].coordinate.x; x < positionArray[0].coordinate.x + option.height; x++)
                    for (let y = positionArray[0].coordinate.y; y > positionArray[0].coordinate.y - option.height; y--) {
                        let z = x - positionArray[0].coordinate.x + positionArray[0].coordinate.z;
                        let blockType = (function () {
                            if ((x-positionArray[0].coordinate.x  <= positionArray[0].coordinate.y - y) && (positionArray[0].coordinate.y - y < option.height-(x-positionArray[0].coordinate.x ))) return new BlockType("minecraft:wool", { "color": "blue" })
                            else if (positionArray[0].coordinate.y - y < option.height/2) return new BlockType("minecraft:wool", { "color": "yellow" })
                            else return new BlockType("minecraft:wool", { "color": "red" })
                        })()
                        blockArray.push(new Block(new Position(new Coordinate(x, y, z), positionArray[0].tickingArea), blockType))
                    }


                return blockArray
            },
            function () {
                this.positionArray = [undefined]
                this.blockTypeArray = []
            }
        )
    )
}());