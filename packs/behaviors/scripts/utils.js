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
class Parameter {
    constructor(positionArray, blockTypeArray, specialValueArray) {
        this.positionArray = positionArray;
        this.blockTypeArray = blockTypeArray;
        this.specialValueArray = specialValueArray;
    }
}
class LengthRequired {
    constructor(positionArrayLengthRequired, blockTypeArrayLengthRequired, specialValueArrayLengthRequired) {
        this.positionArray = positionArrayLengthRequired;
        this.blockTypeArray = blockTypeArrayLengthRequired;
        this.specialValueArrayLengthRequired = specialValueArrayLengthRequired
    }
}
class Usage {
    constructor(positionUsageArray, blockTypeUsageArray, specialValueUsageArray) {
        this.positionUsageArray = positionUsageArray;
        this.blockTypeUsageArray = blockTypeUsageArray;
        this.specialValueUsageArray = specialValueUsageArray;
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
    constructor(description, parameter, lengthRequired, mainGenerator, parameterValidator) {
        this.description = description;
        this.parameter = parameter
        this.lengthRequired = lengthRequired;
        this.mainGenerator = mainGenerator;
        this.parameterValidator = parameterValidator
    }
}

export { Coordinate, Position, BlockType, Block, Parameter, LengthRequired, Usage, Description, Generator }