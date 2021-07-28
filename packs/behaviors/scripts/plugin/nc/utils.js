// eslint-disable-next-line no-unused-vars
import { Coordinate, BlockType, Direction, Generator } from "norma-core";
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
	setter: {
		setLogger: function (logger) {
			utils.logger = logger
		}
	},
	misc: {
		generatePlayerIDFromUniqueID: function (uniqueID) {
			let low = uniqueID["64bit_low"]%10000
			let high = uniqueID["64bit_high"]%10000
			//hash function:

			return (low + high) * (low + high + 1) / 2 + high;
		}
	},
	generators: {
		canonical: {
			addFunction: function (type, data, target) {
				let indexOfVacancy = target.indexOf(undefined)
				if (indexOfVacancy == -1) utils.logger.log("warning", `Too many ${type}s!New one is ignored`)
				else {
					target[indexOfVacancy] = data
					utils.logger.log("info", `New ${type} accepted.`)
				}
			},
			removeFunction: function (index, target) {
				if (index === undefined)
					for (index = target.length - 1; index >= 0 && target[index] == undefined; index--);
				if (index >= 0) target[index] = undefined
				utils.logger.logObject("info", target)
			},
			validateParameter: function () {
				let result = new String()
				if (this.blockTypeArray.indexOf(undefined) != -1)
					result += "Too few blockTypes!Refusing to execute.\n"
				if (this.positionArray.indexOf(undefined) != -1)
					result += "Too few positions!Refusing to execute.\n"
				if (this.directionArray.indexOf(undefined) != -1)
					result += "Too few directions!Refusing to execute."
				if (result == "") result = "success"
				else utils.logger.log("error", result)

				return result;
			},
			postGenerate: function () {
				this.positionArray.fill(undefined)
				this.blockTypeArray.fill(undefined)
				this.directionArray.fill(undefined)
			},
			//A generator that is canonical must :
			//1.have finite fixed(?) numbers of parameters, in which the arrays are initially filled with undefined. 
			//2.don't need to verifiy options.
			//3.after the generation, the generator only need to reset the array.
			generatorConstrctor: function ({
				description,
				criteria: {
					positionArrayLength,
					blockTypeArrayLength,
					directionArrayLength
				},
				option,
				method: {
					generate, UIHandler
				}
			}) {
				return new Generator(
					description,
					new Array(positionArrayLength).fill(undefined),
					new Array(blockTypeArrayLength).fill(undefined),
					new Array(directionArrayLength).fill(undefined),
					option,
					function (position) { utils.generators.canonical.addFunction("position", position, this.positionArray) },
					function (blockType) { utils.generators.canonical.addFunction("block type", blockType, this.blockTypeArray) },
					function (direction) { utils.generators.canonical.addFunction("direction", direction, this.directionArray) },
					function (index) { utils.generators.canonical.removeFunction(index, this.positionArray) },
					function (index) { utils.generators.canonical.removeFunction(index, this.blockTypeArray) },
					function (index) { utils.generators.canonical.removeFunction(index, this.directionArray) },
					function () { return utils.generators.canonical.validateParameter.call(this) },
					generate,
					function () { utils.generators.canonical.postGenerate.call(this) },
					UIHandler
				)
			}
		}
	},
	geometry: {
		getDirectionMark: {
			horizontal: function (theta) {
				if (-45 <= theta && theta <= 45) return "+z"
				else if (-135 <= theta && theta <= -45) return "+x"
				else if (45 <= theta && theta <= 135) return "-x"
				else return "-z"
			}
		},
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

		generateLine: function (x, y, z, t_span, constraint, t_step) {
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

			if (t_step == undefined || t_step < 0.0001/* Prevent performance issue. */) t_step = 0.0001
			for (let t = t_span[0]; t <= t_span[1]; t += t_step) {
				let newCoordinate = new Coordinate(Math.round(x(t)), Math.round(y(t)), Math.round(z(t)));
				if (!isRedundant(coordinateArray, newCoordinate) && constraint(newCoordinate.x, newCoordinate.y, newCoordinate.z, t)) {

					coordinateArray.push(newCoordinate);
				}
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
				t_span, (x, y, z, t) => { return true }, Math.min(x_coefficient == 0 ? t_span[1] - t_span[0] : 1 / x_coefficient, y_coefficient == 0 ? t_span[1] - t_span[0] : 1 / y_coefficient, z_coefficient == 0 ? t_span[1] - t_span[0] : 1 / z_coefficient));
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
			const G = new Coordinate((x1 + x2 + x3) / 3, (y1 + y2 + y3) / 3, (z1 + z2 + z3) / 3)
			let x_span = [Math.min(x1, x2, x3), Math.max(x1, x2, x3)]
			let y_span = [Math.min(y1, y2, y3), Math.max(y1, y2, y3)]
			let z_span = [Math.min(z1, z2, z3), Math.max(z1, z2, z3)]

			function signedDistance(x_start, y_start, x_end, y_end) {
				return (x, y) => { return (y_end - y_start) * x - (x_end - x_start) * y + x_end * y_start - x_start * y_end }
			}

			return this.generateWithConstraint(x_span, y_span, z_span, (x, y, z) => {
				return (Math.abs(A * (x - x1) + B * (y - y1) + C * (z - z1)) < Math.sqrt(A * A + B * B + C * C) / 2)
					&&
					(
						signedDistance(x1, y1, x2, y2)(x, y) * signedDistance(x1, y1, x2, y2)(G.x, G.y) >= 0 &&
						signedDistance(x1, y1, x3, y3)(x, y) * signedDistance(x1, y1, x3, y3)(G.x, G.y) >= 0 &&
						signedDistance(x2, y2, x3, y3)(x, y) * signedDistance(x2, y2, x3, y3)(G.x, G.y) >= 0 &&

						signedDistance(x1, z1, x2, z2)(x, z) * signedDistance(x1, z1, x2, z2)(G.x, G.z) >= 0 &&
						signedDistance(x1, z1, x3, z3)(x, z) * signedDistance(x1, z1, x3, z3)(G.x, G.z) >= 0 &&
						signedDistance(x2, z2, x3, z3)(x, z) * signedDistance(x2, z2, x3, z3)(G.x, G.z) >= 0 &&

						signedDistance(y1, z1, y2, z2)(y, z) * signedDistance(y1, z1, y2, z2)(G.y, G.z) >= 0 &&
						signedDistance(y1, z1, y3, z3)(y, z) * signedDistance(y1, z1, y3, z3)(G.y, G.z) >= 0 &&
						signedDistance(y2, z2, y3, z3)(y, z) * signedDistance(y2, z2, y3, z3)(G.y, G.z) >= 0
					)
			})
		},
		generateSphere: function (x, y, z, r) {
			return this.generateWithConstraint([x - r, x + r], [y - r, y + r], [z - r, z + r], (_x, _y, _z) => { return (_x - x) * (_x - x) + (_y - y) * (_y - y) + (_z - z) * (_z - z) < r * r })
		},
		generateHollowSphere: function (x, y, z, r) {
			return this.generateWithConstraint([x - r, x + r], [y - r, y + r], [z - r, z + r], (_x, _y, _z) => { return (_x - x) * (_x - x) + (_y - y) * (_y - y) + (_z - z) * (_z - z) >= (r - 1) * (r - 1) && (_x - x) * (_x - x) + (_y - y) * (_y - y) + (_z - z) * (_z - z) < r * r })
		},
		generateWithConstraint: function (x_span, y_span, z_span, constraint) {
			let coordinateArray = [];



			const x_step = 1 / 3;
			const y_step = 1 / 3;
			const z_step = 1 / 3;


			if (x_span[0] >= x_span[1])
				[x_span[0], x_span[1]] = [x_span[1], x_span[0]]

			if (y_span[0] >= y_span[1])
				[y_span[0], y_span[1]] = [y_span[1], y_span[0]]

			if (z_span[0] >= z_span[1])
				[z_span[0], z_span[1]] = [z_span[1], z_span[0]]


			function verifier(x, y, z) {
				for (let _x = Math.max(x - x_step, x_span[0]); _x <= Math.min(x + x_step, x_span[1]); _x += x_step)
					for (let _z = Math.max(z - z_step, z_span[0]); _z <= Math.min(z + z_step, z_span[1]); _z += z_step)
						for (let _y = Math.max(y - y_step, y_span[0]); _y <= Math.min(y + y_step, y_span[1]); _y += y_step)
							if (constraint(_x, _y, _z)) return true
				return false
			}

			for (let x = x_span[0]; x <= x_span[1]; x += 1)
				for (let z = z_span[0]; z <= z_span[1]; z += 1)
					for (let y = y_span[0]; y <= y_span[1]; y += 1)
						if (verifier(x, y, z))
							coordinateArray.push(new Coordinate(x, y, z))
			// function isRedundant(coordinateArray, newCoordinate) {
			// 	if (coordinateArray.length == 0) return false;
			// 	return (
			// 		coordinateArray[coordinateArray.length - 1].x == newCoordinate.x &&
			// 		coordinateArray[coordinateArray.length - 1].y == newCoordinate.y &&
			// 		coordinateArray[coordinateArray.length - 1].z == newCoordinate.z
			// 	)
			// }
			// for (let x = x_span[0]; x <= x_span[1]; x += x_step)
			// 	for (let z = z_span[0]; z <= z_span[1]; z += z_step)
			// 		for (let y = y_span[0]; y <= y_span[1]; y += y_step) 
			// 			if (constraint(x, y, z)) {
			// 				let newCoordinate = new Coordinate(Math.round(x), Math.round(y), Math.round(z))
			// 				if (!isRedundant(coordinateArray, newCoordinate))
			// 					coordinateArray.push(newCoordinate)
			// 			}



			return coordinateArray

		},
		withBresenhamAlgorithm: {
			//Shamelessly adopted from http://members.chello.at/~easyfilter/bresenham.html (
			generateLineWithTwoPoints: function (x0, y0, z0, x1, y1, z1) {
				x0 = Math.round(x0)
				y0 = Math.round(y0)
				z0 = Math.round(z0)
				x1 = Math.round(x1)
				y1 = Math.round(y1)
				z1 = Math.round(z1)
				let coordinateArray = []
				let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
				let dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
				let dz = Math.abs(z1 - z0), sz = z0 < z1 ? 1 : -1;
				let dm = Math.max(dx, dy, dz), i = dm;
				x1 = y1 = z1 = Math.floor(dm / 2);

				for (; ;) {
					coordinateArray.push(new Coordinate(x0, y0, z0));
					if (i-- == 0) break;
					x1 -= dx; if (x1 < 0) { x1 += dm; x0 += sx; }
					y1 -= dy; if (y1 < 0) { y1 += dm; y0 += sy; }
					z1 -= dz; if (z1 < 0) { z1 += dm; z0 += sz; }
				}
				return coordinateArray
			},
			generate2DEllipse: function (xm, ym, a, b) {
				let coordinateArray = []
				function setPixel(x, y) {
					coordinateArray.push(new Coordinate(x, y, 0))
				}
				var x = -a, y = 0;           /* II. quadrant from bottom left to top right */
				var e2, dx = (1 + 2 * x) * b * b;                              /* error increment  */
				var dy = x * x, err = dx + dy;                              /* error of 1.step */

				do {
					setPixel(xm - x, ym + y);                                 /*   I. Quadrant */
					setPixel(xm + x, ym + y);                                 /*  II. Quadrant */
					setPixel(xm + x, ym - y);                                 /* III. Quadrant */
					setPixel(xm - x, ym - y);                                 /*  IV. Quadrant */
					e2 = 2 * err;
					if (e2 >= dx) { x++; err += dx += 2 * b * b; }                   /* x step */
					if (e2 <= dy) { y++; err += dy += 2 * a * a; }                   /* y step */
				} while (x <= 0);

				while (y++ < b) {            /* too early stop for flat ellipses with a=1, */
					setPixel(xm, ym + y);                        /* -> finish tip of ellipse */
					setPixel(xm, ym - y);
				}
				return coordinateArray
			},

			generate2DCircle: function (xm, ym, r) {
				let coordinateArray = []
				function setPixel(x, y) {
					coordinateArray.push(new Coordinate(x, y, 0))
				}
				var x = -r, y = 0, err = 2 - 2 * r;                /* bottom left to top right */
				do {
					setPixel(xm - x, ym + y);                            /*   I. Quadrant +x +y */
					setPixel(xm - y, ym - x);                            /*  II. Quadrant -x +y */
					setPixel(xm + x, ym - y);                            /* III. Quadrant -x -y */
					setPixel(xm + y, ym + x);                            /*  IV. Quadrant +x -y */
					r = err;
					if (r <= y) err += ++y * 2 + 1;                                   /* y step */
					if (r > x || err > y) err += ++x * 2 + 1;                         /* x step */
				} while (x < 0);
				return coordinateArray
			},

			//Unsatisfactory. Will cause holes.
			generateFilledPlanarTriangle: function (x1, y1, z1, x2, y2, z2, x3, y3, z3) {
				let coordinateSet = new Set()
				let generateLine = this.generateLine
				generateLine(x2, y2, z2, x3, y3, z3).forEach(({ x, y, z }) => { generateLine(x1, y1, z1, x, y, z).forEach((coordinate) => { coordinateSet.add(coordinate) }) })
				return coordinateSet.values()
			},
			generateEllipseRect: function (x0, y0, x1, y1) {                              /* rectangular parameter enclosing the ellipse */
				var a = Math.abs(x1 - x0), b = Math.abs(y1 - y0), b1 = b & 1;        /* diameter */
				var dx = 4 * (1.0 - a) * b * b, dy = 4 * (b1 + 1) * a * a;              /* error increment */
				var err = dx + dy + b1 * a * a, e2;                             /* error of 1.step */

				if (x0 > x1) { x0 = x1; x1 += a; }        /* if called with swapped points */
				if (y0 > y1) y0 = y1;                                  /* .. exchange them */
				y0 += (b + 1) >> 1; y1 = y0 - b1;                              /* starting pixel */
				a = 8 * a * a; b1 = 8 * b * b;

				do {
					setPixel(x1, y0);                                      /*   I. Quadrant */
					setPixel(x0, y0);                                      /*  II. Quadrant */
					setPixel(x0, y1);                                      /* III. Quadrant */
					setPixel(x1, y1);                                      /*  IV. Quadrant */
					e2 = 2 * err;
					if (e2 <= dy) { y0++; y1--; err += dy += a; }                 /* y step */
					if (e2 >= dx || 2 * err > dy) { x0++; x1--; err += dx += b1; }       /* x */
				} while (x0 <= x1);

				while (y0 - y1 <= b) {                /* too early stop of flat ellipses a=1 */
					setPixel(x0 - 1, y0);                         /* -> finish tip of ellipse */
					setPixel(x1 + 1, y0++);
					setPixel(x0 - 1, y1);
					setPixel(x1 + 1, y1--);
				}
			}

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
			blockType.blockState[directionRelatedBlockStateKey] = directionMap[directionMark];
			return blockType;
		},

	},
};

export { utils };