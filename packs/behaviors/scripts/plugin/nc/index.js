import system from '../../system.js';
import {Description, Usage, Block, Coordinate} from '../../constructor.js';

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