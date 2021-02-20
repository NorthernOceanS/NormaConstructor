import system from '../../system.js';
import {Description, Usage, Block, Coordinate, Position} from '../../constructor.js';

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
            let {state} = e
            let {positions, blockTypes, directions} = state
            
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
            let {state, data} = e;
            let {positions, blockTypes, directions} = state;
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
            let {state} = e;
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

let createLineGenerator = new canonicalGeneratorFactory({
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
            let {state} = e;
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
	let {state, position} = e;
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
