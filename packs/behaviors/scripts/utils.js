// eslint-disable-next-line no-unused-vars
import { Coordinate, BlockType, Direction, Generator } from "./constructor";

let utils = {
	setter: {
		setLogger: function (logger) {
			utils.logger = logger
		}
	},
	misc: {
		generatePlayerIDFromUniqueID: function (uniqueID) {
			let low = uniqueID["64bit_low"] % 10000
			let high = uniqueID["64bit_high"] % 10000
			//hash function:

			return (low + high) * (low + high + 1) / 2 + high;
		}
	},

};

export { utils };