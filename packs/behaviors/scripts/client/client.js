var clientSystem = client.registerSystem(0, 0);

var playerID = undefined
var generatorIndex = 0
var tick = 0
var blockQuery = []

import { Coordinate, Position, BlockType, Block, Direction, Usage, Description, Generator } from '../constructor'
import { utils } from './utils'
let generatorArray = [];



clientSystem.initialize = function () {

    clientSystem.registerEventData("NormaConstructor:ExecutionResponse", { playerID: undefined, blockArray: undefined })
    clientSystem.registerEventData("NormaConstructor:setBlock", { playerID: undefined, block: undefined })
    clientSystem.registerEventData("NormaConstructor:generateByServer", {
        playerID: undefined,
        serverGeneratorIdentifier: undefined,
        positionArray: undefined,
        blockTypeArray: undefined,
        directionArray: undefined,
        option: undefined
    })
    clientSystem.registerEventData("NormaConstructor:setServerSideOption", { playerID: undefined, option: { key: undefined, value: undefined } })

    clientSystem.listenForEvent("minecraft:client_entered_world", (eventData) => {

        playerID = eventData.data.player.id

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

    clientSystem.listenForEvent("NormaConstructor:getPosition", (eventData) => {
        if (playerID == eventData.data.playerID) {
            generatorArray[generatorIndex].addPosition(eventData.data.position)
        }
    })
    clientSystem.listenForEvent("NormaConstructor:getBlockType", (eventData) => {
        if (playerID == eventData.data.playerID) {
            generatorArray[generatorIndex].addBlockType(eventData.data.blockType)
        }
    })
    clientSystem.listenForEvent("NormaConstructor:getDirection", (eventData) => {
        if (playerID == eventData.data.playerID) {
            generatorArray[generatorIndex].addDirection(eventData.data.direction)
        }
    })

    clientSystem.listenForEvent("NormaConstructor:displayChatToClient", (eventData) => {
        if (playerID == eventData.data.playerID)
            displayChat(eventData.data.message)
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
                case "removeLastDirection": {
                    displayChat("Removing the last direction...")
                    generatorArray[generatorIndex].removeDirection()
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
                case "showMenu": {
                    let loadUIEventData = clientSystem.createEventData("minecraft:load_ui")
                    loadUIEventData.data.path = "menu/menu.html"
                    clientSystem.broadcastEvent("minecraft:load_ui", loadUIEventData)
                    break;
                }
            }
        }
    })

    clientSystem.listenForEvent("minecraft:ui_event", (eventData) => {
        if (eventData.data.slice(0, eventData.data.indexOf(":")) == "NormaConstructor") {
            let uiData = JSON.parse(eventData.data.slice(eventData.data.indexOf(":") + 1))

            displayChat("From UI:")
            displayObject(uiData)

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
                            displayObject(closeMenuEventData)
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
    if ((++tick) % 5 == 0 && blockQuery.length > 0) {

        let executionResponseEventData = clientSystem.createEventData("NormaConstructor:ExecutionResponse")
        executionResponseEventData.data.playerID = playerID
        executionResponseEventData.data.blockArray = blockQuery.splice(0, 100)
        clientSystem.broadcastEvent("NormaConstructor:ExecutionResponse", executionResponseEventData)
    }
};

function execute() {
    let validateResult = generatorArray[generatorIndex].validateParameter();
    if (validateResult != "success")
        displayChat("§c " + validateResult);
    else {
        displayChat("Execution started.");
        if (generatorArray[generatorIndex].option["__generateByServer"] == true) {
            let generateByServerEventData = clientSystem.createEventData("NormaConstructor:generateByServer");
            generateByServerEventData.data.playerID = playerID;
            generateByServerEventData.data.serverGeneratorIdentifier =
                generatorArray[generatorIndex].option["__serverGeneratorIdentifier"];
            generateByServerEventData.data.positionArray = generatorArray[generatorIndex].positionArray;
            generateByServerEventData.data.blockTypeArray = generatorArray[generatorIndex].blockTypeArray;
            generateByServerEventData.data.directionArray = generatorArray[generatorIndex].directionArray;
            generateByServerEventData.data.option = generatorArray[generatorIndex].option;
            clientSystem.broadcastEvent("NormaConstructor:generateByServer", generateByServerEventData);
        }
        else {
            let blockArray = generatorArray[generatorIndex].generate();
            Array.prototype.push.apply(blockQuery, blockArray);
        }
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

(function () {
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
}());

(function () {
    generatorArray.push(
        new Generator(
            new Description("Create a solid rectangle with two points.",
                new Usage(
                    ["First point", "Second point"],
                    ["BlockType"],
                    [],
                    [])
            ),

            [undefined, undefined],
            [undefined],
            [],
            {
                "positionArrayLengthRequired": 2,
                "blockTypeArrayLengthRequired": 1
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
                "__serverGeneratorIdentifier": "19260817",
                "__generateByServer": true
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

                return blockArray
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
                                { value: "NS", text: "北冥/南冥" },
                                { value: "DB", text: "东沙/冰岛" }
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
                        }
                    ])
            ),

            [undefined],
            [],
            [undefined],
            {
                "length": 10,
                "roadStyle": "NS",
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

                //{"blockIdentifier":"minecraft:stained_hardened_clay","blockState":{"color":"cyan"}}

                let materials
                if (option["roadStyle"] == "NS") materials = {
                    "surface": new BlockType("minecraft:stained_hardened_clay", { "color": "cyan" }),
                    "white_line": new BlockType("minecraft:concrete", { "color": "white" }),
                    "yellow_line": new BlockType("minecraft:stained_hardened_clay", { "color": "yellow" }),
                    "bar": new BlockType("minecraft:cobblestone_wall", { "wall_block_type": "cobblestone" })
                }
                else materials = {
                    "surface": new BlockType("minecraft:wool", { "color": "black" }),
                    "white_line": new BlockType("minecraft:wool", { "color": "white" }),
                    "yellow_line": new BlockType("minecraft:wool", { "color": "yellow" }),
                    "bar": new BlockType("minecraft:cobblestone_wall", { "wall_block_type": "cobblestone" })
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
                            return utils.geometry.transform(
                                (x, y, z) => x,
                                (x, y, z) => y,
                                (x, y, z) => z
                            )
                            break;
                        }
                        case "-x": {
                            return utils.geometry.transform(
                                (x, y, z) => 2 * positionArray[0].coordinate.x - x,
                                (x, y, z) => y,
                                (x, y, z) => 2 * positionArray[0].coordinate.z - z
                            )
                            break;
                        }
                        case "+z": {
                            return utils.geometry.transform(
                                (x, y, z) => positionArray[0].coordinate.x - (z - positionArray[0].coordinate.z),
                                (x, y, z) => y,
                                (x, y, z) => positionArray[0].coordinate.z + (x - positionArray[0].coordinate.x)
                            )
                            break;
                        }
                        case "-z": {
                            return utils.geometry.transform(
                                (x, y, z) => positionArray[0].coordinate.x + (z - positionArray[0].coordinate.z),
                                (x, y, z) => y,
                                (x, y, z) => positionArray[0].coordinate.z - (x - positionArray[0].coordinate.x)
                            )
                            break;
                        }
                    }
                }(playerFacingAxis))

                const numberOfLanesPerSide = 2
                const widthOfLanes = 5
                const dashLineInterval = 3
                const dashLineLength = 4

                let palette = [];

                for (let i = 0; i < numberOfLanesPerSide; i++) {
                    for (let j = 0; j < widthOfLanes; j++) palette.push("lane")
                    if (i < numberOfLanesPerSide - 1) palette.push("dash_line")
                }
                palette.push("division_line")
                for (let i = 0; i < numberOfLanesPerSide; i++) {
                    for (let j = 0; j < widthOfLanes; j++) palette.push("lane")
                    if (i < numberOfLanesPerSide - 1) palette.push("dash_line")
                }
                if (option["isBarred"]) palette[0] = palette[palette.length - 1] = "edge"

                const offset = (palette.length - 1) / 2;
                for (let i = 0; i < palette.length; i++) {
                    switch (palette[i]) {
                        case "edge": {
                            for (let coordinate of utils.geometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"], positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
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
                            for (let coordinate of utils.geometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y + 1, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"], positionArray[0].coordinate.y + 1, positionArray[0].coordinate.z + i - offset)
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
                            for (let coordinate of utils.geometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"], positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
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
                            for (let j = 0; j < option["length"]; j++) {
                                let position = new Position(transform(new Coordinate(positionArray[0].coordinate.x + j, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)), positionArray[0].tickingArea)
                                if ((j % (dashLineInterval + dashLineLength)) < dashLineInterval) //Black first.
                                    blockArray.push(new Block(position, materials["surface"]))
                                else
                                    blockArray.push(new Block(position, materials["white_line"]))
                            }
                            break;
                        }
                        case "division_line": {
                            for (let coordinate of utils.geometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"], positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
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
                this.blockTypeArray = []
                this.directionArray = [undefined]
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
                    "rail": utils.geometry.setBlockDirection(new BlockType("minecraft:golden_rail", { "rail_data_bit": false, "rail_direction": 0 }), (directionMark=="+x"||directionMark=="-x")?"x":"z")
                }



                //This assumes the original facing axis is +x.
                let transform = (function (facingAxis) {
                    switch (facingAxis) {
                        case "+x": {
                            return utils.geometry.transform(
                                (x, y, z) => x,
                                (x, y, z) => y,
                                (x, y, z) => z
                            )
                            break;
                        }
                        case "-x": {
                            return utils.geometry.transform(
                                (x, y, z) => 2 * positionArray[0].coordinate.x - x,
                                (x, y, z) => y,
                                (x, y, z) => 2 * positionArray[0].coordinate.z - z
                            )
                            break;
                        }
                        case "+z": {
                            return utils.geometry.transform(
                                (x, y, z) => positionArray[0].coordinate.x - (z - positionArray[0].coordinate.z),
                                (x, y, z) => y,
                                (x, y, z) => positionArray[0].coordinate.z + (x - positionArray[0].coordinate.x)
                            )
                            break;
                        }
                        case "-z": {
                            return utils.geometry.transform(
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
                            for (let coordinate of utils.geometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"], positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
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
                            for (let coordinate of utils.geometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y + 1, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"], positionArray[0].coordinate.y + 1, positionArray[0].coordinate.z + i - offset)
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
                            for (let coordinate of utils.geometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"], positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
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
                            for (let coordinate of utils.geometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y + 1, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"], positionArray[0].coordinate.y + 1, positionArray[0].coordinate.z + i - offset)
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
                            for (let coordinate of utils.geometry.generateLineWithTwoPoints(
                                positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset,
                                positionArray[0].coordinate.x + option["length"], positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
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
                            for (let j = 0; j < option["length"]; j++) {
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