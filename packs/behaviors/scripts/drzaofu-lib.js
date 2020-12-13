let TODO
const __drzf = {
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
        for (let i = 0; response_text.length > length;i++) {
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
    arrayMUL: function (length,array) {
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
            return array[this.int(0,array.length)]
        }
    },
    strip: TODO,//python的strip方法
    lstrip: TODO,//python的lstrip方法
    rstrip: TODO,//python的rstrip方法
    PIL: TODO,//python的pil的image操作，传入大小等等，返回一个array，里面是相对坐标
    nc: {
        pigeon: function (length) {
            let return_ = ""
            let 鸽子用语 = "咕？！。鸽".split("")
            for (let 咕 = 0; 咕 <= length; 咕++) {
                return_ += drzf.random.choice(鸽子用语)
                console.log(drzf.random.choice(鸽子用语))
                console.log(return_)
            }
            return "咕咕咕？"+return_
        },
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
        __generator: function (option_form, positions_number, blocks_number, directions_number, default_option, generate_algorithm) {//这个东西咕了，因为有utils.generators.canonical.generatorConstrctor
            //TODO
            //减少new Generator时的参数
            return {
                "description": {
                    "positionUsage": [],
                    "blockTypeUsage": [],
                    "directionUsage": [],
                    "optionUsage": option_form,//TODO 重置掉dzx的垃圾api，重新写一套
                },
                "positionArray": drzf.arrayMUL(positions_number, [undefined]),
                "blockTypeArray": drzf.arrayMUL(blocks_number, [undefined]),
                "directionArray": drzf.arrayMUL(directions_number, [undefined]),
                "option": default_option,//TODO 重置掉dzx的垃圾api，重新写一套
                "addPosition": function (position) {
                    utils.generators.canonical.addFunction("坐标", position, this.positionArray)
                },
                "addBlockType": function(blockType) {
                    utils.generators.canonical.addFunction("方块类型", blockType, this.blockTypeArray)
                },
                "addDirection": function(direction) {
                    utils.generators.canonical.addFunction("方向", direction, this.directionArray)
                },
                "removePosition": function(index) {
                    utils.generators.canonical.removeFunction(index, this.positionArray)
                },
                "removeBlockType": function(index) {
                    utils.generators.canonical.removeFunction(index, this.blockTypeArray)
                },
                "removeDirection": function(index) {
                    utils.generators.canonical.removeFunction(index, this.directionArray)
                },
                "validateParameter": function() {
                    return utils.generators.canonical.validateParameter.call(this)
                },
                "generate": generate_algorithm,
                "postGenerate": function () {
                    this.positionArray = this.positionArray.fill(undefined)
                    this.blockTypeArray = this.blockTypeArray.fill(undefined)
                    this.directionArray = this.directionArray.fill(undefined)
                },
                "UIHandler": undefined,
            }
        }
    }
}
let drzf = {}
export { drzf }