//TODO:Wrap up the constructor && find better solution.
class Coordinate {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
class Position {
    constructor(coordinate, tickingArea) {
        this.coordinate = coordinate;
        this.tickingArea = tickingArea;
    }
}
class BlockType {
    constructor(blockIdentifier, blockState) {
        this.blockIdentifier = blockIdentifier;
        this.blockState = blockState;
    }
}
class Block {
    constructor(position, blockType) {
        this.position = position;
        this.blockType = blockType;
    }
}

class Usage {
    constructor(positionUsageArray, blockTypeUsageArray, optionUsage) {
        this.positionUsageArray = positionUsageArray;
        this.blockTypeUsageArray = blockTypeUsageArray;
        this.optionUsage = optionUsage;
    }
}
class Description {
    constructor(name, usage) {
        this.name = name;
        this.usage = usage;
    }
}
//TODO:Refactor generator
class Generator {
    constructor(description, option, positionArray, blockTypeArray,
        addPosition, addBlockType, removePosition, removeBlockType,
        validateParameter, generate, postGenerate) {
        this.description = description;

        this.option = option;
        this.positionArray = positionArray;
        this.blockTypeArray = blockTypeArray;

        this.addPosition = addPosition;
        this.addBlockType = addBlockType;
        this.removePosition = removePosition;
        this.removeBlockType = removeBlockType;

        this.validateParameter = validateParameter;
        this.generate = generate;
        this.postGenerate = postGenerate;
    }
}

export { Coordinate, Position, BlockType, Block, Usage, Description, Generator }