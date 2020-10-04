var clientSystem = client.registerSystem(0, 0);

var playerID = undefined
var generatorIndex = 0
var tick = 0
var buildInstructionsQuery = []

import { Coordinate, Position, BlockType, Block, Direction, Usage, Description, Generator, BuildInstruction } from '../constructor'
import { utils } from '../utils'
const mcfont = require("../preset/font.json")
import { presetBuildings } from '../presetBuildingsInterface'

let generatorArray = [];
let coordinatePlayerLookingAt = undefined

let localOption = {
    "__logLevel": "info",
    "__on": false
}
const logger = {
    displayChat, displayObject,
    log: function (level, message) {
        const colorMap = new Map([
            ["verbose", { num: 0, color: "§a废话：" }],
            ["debug", { num: 1, color: "§6调试：" }],
            ["info", { num: 2, color: "§b信息：" }],
            ["warning", { num: 3, color: "§e警告：" }],
            ["error", { num: 4, color: "§c错误：" }],
            ["fatal", { num: 5, color: "§4严重错误（请截图上报到：https://github.com/MCDRZF/NormaConstructor/issues 或QQ群820683439）：" }]
        ])
        if (colorMap.get(level).num >= colorMap.get(localOption["__logLevel"]).num)
            this.displayChat(colorMap.get(level).color + message)
    },
    logObject: function (level, object) {
        this.log(level, JSON.stringify(object, null, '    '))
    }
}
utils.setter.setLogger(logger)


clientSystem.initialize = function () {


    clientSystem.registerEventData("NormaConstructor:ExecutionResponse", { playerID: undefined, buildInstructions: undefined })
    clientSystem.registerEventData("NormaConstructor:setServerSideOption", { playerID: undefined, option: { key: undefined, value: undefined } })
    clientSystem.registerEventData("NormaConstructor:queryBlockType", {
        playerID: undefined,
        position: undefined
    })

    clientSystem.listenForEvent("minecraft:hit_result_continuous", (eventData) => { coordinatePlayerLookingAt = eventData.data.position })
    clientSystem.listenForEvent("minecraft:client_entered_world", (eventData) => {
        logger.logObject("debug", eventData.data.player)

        playerID = utils.misc.generatePlayerIDFromUniqueID(eventData.data.player.__unique_id__)

        //Logging:
        const scriptLoggerConfig = clientSystem.createEventData("minecraft:script_logger_config");
        scriptLoggerConfig.data.log_errors = true;
        scriptLoggerConfig.data.log_information = true;
        scriptLoggerConfig.data.log_warnings = true;
        clientSystem.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);

        //Set default setServerSideOption:(Yes I hate it too)
        setServerSideOption("__requestAdditionalPosition", true)
        setServerSideOption("__requestAdditionalBlockType", false)
        setServerSideOption("__requestAdditionalDirection", true)

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
        client.log("开始记录日志。")


    })



    clientSystem.listenForEvent("NormaConstructor:displayChatToClient", (eventData) => {
        if (playerID == eventData.data.playerID)
            displayChat(eventData.data.message)
    })
    clientSystem.listenForEvent("NormaConstructor:command", (eventData) => {
        if (playerID == eventData.data.playerID && (localOption["__on"] || eventData.data.command == "show_menu" || eventData.data.command == "choose_next_generator")) {
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
                            logger.log("error", "没有成功获取坐标，请重试。")
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
                    generatorArray[generatorIndex].removePosition()
                    logger.log("info", "已移除上一个坐标。")
                    break;
                }
                case "remove_last_blocktype": {
                    generatorArray[generatorIndex].removeBlockType()
                    logger.log("info", "已移除上一个方块类型。")
                    break;
                }
                case "remove_last_direction": {
                    generatorArray[generatorIndex].removeDirection()
                    logger.log("info", "已移除上一个方向。")
                    break;
                }
                case "choose_next_generator": {
                    if (localOption["__on"]) {setLocalOption('__on', false);logger.log("info", "插件已禁用")} else{setLocalOption('__on', true);logger.log("info", "插件已启用")}
                    break;
                }
                case "show_saved_data": {
                    logger.log("info", "当前坐标：")
                    logger.logObject("info", generatorArray[generatorIndex].positionArray)
                    logger.log("info", "当前方块类型：")
                    logger.logObject("info", generatorArray[generatorIndex].blockTypeArray)
                    logger.log("info", "当前方向：")
                    logger.logObject("info", generatorArray[generatorIndex].directionArray)
                    logger.log("info", "当前生成器设置：")
                    logger.logObject("info", generatorArray[generatorIndex].option)
                    logger.log("info", "当前本地设置：")
                    logger.logObject("info", localOption)
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
                case "read_tag": {
                    function parseTag(tag) {
                        let command = tag.split(' ')
                        if (command[0] == "add" && command[1] == "b") {
                            storeData(new BlockType(command[2], JSON.parse(command[3])), undefined, undefined)
                        }
                    }
                    eventData.data.additionalData.forEach((tag) => {
                        if (tag) parseTag(tag)
                    })
                    break;
                }
            }
        }
    })
    clientSystem.listenForEvent("NormaConstructor:serveData", (eventData) => {

        if (playerID == eventData.data.playerID && localOption["__on"]) {
            logger.log("debug", "返回数据：")
            logger.logObject("debug", eventData)
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
                case "setLocalOption": {
                    setLocalOption(uiData.data.key, uiData.data.value)
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
    logger.log("info", "核对参数中……");
    let validateResult = generatorArray[generatorIndex].validateParameter();
    if (validateResult == "success") {
        logger.log("info", "开始生成。");

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
function setLocalOption(key, value) {
    localOption[key] = value
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
    generatorArray.push(utils.generators.canonical.generatorConstrctor({
        description:
            new Description("两点生成长方体",
                new Usage(
                    ["First point", "Second point"],
                    ["BlockType"],
                    [],
                    [
                        {
                            viewtype: "button",
                            text: "自动执行",
                            key: "__executeOnAllSatisfied",
                            data: [
                                { value: true, text: "是", dataForUIHandler: "resetAll" },
                                { value: false, text: "否", dataForUIHandler: "resetAll" }
                            ]
                        },
                        {
                            viewtype: "button",
                            text: "取最大XYZ与最小XYZ",
                            key: "inferCoordinates",
                            data: [
                                { value: true, text: "是", dataForUIHandler: "threeCoordinates" },
                                { value: false, text: "否", dataForUIHandler: "twoCoordinates" }
                            ]
                        }
                    ])
            ),
        criteria: {
            positionArrayLength: 2,
            blockTypeArrayLength: 1,
            directionArrayLength: 0
        },
        option: {
            "positionArrayLengthRequired": 2,
            "blockTypeArrayLengthRequired": 1,
            "__executeOnAllSatisfied": true,
            "generateByServer": true,
            "inferCoordinates": false
        },
        method: {
            generate: function () {
                if (this.option.generateByServer) {
                    if (this.option.inferCoordinates) {
                        [this.positionArray[0].coordinate, this.positionArray[1].coordinate] = [
                            new Coordinate(
                                Math.min(this.positionArray[0].coordinate.x, this.positionArray[1].coordinate.x, this.positionArray[2].coordinate.x),
                                Math.min(this.positionArray[0].coordinate.y, this.positionArray[1].coordinate.y, this.positionArray[2].coordinate.y),
                                Math.min(this.positionArray[0].coordinate.z, this.positionArray[1].coordinate.z, this.positionArray[2].coordinate.z)
                                ),
                                new Coordinate(
                                    Math.max(this.positionArray[0].coordinate.x, this.positionArray[1].coordinate.x, this.positionArray[2].coordinate.x),
                                    Math.max(this.positionArray[0].coordinate.y, this.positionArray[1].coordinate.y, this.positionArray[2].coordinate.y),
                                    Math.max(this.positionArray[0].coordinate.z, this.positionArray[1].coordinate.z, this.positionArray[2].coordinate.z)
                                    )
                        ]
                    }
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
            UIHandler: function (data) {
                if (data == "resetAll") {
                    this.positionArray.fill(undefined)
                    this.blockTypeArray.fill(undefined)
                    this.directionArray.fill(undefined)
                }
                if (data == "threeCoordinates") {
                    this.positionArray.push(undefined)
                }
                if (data == "twoCoordinates") {
                    this.positionArray.pop()
                }
            }
        }
    }))
}());

(function () {
    generatorArray.push(
        utils.generators.canonical.generatorConstrctor(
            {
                description: new Description("克隆一个区域到另一个点",
                    new Usage(
                        [],
                        [],
                        [],
                        [])
                ),
                criteria: {
                    positionArrayLength: 3,
                    blockTypeArrayLength: 0,
                    directionArrayLength: 0
                },
                option: {
                    "positionArrayLengthRequired": 3,
                    "blockTypeArrayLengthRequired": 0,
                    "generateByServer": true
                },
                method: {
                    generate: function () {
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
                    UIHandler: function () { }
                }
            }
        )
    )
}());

(function () {

    generatorArray.push(
        Object.assign(
            utils.generators.canonical.generatorConstrctor(
                {
                    description: new Description("创建线段",
                        new Usage(
                            ["Start point"],
                            ["BlockType"],
                            ["Direction"],
                            [
                                {
                                    viewtype: "edittext",
                                    text: "长度",
                                    key: "length",
                                },
                                {
                                    viewtype: "edittext",
                                    text: "间隔",
                                    key: "interval",
                                },
                                {
                                    viewtype: "button",
                                    text: "坐标过多时移除旧坐标",
                                    key: "doAcceptNewPosition",
                                    data: [
                                        { value: false, text: "否" },
                                        { value: true, text: "是" }
                                    ]
                                },
                                {
                                    viewtype: "edittext",
                                    text: "垂直斜率",
                                    key: "gradient",
                                }
                            ])
                    ),
                    criteria: {
                        positionArrayLength: 1,
                        blockTypeArrayLength: 1,
                        directionArrayLength: 1
                    },
                    option: {
                        "positionArrayLengthRequired": 1,
                        "blockTypeArrayLengthRequired": 1,
                        "directionArrayLengthRequired": 1,
                        "length": 0,
                        "interval": 0,
                        "gradient": 0,
                        "doAcceptNewPosition": true
                    },
                    method: {
                        generate: function () {
                            let blockArray = []


                            let positionArray = this.positionArray
                            let blockTypeArray = this.blockTypeArray
                            let directionArray = this.directionArray



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
                                                new Coordinate(x, this.option.gradient * (z - positionArray[0].coordinate.z) + y, z),
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
                                                new Coordinate(x, -this.option.gradient * (z - positionArray[0].coordinate.z) + y, z),
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
                                                new Coordinate(x, this.option.gradient * (x - positionArray[0].coordinate.x) + y, z),
                                                positionArray[0].tickingArea
                                            ),
                                            blockTypeArray[0])
                                        )
                                    break;
                                }
                                case "-x": {
                                    let z = positionArray[0].coordinate.z
                                    let y = positionArray[0].coordinate.y
                                    for (let x = positionArray[0].coordinate.x; x > -this.option.length + positionArray[0].coordinate.x; x -= (this.option.interval + 1))
                                        blockArray.push(new Block(
                                            new Position(
                                                new Coordinate(x, -this.option.gradient * (x - positionArray[0].coordinate.x) + y, z),
                                                positionArray[0].tickingArea
                                            ),
                                            blockTypeArray[0])
                                        )
                                    break;
                                }
                            }

                            return blockArray
                        },
                        UIHandler: function () { }
                    }
                }
            ), {
            addPosition: function (position) {
                if (this.option.doAcceptNewPosition) {
                    let indexOfVacancy = this.positionArray.indexOf(undefined)
                    if (indexOfVacancy == -1) {
                        this.positionArray = this.positionArray.slice(1)
                        this.positionArray.push(position)
                        logger.log("info", "坐标过多，已移除旧坐标。")
                    }
                    else this.positionArray[indexOfVacancy] = position
                    logger.log("info", `已设置新的坐标。`)
                }
                else utils.generators.canonical.addFunction("position", position, this.positionArray)

            }
        }
        )
    )

}());

(function () {
    generatorArray.push(
        new Generator(
            new Description("铺公路",
                new Usage(
                    [],
                    [],
                    [],
                    [
                        {
                            viewtype: "edittext",
                            text: "长度",
                            key: "length",
                        },
                        {
                            viewtype: "button",
                            text: "类型",
                            key: "roadStyle",
                            data: [
                                { value: "NS", text: "北冥/南冥", dataForUIHandler: "preset" },
                                { value: "DB", text: "东沙/冰岛", dataForUIHandler: "preset" },
                                { value: "custom", text: "自定义", dataForUIHandler: "custom" }
                            ]
                        },
                        {
                            viewtype: "checkbox",
                            text: "护栏",
                            key: "isBarred",
                            data: [
                                { value: true, text: "是" },
                                { value: false, text: "否" },
                            ]
                        },
                        {
                            viewtype: "edittext",
                            text: "每一边车道数",
                            key: "numberOfLanesPerSide",
                        },
                        {
                            viewtype: "edittext",
                            text: "车道宽度",
                            key: "widthOfLanes",
                        },
                        {
                            viewtype: "edittext",
                            text: "白线间隔",
                            key: "dashLineInterval",
                        },
                        {
                            viewtype: "edittext",
                            text: "白线长度",
                            key: "dashLineLength",
                        },
                    ])
            ),

            [undefined],
            [],
            [undefined],
            {
                "length": 10,
                "roadStyle": "DB",
                "isBarred": false,
                "numberOfLanesPerSide": 2,
                "widthOfLanes": 3,
                "dashLineInterval": 2,
                "dashLineLength": 4
            },

            function (position) {
                utils.generators.canonical.addFunction("坐标", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("方块类型", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("方向", direction, this.directionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.positionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.blockTypeArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.directionArray)
            },

            function () { return utils.generators.canonical.validateParameter.call(this) },
            function () {
                let blockArray = []


                let positionArray = this.positionArray
                let blockTypeArray = this.blockTypeArray
                let directionArray = this.directionArray
                let option = this.option

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
                        }
                        case "-x": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => 2 * positionArray[0].coordinate.x - x,
                                (x, y, z) => y,
                                (x, y, z) => 2 * positionArray[0].coordinate.z - z
                            )
                        }
                        case "+z": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => positionArray[0].coordinate.x - (z - positionArray[0].coordinate.z),
                                (x, y, z) => y,
                                (x, y, z) => positionArray[0].coordinate.z + (x - positionArray[0].coordinate.x)
                            )
                        }
                        case "-z": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => positionArray[0].coordinate.x + (z - positionArray[0].coordinate.z),
                                (x, y, z) => y,
                                (x, y, z) => positionArray[0].coordinate.z - (x - positionArray[0].coordinate.x)
                            )
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
                    logger.log("info", "已采用自定义设置。")
                    logger.log("info", "第一个是表面方块的类型。")
                    logger.log("info", "第二个是白线。")
                    logger.log("info", "第三个是黄线。")
                    logger.log("info", "第四个是护栏。")
                    this.blockTypeArray = [undefined, undefined, undefined, undefined]
                }
                else {
                    logger.log("info", "使用预设设置，自定义设置将被删除。")
                    this.blockTypeArray = []
                }
            }
        )
    )
}());

(function () {
    generatorArray.push(
        new Generator(
            new Description("铺铁路",
                new Usage(
                    [],
                    [],
                    [],
                    [
                        {
                            viewtype: "edittext",
                            text: "长度",
                            key: "length",
                        },
                        {
                            viewtype: "checkbox",
                            text: "护栏",
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
                utils.generators.canonical.addFunction("坐标", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("方块类型", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("方向", direction, this.directionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.positionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.blockTypeArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.directionArray)
            },

            function () { return utils.generators.canonical.validateParameter.call(this) },
            function () {
                let blockArray = []


                let positionArray = this.positionArray
                let blockTypeArray = this.blockTypeArray
                let directionArray = this.directionArray
                let option = this.option

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
                        }
                        case "-x": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => 2 * positionArray[0].coordinate.x - x,
                                (x, y, z) => y,
                                (x, y, z) => 2 * positionArray[0].coordinate.z - z
                            )
                        }
                        case "+z": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => positionArray[0].coordinate.x - (z - positionArray[0].coordinate.z),
                                (x, y, z) => y,
                                (x, y, z) => positionArray[0].coordinate.z + (x - positionArray[0].coordinate.x)
                            )
                        }
                        case "-z": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => positionArray[0].coordinate.x + (z - positionArray[0].coordinate.z),
                                (x, y, z) => y,
                                (x, y, z) => positionArray[0].coordinate.z - (x - positionArray[0].coordinate.x)
                            )
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
            new Description("创建像素字",
                new Usage(
                    [],
                    [],
                    [],
                    [
                        {
                            viewtype: "edittext",
                            text: "内容",
                            key: "keyText",
                        /*
                        },
                        {
                            viewtype: "checkbox",
                            text: "垂直",
                            key: "isVertical",
                            data: [
                                { value: true, text: "是" },
                                { value: false, text: "否" },
                            ]
                        },
                        {
                            viewtype: "checkbox",
                            text: "放倒",
                            key: "isFlat",
                            data: [
                                { value: true, text: "是" },
                                { value: false, text: "否" },
                            ]*/
                        }
                    ])
            ),

            [undefined],
            [undefined],
            [undefined],
            {
                "keyText": "NZ IS JULAO"//,
                //"isFlat": false,
                //"isVertical": false
            },
            function (position) {
                utils.generators.canonical.addFunction("坐标", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("方块类型", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("方向", direction, this.directionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.positionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.blockTypeArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.directionArray)
            },
            
            function () { return utils.generators.canonical.validateParameter.call(this) },
            function () {
                let blockArray = []


                let positionArray = this.positionArray
                let blockTypeArray = this.blockTypeArray
                let directionArray = this.directionArray
                let option = this.option

                let directionMark = (function () {
                    if (-45 <= directionArray[0].y && directionArray[0].y <= 45) return "+z"
                    else if (-135 <= directionArray[0].y && directionArray[0].y <= -45) return "+x"
                    else if (45 <= directionArray[0].y && directionArray[0].y <= 135) return "-x"
                    else return "-z"
                }())
                
                let rawText = (function (text,mcfont) {
                    let l
                    l = []
                    for (let i = 0; i < text.length; i++) {
                        if (text[i] == " ") {
                            l.push(0)
                        } else {
                            l.push(mcfont[text.charCodeAt(i)])
                        }
                    }
                    return(l)
                })(option["keyText"],mcfont)
                let tempPosition = [-1,13,0]
                //t = 每个字
                //i = 每列
                //z = 每行
                let u
                for (let t = 0; t < rawText.length; t++) {
                    for (let i = 0; i < 16; i++) {
                        for (let z = 0; z < 16; z++) {
                            if (rawText[t][i * 16 + z]) {
                                if (directionMark == "-z") {
                                    blockArray.push({ "position": { "coordinate": { "x": positionArray[0].coordinate.x + tempPosition[0], "y": positionArray[0].coordinate.y + tempPosition[1], "z": positionArray[0].coordinate.z + tempPosition[2] }, "tickingArea": positionArray[0].tickingArea }, "blockType": blockTypeArray[0] })
                                } else
                                    if (directionMark == "+x") {
                                        blockArray.push({ "position": { "coordinate": { "x": positionArray[0].coordinate.x + tempPosition[2], "y": positionArray[0].coordinate.y + tempPosition[1], "z": positionArray[0].coordinate.z + tempPosition[0] }, "tickingArea": positionArray[0].tickingArea }, "blockType": blockTypeArray[0] })
                                    } else
                                        if (directionMark == "+z") {
                                            blockArray.push({ "position": { "coordinate": { "x": positionArray[0].coordinate.x - tempPosition[0], "y": positionArray[0].coordinate.y + tempPosition[1], "z": positionArray[0].coordinate.z + tempPosition[2] }, "tickingArea": positionArray[0].tickingArea }, "blockType": blockTypeArray[0] })
                                        } else
                                            if (directionMark == "-x") {
                                                blockArray.push({ "position": { "coordinate": { "x": positionArray[0].coordinate.x + tempPosition[2], "y": positionArray[0].coordinate.y + tempPosition[1], "z": positionArray[0].coordinate.z - tempPosition[0] }, "tickingArea": positionArray[0].tickingArea }, "blockType": blockTypeArray[0] })
                                            }
                            }
                            tempPosition[0] += 1
                        }
                        tempPosition[1] += -1
                        tempPosition[0] += -16
                    }
                    tempPosition[1] += 16
                    for (let d = 0; d < 16; d++) {
                        u = 0
                        for (let q = 0; q < 16; q++) {
                            if (rawText[t][q * 16 + 15 - d] != 1) {
                                u++
                            }
                        }
                        if (u == 16) {
                            tempPosition[0] += -1
                        } else {
                            break
                        }
                    }
                    if (rawText[t] == 0) {
                        tempPosition[0] += 8
                    }
                    tempPosition[0] += 17
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
            new Description("创建三角形",
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
                utils.generators.canonical.addFunction("坐标", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("方块类型", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("方向", direction, this.directionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.positionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.blockTypeArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.directionArray)
            },

            function () { return utils.generators.canonical.validateParameter.call(this) },
            function () {
                let blockArray = []


                let positionArray = this.positionArray
                let blockTypeArray = this.blockTypeArray


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
            new Description("清除地形",
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
                utils.generators.canonical.addFunction("坐标", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("方块类型", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("方向", direction, this.directionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.positionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.blockTypeArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.directionArray)
            },

            function () { return utils.generators.canonical.validateParameter.call(this) },
            function () {
                if (this.option.generateByServer) {

                    let x_min = Math.min(this.positionArray[0].coordinate.x, this.positionArray[1].coordinate.x)
                    let z_min = Math.min(this.positionArray[0].coordinate.z, this.positionArray[1].coordinate.z)

                    let x_max = Math.max(this.positionArray[0].coordinate.x, this.positionArray[1].coordinate.x)
                    let z_max = Math.max(this.positionArray[0].coordinate.z, this.positionArray[1].coordinate.z)

                    let y_start = (Math.abs(this.positionArray[0].coordinate.y - 69) < Math.abs(this.positionArray[1].coordinate.y - 69)) ? this.positionArray[0].coordinate.y : this.positionArray[1].coordinate.y

                    return [{
                        "type": "fill",
                        "data": {
                            "startCoordinate": new Coordinate(x_min, y_start + 1, z_min),
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

                    let positionArray = this.positionArray
                    let blockTypeArray = this.blockTypeArray

                    let x_min = Math.min(positionArray[0].coordinate.x, positionArray[1].coordinate.x)
                    let z_min = Math.min(positionArray[0].coordinate.z, positionArray[1].coordinate.z)

                    let x_max = Math.max(positionArray[0].coordinate.x, positionArray[1].coordinate.x)
                    let z_max = Math.max(positionArray[0].coordinate.z, positionArray[1].coordinate.z)

                    let y_start = (Math.abs(positionArray[0].coordinate.y - 69) < Math.abs(positionArray[1].coordinate.y - 69)) ? positionArray[0].coordinate.y : positionArray[1].coordinate.y

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
            new Description("创建多边形",
                new Usage(
                    [],
                    [],
                    [],
                    [
                        {
                            viewtype: "edittext",
                            text: "边数",
                            key: "numberOfSides",
                        },
                        {
                            viewtype: "edittext",
                            text: "半径",
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
                utils.generators.canonical.addFunction("坐标", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("方块类型", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("方向", direction, this.directionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.positionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.blockTypeArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.directionArray)
            },

            function () { return utils.generators.canonical.validateParameter.call(this) },
            function () {
                let blockArray = []


                let positionArray = this.positionArray

                let coordinateArray = []

                for (let theta = 0; theta <= 2 * Math.PI; theta += 2 * Math.PI / this.option.numberOfSides) {
                    coordinateArray = coordinateArray.concat(utils.coordinateGeometry.withBresenhamAlgorithm.generateLineWithTwoPoints(
                        positionArray[0].coordinate.x + this.option.r * Math.cos(theta), positionArray[0].coordinate.y, positionArray[0].coordinate.z + this.option.r * Math.sin(theta),
                        positionArray[0].coordinate.x + this.option.r * Math.cos(theta + 2 * Math.PI / this.option.numberOfSides), positionArray[0].coordinate.y, positionArray[0].coordinate.z + this.option.r * Math.sin(theta + 2 * Math.PI / this.option.numberOfSides)
                    ))
                }


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
            new Description("创建平面圆形",
                new Usage(
                    [],
                    [],
                    [],
                    [
                        {
                            viewtype: "edittext",
                            text: "半径",
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
                utils.generators.canonical.addFunction("坐标", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("方块类型", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("方向", direction, this.directionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.positionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.blockTypeArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.directionArray)
            },

            function () { return utils.generators.canonical.validateParameter.call(this) },
            function () {
                let blockArray = []



                let positionArray = this.positionArray
                let blockTypeArray = this.blockTypeArray

                let coordinateArray = []

                utils.coordinateGeometry.withBresenhamAlgorithm.generate2DCircle(positionArray[0].coordinate.x, positionArray[0].coordinate.z, this.option.r)
                    .forEach((coordinate) => {
                        coordinateArray.push(new Coordinate(coordinate.x, positionArray[0].coordinate.y, coordinate.y))
                    })


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
            new Description("创建球体",
                new Usage(
                    [],
                    [],
                    [],
                    [
                        {
                            viewtype: "edittext",
                            text: "半径",
                            key: "r",
                        },
                        {
                            viewtype: "button",
                            text: "镂空",
                            key: "isHollow",
                            data: [
                                { value: true, text: "是" },
                                { value: false, text: "否" }
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
                utils.generators.canonical.addFunction("坐标", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("方块类型", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("方向", direction, this.directionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.positionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.blockTypeArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.directionArray)
            },

            function () { return utils.generators.canonical.validateParameter.call(this) },
            function () {
                let blockArray = []


                let positionArray = this.positionArray
                let blockTypeArray = this.blockTypeArray

                let coordinateArray = this.option.isHollow ?
                    utils.coordinateGeometry.generateHollowSphere(positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z, this.option.r) :
                    utils.coordinateGeometry.generateSphere(positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z, this.option.r)

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
            new Description("创建诺玛联邦共和国旗帜",
                new Usage(
                    [],
                    [],
                    [],
                    [
                        {
                            viewtype: "edittext",
                            text: "旗帜宽度",
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
                utils.generators.canonical.addFunction("坐标", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("方块类型", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("方向", direction, this.directionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.positionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.blockTypeArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.directionArray)
            },

            function () {
                let result = new String()
                if (this.blockTypeArray.indexOf(undefined) != -1)
                    result += "Too few blockTypes!Refusing to execute.\n"
                if (this.positionArray.indexOf(undefined) != -1)
                    result += "Too few positions!Refusing to execute."
                if (this.option.height % 2 != 0) result += "无法使用奇数宽度。"
                if (result == "") result = "success"

                return result;
            },
            function () {
                let blockArray = []
                let positionArray = this.positionArray
                let option = this.option

                for (let x = positionArray[0].coordinate.x; x < positionArray[0].coordinate.x + option.height; x++)
                    for (let y = positionArray[0].coordinate.y; y > positionArray[0].coordinate.y - option.height; y--) {
                        let z = x - positionArray[0].coordinate.x + positionArray[0].coordinate.z;
                        let blockType = (function () {
                            if ((x - positionArray[0].coordinate.x <= positionArray[0].coordinate.y - y) && (positionArray[0].coordinate.y - y < option.height - (x - positionArray[0].coordinate.x))) return new BlockType("minecraft:wool", { "color": "blue" })
                            else if (positionArray[0].coordinate.y - y < option.height / 2) return new BlockType("minecraft:wool", { "color": "yellow" })
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

(function () {
    generatorArray.push(
        new Generator(
            new Description("创建地铁站",
                new Usage(
                    [],
                    [],
                    [],
                    [
                        {
                            viewtype: "edittext",
                            text: "长度",
                            key: "length",
                        },
                        {
                            viewtype: "checkbox",
                            text: "使用玻璃",
                            key: "useGlass",
                            data: [
                                { value: true, text: "是" },
                                { value: false, text: "否" },
                            ]
                        },
                        {
                            viewtype: "checkbox",
                            text: "使用染色玻璃（请确保“使用玻璃”为开启状态）",
                            key: "useColorfulGlass",
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
                "useGlass": false,
                "useColorfulGlass": false
            },

            function (position) {
                utils.generators.canonical.addFunction("坐标", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("方块类型", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("方向", direction, this.directionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.positionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.blockTypeArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.directionArray)
            },

            function () { return utils.generators.canonical.validateParameter.call(this) },
            function () {
                let blockArray = []

                let positionArray = this.positionArray
                let blockTypeArray = this.blockTypeArray
                let directionArray = this.directionArray
                let option = this.option

                const directionMark = utils.geometry.getDirectionMark.horizontal(directionArray[0].y)


                const materials = {
                    "glass": new BlockType("minecraft:glass", null),
                    "brick": new BlockType("minecraft:stonebrick", { "stone_brick_type": "default" }),
                    "prismarine": new BlockType("minecraft:prismarine", { "prismarine_block_type": "bricks" }),
                    "lantern": new BlockType("minecraft:seaLantern", null),
                    "air": new BlockType("minecraft:air", null),
                    "red_stone_torch": new BlockType("minecraft:redstone_torch", { "torch_facing_direction": "top" }),
                    "rail": utils.blockGeometry.setBlockDirection(new BlockType("minecraft:golden_rail", { "rail_data_bit": false, "rail_direction": 0 }), (directionMark == "+x" || directionMark == "-x") ? "x" : "z"),
                    "sponge": new BlockType("minecraft:sponge", { "sponge_type": "dry" })
                }

                const schematics = [
                    ["void", "ceiling", "ceiling", "ceiling", "ceiling", "ceiling", "void"],
                    ["wall", "void", "void", "void", "void", "void", "wall"],
                    ["wall/light", "void", "void", "void", "void", "void", "wall/light"],
                    ["wall", "void", "void", "void", "void", "void", "wall"],
                    ["wall", "void", "rail", "void/redstone", "rail", "void", "wall"],
                    ["ground", "ground", "ground", "ground", "ground", "ground", "ground"]
                ]

                let offset = { x: 0, y: -5, z: 3 }
                function getRandomColor() {
                    const colorSet = ["white",
                        "orange",
                        "magenta",
                        "light_blue",
                        "yellow",
                        "lime",
                        "pink",
                        "gray",
                        "silver",
                        "cyan",
                        "purple",
                        "blue",
                        "brown",
                        "green",
                        "red",
                        "black"]
                    return colorSet[Math.floor(Math.random() * colorSet.length)]
                }
                //Assuming the building is in +x direction.
                const recipe = {
                    "void": function (coordinate) { return materials["air"] },
                    "wall": function (coordinate) { return option.useGlass ? (option.useColorfulGlass ? new BlockType("minecraft:stained_glass", { color: getRandomColor() }) : materials["glass"]) : materials["brick"] },
                    "ceiling": function (coordinate) { return option.useGlass ? (option.useColorfulGlass ? new BlockType("minecraft:stained_glass", { color: getRandomColor() }) : materials["glass"]) : materials["brick"] },
                    "ground": function (coordinate) {
                        return option.useGlass ? materials["prismarine"] : materials["brick"]
                    },
                    "wall/light": function (coordinate) {
                        if (coordinate.x % 5 == 0) return materials["lantern"]
                        else return option.useGlass ? (option.useColorfulGlass ? new BlockType("minecraft:stained_glass", { color: getRandomColor() }) : materials["glass"]) : materials["brick"]
                    },
                    "rail": function (coordinate) { return materials["rail"] },
                    "void/redstone": function (coordinate) {
                        logger.logObject("debug", coordinate)
                        if (coordinate.x % 16 == 0) return materials["red_stone_torch"]
                        else return materials["air"]
                    }
                }
                blockArray = (function (position, length, directionMark, schematics, offset, recipe, y_sequence) {
                    let blockArray = []
                    if (y_sequence == undefined) {
                        y_sequence = new Array(schematics.length)
                        for (let i = 0; i < schematics.length; i++) y_sequence[i] = i
                    }
                    let transform = (function (facingAxis) {
                        switch (facingAxis) {
                            case "+x": {
                                return utils.coordinateGeometry.transform(
                                    (x, y, z) => x,
                                    (x, y, z) => y,
                                    (x, y, z) => z
                                )
                            }
                            case "-x": {
                                return utils.coordinateGeometry.transform(
                                    (x, y, z) => - x,
                                    (x, y, z) => y,
                                    (x, y, z) => - z
                                )
                            }
                            case "+z": {
                                return utils.coordinateGeometry.transform(
                                    (x, y, z) => -z,
                                    (x, y, z) => y,
                                    (x, y, z) => x
                                )
                            }
                            case "-z": {
                                return utils.coordinateGeometry.transform(
                                    (x, y, z) => z,
                                    (x, y, z) => y,
                                    (x, y, z) => -x
                                )
                            }
                        }
                    }(directionMark))
                    for (let x = 0; x < length; x++)
                        for (let y of y_sequence)
                            for (let z = 0; z < schematics[y].length; z++) {
                                let rawCoordinate = new Coordinate(x - offset.x, -y - offset.y, z - offset.z)
                                let relativeCoordinate = transform(rawCoordinate)
                                let absoluteCordinate = new Coordinate(
                                    relativeCoordinate.x + position.coordinate.x,
                                    relativeCoordinate.y + position.coordinate.y,
                                    relativeCoordinate.z + position.coordinate.z,
                                )
                                blockArray.push(new Block(
                                    new Position(absoluteCordinate, position.tickingArea),
                                    recipe[schematics[y][z]](rawCoordinate)
                                ))
                            }
                    return blockArray
                }(positionArray[0], option.length, directionMark, schematics, offset, recipe, [0, 1, 2, 3, 5, 4]))

                let transform = (function (facingAxis) {
                    switch (facingAxis) {
                        case "+x": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => x,
                                (x, y, z) => y,
                                (x, y, z) => z
                            )
                        }
                        case "-x": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => - x,
                                (x, y, z) => y,
                                (x, y, z) => - z
                            )
                        }
                        case "+z": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => -z,
                                (x, y, z) => y,
                                (x, y, z) => x
                            )
                        }
                        case "-z": {
                            return utils.coordinateGeometry.transform(
                                (x, y, z) => z,
                                (x, y, z) => y,
                                (x, y, z) => -x
                            )
                        }
                    }
                }(directionMark))

                let fillStartCoordinate = (function () {
                    let position = positionArray[0]
                    let rawCoordinate = new Coordinate(0, 5, -3)
                    let relativeCoordinate = transform(rawCoordinate)
                    let absoluteCordinate = new Coordinate(
                        relativeCoordinate.x + position.coordinate.x,
                        relativeCoordinate.y + position.coordinate.y,
                        relativeCoordinate.z + position.coordinate.z,
                    )
                    return absoluteCordinate
                })()
                let fillEndCoordinate = (function () {
                    let position = positionArray[0]
                    let rawCoordinate = new Coordinate(option.length - 1, 0, 3)
                    let relativeCoordinate = transform(rawCoordinate)
                    let absoluteCordinate = new Coordinate(
                        relativeCoordinate.x + position.coordinate.x,
                        relativeCoordinate.y + position.coordinate.y,
                        relativeCoordinate.z + position.coordinate.z,
                    )
                    return absoluteCordinate
                })()
                blockArray.splice(0, 0, new BuildInstruction("fill", {
                    blockType: new BlockType("minecraft:sponge", { "sponge_type": "dry" }),
                    startCoordinate: fillStartCoordinate,
                    endCoordinate: fillEndCoordinate
                })
                )
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
            new Description("创建蓝冰高铁",
                new Usage(
                    [],
                    [],
                    [],
                    [
                        {
                            viewtype: "edittext",
                            text: "长度",
                            key: "length",
                        },
                        {
                            viewtype: "edittext",
                            text: "蓝冰宽度",
                            key: "widthOfIce"
                        }
                    ])
            ),

            [undefined],
            [],
            [undefined],
            {
                "length": 10,
                "useGlass": false,
                "widthOfIce": 2
            },

            function (position) {
                utils.generators.canonical.addFunction("坐标", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("方块类型", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("方向", direction, this.directionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.positionArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.blockTypeArray)
            },
            function (index) {
                utils.generators.canonical.removeFunction(index, this.directionArray)
            },

            function () { return utils.generators.canonical.validateParameter.call(this) },
            function () {


                let positionArray = this.positionArray
                let blockTypeArray = this.blockTypeArray
                let directionArray = this.directionArray
                let option = this.option

                const directionMark = utils.geometry.getDirectionMark.horizontal(directionArray[0].y)


                const materials = {
                    "glass_pane": new BlockType("minecraft:glass_pane", null),
                    "iron_block": new BlockType("minecraft:iron_block", null),
                    "air": new BlockType("minecraft:air", null),
                    "blue_ice": new BlockType("minecraft:blue_ice", null)
                }

                let schematics = [[], []]

                schematics[0].push("glass_pane")
                schematics[1].push("iron_block")

                schematics[0].push(...(new Array(option.widthOfIce)).fill("air"))
                schematics[1].push(...(new Array(option.widthOfIce)).fill("blue_ice"))

                schematics[0].push("glass_pane")
                schematics[1].push("iron_block")

                let offset = { x: 0, y: -1, z: Math.ceil(option.widthOfIce / 2) }
                //Assuming the building is in +x direction.
                const recipe = {
                    "glass_pane": (coordinate) => materials["glass_pane"],
                    "iron_block": (coordinate) => materials["iron_block"],
                    "air": (coordinate) => materials["air"],
                    "blue_ice": (coordinate) => materials["blue_ice"]
                }
                let blockArray = (function (position, length, directionMark, schematics, offset, recipe, y_sequence) {
                    let blockArray = []
                    if (y_sequence == undefined) {
                        y_sequence = new Array(schematics.length)
                        for (let i = 0; i < schematics.length; i++) y_sequence[i] = i
                    }
                    let transform = (function (facingAxis) {
                        switch (facingAxis) {
                            case "+x": {
                                return utils.coordinateGeometry.transform(
                                    (x, y, z) => x,
                                    (x, y, z) => y,
                                    (x, y, z) => z
                                )
                            }
                            case "-x": {
                                return utils.coordinateGeometry.transform(
                                    (x, y, z) => - x,
                                    (x, y, z) => y,
                                    (x, y, z) => - z
                                )
                            }
                            case "+z": {
                                return utils.coordinateGeometry.transform(
                                    (x, y, z) => -z,
                                    (x, y, z) => y,
                                    (x, y, z) => x
                                )
                            }
                            case "-z": {
                                return utils.coordinateGeometry.transform(
                                    (x, y, z) => z,
                                    (x, y, z) => y,
                                    (x, y, z) => -x
                                )
                            }
                        }
                    }(directionMark))
                    for (let x = 0; x < length; x++)
                        for (let y of y_sequence)
                            for (let z = 0; z < schematics[y].length; z++) {
                                let rawCoordinate = new Coordinate(x - offset.x, -y - offset.y, z - offset.z)

                                let relativeCoordinate = transform(rawCoordinate)
                                let absoluteCordinate = new Coordinate(
                                    relativeCoordinate.x + position.coordinate.x,
                                    relativeCoordinate.y + position.coordinate.y,
                                    relativeCoordinate.z + position.coordinate.z,
                                )
                                blockArray.push(new Block(
                                    new Position(absoluteCordinate, position.tickingArea),
                                    recipe[schematics[y][z]](rawCoordinate)
                                ))
                            }
                    return blockArray
                }(positionArray[0], option.length, directionMark, schematics, offset, recipe))



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
    generatorArray.push(utils.generators.canonical.generatorConstrctor(
        {
            description: new Description("Record structure", new Usage([], [], [], [])),
            criteria: { positionArrayLength: 3, blockTypeArrayLength: 0, directionArrayLength: 0 },
            option: {},
            method: {
                UIHandler: function () { }, generate: function () {
                    return new BuildInstruction("writeBuildingStructureToLog", {
                        startCoordinate: this.positionArray[0].coordinate,
                        endCoordinate: this.positionArray[1].coordinate,
                        referenceCoordinate: this.positionArray[2].coordinate,
                        tickingArea: this.positionArray[2].tickingArea
                    })
                }
            }
        }
    ))
})();
(function () {
    generatorArray.push(utils.generators.canonical.generatorConstrctor(
        {
            description: new Description(" aspdf vhfdwvgcmfs", new Usage([], [], [], [])),
            criteria: { positionArrayLength: 1, blockTypeArrayLength: 0, directionArrayLength: 0 },
            option: {},
            method: {
                UIHandler: function () { }, generate: function () {
                    let coordinate = this.positionArray[0].coordinate

                    return Array.from(presetBuildings.subway_station, a => new Block(new Position(new Coordinate(
                        coordinate.x + a.coordinate.x, coordinate.y + a.coordinate.y, coordinate.z + a.coordinate.z
                    ), this.positionArray[0].tickingArea), a.blockType))

                }
            }
        }
    ))
})()
