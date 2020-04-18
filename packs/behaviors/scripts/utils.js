// eslint-disable-next-line no-unused-vars
import { Coordinate, BlockType, Direction } from "./constructor";
const blockDirectionTable = {
	"huge_mushroom_bits": {
		"default": {
			"none": 0,
			"-x+y-z": 1,
			"+y-z": 2,
			"+x+y-z": 3,
			"-x+y": 4,
			"+y": 5,
			"+x+y": 6,
			"-x+y+z": 7,
			"+y+z": 8,
			"+x+y+z": 9,
			"+y-y": 10,
			"null": 11,
			"nil": 12,
			"NaN": 13,
			"all": 14,
			"stem": 15
		}
	},
	"pillar_axis": {
		"default": {
			"+x": "x",
			"-x": "x",
			"+y": "y",
			"-y": "y",
			"+z": "z",
			"-z": "z"
		}
	},
	"axis": {
		"default": {
			"+x": "x",
			"-x": "x",
			"+z": "z",
			"-z": "z"
		}
	},
	"facing_direction": {
		"default": {
			"+x": 5,
			"-x": 4,
			"+y": 1,
			"-y": 0,
			"+z": 3,
			"-z": 2
		}
	},
	"direction": {
		"minecraft:bed": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:wooden_door": {
			"+x": 0,
			"-x": 1,
			"+z": 2,
			"-z": 3
		},
		"minecraft:iron_door": {
			"+x": 0,
			"-x": 1,
			"+z": 2,
			"-z": 3
		},
		"minecraft:lit_pumpkin": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:trapdoor": {
			"+x": 0,
			"-x": 1,
			"+z": 2,
			"-z": 3
		},
		"minecraft:fence_gate": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:end_portal_frame": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:cocoa": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:tripwire_hook": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:anvil": {
			"+x": 2,
			"-x": 0,
			"+z": 3,
			"-z": 1
		},
		"minecraft:unpowered_repeater": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:powered_repeater": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:unpowered_comparator": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:powered_comparator": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:iron_trapdoor": {
			"+x": 0,
			"-x": 1,
			"+z": 2,
			"-z": 3
		},
		"minecraft:spruce_fence_gate": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:birch_fence_gate": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:jungle_fence_gate": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:dark_oak_fence_gate": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:acacia_fence_gate": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:spruce_door": {
			"+x": 0,
			"-x": 1,
			"+z": 2,
			"-z": 3
		},
		"minecraft:birch_door": {
			"+x": 0,
			"-x": 1,
			"+z": 2,
			"-z": 3
		},
		"minecraft:jungle_door": {
			"+x": 0,
			"-x": 1,
			"+z": 2,
			"-z": 3
		},
		"minecraft:acacia_door": {
			"+x": 0,
			"-x": 1,
			"+z": 2,
			"-z": 3
		},
		"minecraft:dark_oak_door": {
			"+x": 0,
			"-x": 1,
			"+z": 2,
			"-z": 3
		},
		"minecraft:acacia_trapdoor": {
			"+x": 0,
			"-x": 1,
			"+z": 2,
			"-z": 3
		},
		"minecraft:birch_trapdoor": {
			"+x": 0,
			"-x": 1,
			"+z": 2,
			"-z": 3
		},
		"minecraft:dark_oak_trapdoor": {
			"+x": 0,
			"-x": 1,
			"+z": 2,
			"-z": 3
		},
		"minecraft:jungle_trapdoor": {
			"+x": 0,
			"-x": 1,
			"+z": 2,
			"-z": 3
		},
		"minecraft:spruce_trapdoor": {
			"+x": 0,
			"-x": 1,
			"+z": 2,
			"-z": 3
		},
		"minecraft:carved_pumpkin": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:pumpkin": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:lectern": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:grindstone": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:loom": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:bell": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"minecraft:campfire": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		},
		"default": {
			"+x": 3,
			"-x": 1,
			"+z": 0,
			"-z": 2
		}
	},
	"ground_sign_direction": {
		"default": {
			"0": 0,
			"22.5": 1,
			"45": 2,
			"67.5": 3,
			"90": 4,
			"112.5": 5,
			"135": 6,
			"157.5": 7,
			"180": 8,
			"-157.5": 9,
			"-135": 10,
			"-112.5": 11,
			"-90": 12,
			"-67.5": 13,
			"-45": 14,
			"-22.5": 15
		}
	},
	"rail_direction": {
		"default": {
			"x": 0,
			"z": 1,
			"+x": 2,
			"-x": 3,
			"+z": 5,
			"-z": 4
		}
	},
	"torch_facing_direction": {
		"default": {
			"-x": "west",
			"+x": "east",
			"-z": "north",
			"+z": "south",
			"y": "top"
		}
	},
	"weirdo_direction": {
		"default": {
			"+x": 0,
			"-x": 1,
			"+z": 2,
			"-z": 3
		}
	},
	"lever_direction": {
		"default": {
			"x-y": "down_east_west",
			"+x": "east",
			"-x": "west",
			"+z": "south",
			"-z": "north",
			"z+y": "up_north_south",
			"x+y": "up_east_west",
			"z-y": "down_north_south"
		}
	},
	"portal_axis": {
		"default": {
			"+x": "x",
			"-x": "x",
			"+z": "z",
			"-z": "z"
		}
	},
	"vine_direction_bits": {
		"default": {
			"NZ IS JULAO": 0,
			"+z": 1,
			"-x": 2,
			"-x+z": 3,
			"-z": 4,
			"+z-z": 5,
			"-x-z": 6,
			"-x+z-z": 7,
			"+x": 8,
			"+x+z": 9,
			"+x-x": 10,
			"+x-x+z": 11,
			"+x-z": 12,
			"+x+z-z": 13,
			"+x-x-z": 14,
			"+x-x+z-z": 15
		}
	}
};
let translator = {
	directionMarkToDirection: function (directionMark) {
		switch (directionMark) {
			case "+x": return new Direction(0, -90);
			case "-x": return new Direction(0, 90);
			case "+y": return new Direction(-90, 0);
			case "-y": return new Direction(90, 0);
			case "+z": return new Direction(0, 0);
			case "-z": return new Direction(0, 180);

			case "x": return new Direction(0, -90);
			case "y": return new Direction(90, 0);
			case "z": return new Direction(0, 0);
			default: {
				return "Ahhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh";
			}
		}
	}
};
let utils = {
	misc: {
		generatePlayerIDFromUniqueID: function (uniqueID) {
			let low = uniqueID["64bit_low"]
			let high = uniqueID["64bit_high"]
			//hash function:

			return (low + high) * (low + high + 1) / 2 + high;
		}
	},
	coordinateGeometry: {
		transform: function (f, g, h) {
			return (coordinate) => {
				return new Coordinate(
					f(coordinate.x, coordinate.y, coordinate.z),
					g(coordinate.x, coordinate.y, coordinate.z),
					h(coordinate.x, coordinate.y, coordinate.z),
				);
			};
		},

		generateLine: function (x, y, z, t_span, constraint) {
			//TODO: t_step<0?t_span[0]>t_span[1]?
			let coordinateArray = [];

			function isRedundant(coordinateArray, newCoordinate) {
				if (coordinateArray.length == 0) return false;
				return (
					coordinateArray[coordinateArray.length - 1].x == newCoordinate.x &&
					coordinateArray[coordinateArray.length - 1].y == newCoordinate.y &&
					coordinateArray[coordinateArray.length - 1].z == newCoordinate.z
				)
			}

			let t_step = 0.0001
			for (let t = t_span[0]; t < t_span[1]; t += t_step) {
				let newCoordinate = new Coordinate(Math.floor(x(t)), Math.floor(y(t)), Math.floor(z(t)));
				if (!isRedundant(coordinateArray, newCoordinate) && constraint(newCoordinate.x, newCoordinate.y, newCoordinate.z, t))
					coordinateArray.push(newCoordinate);
			}
			return coordinateArray;
		},
		generateLineWithTwoPoints: function (x_start, y_start, z_start, x_end, y_end, z_end) {
			let t_span = [0, 1];
			let x_coefficient = (x_end - x_start) / (t_span[1] - t_span[0]);
			let y_coefficient = (y_end - y_start) / (t_span[1] - t_span[0]);
			let z_coefficient = (z_end - z_start) / (t_span[1] - t_span[0]);
			return this.generateLine(
				(t) => { return ((t - t_span[0]) * x_coefficient + x_start); },
				(t) => { return ((t - t_span[0]) * y_coefficient + y_start); },
				(t) => { return ((t - t_span[0]) * z_coefficient + z_start); },
				t_span, (x, y, z, t) => { return true });
		},
		generateTriangle: function (x1, y1, z1, x2, y2, z2, x3, y3, z3) {
			let coordinateArray = [];
			coordinateArray = coordinateArray.concat(this.generateLineWithTwoPoints(x1, y1, z1, x2, y2, z2))
			coordinateArray = coordinateArray.concat(this.generateLineWithTwoPoints(x2, y2, z2, x3, y3, z3))
			coordinateArray = coordinateArray.concat(this.generateLineWithTwoPoints(x3, y3, z3, x1, y1, z1))

			return coordinateArray
		},
		generateFilledPlanarTriangle: function (x1, y1, z1, x2, y2, z2, x3, y3, z3) {
			const A = (y2 - y1) * (z3 - z1) - (y3 - y1) * (z2 - z1)
			const B = -((x2 - x1) * (z3 - z1) - (x3 - x1) * (z2 - z1))
			const C = (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1)
			let x_span=[Math.min(x1,x2,x3),Math.max(x1,x2,x3)]
			let y_span=[Math.min(y1,y2,y3),Math.max(y1,y2,y3)]
			let z_span=[Math.min(z1,z2,z3),Math.max(z1,z2,z3)]
			return this.generateWithConstraint(x_span, y_span, z_span, (x, y, z) => {
				return (A * (x - x1) + B * (y - y1) + C * (z - z1))
			})
		},
		generateWithConstraint: function (x_span, y_span, z_span, constraint) {
			let coordinateArray = [];
			function isRedundant(coordinateArray, newCoordinate) {
				if (coordinateArray.length == 0) return false;
				return (
					coordinateArray[coordinateArray.length - 1].x == newCoordinate.x &&
					coordinateArray[coordinateArray.length - 1].y == newCoordinate.y &&
					coordinateArray[coordinateArray.length - 1].z == newCoordinate.z
				)
			}
			const x_step = 0.25;
			const y_step = 0.25;
			const z_step = 0.25;

			if (x_span[0] >= x_span[1]) {
				let temp = x_span[1]
				x_span[1] = x_span[0]
				x_span[0] = temp
			}
			if (y_span[0] >= y_span[1]) {
				let temp = y_span[1]
				y_span[1] = y_span[0]
				y_span[0] = temp
			}
			if (z_span[0] >= z_span[1]) {
				let temp = z_span[1]
				z_span[1] = z_span[0]
				z_span[0] = temp
			}

			for (let x = x_span[0]; x < x_span[1]; x += x_step)
				for (let y = y_span[0]; y < y_span[1]; y += y_step)
					for (let z = z_span[0]; z < z_span[1]; z += z_step) {
						let newCoordinate = new Coordinate(Math.round(x), Math.round(y), Math.round(z))
						if (!isRedundant(coordinateArray, newCoordinate) && constraint(x, y, z-z_step/2) * constraint(x , y , z + z_step/2) <= 0)
							coordinateArray.push(newCoordinate)
					}
			return coordinateArray

		}
	},
	blockGeometry: {
		getBlockDirection: function (blockType) {
			let directionRelatedBlockStateKey = (function () {
				//The following function decides which specific key controls how the block rotates, if it exists.
				//It is based on the fact that, only one blockState will decide how.
				//Hope it won't change.
				for (let blockStateKey in blockType.blockState)
					if (blockDirectionTable[blockStateKey] != undefined) return blockStateKey;
				return "";
			}());
			let directionMap = (function () {
				if (blockDirectionTable[directionRelatedBlockStateKey][blockType.blockIdentifier] == undefined)
					return blockDirectionTable[directionRelatedBlockStateKey]["default"];
				else
					return blockDirectionTable[directionRelatedBlockStateKey][blockType.blockIdentifier];
			}());
			let directionMark = (function () {
				for (let mark in directionMap)
					if (directionMap[mark] == blockType.blockState[directionRelatedBlockStateKey]) return mark;
				return "error";
			}());
			return translator.directionMarkToDirection(directionMark);
		},
		//The degree is absolute degree.
		setBlockDirection: function (blockType, directionMark) {
			//Ignoring special block that doesn't use "+x" etc for now.
			let directionRelatedBlockStateKey = (function () {
				//The following function decides which specific key controls how the block rotates, if it exists.
				//It is based on the fact that, only one blockState will decide how.
				//Hope it won't change.
				for (let blockStateKey in blockType.blockState)
					if (blockDirectionTable[blockStateKey] != undefined) return blockStateKey;
				return "";
			}());
			let directionMap = (function () {
				if (blockDirectionTable[directionRelatedBlockStateKey][blockType.blockIdentifier] == undefined)
					return blockDirectionTable[directionRelatedBlockStateKey]["default"];
				else
					return blockDirectionTable[directionRelatedBlockStateKey][blockType.blockIdentifier];
			}());
			blockType.blockState.directionRelatedBlockStateKey = directionMap[directionMark];
			return blockType;
		},
	}
};

export { utils };