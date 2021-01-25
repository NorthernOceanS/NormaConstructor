import system from '../system.js';
import '../plugin/index.js';
import { UserSystem } from '../framework.js';


import { Coordinate, Position, BlockType, Direction, Block } from '../constructor';
import { utils } from '../utils'

platform.use(system)
const platform = {
    use: function (system) {
        var clientSystem = client.registerSystem(0, 0);
        this.init(clientSystem, system)
    },
    init: function (clientSystem, system) {
        let userSystem = null;
        let coordinatePlayerLookingAt = undefined

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
                if (colorMap.get(level).num >= colorMap.get(userSystem.session["__logLevel"]).num)
                    this.displayChat(colorMap.get(level).color + "[" + level + "]" + message)
            },
            logObject: function (level, object) {
                this.log(level, JSON.stringify(object, null, '    '))
            }
        }




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

                playerID = utils.misc.generatePlayerIDFromUniqueID(eventData.data.player.__unique_id__)
				userSystem = new UserSystem(system, playerID);

                userSystem.session.__logLevel = "verbose";
                userSystem.session.__on = true;
                utils.setter.setLogger(logger)
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
                if (playerID == eventData.data.playerID && (userSystem.session["__on"] || eventData.data.command == "show_menu")) {
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
                            logger.log("info", "Current session:")
                            logger.logObject("info", userSystem.session)
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

                if (playerID == eventData.data.playerID && userSystem.session["__on"]) {
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
                            setSession(uiData.data.key, uiData.data.value)
                            break;
                        }
                        case "displayChat": {
                            displayChat(uiData.data)
                            break;
                        }
                    }
                }
            })
        }




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
        function setSession(key, value) {
            userSystem.session[key] = value
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
                    requestID = Math.random()
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
    }
    createRuntime(id) {
    }
}