import system from '../../system.js';
import { Description, Usage, Block, Coordinate, Position } from '../../constructor.js';
import { utils } from '../utils.js';

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
            logger.log("warning", `Too many positions!Discarding the old one...`)
            state.positions = state.positions.slice(1)
            state.positions.push(position)
        }
        else state.positions[indexOfVacancy] = position
        logger.log("info", `New position accepted.`)
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
