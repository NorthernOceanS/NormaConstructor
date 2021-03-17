import system from '../../system.js';
import { Description, Usage, Block, Coordinate, Position, BlockType, BuildInstruction } from '../../constructor.js';
import { canonicalGeneratorFactory } from '../../framework.js';
import { utils } from './utils.js';
import * as preset from './presetBuildingsInterface.js';

system.registerCanonicalGenerator({
    description:
        new Description("Create a solid cube with two points.",
            new Usage(
                [],
                [],
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
        "positionsLengthRequired": 2,
        "blockTypesLengthRequired": 1,
        "__executeOnAllSatisfied": false,
        "generateByServer": true,
        "inferCoordinates": false
    },
    method: {
        generate: function (e) {
            let { state } = e
            let { positions, blockTypes, directions } = state

            let halt = false
            if (blockTypes.indexOf(undefined) != -1) halt = true
            if (positions.indexOf(undefined) != -1) halt = true
            if (directions.indexOf(undefined) != -1) halt = true
            if (halt) return
            if (state.generateByServer) {
                if (state.inferCoordinates) {
                    [positions[0].coordinate, positions[1].coordinate] = [
                        new Coordinate(
                            Math.min(
                                positions[0].coordinate.x,
                                positions[1].coordinate.x,
                                positions[2].coordinate.x
                            ),
                            Math.min(
                                positions[0].coordinate.y,
                                positions[1].coordinate.y,
                                positions[2].coordinate.y
                            ),
                            Math.min(
                                positions[0].coordinate.z,
                                positions[1].coordinate.z,
                                positions[2].coordinate.z
                            )
                        ),
                        new Coordinate(
                            Math.max(
                                positions[0].coordinate.x,
                                positions[1].coordinate.x,
                                positions[2].coordinate.x
                            ),
                            Math.max(
                                positions[0].coordinate.y,
                                positions[1].coordinate.y,
                                positions[2].coordinate.y
                            ),
                            Math.max(
                                positions[0].coordinate.z,
                                positions[1].coordinate.z,
                                positions[2].coordinate.z
                            )
                        )
                    ]
                }
                return [{
                    "type": "fill", "data": {
                        blockType: blockTypes[0],
                        startCoordinate: positions[0].coordinate,
                        endCoordinate: positions[1].coordinate
                    }
                }]
            }
            else {
                let blocks = []

                //logger.log("verbose", "NZ is JULAO!")

                let minCoordinate = new Coordinate(
                    Math.min(positions[0].coordinate.x, positions[1].coordinate.x),
                    Math.min(positions[0].coordinate.y, positions[1].coordinate.y),
                    Math.min(positions[0].coordinate.z, positions[1].coordinate.z),
                )
                let maxCoordinate = new Coordinate(
                    Math.max(positions[0].coordinate.x, positions[1].coordinate.x),
                    Math.max(positions[0].coordinate.y, positions[1].coordinate.y),
                    Math.max(positions[0].coordinate.z, positions[1].coordinate.z)
                )

                //logger.log("verbose", "Yes, NZ is JULAO!")

                for (let x = minCoordinate.x; x <= maxCoordinate.x; x++) {
                    for (let y = minCoordinate.y; y <= maxCoordinate.y; y++) {
                        for (let z = minCoordinate.z; z <= maxCoordinate.z; z++) {

                            blocks.push(new Block(
                                new Position(
                                    new Coordinate(x, y, z),
                                    positions[0].tickingArea
                                ),
                                blockTypes[0])
                            )
                        }
                    }
                }

                return blocks
            }
        },
        UIHandler: function (e) {
            let { state, data } = e;
            let { positions, blockTypes, directions } = state;
            if (data == "resetAll") {
                positions.fill(undefined);
                blockTypes.fill(undefined);
                directions.fill(undefined);
            }
            if (data == "threeCoordinates") {
                positions.push(undefined)
            }
            if (data == "twoCoordinates") {
                positions.pop()
            }
        }
    }
});

system.registerCanonicalGenerator({
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
        generate: function (e) {
            let { state } = e;
            if (state.generateByServer)
                return [{
                    "type": "clone",
                    "data": {
                        startCoordinate: state.positions[0].coordinate,
                        endCoordinate: state.positions[1].coordinate,
                        targetCoordinate: state.positions[2].coordinate
                    }
                }]
            else return []
        },
        UIHandler: function (e) { }
    }
});

let createLineGenerator = canonicalGeneratorFactory({
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
        generate: function (e) {
            let { state } = e;
            let blockArray = [];

            //let logger = runtime.logger;
            //logger.log("verbose", "NZ is JULAO!")

            let positionArray = state.positions
            let blockTypeArray = state.blockTypes
            let directionArray = state.directions

            //logger.log("verbose", "Yes, NZ is JULAO!")


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
                    for (let z = positionArray[0].coordinate.z; z < state.length + positionArray[0].coordinate.z; z += (state.interval + 1))
                        blockArray.push(new Block(
                            new Position(
                                new Coordinate(x, state.gradient * (z - positionArray[0].coordinate.z) + y, z),
                                positionArray[0].tickingArea
                            ),
                            blockTypeArray[0])
                        )
                    break;
                }
                case "-z": {
                    let x = positionArray[0].coordinate.x
                    let y = positionArray[0].coordinate.y
                    for (let z = positionArray[0].coordinate.z; z > -state.length + positionArray[0].coordinate.z; z -= (state.interval + 1))
                        blockArray.push(new Block(
                            new Position(
                                new Coordinate(x, -state.gradient * (z - positionArray[0].coordinate.z) + y, z),
                                positionArray[0].tickingArea
                            ),
                            blockTypeArray[0])
                        )
                    break;
                }
                case "+x": {
                    let z = positionArray[0].coordinate.z
                    let y = positionArray[0].coordinate.y
                    for (let x = positionArray[0].coordinate.x; x < state.length + positionArray[0].coordinate.x; x += (state.interval + 1))
                        blockArray.push(new Block(
                            new Position(
                                new Coordinate(x, state.gradient * (x - positionArray[0].coordinate.x) + y, z),
                                positionArray[0].tickingArea
                            ),
                            blockTypeArray[0])
                        )
                    break;
                }
                case "-x": {
                    let z = positionArray[0].coordinate.z
                    let y = positionArray[0].coordinate.y
                    for (let x = positionArray[0].coordinate.x; x > -state.length + positionArray[0].coordinate.x; x -= (state.interval + 1))
                        blockArray.push(new Block(
                            new Position(
                                new Coordinate(x, -state.gradient * (x - positionArray[0].coordinate.x) + y, z),
                                positionArray[0].tickingArea
                            ),
                            blockTypeArray[0])
                        )
                    break;
                }
            }

            return blockArray;
        },
        UIHandler: function (e) { }
    }
})

createLineGenerator.addPosition = function () {
    let { state, position } = e;
    if (state.doAcceptNewPosition) {
        let indexOfVacancy = state.positions.indexOf(undefined)
        if (indexOfVacancy == -1) {
            //logger.log("warning", `Too many positions!Discarding the old one...`)
            state.positions = state.positions.slice(1)
            state.positions.push(position)
        }
        else state.positions[indexOfVacancy] = position
        //logger.log("info", `New position accepted.`)
    }
    else utils.generators.canonical.addFunction("position", position, state.positions);
}

system.registerGenerator(createLineGenerator);


system.registerCanonicalGenerator({
    description:
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
    criteria: {
        positionArrayLength: 1,
        blockTypeArrayLength: 0,
        directionArrayLength: 1
    },
    option: {
        "length": 10,
        "roadStyle": "NS",
        "isBarred": false,
        "numberOfLanesPerSide": 2,
        "widthOfLanes": 5,
        "dashLineInterval": 3,
        "dashLineLength": 4
    },
    method: {
        generate: function (e) {
            let { state } = e;
            let blockArray = []

            //logger.log("verbose", "NZ is JULAO!")

            let positionArray = state.positions
            let blockTypeArray = state.blockTypes
            let directionArray = state.directions

            //logger.log("verbose", "Yes, NZ is JULAO!")

            //{"blockIdentifier":"minecraft:stained_hardened_clay","blockState":{"color":"cyan"}}

            let materials
            if (state["roadStyle"] == "NS") materials = {
                "surface": new BlockType("minecraft:stained_hardened_clay", { "color": "cyan" }),
                "white_line": new BlockType("minecraft:concrete", { "color": "white" }),
                "yellow_line": new BlockType("minecraft:stained_hardened_clay", { "color": "yellow" }),
                "bar": new BlockType("minecraft:cobblestone_wall", { "wall_block_type": "cobblestone" })
            }
            else if (state["roadStyle"] == "DB") {
                materials = {
                    "surface": new BlockType("minecraft:wool", { "color": "black" }),
                    "white_line": new BlockType("minecraft:wool", { "color": "white" }),
                    "yellow_line": new BlockType("minecraft:wool", { "color": "yellow" }),
                    "bar": new BlockType("minecraft:cobblestone_wall", { "wall_block_type": "cobblestone" })
                }
            }
            else if (state["roadStyle"] == "custom") {
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

            for (let i = 0; i < state["numberOfLanesPerSide"]; i++) {
                for (let j = 0; j < state["widthOfLanes"]; j++) palette.push("lane")
                if (i < state["numberOfLanesPerSide"] - 1) palette.push("dash_line")
            }
            palette.push("division_line")
            for (let i = 0; i < state["numberOfLanesPerSide"]; i++) {
                for (let j = 0; j < state["widthOfLanes"]; j++) palette.push("lane")
                if (i < state["numberOfLanesPerSide"] - 1) palette.push("dash_line")
            }
            if (state["isBarred"]) palette[0] = palette[palette.length - 1] = "edge"

            const offset = (palette.length - 1) / 2;
            for (let i = 0; i < palette.length; i++) {
                switch (palette[i]) {
                    case "edge": {
                        for (let coordinate of utils.coordinateGeometry.generateLineWithTwoPoints(
                            positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset,
                            positionArray[0].coordinate.x + state["length"] - 1, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
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
                            positionArray[0].coordinate.x + state["length"] - 1, positionArray[0].coordinate.y + 1, positionArray[0].coordinate.z + i - offset)
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
                            positionArray[0].coordinate.x + state["length"] - 1, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
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
                        for (let j = 0; j <= state["length"] - 1; j++) {
                            let position = new Position(transform(new Coordinate(positionArray[0].coordinate.x + j, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)), positionArray[0].tickingArea)
                            if ((j % (state["dashLineInterval"] + state["dashLineLength"])) < state["dashLineInterval"]) //Black first.
                                blockArray.push(new Block(position, materials["surface"]))
                            else
                                blockArray.push(new Block(position, materials["white_line"]))
                        }
                        break;
                    }
                    case "division_line": {
                        for (let coordinate of utils.coordinateGeometry.generateLineWithTwoPoints(
                            positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset,
                            positionArray[0].coordinate.x + state["length"] - 1, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
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
        postGenerate: function (e) {
            let { state } = e;
            state.positions = [undefined]
            if (state["roadStyle"] == "custom") state.blockTypes = [undefined, undefined, undefined, undefined];
            else state.blockTypeArray = [];
            state.blockTypes = [];
            state.directions = [undefined];
        },
        UIHandler: function (e) {
            let { state, data } = e;
            if (data == "custom") {
                //logger.log("info", "Using custom materials.")
                //logger.log("info", "First block type for surface.")
                //logger.log("info", "Second for white line.")
                //logger.log("info", "Third for yellow line.")
                //logger.log("info", "Fourth for bar.")
                state.blockTypes = [undefined, undefined, undefined, undefined]
            }
            else {
                //logger.log("info", "Using preset materials. Custom materials are erased!")
                state.blockTypes = []
            }
        }
    }
});

system.registerCanonicalGenerator({
    description:
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
    criteria: {
        positionArrayLength: 1,
        blockTypeArrayLength: 0,
        directionArrayLength: 1
    },
    option: {
        "length": 10,
        "isBarred": false
    },
    method: {
        generate: function (e) {
            let { state } = e;
            let blockArray = []

            //logger.log("verbose", "NZ is JULAO!")

            let positionArray = state.positions
            let blockTypeArray = state.blockTypes
            let directionArray = state.directions
            //logger.log("verbose", "Yes, NZ is JULAO!")

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

            if (state["isBarred"]) {
                palette.unshift("edge")
                palette.push("edge")
            }

            const offset = (palette.length - 1) / 2;
            for (let i = 0; i < palette.length; i++) {
                switch (palette[i]) {
                    case "edge": {
                        for (let coordinate of utils.coordinateGeometry.generateLineWithTwoPoints(
                            positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset,
                            positionArray[0].coordinate.x + state["length"] - 1, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
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
                            positionArray[0].coordinate.x + state["length"] - 1, positionArray[0].coordinate.y + 1, positionArray[0].coordinate.z + i - offset)
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
                            positionArray[0].coordinate.x + state["length"] - 1, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
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
                            positionArray[0].coordinate.x + state["length"] - 1, positionArray[0].coordinate.y + 1, positionArray[0].coordinate.z + i - offset)
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
                            positionArray[0].coordinate.x + state["length"] - 1, positionArray[0].coordinate.y, positionArray[0].coordinate.z + i - offset)
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
                        for (let j = 0; j < state["length"] - 1; j++) {
                            let position = new Position(transform(new Coordinate(positionArray[0].coordinate.x + j, positionArray[0].coordinate.y + 1, positionArray[0].coordinate.z + i - offset)), positionArray[0].tickingArea)
                            if (j % 15 == 0) blockArray.push(new Block(position, materials["red_stone_torch"]))
                        }
                        break;
                    }
                }
            }

            return blockArray
        },
        postGenerate: function (e) {
            let { state } = e;
            state.positionArray = [undefined];
            state.blockTypeArray = [];
            state.directionArray = [undefined];
        },
        UIHandler: function (e) { /* no-op */ },
    }
});

system.registerCanonicalGenerator({
    description:
        new Description("Create a triangle.(Broken)",
            new Usage(
                [],
                [],
                [],
                []
            )
        ),
    criteria: {
        positionArrayLength: 3,
        blockTypeArrayLength: 1,
        directionArrayLength: 0
    },
    option: {
    },
    method: {
        generate: function (e) {
            let { state } = e;
            let blockArray = []

            //logger.log("verbose", "NZ is JULAO!")

            let positionArray = state.positions
            let blockTypeArray = state.blockTypes

            //logger.log("verbose", "Yes, NZ is JULAO!")

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

            return blockArray;
        },
        postGenerate: function (e) {
            let { state } = e;
            state.positions = [undefined];
            state.blockTypes = [];
            state.directions = [undefined];
        },
        UIHandler: function (e) { /* no-op */ },
    }
});

system.registerCanonicalGenerator({
    description: new Description("Clear terrain",
        new Usage(
            [],
            [],
            [],
            []
        )
    ),
    criteria: {
        positionArrayLength: 2,
        blockTypeArrayLength: 0,
        directionArrayLength: 0
    },
    option: {
        "generateByServer": true,
    },
    method: {
        generate: function (e) {
            let { state } = e;
            if (state.generateByServer) {
                //logger.log("verbose", "NZ is JULAO!")

                let x_min = Math.min(state.positions[0].coordinate.x, state.positions[1].coordinate.x)
                let z_min = Math.min(state.positions[0].coordinate.z, state.positions[1].coordinate.z)

                let x_max = Math.max(state.positions[0].coordinate.x, state.positions[1].coordinate.x)
                let z_max = Math.max(state.positions[0].coordinate.z, state.positions[1].coordinate.z)

                let y_start = (Math.abs(state.positions[0].coordinate.y - 69) < Math.abs(state.positions[1].coordinate.y - 69)) ? state.positions[0].coordinate.y : state.positions[1].coordinate.y

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

                //logger.log("verbose", "NZ is JULAO!")

                let positionArray = state.positions
                let blockTypeArray = state.blockTypes

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
        postGenerate: function (e) {
            let { state } = e;
            state.positions = [undefined, undefined]
            state.blockTypes = []
        },
        UIHandler: function (e) { /* no-op */ },
    }
});

system.registerCanonicalGenerator({
    description: new Description("Create polygon.",
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
    criteria: {
        positionArrayLength: 1,
        blockTypeArrayLength: 0,
        directionArrayLength: 0
    },
    option: {
        "numberOfSides": 6,
        "r": 10,
    },
    method: {
        generate: function (e) {
            let { state } = e;
            let blockArray = [];

            //logger.log("verbose", "NZ is JULAO!")

            let positionArray = state.positions

            let coordinateArray = []

            for (let theta = 0; theta <= 2 * Math.PI; theta += 2 * Math.PI / state.numberOfSides) {
                coordinateArray = coordinateArray.concat(utils.coordinateGeometry.withBresenhamAlgorithm.generateLineWithTwoPoints(
                    positionArray[0].coordinate.x + state.r * Math.cos(theta), positionArray[0].coordinate.y, positionArray[0].coordinate.z + state.r * Math.sin(theta),
                    positionArray[0].coordinate.x + state.r * Math.cos(theta + 2 * Math.PI / state.numberOfSides), positionArray[0].coordinate.y, positionArray[0].coordinate.z + state.r * Math.sin(theta + 2 * Math.PI / state.numberOfSides)
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
        postGenerate: function (e) {
            let { state } = e;
            state.positions = [undefined]
            state.blockTypes = []
        },
        UIHandler: function (e) { /* no-op */ },
    }
});

system.registerCanonicalGenerator({
    description: new Description("Create circle.(on xz plane)",
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
    criteria: {
        positionArrayLength: 1,
        blockTypeArrayLength: 1,
        directionArrayLength: 0
    },
    option: {
        "r": 10,
    },
    method: {
        generate: function (e) {
            let { state } = e;
            let blockArray = []



            //logger.log("verbose", "NZ is JULAO!")

            let positionArray = state.positions
            let blockTypeArray = state.blockTypes

            let coordinateArray = []

            utils.coordinateGeometry.withBresenhamAlgorithm.generate2DCircle(positionArray[0].coordinate.x, positionArray[0].coordinate.z, state.r)
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
        postGenerate: function (e) {
            let { state } = e;
            state.positions = [undefined]
            state.blockTypes = [undefined]
        },
        UIHandler: function (e) { /* no-op */ },
    }
});

system.registerCanonicalGenerator({
    description: new Description("Create sphere.",
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
    criteria: {
        positionArrayLength: 1,
        blockTypeArrayLength: 1,
        directionArrayLength: 0
    },
    option: {
        "r": 10,
        "isHollow": false,
    },
    method: {
        generate: function (e) {
            let { state } = e;
            let blockArray = []



            //logger.log("verbose", "NZ is JULAO!")

            let positionArray = state.positions
            let blockTypeArray = state.blockTypes

            let coordinateArray = state.isHollow ?
                utils.coordinateGeometry.generateHollowSphere(positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z, state.r) :
                utils.coordinateGeometry.generateSphere(positionArray[0].coordinate.x, positionArray[0].coordinate.y, positionArray[0].coordinate.z, state.r)

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
        postGenerate: function (e) {
            let { state } = e;
            state.positions = [undefined]
            state.blockTypes = [undefined]
        },
        UIHandler: function (e) { /* no-op */ },
    }
});

system.registerCanonicalGenerator({
    description: new Description("Generate The Flag of Norma Federal Republic",
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
    criteria: {
        positionArrayLength: 1,
        blockTypeArrayLength: 0,
        directionArrayLength: 0
    },
    option: {
        "height": 10,
    },
    method: {
        isValidParameter: function (e) {
            let { state } = e;
            let result = "";
            if (state.blockTypes.indexOf(undefined) != -1)
                result += "Too few blockTypes!Refusing to execute.\n"
            if (state.positions.indexOf(undefined) != -1)
                result += "Too few positions!Refusing to execute."
            if (state.height % 2 != 0) result += "The height is odd!"
            if (result == "") result = "success"

            return result === "success";
        },
        generate: function (e) {
            let { state } = e;
            let blockArray = []
            let positionArray = state.positions;
            let option = state;

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
        postGenerate: function (e) {
            let { state } = e;
            state.positions = [undefined]
            state.blockTypes = [undefined]
        },
        UIHandler: function (e) { /* no-op */ },
    }
});

system.registerCanonicalGenerator({
    description: new Description("Construct subway",
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
    criteria: {
        positionArrayLength: 1,
        blockTypeArrayLength: 0,
        directionArrayLength: 1,
    },
    option: {
        "length": 10,
        "useGlass": false,
        "useColorfulGlass": false,
    },
    method: {
        generate: function (e) {
            let { state } = e;
            let blockArray = []

            //logger.log("verbose", "NZ is JULAO!")

            let positionArray = state.positions;
            let blockTypeArray = state.blockTypes;
            let directionArray = state.directions;
            let option = state;
            //logger.log("verbose", "Yes, NZ is JULAO!")

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
                    //logger.logObject("debug", coordinate)
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
                            e.runtime.logger.log("verbose", "NZ IS JULAO")
                            blockArray.push(new Block(
                                new Position(absoluteCordinate, position.tickingArea),
                                recipe[schematics[y][z]](rawCoordinate)
                            ))
                        }
                return blockArray
            }(positionArray[0], option.length, directionMark, schematics, offset, recipe, [0, 1, 2, 3, 5, 4]))
            e.runtime.logger.log("verbose", "NZ IS JUJULAO")
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
            e.runtime.logger.log("verbose", "NZ IS JUJUJULAO")
            blockArray.splice(0, 0, new BuildInstruction("fill", {
                blockType: new BlockType("minecraft:sponge", { "sponge_type": "dry" }),
                startCoordinate: fillStartCoordinate,
                endCoordinate: fillEndCoordinate
            })
            )
            return blockArray
        },
        postGenerate: function (e) {
            let { state } = e;
            state.positions = [undefined];
            state.blockTypes = [];
            state.directions = [undefined];
        },
        UIHandler: function (e) { /* no-op */ },
    }
});

system.registerCanonicalGenerator({
    description: new Description("Construct blue ice \"railway\"",
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
            ]
        )
    ),
    criteria: {
        positionArrayLength: 1,
        blockTypeArrayLength: 0,
        directionArrayLength: 1,
    },
    option: {
        "length": 10,
        "useGlass": false,
        "widthOfIce": 2
    },
    method: {
        generate: function (e) {
            let { state, runtime } = e;
            let { logger } = runtime;
            logger && logger.log("verbose", "NZ is JULAO!")

            let positionArray = state.positions;
            let blockTypeArray = state.blockTypes;
            let directionArray = state.directions;
            let option = state;
            logger && logger.log("verbose", "Yes, NZ is JULAO!")

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
        UIHandler: function (e) { /* no-op */ },
    }
});

system.registerCanonicalGenerator({
    description: new Description("Record structure", new Usage([], [], [], [])),
    criteria: { positionArrayLength: 3, blockTypeArrayLength: 0, directionArrayLength: 0 },
    option: {},
    method: {
        UIHandler: function () { }, generate: function (e) {
            let { state } = e;
            return new BuildInstruction("writeBuildingStructureToLog", {
                startCoordinate: state.positions[0].coordinate,
                endCoordinate: state.positions[1].coordinate,
                referenceCoordinate: state.positions[2].coordinate,
                tickingArea: state.positions[2].tickingArea
            })
        }
    }
});

system.registerCanonicalGenerator({
    description: new Description(" aspdf vhfdwvgcmfs", new Usage([], [], [], [])),
    criteria: { positionArrayLength: 1, blockTypeArrayLength: 0, directionArrayLength: 0 },
    option: {},
    method: {
        generate: function (e) {
            let { state } = e;
            let coordinate = state.positions[0].coordinate

            return Array.from(preset.presetBuildings.subway_station, a => new Block(new Position(new Coordinate(
                coordinate.x + a.coordinate.x, coordinate.y + a.coordinate.y, coordinate.z + a.coordinate.z
            ), state.positions[0].tickingArea), a.blockType))

        }
    }
});
