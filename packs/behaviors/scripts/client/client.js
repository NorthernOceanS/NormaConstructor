var clientSystem = client.registerSystem(0, 0);

var playerID = undefined
var generatorIndex = 0
var tick = 0
var buildInstructionsQuery = []

import { Coordinate, Position, BlockType, Block, Direction, Usage, Description, Generator, BuildInstruction } from '../constructor'
import { utils } from '../utils'

import { preset } from '../presetInterface'

let generatorArray = [];
let coordinatePlayerLookingAt = undefined

let localOption = {
    "__logLevel": "info",
    "__on": true
}
const logger = {
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
        if (colorMap.get(level).num >= colorMap.get(localOption["__logLevel"]).num)
            this.displayChat(colorMap.get(level).color + "[" + level + "]" + message)
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
    //TODO:Incorporate the following with the event above.
    clientSystem.registerEventData("NZConstructor:blockFetchRequest", {
        playerID: undefined,
        position: undefined,
        requestID: undefined
    })

    clientSystem.registerEventData("NZConstructor:setBlock", {
        x: undefined,
        y: undefined,
        z: undefined,
        blockIdentifier: undefined,
        tileData: undefined,
        playerID: undefined
    })

    clientSystem.listenForEvent("minecraft:hit_result_continuous", (eventData) => { coordinatePlayerLookingAt = eventData.data.position })
    clientSystem.listenForEvent("minecraft:client_entered_world", (eventData) => {
        logger.logObject("debug", eventData.data.player)
        logger.log("verbose", `${generatorArray.length} generator(s) loaded.`)

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
        client.log("Logging started. NZ IS JULAO!")


    })



    clientSystem.listenForEvent("NormaConstructor:displayChatToClient", (eventData) => {
        if (playerID == eventData.data.playerID)
            displayChat(eventData.data.message)
    })
    clientSystem.listenForEvent("NormaConstructor:command", (eventData) => {
        if (playerID == eventData.data.playerID && (localOption["__on"] || eventData.data.command == "show_menu")) {
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
                    storeData(serveData.blockType, serveData.position, serveData.direction)
                    break;
                }
                case "remove_last_position": {
                    logger.log("info", "Removing the last position...")
                    generatorArray[generatorIndex].removePosition()
                    break;
                }
                case "remove_last_blocktype": {
                    logger.log("info", "Removing the last blockType...")
                    generatorArray[generatorIndex].removeBlockType()
                    break;
                }
                case "remove_last_direction": {
                    logger.log("info", "Removing the last direction...")
                    generatorArray[generatorIndex].removeDirection()
                    break;
                }
                case "choose_next_generator": {
                    logger.log("info", "Choosing next generator...")
                    generatorIndex = (generatorIndex + 1) % generatorArray.length
                    logger.log("debug", "Current generator:")
                    logger.logObject("debug", generatorArray[generatorIndex])
                    break;
                }
                case "show_saved_data": {
                    logger.log("info", "Current positionArray:")
                    logger.logObject("info", generatorArray[generatorIndex].positionArray)
                    logger.log("info", "Current blockTypeArray:")
                    logger.logObject("info", generatorArray[generatorIndex].blockTypeArray)
                    logger.log("info", "Current directionArray:")
                    logger.logObject("info", generatorArray[generatorIndex].directionArray)
                    logger.log("info", "Current generator option:")
                    logger.logObject("info", generatorArray[generatorIndex].option)
                    logger.log("info", "Current local option:")
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
                        else if (command[0] == "set" && command[1] == "o") {
                            generatorArray[generatorIndex].option[command[2]] = command[3]
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
            logger.log("debug", "RECEIVE:")
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
                            reload_ui()
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
async function execute() {
    logger.log("info", "Start validating parameters...");
    let validateResult = generatorArray[generatorIndex].validateParameter();
    if (validateResult == "success") {
        logger.log("info", "Now Execution started.");

        //The "buildInstructions" was named "blockArray" as it only consisted of blocks that are to be placed.
        let buildInstructions = await generatorArray[generatorIndex].generate();

        logger.logObject("verbose", buildInstructions)

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

class BlockFetch {
    constructor() {
        this.idToResolve = new Map()
        clientSystem.listenForEvent("NZConstructor:blockFetchResponse", function (eventData) {
            if (eventData.data.playerID == playerID) {
                let resolve = this.idToResolve.get(eventData.data.requestID)
                resolve(eventData.data.blockType)
                this.idToResolve.delete(eventData.data.requestID)
            }
        }.bind(this))
    }
    registerRequest(id, resolve) {
        this.idToResolve.set(id, resolve)
    }
    get(tickingArea, x, y, z) {
        let position = new Position(new Coordinate(x, y, z), tickingArea)
        let blockFetchRequestEventData = clientSystem.createEventData("NZConstructor:blockFetchRequest")
        blockFetchRequestEventData.data.position = position
        blockFetchRequestEventData.data.playerID = playerID
        let requestID
        do {
            requestID = Math.floor(Math.random() * 10000)
        }
        while (this.idToResolve.has(requestID))
        blockFetchRequestEventData.data.requestID = requestID
        clientSystem.broadcastEvent("NZConstructor:blockFetchRequest", blockFetchRequestEventData)
        return new Promise((resolve, reject) => {
            this.registerRequest(requestID, resolve)
        })
    }
}

const blockFetch = new BlockFetch()
async function getBlock(tickingArea, x, y, z) {
    let blockType = await blockFetch.get(tickingArea, x, y, z)
    return blockType
}
function setBlock(x, y, z, blockIdentifier, tileData) {
    logger.log("verbose", "NZ is JULAO")
    let setBlockEventData = clientSystem.createEventData("NZConstructor:setBlock")
    setBlockEventData.data = { x: x, y: y, z: z, blockIdentifier: blockIdentifier, tileData: tileData, playerID: playerID }
    clientSystem.broadcastEvent("NZConstructor:setBlock", setBlockEventData)
    logger.logObject("verbose", setBlockEventData)
}

function reload_ui() {
    let sendUIEventData = clientSystem.createEventData("minecraft:send_ui_event")
    sendUIEventData.data.eventIdentifier = "NormaConstructor:reload"
    sendUIEventData.data.data = JSON.stringify({
        description: generatorArray[generatorIndex].description,
        option: generatorArray[generatorIndex].option
    }, null, '    ')
    clientSystem.broadcastEvent("minecraft:send_ui_event", sendUIEventData)
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
    generatorArray.push(utils.generators.canonical.generatorConstrctor(
        {
            description: new Description("NZ IS JULAO", new Usage([], [], [], [
                {
                    viewtype: "button",
                    text: "Set branch direction.",
                    key: "branch_direction",
                    data: [
                        { value: "-z", text: "-z" },
                        { value: "+z", text: "+z" }
                    ]
                },
                {
                    viewtype: "edittext",
                    text: "Song number:",
                    key: "song_number",
                    dataForUIHandler: ""
                }
            ])),
            criteria: { positionArrayLength: 2, blockTypeArrayLength: 0, directionArrayLength: 0 },
            option: { "branch_direction": "-z", "song_number": 0, "song_name": "" },
            method: {
                UIHandler: function () { }, generate: function () {
                    const positionArray = this.positionArray
                    const { branch_direction, song_number } = this.option
                    logger.log("verbose", branch_direction)
                    let blockArray = []

                    // const song = {
                    //     tickOfSection: 4,
                    //     score: [
                    //         [{ pitch: 6, tickOffset: 0, instrument: null }, { pitch: 7, tickOffset: 1, instrument: null }, { pitch: 18, tickOffset: 1, instrument: null }],
                    //         [{ pitch: 8, tickOffset: 0, instrument: null }, { pitch: 9, tickOffset: 1, instrument: null }, { pitch: 16, tickOffset: 1, instrument: null }],
                    //         [{ pitch: 10, tickOffset: 0, instrument: null }, { pitch: 10, tickOffset: 1, instrument: null }, { pitch: 14, tickOffset: 1, instrument: null }],
                    //         [{ pitch: 11, tickOffset: 0, instrument: null }, { pitch: 12, tickOffset: 1, instrument: null }, { pitch: 12, tickOffset: 1, instrument: null }],
                    //         [{ pitch: 13, tickOffset: 0, instrument: null }, { pitch: 14, tickOffset: 1, instrument: null }, { pitch: 10, tickOffset: 1, instrument: null }],
                    //         [{ pitch: 15, tickOffset: 0, instrument: null }, { pitch: 16, tickOffset: 1, instrument: null }, { pitch: 9, tickOffset: 1, instrument: null }],
                    //         [{ pitch: 17, tickOffset: 0, instrument: null }, { pitch: 18, tickOffset: 1, instrument: null }, { pitch: 7, tickOffset: 1, instrument: null }]
                    //     ]
                    // }
                    const song = preset.songs[song_number]
                    if (song == undefined) {
                        logger.log("error", "No such song!")
                        throw "But still, NZ IS JULAO!"
                    }
                    const tickOfSection = song.tickOfSection
                    logger.log("verbose", "NZ IS JULAO!")

                    function generateBlocksPerSection(coordinate, section) {

                        function setNoteBlock(coordinate, note) {
                            logger.log("verbose", "Oh...NZ IS JULAO!")
                            let { pitch, instrument } = note
                            let noteBlockSourceCoordinate = positionArray[0].coordinate
                            let offset_z = Math.floor(pitch / 5), offset_x = pitch % 5, offset_y = 0
                            logger.log("verbose", "Err...NZ IS JULAO!")
                            // if (instrument != null) blockArray.push(new Block(new Position(new Coordinate(coordinate.x, coordinate.y - 1, coordinate.z), positionArray[0].tickingArea), new BlockType(instrument, {})))
                            switch (instrument) {
                                case "higher": offset_y = 2; break;
                                case "high": offset_y = 1; break;
                                case null: offset_y = 0; break;
                                case "low": offset_y = -1; break;
                                case "lower": offset_y = -2; break;
                            }
                            blockArray.push(new BuildInstruction("clone",
                                {
                                    startCoordinate: new Coordinate(noteBlockSourceCoordinate.x + offset_x, noteBlockSourceCoordinate.y + offset_y, noteBlockSourceCoordinate.z + offset_z),
                                    endCoordinate: new Coordinate(noteBlockSourceCoordinate.x + offset_x, noteBlockSourceCoordinate.y + offset_y, noteBlockSourceCoordinate.z + offset_z),
                                    targetCoordinate: coordinate
                                })
                            )
                        }
                        function setBedBlock(coordinate) {
                            blockArray.push(new Block(new Position(coordinate, positionArray[0].tickingArea), new BlockType("minecraft:grass", {})))
                        }
                        function setRepeater(coordinate, delay, direction) {
                            setBedBlock(new Coordinate(coordinate.x, coordinate.y - 1, coordinate.z))
                            blockArray.push(new Block(
                                new Position(coordinate, positionArray[0].tickingArea),
                                utils.blockGeometry.setBlockDirection(new BlockType("minecraft:unpowered_repeater", { repeater_delay: delay, direction: 0 }), direction)
                            ))
                        }
                        function setRedstoneDust(coordinate) {
                            setBedBlock(new Coordinate(coordinate.x, coordinate.y - 1, coordinate.z))
                            blockArray.push(new Block(
                                new Position(coordinate, positionArray[0].tickingArea),
                                new BlockType("minecraft:redstone_wire", { redstone_signal: 0 })
                            ))
                        }
                        function setRedstoneMechanism(coordinate, delay, direction) {
                            if (delay > 0) setRepeater(coordinate, delay - 1, direction)
                            else setRedstoneDust(coordinate)
                        }

                        let offset_x = 0
                        logger.log("verbose", "Yes, NZ IS JULAO!")

                        for (let tick = 0; tick < tickOfSection;) {
                            if (tickOfSection - tick >= 4) {
                                setRedstoneMechanism(new Coordinate(coordinate.x + offset_x, coordinate.y, coordinate.z), 4, "-x")
                                tick += 4
                            }
                            else {
                                setRedstoneMechanism(new Coordinate(coordinate.x + offset_x, coordinate.y, coordinate.z), tickOfSection - tick, "-x")
                                tick = tickOfSection
                            }
                            offset_x++;
                        }
                        setRedstoneDust(new Coordinate(coordinate.x + offset_x, coordinate.y, coordinate.z))

                        function generateNoteBlocks(coordinate, section) {

                            let lastTick = 0
                            section.sort((a, b) => { return a.tickOffset < b.tickOffset })
                            function sign(branch_direction) { return branch_direction == "-z" ? -1 : 1 }

                            let oppositeDirection = (branch_direction == "+z" ? "-z" : "+z")

                            let offset_z = 1;
                            for (let note of section) {
                                note.tickOffset = Math.floor(note.tickOffset)
                                if (note.tickOffset == lastTick) {
                                    setRedstoneDust(new Coordinate(coordinate.x, coordinate.y, coordinate.z + sign(branch_direction) * offset_z))
                                    offset_z++
                                    setRedstoneDust(new Coordinate(coordinate.x, coordinate.y, coordinate.z + sign(branch_direction) * offset_z))
                                    setRedstoneDust(new Coordinate(coordinate.x - 1, coordinate.y, coordinate.z + sign(branch_direction) * offset_z))
                                    setNoteBlock(new Coordinate(coordinate.x - 2, coordinate.y, coordinate.z + sign(branch_direction) * offset_z), note)
                                }
                                else {
                                    for (let tick = 0; tick < note.tickOffset - lastTick;) {
                                        if (note.tickOffset - lastTick - tick >= 4) {
                                            setRedstoneMechanism(new Coordinate(coordinate.x, coordinate.y, coordinate.z + sign(branch_direction) * offset_z), 4, oppositeDirection)
                                            tick += 4
                                        }
                                        else {
                                            setRedstoneMechanism(new Coordinate(coordinate.x, coordinate.y, coordinate.z + sign(branch_direction) * offset_z), note.tickOffset - lastTick - tick, oppositeDirection)
                                            tick = note.tickOffset - lastTick
                                        }
                                        offset_z++;
                                    }
                                    setNoteBlock(new Coordinate(coordinate.x, coordinate.y, coordinate.z + sign(branch_direction) * offset_z), note)
                                }
                                // setRedstoneMechanism(new Coordinate(coordinate.x, coordinate.y, coordinate.z + offset_z), note.tickOffset - lastTick, "-z")
                                lastTick = note.tickOffset
                                logger.log("verbose", "So...NZ IS JULAO!")
                                offset_z++
                            }
                        }

                        generateNoteBlocks(new Coordinate(coordinate.x + offset_x, coordinate.y, coordinate.z), section)
                        offset_x++
                        return offset_x;
                    }
                    let offset_x = 0
                    const startCoordinate = positionArray[1].coordinate

                    for (let score of song.score) {

                        offset_x += generateBlocksPerSection(new Coordinate(startCoordinate.x + offset_x, startCoordinate.y, startCoordinate.z), score)
                    }

                    return blockArray
                }
            }
        }
    ))
})();

(function () {
    generatorArray.push(utils.generators.canonical.generatorConstrctor({
        description:
            new Description("Create a solid cube with two points.",
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
                                { value: true, text: "On", dataForUIHandler: "resetAll" },
                                { value: false, text: "Off", dataForUIHandler: "resetAll" }
                            ]
                        },
                        {
                            viewtype: "button",
                            text: "Infer coordinates from three coordinates.",
                            key: "inferCoordinates",
                            data: [
                                { value: true, text: "On", dataForUIHandler: "threeCoordinates" },
                                { value: false, text: "Off", dataForUIHandler: "twoCoordinates" }
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
            "__executeOnAllSatisfied": false,
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

                    logger.log("verbose", "NZ is JULAO!")

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

                    logger.log("verbose", "Yes, NZ is JULAO!")

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
                description: new Description("Clone, ignoring direction.",
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
                    description: new Description("Create a line with given interval.",
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
                                },
                                {
                                    viewtype: "button",
                                    text: "Overwrite default behaviour:discard old position.",
                                    key: "doAcceptNewPosition",
                                    data: [
                                        { value: false, text: "No" },
                                        { value: true, text: "Yes" }
                                    ]
                                },
                                {
                                    viewtype: "edittext",
                                    text: "Vertical gradient:",
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
                        "doAcceptNewPosition": false
                    },
                    method: {
                        generate: function () {
                            let blockArray = []

                            logger.log("verbose", "NZ is JULAO!")

                            let positionArray = this.positionArray
                            let blockTypeArray = this.blockTypeArray
                            let directionArray = this.directionArray

                            logger.log("verbose", "Yes, NZ is JULAO!")


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
                        logger.log("warning", `Too many positions!Discarding the old one...`)
                        this.positionArray = this.positionArray.slice(1)
                        this.positionArray.push(position)
                    }
                    else this.positionArray[indexOfVacancy] = position
                    logger.log("info", `New position accepted.`)
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
            new Description("铁路生成器（DrZaofu版）",
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
                            key: "Type",
                            data: [
                                { value: "OG", text: "地上铁"},
                                { value: "OR", text: "高架铁"},
                                { value: "UG", text: "地下铁" }
                            ]
                        },
                        {
                            viewtype: "edittext",
                            text: "高架铁的柱子向下多少格",
                            key: "ORpillar"
                        },
                        {
                            viewtype: "edittext",
                            text: "地上铁与高架铁的桥墩间隔",
                            key: "gap"
                        },
                        {
                            viewtype: "checkbox",
                            text: "照明",
                            key: "light",
                            data: [
                                { value: true, text: "是" },
                                { value: false, text:"否" }
                            ]
                        },
                        {
                            viewtype: "edittext",
                            text: "轨道数",
                            key: "numberOfTrack",
                        },
                        {
                            viewtype: "button",
                            text: "主题",
                            key: "style",
                            data: [
                                { value: "Q", text: "石英" },
                                { value: "S", text: "石砖" },
                                { value: "G", text: "玻璃" }
                            ]
                        }
                    ])
            ),

            [undefined],
            [],
            [undefined],
            {
                "length": 50,
                "Type": "UG",
                "ORpillar": 20,
                "gap": 15,
                "light": true,
                "numberOfTrack": 1,
                "style":"S"
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

                let sections = {
                    "UG": [//地下铁
                        [
                            [1, 2, 1],
                            [1, 3, 0],
                            [1, 0, 0],
                            [1, 0, 0],
                            [1, 4, 0],
                            [1, 2, 1]
                        ],
                        [
                            [1],
                            [11],
                            [0],
                            [0],
                            [9],
                            [10]
                        ],
                        [
                            [1, 2, 1],
                            [0, 7, 0],
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 8, 0],
                            [1, 2, 1]
                        ],
                        [
                            [1, 2, 1],
                            [0, 5, 1],
                            [0, 0, 1],
                            [0, 0, 1],
                            [0, 6, 1],
                            [1, 2, 1]
                        ]
                    ],
                    "OR": [//高架铁
                        [
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [12, 0],
                            [2, 1],
                            [1, 1],
                            [1, 1],
                            [5, 1],
                        ],
                        [
                            [11],
                            [0],
                            [0],
                            [0],
                            [0],
                            [9],
                            [10],
                            [1],
                            [1],
                            [1]
                        ],
                        [
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 8, 0],
                            [1, 2, 1],
                            [1, 1, 1],
                            [1, 1, 1],
                            [1, 1, 1]
                        ],
                        [
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 12],
                            [1, 2],
                            [1, 1],
                            [1, 1],
                            [1, 3]
                        ],
                        [
                            option.gap,//间隔长度
                            [0, 0 - option.ORpillar, 0],//相对坐标 后面格式跟this一样
                            [
                                [11, 11],
                                [11, 0],
                                [11, 0],
                                [11, 0],
                                [11, 0],
                                [12, 0],
                                [2, 1],
                                [1, 1],
                                [1, 1],
                                [5, 1]
                            ].concat(JSON.parse(("[" + (JSON.stringify([-1, -1]) + ",").repeat(option.ORpillar) + "]").replace(",]", "]"))),
                            [
                                [11],
                                [0],
                                [0],
                                [0],
                                [0],
                                [9],
                                [10],
                                [1],
                                [1],
                                [1]
                            ].concat(JSON.parse(("[" + (JSON.stringify([1]) + ",").repeat(option.ORpillar) + "]").replace(",]", "]"))),
                            [
                                [11, 11, 11],
                                [0, 13, 0],
                                [0, 0, 0],
                                [0, 0, 0],
                                [0, 0, 0],
                                [0, 8, 0],
                                [1, 2, 1],
                                [1, 1, 1],
                                [1, 1, 1],
                                [1, 1, 1]
                            ].concat(JSON.parse(("[" + (JSON.stringify([-1, -1]) + ",").repeat(option.ORpillar) + "]").replace(",]", "]"))),
                            [
                                [11, 11],
                                [0, 11],
                                [0, 11],
                                [0, 11],
                                [0, 11],
                                [0, 12],
                                [1, 2],
                                [1, 1],
                                [1, 1],
                                [1, 3]
                            ].concat(JSON.parse(("[" + (JSON.stringify([-1, -1]) + ",").repeat(option.ORpillar) + "]").replace(",]", "]")))
                        ]
                    ],
                    "OG": [//地上铁
                        [
                            [0,0],
                            [0,0],
                            [0,0],
                            [0,0],
                            [11,0],
                            [11,0],
                            [11,0],
                            [2,1]
                        ],
                        [
                            [0],
                            [11],
                            [0],
                            [0],
                            [0],
                            [0],
                            [9],
                            [10],
                        ],
                        [
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 11, 0],
                            [1, 2, 1]
                        ],
                        [
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 11],
                            [0, 11],
                            [0, 11],
                            [1, 2]
                        ],
                        [
                            option.gap,//间隔长度
                            [0, 0, 0],//相对坐标 后面格式跟this一样
                            [
                                [12, 12],
                                [12, 0],
                                [12, 0],
                                [12, 0],
                                [12, 0],
                                [12, 0],
                                [12, 0],
                                [2, 1]
                            ],
                            [
                                [12],
                                [11],
                                [0],
                                [0],
                                [0],
                                [0],
                                [9],
                                [10]
                            ],
                            [
                                [12, 12, 12],
                                [0, 13, 0],
                                [0, 0, 0],
                                [0, 0, 0],
                                [0, 0, 0],
                                [0, 0, 0],
                                [0, 11, 0],
                                [1, 2, 1]
                            ],
                            [
                                [12, 12],
                                [0, 12],
                                [0, 12],
                                [0, 12],
                                [0, 12],
                                [0, 12],
                                [0, 12],
                                [1, 2]
                            ]
                        ]
                    ]
                }

                let style = {
                    "Q": [
                        new BlockType("minecraft:air", {}),
                        new BlockType("minecraft:quartz_block", { "chisel_type": "default", "pillar_axis": "y" }),
                        option.light ? new BlockType("minecraft:glowstone", {}) : new BlockType("minecraft:quartz_block", { "chisel_type": "default", "pillar_axis": "y" }),
                        new BlockType("minecraft:quartz_stairs", { "weirdo_direction": directionMark == "-x" ? 2 : directionMark == "-z" ? 1 : directionMark == "+x" ? 3 : 0, "upside_down_bit": true }),
                        new BlockType("minecraft:quartz_stairs", { "weirdo_direction": directionMark == "-x" ? 2 : directionMark == "-z" ? 1 : directionMark == "+x" ? 3 : 0, "upside_down_bit": false }),
                        new BlockType("minecraft:quartz_stairs", { "weirdo_direction": directionMark == "+x" ? 2 : directionMark == "+z" ? 1 : directionMark == "-x" ? 3 : 0, "upside_down_bit": true }),
                        new BlockType("minecraft:quartz_stairs", { "weirdo_direction": directionMark == "+x" ? 2 : directionMark == "+z" ? 1 : directionMark == "-x" ? 3 : 0, "upside_down_bit": false }),
                        new BlockType("minecraft:stone_slab", { "stone_slab_type": "quartz", "top_slot_bit": true }),
                        new BlockType("minecraft:stone_slab", { "stone_slab_type": "quartz", "top_slot_bit": false }),
                        new BlockType("minecraft:golden_rail", { "rail_data_bit": true, "rail_direction": directionMark == "-x" || directionMark == "+x" ? 1 : 0 }),
                        new BlockType("minecraft:redstone_block", {}),
                        new BlockType("minecraft:glass_pane", {}),
                        new BlockType("minecraft:quartz_block", { "chisel_type": "lines", "pillar_axis": "y" }),
                        new BlockType("minecraft:lantern", { "hanging": true})
                    ],
                    "S": [
                        new BlockType("minecraft:air", {}),
                        new BlockType("minecraft:stonebrick", { "stone_brick_type":"default"}),
                        option.light ? new BlockType("minecraft:glowstone", {}) : new BlockType("minecraft:stonebrick", { "stone_brick_type": "default" }),
                        new BlockType("minecraft:stone_brick_stairs", { "weirdo_direction": directionMark == "-x" ? 2 : directionMark == "-z" ? 1 : directionMark == "+x" ? 3 : 0, "upside_down_bit": true}),
                        new BlockType("minecraft:stone_brick_stairs", { "weirdo_direction": directionMark == "-x" ? 2 : directionMark == "-z" ? 1 : directionMark == "+x" ? 3 : 0, "upside_down_bit":false}),
                        new BlockType("minecraft:stone_brick_stairs", { "weirdo_direction": directionMark == "+x" ? 2 : directionMark == "+z" ? 1 : directionMark == "-x" ? 3 : 0, "upside_down_bit":true}),
                        new BlockType("minecraft:stone_brick_stairs", { "weirdo_direction": directionMark == "+x" ? 2 : directionMark == "+z" ? 1 : directionMark == "-x" ? 3 : 0, "upside_down_bit":false}),
                        new BlockType("minecraft:stone_slab", { "stone_slab_type": "stone_brick", "top_slot_bit": true}),
                        new BlockType("minecraft:stone_slab", { "stone_slab_type": "stone_brick", "top_slot_bit": false }),
                        new BlockType("minecraft:golden_rail", { "rail_data_bit": true, "rail_direction": directionMark == "-x" || directionMark == "+x" ? 1 : 0 }),
                        new BlockType("minecraft:redstone_block", {}),
                        new BlockType("minecraft:iron_bars", {}),
                        new BlockType("minecraft:cobblestone_wall", { "wall_block_type": "stone_brick"}),
                        new BlockType("minecraft:lantern", { "hanging": true })
                    ],
                    "G": [
                        new BlockType("minecraft:air", {}),
                        new BlockType("minecraft:glass", {}),
                        option.light ? new BlockType("minecraft:sealantern", {}) : new BlockType("minecraft:glass", {}),
                        new BlockType("minecraft:iron_trapdoor", { "direction": 0, "upside_down_bit": true, "open_bit": false }),
                        new BlockType("minecraft:iron_trapdoor", { "direction": 0, "upside_down_bit": false, "open_bit": false }),
                        new BlockType("minecraft:iron_trapdoor", { "direction": 0, "upside_down_bit": true, "open_bit": false }),
                        new BlockType("minecraft:iron_trapdoor", { "direction": 0, "upside_down_bit": false, "open_bit": false }),
                        new BlockType("minecraft:iron_trapdoor", { "direction": 0, "upside_down_bit": true, "open_bit": false}),
                        new BlockType("minecraft:iron_trapdoor", { "direction": 0, "upside_down_bit": false, "open_bit": false}),
                        new BlockType("minecraft:golden_rail", { "rail_data_bit": true, "rail_direction": directionMark == "-x" || directionMark == "+x" ? 1 : 0 }),
                        new BlockType("minecraft:redstone_block", {}),
                        new BlockType("minecraft:glass_pane", {}),
                        new BlockType("minecraft:sealantern", {}),
                        new BlockType("minecraft:air", {})
                    ]
                }
                let section = [sections[option.Type][0], sections[option.Type][3]]
                for (let i = 0; i < option.numberOfTrack; i++) {
                    section.splice(1, 0, sections[option.Type][1])
                    if ((i + 1) < option.numberOfTrack) {
                        section.splice(1, 0, sections[option.Type][2])
                    }
                }
                let running_position = [0, section[0].length - 1, 0]
                section.forEach(
                    (tmp_big_array) => {
                        tmp_big_array.forEach(
                            (tmp_small_array) => {
                                tmp_small_array.forEach(
                                    (tmp_point) => {
                                        if (tmp_point != -1) {
                                            directionMark == "-z" ? blockArray.push({ "type": "fill", "data": { blockType: style[option.style][tmp_point], startCoordinate: { x: positionArray[0].coordinate.x + running_position[0], y: positionArray[0].coordinate.y + running_position[1], z: positionArray[0].coordinate.z - running_position[2] }, endCoordinate: { x: positionArray[0].coordinate.x + running_position[0], y: positionArray[0].coordinate.y + running_position[1], z: positionArray[0].coordinate.z - running_position[2] - option.length } } })
                                                : directionMark == "+x" ? blockArray.push({ "type": "fill", "data": { blockType: style[option.style][tmp_point], startCoordinate: { x: positionArray[0].coordinate.x + running_position[2], y: positionArray[0].coordinate.y + running_position[1], z: positionArray[0].coordinate.z + running_position[0] }, endCoordinate: { x: positionArray[0].coordinate.x + running_position[2] + option.length, y: positionArray[0].coordinate.y + running_position[1], z: positionArray[0].coordinate.z + running_position[0] } } })
                                                    : directionMark == "+z" ? blockArray.push({ "type": "fill", "data": { blockType: style[option.style][tmp_point], startCoordinate: { x: positionArray[0].coordinate.x - running_position[0], y: positionArray[0].coordinate.y + running_position[1], z: positionArray[0].coordinate.z + running_position[2] }, endCoordinate: { x: positionArray[0].coordinate.x - running_position[0], y: positionArray[0].coordinate.y + running_position[1], z: positionArray[0].coordinate.z + running_position[2] + option.length } } })
                                                        : blockArray.push({ "type": "fill", "data": { blockType: style[option.style][tmp_point], startCoordinate: { x: positionArray[0].coordinate.x - running_position[2], y: positionArray[0].coordinate.y + running_position[1], z: positionArray[0].coordinate.z - running_position[0] }, endCoordinate: { x: positionArray[0].coordinate.x - running_position[2] - option.length, y: positionArray[0].coordinate.y + running_position[1], z: positionArray[0].coordinate.z - running_position[0] } } })
                                        }
                                        running_position[0] += 1
                                    }
                                )
                                running_position[0] -= tmp_small_array.length
                                running_position[1] -= 1
                            }
                        )
                        running_position[0] += tmp_big_array[0].length
                        running_position[1] += tmp_big_array.length
                    }
                )
                blockArray.splice(0, 0, { "type": "fill", "data": { blockType: new BlockType("minecraft:sponge", { "sponge_type": "dry" }), startCoordinate: blockArray[0].data.startCoordinate, endCoordinate: blockArray[blockArray.length - 1].data.endCoordinate } })
                logger.debug(blockArray[0])
                logger.debug(blockArray[1])
                if (sections[option.Type][4]) {
                    let gaps = [sections[option.Type][4][2], sections[option.Type][4][5]]
                    for (let i = 0; i < option.numberOfTrack; i++) {
                        gaps.splice(1, 0, sections[option.Type][4][3])
                        if ((i + 1) < option.numberOfTrack) {
                            gaps.splice(1, 0, sections[option.Type][4][4])
                        }
                    }
                    let running_position_gap
                    for (let gap = sections[option.Type][4][0]; gap < option.length; gap += option.gap) {
                        running_position_gap = [0 + sections[option.Type][4][1][0], gaps[0].length - 1 + sections[option.Type][4][1][1], 0 + sections[option.Type][4][1][2]]
                        gaps.forEach(
                            (tmp_big_array_gap) => {
                                tmp_big_array_gap.forEach(
                                    (tmp_small_array_gap) => {
                                        tmp_small_array_gap.forEach(
                                            (tmp_point_gap) => {
                                                if (tmp_point_gap != -1) {
                                                    directionMark == "-z" ? blockArray.push({ "blockType": style[option.style][tmp_point_gap], "position": { "coordinate": { x: positionArray[0].coordinate.x + running_position_gap[0], y: positionArray[0].coordinate.y + running_position_gap[1], z: positionArray[0].coordinate.z - running_position_gap[2] - gap }, "tickingArea": positionArray[0].tickingArea } })
                                                        : directionMark == "+x" ? blockArray.push({ "blockType": style[option.style][tmp_point_gap], "position": { "coordinate": { x: positionArray[0].coordinate.x + running_position_gap[2] + gap, y: positionArray[0].coordinate.y + running_position_gap[1], z: positionArray[0].coordinate.z + running_position_gap[0] }, "tickingArea": positionArray[0].tickingArea } })
                                                            : directionMark == "+z" ? blockArray.push({ "blockType": style[option.style][tmp_point_gap], "position": { "coordinate": { x: positionArray[0].coordinate.x - running_position_gap[0], y: positionArray[0].coordinate.y + running_position_gap[1], z: positionArray[0].coordinate.z + running_position_gap[2] + gap }, "tickingArea": positionArray[0].tickingArea } })
                                                                : blockArray.push({ "blockType": style[option.style][tmp_point_gap], "position": { "coordinate": { x: positionArray[0].coordinate.x - running_position_gap[2] - gap, y: positionArray[0].coordinate.y + running_position_gap[1], z: positionArray[0].coordinate.z - running_position_gap[0] }, "tickingArea": positionArray[0].tickingArea } })
                                                }
                                                running_position_gap[0] += 1
                                            }
                                        )
                                        running_position_gap[0] -= tmp_small_array_gap.length
                                        running_position_gap[1] -= 1
                                    }
                                )
                                running_position_gap[0] += tmp_big_array_gap[0].length
                                running_position_gap[1] += tmp_big_array_gap.length
                            }
                        )
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
                            key: "keyText"
                        },
                        {
                            viewtype: "checkbox",
                            text: "垂直（向下延伸）",
                            key: "isVertical",
                            data: [
                                { value: true, text: "是" },
                                { value: false, text: "否" }
                            ]
                        },
                        {
                            viewtype: "checkbox",
                            text: "平面",
                            key: "isFlat",
                            data: [
                                { value: true, text: "是" },
                                { value: false, text: "否" }
                            ]
                        }
                    ])
            ),
            [undefined],
            [undefined],
            [undefined],
            {
                "keyText": "NZ IS JULAO",
                "isFlat": false,
                "isVertical": false
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
                let rawText = (function (text, mcfont) {//新版mcfont的解码
                    let rawTextArray = []
                    for (let i = 0; i < text.length; i++) {//i 每个字
                        rawTextArray.push((function (text, mcfont) {
                            if (text == " ") {//空格return 0
                                return 0
                            }
                            let cnm = mcfont.substring(text.charCodeAt() * 16, text.charCodeAt() * 16 + 16)
                            let wdnmd = []
                            let p
                            let u
                            for (let d = 0; d < 16; d++) {//d 16个Unicode
                                p = cnm.charCodeAt(d)
                                u = 65536
                                for (let m = 0; m < 16; m++) {// m 每次减少
                                    u /= 2
                                    if (p - u >= 0) {
                                        p -= u
                                        wdnmd.push(1)
                                    }
                                    else {
                                        wdnmd.push(0)
                                    }
                                }
                            }
                            return wdnmd
                        }
                        )(text[i], mcfont))
                    }
                    return rawTextArray
                })(option["keyText"], presetBuildings.mcfont)
                /*let rawText = (function (text,mcfont) {
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
                })(option["keyText"], presetBuildings.mcfont)*/ //旧版mcfont的解码
                let tempPosition = [0, 15, 0]
                if (option["isVertical"]) {
                    tempPosition[1] = 0
                }
                //t = 每个字
                //i = 每列
                //z = 每行
                let u
                for (let t = 0; t < rawText.length; t++) {
                    for (let i = 0; i < 16; i++) {
                        for (let z = 0; z < 16; z++) {
                            if (rawText[t][i * 16 + z]) {
                                if (option["isFlat"]) {
                                    if (directionMark == "-z") {
                                        blockArray.push({ "position": { "coordinate": { "x": positionArray[0].coordinate.x + tempPosition[0], "y": positionArray[0].coordinate.y + tempPosition[2], "z": positionArray[0].coordinate.z - tempPosition[1] }, "tickingArea": positionArray[0].tickingArea }, "blockType": blockTypeArray[0] })
                                    } else
                                        if (directionMark == "+x") {
                                            blockArray.push({ "position": { "coordinate": { "x": positionArray[0].coordinate.x + tempPosition[1], "y": positionArray[0].coordinate.y + tempPosition[2], "z": positionArray[0].coordinate.z + tempPosition[0] }, "tickingArea": positionArray[0].tickingArea }, "blockType": blockTypeArray[0] })
                                        } else
                                            if (directionMark == "+z") {
                                                blockArray.push({ "position": { "coordinate": { "x": positionArray[0].coordinate.x - tempPosition[0], "y": positionArray[0].coordinate.y + tempPosition[2], "z": positionArray[0].coordinate.z + tempPosition[1] }, "tickingArea": positionArray[0].tickingArea }, "blockType": blockTypeArray[0] })
                                            } else
                                                if (directionMark == "-x") {
                                                    blockArray.push({ "position": { "coordinate": { "x": positionArray[0].coordinate.x - tempPosition[1], "y": positionArray[0].coordinate.y + tempPosition[2], "z": positionArray[0].coordinate.z - tempPosition[0] }, "tickingArea": positionArray[0].tickingArea }, "blockType": blockTypeArray[0] })
                                                }
                                } else {
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
                            }
                            tempPosition[0] += 1
                        }
                        tempPosition[1] += -1
                        tempPosition[0] += -16
                    }
                    if (t + 2 > rawText.length) {
                        break
                    }
                    if (option["isVertical"]) {
                        for (let d = 0; d < 16; d++) {
                            u = 0
                            for (let q = 0; q < 16; q++) {
                                if (rawText[t + 1][d * 16 + 15 - q] != 1) {
                                    u++
                                }
                            }
                            if (u == 16) {
                                tempPosition[1] += 1
                            } else {
                                break
                            }
                        }
                        if (rawText[t] == 0) {
                            tempPosition[1] += -8
                        }
                    } else {
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
                utils.generators.canonical.addFunction("position", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("block type", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("direction", direction, this.directionArray)
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

                logger.log("verbose", "NZ is JULAO!")

                let positionArray = this.positionArray
                let blockTypeArray = this.blockTypeArray
                let directionArray = this.directionArray
                let option = this.option

                logger.log("verbose", "Yes, NZ is JULAO!")

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
                    logger.log("info", "Using custom materials.")
                    logger.log("info", "First block type for surface.")
                    logger.log("info", "Second for white line.")
                    logger.log("info", "Third for yellow line.")
                    logger.log("info", "Fourth for bar.")
                    this.blockTypeArray = [undefined, undefined, undefined, undefined]
                }
                else {
                    logger.log("info", "Using preset materials. Custom materials are erased!")
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
                utils.generators.canonical.addFunction("position", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("block type", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("direction", direction, this.directionArray)
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

                logger.log("verbose", "NZ is JULAO!")

                let positionArray = this.positionArray
                let blockTypeArray = this.blockTypeArray
                let directionArray = this.directionArray
                let option = this.option
                logger.log("verbose", "Yes, NZ is JULAO!")

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
                utils.generators.canonical.addFunction("position", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("block type", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("direction", direction, this.directionArray)
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

                logger.log("verbose", "NZ is JULAO!")

                let positionArray = this.positionArray
                let blockTypeArray = this.blockTypeArray

                logger.log("verbose", "Yes, NZ is JULAO!")

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
                utils.generators.canonical.addFunction("position", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("block type", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("direction", direction, this.directionArray)
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
                    logger.log("verbose", "NZ is JULAO!")

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

                    logger.log("verbose", "NZ is JULAO!")

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
                utils.generators.canonical.addFunction("position", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("block type", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("direction", direction, this.directionArray)
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

                logger.log("verbose", "NZ is JULAO!")

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
                utils.generators.canonical.addFunction("position", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("block type", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("direction", direction, this.directionArray)
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



                logger.log("verbose", "NZ is JULAO!")

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
                utils.generators.canonical.addFunction("position", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("block type", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("direction", direction, this.directionArray)
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



                logger.log("verbose", "NZ is JULAO!")

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
                utils.generators.canonical.addFunction("position", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("block type", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("direction", direction, this.directionArray)
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
                if (this.option.height % 2 != 0) result += "The height is odd!"
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
            new Description("Construct subway",
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
                            text: "Use glass",
                            key: "useGlass",
                            data: [
                                { value: true, text: "Yes" },
                                { value: false, text: "No" },
                            ]
                        },
                        {
                            viewtype: "checkbox",
                            text: "Carnival!\(Require \' Use glass\' to be opened\)",
                            key: "useColorfulGlass",
                            data: [
                                { value: true, text: "Yes" },
                                { value: false, text: "No" },
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
                utils.generators.canonical.addFunction("position", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("block type", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("direction", direction, this.directionArray)
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

                logger.log("verbose", "NZ is JULAO!")

                let positionArray = this.positionArray
                let blockTypeArray = this.blockTypeArray
                let directionArray = this.directionArray
                let option = this.option
                logger.log("verbose", "Yes, NZ is JULAO!")

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
            new Description("Construct blue ice \"railway\"",
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
                            viewtype: "edittext",
                            text: "Width of the ice:",
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
                utils.generators.canonical.addFunction("position", position, this.positionArray)
            },
            function (blockType) {
                utils.generators.canonical.addFunction("block type", blockType, this.blockTypeArray)
            },
            function (direction) {
                utils.generators.canonical.addFunction("direction", direction, this.directionArray)
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

                logger.log("verbose", "NZ is JULAO!")

                let positionArray = this.positionArray
                let blockTypeArray = this.blockTypeArray
                let directionArray = this.directionArray
                let option = this.option
                logger.log("verbose", "Yes, NZ is JULAO!")

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

                    return Array.from(preset.subway_station, a => new Block(new Position(new Coordinate(
                        coordinate.x + a.coordinate.x, coordinate.y + a.coordinate.y, coordinate.z + a.coordinate.z
                    ), this.positionArray[0].tickingArea), a.blockType))

                }
            }
        }
    ))
})();

(function () {
    generatorArray.push(utils.generators.canonical.generatorConstrctor({
        description: new Description("Create ellipsoid", new Usage([], [], [], [

            {
                viewtype: "edittext",
                text: "a:",
                key: "a",
            },
            {
                viewtype: "edittext",
                text: "b:",
                key: "b",
            },
            {
                viewtype: "edittext",
                text: "c:",
                key: "c",
            }
        ])),
        criteria: { positionArrayLength: 1, blockTypeArrayLength: 1, directionArrayLength: 0 },
        option: { a: 0, b: 0, c: 0 },
        method: {
            UIHandler: function () { },
            generate: function () {
                let blockArray = []



                logger.log("verbose", "NZ is JULAO!")

                let positionArray = this.positionArray
                let { x, y, z } = this.positionArray[0].coordinate
                let blockTypeArray = this.blockTypeArray
                let { a, b, c } = this.option

                let coordinateArray = utils.coordinateGeometry.generateWithConstraint([-a, a], [-b, b], [-c, c], (x, y, z) => { return x * x / (a * a) + y * y / (b * b) + z * z / (c * c) <= 1 })

                for (let coordinate of coordinateArray)
                    blockArray.push(new Block(
                        new Position(
                            new Coordinate(x + coordinate.x, y + coordinate.y, z + coordinate.z),
                            positionArray[0].tickingArea
                        ),
                        blockTypeArray[0]
                    ))

                return blockArray
            }
        }
    }))
})();

(function () {
    generatorArray.push(
        new Generator(
            new Description("OSMCity - Building Generator", new Usage([], [], [], [])),
            [],
            [],
            [],
            {
                "mininumPositionRequired": 3
            },
            function (position) {
                this.positionArray.push(position)
            },
            function (blockType) { },
            function (direction) { },
            function (index) {
                if (index === undefined)
                    for (index = this.positionArray.length - 1; index >= 0 && this.positionArray[index] == undefined; index--);
                if (index >= 0) this.positionArray[index] = undefined
                logger.logObject("info", this.positionArray)
            },
            function (index) { },
            function (index) { },
            function () {
                let result = new String()
                this.positionArray = this.positionArray.filter((e) => e != undefined || e != null)
                if (this.positionArray.length < 3) result += "Too few positions!Refusing to execute.\n"
                if (result == "") result = "success"
                else logger.log("error", result)

                return result;
            },
            function () {
                let blockInstructions = []

                let setblock = function (x, y, z, blockIdentifier, tiledata) {
                    this.push(new BuildInstruction("setblockWithTiledata", { x, y, z, blockIdentifier, tiledata }))
                }.bind(blockInstructions)

                logger.log("debug", "Start building...")

                /*============================================ OSMCity - BuildingGenerator ===========================================*/

                const undef = -1073741824;
                const inf = 1073741824;
                const MAX_LEVEL = 256;
                const DEBUG = false;
                // 以下为结构体声明
                class myBlock {
                    id;
                    data;
                    bump;
                    random; rand_min; rand_max;
                    constructor(id) {
                        this.id = id;
                        switch (arguments.length) {
                            case 2:     //id, data
                                this.data = arguments[1];
                                this.bump = false;
                                this.random = 0;
                                this.rand_min = arguments[1];
                                this.rand_max = arguments[1];
                                break;
                            case 3:     //id, data, bump
                                this.data = arguments[1];
                                this.bump = arguments[2];
                                this.random = 0;
                                this.rand_min = arguments[1];
                                this.rand_max = arguments[1];
                                break;
                            case 5:     //id, data, random, rand_min, rand_max
                                this.data = arguments[1];
                                this.random = arguments[2];
                                this.rand_min = arguments[3];
                                this.rand_max = arguments[4];
                                this.bump = false;
                                break;
                            case 6:     //id, data, bump, random, rand_min, rand_max
                                this.data = arguments[1];
                                this.bump = arguments[2];
                                this.random = arguments[3];
                                this.rand_min = arguments[4];
                                this.rand_max = arguments[5];
                                break;
                        }
                    }
                    Equals(n) {
                        return n.id === this.id && n.data === this.data;
                    }
                }
                class myCoordinate {
                    x; z;
                    constructor(x, z) {
                        this.x = x;
                        this.z = z;
                    }
                    Equals(n) {
                        return n.x === this.x && n.z === this.z;
                    }
                    toString() {
                        return "(" + this.x.toString() + "," + this.z.toString() + ")";
                    }
                }
                class node {
                    x; y;
                    constructor(x, y) {
                        this.x = x;
                        this.y = y;
                    }
                    Equals(n) {
                        return n.x === this.x && n.y === this.y;
                    }
                }
                class Roof {
                    WindowFrame;
                    Window;
                    Base;
                    Data;
                    constructor(windowFrame, window, Base, Data) {
                        this.WindowFrame = windowFrame;
                        this.Window = window;
                        this.Base = Base;
                        this.Data = Data;
                    }
                    GetReduceDelta() {
                        //return Data[0].length - 1;
                        return 2;
                    }
                    GetLength() {
                        return this.Data.length;
                    }
                    GetWidth() {
                        return this.Data[0].length;
                    }
                    GetHeight() {
                        return this.Data[0][0].length;
                    }
                }
                class FirstFloor {
                    Base;
                    Window;
                    U1;
                    U2;
                    Data;
                    constructor(Base, window, u1, u2, Data) {
                        this.Base = Base;
                        this.Window = window;
                        this.U1 = u1;
                        this.U2 = u2;
                        this.Data = Data;
                    }
                    GetReduceDelta() {
                        //return GetWidth();
                        return 2;
                    }
                    GetHeight() {
                        return this.Data.length;
                    }
                    GetLength() {
                        return this.Data[0].length;
                    }
                    GetWidth() {
                        return this.Data[0][0].length;
                    }
                }
                class Interior {
                    Base;
                    Light;
                    Data;
                    constructor(Base, Light, Data) {
                        this.Base = Base;
                        this.Light = Light;
                        this.Data = Data;
                    }
                    GetReduceDelta() {
                        //return this.GetWidth();
                        return Math.min(6, this.GetWidth() / 2);
                    }
                    GetHeight() {
                        return this.Data.length;
                    }
                    GetLength() {
                        return this.Data[0].length;
                    }
                    GetWidth() {
                        return this.Data[0][0].length;
                    }
                }
                class FirstFloorInfo {
                    start;
                    end;
                    firstfloor_kind;
                    Base;
                    constructor(start, end, firstfloor_kind, Base) {
                        this.start = start;
                        this.end = end;
                        this.firstfloor_kind = firstfloor_kind;
                        this.Base = Base;
                    }
                }
                class InteriorInfo {
                    start; end;
                    interior_kind;
                    clevel;
                    sh;
                    Base;
                    constructor(start, end, interior_kind, clevel, sh, Base) {
                        this.start = start;
                        this.end = end;
                        this.interior_kind = interior_kind;
                        this.clevel = clevel;
                        this.sh = sh;
                        this.Base = Base;
                    }
                }
                class Vector2 {
                    x; y;
                    constructor(x, y) {
                        this.x = x;
                        this.y = y;
                    }
                    static Dot(a, b) {
                        return a.x * b.x + a.y * b.y;
                    }
                    Length() {
                        return Math.sqrt(this.x * this.x + this.y * this.y);
                    }
                }
                class Vector3 {
                    x; y; z;
                    constructor(x, y, z) {
                        this.x = x;
                        this.y = y;
                        this.z = z;
                    }
                    toString() {
                        let str = "(" + this.x.toString() + "," + this.y.toString() + "," + this.z.toString() + ")";
                        return str;
                    }
                }
                class Random {
                    Next(begin, end) {
                        return Math.floor(Math.random() * (end - begin) + begin);
                    }
                    NextDouble() {
                        return Math.random();
                    }
                }

                const B = new myBlock(-1);
                const WF = new myBlock(-2);
                const W = new myBlock(-3);
                const U1 = new myBlock(-4);
                const U2 = new myBlock(-5);
                const L = new myBlock(-6);
                const air = new myBlock(0);
                let rd = new Random();

                function pnpoly4(nodes, test) {
                    let c = false;
                    let n = nodes.length;
                    for (let i = 0; i < n; i++) {
                        let j;
                        if (i === 0 || nodes[i - 1].x === undef || nodes[i - 1].y === undef) {
                            for (j = i + 1; j < nodes.length; j++) {
                                if (nodes[j].x === undef || nodes[j].y === undef) {
                                    break;
                                }
                            }
                            j--;
                        } else {
                            j = i - 1;
                        }
                        if (nodes[i].x === undef || nodes[j].x === undef) continue;
                        if (nodes[i].x === test.x && test.x === nodes[j].x && Math.min(nodes[i].y, nodes[j].y) <= test.y && test.y <= Math.max(nodes[i].y, nodes[j].y)
                            || nodes[i].y === test.y && test.y === nodes[j].y && Math.min(nodes[i].x, nodes[j].x) <= test.x && test.x <= Math.max(nodes[i].x, nodes[j].x))
                            return false;
                        if (((nodes[i].y > test.y) !== (nodes[j].y > test.y)) && (test.x < (nodes[j].x - nodes[i].x) * (test.y - nodes[i].y) / (nodes[j].y - nodes[i].y) + nodes[i].x)) {
                            c = !c;
                        }
                    }
                    return c;
                }

                class OSMCity {
                    // 以下为常量
                    min_level = 3;                     // 最矮楼层数
                    max_level = 7;                     // 最高楼层数
                    max_legal_level = 36;              // 最高允许楼层
                    max_small_level = 3;               // 小建筑最高楼层
                    cmplx_building_nodenum = 30;       // 复杂建筑物顶点数
                    cos_th = 0.5;                   // 使用在屋顶和内饰生成内的
                    skipKCheck = true;                // 对于简单建筑物跳过斜率检查
                    refalist = false;                 // 延伸是否加入nodelist
                    base_y = 4;                       //地基开始的y

                    WallConfig = [
                        [
                            [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 2, true)],
                            [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(24, 0, false), new myBlock(24, 2, true)],
                            [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(24, 0, false), new myBlock(24, 2, true)],
                            [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(24, 0, false), new myBlock(24, 2, true)],
                            [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(44, 0, true), new myBlock(44, 0, true), new myBlock(24, 0, false), new myBlock(24, 2, true)],
                            [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 2, true)],
                            [new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true)]
                        ],
                        [
                            [new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15)],
                            [new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(159, 2, false, 1, 0, 15)],
                            [new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(155, 1, false), new myBlock(159, 2, false, 1, 0, 15)],
                            [new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(155, 1, false), new myBlock(159, 2, false, 1, 0, 15)],
                            [new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(159, 2, false, 1, 0, 15)],
                            [new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15)],
                            [new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true)]
                        ],
                        [
                            [new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 2, true)],
                            [new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 2, true)],
                            [new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(155, 1, false), new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 2, true)],
                            [new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(155, 1, false), new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 2, true)],
                            [new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 2, true)],
                            [new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 2, true)],
                            [new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 2, true)]
                        ],
                        [
                            [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false)],
                            [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(159, 8, false), new myBlock(159, 8, false), new myBlock(159, 8, false), new myBlock(159, 8, false), new myBlock(24, 0, false)],
                            [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(159, 8, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 8, false), new myBlock(24, 0, false)],
                            [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(159, 8, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 8, false), new myBlock(24, 0, false)],
                            [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(159, 8, false), new myBlock(159, 8, false), new myBlock(159, 8, false), new myBlock(159, 8, false), new myBlock(24, 0, false)],
                            [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false)],
                            [new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true)]
                        ],
                        [
                            [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false)],
                            [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(24, 0, false)],
                            [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(45, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(45, 0, false), new myBlock(24, 0, false)],
                            [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(45, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(45, 0, false), new myBlock(24, 0, false)],
                            [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(24, 0, false)],
                            [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false)],
                            [new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true)]
                        ],
                        [
                            [new myBlock(155, 2, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 2, false), new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 2, false), new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 2, false), new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 2, false), new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 2, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true)]
                        ],
                        [
                            [new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false)],
                            [new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false)],
                            [new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false)],
                            [new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false)],
                            [new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false)],
                            [new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false)],
                            [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(159, 9, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(159, 9, false)]
                        ],
                        [
                            [new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 8, true), new myBlock(159, 8, true), new myBlock(159, 8, true), new myBlock(159, 8, true), new myBlock(159, 0, false), new myBlock(159, 0, false)],
                            [new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false)],
                            [new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false)],
                            [new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false)],
                            [new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false)]
                        ],
                        [
                            [new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 2, false)],
                            [new myBlock(159, 11, false, 1, 0, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 2, false)],
                            [new myBlock(159, 11, false, 1, 0, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 2, false)],
                            [new myBlock(159, 11, false, 1, 0, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 2, false)],
                            [new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 2, false)],
                            [new myBlock(159, 11, false, 1, 0, 15), new myBlock(159, 11, false, 1, 0, 15), new myBlock(159, 11, false, 1, 0, 15), new myBlock(159, 11, false, 1, 0, 15), new myBlock(159, 11, false, 1, 0, 15), new myBlock(159, 11, false, 1, 0, 15), new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 2, false)]
                        ],
                        [
                            [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(159, 8, false)],
                            [new myBlock(155, 0, false), new myBlock(160, 0, false), new myBlock(160, 0, false), new myBlock(155, 0, false), new myBlock(159, 8, false)],
                            [new myBlock(155, 0, false), new myBlock(160, 0, false), new myBlock(160, 0, false), new myBlock(155, 0, false), new myBlock(159, 8, false)],
                            [new myBlock(155, 0, false), new myBlock(160, 0, false), new myBlock(160, 0, false), new myBlock(155, 0, false), new myBlock(159, 8, false)],
                            [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(159, 8, false)],
                            [new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true)]
                        ],
                        [
                            [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(155, 2, false)],
                            [new myBlock(24, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 0, false), new myBlock(155, 2, false)],
                            [new myBlock(24, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 0, false), new myBlock(155, 2, false)],
                            [new myBlock(24, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 0, false), new myBlock(155, 2, false)],
                            [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(155, 2, false)],
                            [new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true)]
                        ],
                        [
                            [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false)],
                            [new myBlock(24, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(24, 0, false)],
                            [new myBlock(24, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(24, 0, false)],
                            [new myBlock(24, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(24, 0, false)],
                            [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false)]
                        ],
                        [
                            [new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false), new myBlock(45, 0, false)],
                            [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, false)],
                            [new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 0, false), new myBlock(45, 0, false)],
                            [new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 0, false), new myBlock(45, 0, false)],
                            [new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 0, false), new myBlock(45, 0, false)],
                            [new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 0, false), new myBlock(45, 0, false)],
                            [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false)]
                        ],
                        [
                            [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(160, 0, false), new myBlock(160, 0, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(160, 0, false), new myBlock(160, 0, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(160, 0, false), new myBlock(160, 0, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(160, 0, false), new myBlock(160, 0, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true)]
                        ],
                        [
                            [new myBlock(216, 0, false), new myBlock(216, 0, false), new myBlock(216, 0, false), new myBlock(216, 0, false), new myBlock(216, 0, false), new myBlock(216, 0, false)],
                            [new myBlock(216, 0, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(216, 0, false)],
                            [new myBlock(216, 0, false), new myBlock(155, 1, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 1, false), new myBlock(216, 0, false)],
                            [new myBlock(216, 0, false), new myBlock(155, 1, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 1, false), new myBlock(216, 0, false)],
                            [new myBlock(216, 0, false), new myBlock(155, 1, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 1, false), new myBlock(216, 0, false)],
                            [new myBlock(216, 0, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(216, 0, false)],
                            [new myBlock(216, 0, false), new myBlock(216, 0, false), new myBlock(216, 0, false), new myBlock(216, 0, false), new myBlock(216, 0, false), new myBlock(216, 0, false)],
                            [new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true)]
                        ],
                        [
                            [new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false)],
                            [new myBlock(24, 2, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(24, 2, false)],
                            [new myBlock(24, 2, false), new myBlock(155, 1, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 1, false), new myBlock(24, 2, false)],
                            [new myBlock(24, 2, false), new myBlock(155, 1, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 1, false), new myBlock(24, 2, false)],
                            [new myBlock(24, 2, false), new myBlock(155, 1, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 1, false), new myBlock(24, 2, false)],
                            [new myBlock(24, 2, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(24, 2, false)],
                            [new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false)],
                            [new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true)]
                        ],
                        [
                            [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 0, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 0, false), new myBlock(24, 2, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 2, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 0, false), new myBlock(24, 2, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 2, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 0, false), new myBlock(24, 2, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 2, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 0, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(155, 0, false)],
                            [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false)],
                            [new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true)]
                        ],
                        [
                            [new myBlock(43, 0, false), new myBlock(43, 0, false), new myBlock(43, 0, false), new myBlock(43, 0, false), new myBlock(35, 7, true)],
                            [new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 7, true)],
                            [new myBlock(35, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(35, 0, false), new myBlock(35, 7, true)],
                            [new myBlock(35, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(35, 0, false), new myBlock(35, 7, true)],
                            [new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 7, true)]
                        ],
                        [
                            [new myBlock(155, 0, false), new myBlock(236, 7, true)],
                            [new myBlock(20, 0, false), new myBlock(236, 7, true)],
                            [new myBlock(20, 0, false), new myBlock(236, 7, true)],
                            [new myBlock(20, 0, false), new myBlock(236, 7, true)],
                            [new myBlock(20, 0, false), new myBlock(236, 7, true)],
                            [new myBlock(20, 0, false), new myBlock(236, 7, true)],
                            [new myBlock(155, 0, false), new myBlock(236, 7, true)]
                        ],
                        [
                            [new myBlock(159, 9, false), new myBlock(159, 9, false), new myBlock(159, 9, false), new myBlock(159, 9, false)],
                            [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                            [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                            [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                            [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                            [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                            [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                            [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                            [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                            [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                            [new myBlock(159, 9, false), new myBlock(159, 9, false), new myBlock(159, 9, false), new myBlock(159, 9, false)]
                        ],
                        [
                            [new myBlock(35, 7, false), new myBlock(35, 7, false), new myBlock(35, 7, false), new myBlock(35, 7, false), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                            [new myBlock(35, 7, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(35, 7, false), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                            [new myBlock(35, 7, false), new myBlock(35, 7, false), new myBlock(35, 7, false), new myBlock(35, 7, false), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                            [new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true)]
                        ],
                        [
                            [new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                            [new myBlock(35, 11, false, 1, 1, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                            [new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                            [new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true)],
                            [new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                            [new myBlock(35, 11, false, 1, 1, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                            [new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                            [new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true)]
                        ]
                    ];
                    WallConfig_v2 = [
                        [
                            [[new myBlock(155, 0), new myBlock(155, 0), new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(155, 0), new myBlock(155, 2)]],
                            [[new myBlock(155, 0), new myBlock(0, 0), new myBlock(85, 2)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(85, 2)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(85, 2)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(85, 2)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(85, 2)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(85, 2)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(85, 2)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(85, 2)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(155, 2)]],
                            [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(155, 2)]],
                            [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(155, 2)]],
                            [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(155, 2)]],
                            [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(155, 2)]],
                            [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(155, 2)]],
                        ],
                        [
                            [[new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(35, 0)]],
                            [[new myBlock(35, 7)], [new myBlock(20, 0)], [new myBlock(20, 0)], [new myBlock(35, 7)], [new myBlock(20, 0)], [new myBlock(20, 0)], [new myBlock(35, 7)], [new myBlock(35, 7), new myBlock(35, 0)]],
                            [[new myBlock(35, 7)], [new myBlock(20, 0)], [new myBlock(20, 0)], [new myBlock(35, 7)], [new myBlock(20, 0)], [new myBlock(20, 0)], [new myBlock(35, 7)], [new myBlock(35, 7), new myBlock(35, 0)]],
                            [[new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(35, 0)]],
                            [[new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(35, 0)]],
                            [[new myBlock(35, 7)], [new myBlock(20, 0)], [new myBlock(20, 0)], [new myBlock(35, 7)], [new myBlock(20, 0)], [new myBlock(20, 0)], [new myBlock(35, 7)], [new myBlock(35, 7), new myBlock(35, 0)]],
                            [[new myBlock(35, 7)], [new myBlock(20, 0)], [new myBlock(20, 0)], [new myBlock(35, 7)], [new myBlock(20, 0)], [new myBlock(20, 0)], [new myBlock(35, 7)], [new myBlock(35, 7), new myBlock(35, 0)]],
                            [[new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(35, 0)]]
                        ],
                        [
                            [[new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(155, 2)]],
                            [[new myBlock(24, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(24, 0), new myBlock(101, 0)], [new myBlock(24, 0), new myBlock(155, 2)]],
                            [[new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)]],
                            [[new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)]],
                            [[new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)]],
                            [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)]]
                        ],
                        [
                            [[new myBlock(24, 2), new myBlock(44, 9)], [new myBlock(24, 2), new myBlock(44, 9)], [new myBlock(24, 2), new myBlock(44, 9)], [new myBlock(24, 2), new myBlock(44, 9)], [new myBlock(24, 2), new myBlock(24, 0)]],
                            [[new myBlock(24, 2), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(24, 2), new myBlock(101, 0)], [new myBlock(24, 2), new myBlock(24, 0)]],
                            [[new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 0)]],
                            [[new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 0)]],
                            [[new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 0)]],
                            [[new myBlock(24, 2)], [new myBlock(24, 2)], [new myBlock(24, 2)], [new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 0)]]
                        ],
                        [
                            [[new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(24, 2)]],
                            [[new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(155, 0), new myBlock(24, 2)]],
                            [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(24, 2)]],
                            [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(24, 2)]],
                            [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(24, 2)]],
                            [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(24, 2)]]
                        ],
                        [
                            [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(156, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0), new myBlock(156, 1)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)],],
                            [[new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)],],
                            [[new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)],],
                            [[new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)],],
                            [[new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)],],
                            [[new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)],],
                            [[new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)],],
                            [[new myBlock(24, 0)], [new myBlock(128, 5)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(128, 4)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(128, 5)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(128, 4)], [new myBlock(24, 0)],],
                            [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)],],
                            [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(156, 4)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0), new myBlock(156, 5)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)],],
                            [[new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)]]
                        ],
                        [
                            [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0), new myBlock(156, 4)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(155, 0), new myBlock(156, 5)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(156, 7), new myBlock(44, 14)], [new myBlock(156, 7), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0), new myBlock(156, 0)], [new myBlock(45, 0), new myBlock(156, 7)], [new myBlock(45, 0), new myBlock(156, 7)], [new myBlock(45, 0), new myBlock(156, 1)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                        ],
                        [
                            [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(155, 0), new myBlock(156, 4)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(155, 0), new myBlock(156, 5)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(156, 7), new myBlock(44, 14)], [new myBlock(156, 7), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(156, 0)], [new myBlock(24, 0), new myBlock(156, 7)], [new myBlock(24, 0), new myBlock(156, 7)], [new myBlock(24, 0), new myBlock(156, 1)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                        ],
                        [
                            [[new myBlock(24, 0), new myBlock(0, 0), new myBlock(101, 0)], [new myBlock(24, 0), new myBlock(0, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(0, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(0, 0), new myBlock(101, 0)], [new myBlock(24, 0), new myBlock(0, 0), new myBlock(101, 0)], [new myBlock(24, 0), new myBlock(0, 0), new myBlock(101, 0)], [new myBlock(24, 2), new myBlock(0, 0), new myBlock(101, 0)]],
                            [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                            [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                            [[new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                            [[new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(128, 0)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(128, 1)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                            [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(44, 1)], [new myBlock(24, 0), new myBlock(44, 1)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                            [[new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(101, 0)], [new myBlock(128, 3), new myBlock(101, 0)], [new myBlock(128, 3), new myBlock(101, 0)], [new myBlock(24, 0), new myBlock(101, 0)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                            [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                            [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                            [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                            [[new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(128, 7)], [new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                            [[new myBlock(24, 0), new myBlock(44, 9), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(128, 7), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(128, 7), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(44, 9), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(44, 9), new myBlock(44, 9)]]
                        ],
                        [
                            [[new myBlock(24, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(24, 0), new myBlock(101, 0)], [new myBlock(159, 4)]],
                            [[new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(159, 4)]],
                            [[new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(159, 4)]],
                            [[new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(159, 4)]],
                            [[new myBlock(24, 0)], [new myBlock(24, 2)], [new myBlock(24, 2)], [new myBlock(24, 0)], [new myBlock(159, 4)]],
                            [[new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(159, 4), new myBlock(128, 7)]]
                        ],
                        [
                            [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(159, 0, 1, 0, 15)]],
                            [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(159, 0, 1, 0, 15)]],
                            [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(159, 0, 1, 0, 15)]],
                            [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(159, 0, 1, 0, 15)]],
                            [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(159, 0, 1, 0, 15)]],
                            [[new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(155, 0), new myBlock(156, 7)]]
                        ],
                        [
                            [[new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(128, 7)], [new myBlock(128, 7)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(155, 0), new myBlock(128, 4)], [new myBlock(155, 0), new myBlock(128, 7)], [new myBlock(155, 0), new myBlock(128, 7)], [new myBlock(155, 0), new myBlock(128, 5)], [new myBlock(155, 0)]],
                            [[new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(128, 7)], [new myBlock(128, 7)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                            [[new myBlock(155, 0), new myBlock(128, 7)], [new myBlock(155, 0), new myBlock(128, 7)], [new myBlock(155, 0), new myBlock(128, 7)], [new myBlock(155, 0), new myBlock(128, 7)], [new myBlock(155, 0), new myBlock(128, 7)]]
                        ],
                        [
                            [[new myBlock(159, 0, 1, 0, 15), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(159, 0, 1, 0, 15), new myBlock(101, 0)], [new myBlock(159, 0, 1, 0, 15)]],
                            [[new myBlock(159, 0, 1, 0, 15)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)]],
                            [[new myBlock(159, 0, 1, 0, 15)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)]],
                            [[new myBlock(159, 0, 1, 0, 15)], [new myBlock(128, 7)], [new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)]],
                            [[new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)]],
                            [[new myBlock(159, 0, 1, 0, 15), new myBlock(128, 4)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 5)], [new myBlock(159, 0, 1, 0, 15)]],
                            [[new myBlock(159, 0, 1, 0, 15), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(159, 0, 1, 0, 15), new myBlock(101, 0)], [new myBlock(159, 0, 1, 0, 15)]],
                            [[new myBlock(159, 0, 1, 0, 15)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)]],
                            [[new myBlock(159, 0, 1, 0, 15)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)]],
                            [[new myBlock(159, 0, 1, 0, 15)], [new myBlock(128, 7)], [new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)]],
                            [[new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)]],
                            [[new myBlock(159, 0, 1, 0, 15), new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 7)]]
                        ],
                        [
                            [
                                [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)],
                                [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)]
                            ],
                            [
                                [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)], [new myBlock(128, 7)], [new myBlock(128, 7)], [new myBlock(24, 0)], [new myBlock(159, 0, 1, 0, 15)],
                                [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)], [new myBlock(128, 7)], [new myBlock(128, 7)], [new myBlock(24, 0)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)]
                            ],
                            [
                                [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(159, 0, 1, 0, 15)],
                                [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)]
                            ],
                            [
                                [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(159, 0, 1, 0, 15)],
                                [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)]
                            ],
                            [
                                [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(159, 0, 1, 0, 15)],
                                [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)]
                            ],
                            [
                                [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 2), new myBlock(128, 7)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2), new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15)],
                                [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 2), new myBlock(128, 7)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2), new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)]
                            ],
                            [
                                [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 0)], [new myBlock(159, 0, 1, 0, 15), new myBlock(24, 0)], [new myBlock(159, 0, 1, 0, 15), new myBlock(24, 0)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 1)], [new myBlock(159, 0, 1, 0, 15)],
                                [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 0)], [new myBlock(159, 0, 1, 0, 15), new myBlock(24, 0)], [new myBlock(159, 0, 1, 0, 15), new myBlock(24, 0)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 1)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)]
                            ],
                            [
                                [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)],
                                [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)]
                            ],
                            [
                                [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(44, 9)],
                                [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(128, 7)]
                            ]
                        ]
                    ];
                    BaseBlock = [
                        new myBlock(24, 0, false), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15),
                        new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(159, 0, false), new myBlock(159, 11, false, 1, 0, 15),
                        new myBlock(155, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(216, 0, false), new myBlock(24, 2, false), new myBlock(155, 0, false), new myBlock(35, 0, false),
                        new myBlock(155, 0, false), new myBlock(159, 9, false), new myBlock(35, 7, false), new myBlock(35, 11, false, 1, 1, 15)
                    ];
                    BaseBlock_v2 = [
                        new myBlock(155, 0), new myBlock(35, 7), new myBlock(24, 0), new myBlock(24, 2), new myBlock(155, 0), new myBlock(24, 0), new myBlock(45, 0), new myBlock(24, 0), new myBlock(24, 0)
                        , new myBlock(24, 0), new myBlock(155, 0), new myBlock(155, 0), new myBlock(159, 0, 1, 0, 15), new myBlock(159, 0, 1, 0, 15)
                    ];
                    RoofConfig = [
                        null,
                        null,
                        new Roof(
                            new myBlock(155, 1), new myBlock(102, 0), null,
                            [
                                //方向 外->里然后下->上
                                [[B, air, air, air, air], [air, B, air, air, air], [air, air, B, air, air], [air, air, air, B, air], [air, air, air, air, B]],
                                [[B, air, air, air, air], [air, B, air, air, air], [air, air, B, air, air], [air, air, air, B, air], [air, air, air, air, B]],
                                [[B, air, air, air, air], [air, B, air, air, air], [air, air, B, air, air], [air, air, air, B, air], [air, air, air, air, B]],
                            ]
                        ),
                        new Roof(
                            new myBlock(155, 1), new myBlock(102, 0), null,
                            [
                                [[B, air, air, air, air], [air, B, air, air, air], [air, air, B, air, air], [air, air, air, B, air], [air, air, air, air, B]],
                                [[B, air, air, air, air], [air, B, air, air, air], [air, air, B, air, air], [air, air, air, B, air], [air, air, air, air, B]],
                                [[B, air, air, air, air], [air, B, air, air, air], [air, air, B, air, air], [air, air, air, B, air], [air, air, air, air, B]],
                            ]
                        ),
                        new Roof(
                            new myBlock(45, 0), new myBlock(102, 0), new myBlock(45, 0),
                            [
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            ]
                        ),
                        new Roof(
                            new myBlock(24, 2), new myBlock(160, 4), null,
                            [
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, WF, WF, WF, air], [air, air, air, WF, WF, WF, air], [air, air, air, air, WF, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, W, W, WF, WF], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, W, W, WF, WF], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, WF, WF, WF, air], [air, air, air, WF, WF, WF, air], [air, air, air, air, WF, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, WF]],
                            ]
                        ),
                        new Roof(
                            new myBlock(24, 2), new myBlock(102, 0), null,
                            [
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, WF, WF, WF, air], [air, air, air, WF, WF, WF, air], [air, air, air, air, WF, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, W, W, WF, WF], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, W, W, WF, WF], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, WF, WF, WF, air], [air, air, air, WF, WF, WF, air], [air, air, air, air, WF, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, B]],
                            ]
                        ),
                        new Roof(
                            new myBlock(155, 1), new myBlock(160, 0), null,
                            [
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, WF, WF, WF, air], [air, air, air, WF, WF, WF, air], [air, air, air, air, WF, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, W, W, WF, WF], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, W, W, WF, WF], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, WF]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, WF, WF, WF, air], [air, air, air, WF, WF, WF, air], [air, air, air, air, WF, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, WF]],
                            ]
                        ),
                        new Roof(
                            new myBlock(45, 0), new myBlock(102, 0), null,
                            [
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, B, B, B, air], [air, air, air, B, B, B, air], [air, air, air, air, B, B, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, W, W, B, B], [air, air, air, air, air, B, air], [air, air, air, air, air, B, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, W, W, B, B], [air, air, air, air, air, B, air], [air, air, air, air, air, B, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                                [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, B, B, B, air], [air, air, air, B, B, B, air], [air, air, air, air, B, B, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            ]
                        ),
                        new Roof(
                            new myBlock(45, 0), new myBlock(102, 0), new myBlock(45, 0),
                            [
                                [[new myBlock(44, 4), air, air, air], [new myBlock(44, 12), air, air, air], [air, new myBlock(44, 4), air, air], [air, new myBlock(44, 12), air, air], [air, air, new myBlock(44, 4), air], [air, air, new myBlock(44, 12), air], [air, air, air, new myBlock(44, 4)], [air, air, air, new myBlock(44, 12)]],
                                [[new myBlock(44, 4), air, air, air], [new myBlock(44, 12), air, air, air], [air, new myBlock(44, 4), air, air], [air, new myBlock(44, 12), air, air], [air, air, new myBlock(44, 4), air], [air, air, new myBlock(44, 12), air], [air, air, air, new myBlock(44, 4)], [air, air, air, new myBlock(44, 12)]],
                                [[new myBlock(44, 4), air, air, air], [new myBlock(44, 12), air, air, air], [air, new myBlock(44, 4), air, air], [air, new myBlock(44, 12), air, air], [air, air, new myBlock(44, 4), air], [air, air, new myBlock(44, 12), air], [air, air, air, new myBlock(44, 4)], [air, air, air, new myBlock(44, 12)]],
                            ]
                        ),
                        new Roof(
                            new myBlock(24, 0), new myBlock(102, 0), new myBlock(35, 7),
                            [
                                [[WF, air, air, air, air, air], [B, B, B, air, air, air], [B, B, B, B, B, air]],
                                [[WF, air, air, air, air, air], [B, B, B, air, air, air], [B, B, B, B, B, air]],
                                [[WF, air, air, air, air, air], [B, B, B, air, air, air], [B, B, B, B, B, air]],
                                [[WF, air, air, air, air, air], [B, B, B, air, air, air], [B, B, B, B, B, air]],
                                [[WF, air, air, air, air, air], [B, B, B, air, air, air], [B, B, B, B, B, air]],
                                [[WF, air, air, air, air, air], [B, B, B, air, air, air], [B, B, B, B, B, air]],
                                [[WF, air, air, air, air, air], [B, B, B, air, air, air], [B, B, B, B, B, air]],
                                [[WF, air, air, air, air, air], [WF, WF, WF, WF, new myBlock(128, 0), air], [B, B, B, B, B, air]],
                                [[WF, air, air, air, air, air], [WF, W, W, W, WF, new myBlock(44, 1)], [air, air, air, air, B, air]],
                                [[WF, air, air, air, air, air], [WF, W, W, W, WF, new myBlock(44, 1)], [air, air, air, air, B, air]],
                                [[WF, air, air, air, air, air], [WF, WF, WF, WF, new myBlock(128, 1), air], [air, air, air, air, B, air]],
                            ]
                        )
                    ];
                    FirstFloorConfig = [
                        null,
                        null,
                        null,
                        new FirstFloor(
                            new myBlock(159, 7), new myBlock(160, 8), null, null,
                            [
                                [[B, air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [air, air, air], [air, air, air], [B, air, air]],
                                [[B, air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air], [B, air, air], [air, air, air], [air, air, air], [B, air, air]],
                                [[B, air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air]],
                                [[B, air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air]],
                                [[B, air, new myBlock(35, 4)], [B, air, new myBlock(35, 0)], [B, air, new myBlock(35, 4)], [B, air, new myBlock(35, 0)], [B, air, new myBlock(35, 4)], [B, air, new myBlock(35, 0)], [B, air, new myBlock(35, 4)], [B, air, new myBlock(35, 0)], [B, air, new myBlock(35, 4)]],
                                [[B, new myBlock(35, 4), air], [B, new myBlock(35, 0), air], [B, new myBlock(35, 4), air], [B, new myBlock(35, 0), air], [B, new myBlock(35, 4), air], [B, new myBlock(35, 0), air], [B, new myBlock(35, 4), air], [B, new myBlock(35, 0), air], [B, new myBlock(35, 4), air]]
                            ]
                        ),
                        new FirstFloor(
                            new myBlock(159, 7), new myBlock(160, 8), null, null,
                            [
                                [[new myBlock(162, 1), air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [new myBlock(162, 1), air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [new myBlock(162, 1), air, air], [B, air, air], [air, air, air], [air, air, air], [B, air, air], [new myBlock(162, 1), air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air]],
                                [[new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air], [new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air], [new myBlock(162, 1), air, air], [B, air, air], [air, air, air], [air, air, air], [B, air, air], [new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air]],
                                [[new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air], [new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air], [new myBlock(162, 1), air, air], [B, air, air], [air, air, air], [air, air, air], [B, air, air], [new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air]],
                                [[new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air], [new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air], [new myBlock(162, 1), air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air]],
                                [[new myBlock(162, 1), air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [new myBlock(162, 1), air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [new myBlock(162, 1), air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [new myBlock(162, 1), air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air]],
                                [[new myBlock(162, 1), air, new myBlock(134, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [new myBlock(162, 1), air, new myBlock(134, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [new myBlock(162, 1), air, new myBlock(134, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [new myBlock(162, 1), air, new myBlock(134, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)]],
                                [[new myBlock(162, 1), new myBlock(134, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [new myBlock(162, 1), new myBlock(134, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [new myBlock(162, 1), new myBlock(134, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [new myBlock(162, 1), new myBlock(134, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air]]
                            ]
                        ),
                        new FirstFloor(
                            null, new myBlock(102, 0), new myBlock(35, 11), new myBlock(35, 3),
                            [
                                [
                                    [B, air, air, air, new myBlock(114, 4), new myBlock(114, 4), new myBlock(114, 4)], [B, air, air, air, new myBlock(53, 1), new myBlock(53, 1), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [B, air, air, air, new myBlock(156, 4), new myBlock(156, 4), new myBlock(114, 7)], [B, air, air, air, new myBlock(156, 5), new myBlock(156, 5), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [B, air, air, air, new myBlock(53, 0), new myBlock(53, 0), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [air, air, air, air, air, new myBlock(58, 0), new myBlock(114, 7)], [air, air, air, air, air, new myBlock(54, 0), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)],
                                    [B, air, air, air, new myBlock(53, 1), new myBlock(53, 1), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [B, air, air, air, new myBlock(156, 4), new myBlock(156, 4), new myBlock(114, 7)], [B, air, air, air, new myBlock(156, 5), new myBlock(156, 5), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [B, air, air, air, new myBlock(53, 0), new myBlock(53, 0), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [B, air, air, air, air, new myBlock(58, 0), new myBlock(114, 7)], [B, air, air, air, air, new myBlock(54, 0), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)],
                                    [B, air, air, air, new myBlock(53, 1), new myBlock(53, 1), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [B, air, air, air, new myBlock(156, 4), new myBlock(156, 4), new myBlock(114, 7)], [B, air, air, air, new myBlock(156, 5), new myBlock(156, 5), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [B, air, air, air, new myBlock(53, 0), new myBlock(53, 0), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [B, air, air, air, air, new myBlock(58, 0), new myBlock(114, 7)], [B, air, air, air, air, new myBlock(54, 0), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)],
                                    [B, air, air, air, new myBlock(114, 5), new myBlock(114, 5), new myBlock(114, 5)]
                                ],
                                [
                                    [B, air, air, air, new myBlock(113, 0), air, new myBlock(113, 0)], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, new myBlock(463, 0), air], [W, air, air, air, air, air, new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [air, air, air, air, air, new myBlock(117, 0), new myBlock(113, 0)], [air, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                    [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, new myBlock(171, 0), new myBlock(171, 12), air], [W, air, air, air, new myBlock(171, 12), new myBlock(171, 0), new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, new myBlock(117, 0), new myBlock(113, 0)], [W, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                    [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, new myBlock(463, 0), air], [W, air, air, air, air, air, new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, new myBlock(117, 0), new myBlock(113, 0)], [W, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                    [B, air, air, air, new myBlock(113, 0), air, new myBlock(113, 0)]
                                ],
                                [
                                    [B, air, air, air, new myBlock(113, 0), air, new myBlock(113, 0)], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [air, air, air, air, air, air, new myBlock(113, 0)], [air, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                    [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [W, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                    [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [W, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                    [B, air, air, air, new myBlock(113, 0), air, new myBlock(113, 0)]
                                ],
                                [
                                    [B, air, air, air, new myBlock(113, 0), air, new myBlock(113, 0)], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [air, air, air, air, air, air, new myBlock(113, 0)], [air, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                    [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [W, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                    [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [W, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                    [B, air, air, air, new myBlock(113, 0), air, new myBlock(113, 0)]
                                ],
                                [
                                    [B, U1, U1, U1, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1],
                                    [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1],
                                    [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1],
                                    [B, U2, U2, U2, U2, U2, U2]
                                ],
                                [
                                    [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air],
                                    [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air],
                                    [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air],
                                    [B, U2, U2, U2, air, air, air]
                                ]
                            ]
                        ),
                        new FirstFloor(
                            null, new myBlock(102, 0), new myBlock(35, 14), new myBlock(35, 0),
                            [
                                [
                                    [B, air, air, air], [B, air, new myBlock(164, 1), air], [B, new myBlock(164, 3), new myBlock(85, 5), new myBlock(164, 2)], [B, air, new myBlock(164, 0), air], [B, air, air, air], [B, air, air, air], [new myBlock(24, 0), new myBlock(145, 3), air, air], [new myBlock(196, 1), air, air, air], [new myBlock(196, 1), air, air, air], [new myBlock(24, 0), new myBlock(145, 3), air, air],
                                    [B, air, air, air], [B, air, new myBlock(164, 1), air], [B, new myBlock(164, 3), new myBlock(85, 5), new myBlock(164, 2)], [B, air, new myBlock(164, 0), air], [B, air, air, air], [B, air, new myBlock(164, 1), air], [B, new myBlock(164, 3), new myBlock(85, 5), new myBlock(164, 2)], [B, air, new myBlock(164, 0), air], [B, air, air, air], [B, air, air, air], [B, air, air, air]
                                ],
                                [
                                    [B, air, air, air], [W, air, air, air], [W, air, new myBlock(171, 14), air], [W, air, air, air], [W, air, air, air], [B, air, air, air], [new myBlock(24, 0), new myBlock(18, 0), air, air], [new myBlock(196, 9), air, air, air], [new myBlock(196, 8), air, air, air], [new myBlock(24, 0), new myBlock(18, 0), air, air],
                                    [B, air, air, air], [W, air, air, air], [W, air, new myBlock(171, 14), air], [W, air, air, air], [W, air, air, air], [B, air, air, air], [W, air, new myBlock(171, 14), air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [B, air, air, air]
                                ],
                                [
                                    [B, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [B, air, air, air], [new myBlock(24, 0), new myBlock(18, 0), air, air], [new myBlock(164, 7), air, air, air], [new myBlock(164, 7), air, air, air], [new myBlock(24, 0), new myBlock(18, 0), air, air],
                                    [B, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [B, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [B, air, air, air]
                                ],
                                [
                                    [B, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [B, air, air, air], [new myBlock(24, 0), new myBlock(128, 7), air, air], [new myBlock(24, 0), new myBlock(128, 7), air, air], [new myBlock(24, 0), new myBlock(128, 7), air, air], [new myBlock(24, 0), new myBlock(128, 7), air, air],
                                    [B, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [B, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [B, air, air, air]
                                ],
                                [
                                    [B, air, air, air], [B, air, air, U1], [B, air, air, U2], [B, air, air, U1], [B, air, air, U2], [B, air, air, U1], [new myBlock(24, 0), new myBlock(24, 0), air, U2], [new myBlock(24, 0), new myBlock(24, 0), air, U1], [new myBlock(24, 0), new myBlock(24, 0), air, U2], [new myBlock(24, 0), new myBlock(24, 0), air, U1],
                                    [B, air, air, U2], [B, air, air, U1], [B, air, air, U2], [B, air, air, U1], [B, air, air, U2], [B, air, air, air], [B, air, air, air], [B, air, air, air], [B, air, air, air], [B, air, air, air], [B, air, air, air]
                                ],
                                [
                                    [B, air, air, air], [B, U1, U1, air], [B, U2, U2, air], [B, U1, U1, air], [B, U2, U2, air], [B, U1, U1, air], [B, U2, U2, air], [B, U1, U1, air], [B, U2, U2, air], [B, U1, U1, air],
                                    [B, U2, U2, air], [B, U1, U1, air], [B, U2, U2, air], [B, U1, U1, air], [B, U2, U2, air], [B, air, air, air], [B, air, air, air], [B, air, air, air], [B, air, air, air], [B, air, air, air], [B, air, air, air]
                                ]
                            ]
                        ),
                        new FirstFloor(
                            null, new myBlock(160, 0), new myBlock(35, 14, 1, 1, 15), new myBlock(35, 0),
                            [
                                [[B, air, air, air, air], [B, air, air, air, air], [new myBlock(64, 3), air, air, air, air], [new myBlock(64, 3), air, air, air, air], [B, air, air, air, air], [B, new myBlock(162, 1), air, air, air], [B, new myBlock(158, 13), air, air, air], [B, new myBlock(158, 13), air, air, air], [B, new myBlock(158, 13), air, air, air], [B, new myBlock(158, 13), air, air, air], [B, new myBlock(162, 1), air, air, air]],
                                [[B, air, air, air, air], [B, air, air, air, air], [new myBlock(64, 9), air, air, air, air], [new myBlock(64, 8), air, air, air, air], [B, air, air, air, air], [B, new myBlock(162, 1), air, air, air], [B, new myBlock(140, 0), air, air, air], [B, air, air, air, air], [B, new myBlock(140, 0), air, air, air], [B, new myBlock(140, 0), air, air, air], [B, new myBlock(162, 1), air, air, air]],
                                [[B, air, air, air, air], [B, air, air, air, air], [new myBlock(128, 7), air, air, air, air], [new myBlock(128, 7), air, air, air, air], [B, air, air, air, air], [B, new myBlock(162, 1), air, air, air], [B, new myBlock(158, 13), air, air, air], [B, new myBlock(158, 13), air, air, air], [B, new myBlock(158, 13), air, air, air], [B, new myBlock(158, 13), air, air, air], [B, new myBlock(162, 1), air, air, air]],
                                [[B, new myBlock(85, 0), new myBlock(85, 0), new myBlock(85, 0), new myBlock(85, 0)], [B, air, air, air, air], [new myBlock(241, 0), air, air, air, air], [new myBlock(241, 0), air, air, air, air], [B, air, air, air, air], [B, new myBlock(162, 1), air, air, air], [B, air, air, air, air], [B, new myBlock(140, 0), air, air, air], [B, air, air, air, air], [B, air, air, air, air], [B, new myBlock(162, 1), air, air, air]],
                                [[B, air, air, U1, U1], [B, air, air, U2, U2], [new myBlock(241, 0), air, air, U1, U1], [new myBlock(241, 0), air, air, U2, U2], [B, air, air, U1, U1], [B, new myBlock(158, 5), air, U2, U2], [B, new myBlock(158, 5), air, U1, U1], [B, new myBlock(158, 5), air, U2, U2], [B, new myBlock(158, 5), air, U1, U1], [B, new myBlock(158, 5), air, U2, U2], [B, new myBlock(158, 5), air, U1, U1]],
                                [[B, U1, U1, air, air], [B, U2, U2, air, air], [B, U1, U1, air, air], [B, U2, U2, air, air], [B, U1, U1, air, air], [B, U2, U2, air, air], [B, U1, U1, air, air], [B, U2, U2, air, air], [B, U1, U1, air, air], [B, U2, U2, air, air], [B, U1, U1, air, air]]
                            ]
                        )
                    ];
                    InteriorConfig = [
                        //null,
                        new Interior(
                            new myBlock(5, 1), new myBlock(89, 0),
                            [
                                [
                                    [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B]
                                ],
                                [
                                    [B, B, B, air, air, B, B, B], [B, new myBlock(164, 3), new myBlock(164, 1), new myBlock(164, 1), new myBlock(164, 2), air, air, air], [B, air, air, air, air, air, air, air], [B, new myBlock(158, 2), new myBlock(158, 2), new myBlock(158, 2), air, air, air, air], [B, air, air, air, air, air, air, air], [B, new myBlock(164, 3), new myBlock(164, 0), new myBlock(164, 0), new myBlock(164, 2), air, air, air],
                                    [B, air, air, air, air, air, air, air], [B, new myBlock(164, 3), new myBlock(164, 1), new myBlock(164, 1), new myBlock(164, 2), air, air, air], [B, air, air, air, air, air, air, air], [B, new myBlock(158, 2), new myBlock(158, 2), new myBlock(158, 2), air, air, air, air], [B, air, air, air, air, air, air, air], [B, new myBlock(164, 3), new myBlock(164, 0), new myBlock(164, 0), new myBlock(164, 2), air, air, air],
                                    [B, air, air, air, air, air, air, air], [B, new myBlock(164, 3), new myBlock(164, 1), new myBlock(164, 1), new myBlock(164, 2), air, air, air], [B, air, air, air, air, air, air, air], [B, new myBlock(158, 2), new myBlock(158, 2), new myBlock(158, 2), air, air, air, air], [B, air, air, air, air, air, air, air], [B, new myBlock(164, 3), new myBlock(164, 0), new myBlock(164, 0), new myBlock(164, 2), air, air, air],
                                    [B, B, B, air, air, B, B, B]
                                ],
                                [
                                    [B, B, B, air, air, B, B, B], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, B, B, air, air, B, B, B]
                                ],
                                [
                                    [B, B, B, B, B, B, B, B], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, B, B, B, B, B, B, B]
                                ],
                                [
                                    [B, B, B, B, B, B, B, B], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, B, B, B, B, B, B, B]
                                ],
                                [
                                    [B, B, B, B, B, B, B, B], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, B, B, B, B, B, B, B]
                                ],
                                [
                                    [B, B, B, B, B, B, B, B], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, B, B, B, B, B, B, B]
                                ],
                                [
                                    [B, B, B, L, L, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, L, L, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, L, L, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, L, L, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, L, L, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B]
                                ]
                            ]
                        ),
                        new Interior(
                            new myBlock(5, 3), new myBlock(89, 0),
                            [
                                [
                                    [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B]
                                ],
                                [
                                    [B, new myBlock(145, 3), air, air, air, air, air, new myBlock(145, 3)], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, new myBlock(134, 5)], [B, new myBlock(114, 3), new myBlock(85, 0), new myBlock(114, 2), air, air, air, new myBlock(134, 4)], [B, new myBlock(114, 3), air, air, air, air, air, air],
                                    [B, new myBlock(114, 3), air, air, air, air, air, air], [B, new myBlock(114, 3), new myBlock(85, 0), new myBlock(114, 2), air, air, air, new myBlock(134, 4)], [B, air, air, air, air, air, air, air]
                                ],
                                [
                                    [B, new myBlock(18, 0), air, air, air, air, air, new myBlock(18, 0)], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, new myBlock(140, 0)], [B, air, new myBlock(171, 12), air, air, air, air, new myBlock(140, 0)], [B, air, air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air, air], [B, air, new myBlock(171, 12), air, air, air, air, air], [B, air, air, air, air, air, air, air]
                                ],
                                [
                                    [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air]
                                ],
                                [
                                    [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air]
                                ],
                                [
                                    [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air]
                                ],
                                [
                                    [B, B, B, L, L, L, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, L, L, L, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B]
                                ]
                            ]
                        ),
                        new Interior(
                            new myBlock(5, 3, 1, 0, 5), new myBlock(89, 0),
                            [
                                [
                                    [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B]
                                ],
                                [
                                    [B, new myBlock(145, 3), air, air, air, air, air, air, air, new myBlock(145, 3)], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, new myBlock(134, 5)], [B, new myBlock(114, 3), new myBlock(85, 0), new myBlock(114, 2), air, air, air, air, air, new myBlock(134, 4)], [B, new myBlock(114, 3), air, air, air, air, air, air, air, air],
                                    [B, new myBlock(114, 3), air, air, air, air, air, air, air, air], [B, new myBlock(114, 3), new myBlock(85, 0), new myBlock(114, 2), air, air, air, air, air, new myBlock(134, 4)], [B, air, air, air, air, air, air, air, air, air]
                                ],
                                [
                                    [B, new myBlock(18, 0), air, air, air, air, air, air, air, new myBlock(18, 0)], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, new myBlock(140, 0)], [B, air, new myBlock(72, 0), air, air, air, air, air, air, new myBlock(140, 0)], [B, air, air, air, air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air, air, air, air], [B, air, new myBlock(72, 0), air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air]
                                ],
                                [
                                    [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air]
                                ],
                                [
                                    [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air]
                                ],
                                [
                                    [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air]
                                ],
                                [
                                    [B, B, B, B, L, L, L, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, L, L, L, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B]
                                ]
                            ]
                        ),
                        new Interior(
                            new myBlock(5, 0, 3, 0, 9), new myBlock(89, 0),
                            [
                                [
                                    [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B],
                                    [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B]
                                ],
                                [
                                    [B, air, air, B, B, B, B], [B, air, air, air, new myBlock(53, 1, 3, 0, 9), new myBlock(53, 1, 3, 0, 9), new myBlock(53, 1, 3, 0, 9)], [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(85, 0, 3, 0, 9), new myBlock(85, 0, 3, 0, 9), new myBlock(85, 0, 3, 0, 9)], [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(53, 0, 3, 0, 9), new myBlock(53, 0, 3, 0, 9), new myBlock(53, 0, 3, 0, 9)], [B, air, air, air, air, air, air],
                                    [B, air, air, air, new myBlock(53, 1, 3, 0, 9), new myBlock(53, 1, 3, 0, 9), new myBlock(53, 1, 3, 0, 9)], [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(85, 0, 3, 0, 9), new myBlock(85, 0, 3, 0, 9), new myBlock(85, 0, 3, 0, 9)], [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(53, 0, 3, 0, 9), new myBlock(53, 0, 3, 0, 9), new myBlock(53, 0, 3, 0, 9)], [B, air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(53, 3, 3, 0, 9), air, new myBlock(53, 6, 3, 0, 9)], [B, air, air, air, new myBlock(53, 3, 3, 0, 9), air, new myBlock(53, 6, 3, 0, 9)], [B, air, air, air, air, air, air],
                                    [B, air, air, air, new myBlock(53, 1, 3, 0, 9), new myBlock(53, 1, 3, 0, 9), new myBlock(53, 1, 3, 0, 9)], [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(85, 0, 3, 0, 9), new myBlock(85, 0, 3, 0, 9), new myBlock(85, 0, 3, 0, 9)], [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(53, 0, 3, 0, 9), new myBlock(53, 0, 3, 0, 9), new myBlock(53, 0, 3, 0, 9)]
                                ],
                                [
                                    [B, air, air, B, B, B, B], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(171, 12), new myBlock(171, 12), new myBlock(171, 12)],
                                    [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(171, 12), new myBlock(171, 12), new myBlock(171, 12)], [B, air, air, air, air, air, air],
                                    [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, new myBlock(140, 0)], [B, air, air, air, air, air, new myBlock(171, 0)], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                    [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, new myBlock(171, 12), new myBlock(171, 12), new myBlock(171, 12)], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air]
                                ],
                                [
                                    [B, B, B, B, B, B, B], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air], [B, air, air, air, air, air, air]
                                ],
                                [
                                    [B, B, B, B, B, B, B], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air], [B, air, air, air, air, air, air]
                                ],
                                [
                                    [B, B, B, B, B, B, B], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air], [B, air, air, air, air, air, air]
                                ],
                                [
                                    [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B],
                                    [B, B, B, L, L, B, B], [B, B, B, L, L, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B],
                                    [B, B, B, L, L, B, B], [B, B, B, L, L, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B],
                                    [B, B, B, L, L, B, B], [B, B, B, L, L, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B],
                                    [B, B, B, L, L, B, B], [B, B, B, L, L, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B]
                                ]
                            ]
                        ),
                        new Interior(
                            new myBlock(5, 0, 3, 0, 9), new myBlock(169, 0),
                            [
                                [
                                    [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B],
                                    [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B],
                                    [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B],
                                    [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B]
                                ],
                                [
                                    [B, air, air, B, B, B, B, B], [B, air, air, air, air, B, B, new myBlock(47, 0)], [B, air, air, air, air, new myBlock(53, 5, 3, 0, 9), new myBlock(53, 5, 3, 0, 9), new myBlock(47, 0)], [B, air, air, air, air, air, air, air], [B, air, air, air, air, new myBlock(53, 0, 3, 0, 9), new myBlock(53, 0, 3, 0, 9), air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                    [B, air, air, air, air, new myBlock(35, 3), new myBlock(35, 3), new myBlock(35, 0)], [B, air, air, air, air, new myBlock(35, 3), new myBlock(35, 3), new myBlock(35, 0)], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, new myBlock(53, 6, 3, 0, 9), B], [B, air, air, air, air, air, new myBlock(53, 6, 3, 0, 9), B], [B, air, air, air, air, air, air, air],
                                    [B, air, air, air, air, new myBlock(35, 6), new myBlock(35, 6), new myBlock(35, 0)], [B, air, air, air, air, new myBlock(35, 6), new myBlock(35, 6), new myBlock(35, 0)], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                    [B, air, air, air, air, new myBlock(53, 1, 3, 0, 9), new myBlock(53, 1, 3, 0, 9), new myBlock(53, 1, 3, 0, 9)], [B, air, air, air, air, air, air, air], [B, air, air, air, air, new myBlock(85, 0, 3, 0, 9), new myBlock(85, 0, 3, 0, 9), new myBlock(85, 0, 3, 0, 9)]
                                ],
                                [
                                    [B, air, air, B, B, B, B, B], [B, air, air, air, air, new myBlock(140, 0), air, air], [B, air, air, air, air, new myBlock(171, 0), new myBlock(171, 0), air], [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air, new myBlock(171, 0)], [B, air, air, air, air, air, air, new myBlock(171, 0)], [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, new myBlock(463, 0)], [B, air, air, air, air, air, air, new myBlock(140, 0)], [B, air, air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air, new myBlock(171, 0)], [B, air, air, air, air, air, air, new myBlock(171, 0)], [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, new myBlock(171, 12), new myBlock(171, 12), new myBlock(171, 12)]
                                ],
                                [
                                    [B, B, B, B, B, B, B, B], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                    [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                    [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                    [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air]
                                ],
                                [
                                    [B, B, B, B, B, B, B, B], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                    [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                    [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                    [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air]
                                ],
                                [
                                    [B, B, B, B, B, B, B, B], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                    [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air]
                                ],
                                [
                                    [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B],
                                    [B, B, B, L, L, L, B, B], [B, B, B, L, L, L, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B],
                                    [B, B, B, L, L, L, B, B], [B, B, B, L, L, L, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B],
                                    [B, B, B, L, L, L, B, B], [B, B, B, L, L, L, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B]
                                ]
                            ]
                        )
                    ];

                    // 以下为全局变量
                    v2_prob = 0.5;
                    c_rand_data = -1;
                    cnt = 0;
                    Cnt = [];
                    roof_node_list = [];

                    //以下为函数

                    Generate(coordinates) {
                        // 仅使用多边形坐标生成建筑物
                        // 移植到ModPE或Addon大概会更方便
                        // 当前版本日期为2021.3.2（可能是最终版）
                        // Initialize
                        let v2_prob = this.WallConfig_v2.length / (this.WallConfig.length + this.WallConfig_v2.length);
                        for (let i = 0; i < MAX_LEVEL; i++) this.Cnt.push(0);
                        if (!coordinates[coordinates.length - 1].Equals(coordinates[0]))
                            coordinates.push(coordinates[0]);
                        // Generate
                        let lastz = undef, lastx = undef;
                        let building = true;
                        let dynamic_add_nodes = true;
                        let building_node_list = [];
                        let const_building_node_list = [];
                        let building_version = 1;
                        let height = -1, levels = -1;
                        let wall_kind = -1;
                        let doNotChangeStyle = false;
                        let firstFloorInfos = [];
                        let interiorInfos = [];

                        for (let coordinate of coordinates) {
                            const_building_node_list.push(new node(coordinate.x, coordinate.z));
                        }

                        let prob = Math.random();
                        if (prob >= (1 - v2_prob)) building_version = 2;
                        else building_version = 1;

                        if (building_version === 1)
                            wall_kind = rd.Next(0, this.WallConfig.length);
                        else if (building_version === 2)
                            wall_kind = rd.Next(0, this.WallConfig_v2.length);

                        //确定楼层数
                        if (levels === -1 && height === -1)
                            levels = rd.Next(this.min_level, this.max_level);
                        else if (height !== -1) {
                            if (building_version === 1)
                                levels = Math.ceil(height / this.WallConfig[wall_kind].length);
                            else if (building_version === 2)
                                levels = Math.ceil(height / this.WallConfig_v2[wall_kind].length);
                        }
                        if (this.IsSmallBuilding(const_building_node_list))
                            levels = Math.min(levels, this.max_small_level);
                        if (this.IsMiniBuilding(const_building_node_list))
                            levels = 1;
                        levels = Math.min(levels, this.max_legal_level);

                        if (building_version === 1)
                            height = levels * this.WallConfig[wall_kind].length;
                        else if (building_version === 2)
                            height = levels * this.WallConfig_v2[wall_kind].length;

                        logger.log("debug", coordinates);

                        for (let coordinate of coordinates) {
                            //新的
                            let cx = coordinate.x;
                            let cz = coordinate.z;
                            if (this.IsUndefined(new node(cx, cz))) {
                                lastx = undef;
                                lastz = undef;
                                building_node_list.push(new node(undef, undef));
                                this.ClearCnt();
                                continue;
                            }

                            let currentz = cz;
                            let currentx = cx;

                            if (building && dynamic_add_nodes) {
                                let valid = true;
                                if (building_node_list.length > 0 && building_node_list[building_node_list.length - 1].Equals(new node(currentx, currentz))) valid = false;
                                for (let i = building_node_list.length - 1; i >= 0; i--) {
                                    if (i === 0 || this.IsUndefined(building_node_list[i])) {
                                        if (building_node_list[i].Equals(new node(currentx, currentz)))
                                            valid = false;
                                        break;
                                    }
                                }
                                if (valid) building_node_list.push(new node(currentx, currentz));
                            }
                            //连线
                            if (!this.IsUndefined(new node(lastx, lastz))) {
                                if (building) {
                                    //一楼选定
                                    let startheight = 0;
                                    let firstfloor_kind = rd.Next(0, this.FirstFloorConfig.length);
                                    if (this.FirstFloorConfig[firstfloor_kind] !== null) {
                                        if (Math.max(Math.abs(currentx - lastx), Math.abs(currentz - lastz)) < this.FirstFloorConfig[firstfloor_kind].GetLength())
                                            startheight = 0;
                                        else {
                                            let singleheight = 0;
                                            let Base = null;
                                            if (building_version === 1) {
                                                Base = this.BaseBlock[wall_kind];
                                                singleheight = this.WallConfig[wall_kind].length;
                                            } else if (building_version === 2) {
                                                Base = this.BaseBlock_v2[wall_kind];
                                                singleheight = this.WallConfig_v2[wall_kind].length;
                                            }
                                            if (Base !== null && Base.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(Base.rand_min, Base.rand_max);
                                                Base.data = this.c_rand_data;
                                            }
                                            startheight = this.FirstFloorConfig[firstfloor_kind].GetHeight();
                                            firstFloorInfos.push(new FirstFloorInfo(new node(lastx, lastz), new node(currentx, currentz), firstfloor_kind, Base));
                                        }
                                    }
                                    for (let level = 0; level < levels; level++) {
                                        let interior_kind = rd.Next(0, this.InteriorConfig.length);
                                        if (building_version === 1) {
                                            //内饰选定
                                            let shI = level * this.WallConfig[wall_kind].length;
                                            let Base = this.BaseBlock[wall_kind];
                                            if (Base.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(Base.rand_min, Base.rand_max);
                                                Base.data = this.c_rand_data;
                                            }
                                            interiorInfos.push(new InteriorInfo(new node(lastx, lastz), new node(currentx, currentz), interior_kind, level, shI, Base));
                                            //墙面建造
                                            let shW = Math.max(startheight, level * this.WallConfig[wall_kind].length);
                                            this.DrawLine_Building_Advanced(lastx, lastz, currentx, currentz, level, shW, this.WallConfig[wall_kind]);
                                        } else if (building_version === 2) {
                                            let shI = level * this.WallConfig_v2[wall_kind].length;
                                            let Base = this.BaseBlock_v2[wall_kind];
                                            if (Base.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(Base.rand_min, Base.rand_max);
                                                Base.data = this.c_rand_data;
                                            }
                                            interiorInfos.push(new InteriorInfo(new node(lastx, lastz), new node(currentx, currentz), interior_kind, level, shI, Base));
                                            let shW = Math.max(startheight, level * this.WallConfig_v2[wall_kind].length);
                                            this.DrawLine_Building_Advanced_v2(lastx, lastz, currentx, currentz, level, shW, this.WallConfig_v2[wall_kind]);
                                        }
                                    }
                                }
                            }
                            lastz = currentz;
                            lastx = currentx;
                        }

                        /////////////////////////////////上一个建筑物/用地的多边形填充////////////////////////////
                        //try {
                        if (building_node_list.length >= 3) {
                            let id = 0, data = 0;
                            if (building_version === 1) {
                                id = this.BaseBlock[wall_kind].id;
                                data = this.BaseBlock[wall_kind].data;
                                if (this.c_rand_data !== -1 && this.BaseBlock[wall_kind].random === 1) data = this.c_rand_data;
                            } else if (building_version === 2) {
                                id = this.BaseBlock_v2[wall_kind].id;
                                data = this.BaseBlock_v2[wall_kind].data;
                                if (this.c_rand_data !== -1 && this.BaseBlock[wall_kind].random === 1) data = this.c_rand_data;
                            }
                            //填充建筑物最顶层的平面
                            this.FillPolygonScanline(building_node_list, height, id, data);
                            //建筑物屋顶与内饰放置，必须为非迷你建筑
                            if (!this.IsMiniBuilding(building_node_list)) {
                                //建筑物屋顶放置
                                this.cnt = 0;
                                let roof_kind = rd.Next(0, this.RoofConfig.length);
                                let roof = this.RoofConfig[roof_kind];
                                if (roof !== null && !this.IsSmallBuilding(building_node_list)) {
                                    if (roof.Base !== null) {
                                        id = roof.Base.id;
                                        data = roof.Base.data;
                                    }
                                    for (let i = 0; i < building_node_list.length; i++) {
                                        let startnode = building_node_list[i];
                                        let endnode = startnode;
                                        if (i !== building_node_list.length - 1) endnode = building_node_list[i + 1];
                                        if (this.IsUndefined(startnode)) {
                                            this.roof_node_list.push(startnode);
                                            continue;
                                        }
                                        let lastnode, nextnode;
                                        if (i === 0 || building_node_list[i - 1].x === undef || building_node_list[i - 1].y === undef) {
                                            nextnode = building_node_list[i + 2];
                                            let j;
                                            for (j = i + 1; j < building_node_list.length; j++) {
                                                if (building_node_list[j].x === undef || building_node_list[j].y === undef)
                                                    break;
                                            }
                                            lastnode = building_node_list[j - 1];
                                        } else if (i === building_node_list.length - 1 || building_node_list[i + 1].x === undef) {
                                            lastnode = building_node_list[i - 1];
                                            let j;
                                            for (j = i - 1; j >= 0; j--) {
                                                if (building_node_list[j].x === undef || building_node_list[j].y === undef)
                                                    break;
                                            }
                                            endnode = building_node_list[j + 1];
                                            nextnode = building_node_list[j + 2];
                                        } else if (i === building_node_list.length - 2 || building_node_list[i + 2].x === undef || building_node_list[i + 2].y === undef) {
                                            lastnode = building_node_list[i - 1];
                                            let j;
                                            for (j = i - 1; j >= 0; j--) {
                                                if (building_node_list[j].x === undef || building_node_list[j].y === undef)
                                                    break;
                                            }
                                            nextnode = building_node_list[j + 1];
                                        } else {
                                            lastnode = building_node_list[i - 1];
                                            nextnode = building_node_list[i + 2];
                                        }
                                        if (lastnode.x === undef || lastnode.y === undef) lastnode = null;
                                        if (nextnode.x === undef || nextnode.y === undef) nextnode = null;
                                        let Base = new myBlock(id, data);
                                        if (building_node_list.length < this.cmplx_building_nodenum)
                                            this.DrawLine_Roof_Improved_v2(startnode.x, startnode.y, endnode.x, endnode.y, height + 1, roof, building_node_list, lastnode, nextnode, Base, this.skipKCheck);
                                        else
                                            this.DrawLine_Roof_Improved_v2(startnode.x, startnode.y, endnode.x, endnode.y, height + 1, roof, building_node_list, lastnode, nextnode, Base, false);
                                    }
                                    this.FillPolygonScanline(this.roof_node_list, height + roof.Data[0][0].length, id, data);
                                }
                                //建筑物内饰放置
                                this.ClearCnt();
                                let interior_kind = rd.Next(0, this.InteriorConfig.length);
                                for (let i = 0; i < building_node_list.length; i++) {
                                    if (this.InteriorConfig[interior_kind] === null) continue;
                                    let startnode = building_node_list[i];
                                    let endnode = startnode;
                                    if (i !== building_node_list.length - 1) endnode = building_node_list[i + 1];
                                    if (this.IsUndefined(startnode)) continue;
                                    let lastnode, nextnode;
                                    if (i === 0 || building_node_list[i - 1].x === undef || building_node_list[i - 1].y === undef) {
                                        nextnode = building_node_list[i + 2];
                                        let j;
                                        for (j = i + 1; j < building_node_list.length; j++) {
                                            if (building_node_list[j].x === undef || building_node_list[j].y === undef)
                                                break;
                                        }
                                        lastnode = building_node_list[j - 1];
                                    } else if (i === building_node_list.length - 1 || building_node_list[i + 1].x === undef) {
                                        lastnode = building_node_list[i - 1];
                                        let j;
                                        for (j = i - 1; j >= 0; j--) {
                                            if (building_node_list[j].x === undef || building_node_list[j].y === undef)
                                                break;
                                        }
                                        endnode = building_node_list[j + 1];
                                        nextnode = building_node_list[j + 2];
                                    } else if (i === building_node_list.length - 2 || building_node_list[i + 2].x === undef || building_node_list[i + 2].y === undef) {
                                        lastnode = building_node_list[i - 1];
                                        let j;
                                        for (j = i - 1; j >= 0; j--) {
                                            if (building_node_list[j].x === undef || building_node_list[j].y === undef)
                                                break;
                                        }
                                        nextnode = building_node_list[j + 1];
                                    } else {
                                        lastnode = building_node_list[i - 1];
                                        nextnode = building_node_list[i + 2];
                                    }
                                    if (this.IsUndefined(lastnode)) lastnode = null;
                                    if (this.IsUndefined(nextnode)) nextnode = null;
                                    let max_level = Math.floor(height / this.InteriorConfig[interior_kind].GetHeight());
                                    let Base = new myBlock(id, data);
                                    this.DrawLine_Interior_v3(startnode.x, startnode.y, endnode.x, endnode.y, max_level, this.InteriorConfig[interior_kind], building_node_list, lastnode, nextnode, Base);
                                }

                                for (let ffi of firstFloorInfos) {
                                    if (this.FirstFloorConfig[ffi.firstfloor_kind] !== null) {
                                        this.cnt = 0;
                                        this.DrawLine_FirstFloor(ffi.start.x, ffi.start.y, ffi.end.x, ffi.end.y, this.FirstFloorConfig[ffi.firstfloor_kind], building_node_list, ffi.Base);
                                    }
                                }
                            }
                        }
                        /*}
                        catch (e) {
                            print(e.message);
                            print("INFO: Skipping roof, interior or first floor for current building");
                        }*/
                        building_node_list = [];
                        this.roof_node_list = [];
                        firstFloorInfos = [];
                        interiorInfos = [];
                        this.ClearCnt();
                        this.cnt = 0;
                        if (!doNotChangeStyle) this.c_rand_data = -1;
                        this.block_list = [];
                    }


                    DrawLine_Building_Advanced(startx, starty, endx, endy, clevel, sh, WallConfig) {
                        if (startx !== endx) {
                            let k = (endy - starty) / (endx - startx);
                            let b = (endy * startx - starty * endx) / (startx - endx);
                            if (-1 < k && k < 1) {
                                if (startx <= endx) {
                                    for (let x = startx; x < endx; x++) {
                                        let y = Math.round(k * x + b);
                                        for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                            let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length];
                                            let id = cblock.id, data = cblock.data;
                                            if (cblock.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                data = this.c_rand_data;
                                            } else if (cblock.random === 2) {
                                                data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            }
                                            if (cblock.bump) {
                                                this.setTile(x, h + 1, y - 1, id, data);
                                                this.setTile(x, h + 1, y + 1, id, data);
                                            }
                                            this.setTile(x, h + 1, y, id, data);
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                } else {
                                    for (let x = startx; x > endx; x--) {
                                        let y = Math.round(k * x + b);
                                        for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                            let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length];
                                            let id = cblock.id, data = cblock.data;
                                            if (cblock.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                data = this.c_rand_data;
                                            } else if (cblock.random === 2) {
                                                data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            }
                                            if (cblock.bump) {
                                                this.setTile(x, h + 1, y - 1, id, data);
                                                this.setTile(x, h + 1, y + 1, id, data);
                                            }
                                            this.setTile(x, h + 1, y, id, data);
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                }
                            } else {
                                if (starty <= endy) {
                                    for (let y = starty; y < endy; y++) {
                                        let x = Math.floor((y - b) / k);
                                        for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                            let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length];
                                            let id = cblock.id, data = cblock.data;
                                            if (cblock.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                data = this.c_rand_data;
                                            } else if (cblock.random === 2) {
                                                data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            }
                                            if (cblock.bump) {
                                                this.setTile(x - 1, h + 1, y, id, data);
                                                this.setTile(x + 1, h + 1, y, id, data);
                                            }
                                            this.setTile(x, h + 1, y, id, data);
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                } else {
                                    for (let y = starty; y > endy; y--) {
                                        let x = Math.floor((y - b) / k);
                                        for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                            let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length];
                                            let id = cblock.id, data = cblock.data;
                                            if (cblock.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                data = this.c_rand_data;
                                            } else if (cblock.random === 2) {
                                                data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            }
                                            if (cblock.bump) {
                                                this.setTile(x - 1, h + 1, y, id, data);
                                                this.setTile(x + 1, h + 1, y, id, data);
                                            }
                                            this.setTile(x, h + 1, y, id, data);
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                }
                            }
                        } else {
                            if (starty <= endy) {
                                for (let y = starty; y < endy; y++) {
                                    for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                        let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length];
                                        let id = cblock.id, data = cblock.data;
                                        if (cblock.random === 1) {
                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            data = this.c_rand_data;
                                        } else if (cblock.random === 2) {
                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                        }
                                        if (cblock.bump) {
                                            this.setTile(startx - 1, h + 1, y, id, data);
                                            this.setTile(startx + 1, h + 1, y, id, data);
                                        }
                                        this.setTile(startx, h + 1, y, id, data);
                                    }
                                    this.Cnt[clevel]++;
                                }
                            } else {
                                for (let y = starty; y > endy; y--) {
                                    for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                        let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length];
                                        let id = cblock.id, data = cblock.data;
                                        if (cblock.random === 1) {
                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            data = this.c_rand_data;
                                        } else if (cblock.random === 2) {
                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                        }
                                        if (cblock.bump) {
                                            this.setTile(startx - 1, h + 1, y, id, data);
                                            this.setTile(startx + 1, h + 1, y, id, data);
                                        }
                                        this.setTile(startx, h + 1, y, id, data);
                                    }
                                    this.Cnt[clevel]++;
                                }
                            }
                        }
                    }

                    DrawLine_Building_Advanced_v2(startx, starty, endx, endy, clevel, sh, WallConfig) {
                        if (startx !== endx) {
                            let k = (endy - starty) / (endx - startx);
                            let b = (endy * startx - starty * endx) / (startx - endx);
                            if (-1 < k && k < 1) {
                                if (startx <= endx) {
                                    for (let x = startx; x < endx; x++) {
                                        let y = Math.round(k * x + b);
                                        for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                            let delta = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length].length;
                                            for (let dy = 0; dy < delta; dy++) {
                                                let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length][dy];
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (cblock.random === 1) {
                                                    if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    data = this.c_rand_data;
                                                } else if (cblock.random === 2) {
                                                    data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                }
                                                if (id === 0) continue;
                                                this.setTile(x, h + 1, y - dy, id, data, 0, null);
                                                if (dy !== 0) this.setTile(x, h + 1, y + dy, id, data, 0, true);
                                            }
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                } else {
                                    for (let x = startx; x > endx; x--) {
                                        let y = Math.round(k * x + b);
                                        for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                            let delta = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length].length;
                                            for (let dy = 0; dy < delta; dy++) {
                                                let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length][dy];
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (cblock.random === 1) {
                                                    if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    data = this.c_rand_data;
                                                } else if (cblock.random === 2) {
                                                    data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                }
                                                if (id === 0) continue;
                                                if (dy !== 0) this.setTile(x, h + 1, y - dy, id, data, 180, true);
                                                this.setTile(x, h + 1, y + dy, id, data, 180, null);
                                            }
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                }
                            } else {
                                if (starty <= endy) {
                                    for (let y = starty; y < endy; y++) {
                                        let x = Math.floor((y - b) / k);
                                        for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                            let delta = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length].length;
                                            for (let dx = 0; dx < delta; dx++) {
                                                let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length][dx];
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (cblock.random === 1) {
                                                    if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    data = this.c_rand_data;
                                                } else if (cblock.random === 2) {
                                                    data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                }
                                                if (id === 0) continue;
                                                if (dx !== 0) this.setTile(x - dx, h + 1, y, id, data, 90, false);
                                                this.setTile(x + dx, h + 1, y, id, data, 90, null);
                                            }
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                } else {
                                    for (let y = starty; y > endy; y--) {
                                        let x = Math.floor((y - b) / k);
                                        for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                            let delta = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length].length;
                                            for (let dx = 0; dx < delta; dx++) {
                                                let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length][dx];
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (cblock.random === 1) {
                                                    if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    data = this.c_rand_data;
                                                } else if (cblock.random === 2) {
                                                    data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                }
                                                this.setTile(x - dx, h + 1, y, id, data, 270, null);
                                                if (dx !== 0) this.setTile(x + dx, h + 1, y, id, data, 270, false);
                                            }
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                }
                            }
                        } else {
                            if (starty <= endy) {
                                for (let y = starty; y < endy; y++) {
                                    for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                        let delta = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length].length;
                                        for (let dx = 0; dx < delta; dx++) {
                                            let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length][dx];
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (cblock.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                data = this.c_rand_data;
                                            } else if (cblock.random === 2) {
                                                data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            }
                                            if (id === 0) continue;
                                            if (dx !== 0) this.setTile(startx - dx, h + 1, y, id, data, 90, false);
                                            this.setTile(startx + dx, h + 1, y, id, data, 90, null);
                                        }
                                    }
                                    this.Cnt[clevel]++;
                                }
                            } else {
                                for (let y = starty; y > endy; y--) {
                                    for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                        let delta = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length].length;
                                        for (let dx = 0; dx < delta; dx++) {
                                            let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length][dx];
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (cblock.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                data = this.c_rand_data;
                                            } else if (cblock.random === 2) {
                                                data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            }
                                            if (id === 0) continue;
                                            this.setTile(startx - dx, h + 1, y, id, data, 270, null);
                                            if (dx !== 0) this.setTile(startx + dx, h + 1, y, id, data, 270, false);
                                        }
                                    }
                                    this.Cnt[clevel]++;
                                }
                            }
                        }
                    }

                    DrawLine_Roof_Improved_v2(startx, starty, endx, endy, sh, RoofConfig, nodes, last, next, Base = null, skipKCheck = false) {
                        let roof = RoofConfig.Data;
                        if (RoofConfig.Base !== null) Base = RoofConfig.Base;
                        if (last === null || next === null) return;
                        if (startx !== endx) {
                            let k = (endy - starty) / (endx - startx);
                            let b = (endy * startx - starty * endx) / (startx - endx);
                            if (-1 <= k && k < 1) {
                                let reflex_last = false;
                                let vec1 = new Vector2(startx - last.x, starty - last.y);
                                let vec2 = new Vector2(endx - startx, endy - starty);
                                let vec3 = new Vector2(next.x - endx, next.y - endy);
                                let cos1 = Vector2.Dot(vec1, vec2) / (vec1.Length() * vec2.Length());
                                let cos2 = Vector2.Dot(vec2, vec3) / (vec2.Length() * vec3.Length());
                                if (!(last == null) && -this.cos_th < cos1 && cos1 < this.cos_th) {
                                    let triangle1 = [];
                                    triangle1.push(last);
                                    triangle1.push(new node(startx, starty));
                                    triangle1.push(new node(endx, endy));
                                    let PosiInPolygon = null, PosiInTriangle = null;
                                    if (this.pnpoly4(nodes, new node(startx, starty - RoofConfig.GetReduceDelta()))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(startx, starty + RoofConfig.GetReduceDelta()))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle1, new node(startx, starty - RoofConfig.GetReduceDelta()))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle1, new node(startx, starty + RoofConfig.GetReduceDelta()))) PosiInTriangle = true;
                                    if (PosiInPolygon === null || PosiInTriangle === null) {
                                        if (this.pnpoly4(nodes, new node(startx - RoofConfig.GetReduceDelta(), starty))) PosiInPolygon = false;
                                        else if (this.pnpoly4(nodes, new node(startx + RoofConfig.GetReduceDelta(), starty))) PosiInPolygon = true;
                                        if (this.pnpoly3(triangle1, new node(startx - RoofConfig.GetReduceDelta(), starty))) PosiInTriangle = false;
                                        else if (this.pnpoly3(triangle1, new node(startx + RoofConfig.GetReduceDelta(), starty))) PosiInTriangle = true;
                                        if (PosiInPolygon !== null && PosiInTriangle !== null)
                                            reflex_last = PosiInPolygon ^ PosiInTriangle;
                                        else
                                            reflex_last = false;
                                    } else {
                                        reflex_last = PosiInPolygon ^ PosiInTriangle;
                                    }
                                    if (reflex_last && DEBUG) {
                                        print("reflex_last is true");
                                        this.setTile(startx, sh + roof[0][0].length + 2, starty, 133, 0);
                                        print("last:(" + last.x + "," + last.y + ")");
                                        print("start:(" + startx + "," + starty + ")");
                                        print("end:(" + endx + "," + endy + ")");
                                        print("next:(" + next.x + "," + next.y + ")");
                                    }
                                }
                                let reflex_next = false;
                                if (!(next === null) && -this.cos_th < cos2 && cos2 < this.cos_th) {
                                    let triangle2 = [];
                                    triangle2.push(new node(startx, starty));
                                    triangle2.push(new node(endx, endy));
                                    triangle2.push(next);
                                    let PosiInPolygon = null, PosiInTriangle = null;
                                    if (this.pnpoly4(nodes, new node(endx, endy - RoofConfig.GetReduceDelta()))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(endx, endy + RoofConfig.GetReduceDelta()))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle2, new node(endx, endy - RoofConfig.GetReduceDelta()))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle2, new node(endx, endy + RoofConfig.GetReduceDelta()))) PosiInTriangle = true;
                                    if (PosiInPolygon === null || PosiInTriangle === null) {
                                        if (this.pnpoly4(nodes, new node(endx - RoofConfig.GetReduceDelta(), endy))) PosiInPolygon = false;
                                        else if (this.pnpoly4(nodes, new node(endx + RoofConfig.GetReduceDelta(), endy))) PosiInPolygon = true;
                                        if (this.pnpoly3(triangle2, new node(endx - RoofConfig.GetReduceDelta(), endy))) PosiInTriangle = false;
                                        else if (this.pnpoly3(triangle2, new node(endx + RoofConfig.GetReduceDelta(), endy))) PosiInTriangle = true;
                                        if (PosiInPolygon !== null && PosiInTriangle !== null)
                                            reflex_next = PosiInPolygon ^ PosiInTriangle;
                                        else
                                            reflex_next = false;
                                    } else {
                                        reflex_next = PosiInPolygon ^ PosiInTriangle;
                                    }
                                    if (reflex_next && DEBUG) {
                                        print("reflex_next is true");
                                        this.setTile(endx, sh + roof[0][0].length + 2, endy, 133, 0);
                                        print("last:(" + last.x + "," + last.y + ")");
                                        print("start:(" + startx + "," + starty + ")");
                                        print("end:(" + endx + "," + endy + ")");
                                        print("next:(" + next.x + "," + next.y + ")");
                                    }
                                }

                                let d = 0;
                                let mx = Math.round((startx + endx) / 2);
                                let my = Math.round(k * mx + b);
                                if (this.pnpoly2(nodes, new node(mx, my - RoofConfig.GetReduceDelta()))) d = -1;
                                else if (this.pnpoly2(nodes, new node(mx, my + RoofConfig.GetReduceDelta()))) d = 1;

                                if (startx <= endx) {
                                    if (reflex_last) {
                                        for (let x = startx - roof[0].length; x < startx; x++) {
                                            let y = Math.round(k * x + b);
                                            let start_dy = startx - x;
                                            for (let _dy = start_dy; _dy < roof[0].length; _dy++) {
                                                let dy = (_dy - 1) * d;
                                                if (_dy === roof[0].length - 1 && this.refalist) {
                                                    this.roof_node_list.push(new node(x, y + dy));
                                                    if (DEBUG) this.setTile(x, sh + roof[0][0].length, y + dy, 133, 0);
                                                }
                                                for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                    let h = _h + sh;
                                                    let cblock = roof[this.cnt % roof.length][_dy][_h];
                                                    if (cblock.Equals(B))
                                                        cblock = Base;
                                                    else if (cblock.Equals(WF))
                                                        cblock = RoofConfig.WindowFrame;
                                                    else if (cblock.Equals(W))
                                                        cblock = RoofConfig.Window;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (d === -1)
                                                        this.setTile(x, h, y + dy, id, data, 0, null);
                                                    else if (d === 1)
                                                        this.setTile(x, h, y + dy, id, data, 0, true);
                                                }
                                            }
                                            this.cnt++;
                                        }
                                    }
                                    for (let x = startx; x <= endx; x++) {
                                        let y = Math.round(k * x + b);
                                        if (DEBUG && reflex_last) print("d=" + d + " x=" + x);
                                        let end_dy = roof[0].length;
                                        if (!(last === null) && !reflex_last) {
                                            if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                                if (startx === last.x) {
                                                    end_dy = Math.min(roof[0].length, x - startx + 1);
                                                } else {
                                                    let last_k = (starty - last.y) / (startx - last.x);
                                                    if (last_k >= 1 || last_k < -1 || skipKCheck) end_dy = Math.min(roof[0].length, x - startx + 1);
                                                }
                                            }
                                        }
                                        if (!(next === null) && !reflex_next) {
                                            if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                                if (endx === next.x) {
                                                    end_dy = Math.min(end_dy, endx - x + 1);
                                                } else {
                                                    let next_k = (next.y - endy) / (next.x - endx);
                                                    if (next_k >= 1 || next_k < -1 || skipKCheck) end_dy = Math.min(end_dy, endx - x + 1);
                                                }
                                            }
                                        }
                                        for (let _dy = 0; _dy < end_dy; _dy++) {
                                            let dy = (_dy - 1) * d;
                                            if (_dy === roof[0].length - 1) {
                                                this.roof_node_list.push(new node(x, y + dy));
                                                if (DEBUG) this.setTile(x, sh + roof[0][0].length, y + dy, 133, 0);
                                            }
                                            for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                let h = _h + sh;
                                                let cblock = roof[this.cnt % roof.length][_dy][_h];
                                                if (cblock.Equals(B))
                                                    cblock = Base;
                                                else if (cblock.Equals(WF))
                                                    cblock = RoofConfig.WindowFrame;
                                                else if (cblock.Equals(W))
                                                    cblock = RoofConfig.Window;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === -1)
                                                    this.setTile(x, h, y + dy, id, data, 0, null);
                                                else if (d === 1)
                                                    this.setTile(x, h, y + dy, id, data, 0, true);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                    if (reflex_next) {
                                        for (let x = endx; x < endx + roof[0].length; x++) {
                                            let y = Math.round(k * x + b);
                                            let start_dy = x - endx;
                                            for (let _dy = start_dy; _dy < roof[0].length; _dy++) {
                                                let dy = (_dy - 1) * d;
                                                if (_dy === roof[0].length - 1 && this.refalist) {
                                                    this.roof_node_list.push(new node(x, y + dy));
                                                    if (DEBUG) this.setTile(x, sh + roof[0][0].length, y + dy, 133, 0);
                                                }
                                                for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                    let h = _h + sh;
                                                    let cblock = roof[this.cnt % roof.length][_dy][_h];
                                                    if (cblock.Equals(B))
                                                        cblock = Base;
                                                    else if (cblock.Equals(WF))
                                                        cblock = RoofConfig.WindowFrame;
                                                    else if (cblock.Equals(W))
                                                        cblock = RoofConfig.Window;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (d === -1)
                                                        this.setTile(x, h, y + dy, id, data, 0, null);
                                                    else if (d === 1)
                                                        this.setTile(x, h, y + dy, id, data, 0, true);
                                                }
                                            }
                                            this.cnt++;
                                        }
                                    }
                                } else {
                                    if (reflex_last) {
                                        for (let x = startx + roof[0].length; x > startx; x--) {
                                            let y = Math.round(k * x + b);
                                            let start_dy = x - startx;
                                            for (let _dy = start_dy; _dy < roof[0].length; _dy++) {
                                                let dy = (_dy - 1) * d;
                                                if (_dy === roof[0].length - 1 && this.refalist) {
                                                    this.roof_node_list.push(new node(x, y + dy));
                                                    if (DEBUG) this.setTile(x, sh + roof[0][0].length, y + dy, 133, 0);
                                                }
                                                for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                    let h = _h + sh;
                                                    let cblock = roof[this.cnt % roof.length][_dy][_h];
                                                    if (cblock.Equals(B))
                                                        cblock = Base;
                                                    else if (cblock.Equals(WF))
                                                        cblock = RoofConfig.WindowFrame;
                                                    else if (cblock.Equals(W))
                                                        cblock = RoofConfig.Window;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (d === -1)
                                                        this.setTile(x, h, y + dy, id, data, 180, true);
                                                    else if (d === 1)
                                                        this.setTile(x, h, y + dy, id, data, 180, null);
                                                }
                                            }
                                            this.cnt++;
                                        }
                                    }
                                    for (let x = startx; x >= endx; x--) {
                                        let y = Math.round(k * x + b);
                                        let end_dy = roof[0].length;
                                        if (!(last === null) && !reflex_last) {
                                            if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                                if (startx === last.x) {
                                                    end_dy = Math.min(roof[0].length, startx - x + 1);
                                                } else {
                                                    let last_k = (starty - last.y) / (startx - last.x);
                                                    if (last_k >= 1 || last_k < -1 || skipKCheck) end_dy = Math.min(roof[0].length, startx - x + 1);
                                                }
                                            }
                                        }
                                        if (!(next === null) && !reflex_next) {
                                            if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                                if (next.x === endx) {
                                                    end_dy = Math.min(end_dy, x - endx + 1);
                                                } else {
                                                    let next_k = (next.y - endy) / (next.x - endx);
                                                    if (next_k >= 1 || next_k < -1 || skipKCheck) end_dy = Math.min(end_dy, x - endx + 1);
                                                }
                                            }
                                        }
                                        for (let _dy = 0; _dy < end_dy; _dy++) {
                                            let dy = (_dy - 1) * d;
                                            if (_dy === roof[0].length - 1) {
                                                this.roof_node_list.push(new node(x, y + dy));
                                                if (DEBUG) this.setTile(x, sh + roof[0][0].length, y + dy, 133, 0);
                                            }
                                            for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                let h = _h + sh;
                                                let cblock = roof[this.cnt % roof.length][_dy][_h];
                                                if (cblock.Equals(B))
                                                    cblock = Base;
                                                else if (cblock.Equals(WF))
                                                    cblock = RoofConfig.WindowFrame;
                                                else if (cblock.Equals(W))
                                                    cblock = RoofConfig.Window;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === -1)
                                                    this.setTile(x, h, y + dy, id, data, 180, true);
                                                else if (d === 1)
                                                    this.setTile(x, h, y + dy, id, data, 180, null);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                    if (reflex_next) {
                                        for (let x = endx - 1; x >= endx - roof[0].length; x--) {
                                            let y = Math.round(k * x + b);
                                            let start_dy = endx - x;
                                            for (let _dy = start_dy; _dy < roof[0].length; _dy++) {
                                                let dy = (_dy - 1) * d;
                                                if (_dy === roof[0].length - 1 && this.refalist) {
                                                    this.roof_node_list.push(new node(x, y + dy));
                                                    if (DEBUG) this.setTile(x, sh + roof[0][0].length, y + dy, 133, 0);
                                                }
                                                for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                    let h = _h + sh;
                                                    let cblock = roof[this.cnt % roof.length][_dy][_h];
                                                    if (cblock.Equals(B))
                                                        cblock = Base;
                                                    else if (cblock.Equals(WF))
                                                        cblock = RoofConfig.WindowFrame;
                                                    else if (cblock.Equals(W))
                                                        cblock = RoofConfig.Window;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (d === -1)
                                                        this.setTile(x, h, y + dy, id, data, 180, true);
                                                    else if (d === 1)
                                                        this.setTile(x, h, y + dy, id, data, 180, null);
                                                }
                                            }
                                            this.cnt++;
                                        }
                                    }
                                }
                            } else {
                                let reflex_last = false;
                                let vec1 = new Vector2(startx - last.x, starty - last.y);
                                let vec2 = new Vector2(endx - startx, endy - starty);
                                let vec3 = new Vector2(next.x - endx, next.y - endy);
                                let cos1 = Vector2.Dot(vec1, vec2) / (vec1.Length() * vec2.Length());
                                let cos2 = Vector2.Dot(vec2, vec3) / (vec2.Length() * vec3.Length());
                                if (!(last === null) && -this.cos_th < cos1 && cos1 < this.cos_th) {
                                    let triangle1 = [];
                                    triangle1.push(last);
                                    triangle1.push(new node(startx, starty));
                                    triangle1.push(new node(endx, endy));
                                    let PosiInPolygon = null, PosiInTriangle = null;
                                    if (this.pnpoly4(nodes, new node(startx - RoofConfig.GetReduceDelta(), starty))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(startx + RoofConfig.GetReduceDelta(), starty))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle1, new node(startx - RoofConfig.GetReduceDelta(), starty))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle1, new node(startx + RoofConfig.GetReduceDelta(), starty))) PosiInTriangle = true;
                                    if (PosiInPolygon === null || PosiInTriangle === null) {
                                        if (this.pnpoly4(nodes, new node(startx, starty - RoofConfig.GetReduceDelta()))) PosiInPolygon = false;
                                        else if (this.pnpoly4(nodes, new node(startx, starty + RoofConfig.GetReduceDelta()))) PosiInPolygon = true;
                                        if (this.pnpoly3(triangle1, new node(startx, starty - RoofConfig.GetReduceDelta()))) PosiInTriangle = false;
                                        else if (this.pnpoly3(triangle1, new node(startx, starty + RoofConfig.GetReduceDelta()))) PosiInTriangle = true;
                                        if (PosiInPolygon !== null && PosiInTriangle !== null)
                                            reflex_last = PosiInPolygon ^ PosiInTriangle;
                                        else
                                            reflex_last = false;
                                    } else {
                                        reflex_last = PosiInPolygon ^ PosiInTriangle;
                                    }
                                    if (reflex_last && DEBUG) {
                                        print("reflex_last is true");
                                        this.setTile(startx, sh + roof[0][0].length + 2, starty, 133, 0);
                                        print("last:(" + last.x + "," + last.y + ")");
                                        print("start:(" + startx + "," + starty + ")");
                                        print("end:(" + endx + "," + endy + ")");
                                        print("next:(" + next.x + "," + next.y + ")");
                                    }
                                }
                                let reflex_next = false;
                                if (!(next === null) && -this.cos_th < cos2 && cos2 < this.cos_th) {
                                    let triangle2 = [];
                                    triangle2.push(new node(startx, starty));
                                    triangle2.push(new node(endx, endy));
                                    triangle2.push(next);
                                    let PosiInPolygon = null, PosiInTriangle = null;
                                    if (this.pnpoly4(nodes, new node(endx - RoofConfig.GetReduceDelta(), endy))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(endx + RoofConfig.GetReduceDelta(), endy))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle2, new node(endx - RoofConfig.GetReduceDelta(), endy))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle2, new node(endx + RoofConfig.GetReduceDelta(), endy))) PosiInTriangle = true;
                                    if (PosiInPolygon === null || PosiInTriangle === null) {
                                        if (this.pnpoly4(nodes, new node(endx, endy - RoofConfig.GetReduceDelta()))) PosiInPolygon = false;
                                        else if (this.pnpoly4(nodes, new node(endx, endy + RoofConfig.GetReduceDelta()))) PosiInPolygon = true;
                                        if (this.pnpoly3(triangle2, new node(endx, endy - RoofConfig.GetReduceDelta()))) PosiInTriangle = false;
                                        else if (this.pnpoly3(triangle2, new node(endx, endy + RoofConfig.GetReduceDelta()))) PosiInTriangle = true;
                                        if (PosiInPolygon !== null && PosiInTriangle !== null)
                                            reflex_next = PosiInPolygon ^ PosiInTriangle;
                                        else
                                            reflex_next = false;
                                    } else {
                                        reflex_next = PosiInPolygon ^ PosiInTriangle;
                                    }
                                    if (reflex_next && DEBUG) {
                                        print("reflex_next is true");
                                        this.setTile(endx, sh + roof[0][0].length + 2, endy, 133, 0);
                                        print("last:(" + last.x + "," + last.y + ")");
                                        print("start:(" + startx + "," + starty + ")");
                                        print("end:(" + endx + "," + endy + ")");
                                        print("next:(" + next.x + "," + next.y + ")");
                                    }
                                }

                                let d = 0;
                                let my = Math.round((starty + endy) / 2);
                                let mx = Math.floor((my - b) / k);
                                if (this.pnpoly2(nodes, new node(mx - RoofConfig.GetReduceDelta(), my))) d = -1;
                                else if (this.pnpoly2(nodes, new node(mx + RoofConfig.GetReduceDelta(), my))) d = 1;

                                if (starty <= endy) {
                                    if (reflex_last) {
                                        for (let y = starty - roof[0].length; y < starty; y++) {
                                            let x = Math.floor((y - b) / k);
                                            let start_dx = starty - y;
                                            for (let _dx = start_dx; _dx < roof[0].length; _dx++) {
                                                let dx = (_dx - 1) * d;
                                                if (_dx === roof[0].length - 1 && this.refalist) {
                                                    this.roof_node_list.push(new node(x + dx, y));
                                                    if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                                }
                                                for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                    let h = _h + sh;
                                                    let cblock = roof[this.cnt % roof.length][_dx][_h];
                                                    if (cblock.Equals(B))
                                                        cblock = Base;
                                                    else if (cblock.Equals(WF))
                                                        cblock = RoofConfig.WindowFrame;
                                                    else if (cblock.Equals(W))
                                                        cblock = RoofConfig.Window;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (d === -1)
                                                        this.setTile(x + dx, h, y, id, data, 90, null);
                                                    else if (d === 1)
                                                        this.setTile(x + dx, h, y, id, data, 90, false);
                                                }
                                            }
                                            this.cnt++;
                                        }
                                    }
                                    for (let y = starty; y <= endy; y++) {
                                        let x = Math.floor((y - b) / k);
                                        let end_dx = roof[0].length;
                                        if (!(last === null) && !reflex_last) {
                                            if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                                if (startx !== last.x) {
                                                    let last_k = (starty - last.y) / (startx - last.x);
                                                    if (-1 <= last_k && last_k < 1 || skipKCheck) end_dx = Math.min(roof[0].length, y - starty + 1);
                                                }
                                            }
                                        }
                                        if (!(next === null) && !reflex_next) {
                                            if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                                if (next.x !== endx) {
                                                    let next_k = (next.y - endy) / (next.x - endx);
                                                    if (-1 <= next_k && next_k < 1 || skipKCheck) end_dx = Math.min(end_dx, endy - y + 1);
                                                }
                                            }
                                        }
                                        for (let _dx = 0; _dx < end_dx; _dx++) {
                                            let dx = (_dx - 1) * d;
                                            if (_dx === roof[0].length - 1) {
                                                this.roof_node_list.push(new node(x + dx, y));
                                                if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                            }
                                            for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                let h = _h + sh;
                                                let cblock = roof[this.cnt % roof.length][_dx][_h];
                                                if (cblock.Equals(B))
                                                    cblock = Base;
                                                else if (cblock.Equals(WF))
                                                    cblock = RoofConfig.WindowFrame;
                                                else if (cblock.Equals(W))
                                                    cblock = RoofConfig.Window;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 90, false);
                                                else if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 90, null);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                    if (reflex_next) {
                                        for (let y = endy; y < endy + roof[0].length; y++) {
                                            let x = Math.floor((y - b) / k);
                                            let start_dx = y - endy;
                                            for (let _dx = start_dx; _dx < roof[0].length; _dx++) {
                                                let dx = (_dx - 1) * d;
                                                if (_dx === roof[0].length - 1 && this.refalist) {
                                                    this.roof_node_list.push(new node(x + dx, y));
                                                    if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                                }
                                                for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                    let h = _h + sh;
                                                    let cblock = roof[this.cnt % roof.length][_dx][_h];
                                                    if (cblock.Equals(B))
                                                        cblock = Base;
                                                    else if (cblock.Equals(WF))
                                                        cblock = RoofConfig.WindowFrame;
                                                    else if (cblock.Equals(W))
                                                        cblock = RoofConfig.Window;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (d === -1)
                                                        this.setTile(x + dx, h, y, id, data, 90, null);
                                                    else if (d === 1)
                                                        this.setTile(x + dx, h, y, id, data, 90, false);
                                                }
                                            }
                                            this.cnt++;
                                        }
                                    }
                                } else {
                                    if (reflex_last) {
                                        for (let y = starty + roof[0].length; y > starty; y--) {
                                            let x = Math.floor((y - b) / k);
                                            let start_dx = y - starty;
                                            for (let _dx = start_dx; _dx < roof[0].length; _dx++) {
                                                let dx = (_dx - 1) * d;
                                                if (_dx === roof[0].length - 1 && this.refalist) {
                                                    this.roof_node_list.push(new node(x + dx, y));
                                                    if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                                }
                                                for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                    let h = _h + sh;
                                                    let cblock = roof[this.cnt % roof.length][_dx][_h];
                                                    if (cblock.Equals(B))
                                                        cblock = Base;
                                                    else if (cblock.Equals(WF))
                                                        cblock = RoofConfig.WindowFrame;
                                                    else if (cblock.Equals(W))
                                                        cblock = RoofConfig.Window;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (d === -1)
                                                        this.setTile(x + dx, h, y, id, data, 270, null);
                                                    else if (d === 1)
                                                        this.setTile(x + dx, h, y, id, data, 270, false);
                                                }
                                            }
                                            this.cnt++;
                                        }
                                    }
                                    for (let y = starty; y >= endy; y--) {
                                        let x = Math.floor((y - b) / k);
                                        let end_dx = roof[0].length;
                                        if (!(last === null) && !reflex_last) {
                                            if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                                if (startx !== last.x) {
                                                    let last_k = (starty - last.y) / (startx - last.x);
                                                    if (-1 <= last_k && last_k < 1 || skipKCheck) end_dx = Math.min(roof[0].length, starty - y + 1);
                                                }
                                            }
                                        }
                                        if (!(next === null) && !reflex_next) {
                                            if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                                if (next.x !== endx) {
                                                    let next_k = (next.y - endy) / (next.x - endx);
                                                    if (-1 <= next_k && next_k < 1 || skipKCheck) end_dx = Math.min(end_dx, y - endy + 1);
                                                }
                                            }
                                        }
                                        for (let _dx = 0; _dx < end_dx; _dx++) {
                                            let dx = (_dx - 1) * d;
                                            if (_dx === roof[0].length - 1) {
                                                this.roof_node_list.push(new node(x + dx, y));
                                                if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                            }
                                            for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                let h = _h + sh;
                                                let cblock = roof[this.cnt % roof.length][_dx][_h];
                                                if (cblock.Equals(B))
                                                    cblock = Base;
                                                else if (cblock.Equals(WF))
                                                    cblock = RoofConfig.WindowFrame;
                                                else if (cblock.Equals(W))
                                                    cblock = RoofConfig.Window;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (cblock.random === 1) {
                                                    if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    data = this.c_rand_data;
                                                } else if (cblock.random === 2) {
                                                    data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                }
                                                if (id === 0) continue;
                                                if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 270, false);
                                                else if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 270, null);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                    if (reflex_next) {
                                        for (let y = endy - 1; y > endy - roof[0].length; y--) {
                                            let x = Math.floor((y - b) / k);
                                            let start_dx = endy - y;
                                            for (let _dx = start_dx; _dx < roof[0].length; _dx++) {
                                                let dx = (_dx - 1) * d;
                                                if (_dx === roof[0].length - 1 && this.refalist) {
                                                    this.roof_node_list.push(new node(x + dx, y));
                                                    if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                                }
                                                for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                    let h = _h + sh;
                                                    let cblock = roof[this.cnt % roof.length][_dx][_h];
                                                    if (cblock.Equals(B))
                                                        cblock = Base;
                                                    else if (cblock.Equals(WF))
                                                        cblock = RoofConfig.WindowFrame;
                                                    else if (cblock.Equals(W))
                                                        cblock = RoofConfig.Window;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (d === -1)
                                                        this.setTile(x + dx, h, y, id, data, 270, null);
                                                    else if (d === 1)
                                                        this.setTile(x + dx, h, y, id, data, 270, false);
                                                }
                                            }
                                            this.cnt++;
                                        }
                                    }
                                }
                            }
                        } else {
                            let reflex_last = false;
                            let vec1 = new Vector2(startx - last.x, starty - last.y);
                            let vec2 = new Vector2(endx - startx, endy - starty);
                            let vec3 = new Vector2(next.x - endx, next.y - endy);
                            let cos1 = Vector2.Dot(vec1, vec2) / (vec1.Length() * vec2.Length());
                            let cos2 = Vector2.Dot(vec2, vec3) / (vec2.Length() * vec3.Length());
                            if (!(last === null) && -this.cos_th < cos1 && cos1 < this.cos_th) {
                                let triangle1 = [];
                                triangle1.push(last);
                                triangle1.push(new node(startx, starty));
                                triangle1.push(new node(endx, endy));
                                let PosiInPolygon = null, PosiInTriangle = null;
                                if (this.pnpoly4(nodes, new node(startx - RoofConfig.GetReduceDelta(), starty))) PosiInPolygon = false;
                                else if (this.pnpoly4(nodes, new node(startx + RoofConfig.GetReduceDelta(), starty))) PosiInPolygon = true;
                                if (this.pnpoly3(triangle1, new node(startx - RoofConfig.GetReduceDelta(), starty))) PosiInTriangle = false;
                                else if (this.pnpoly3(triangle1, new node(startx + RoofConfig.GetReduceDelta(), starty))) PosiInTriangle = true;
                                if (PosiInPolygon === null || PosiInTriangle === null) {
                                    if (this.pnpoly4(nodes, new node(startx, starty - RoofConfig.GetReduceDelta()))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(startx, starty + RoofConfig.GetReduceDelta()))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle1, new node(startx, starty - RoofConfig.GetReduceDelta()))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle1, new node(startx, starty + RoofConfig.GetReduceDelta()))) PosiInTriangle = true;
                                    if (PosiInPolygon !== null && PosiInTriangle !== null)
                                        reflex_last = PosiInPolygon ^ PosiInTriangle;
                                    else
                                        reflex_last = false;
                                } else {
                                    reflex_last = PosiInPolygon ^ PosiInTriangle;
                                }
                                if (reflex_last && DEBUG) {
                                    print("reflex_last is true");
                                    this.setTile(startx, sh + roof[0][0].length + 2, starty, 133, 0);
                                    print("last:(" + last.x + "," + last.y + ")");
                                    print("start:(" + startx + "," + starty + ")");
                                    print("end:(" + endx + "," + endy + ")");
                                    print("next:(" + next.x + "," + next.y + ")");
                                }
                            }
                            let reflex_next = false;
                            if (!(next === null) && -this.cos_th < cos2 && cos2 < this.cos_th) {
                                let triangle2 = [];
                                triangle2.push(new node(startx, starty));
                                triangle2.push(new node(endx, endy));
                                triangle2.push(next);
                                let PosiInPolygon = null, PosiInTriangle = null;
                                if (this.pnpoly4(nodes, new node(endx - RoofConfig.GetReduceDelta(), endy))) PosiInPolygon = false;
                                else if (this.pnpoly4(nodes, new node(endx + RoofConfig.GetReduceDelta(), endy))) PosiInPolygon = true;
                                if (this.pnpoly3(triangle2, new node(endx - RoofConfig.GetReduceDelta(), endy))) PosiInTriangle = false;
                                else if (this.pnpoly3(triangle2, new node(endx + RoofConfig.GetReduceDelta(), endy))) PosiInTriangle = true;
                                if (PosiInPolygon === null || PosiInTriangle === null) {
                                    if (this.pnpoly4(nodes, new node(endx, endy - RoofConfig.GetReduceDelta()))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(endx, endy + RoofConfig.GetReduceDelta()))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle2, new node(endx, endy - RoofConfig.GetReduceDelta()))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle2, new node(endx, endy + RoofConfig.GetReduceDelta()))) PosiInTriangle = true;
                                    if (PosiInPolygon !== null && PosiInTriangle !== null)
                                        reflex_next = PosiInPolygon ^ PosiInTriangle;
                                    else
                                        reflex_next = false;
                                } else {
                                    reflex_next = PosiInPolygon ^ PosiInTriangle;
                                }
                                if (reflex_next && DEBUG) {
                                    print("reflex_next is true");
                                    this.setTile(endx, sh + roof[0][0].length + 2, endy, 133, 0);
                                    print("last:(" + last.x + "," + last.y + ")");
                                    print("start:(" + startx + "," + starty + ")");
                                    print("end:(" + endx + "," + endy + ")");
                                    print("next:(" + next.x + "," + next.y + ")");
                                }
                            }

                            let d = 0;
                            let my = Math.round((starty + endy) / 2);
                            let mx = startx;
                            if (this.pnpoly2(nodes, new node(mx - RoofConfig.GetReduceDelta(), my))) d = -1;
                            else if (this.pnpoly2(nodes, new node(mx + RoofConfig.GetReduceDelta(), my))) d = 1;

                            if (starty <= endy) {
                                if (reflex_last) {
                                    for (let y = starty - roof[0].length; y < starty; y++) {
                                        let x = startx;
                                        let start_dx = starty - y;
                                        for (let _dx = start_dx; _dx < roof[0].length; _dx++) {
                                            let dx = (_dx - 1) * d;
                                            if (_dx === roof[0].length - 1 && this.refalist) {
                                                this.roof_node_list.push(new node(x + dx, y));
                                                if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                            }
                                            for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                let h = _h + sh;
                                                let cblock = roof[this.cnt % roof.length][_dx][_h];
                                                if (cblock.Equals(B))
                                                    cblock = Base;
                                                else if (cblock.Equals(WF))
                                                    cblock = RoofConfig.WindowFrame;
                                                else if (cblock.Equals(W))
                                                    cblock = RoofConfig.Window;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 90, false);
                                                else if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 90, null);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                }
                                for (let y = starty; y <= endy; y++) {
                                    let x = startx;
                                    let end_dx = roof[0].length;
                                    if (!(last === null) && !reflex_last) {
                                        if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                            if (startx !== last.x) {
                                                let last_k = (starty - last.y) / (startx - last.x);
                                                if (-1 <= last_k && last_k < 1 || skipKCheck) end_dx = Math.min(roof[0].length, y - starty + 1);
                                            }
                                        }
                                    }
                                    if (!(next === null) && !reflex_next) {
                                        if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                            if (next.x !== endx) {
                                                let next_k = (next.y - endy) / (next.x - endx);
                                                if (-1 <= next_k && next_k < 1 || skipKCheck) end_dx = Math.min(end_dx, endy - y + 1);
                                            }
                                        }
                                    }
                                    for (let _dx = 0; _dx < end_dx; _dx++) {
                                        let dx = (_dx - 1) * d;
                                        if (_dx === roof[0].length - 1) {
                                            this.roof_node_list.push(new node(x + dx, y));
                                            if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                        }
                                        for (let _h = 0; _h < roof[0][0].length; _h++) {
                                            let h = _h + sh;
                                            let cblock = roof[this.cnt % roof.length][_dx][_h];
                                            if (cblock.Equals(B))
                                                cblock = Base;
                                            else if (cblock.Equals(WF))
                                                cblock = RoofConfig.WindowFrame;
                                            else if (cblock.Equals(W))
                                                cblock = RoofConfig.Window;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (cblock.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                data = this.c_rand_data;
                                            } else if (cblock.random === 2) {
                                                data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            }
                                            if (id === 0) continue;
                                            if (d === 1)
                                                this.setTile(x + dx, h, y, id, data, 90, null);
                                            else if (d === -1)
                                                this.setTile(x + dx, h, y, id, data, 90, false);
                                        }
                                    }
                                    this.cnt++;
                                }
                                if (reflex_next) {
                                    for (let y = endy; y < endy + roof[0].length; y++) {
                                        let x = startx;
                                        let start_dx = y - endy;
                                        for (let _dx = start_dx; _dx < roof[0].length; _dx++) {
                                            let dx = (_dx - 1) * d;
                                            if (_dx === roof[0].length - 1 && this.refalist) {
                                                this.roof_node_list.push(new node(x + dx, y));
                                                if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                            }
                                            for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                let h = _h + sh;
                                                let cblock = roof[this.cnt % roof.length][_dx][_h];
                                                if (cblock.Equals(B))
                                                    cblock = Base;
                                                else if (cblock.Equals(WF))
                                                    cblock = RoofConfig.WindowFrame;
                                                else if (cblock.Equals(W))
                                                    cblock = RoofConfig.Window;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 90, false);
                                                else if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 90, null);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                }
                            } else {
                                if (reflex_last) {
                                    for (let y = starty + roof[0].length; y > starty; y--) {
                                        let x = startx;
                                        let start_dx = y - starty;
                                        for (let _dx = start_dx; _dx < roof[0].length; _dx++) {
                                            let dx = (_dx - 1) * d;
                                            if (_dx === roof[0].length - 1 && this.refalist) {
                                                this.roof_node_list.push(new node(x + dx, y));
                                                if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                            }
                                            for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                let h = _h + sh;
                                                let cblock = roof[this.cnt % roof.length][_dx][_h];
                                                if (cblock.Equals(B))
                                                    cblock = Base;
                                                else if (cblock.Equals(WF))
                                                    cblock = RoofConfig.WindowFrame;
                                                else if (cblock.Equals(W))
                                                    cblock = RoofConfig.Window;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 270, null);
                                                else if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 270, false);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                }
                                for (let y = starty; y >= endy; y--) {
                                    let x = startx;
                                    let end_dx = roof[0].length;
                                    if (!(last === null) && !reflex_last) {
                                        if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                            if (startx !== last.x) {
                                                let last_k = (starty - last.y) / (startx - last.x);
                                                if (-1 <= last_k && last_k < 1 || skipKCheck) end_dx = Math.min(roof[0].length, starty - y + 1);
                                            }
                                        }
                                    }
                                    if (!(next === null) && !reflex_next) {
                                        if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                            if (next.x !== endx) {
                                                let next_k = (next.y - endy) / (next.x - endx);
                                                if (-1 <= next_k && next_k < 1 || skipKCheck) end_dx = Math.min(end_dx, y - endy + 1);
                                            }
                                        }
                                    }
                                    for (let _dx = 0; _dx < end_dx; _dx++) {
                                        let dx = (_dx - 1) * d;
                                        if (_dx === roof[0].length - 1) {
                                            this.roof_node_list.push(new node(x + dx, y));
                                            if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                        }
                                        for (let _h = 0; _h < roof[0][0].length; _h++) {
                                            let h = _h + sh;
                                            let cblock = roof[this.cnt % roof.length][_dx][_h];
                                            if (cblock.Equals(B))
                                                cblock = Base;
                                            else if (cblock.Equals(WF))
                                                cblock = RoofConfig.WindowFrame;
                                            else if (cblock.Equals(W))
                                                cblock = RoofConfig.Window;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (cblock.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                data = this.c_rand_data;
                                            } else if (cblock.random === 2) {
                                                data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            }
                                            if (id === 0) continue;
                                            if (d === 1)
                                                this.setTile(x + dx, h, y, id, data, 270, false);
                                            else if (d === -1)
                                                this.setTile(x + dx, h, y, id, data, 270, null);
                                        }
                                    }
                                    this.cnt++;
                                }
                                if (reflex_next) {
                                    for (let y = endy - 1; y > endy - roof[0].length; y--) {
                                        let x = startx;
                                        let start_dx = endy - y;
                                        for (let _dx = start_dx; _dx < roof[0].length; _dx++) {
                                            let dx = (_dx - 1) * d;
                                            if (_dx === roof[0].length - 1 && this.refalist) {
                                                this.roof_node_list.push(new node(x + dx, y));
                                                if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                            }
                                            for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                let h = _h + sh;
                                                let cblock = roof[this.cnt % roof.length][_dx][_h];
                                                if (cblock.Equals(B))
                                                    cblock = Base;
                                                else if (cblock.Equals(WF))
                                                    cblock = RoofConfig.WindowFrame;
                                                else if (cblock.Equals(W))
                                                    cblock = RoofConfig.Window;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 270, null);
                                                else if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 270, false);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                }
                            }
                        }
                    }

                    DrawLine_Interior_v3(startx, starty, endx, endy, max_level, InteriorConfig, nodes, last, next, Base = null, skipKCheck = false) {
                        // v3的内饰放置算法：和v2相比，对于扩展判定如果cos范围大于this.cos_th直接认定为需要扩展
                        let interior = InteriorConfig.Data;
                        if (InteriorConfig.Base === null) InteriorConfig.Base = Base;
                        if (last === null || next === null) return;
                        let c_rand_type = -1;
                        if (startx !== endx) {
                            let k = (endy - starty) / (endx - startx);
                            let b = (endy * startx - starty * endx) / (startx - endx);
                            if (Math.abs(k) <= 1) {
                                let reflex_last = false, reflex_next = false;
                                let vec1 = new Vector2(startx - last.x, starty - last.y);
                                let vec2 = new Vector2(endx - startx, endy - starty);
                                let vec3 = new Vector2(next.x - endx, next.y - endy);
                                let cos1 = Vector2.Dot(vec1, vec2) / (vec1.Length() * vec2.Length());
                                let cos2 = Vector2.Dot(vec2, vec3) / (vec2.Length() * vec3.Length());
                                let last_k = (starty - last.y) / (startx - last.x);
                                let next_k = (next.y - endy) / (next.x - endx);
                                if (startx === last.x) last_k = inf;
                                if (next.x === endx) next_k = inf;
                                if (Math.abs(last_k) > 1) {
                                    if (Math.abs(cos1) > this.cos_th)
                                        reflex_last = true;
                                    else {
                                        let triangle1 = [];
                                        triangle1.push(last);
                                        triangle1.push(new node(startx, starty));
                                        triangle1.push(new node(endx, endy));
                                        let PosiInPolygon = null, PosiInTriangle = null;
                                        if (this.pnpoly4(nodes, new node(startx, starty - InteriorConfig.GetReduceDelta()))) PosiInPolygon = false;
                                        else if (this.pnpoly4(nodes, new node(startx, starty + InteriorConfig.GetReduceDelta()))) PosiInPolygon = true;
                                        if (this.pnpoly3(triangle1, new node(startx, starty - InteriorConfig.GetReduceDelta()))) PosiInTriangle = false;
                                        else if (this.pnpoly3(triangle1, new node(startx, starty + InteriorConfig.GetReduceDelta()))) PosiInTriangle = true;
                                        if (PosiInPolygon === null || PosiInTriangle === null) {
                                            if (this.pnpoly4(nodes, new node(startx - InteriorConfig.GetReduceDelta(), starty))) PosiInPolygon = false;
                                            else if (this.pnpoly4(nodes, new node(startx + InteriorConfig.GetReduceDelta(), starty))) PosiInPolygon = true;
                                            if (this.pnpoly3(triangle1, new node(startx - InteriorConfig.GetReduceDelta(), starty))) PosiInTriangle = false;
                                            else if (this.pnpoly3(triangle1, new node(startx + InteriorConfig.GetReduceDelta(), starty))) PosiInTriangle = true;
                                            if (PosiInPolygon !== null && PosiInTriangle !== null)
                                                reflex_last = PosiInPolygon ^ PosiInTriangle;
                                            else
                                                reflex_last = false;
                                        } else {
                                            reflex_last = PosiInPolygon ^ PosiInTriangle;
                                        }
                                    }
                                }
                                if (Math.abs(next_k) > 1) {
                                    if (Math.abs(cos2) > this.cos_th)
                                        reflex_next = true;
                                    else {
                                        let triangle2 = [];
                                        triangle2.push(new node(startx, starty));
                                        triangle2.push(new node(endx, endy));
                                        triangle2.push(next);
                                        let PosiInPolygon = null, PosiInTriangle = null;
                                        if (this.pnpoly4(nodes, new node(endx, endy - InteriorConfig.GetReduceDelta()))) PosiInPolygon = false;
                                        else if (this.pnpoly4(nodes, new node(endx, endy + InteriorConfig.GetReduceDelta()))) PosiInPolygon = true;
                                        if (this.pnpoly3(triangle2, new node(endx, endy - InteriorConfig.GetReduceDelta()))) PosiInTriangle = false;
                                        else if (this.pnpoly3(triangle2, new node(endx, endy + InteriorConfig.GetReduceDelta()))) PosiInTriangle = true;
                                        if (PosiInPolygon === null || PosiInTriangle === null) {
                                            if (this.pnpoly4(nodes, new node(endx - InteriorConfig.GetReduceDelta(), endy))) PosiInPolygon = false;
                                            else if (this.pnpoly4(nodes, new node(endx + InteriorConfig.GetReduceDelta(), endy))) PosiInPolygon = true;
                                            if (this.pnpoly3(triangle2, new node(endx - InteriorConfig.GetReduceDelta(), endy))) PosiInTriangle = false;
                                            else if (this.pnpoly3(triangle2, new node(endx + InteriorConfig.GetReduceDelta(), endy))) PosiInTriangle = true;
                                            if (PosiInPolygon !== null && PosiInTriangle !== null)
                                                reflex_next = PosiInPolygon ^ PosiInTriangle;
                                            else
                                                reflex_next = false;
                                        } else {
                                            reflex_next = PosiInPolygon ^ PosiInTriangle;
                                        }
                                    }
                                }

                                let d = 0;
                                let mx = Math.round((startx + endx) / 2);
                                let my = Math.round(k * mx + b);
                                if (this.pnpoly2(nodes, new node(mx, my - InteriorConfig.GetReduceDelta()))) d = -1;
                                else if (this.pnpoly2(nodes, new node(mx, my + InteriorConfig.GetReduceDelta()))) d = 1;
                                else return;

                                function GetValidWidth(x, y) {
                                    let ret = 1;
                                    for (; ret <= InteriorConfig.GetWidth(); ret++) {
                                        if (!pnpoly4(nodes, new node(x, y + ret * d))) break;
                                    }
                                    return ret - 1;
                                }

                                for (let clevel = 0; clevel < max_level; clevel++) {
                                    let sh = clevel * InteriorConfig.GetHeight();
                                    if (startx <= endx) {
                                        if (reflex_last) {
                                            for (let x = startx - InteriorConfig.GetWidth() - 1; x < startx; x++) {
                                                let y = Math.round(k * x + b);
                                                let start_dy = startx - x;
                                                for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                    let h = _h + sh;
                                                    for (let _dy = GetValidWidth(x, y); _dy > start_dy; _dy--) {
                                                        let dy = _dy * d;
                                                        let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dy];
                                                        if (cblock.Equals(B))
                                                            cblock = InteriorConfig.Base;
                                                        else if (cblock.Equals(L))
                                                            cblock = InteriorConfig.Light;
                                                        let id = cblock.id;
                                                        let data = cblock.data;
                                                        if (id === 0) continue;
                                                        if (cblock.random === 1) {
                                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                            data = this.c_rand_data;
                                                        } else if (cblock.random === 2) {
                                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        } else if (cblock.random === 3) {
                                                            if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                            let customed = this.setCustomStyle(cblock, c_rand_type);
                                                            id = customed.id;
                                                            data = customed.data;
                                                        }
                                                        if (d === 1)
                                                            this.setTile(x, h, y + dy, id, data, 0, null, true);
                                                        else if (d === -1)
                                                            this.setTile(x, h, y + dy, id, data, 0, true, true);
                                                    }
                                                }
                                                this.Cnt[clevel]++;
                                            }
                                        }
                                        for (let x = startx; x < endx; x++) {
                                            let y = Math.round(k * x + b);
                                            let end_dy = GetValidWidth(x, y);
                                            if (!(last === null) && !reflex_last) {
                                                if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                                    if (startx === last.x) {
                                                        end_dy = Math.min(end_dy, x - startx + 1);
                                                    } else {
                                                        if (Math.abs(last_k) > 1 || skipKCheck)
                                                            end_dy = Math.min(end_dy, x - startx + 1);
                                                    }
                                                }
                                            }
                                            if (!(next === null) && !reflex_next) {
                                                if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                                    if (endx === next.x) {
                                                        end_dy = Math.min(end_dy, endx - x + 1);
                                                    } else {
                                                        if (Math.abs(next_k) > 1 || skipKCheck)
                                                            end_dy = Math.min(end_dy, endx - x + 1);
                                                    }
                                                }
                                            }
                                            for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                let h = _h + sh;
                                                for (let _dy = end_dy; _dy > 0; _dy--) {
                                                    let dy = _dy * d;
                                                    let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dy];
                                                    if (cblock.Equals(B))
                                                        cblock = InteriorConfig.Base;
                                                    else if (cblock.Equals(L))
                                                        cblock = InteriorConfig.Light;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (cblock.random === 1) {
                                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        data = this.c_rand_data;
                                                    } else if (cblock.random === 2) {
                                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    } else if (cblock.random === 3) {
                                                        if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        let customed = this.setCustomStyle(cblock, c_rand_type);
                                                        id = customed.id;
                                                        data = customed.data;
                                                    }
                                                    if (d === 1)
                                                        this.setTile(x, h, y + dy, id, data, 0, null, true);
                                                    else if (d === -1)
                                                        this.setTile(x, h, y + dy, id, data, 0, true, true);
                                                }
                                            }
                                            this.Cnt[clevel]++;
                                        }
                                        if (reflex_next) {
                                            for (let x = endx; x <= endx + InteriorConfig.GetWidth(); x++) {
                                                let y = Math.round(k * x + b);
                                                let start_dy = x - endx;
                                                for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                    let h = _h + sh;
                                                    for (let _dy = GetValidWidth(x, y); _dy > start_dy; _dy--) {
                                                        let dy = _dy * d;
                                                        let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dy];
                                                        if (cblock.Equals(B))
                                                            cblock = InteriorConfig.Base;
                                                        else if (cblock.Equals(L))
                                                            cblock = InteriorConfig.Light;
                                                        let id = cblock.id;
                                                        let data = cblock.data;
                                                        if (id === 0) continue;
                                                        if (cblock.random === 1) {
                                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                            data = this.c_rand_data;
                                                        } else if (cblock.random === 2) {
                                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        } else if (cblock.random === 3) {
                                                            if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                            let customed = this.setCustomStyle(cblock, c_rand_type);
                                                            id = customed.id;
                                                            data = customed.data;
                                                        }
                                                        if (d === 1)
                                                            this.setTile(x, h, y + dy, id, data, 0, null, true);
                                                        else if (d === -1)
                                                            this.setTile(x, h, y + dy, id, data, 0, true, true);
                                                    }
                                                }
                                                this.Cnt[clevel]++;
                                            }
                                        }
                                    } else {
                                        if (reflex_last) {
                                            for (let x = startx + InteriorConfig.GetWidth() + 1; x > startx; x--) {
                                                let y = Math.round(k * x + b);
                                                let start_dy = x - startx;
                                                for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                    let h = _h + sh;
                                                    for (let _dy = GetValidWidth(x, y); _dy > start_dy; _dy--) {
                                                        let dy = _dy * d;
                                                        let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dy];
                                                        if (cblock.Equals(B))
                                                            cblock = InteriorConfig.Base;
                                                        else if (cblock.Equals(L))
                                                            cblock = InteriorConfig.Light;
                                                        let id = cblock.id;
                                                        let data = cblock.data;
                                                        if (id === 0) continue;
                                                        if (cblock.random === 1) {
                                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                            data = this.c_rand_data;
                                                        } else if (cblock.random === 2) {
                                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        } else if (cblock.random === 3) {
                                                            if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                            let customed = this.setCustomStyle(cblock, c_rand_type);
                                                            id = customed.id;
                                                            data = customed.data;
                                                        }
                                                        if (d === 1)
                                                            this.setTile(x, h, y + dy, id, data, 180, true, true);
                                                        else if (d === -1)
                                                            this.setTile(x, h, y + dy, id, data, 180, null, true);
                                                    }
                                                }
                                                this.Cnt[clevel]++;
                                            }
                                        }
                                        for (let x = startx; x > endx; x--) {
                                            let y = Math.round(k * x + b);
                                            let end_dy = GetValidWidth(x, y);
                                            if (!(last === null) && !reflex_last) {
                                                if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                                    if (startx === last.x) {
                                                        end_dy = Math.min(end_dy, startx - x + 1);
                                                    } else {
                                                        if (Math.abs(last_k) > 1 || skipKCheck)
                                                            end_dy = Math.min(end_dy, startx - x + 1);
                                                    }
                                                }
                                            }
                                            if (!(next === null) && !reflex_next) {
                                                if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                                    if (next.x === endx) {
                                                        end_dy = Math.min(end_dy, x - endx + 1);
                                                    } else {
                                                        if (Math.abs(next_k) > 1 || skipKCheck)
                                                            end_dy = Math.min(end_dy, x - endx + 1);
                                                    }
                                                }
                                            }
                                            for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                let h = _h + sh;
                                                for (let _dy = end_dy; _dy > 0; _dy--) {
                                                    let dy = _dy * d;
                                                    let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dy];
                                                    if (cblock.Equals(B))
                                                        cblock = InteriorConfig.Base;
                                                    else if (cblock.Equals(L))
                                                        cblock = InteriorConfig.Light;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (cblock.random === 1) {
                                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        data = this.c_rand_data;
                                                    } else if (cblock.random === 2) {
                                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    } else if (cblock.random === 3) {
                                                        if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        let customed = this.setCustomStyle(cblock, c_rand_type);
                                                        id = customed.id;
                                                        data = customed.data;
                                                    }
                                                    if (d === 1)
                                                        this.setTile(x, h, y + dy, id, data, 180, true, true);
                                                    else if (d === -1)
                                                        this.setTile(x, h, y + dy, id, data, 180, null, true);
                                                }
                                            }
                                            this.Cnt[clevel]++;
                                        }
                                        if (reflex_next) {
                                            for (let x = endx; x >= endx - InteriorConfig.GetWidth(); x--) {
                                                let y = Math.round(k * x + b);
                                                let start_dy = endx - x;
                                                for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                    let h = _h + sh;
                                                    for (let _dy = GetValidWidth(x, y); _dy > start_dy; _dy--) {
                                                        let dy = _dy * d;
                                                        let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dy];
                                                        if (cblock.Equals(B))
                                                            cblock = InteriorConfig.Base;
                                                        else if (cblock.Equals(L))
                                                            cblock = InteriorConfig.Light;
                                                        let id = cblock.id;
                                                        let data = cblock.data;
                                                        if (id === 0) continue;
                                                        if (cblock.random === 1) {
                                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                            data = this.c_rand_data;
                                                        } else if (cblock.random === 2) {
                                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        } else if (cblock.random === 3) {
                                                            if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                            let customed = this.setCustomStyle(cblock, c_rand_type);
                                                            id = customed.id;
                                                            data = customed.data;
                                                        }
                                                        if (d === 1)
                                                            this.setTile(x, h, y + dy, id, data, 180, true, true);
                                                        else if (d === -1)
                                                            this.setTile(x, h, y + dy, id, data, 180, null, true);
                                                    }
                                                }
                                                this.Cnt[clevel]++;
                                            }
                                        }
                                    }
                                }
                            } else {
                                let reflex_last = false, reflex_next = false;
                                let vec1 = new Vector2(startx - last.x, starty - last.y);
                                let vec2 = new Vector2(endx - startx, endy - starty);
                                let vec3 = new Vector2(next.x - endx, next.y - endy);
                                let cos1 = Vector2.Dot(vec1, vec2) / (vec1.Length() * vec2.Length());
                                let cos2 = Vector2.Dot(vec2, vec3) / (vec2.Length() * vec3.Length());
                                let last_k = (starty - last.y) / (startx - last.x);
                                let next_k = (next.y - endy) / (next.x - endx);
                                if (startx === last.x) last_k = inf;
                                if (next.x === endx) next_k = inf;
                                if (Math.abs(last_k) <= 1) {
                                    if (Math.abs(cos1) > this.cos_th)
                                        reflex_last = true;
                                    else {
                                        let triangle1 = [];
                                        triangle1.push(last);
                                        triangle1.push(new node(startx, starty));
                                        triangle1.push(new node(endx, endy));
                                        let PosiInPolygon = null, PosiInTriangle = null;
                                        if (this.pnpoly4(nodes, new node(startx - InteriorConfig.GetReduceDelta(), starty))) PosiInPolygon = false;
                                        else if (this.pnpoly4(nodes, new node(startx + InteriorConfig.GetReduceDelta(), starty))) PosiInPolygon = true;
                                        if (this.pnpoly3(triangle1, new node(startx - InteriorConfig.GetReduceDelta(), starty))) PosiInTriangle = false;
                                        else if (this.pnpoly3(triangle1, new node(startx + InteriorConfig.GetReduceDelta(), starty))) PosiInTriangle = true;
                                        if (PosiInPolygon === null || PosiInTriangle === null) {
                                            if (this.pnpoly4(nodes, new node(startx, starty - InteriorConfig.GetReduceDelta()))) PosiInPolygon = false;
                                            else if (this.pnpoly4(nodes, new node(startx, starty + InteriorConfig.GetReduceDelta()))) PosiInPolygon = true;
                                            if (this.pnpoly3(triangle1, new node(startx, starty - InteriorConfig.GetReduceDelta()))) PosiInTriangle = false;
                                            else if (this.pnpoly3(triangle1, new node(startx, starty + InteriorConfig.GetReduceDelta()))) PosiInTriangle = true;
                                            if (PosiInPolygon !== null && PosiInTriangle !== null)
                                                reflex_last = PosiInPolygon ^ PosiInTriangle;
                                            else
                                                reflex_last = false;
                                        } else {
                                            reflex_last = PosiInPolygon ^ PosiInTriangle;
                                        }
                                    }
                                }
                                if (Math.abs(next_k) <= 1) {
                                    if (Math.abs(cos2) > this.cos_th)
                                        reflex_next = true;
                                    else {
                                        let triangle2 = [];
                                        triangle2.push(new node(startx, starty));
                                        triangle2.push(new node(endx, endy));
                                        triangle2.push(next);
                                        let PosiInPolygon = null, PosiInTriangle = null;
                                        if (this.pnpoly4(nodes, new node(endx - InteriorConfig.GetReduceDelta(), endy))) PosiInPolygon = false;
                                        else if (this.pnpoly4(nodes, new node(endx + InteriorConfig.GetReduceDelta(), endy))) PosiInPolygon = true;
                                        if (this.pnpoly3(triangle2, new node(endx - InteriorConfig.GetReduceDelta(), endy))) PosiInTriangle = false;
                                        else if (this.pnpoly3(triangle2, new node(endx + InteriorConfig.GetReduceDelta(), endy))) PosiInTriangle = true;
                                        if (PosiInPolygon === null || PosiInTriangle === null) {
                                            if (this.pnpoly4(nodes, new node(endx, endy - InteriorConfig.GetReduceDelta()))) PosiInPolygon = false;
                                            else if (this.pnpoly4(nodes, new node(endx, endy + InteriorConfig.GetReduceDelta()))) PosiInPolygon = true;
                                            if (this.pnpoly3(triangle2, new node(endx, endy - InteriorConfig.GetReduceDelta()))) PosiInTriangle = false;
                                            else if (this.pnpoly3(triangle2, new node(endx, endy + InteriorConfig.GetReduceDelta()))) PosiInTriangle = true;
                                            if (PosiInPolygon !== null && PosiInTriangle !== null)
                                                reflex_next = PosiInPolygon ^ PosiInTriangle;
                                            else
                                                reflex_next = false;
                                        } else {
                                            reflex_next = PosiInPolygon ^ PosiInTriangle;
                                        }
                                    }
                                }

                                let d = 0;
                                let my = Math.round((starty + endy) / 2);
                                let mx = Math.floor((my - b) / k);
                                if (this.pnpoly2(nodes, new node(mx - InteriorConfig.GetReduceDelta(), my))) d = -1;
                                else if (this.pnpoly2(nodes, new node(mx + InteriorConfig.GetReduceDelta(), my))) d = 1;
                                else return;

                                function GetValidWidth(x, y) {
                                    let ret = 1;
                                    for (; ret <= InteriorConfig.GetWidth(); ret++) {
                                        if (!pnpoly4(nodes, new node(x + ret * d, y))) break;
                                    }
                                    return ret - 1;
                                }

                                for (let clevel = 0; clevel < max_level; clevel++) {
                                    let sh = clevel * InteriorConfig.GetHeight();
                                    if (starty <= endy) {
                                        if (reflex_last) {
                                            for (let y = starty - InteriorConfig.GetWidth() - 1; y < starty; y++) {
                                                let x = Math.floor((y - b) / k);
                                                let start_dx = starty - y;
                                                for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                    let h = _h + sh;
                                                    for (let _dx = GetValidWidth(x, y); _dx > start_dx; _dx--) {
                                                        let dx = _dx * d;
                                                        let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                        if (cblock.Equals(B))
                                                            cblock = InteriorConfig.Base;
                                                        else if (cblock.Equals(L))
                                                            cblock = InteriorConfig.Light;
                                                        let id = cblock.id;
                                                        let data = cblock.data;
                                                        if (id === 0) continue;
                                                        if (cblock.random === 1) {
                                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                            data = this.c_rand_data;
                                                        } else if (cblock.random === 2) {
                                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        } else if (cblock.random === 3) {
                                                            if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                            let customed = this.setCustomStyle(cblock, c_rand_type);
                                                            id = customed.id;
                                                            data = customed.data;
                                                        }
                                                        if (d === -1)
                                                            this.setTile(x + dx, h, y, id, data, 90, null, true);
                                                        else if (d === 1)
                                                            this.setTile(x + dx, h, y, id, data, 90, false, true);
                                                    }
                                                }
                                                this.Cnt[clevel]++;
                                            }
                                        }
                                        for (let y = starty; y < endy; y++) {
                                            let x = Math.floor((y - b) / k);
                                            let end_dx = GetValidWidth(x, y);
                                            if (!(last === null) && !reflex_last) {
                                                if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                                    if (startx !== last.x) {
                                                        if (Math.abs(last_k) <= 1 || skipKCheck)
                                                            end_dx = Math.min(end_dx, y - starty + 1);
                                                    }
                                                }
                                            }
                                            if (!(next === null) && !reflex_next) {
                                                if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                                    if (endx !== next.x) {
                                                        if (Math.abs(next_k) <= 1 || skipKCheck)
                                                            end_dx = Math.min(end_dx, endy - y + 1);
                                                    }
                                                }
                                            }
                                            for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                let h = _h + sh;
                                                for (let _dx = end_dx; _dx > 0; _dx--) {
                                                    let dx = _dx * d;
                                                    let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                    if (cblock.Equals(B))
                                                        cblock = InteriorConfig.Base;
                                                    else if (cblock.Equals(L))
                                                        cblock = InteriorConfig.Light;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (cblock.random === 1) {
                                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        data = this.c_rand_data;
                                                    } else if (cblock.random === 2) {
                                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    } else if (cblock.random === 3) {
                                                        if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        let customed = this.setCustomStyle(cblock, c_rand_type);
                                                        id = customed.id;
                                                        data = customed.data;
                                                    }
                                                    if (d === -1)
                                                        this.setTile(x + dx, h, y, id, data, 90, null, true);
                                                    else if (d === 1)
                                                        this.setTile(x + dx, h, y, id, data, 90, false, true);
                                                }
                                            }
                                            this.Cnt[clevel]++;
                                        }
                                        if (reflex_next) {
                                            for (let y = endy; y <= endy + InteriorConfig.GetWidth(); y++) {
                                                let x = Math.floor((y - b) / k);
                                                let start_dx = y - endy;
                                                for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                    let h = _h + sh;
                                                    for (let _dx = GetValidWidth(x, y); _dx > start_dx; _dx--) {
                                                        let dx = _dx * d;
                                                        let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                        if (cblock.Equals(B))
                                                            cblock = InteriorConfig.Base;
                                                        else if (cblock.Equals(L))
                                                            cblock = InteriorConfig.Light;
                                                        let id = cblock.id;
                                                        let data = cblock.data;
                                                        if (id === 0) continue;
                                                        if (cblock.random === 1) {
                                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                            data = this.c_rand_data;
                                                        } else if (cblock.random === 2) {
                                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        } else if (cblock.random === 3) {
                                                            if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                            let customed = this.setCustomStyle(cblock, c_rand_type);
                                                            id = customed.id;
                                                            data = customed.data;
                                                        }
                                                        if (d === -1)
                                                            this.setTile(x + dx, h, y, id, data, 90, null, true);
                                                        else if (d === 1)
                                                            this.setTile(x + dx, h, y, id, data, 90, false, true);
                                                    }
                                                }
                                                this.Cnt[clevel]++;
                                            }
                                        }
                                    } else {
                                        if (reflex_last) {
                                            for (let y = starty + InteriorConfig.GetWidth() + 1; y > starty; y--) {
                                                let x = Math.floor((y - b) / k);
                                                let start_dx = y - starty;
                                                for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                    let h = _h + sh;
                                                    for (let _dx = GetValidWidth(x, y); _dx > start_dx; _dx--) {
                                                        let dx = _dx * d;
                                                        let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                        if (cblock.Equals(B))
                                                            cblock = InteriorConfig.Base;
                                                        else if (cblock.Equals(L))
                                                            cblock = InteriorConfig.Light;
                                                        let id = cblock.id;
                                                        let data = cblock.data;
                                                        if (id === 0) continue;
                                                        if (cblock.random === 1) {
                                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                            data = this.c_rand_data;
                                                        } else if (cblock.random === 2) {
                                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        } else if (cblock.random === 3) {
                                                            if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                            let customed = this.setCustomStyle(cblock, c_rand_type);
                                                            id = customed.id;
                                                            data = customed.data;
                                                        }
                                                        if (d === -1)
                                                            this.setTile(x + dx, h, y, id, data, 270, false, true);
                                                        else if (d === 1)
                                                            this.setTile(x + dx, h, y, id, data, 270, null, true);
                                                    }
                                                }
                                                this.Cnt[clevel]++;
                                            }
                                        }
                                        for (let y = starty; y > endy; y--) {
                                            let x = Math.floor((y - b) / k);
                                            let end_dx = GetValidWidth(x, y);
                                            if (!(last === null) && !reflex_last) {
                                                if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                                    if (startx !== last.x) {
                                                        if (Math.abs(last_k) <= 1 || skipKCheck)
                                                            end_dx = Math.min(end_dx, starty - y + 1);
                                                    }
                                                }
                                            }
                                            if (!(next === null) && !reflex_next) {
                                                if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                                    if (endx !== next.x) {
                                                        if (Math.abs(next_k) <= 1 || skipKCheck)
                                                            end_dx = Math.min(end_dx, y - endy + 1);
                                                    }
                                                }
                                            }
                                            for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                let h = _h + sh;
                                                for (let _dx = end_dx; _dx > 0; _dx--) {
                                                    let dx = _dx * d;
                                                    let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                    if (cblock.Equals(B))
                                                        cblock = InteriorConfig.Base;
                                                    else if (cblock.Equals(L))
                                                        cblock = InteriorConfig.Light;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (cblock.random === 1) {
                                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        data = this.c_rand_data;
                                                    } else if (cblock.random === 2) {
                                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    } else if (cblock.random === 3) {
                                                        if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        let customed = this.setCustomStyle(cblock, c_rand_type);
                                                        id = customed.id;
                                                        data = customed.data;
                                                    }
                                                    if (d === -1)
                                                        this.setTile(x + dx, h, y, id, data, 270, false, true);
                                                    else if (d === 1)
                                                        this.setTile(x + dx, h, y, id, data, 270, null, true);
                                                }
                                            }
                                            this.Cnt[clevel]++;
                                        }
                                        if (reflex_next) {
                                            for (let y = endy; y >= endy + InteriorConfig.GetWidth(); y--) {
                                                let x = Math.floor((y - b) / k);
                                                let start_dx = endy - y;
                                                for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                    let h = _h + sh;
                                                    for (let _dx = GetValidWidth(x, y); _dx > start_dx; _dx--) {
                                                        let dx = _dx * d;
                                                        let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                        if (cblock.Equals(B))
                                                            cblock = InteriorConfig.Base;
                                                        else if (cblock.Equals(L))
                                                            cblock = InteriorConfig.Light;
                                                        let id = cblock.id;
                                                        let data = cblock.data;
                                                        if (id === 0) continue;
                                                        if (cblock.random === 1) {
                                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                            data = this.c_rand_data;
                                                        } else if (cblock.random === 2) {
                                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        } else if (cblock.random === 3) {
                                                            if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                            let customed = this.setCustomStyle(cblock, c_rand_type);
                                                            id = customed.id;
                                                            data = customed.data;
                                                        }
                                                        if (d === -1)
                                                            this.setTile(x + dx, h, y, id, data, 270, false, true);
                                                        else if (d === 1)
                                                            this.setTile(x + dx, h, y, id, data, 270, null, true);
                                                    }
                                                }
                                                this.Cnt[clevel]++;
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            let reflex_last = false, reflex_next = false;
                            let vec1 = new Vector2(startx - last.x, starty - last.y);
                            let vec2 = new Vector2(endx - startx, endy - starty);
                            let vec3 = new Vector2(next.x - endx, next.y - endy);
                            let cos1 = Vector2.Dot(vec1, vec2) / (vec1.Length() * vec2.Length());
                            let cos2 = Vector2.Dot(vec2, vec3) / (vec2.Length() * vec3.Length());
                            let last_k = (starty - last.y) / (startx - last.x);
                            let next_k = (next.y - endy) / (next.x - endx);
                            if (startx === last.x) last_k = inf;
                            if (next.x === endx) next_k = inf;
                            if (Math.abs(last_k) <= 1) {
                                if (Math.abs(cos1) > this.cos_th)
                                    reflex_last = true;
                                else {
                                    let triangle1 = [];
                                    triangle1.push(last);
                                    triangle1.push(new node(startx, starty));
                                    triangle1.push(new node(endx, endy));
                                    let PosiInPolygon = null, PosiInTriangle = null;
                                    if (this.pnpoly4(nodes, new node(startx - InteriorConfig.GetReduceDelta(), starty))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(startx + InteriorConfig.GetReduceDelta(), starty))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle1, new node(startx - InteriorConfig.GetReduceDelta(), starty))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle1, new node(startx + InteriorConfig.GetReduceDelta(), starty))) PosiInTriangle = true;
                                    if (PosiInPolygon === null || PosiInTriangle === null) {
                                        if (this.pnpoly4(nodes, new node(startx, starty - InteriorConfig.GetReduceDelta()))) PosiInPolygon = false;
                                        else if (this.pnpoly4(nodes, new node(startx, starty + InteriorConfig.GetReduceDelta()))) PosiInPolygon = true;
                                        if (this.pnpoly3(triangle1, new node(startx, starty - InteriorConfig.GetReduceDelta()))) PosiInTriangle = false;
                                        else if (this.pnpoly3(triangle1, new node(startx, starty + InteriorConfig.GetReduceDelta()))) PosiInTriangle = true;
                                        if (PosiInPolygon !== null && PosiInTriangle !== null)
                                            reflex_last = PosiInPolygon ^ PosiInTriangle;
                                        else
                                            reflex_last = false;
                                    } else {
                                        reflex_last = PosiInPolygon ^ PosiInTriangle;
                                    }
                                }
                            }
                            if (Math.abs(next_k) <= 1) {
                                if (Math.abs(cos2) > this.cos_th)
                                    reflex_next = true;
                                else {
                                    let triangle2 = [];
                                    triangle2.push(new node(startx, starty));
                                    triangle2.push(new node(endx, endy));
                                    triangle2.push(next);
                                    let PosiInPolygon = null, PosiInTriangle = null;
                                    if (this.pnpoly4(nodes, new node(endx - InteriorConfig.GetReduceDelta(), endy))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(endx + InteriorConfig.GetReduceDelta(), endy))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle2, new node(endx - InteriorConfig.GetReduceDelta(), endy))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle2, new node(endx + InteriorConfig.GetReduceDelta(), endy))) PosiInTriangle = true;
                                    if (PosiInPolygon === null || PosiInTriangle === null) {
                                        if (this.pnpoly4(nodes, new node(endx, endy - InteriorConfig.GetReduceDelta()))) PosiInPolygon = false;
                                        else if (this.pnpoly4(nodes, new node(endx, endy + InteriorConfig.GetReduceDelta()))) PosiInPolygon = true;
                                        if (this.pnpoly3(triangle2, new node(endx, endy - InteriorConfig.GetReduceDelta()))) PosiInTriangle = false;
                                        else if (this.pnpoly3(triangle2, new node(endx, endy + InteriorConfig.GetReduceDelta()))) PosiInTriangle = true;
                                        if (PosiInPolygon !== null && PosiInTriangle !== null)
                                            reflex_next = PosiInPolygon ^ PosiInTriangle;
                                        else
                                            reflex_next = false;
                                    } else {
                                        reflex_next = PosiInPolygon ^ PosiInTriangle;
                                    }
                                }
                            }

                            let d = 0;
                            let my = Math.round((starty + endy) / 2);
                            let mx = startx;
                            if (this.pnpoly2(nodes, new node(mx - InteriorConfig.GetReduceDelta(), my))) d = -1;
                            else if (this.pnpoly2(nodes, new node(mx + InteriorConfig.GetReduceDelta(), my))) d = 1;
                            else return;

                            function GetValidWidth(x, y) {
                                let ret = 1;
                                for (; ret <= InteriorConfig.GetWidth(); ret++) {
                                    if (!pnpoly4(nodes, new node(x + ret * d, y))) break;
                                }
                                return ret - 1;
                            }

                            for (let clevel = 0; clevel < max_level; clevel++) {
                                let sh = clevel * InteriorConfig.GetHeight();
                                if (starty <= endy) {
                                    if (reflex_last) {
                                        for (let y = starty - InteriorConfig.GetWidth() - 1; y < starty; y++) {
                                            let x = startx;
                                            let start_dx = starty - y;
                                            for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                let h = _h + sh;
                                                for (let _dx = GetValidWidth(x, y); _dx > start_dx; _dx--) {
                                                    let dx = _dx * d;
                                                    let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                    if (cblock.Equals(B))
                                                        cblock = InteriorConfig.Base;
                                                    else if (cblock.Equals(L))
                                                        cblock = InteriorConfig.Light;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (cblock.random === 1) {
                                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        data = this.c_rand_data;
                                                    } else if (cblock.random === 2) {
                                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    } else if (cblock.random === 3) {
                                                        if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        let customed = this.setCustomStyle(cblock, c_rand_type);
                                                        id = customed.id;
                                                        data = customed.data;
                                                    }
                                                    if (d === -1)
                                                        this.setTile(x + dx, h, y, id, data, 90, null, true);
                                                    else if (d === 1)
                                                        this.setTile(x + dx, h, y, id, data, 90, false, true);
                                                }
                                            }
                                            this.Cnt[clevel]++;
                                        }
                                    }
                                    for (let y = starty; y < endy; y++) {
                                        let x = startx;
                                        let end_dx = GetValidWidth(x, y);
                                        if (!(last === null) && !reflex_last) {
                                            if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                                if (startx !== last.x) {
                                                    if (Math.abs(last_k) <= 1 || skipKCheck)
                                                        end_dx = Math.min(end_dx, y - starty + 1);
                                                }
                                            }
                                        }
                                        if (!(next === null) && !reflex_next) {
                                            if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                                if (endx !== next.x) {
                                                    if (Math.abs(next_k) <= 1 || skipKCheck)
                                                        end_dx = Math.min(end_dx, endy - y + 1);
                                                }
                                            }
                                        }
                                        for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                            let h = _h + sh;
                                            for (let _dx = end_dx; _dx > 0; _dx--) {
                                                let dx = _dx * d;
                                                let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                if (cblock.Equals(B))
                                                    cblock = InteriorConfig.Base;
                                                else if (cblock.Equals(L))
                                                    cblock = InteriorConfig.Light;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (cblock.random === 1) {
                                                    if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    data = this.c_rand_data;
                                                } else if (cblock.random === 2) {
                                                    data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                } else if (cblock.random === 3) {
                                                    if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    let customed = this.setCustomStyle(cblock, c_rand_type);
                                                    id = customed.id;
                                                    data = customed.data;
                                                }
                                                if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 90, null, true);
                                                else if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 90, false, true);
                                            }
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                    if (reflex_next) {
                                        for (let y = endy; y <= endy + InteriorConfig.GetWidth(); y++) {
                                            let x = startx;
                                            let start_dx = y - endy;
                                            for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                let h = _h + sh;
                                                for (let _dx = GetValidWidth(x, y); _dx > start_dx; _dx--) {
                                                    let dx = _dx * d;
                                                    let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                    if (cblock.Equals(B))
                                                        cblock = InteriorConfig.Base;
                                                    else if (cblock.Equals(L))
                                                        cblock = InteriorConfig.Light;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (cblock.random === 1) {
                                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        data = this.c_rand_data;
                                                    } else if (cblock.random === 2) {
                                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    } else if (cblock.random === 3) {
                                                        if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        let customed = this.setCustomStyle(cblock, c_rand_type);
                                                        id = customed.id;
                                                        data = customed.data;
                                                    }
                                                    if (d === -1)
                                                        this.setTile(x + dx, h, y, id, data, 90, null, true);
                                                    else if (d === 1)
                                                        this.setTile(x + dx, h, y, id, data, 90, false, true);
                                                }
                                            }
                                            this.Cnt[clevel]++;
                                        }
                                    }
                                } else {
                                    if (reflex_last) {
                                        for (let y = starty + InteriorConfig.GetWidth() + 1; y > starty; y--) {
                                            let x = startx;
                                            let start_dx = y - starty;
                                            for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                let h = _h + sh;
                                                for (let _dx = GetValidWidth(x, y); _dx > start_dx; _dx--) {
                                                    let dx = _dx * d;
                                                    let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                    if (cblock.Equals(B))
                                                        cblock = InteriorConfig.Base;
                                                    else if (cblock.Equals(L))
                                                        cblock = InteriorConfig.Light;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (cblock.random === 1) {
                                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        data = this.c_rand_data;
                                                    } else if (cblock.random === 2) {
                                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    } else if (cblock.random === 3) {
                                                        if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        let customed = this.setCustomStyle(cblock, c_rand_type);
                                                        id = customed.id;
                                                        data = customed.data;
                                                    }
                                                    if (d === -1)
                                                        this.setTile(x + dx, h, y, id, data, 270, false, true);
                                                    else if (d === 1)
                                                        this.setTile(x + dx, h, y, id, data, 270, null, true);
                                                }
                                            }
                                            this.Cnt[clevel]++;
                                        }
                                    }
                                    for (let y = starty; y > endy; y--) {
                                        let x = startx;
                                        let end_dx = GetValidWidth(x, y);
                                        if (!(last === null) && !reflex_last) {
                                            if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                                if (startx !== last.x) {
                                                    if (Math.abs(last_k) <= 1 || skipKCheck)
                                                        end_dx = Math.min(end_dx, starty - y + 1);
                                                }
                                            }
                                        }
                                        if (!(next === null) && !reflex_next) {
                                            if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                                if (endx !== next.x) {
                                                    if (Math.abs(next_k) <= 1 || skipKCheck)
                                                        end_dx = Math.min(end_dx, y - endy + 1);
                                                }
                                            }
                                        }
                                        for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                            let h = _h + sh;
                                            for (let _dx = end_dx; _dx > 0; _dx--) {
                                                let dx = _dx * d;
                                                let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                if (cblock.Equals(B))
                                                    cblock = InteriorConfig.Base;
                                                else if (cblock.Equals(L))
                                                    cblock = InteriorConfig.Light;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (cblock.random === 1) {
                                                    if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    data = this.c_rand_data;
                                                } else if (cblock.random === 2) {
                                                    data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                } else if (cblock.random === 3) {
                                                    if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    let customed = this.setCustomStyle(cblock, c_rand_type);
                                                    id = customed.id;
                                                    data = customed.data;
                                                }
                                                if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 270, false, true);
                                                else if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 270, null, true);
                                            }
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                    if (reflex_next) {
                                        for (let y = endy; y >= endy + InteriorConfig.GetWidth(); y--) {
                                            let x = startx;
                                            let start_dx = endy - y;
                                            for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                let h = _h + sh;
                                                for (let _dx = GetValidWidth(x, y); _dx > start_dx; _dx--) {
                                                    let dx = _dx * d;
                                                    let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                    if (cblock.Equals(B))
                                                        cblock = InteriorConfig.Base;
                                                    else if (cblock.Equals(L))
                                                        cblock = InteriorConfig.Light;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (cblock.random === 1) {
                                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        data = this.c_rand_data;
                                                    } else if (cblock.random === 2) {
                                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    } else if (cblock.random === 3) {
                                                        if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        let customed = this.setCustomStyle(cblock, c_rand_type);
                                                        id = customed.id;
                                                        data = customed.data;
                                                    }
                                                    if (d === -1)
                                                        this.setTile(x + dx, h, y, id, data, 270, false, true);
                                                    else if (d === 1)
                                                        this.setTile(x + dx, h, y, id, data, 270, null, true);
                                                }
                                            }
                                            this.Cnt[clevel]++;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    DrawLine_FirstFloor(startx, starty, endx, endy, FirstFloorConfig, nodes, Base) {
                        let firstfloor = FirstFloorConfig.Data;
                        if (FirstFloorConfig.Base === null) FirstFloorConfig.Base = Base;
                        if (startx !== endx) {
                            let k = (endy - starty) / (endx - startx);
                            let b = (endy * startx - starty * endx) / (startx - endx);
                            if (-1 <= k && k < 1) {
                                let d = 0;
                                let mx = Math.round((startx + endx) / 2);
                                let my = Math.round(k * mx + b);
                                if (this.pnpoly2(nodes, new node(mx, my - FirstFloorConfig.GetReduceDelta()))) d = 1;
                                else if (this.pnpoly2(nodes, new node(mx, my + FirstFloorConfig.GetReduceDelta()))) d = -1;
                                if (startx <= endx) {
                                    for (let x = startx; x <= endx; x++) {
                                        let y = Math.round(k * x + b);
                                        for (let h = 0; h < firstfloor.length; h++) {
                                            for (let _dy = 0; _dy < firstfloor[0][0].length; _dy++) {
                                                let dy = _dy * d;
                                                let cblock = firstfloor[h][this.cnt % FirstFloorConfig.GetLength()][_dy];
                                                if (cblock.Equals(B))
                                                    cblock = FirstFloorConfig.Base;
                                                else if (cblock.Equals(W))
                                                    cblock = FirstFloorConfig.Window;
                                                else if (cblock.Equals(U1))
                                                    cblock = FirstFloorConfig.U1;
                                                else if (cblock.Equals(U2))
                                                    cblock = FirstFloorConfig.U2;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === -1)
                                                    this.setTile(x, h + 1, y + dy, id, data, 0, null);
                                                else if (d === 1)
                                                    this.setTile(x, h + 1, y + dy, id, data, 0, true);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                } else {
                                    for (let x = startx; x >= endx; x--) {
                                        let y = Math.round(k * x + b);
                                        for (let h = 0; h < FirstFloorConfig.GetHeight(); h++) {
                                            for (let _dy = 0; _dy < FirstFloorConfig.GetWidth(); _dy++) {
                                                let dy = _dy * d;
                                                let cblock = firstfloor[h][this.cnt % FirstFloorConfig.GetLength()][_dy];
                                                if (cblock.Equals(B))
                                                    cblock = FirstFloorConfig.Base;
                                                else if (cblock.Equals(W))
                                                    cblock = FirstFloorConfig.Window;
                                                else if (cblock.Equals(U1))
                                                    cblock = FirstFloorConfig.U1;
                                                else if (cblock.Equals(U2))
                                                    cblock = FirstFloorConfig.U2;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === -1)
                                                    this.setTile(x, h + 1, y + dy, id, data, 180, true);
                                                else if (d === 1)
                                                    this.setTile(x, h + 1, y + dy, id, data, 180, null);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                }
                            } else {
                                let d = 0;
                                let my = Math.round((starty + endy) / 2);
                                let mx = Math.floor((my - b) / k);
                                if (this.pnpoly2(nodes, new node(mx - FirstFloorConfig.GetReduceDelta(), my))) d = 1;
                                else if (this.pnpoly2(nodes, new node(mx + FirstFloorConfig.GetReduceDelta(), my))) d = -1;
                                if (starty <= endy) {
                                    for (let y = starty; y <= endy; y++) {
                                        let x = Math.floor((y - b) / k);
                                        for (let h = 0; h < FirstFloorConfig.GetHeight(); h++) {
                                            for (let _dx = 0; _dx < FirstFloorConfig.GetWidth(); _dx++) {
                                                let dx = _dx * d;
                                                let cblock = firstfloor[h][this.cnt % FirstFloorConfig.GetLength()][_dx];
                                                if (cblock.Equals(B))
                                                    cblock = FirstFloorConfig.Base;
                                                else if (cblock.Equals(W))
                                                    cblock = FirstFloorConfig.Window;
                                                else if (cblock.Equals(U1))
                                                    cblock = FirstFloorConfig.U1;
                                                else if (cblock.Equals(U2))
                                                    cblock = FirstFloorConfig.U2;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === 1)
                                                    this.setTile(x + dx, h + 1, y, id, data, 90, null);
                                                else if (d === -1)
                                                    this.setTile(x + dx, h + 1, y, id, data, 90, false);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                } else {
                                    for (let y = starty; y >= endy; y--) {
                                        let x = Math.floor((y - b) / k);
                                        for (let h = 0; h < FirstFloorConfig.GetHeight(); h++) {
                                            for (let _dx = 0; _dx < FirstFloorConfig.GetWidth(); _dx++) {
                                                let dx = _dx * d;
                                                let cblock = firstfloor[h][this.cnt % FirstFloorConfig.GetLength()][_dx];
                                                if (cblock.Equals(B))
                                                    cblock = FirstFloorConfig.Base;
                                                else if (cblock.Equals(W))
                                                    cblock = FirstFloorConfig.Window;
                                                else if (cblock.Equals(U1))
                                                    cblock = FirstFloorConfig.U1;
                                                else if (cblock.Equals(U2))
                                                    cblock = FirstFloorConfig.U2;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === 1)
                                                    this.setTile(x + dx, h + 1, y, id, data, 270, false);
                                                else if (d === -1)
                                                    this.setTile(x + dx, h + 1, y, id, data, 270, null);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                }
                            }
                        } else {
                            let d = 0;
                            let my = Math.round((starty + endy) / 2);
                            let mx = startx;
                            if (this.pnpoly2(nodes, new node(mx - FirstFloorConfig.GetReduceDelta(), my))) d = 1;
                            else if (this.pnpoly2(nodes, new node(mx + FirstFloorConfig.GetReduceDelta(), my))) d = -1;
                            if (starty <= endy) {
                                for (let y = starty; y <= endy; y++) {
                                    let x = startx;
                                    for (let h = 0; h < FirstFloorConfig.GetHeight(); h++) {
                                        for (let _dx = 0; _dx < FirstFloorConfig.GetWidth(); _dx++) {
                                            let dx = _dx * d;
                                            let cblock = firstfloor[h][this.cnt % FirstFloorConfig.GetLength()][_dx];
                                            if (cblock.Equals(B))
                                                cblock = FirstFloorConfig.Base;
                                            else if (cblock.Equals(W))
                                                cblock = FirstFloorConfig.Window;
                                            else if (cblock.Equals(U1))
                                                cblock = FirstFloorConfig.U1;
                                            else if (cblock.Equals(U2))
                                                cblock = FirstFloorConfig.U2;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (id === 0) continue;
                                            if (d === 1)
                                                this.setTile(x + dx, h + 1, y, id, data, 90, null);
                                            else if (d === -1)
                                                this.setTile(x + dx, h + 1, y, id, data, 90, false);
                                        }
                                    }
                                    this.cnt++;
                                }
                            } else {
                                for (let y = starty; y >= endy; y--) {
                                    let x = startx;
                                    for (let h = 0; h < FirstFloorConfig.GetHeight(); h++) {
                                        for (let _dx = 0; _dx < FirstFloorConfig.GetWidth(); _dx++) {
                                            let dx = _dx * d;
                                            let cblock = firstfloor[h][this.cnt % FirstFloorConfig.GetLength()][_dx];
                                            if (cblock.Equals(B))
                                                cblock = FirstFloorConfig.Base;
                                            else if (cblock.Equals(W))
                                                cblock = FirstFloorConfig.Window;
                                            else if (cblock.Equals(U1))
                                                cblock = FirstFloorConfig.U1;
                                            else if (cblock.Equals(U2))
                                                cblock = FirstFloorConfig.U2;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (id === 0) continue;
                                            if (d === 1)
                                                this.setTile(x + dx, h + 1, y, id, data, 270, false);
                                            else if (d === -1)
                                                this.setTile(x + dx, h + 1, y, id, data, 270, null);
                                        }
                                    }
                                    this.cnt++;
                                }
                            }
                        }
                    }

                    FillPolygonScanline(nodes, h, id, data) {
                        let minx = inf, miny = inf, maxx = -inf, maxy = -inf, n = nodes.length;
                        for (let node of nodes) {
                            if (node.x === undef || node.y === undef) continue;
                            minx = Math.min(node.x, minx);
                            miny = Math.min(node.y, miny);
                            maxx = Math.max(node.x, maxx);
                            maxy = Math.max(node.y, maxy);
                        }
                        for (let x = minx; x <= maxx; x++) {
                            for (let y = miny; y <= maxy; y++) {
                                if (this.pnpoly2(nodes, new node(x, y)))
                                    this.setTile(x, h, y, id, data);
                            }
                        }
                    }

                    // Pnpoly2: 增加了对套娃曲线判定的支持
                    pnpoly2(nodes, test) {
                        let c = false;
                        let n = nodes.length;
                        for (let i = 0; i < n; i++) {
                            //let j = (i === 0) ? (n - 1) : (i - 1);
                            let j;
                            if (i === 0 || nodes[i - 1].x === undef || nodes[i - 1].y === undef) {
                                for (j = i + 1; j < nodes.length; j++) {
                                    if (nodes[j].x === undef || nodes[j].y === undef) {
                                        break;
                                    }
                                }
                                j--;
                            } else {
                                j = i - 1;
                            }
                            if (nodes[i].x === undef || nodes[j].x === undef) continue;
                            if (((nodes[i].y > test.y) !== (nodes[j].y > test.y)) && (test.x < (nodes[j].x - nodes[i].x) * (test.y - nodes[i].y) / (nodes[j].y - nodes[i].y) + nodes[i].x)) {
                                c = !c;
                            }
                        }
                        return c;
                    }
                    // Pnpoly3: 专为Roof建造过程中的判定三角形准备，应用于普通多边形（非套娃曲线），并且边缘部分将会被判定为true
                    pnpoly3(nodes, test) {
                        let c = false;
                        let n = nodes.length;
                        for (let i = 0; i < n; i++) {
                            let j = (i === 0) ? (n - 1) : (i - 1);
                            if (nodes[i].x === test.x && test.x === nodes[j].x && Math.min(nodes[i].y, nodes[j].y) <= test.y && test.y <= Math.max(nodes[i].y, nodes[j].y)
                                || nodes[i].y === test.y && test.y === nodes[j].y && Math.min(nodes[i].x, nodes[j].x) <= test.x && test.x <= Math.max(nodes[i].x, nodes[j].x))
                                return true;
                            if (((nodes[i].y > test.y) !== (nodes[j].y > test.y)) && (test.x < (nodes[j].x - nodes[i].x) * (test.y - nodes[i].y) / (nodes[j].y - nodes[i].y) + nodes[i].x)) {
                                c = !c;
                            }
                        }
                        return c;
                    }
                    // Pnpoly4: 在Pnpoly2的基础上，边缘部分将会被判定为false
                    pnpoly4(nodes, test) {
                        let c = false;
                        let n = nodes.length;
                        for (let i = 0; i < n; i++) {
                            let j;
                            if (i === 0 || nodes[i - 1].x === undef || nodes[i - 1].y === undef) {
                                for (j = i + 1; j < nodes.length; j++) {
                                    if (nodes[j].x === undef || nodes[j].y === undef) {
                                        break;
                                    }
                                }
                                j--;
                            } else {
                                j = i - 1;
                            }
                            if (nodes[i].x === undef || nodes[j].x === undef) continue;
                            if (nodes[i].x === test.x && test.x === nodes[j].x && Math.min(nodes[i].y, nodes[j].y) <= test.y && test.y <= Math.max(nodes[i].y, nodes[j].y)
                                || nodes[i].y === test.y && test.y === nodes[j].y && Math.min(nodes[i].x, nodes[j].x) <= test.x && test.x <= Math.max(nodes[i].x, nodes[j].x))
                                return false;
                            if (((nodes[i].y > test.y) !== (nodes[j].y > test.y)) && (test.x < (nodes[j].x - nodes[i].x) * (test.y - nodes[i].y) / (nodes[j].y - nodes[i].y) + nodes[i].x)) {
                                c = !c;
                            }
                        }
                        return c;
                    }

                    IsSmallBuilding(nodes) {
                        const small_threshold = 50;
                        let minx = inf, miny = inf, maxx = -inf, maxy = -inf, n = nodes.length;
                        for (let node of nodes) {
                            if (this.IsUndefined(node)) continue;
                            minx = Math.min(node.x, minx);
                            miny = Math.min(node.y, miny);
                            maxx = Math.max(node.x, maxx);
                            maxy = Math.max(node.y, maxy);
                        }
                        if (maxx - minx < small_threshold && maxy - miny < small_threshold)
                            return true;
                        else
                            return false;
                    }

                    IsMiniBuilding(nodes) {
                        const mini_threshold = 15;
                        let minx = inf, miny = inf, maxx = -inf, maxy = -inf, n = nodes.length;
                        for (let node of nodes) {
                            if (this.IsUndefined(node)) continue;
                            minx = Math.min(node.x, minx);
                            miny = Math.min(node.y, miny);
                            maxx = Math.max(node.x, maxx);
                            maxy = Math.max(node.y, maxy);
                        }
                        if (maxx - minx < mini_threshold && maxy - miny < mini_threshold)
                            return true;
                        else
                            return false;
                    }
                    IsUndefined(node) {
                        return node.x === undef && node.y === undef;
                    }
                    IsStair(id) {
                        const stairs = [53, 134, 135, 136, 163, 164, 108, 109, 114, 128, 180, 156, 203];
                        for (let v of stairs) {
                            if (id === v) return true;
                        }
                        return false;
                    }
                    ClearCnt() {
                        for (let i = 0; i < this.Cnt.length; i++)
                            this.Cnt[i] = 0;
                    }

                    setCustomStyle(origin, type) {
                        let id = origin.id, idata = origin.data;
                        //Style
                        if (id === 53 || id === 136) {    //Stair
                            switch (type) {
                                case 0: //Oak
                                    id = 53;
                                    break;
                                case 1: //Spruce
                                    id = 134;
                                    break;
                                case 2: //Birch
                                    id = 135;
                                    break;
                                case 3: //Jungle
                                    id = 136;
                                    break;
                                case 4: //Acacia
                                    id = 163;
                                    break;
                                case 5: //Dark oak
                                    id = 164;
                                    break;
                                case 6: //Sand
                                    id = 128;
                                    break;
                                case 7: //Red sand
                                    id = 180;
                                    break;
                                case 8: //Purpur
                                    id = 203;
                                    break;
                                case 9: //Quartz
                                    id = 156;
                                    break;
                                default:
                                    print("Unsupported format");
                                    break;
                            }
                        } else if (id === 67) {  //Cobble stair
                            switch (type) {
                                case 6: //Sand
                                    id = 128;
                                    break;
                                case 7: //Red sand
                                    id = 180;
                                    break;
                                case 8: //Purpur
                                    id = 203;
                                    break;
                                case 9: //Quartz
                                    id = 156;
                                    break;
                            }
                        } else if (id === 5) {   //Plank
                            switch (type) {
                                case 0: //Oak
                                    idata = 0;
                                    break;
                                case 1: //Spruce
                                    idata = 1;
                                    break;
                                case 2: //Birch
                                    idata = 2;
                                    break;
                                case 3: //Jungle
                                    idata = 3;
                                    break;
                                case 4: //Acacia
                                    idata = 4;
                                    break;
                                case 5: //Dark oak
                                    idata = 5;
                                    break;
                                case 6: //Sand
                                    id = 24;
                                    idata = 2;
                                    break;
                                case 7: //Red sand
                                    id = 179;
                                    idata = 2;
                                    break;
                                case 8: //Purpur
                                    id = 201;
                                    idata = 0;
                                    break;
                                case 9: //Quartz
                                    id = 155;
                                    idata = 0;
                                    break;
                                default:
                                    print("Unsupported format");
                                    break;
                            }
                        } else if (id === 17) {  //Log
                            switch (type) {
                                case 0: //Oak
                                    idata = 0;
                                    break;
                                case 1: //Spruce
                                    idata = 1;
                                    break;
                                case 2: //Birch
                                    idata = 2;
                                    break;
                                case 3: //Jungle
                                    idata = 3;
                                    break;
                                case 4: //Acacia
                                    id = 162;
                                    idata = 0;
                                    break;
                                case 5: //Dark oak
                                    id = 162;
                                    idata = 1;
                                    break;
                                case 6: //Sand
                                    id = 24;
                                    idata = 0;
                                    break;
                                case 7: //Red sand
                                    id = 179;
                                    idata = 0;
                                    break;
                                case 8: //Purpur
                                    id = 201;
                                    idata = 2;
                                    break;
                                case 9: //Quartz
                                    id = 155;
                                    idata = 2;
                                    break;
                                default:
                                    print("Unsupported format");
                                    break;
                            }
                        } else if (id === 4) {   //Cobblestone
                            switch (type) {
                                case 6: //Sand
                                    id = 24;
                                    break;
                                case 7: //Red sand
                                    id = 179;
                                    break;
                                case 8: //Purpur
                                    id = 201;
                                    break;
                                case 9: //Quartz
                                    id = 155;
                                    break;
                            }
                        } else if (id === 64 || id === 195) { //Door
                            switch (type) {
                                case 0: //Oak
                                    id = 64;
                                    break;
                                case 1: //Spruce
                                    id = 193;
                                    break;
                                case 2: //Birch
                                    id = 194;
                                    break;
                                case 3: //Jungle
                                    id = 195;
                                    break;
                                case 4: //Acacia
                                    id = 196;
                                    break;
                                case 5: //Dark oak
                                    id = 197;
                                    break;
                                case 9: //Quartz
                                    id = 194;
                                    break;
                                default:
                                    id = 64;
                                    break;
                            }
                        } else if (id === 85) {  //Fence
                            switch (type) {
                                case 0: //Oak
                                    idata = 0;
                                    break;
                                case 1: //Spruce
                                    idata = 1;
                                    break;
                                case 2: //Birch
                                    idata = 2;
                                    break;
                                case 3: //Jungle
                                    idata = 3;
                                    break;
                                case 4: //Acacia
                                    idata = 4;
                                    break;
                                case 5: //Dark oak
                                    idata = 5;
                                    break;
                                case 9: //Quartz
                                    idata = 2;
                                    break;
                                default:
                                    idata = 0;
                                    break;
                            }
                        } else if (id === 198) { //Grass walk
                            switch (type) {
                                case 6: //Sand
                                    id = 24; idata = 0;
                                    break;
                                case 7: //Red sand
                                    id = 179; idata = 0;
                                    break;
                                case 8: //Purpur
                                    id = 121; idata = 0;
                                    break;
                                case 9: //Quartz
                                    id = 155; idata = 0;
                                    break;
                            }
                        } else if (id === 2) {   //Grass block
                            switch (type) {
                                case 6: //Sand
                                    id = 3;
                                    break;
                                case 7: //Red sand
                                    id = 3;
                                    break;
                                case 8: //Purpur
                                    id = 206;
                                    break;
                                case 9: //Quartz
                                    id = 155;
                                    break;
                            }
                        }
                        let ret = new myBlock(id, idata);
                        return ret;
                    }

                    RotateData(id, data, rot) {
                        //Rotate, 旋转, 方向逆时针
                        let idata = data;
                        if (this.IsStair(id)) {  //Stair
                            switch (rot) {
                                case 0:
                                    break;
                                case 90:
                                    switch (idata) {
                                        case 1: idata = 2; break;
                                        case 2: idata = 0; break;
                                        case 0: idata = 3; break;
                                        case 3: idata = 1; break;
                                        case 5: idata = 6; break;
                                        case 6: idata = 4; break;
                                        case 4: idata = 7; break;
                                        case 7: idata = 5; break;
                                    }
                                    break;
                                case 180:
                                    switch (idata) {
                                        case 1: idata = 0; break;
                                        case 2: idata = 3; break;
                                        case 0: idata = 1; break;
                                        case 3: idata = 2; break;
                                        case 5: idata = 4; break;
                                        case 4: idata = 5; break;
                                        case 6: idata = 7; break;
                                        case 7: idata = 6; break;
                                    }
                                    break;
                                case 270:
                                    switch (idata) {
                                        case 1: idata = 3; break;
                                        case 2: idata = 1; break;
                                        case 0: idata = 2; break;
                                        case 3: idata = 0; break;
                                        case 5: idata = 7; break;
                                        case 6: idata = 5; break;
                                        case 4: idata = 6; break;
                                        case 7: idata = 4; break;
                                    }
                                    break;
                                default:
                                    print("Unsupported rotate angle");
                                    break;
                            }
                        } else if (id === 68 || id === 61 || id === 54 || id === 65 || id === 77 || id === 143) { //Wallsign, Furnace, Chest, Ladder, Stone Button, Wood Button
                            switch (rot) {
                                case 0:
                                    break;
                                case 90:
                                    switch (idata) {
                                        case 5: idata = 2; break;
                                        case 2: idata = 4; break;
                                        case 4: idata = 3; break;
                                        case 3: idata = 5; break;
                                    }
                                    break;
                                case 180:
                                    switch (idata) {
                                        case 5: idata = 4; break;
                                        case 2: idata = 3; break;
                                        case 4: idata = 5; break;
                                        case 3: idata = 2; break;
                                    }
                                    break;
                                case 270:
                                    switch (idata) {
                                        case 5: idata = 3; break;
                                        case 2: idata = 5; break;
                                        case 4: idata = 2; break;
                                        case 3: idata = 4; break;
                                    }
                                    break;
                                default:
                                    print("Unsupported rotate angle");
                                    break;
                            }
                        } else if (id === 50) {  //Torch
                            switch (rot) {
                                case 0:
                                    break;
                                case 90:
                                    switch (idata) {
                                        case 1: idata = 4; break;
                                        case 4: idata = 2; break;
                                        case 2: idata = 3; break;
                                        case 3: idata = 1; break;
                                    }
                                    break;
                                case 180:
                                    switch (idata) {
                                        case 1: idata = 2; break;
                                        case 4: idata = 3; break;
                                        case 2: idata = 1; break;
                                        case 3: idata = 4; break;
                                    }
                                    break;
                                case 270:
                                    switch (idata) {
                                        case 1: idata = 3; break;
                                        case 4: idata = 1; break;
                                        case 2: idata = 4; break;
                                        case 3: idata = 2; break;
                                    }
                                    break;
                            }
                        } else if (id === 64 || id === 71 || id === 193 || id === 194 || id === 195 || id === 196 || id === 197 || id === 199) {    //Door, Item Frame
                            switch (rot) {
                                case 0:
                                    break;
                                case 90:
                                    switch (idata) {
                                        case 2: idata = 1; break;
                                        case 1: idata = 0; break;
                                        case 0: idata = 3; break;
                                        case 3: idata = 2; break;
                                        case 7: idata = 6; break;
                                        case 6: idata = 5; break;
                                        case 5: idata = 4; break;
                                        case 4: idata = 7; break;
                                    }
                                    break;
                                case 180:
                                    switch (idata) {
                                        case 2: idata = 0; break;
                                        case 1: idata = 3; break;
                                        case 0: idata = 2; break;
                                        case 3: idata = 1; break;
                                        case 7: idata = 5; break;
                                        case 5: idata = 7; break;
                                        case 6: idata = 4; break;
                                        case 4: idata = 6; break;
                                    }
                                    break;
                                case 270:
                                    switch (idata) {
                                        case 2: idata = 3; break;
                                        case 1: idata = 2; break;
                                        case 0: idata = 1; break;
                                        case 3: idata = 0; break;
                                        case 4: idata = 5; break;
                                        case 5: idata = 6; break;
                                        case 6: idata = 7; break;
                                        case 7: idata = 4; break;
                                    }
                                    break;
                            }
                        }
                        return idata;
                    }

                    FlipData(id, data, Xaxis) {
                        //Flip, 翻转, Xasix为true则以X轴为轴翻转，false则以Y轴为轴翻转
                        let idata = data;
                        if (this.IsStair(id)) {  //Stair
                            switch (Xaxis) {
                                case true:
                                    switch (idata) {
                                        case 0:
                                        case 1:
                                        case 4:
                                        case 5:
                                            break;  //不变
                                        case 2:
                                            idata = 3;
                                            break;
                                        case 3:
                                            idata = 2;
                                            break;
                                        case 6:
                                            idata = 7;
                                            break;
                                        case 7:
                                            idata = 6;
                                            break;
                                    }
                                    break;
                                case false:
                                    switch (idata) {
                                        case 2: case 3: case 6: case 7: break;
                                        case 0:
                                            idata = 1;
                                            break;
                                        case 1:
                                            idata = 0;
                                            break;
                                        case 4:
                                            idata = 5;
                                            break;
                                        case 5:
                                            idata = 4;
                                            break;
                                    }
                                    break;
                            }
                        } else if (id === 68 || id === 61 || id === 54 || id === 65 || id === 77 || id === 143) { //Wallsign, Furnace, Chest, Ladder, Stone Button, Wood Button
                            switch (Xaxis) {
                                case true:
                                    switch (idata) {
                                        case 4:
                                        case 5:
                                            break;
                                        case 2:
                                            idata = 3;
                                            break;
                                        case 3:
                                            idata = 2;
                                            break;
                                    }
                                    break;
                                case false:
                                    switch (idata) {
                                        case 2:
                                        case 3:
                                            break;
                                        case 4:
                                            idata = 5;
                                            break;
                                        case 5:
                                            idata = 4;
                                            break;
                                    }
                                    break;
                            }
                        } else if (id === 50) {  //Torch
                            print("Not implement warning: Torch flip");
                        } else if (id === 64 || id === 71 || id === 193 || id === 194 || id === 195 || id === 196 || id === 197 || id === 199) {    //Door, Item Frame
                            switch (Xaxis) {
                                case true:
                                    switch (data) {
                                        case 0:
                                        case 2:
                                        case 5:
                                        case 7:
                                            break;
                                        case 1:
                                            idata = 3;
                                            break;
                                        case 3:
                                            idata = 1;
                                            break;
                                        case 4: idata = 6; break;
                                        case 6: idata = 4; break;
                                    }
                                    break;
                                case false:
                                    switch (data) {
                                        case 1:
                                        case 3:
                                        case 4:
                                        case 6:
                                            break;
                                        case 0:
                                            idata = 2;
                                            break;
                                        case 2:
                                            idata = 0;
                                            break;
                                        case 5:
                                            idata = 7;
                                            break;
                                        case 7:
                                            idata = 5;
                                            break;
                                    }
                                    break;
                            }
                        }
                        return idata;
                    }

                    block_list = {}

                    setTile(x, y, z, id, data, rot = 0, Flip_Xaxis = null, doNotReplace = false) {
                        if (doNotReplace) {
                            let _block = this.block_list[new Vector3(x, y, z)];
                            if (_block != undefined) return;
                        }
                        if (rot !== 0) data = this.RotateData(id, data, rot);
                        if (Flip_Xaxis !== null) data = this.FlipData(id, data, Flip_Xaxis);
                        data = this.FlipData(id, data, true);

                        let blockStr = this.IDtoString(id);

                        setblock(x, y + this.base_y, z, blockStr, data);    //调用NC的setBlock

                        this.block_list[new Vector3(x, y, z)] = new Block(id, data);
                    }

                    setBaseY(y) {
                        this.base_y = y;
                    }
                    IDtoString(id) {
                        let tn;
                        switch (id) {
                            case 0:
                                tn = "air";
                                break;
                            case 1:
                                tn = "stone";
                                break;
                            case 2:
                                tn = "grass"; break;
                            case 3:
                                tn = "dirt"; break;
                            case 4:
                                tn = "cobblestone"; break;
                            case 5:
                                tn = "planks";
                                break;
                            case 6:
                                tn = "sapling";
                                break;
                            case 7:
                                tn = "bedrock";
                                break;
                            case 8:
                                tn = "flowing_water";
                                break;
                            case 9:
                                tn = "water";
                                break;
                            case 10:
                                tn = "flowing_lava"; break;
                            case 11:
                                tn = "lava"; break;
                            case 12:
                                tn = "sand";
                                break;
                            case 13:
                                tn = "gravel"; break;
                            case 14:
                                tn = "gold_ore"; break;
                            case 15:
                                tn = "iron_ore"; break;
                            case 16:
                                tn = "coal_ore"; break;
                            case 17:
                                tn = "log";
                                break;
                            case 18:
                                tn = "leaves";
                                break;
                            case 19:
                                tn = "sponge"; break;
                            case 20:
                                tn = "glass";
                                break;
                            case 21:
                                tn = "lapis_ore";
                                break;
                            case 22:
                                tn = "lapis_block";
                                break;
                            case 23:
                                tn = "dispenser";
                                break;
                            case 24:
                                tn = "sandstone";
                                break;
                            case 25:
                                tn = "noteblock"; break;
                            case 26:
                                tn = "bed";
                                break;
                            case 27:
                                tn = "golden_rail";
                                break;
                            case 28:
                                tn = "detector_rail";
                                break;
                            case 29:
                                tn = "sticky_piston";
                                break;
                            case 30:
                                tn = "web";
                                break;
                            case 31:
                                tn = "tallgrass";
                                break;
                            case 32:
                                tn = "deadbush";
                                break;
                            case 33:
                                tn = "piston";
                                break;
                            case 34:
                                tn = "piston";
                                break;
                            case 35:
                                tn = "wool";
                                break;
                            case 37:
                                tn = "yellow_flower";
                                break;
                            case 38:
                                tn = "red_flower";
                                break;
                            case 39:
                                tn = "brown_mushroom";
                                break;
                            case 40:
                                tn = "red_mushroom";
                                break;
                            case 41:
                                tn = "gold_block";
                                break;
                            case 42:
                                tn = "iron_block";
                                break;
                            case 43:
                                tn = "double_stone_slab";
                                break;
                            case 44:
                                tn = "stone_slab";
                                break;
                            case 45:
                                tn = "brick_block";
                                break;
                            case 46:
                                tn = "tnt";
                                break;
                            case 47:
                                tn = "bookshelf";
                                break;
                            case 48:
                                tn = "mossy_cobblestone";
                                break;
                            case 49:
                                tn = "obsidian";
                                break;
                            case 50:
                                tn = "torch";
                                break;
                            case 51:
                                tn = "fire";
                                break;
                            case 52:
                                tn = "mob_spawner";
                                break;
                            case 53:
                                tn = "oak_stairs";
                                break;
                            case 54:
                                tn = "chest";
                                break;
                            case 55:
                                tn = "redstone_wire";
                                break;
                            case 56:
                                tn = "diamond_ore";
                                break;
                            case 57:
                                tn = "diamond_block";
                                break;
                            case 58:
                                tn = "crafting_table";
                                break;
                            case 59:
                                tn = "wheat";
                                break;
                            case 60:
                                tn = "farmland";
                                break;
                            case 61:
                                tn = "furnace";
                                break;
                            case 62:
                                tn = "lit_furnace";
                                break;
                            case 63:
                                tn = "standing_sign";
                                break;
                            case 64:
                                tn = "wooden_door";
                                break;
                            case 65:
                                tn = "ladder";
                                break;
                            case 66:
                                tn = "rail";
                                break;
                            case 67:
                                tn = "stone_stairs";
                                break;
                            case 68:
                                tn = "wall_sign";
                                break;
                            case 69:
                                tn = "lever";
                                break;
                            case 70:
                                tn = "stone_pressure_plate";
                                break;
                            case 71:
                                tn = "iron_door";
                                break;
                            case 72:
                                tn = "wooden_pressure_plate";
                                break;
                            case 73:
                                tn = "redstone_ore";
                                break;
                            case 74:
                                tn = "lit_redstone_ore";
                                break;
                            case 75:
                                tn = "unlit_redstone_torch";
                                break;
                            case 76:
                                tn = "redstone_torch";
                                break;
                            case 77:
                                tn = "stone_button";
                                break;
                            case 78:
                                tn = "snow_layer";
                                break;
                            case 79:
                                tn = "ice";
                                break;
                            case 80:
                                tn = "snow";
                                break;
                            case 81:
                                tn = "cactus";
                                break;
                            case 82:
                                tn = "clay";
                                break;
                            case 83:
                                tn = "reeds";
                                break;
                            case 84:
                                tn = "jukebox";
                                break;
                            case 85:
                                tn = "fence";
                                break;
                            case 86:
                                tn = "pumpkin";
                                break;
                            case 87:
                                tn = "netherrack";
                                break;
                            case 88:
                                tn = "soul_sand";
                                break;
                            case 89:
                                tn = "glowstone";
                                break;
                            case 90:
                                tn = "portal";
                                break;
                            case 91:
                                tn = "lit_pumpkin";
                                break;
                            case 92:
                                tn = "cake";
                                break;
                            case 93:
                                tn = "unpowered_repeater";
                                break;
                            case 94:
                                tn = "powered_repeater";
                                break;
                            case 96:
                                tn = "trapdoor";
                                break;
                            case 97:
                                tn = "monster_egg";
                                break;
                            case 98:
                                tn = "stonebrick";
                                break;
                            case 99:
                                tn = "brown_mushroom_block";
                                break;
                            case 100:
                                tn = "red_mushroom_block";
                                break;
                            case 101:
                                tn = "iron_bars";
                                break;
                            case 102:
                                //tn = "glass_pane";
                                tn = "glass";
                                break;
                            case 103:
                                tn = "melon_block";
                                break;
                            case 104:
                                tn = "pumpkin_stem";
                                break;
                            case 105:
                                tn = "melon_stem";
                                break;
                            case 106:
                                tn = "vine";
                                break;
                            case 107:
                                tn = "fence_gate";
                                break;
                            case 108:
                                tn = "brick_stairs";
                                break;
                            case 109:
                                tn = "stone_brick_stairs";
                                break;
                            case 110:
                                tn = "mycelium";
                                break;
                            case 111:
                                tn = "waterlily";
                                break;
                            case 112:
                                tn = "nether_brick";
                                break;
                            case 113:
                                tn = "nether_brick_fence";
                                break;
                            case 114:
                                tn = "nether_brick_stairs";
                                break;
                            case 115:
                                tn = "nether_wart";
                                break;
                            case 116:
                                tn = "enchanting_table";
                                break;
                            case 117:
                                tn = "brewing_stand";
                                break;
                            case 118:
                                tn = "cauldron";
                                break;
                            case 119:
                                tn = "end_portal";
                                break;
                            case 120:
                                tn = "end_portal_frame";
                                break;
                            case 121:
                                tn = "end_stone";
                                break;
                            case 122:
                                tn = "dragon_egg";
                                break;
                            case 123:
                                tn = "redstone_lamp";
                                break;
                            case 124:
                                tn = "lit_redstone_lamp";
                                break;
                            case 125:
                                tn = "dropper";
                                break;
                            case 126:
                                tn = "activator_rail";
                                break;
                            case 127:
                                tn = "cocoa";
                                break;
                            case 128:
                                tn = "sandstone_stairs";
                                break;
                            case 129:
                                tn = "emerald_ore";
                                break;
                            case 130:
                                tn = "ender_chest";
                                break;
                            case 131:
                                tn = "tripwire_hook";
                                break;
                            case 132:
                                tn = "trip_wire";
                                break;
                            case 133:
                                tn = "emerald_block";
                                break;
                            case 134:
                                tn = "spruce_stairs";
                                break;
                            case 135:
                                tn = "birch_stairs";
                                break;
                            case 136:
                                tn = "jungle_stairs";
                                break;
                            case 137:
                                tn = "command_block";
                                break;
                            case 138:
                                tn = "beacon";
                                break;
                            case 139:
                                tn = "cobblestone_wall";
                                break;
                            case 140:
                                tn = "flower_pot";
                                break;
                            case 141:
                                tn = "carrots";
                                break;
                            case 142:
                                tn = "potatoes";
                                break;
                            case 143:
                                tn = "wooden_button";
                                break;
                            case 144:
                                tn = "skull";
                                break;
                            case 145:
                                tn = "anvil";
                                break;
                            case 146:
                                tn = "trapped_chest";
                                break;
                            case 147:
                                tn = "light_weighted_pressure_plate";
                                break;
                            case 148:
                                tn = "heavy_weighted_pressure_plate";
                                break;
                            case 149:
                                tn = "unpowered_comparator";
                                break;
                            case 150:
                                tn = "powered_comparator";
                                break;
                            case 151:
                                tn = "daylight_detector";
                                break;
                            case 152:
                                tn = "redstone_block";
                                break;
                            case 153:
                                tn = "quartz_ore";
                                break;
                            case 154:
                                tn = "hopper";
                                break;
                            case 155:
                                tn = "quartz_block";
                                break;
                            case 156:
                                tn = "quartz_stairs";
                                break;
                            case 157:
                                tn = "double_wooden_slab";
                                break;
                            case 158:
                                tn = "wooden_slab";
                                break;
                            case 159:
                                tn = "stained_hardened_clay";
                                break;
                            case 160:
                                //tn = "stained_glass_pane";
                                tn = "stained_glass";
                                break;
                            case 161:
                                tn = "leaves2";
                                break;
                            case 162:
                                tn = "log2";
                                break;
                            case 163:
                                tn = "acacia_stairs";
                                break;
                            case 164:
                                tn = "dark_oak_stairs";
                                break;
                            case 165:
                                tn = "slime";
                                break;
                            case 167:
                                tn = "iron_trapdoor";
                                break;
                            case 168:
                                tn = "prismarine";
                                break;
                            case 169:
                                tn = "sealantern";
                                break;
                            case 170:
                                tn = "hay_block";
                                break;
                            case 171:
                                tn = "carpet";
                                break;
                            case 172:
                                tn = "hardened_clay";
                                break;
                            case 173:
                                tn = "coal_block";
                                break;
                            case 174:
                                tn = "packed_ice";
                                break;
                            case 175:
                                tn = "double_plant";
                                break;
                            case 176:
                                tn = "standing_banner";
                                break;
                            case 177:
                                tn = "wall_banner";
                                break;
                            case 178:
                                tn = "daylight_detector_inverted";
                                break;
                            case 179:
                                tn = "red_sandstone";
                                break;
                            case 180:
                                tn = "red_sandstone_stairs";
                                break;
                            case 181:
                                tn = "double_stone_slab2";
                                break;
                            case 182:
                                tn = "stone_slab2";
                                break;
                            case 183:
                                tn = "spruce_fence_gate";
                                break;
                            case 184:
                                tn = "birch_fence_gate";
                                break;
                            case 185:
                                tn = "jungle_fence_gate";
                                break;
                            case 186:
                                tn = "dark_oak_fence_gate";
                                break;
                            case 187:
                                tn = "acacia_fence_gate";
                                break;
                            case 188:
                                tn = "repeating_command_block";
                                break;
                            case 189:
                                tn = "chain_command_block";
                                break;
                            case 190:
                                //tn = "hard_glass_pane";
                                tn = "hard_glass";
                                break;
                            case 191:
                                //tn = "hard_stained_glass_pane";
                                tn = "hard_stained_glass";
                                break;
                            case 192:
                                tn = "chemical_heat";
                                break;
                            case 193:
                                tn = "spruce_door";
                                break;
                            case 194:
                                tn = "birch_door";
                                break;
                            case 195:
                                tn = "jungle_door";
                                break;
                            case 196:
                                tn = "acacia_door";
                                break;
                            case 197:
                                tn = "dark_oak_door";
                                break;
                            case 198:
                                tn = "grass_path";
                                break;
                            case 199:
                                tn = "frame";
                                break;
                            case 200:
                                tn = "chorus_flower";
                                break;
                            case 201:
                                tn = "purpur_block";
                                break;
                            case 202:
                                tn = "colored_torch_rg";
                                break;
                            case 203:
                                tn = "purpur_stairs";
                                break;
                            case 204:
                                tn = "colored_torch_bp";
                                break;
                            case 205:
                                tn = "undyed_shulker_box";
                                break;
                            case 206:
                                tn = "end_bricks";
                                break;
                            case 207:
                                tn = "frosted_ice";
                                break;
                            case 208:
                                tn = "end_rod";
                                break;
                            case 209:
                                tn = "end_gateway";
                                break;
                            case 213:
                                tn = "magma";
                                break;
                            case 214:
                                tn = "nether_wart_block";
                                break;
                            case 215:
                                tn = "red_nether_brick";
                                break;
                            case 216:
                                tn = "bone_block";
                                break;
                            case 218:
                                tn = "shulker_box";
                                break;
                            case 220:
                                tn = "white_glazed_terracotta";
                                break;
                            case 221:
                                tn = "orange_glazed_terracotta";
                                break;
                            case 222:
                                tn = "magenta_glazed_terracotta";
                                break;
                            case 223:
                                tn = "light_blue_glazed_terracotta";
                                break;
                            case 224:
                                tn = "yellow_glazed_terracotta";
                                break;
                            case 225:
                                tn = "lime_glazed_terracotta";
                                break;
                            case 226:
                                tn = "pink_glazed_terracotta";
                                break;
                            case 227:
                                tn = "gray_glazed_terracotta";
                                break;
                            case 228:
                                tn = "silver_glazed_terracotta";
                                break;
                            case 229:
                                tn = "cyan_glazed_terracotta";
                                break;
                            case 219:
                                tn = "purple_glazed_terracotta";
                                break;
                            case 231:
                                tn = "blue_glazed_terracotta";
                                break;
                            case 232:
                                tn = "brown_glazed_terracotta";
                                break;
                            case 233:
                                tn = "green_glazed_terracotta";
                                break;
                            case 234:
                                tn = "red_glazed_terracotta";
                                break;
                            case 235:
                                tn = "black_glazed_terracotta";
                                break;
                            case 236:
                                tn = "concrete";
                                break;
                            case 237:
                                tn = "concretepowder";
                                break;
                            case 238:
                                tn = "chemistry_table";
                                break;
                            case 239:
                                tn = "underwater_torch";
                                break;
                            case 240:
                                tn = "chorus_plant";
                                break;
                            case 241:
                                tn = "stained_glass";
                                break;
                            case 243:
                                tn = "podzol";
                                break;
                            case 244:
                                tn = "beetroot";
                                break;
                            case 245:
                                tn = "stonecutter";
                                break;
                            case 246:
                                tn = "glowingobsidian";
                                break;
                            case 247:
                                tn = "netherreactor";
                                break;
                            case 251:
                                tn = "observer";
                                break;
                            case 252:
                                tn = "structure_block";
                                break;
                            case 253:
                                tn = "hard_glass";
                                break;
                            case 254:
                                tn = "hard_stained_glass";
                                break;
                            case 256:
                                return null;
                            case 257:
                                tn = "prismarine_stairs";
                                break;
                            case 258:
                                tn = "dark_prismarine_stairs";
                                break;
                            case 259:
                                tn = "prismarine_bricks_stairs";
                                break;
                            case 260:
                                tn = "stripped_spruce_log";
                                break;
                            case 261:
                                tn = "stripped_birch_log";
                                break;
                            case 262:
                                tn = "stripped_jungle_log";
                                break;
                            case 263:
                                tn = "stripped_acacia_log";
                                break;
                            case 264:
                                tn = "stripped_dark_oak_log";
                                break;
                            case 265:
                                tn = "stripped_oak_log";
                                break;
                            case 266:
                                tn = "blue_ice";
                                break;
                            case 417:
                                tn = "stone_slab3";
                                break;
                            case 421:
                                tn = "stone_slab4";
                                break;
                            case 463:
                                tn = "lantern";
                                break;
                            default:
                                print("Unknown ID! ID=" + id);
                                return null;
                        }
                        tn = "minecraft:" + tn;
                        return tn;
                    }
                }
                function print(str) {
                    logger.log("warning", str);
                }

                /*==============================================================================================================*/

                let osmCity = new OSMCity();
                let coordinates = [];
                for (const position of this.positionArray) {
                    setblock(position.coordinate.x, position.coordinate.y + 1, position.coordinate.z, "minecraft:wool", 14)
                    coordinates.push(new myCoordinate(position.coordinate.x, position.coordinate.z))
                    osmCity.setBaseY(position.coordinate.y)
                }
                osmCity.Generate(coordinates);

                logger.log("info", "Block generating by client finished.")
                return blockInstructions
            },
            function () {
                this.positionArray = []
                this.blockTypeArray = []
                this.directionArray = []
            },
            function () { }
        )
    )
})();
