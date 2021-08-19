import { systemInstance as system, Description, Usage, Block, Coordinate, Position, BlockType, BuildInstruction, canonicalGeneratorFactory } from 'norma-core';
import { mcfont } from "./font.js"
system.registerCanonicalGenerator({
    description:
        new Description("铁路生成器（DrZaofu版）",
            new Usage(
                [],
                [],
                [],
                [
                    {
                        viewtype: "edittext",
                        text: "长度",
                        key: "length",
                    },
                    {
                        viewtype: "button",
                        text: "类型",
                        key: "Type",
                        data: [
                            { value: "OG", text: "地上铁" },
                            { value: "OR", text: "高架铁" },
                            { value: "UG", text: "地下铁" }
                        ]
                    },
                    {
                        viewtype: "edittext",
                        text: "高架铁的柱子向下多少格",
                        key: "ORpillar"
                    },
                    {
                        viewtype: "edittext",
                        text: "地上铁与高架铁的桥墩间隔",
                        key: "gap"
                    },
                    {
                        viewtype: "checkbox",
                        text: "照明",
                        key: "light",
                        data: [
                            { value: true, text: "是" },
                            { value: false, text: "否" }
                        ]
                    },
                    {
                        viewtype: "edittext",
                        text: "轨道数",
                        key: "numberOfTrack",
                    },
                    {
                        viewtype: "button",
                        text: "主题",
                        key: "style",
                        data: [
                            { value: "Q", text: "石英" },
                            { value: "S", text: "石砖" },
                            { value: "G", text: "玻璃" }
                        ]
                    }
                ])
        ),
    criteria: {
        positionArrayLength: 1,
        blockTypeArrayLength: 0,
        directionArrayLength: 1
    },
    option: {
        "length": 50,
        "Type": "UG",
        "ORpillar": 20,
        "gap": 15,
        "light": true,
        "numberOfTrack": 1,
        "style": "S"
    },
    method: {
        generate: function (e) {

            let { logger } = e.runtime

            let blockArray = []


            let positionArray = e.state.positions
            let blockTypeArray = e.state.blockTypes
            let directionArray = e.state.directions
            let option = e.state

            let directionMark = (function () {
                if (-45 <= directionArray[0].y && directionArray[0].y <= 45) return "+z"
                else if (-135 <= directionArray[0].y && directionArray[0].y <= -45) return "+x"
                else if (45 <= directionArray[0].y && directionArray[0].y <= 135) return "-x"
                else return "-z"
            }())



            let sections = {
                "UG": [//地下铁
                    [
                        [1, 2, 1],
                        [1, 3, 0],
                        [1, 0, 0],
                        [1, 0, 0],
                        [1, 4, 0],
                        [1, 2, 1]
                    ],
                    [
                        [1],
                        [11],
                        [0],
                        [0],
                        [9],
                        [10]
                    ],
                    [
                        [1, 2, 1],
                        [0, 7, 0],
                        [0, 0, 0],
                        [0, 0, 0],
                        [0, 8, 0],
                        [1, 2, 1]
                    ],
                    [
                        [1, 2, 1],
                        [0, 5, 1],
                        [0, 0, 1],
                        [0, 0, 1],
                        [0, 6, 1],
                        [1, 2, 1]
                    ]
                ],
                "OR": [//高架铁
                    [
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [12, 0],
                        [2, 1],
                        [1, 1],
                        [1, 1],
                        [5, 1],
                    ],
                    [
                        [11],
                        [0],
                        [0],
                        [0],
                        [0],
                        [9],
                        [10],
                        [1],
                        [1],
                        [1]
                    ],
                    [
                        [0, 0, 0],
                        [0, 0, 0],
                        [0, 0, 0],
                        [0, 0, 0],
                        [0, 0, 0],
                        [0, 8, 0],
                        [1, 2, 1],
                        [1, 1, 1],
                        [1, 1, 1],
                        [1, 1, 1]
                    ],
                    [
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 12],
                        [1, 2],
                        [1, 1],
                        [1, 1],
                        [1, 3]
                    ],
                    [
                        option.gap,//间隔长度
                        [0, 0 - option.ORpillar, 0],//相对坐标 后面格式跟this一样
                        [
                            [11, 11],
                            [11, 0],
                            [11, 0],
                            [11, 0],
                            [11, 0],
                            [12, 0],
                            [2, 1],
                            [1, 1],
                            [1, 1],
                            [5, 1]
                        ].concat(JSON.parse(("[" + (JSON.stringify([-1, -1]) + ",").repeat(option.ORpillar) + "]").replace(",]", "]"))),
                        [
                            [11],
                            [0],
                            [0],
                            [0],
                            [0],
                            [9],
                            [10],
                            [1],
                            [1],
                            [1]
                        ].concat(JSON.parse(("[" + (JSON.stringify([1]) + ",").repeat(option.ORpillar) + "]").replace(",]", "]"))),
                        [
                            [11, 11, 11],
                            [0, 13, 0],
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 8, 0],
                            [1, 2, 1],
                            [1, 1, 1],
                            [1, 1, 1],
                            [1, 1, 1]
                        ].concat(JSON.parse(("[" + (JSON.stringify([-1, -1]) + ",").repeat(option.ORpillar) + "]").replace(",]", "]"))),
                        [
                            [11, 11],
                            [0, 11],
                            [0, 11],
                            [0, 11],
                            [0, 11],
                            [0, 12],
                            [1, 2],
                            [1, 1],
                            [1, 1],
                            [1, 3]
                        ].concat(JSON.parse(("[" + (JSON.stringify([-1, -1]) + ",").repeat(option.ORpillar) + "]").replace(",]", "]")))
                    ]
                ],
                "OG": [//地上铁
                    [
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [11, 0],
                        [11, 0],
                        [11, 0],
                        [2, 1]
                    ],
                    [
                        [0],
                        [11],
                        [0],
                        [0],
                        [0],
                        [0],
                        [9],
                        [10],
                    ],
                    [
                        [0, 0, 0],
                        [0, 0, 0],
                        [0, 0, 0],
                        [0, 0, 0],
                        [0, 0, 0],
                        [0, 0, 0],
                        [0, 11, 0],
                        [1, 2, 1]
                    ],
                    [
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 11],
                        [0, 11],
                        [0, 11],
                        [1, 2]
                    ],
                    [
                        option.gap,//间隔长度
                        [0, 0, 0],//相对坐标 后面格式跟this一样
                        [
                            [12, 12],
                            [12, 0],
                            [12, 0],
                            [12, 0],
                            [12, 0],
                            [12, 0],
                            [12, 0],
                            [2, 1]
                        ],
                        [
                            [12],
                            [11],
                            [0],
                            [0],
                            [0],
                            [0],
                            [9],
                            [10]
                        ],
                        [
                            [12, 12, 12],
                            [0, 13, 0],
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 0, 0],
                            [0, 11, 0],
                            [1, 2, 1]
                        ],
                        [
                            [12, 12],
                            [0, 12],
                            [0, 12],
                            [0, 12],
                            [0, 12],
                            [0, 12],
                            [0, 12],
                            [1, 2]
                        ]
                    ]
                ]
            }

            let style = {
                "Q": [
                    new BlockType("minecraft:air", {}),
                    new BlockType("minecraft:quartz_block", { "chisel_type": "default", "pillar_axis": "y" }),
                    option.light ? new BlockType("minecraft:glowstone", {}) : new BlockType("minecraft:quartz_block", { "chisel_type": "default", "pillar_axis": "y" }),
                    new BlockType("minecraft:quartz_stairs", { "weirdo_direction": directionMark == "-x" ? 2 : directionMark == "-z" ? 1 : directionMark == "+x" ? 3 : 0, "upside_down_bit": true }),
                    new BlockType("minecraft:quartz_stairs", { "weirdo_direction": directionMark == "-x" ? 2 : directionMark == "-z" ? 1 : directionMark == "+x" ? 3 : 0, "upside_down_bit": false }),
                    new BlockType("minecraft:quartz_stairs", { "weirdo_direction": directionMark == "+x" ? 2 : directionMark == "+z" ? 1 : directionMark == "-x" ? 3 : 0, "upside_down_bit": true }),
                    new BlockType("minecraft:quartz_stairs", { "weirdo_direction": directionMark == "+x" ? 2 : directionMark == "+z" ? 1 : directionMark == "-x" ? 3 : 0, "upside_down_bit": false }),
                    new BlockType("minecraft:stone_slab", { "stone_slab_type": "quartz", "top_slot_bit": true }),
                    new BlockType("minecraft:stone_slab", { "stone_slab_type": "quartz", "top_slot_bit": false }),
                    new BlockType("minecraft:golden_rail", { "rail_data_bit": true, "rail_direction": directionMark == "-x" || directionMark == "+x" ? 1 : 0 }),
                    new BlockType("minecraft:redstone_block", {}),
                    new BlockType("minecraft:glass_pane", {}),
                    new BlockType("minecraft:quartz_block", { "chisel_type": "lines", "pillar_axis": "y" }),
                    new BlockType("minecraft:lantern", { "hanging": true })
                ],
                "S": [
                    new BlockType("minecraft:air", {}),
                    new BlockType("minecraft:stonebrick", { "stone_brick_type": "default" }),
                    option.light ? new BlockType("minecraft:glowstone", {}) : new BlockType("minecraft:stonebrick", { "stone_brick_type": "default" }),
                    new BlockType("minecraft:stone_brick_stairs", { "weirdo_direction": directionMark == "-x" ? 2 : directionMark == "-z" ? 1 : directionMark == "+x" ? 3 : 0, "upside_down_bit": true }),
                    new BlockType("minecraft:stone_brick_stairs", { "weirdo_direction": directionMark == "-x" ? 2 : directionMark == "-z" ? 1 : directionMark == "+x" ? 3 : 0, "upside_down_bit": false }),
                    new BlockType("minecraft:stone_brick_stairs", { "weirdo_direction": directionMark == "+x" ? 2 : directionMark == "+z" ? 1 : directionMark == "-x" ? 3 : 0, "upside_down_bit": true }),
                    new BlockType("minecraft:stone_brick_stairs", { "weirdo_direction": directionMark == "+x" ? 2 : directionMark == "+z" ? 1 : directionMark == "-x" ? 3 : 0, "upside_down_bit": false }),
                    new BlockType("minecraft:stone_slab", { "stone_slab_type": "stone_brick", "top_slot_bit": true }),
                    new BlockType("minecraft:stone_slab", { "stone_slab_type": "stone_brick", "top_slot_bit": false }),
                    new BlockType("minecraft:golden_rail", { "rail_data_bit": true, "rail_direction": directionMark == "-x" || directionMark == "+x" ? 1 : 0 }),
                    new BlockType("minecraft:redstone_block", {}),
                    new BlockType("minecraft:iron_bars", {}),
                    new BlockType("minecraft:cobblestone_wall", { "wall_block_type": "stone_brick" }),
                    new BlockType("minecraft:lantern", { "hanging": true })
                ],
                "G": [
                    new BlockType("minecraft:air", {}),
                    new BlockType("minecraft:glass", {}),
                    option.light ? new BlockType("minecraft:sealantern", {}) : new BlockType("minecraft:glass", {}),
                    new BlockType("minecraft:iron_trapdoor", { "direction": 0, "upside_down_bit": true, "open_bit": false }),
                    new BlockType("minecraft:iron_trapdoor", { "direction": 0, "upside_down_bit": false, "open_bit": false }),
                    new BlockType("minecraft:iron_trapdoor", { "direction": 0, "upside_down_bit": true, "open_bit": false }),
                    new BlockType("minecraft:iron_trapdoor", { "direction": 0, "upside_down_bit": false, "open_bit": false }),
                    new BlockType("minecraft:iron_trapdoor", { "direction": 0, "upside_down_bit": true, "open_bit": false }),
                    new BlockType("minecraft:iron_trapdoor", { "direction": 0, "upside_down_bit": false, "open_bit": false }),
                    new BlockType("minecraft:golden_rail", { "rail_data_bit": true, "rail_direction": directionMark == "-x" || directionMark == "+x" ? 1 : 0 }),
                    new BlockType("minecraft:redstone_block", {}),
                    new BlockType("minecraft:glass_pane", {}),
                    new BlockType("minecraft:sealantern", {}),
                    new BlockType("minecraft:air", {})
                ]
            }
            let section = [sections[option.Type][0], sections[option.Type][3]]
            for (let i = 0; i < option.numberOfTrack; i++) {
                section.splice(1, 0, sections[option.Type][1])
                if ((i + 1) < option.numberOfTrack) {
                    section.splice(1, 0, sections[option.Type][2])
                }
            }



            let running_position = [0, section[0].length - 1, 0]
            section.forEach(
                (tmp_big_array) => {
                    tmp_big_array.forEach(
                        (tmp_small_array) => {
                            tmp_small_array.forEach(
                                (tmp_point) => {
                                    if (tmp_point != -1) {
                                        directionMark == "-z" ? blockArray.push({ "type": "fill", "data": { blockType: style[option.style][tmp_point], startCoordinate: { x: positionArray[0].coordinate.x + running_position[0], y: positionArray[0].coordinate.y + running_position[1], z: positionArray[0].coordinate.z - running_position[2] }, endCoordinate: { x: positionArray[0].coordinate.x + running_position[0], y: positionArray[0].coordinate.y + running_position[1], z: positionArray[0].coordinate.z - running_position[2] - option.length } } })
                                            : directionMark == "+x" ? blockArray.push({ "type": "fill", "data": { blockType: style[option.style][tmp_point], startCoordinate: { x: positionArray[0].coordinate.x + running_position[2], y: positionArray[0].coordinate.y + running_position[1], z: positionArray[0].coordinate.z + running_position[0] }, endCoordinate: { x: positionArray[0].coordinate.x + running_position[2] + option.length, y: positionArray[0].coordinate.y + running_position[1], z: positionArray[0].coordinate.z + running_position[0] } } })
                                                : directionMark == "+z" ? blockArray.push({ "type": "fill", "data": { blockType: style[option.style][tmp_point], startCoordinate: { x: positionArray[0].coordinate.x - running_position[0], y: positionArray[0].coordinate.y + running_position[1], z: positionArray[0].coordinate.z + running_position[2] }, endCoordinate: { x: positionArray[0].coordinate.x - running_position[0], y: positionArray[0].coordinate.y + running_position[1], z: positionArray[0].coordinate.z + running_position[2] + option.length } } })
                                                    : blockArray.push({ "type": "fill", "data": { blockType: style[option.style][tmp_point], startCoordinate: { x: positionArray[0].coordinate.x - running_position[2], y: positionArray[0].coordinate.y + running_position[1], z: positionArray[0].coordinate.z - running_position[0] }, endCoordinate: { x: positionArray[0].coordinate.x - running_position[2] - option.length, y: positionArray[0].coordinate.y + running_position[1], z: positionArray[0].coordinate.z - running_position[0] } } })
                                    }
                                    running_position[0] += 1
                                }
                            )
                            running_position[0] -= tmp_small_array.length
                            running_position[1] -= 1
                        }
                    )
                    running_position[0] += tmp_big_array[0].length
                    running_position[1] += tmp_big_array.length
                }
            )
            blockArray.splice(0, 0, { "type": "fill", "data": { blockType: style[option.style][0], startCoordinate: blockArray[0].data.startCoordinate, endCoordinate: blockArray[blockArray.length - 1].data.endCoordinate } })
            // logger.debug(blockArray[0])
            // logger.debug(blockArray[1])
            if (sections[option.Type][4]) {
                let gaps = [sections[option.Type][4][2], sections[option.Type][4][5]]
                for (let i = 0; i < option.numberOfTrack; i++) {
                    gaps.splice(1, 0, sections[option.Type][4][3])
                    if ((i + 1) < option.numberOfTrack) {
                        gaps.splice(1, 0, sections[option.Type][4][4])
                    }
                }
                let running_position_gap
                for (let gap = sections[option.Type][4][0]; gap < option.length; gap += option.gap) {
                    running_position_gap = [0 + sections[option.Type][4][1][0], gaps[0].length - 1 + sections[option.Type][4][1][1], 0 + sections[option.Type][4][1][2]]
                    gaps.forEach(
                        (tmp_big_array_gap) => {
                            tmp_big_array_gap.forEach(
                                (tmp_small_array_gap) => {
                                    tmp_small_array_gap.forEach(
                                        (tmp_point_gap) => {
                                            if (tmp_point_gap != -1) {
                                                directionMark == "-z" ? blockArray.push({ "blockType": style[option.style][tmp_point_gap], "position": { "coordinate": { x: positionArray[0].coordinate.x + running_position_gap[0], y: positionArray[0].coordinate.y + running_position_gap[1], z: positionArray[0].coordinate.z - running_position_gap[2] - gap }, "tickingArea": positionArray[0].tickingArea } })
                                                    : directionMark == "+x" ? blockArray.push({ "blockType": style[option.style][tmp_point_gap], "position": { "coordinate": { x: positionArray[0].coordinate.x + running_position_gap[2] + gap, y: positionArray[0].coordinate.y + running_position_gap[1], z: positionArray[0].coordinate.z + running_position_gap[0] }, "tickingArea": positionArray[0].tickingArea } })
                                                        : directionMark == "+z" ? blockArray.push({ "blockType": style[option.style][tmp_point_gap], "position": { "coordinate": { x: positionArray[0].coordinate.x - running_position_gap[0], y: positionArray[0].coordinate.y + running_position_gap[1], z: positionArray[0].coordinate.z + running_position_gap[2] + gap }, "tickingArea": positionArray[0].tickingArea } })
                                                            : blockArray.push({ "blockType": style[option.style][tmp_point_gap], "position": { "coordinate": { x: positionArray[0].coordinate.x - running_position_gap[2] - gap, y: positionArray[0].coordinate.y + running_position_gap[1], z: positionArray[0].coordinate.z - running_position_gap[0] }, "tickingArea": positionArray[0].tickingArea } })
                                            }
                                            running_position_gap[0] += 1
                                        }
                                    )
                                    running_position_gap[0] -= tmp_small_array_gap.length
                                    running_position_gap[1] -= 1
                                }
                            )
                            running_position_gap[0] += tmp_big_array_gap[0].length
                            running_position_gap[1] += tmp_big_array_gap.length
                        }
                    )
                }
            }
            return blockArray
        }
    },
    UIHandler: function (e) {
    }
});

system.registerCanonicalGenerator({
    description: new Description("创建像素字", new Usage([], [], [], [
        {
            viewtype: "edittext",
            text: "内容",
            key: "keyText"
        },
        {
            viewtype: "checkbox",
            text: "垂直（向下延伸）",
            key: "isVertical",
            data: [
                { value: true, text: "是" },
                { value: false, text: "否" }
            ]
        },
        {
            viewtype: "checkbox",
            text: "平面",
            key: "isFlat",
            data: [
                { value: true, text: "是" },
                { value: false, text: "否" }
            ]
        }])),
    criteria: { positionArrayLength: 1, blockTypeArrayLength: 1, directionArrayLength: 1 },
    option: {
        "keyText": "NZ IS JULAO",
        "isFlat": false,
        "isVertical": false
    },
    method: {
        generate: function (e) {

            let blockArray = []
            let { logger } = e.runtime

            let positionArray = e.state.positions
            let blockTypeArray = e.state.blockTypes
            let directionArray = e.state.directions
            let option = e.state

            let directionMark = (function () {
                if (-45 <= directionArray[0].y && directionArray[0].y <= 45) return "+z"
                else if (-135 <= directionArray[0].y && directionArray[0].y <= -45) return "+x"
                else if (45 <= directionArray[0].y && directionArray[0].y <= 135) return "-x"
                else return "-z"
            }())

            let rawText = (function (text, mcfont) {//新版mcfont的解码
                let rawTextArray = []
                for (let i = 0; i < text.length; i++) {//i 每个字
                    rawTextArray.push((function (text, mcfont) {
                        if (text == " ") {//空格return 0
                            return 0
                        }
                        let cnm = mcfont.substring(text.charCodeAt() * 16, text.charCodeAt() * 16 + 16)
                        let wdnmd = []
                        let p
                        let u
                        for (let d = 0; d < 16; d++) {//d 16个Unicode
                            p = cnm.charCodeAt(d)
                            u = 65536
                            for (let m = 0; m < 16; m++) {// m 每次减少
                                u /= 2
                                if (p - u >= 0) {
                                    p -= u
                                    wdnmd.push(1)
                                }
                                else {
                                    wdnmd.push(0)
                                }
                            }
                        }
                        return wdnmd
                    }
                    )(text[i], mcfont))
                }
                return rawTextArray
            })(option["keyText"], mcfont)

            /*let rawText = (function (text,mcfont) {
                let l
                l = []
                for (let i = 0; i < text.length; i++) {
                    if (text[i] == " ") {
                        l.push(0)
                    } else {
                        l.push(mcfont[text.charCodeAt(i)])
                    }
                }
                return(l)
            })(option["keyText"], presetBuildings.mcfont)*/ //旧版mcfont的解码
            let tempPosition = [0, 15, 0]
            if (option["isVertical"]) {
                tempPosition[1] = 0
            }
            //t = 每个字
            //i = 每列
            //z = 每行

            let u
            for (let t = 0; t < rawText.length; t++) {
                for (let i = 0; i < 16; i++) {
                    for (let z = 0; z < 16; z++) {
                        if (rawText[t][i * 16 + z]) {
                            if (option["isFlat"]) {
                                if (directionMark == "-z") {
                                    blockArray.push({ "position": { "coordinate": { "x": positionArray[0].coordinate.x + tempPosition[0], "y": positionArray[0].coordinate.y + tempPosition[2], "z": positionArray[0].coordinate.z - tempPosition[1] }, "tickingArea": positionArray[0].tickingArea }, "blockType": blockTypeArray[0] })
                                } else
                                    if (directionMark == "+x") {
                                        blockArray.push({ "position": { "coordinate": { "x": positionArray[0].coordinate.x + tempPosition[1], "y": positionArray[0].coordinate.y + tempPosition[2], "z": positionArray[0].coordinate.z + tempPosition[0] }, "tickingArea": positionArray[0].tickingArea }, "blockType": blockTypeArray[0] })
                                    } else
                                        if (directionMark == "+z") {
                                            blockArray.push({ "position": { "coordinate": { "x": positionArray[0].coordinate.x - tempPosition[0], "y": positionArray[0].coordinate.y + tempPosition[2], "z": positionArray[0].coordinate.z + tempPosition[1] }, "tickingArea": positionArray[0].tickingArea }, "blockType": blockTypeArray[0] })
                                        } else
                                            if (directionMark == "-x") {
                                                blockArray.push({ "position": { "coordinate": { "x": positionArray[0].coordinate.x - tempPosition[1], "y": positionArray[0].coordinate.y + tempPosition[2], "z": positionArray[0].coordinate.z - tempPosition[0] }, "tickingArea": positionArray[0].tickingArea }, "blockType": blockTypeArray[0] })
                                            }
                            } else {
                                if (directionMark == "-z") {
                                    blockArray.push({ "position": { "coordinate": { "x": positionArray[0].coordinate.x + tempPosition[0], "y": positionArray[0].coordinate.y + tempPosition[1], "z": positionArray[0].coordinate.z + tempPosition[2] }, "tickingArea": positionArray[0].tickingArea }, "blockType": blockTypeArray[0] })
                                } else
                                    if (directionMark == "+x") {
                                        blockArray.push({ "position": { "coordinate": { "x": positionArray[0].coordinate.x + tempPosition[2], "y": positionArray[0].coordinate.y + tempPosition[1], "z": positionArray[0].coordinate.z + tempPosition[0] }, "tickingArea": positionArray[0].tickingArea }, "blockType": blockTypeArray[0] })
                                    } else
                                        if (directionMark == "+z") {
                                            blockArray.push({ "position": { "coordinate": { "x": positionArray[0].coordinate.x - tempPosition[0], "y": positionArray[0].coordinate.y + tempPosition[1], "z": positionArray[0].coordinate.z + tempPosition[2] }, "tickingArea": positionArray[0].tickingArea }, "blockType": blockTypeArray[0] })
                                        } else
                                            if (directionMark == "-x") {
                                                blockArray.push({ "position": { "coordinate": { "x": positionArray[0].coordinate.x + tempPosition[2], "y": positionArray[0].coordinate.y + tempPosition[1], "z": positionArray[0].coordinate.z - tempPosition[0] }, "tickingArea": positionArray[0].tickingArea }, "blockType": blockTypeArray[0] })
                                            }
                            }
                        }
                        tempPosition[0] += 1
                    }
                    tempPosition[1] += -1
                    tempPosition[0] += -16
                }
                if (t + 2 > rawText.length) {
                    break
                }
                if (option["isVertical"]) {
                    for (let d = 0; d < 16; d++) {
                        u = 0
                        for (let q = 0; q < 16; q++) {
                            if (rawText[t + 1][d * 16 + 15 - q] != 1) {
                                u++
                            }
                        }
                        if (u == 16) {
                            tempPosition[1] += 1
                        } else {
                            break
                        }
                    }
                    if (rawText[t] == 0) {
                        tempPosition[1] += -8
                    }
                } else {
                    tempPosition[1] += 16
                    for (let d = 0; d < 16; d++) {
                        u = 0
                        for (let q = 0; q < 16; q++) {
                            if (rawText[t][q * 16 + 15 - d] != 1) {
                                u++
                            }
                        }
                        if (u == 16) {
                            tempPosition[0] += -1
                        } else {
                            break
                        }
                    }
                    if (rawText[t] == 0) {
                        tempPosition[0] += 8
                    }
                    tempPosition[0] += 17
                }
            }
            return blockArray

        }
    }
});