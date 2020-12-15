let TODO
const drzf = {
    replace: function (text, before, after) {
        return text.split(before).join(after)
    },
    rjust: function (text, length, fillchar) {
        let response_text = text
        for (; response_text.length < length;) {
            response_text = fillchar + response_text
        }
        while (response_text.length > length) {
            response_text = response_text.substring(1, response_text.length)
        }
        return response_text
    },
    ljust: function (text, length, fillchar) {
        let response_text = text
        for (; response_text.length < length;) {
            response_text = response_text + fillchar
        }
        while (response_text.length > length) {
            response_text = response_text.substring(0, response_text.length - 1)
        }
        return response_text
    },
    center: function (text, length, fillchar) {
        let response_text = text
        for (; response_text.length < length;) {
            last = response_text
            response_text = fillchar + response_text + fillchar
        }
        for (let i = 0; response_text.length > length; i++) {
            if (response_text.length % 2 == 0) {
                response_text = response_text.substring(1, response_text.length - 1)
            } else if (i % 2 == 0) {
                response_text = response_text.substring(0, response_text.length - 1)
            } else {
                response_text = response_text.substring(1, response_text.length)
            }
        }
        return response_text
    },
    arrayMUL: function (length, array) {
        let response_array = []
        for (let i = 0; i < length; i++) {
            response_array = response_array.concat(array)
        }
        return response_array
    },
    random: {
        int: function (min, max, step = 1) {
            return Math.floor(Math.random() * (max - min) / step) * step + min;
            /*let random = Math.random()
            for (let i = 1; i - 1 <= (stop - start) / step; i++) {   //乌龟一样慢
                if (random <= i / (stop - start) * step) {
                    return (i + start) * step - 1
                }
            }*/
        },
        choice: function (array) {
            return array[this.int(0, array.length)]
        }
    },
    strip: TODO,//python的strip方法
    lstrip: TODO,//python的lstrip方法
    rstrip: TODO,//python的rstrip方法
    PIL: TODO,//python的pil的image操作，传入大小等等，返回一个array，里面是相对坐标
    nc: {
        position: function (x, y, z, tickingArea) {
            if (Object.prototype.toString.call(x) === '[object Object]') {
                return [x.coordinate.x, x.coordinate.y, x.coordinate.z, x.tickingArea]
            } else {
                return [x, y, z, tickingArea]
            }
        },
        transPosition: function (fixed_position, using_position, directionMark, flat) {
            let running_position = using_position
            if (flat == "up") {
                running_position[0] = using_position[0]
                running_position[1] = using_position[2]
                running_position[2] = using_position[1]
            } else if (flat == "down") {
                running_position[0] = using_position[0]
                running_position[1] = 0 - using_position[2]
                running_position[2] = using_position[1]
            }
            if (directionMark == "-z") {
                return [fixed_position[0] + running_position[0], fixed_position[1] + running_position[1], fixed_position[2] - running_position[2], fixed_position[3]]
            } else if (directionMark == "+x") {
                return [fixed_position[0] + running_position[2], fixed_position[1] + running_position[1], fixed_position[2] + running_position[0], fixed_position[3]]
            } else if (directionMark == "+z") {
                return [fixed_position[0] - running_position[0], fixed_position[1] + running_position[1], fixed_position[2] + running_position[2], fixed_position[3]]
            } else {
                return [fixed_position[0] - running_position[2], fixed_position[1] + running_position[1], fixed_position[2] - running_position[0], fixed_position[3]]
            }
        },
        fill: function (start, end, blockType) {
            return {
                "type": "fill",
                "data": {
                    "blockType": blockType,
                    "startCoordinate": {
                        "x": start[0], "y": start[1], "z": start[2]
                    },
                    "endCoordinate": {
                        "x": end[0], "y": end[1], "z": end[2]
                    }
                }
            }
        },
        setblock: function (position, blockType) {
            return {
                "blockType": blockType,
                "position": {
                    "coordinate": {
                        "x": position[0],
                        "y": position[1],
                        "z": position[2]
                    },
                    "tickingArea": position[3]
                }
            }
        },
        clone: function (start, end, target) {
            return {
                "type": "clone",
                "data": {
                    "startCoordinate": {
                        "x": start[0], "y": start[1], "z": start[2]
                    },
                    "endCoordinate": {
                        "x": end[0], "y": end[1], "z": end[2]
                    },
                    "targetCoordinate": {
                        x: target[0], y: target[1], z: target[2]
                    }
                }
            }
        },
        generator: function (option_form, positions_number, blocks_number, directions_number, default_option, generate_algorithm, UIHandler, onFunc) {//这个东西咕了，因为有utils.generators.canonical.generatorConstrctor
            //TODO
            //减少new Generator时的参数
            return {
                "description": {
                    "positionUsage": [],
                    "blockTypeUsage": [],
                    "directionUsage": [],
                    "optionUsage": [option_form],//TODO 重置掉dzx的垃圾api，重新写一套
                },
                "positionArray": new Array(positions_number).fill(undefined),
                "blockTypeArray": new Array(blocks_number).fill(undefined),
                "directionArray": new Array(directions_number).fill(undefined),
                "option": default_option,//TODO 重置掉dzx的垃圾api，重新写一套
                "addPosition": function (position) {
                    let indexOfVacancy = this.positionArray.indexOf(undefined)
                    if (indexOfVacancy == -1) logger.warn(`坐标过多，已移除新的坐标。`)
                    else {
                        this.positionArray[indexOfVacancy] = position
                        logger.info(`已设置新的坐标。`)
                    }
                },
                "addBlockType": function (blockType) {
                    let indexOfVacancy = this.blockTypeArray.indexOf(undefined)
                    if (indexOfVacancy == -1) logger.warn(`方块类型过多，已移除新的方块类型。`)
                    else {
                        this.blockTypeArray[indexOfVacancy] = blockType
                        logger.info(`已设置新的方块类型。`)
                    }
                },
                "addDirection": function (direction) {
                    let indexOfVacancy = this.directionArray.indexOf(undefined)
                    if (indexOfVacancy == -1) logger.warn(`方向过多，已移除新的方向。`)
                    else {
                        this.directionArray[indexOfVacancy] = direction
                        logger.info(`已设置新的方向。`)
                    }
                },
                "removePosition": function (index) {
                    if (index === undefined)
                        for (index = this.positionArray.length - 1; index >= 0 && this.positionArray[index] == undefined; index--);
                    if (index >= 0) this.positionArray[index] = undefined
                    logger.info(this.positionArray)
                },
                "removeBlockType": function (index) {
                    if (index === undefined)
                        for (index = this.blockTypeArray.length - 1; index >= 0 && this.blockTypeArray[index] == undefined; index--);
                    if (index >= 0) this.blockTypeArray[index] = undefined
                    logger.info(this.blockTypeArray)
                },
                "removeDirection": function (index) {
                    if (index === undefined)
                        for (index = this.directionArray.length - 1; index >= 0 && this.directionArray[index] == undefined; index--);
                    if (index >= 0) this.directionArray[index] = undefined
                    logger.info(this.directionArray)
                },
                "validateParameter": function () {
                    let result = new String()
                    if (this.blockTypeArray.indexOf(undefined) != -1)
                        result += "缺失方块类型，运行失败。\n"
                    if (this.positionArray.indexOf(undefined) != -1)
                        result += "缺失坐标，运行失败。\n"
                    if (this.directionArray.indexOf(undefined) != -1)
                        result += "缺失方向，运行失败。"
                    if (result == "") result = "success"
                    else logger.error(result)
                    return result;
                },
                "generate": generate_algorithm,
                "postGenerate": function () {
                    this.positionArray = this.positionArray.fill(undefined)
                    this.blockTypeArray = this.blockTypeArray.fill(undefined)
                    this.directionArray = this.directionArray.fill(undefined)
                },
                "UIHandler": UIHandler,
                "tag_func": tag_func
            }
        }
    }
}
export { drzf }