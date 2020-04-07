// eslint-disable-next-line no-unused-vars
import { Coordinate, BlockType, Direction } from "../constructor";
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
let translator={
	directionMarkToDirection:function(directionMark){
		switch (directionMark) {
		case "+x": return new Direction(0, -90);
		case "-x": return new Direction(0, 90);
		case "+y": return new Direction(-90, 0);
		case "-y": return new Direction(90, 0);
		case "+z": return new Direction(0, 0);
		case "-z": return new Direction(0, 180);

		case "x": return new Direction(0, -90);
		case "y": return new Direction(90, 0);
		case "z": return new Direction(0,0);
		default:{
			return "Ahhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh";
		}
		}
	}
};
let utils = {
	geometry: {
		transform: function (f, g, h) {
			return (coordinate) => {
				return new Coordinate(
					f(coordinate.x, coordinate.y, coordinate.z),
					g(coordinate.x, coordinate.y, coordinate.z),
					h(coordinate.x, coordinate.y, coordinate.z),
				);
			};
		},
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
				if (blockDirectionTable[directionRelatedBlockStateKey][blockType.blockIdentifier] != undefined)
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
			//Ignoring special block that doesn't use "+x" for now.
			let directionRelatedBlockStateKey = (function () {
				//The following function decides which specific key controls how the block rotates, if it exists.
				//It is based on the fact that, only one blockState will decide how.
				//Hope it won't change.
				for (let blockStateKey in blockType.blockState)
					if (blockDirectionTable[blockStateKey] != undefined) return blockStateKey;
				return "";
			}());
			let directionMap = (function () {
				if (blockDirectionTable[directionRelatedBlockStateKey][blockType.blockIdentifier] != undefined)
					return blockDirectionTable[directionRelatedBlockStateKey]["default"];
				else
					return blockDirectionTable[directionRelatedBlockStateKey][blockType.blockIdentifier];
			}());
			blockType.blockState.directionRelatedBlockStateKey = directionMap[directionMark];
			return blockType;
		},
		generateLine: function (x, y, z, t_span, t_step) {
			//TODO: t_step<0?t_span[0]>t_span[1]?
			let coordinateArray = [];
			for (let t = t_span[0]; t < t_span[1]; t += t_step) {
				let coordinate_new = new Coordinate(Math.floor(x(t)), Math.floor(y(t)), Math.floor(z(t)));
				if (coordinateArray.length == 0 ||
                    (coordinateArray[coordinateArray.length - 1].x != coordinate_new.x ||
                        coordinateArray[coordinateArray.length - 1].y != coordinate_new.y ||
                        coordinateArray[coordinateArray.length - 1].z != coordinate_new.z)
				) coordinateArray.push(coordinate_new);
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
				t_span, 0.0001);
		}
	}
};

export { utils };