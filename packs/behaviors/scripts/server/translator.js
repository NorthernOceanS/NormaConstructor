// Block.js a custom implimentation to get block's id or data
// Bedrock v1.14
// by WavePlayz
let blockStateTranslator = {
    getID: function (blockName) {
        blockName = blockName.startsWith("minecraft:") ? blockName : "minecraft:" + blockName
        if (blockName in this._data)
            return this._data[blockName].id
    },
    getData: function (blockName, blockstate) {
        let data_value = 0 // by default

        blockName = blockName.startsWith("minecraft:") ? blockName : "minecraft:" + blockName
        if (blockName in this._data) {
            let entries = Object.entries(this._data[blockName].data)

            for (let entry = 0; entry < entries.length; entry++) {
                let dataStates = entries[entry][1]
                let match = true

                for (let key in dataStates) {
                    if (dataStates[key] != blockstate.data[key]) {
                        match = false
                        break
                    }
                }

                if (match) {
                    data_value = entries[entry][0]
                    break
                }
            }
        }
        return data_value
    },

    // Block's Info
    _data: {
        "minecraft:air": {
            "id": 0,
            "data": {}
        },
        "minecraft:stone": {
            "id": 1,
            "data": {
                "0": {
                    "stone_type": "stone"
                },
                "1": {
                    "stone_type": "granite"
                },
                "2": {
                    "stone_type": "granite_smooth"
                },
                "3": {
                    "stone_type": "diorite"
                },
                "4": {
                    "stone_type": "diorite_smooth"
                },
                "5": {
                    "stone_type": "andesite"
                },
                "6": {
                    "stone_type": "andesite_smooth"
                }
            }
        },
        "minecraft:grass": {
            "id": 2,
            "data": {}
        },
        "minecraft:dirt": {
            "id": 3,
            "data": {
                "0": {
                    "dirt_type": "normal"
                },
                "1": {
                    "dirt_type": "coarse"
                }
            }
        },
        "minecraft:cobblestone": {
            "id": 4,
            "data": {}
        },
        "minecraft:planks": {
            "id": 5,
            "data": {
                "0": {
                    "wood_type": "oak"
                },
                "1": {
                    "wood_type": "spruce"
                },
                "2": {
                    "wood_type": "birch"
                },
                "3": {
                    "wood_type": "jungle"
                },
                "4": {
                    "wood_type": "acacia"
                },
                "5": {
                    "wood_type": "dark_oak"
                }
            }
        },
        "minecraft:sapling": {
            "id": 6,
            "data": {
                "0": {
                    "sapling_type": "oak",
                    "age_bit": false
                },
                "1": {
                    "sapling_type": "spruce",
                    "age_bit": false
                },
                "2": {
                    "sapling_type": "birch",
                    "age_bit": false
                },
                "3": {
                    "sapling_type": "jungle",
                    "age_bit": false
                },
                "4": {
                    "sapling_type": "acacia",
                    "age_bit": false
                },
                "5": {
                    "sapling_type": "dark_oak",
                    "age_bit": false
                },
                "6": {
                    "sapling_type": "oak",
                    "age_bit": false
                },
                "7": {
                    "sapling_type": "oak",
                    "age_bit": false
                },
                "8": {
                    "sapling_type": "oak",
                    "age_bit": true
                },
                "9": {
                    "sapling_type": "spruce",
                    "age_bit": true
                },
                "10": {
                    "sapling_type": "birch",
                    "age_bit": true
                },
                "11": {
                    "sapling_type": "jungle",
                    "age_bit": true
                },
                "12": {
                    "sapling_type": "acacia",
                    "age_bit": true
                },
                "13": {
                    "sapling_type": "dark_oak",
                    "age_bit": true
                },
                "14": {
                    "sapling_type": "oak",
                    "age_bit": true
                },
                "15": {
                    "sapling_type": "oak",
                    "age_bit": true
                }
            }
        },
        "minecraft:bedrock": {
            "id": 7,
            "data": {}
        },
        "minecraft:flowing_water": {
            "id": 8,
            "data": {
                "0": {
                    "liquid_depth": 0
                },
                "1": {
                    "liquid_depth": 1
                },
                "2": {
                    "liquid_depth": 2
                },
                "3": {
                    "liquid_depth": 3
                },
                "4": {
                    "liquid_depth": 4
                },
                "5": {
                    "liquid_depth": 5
                },
                "6": {
                    "liquid_depth": 6
                },
                "7": {
                    "liquid_depth": 7
                },
                "8": {
                    "liquid_depth": 8
                },
                "9": {
                    "liquid_depth": 9
                },
                "10": {
                    "liquid_depth": 10
                },
                "11": {
                    "liquid_depth": 11
                },
                "12": {
                    "liquid_depth": 12
                },
                "13": {
                    "liquid_depth": 13
                },
                "14": {
                    "liquid_depth": 14
                },
                "15": {
                    "liquid_depth": 15
                }
            }
        },
        "minecraft:water": {
            "id": 9,
            "data": {
                "0": {
                    "liquid_depth": 0
                },
                "1": {
                    "liquid_depth": 1
                },
                "2": {
                    "liquid_depth": 2
                },
                "3": {
                    "liquid_depth": 3
                },
                "4": {
                    "liquid_depth": 4
                },
                "5": {
                    "liquid_depth": 5
                },
                "6": {
                    "liquid_depth": 6
                },
                "7": {
                    "liquid_depth": 7
                },
                "8": {
                    "liquid_depth": 8
                },
                "9": {
                    "liquid_depth": 9
                },
                "10": {
                    "liquid_depth": 10
                },
                "11": {
                    "liquid_depth": 11
                },
                "12": {
                    "liquid_depth": 12
                },
                "13": {
                    "liquid_depth": 13
                },
                "14": {
                    "liquid_depth": 14
                },
                "15": {
                    "liquid_depth": 15
                }
            }
        },
        "minecraft:flowing_lava": {
            "id": 10,
            "data": {
                "0": {
                    "liquid_depth": 0
                },
                "1": {
                    "liquid_depth": 1
                },
                "2": {
                    "liquid_depth": 2
                },
                "3": {
                    "liquid_depth": 3
                },
                "4": {
                    "liquid_depth": 4
                },
                "5": {
                    "liquid_depth": 5
                },
                "6": {
                    "liquid_depth": 6
                },
                "7": {
                    "liquid_depth": 7
                },
                "8": {
                    "liquid_depth": 8
                },
                "9": {
                    "liquid_depth": 9
                },
                "10": {
                    "liquid_depth": 10
                },
                "11": {
                    "liquid_depth": 11
                },
                "12": {
                    "liquid_depth": 12
                },
                "13": {
                    "liquid_depth": 13
                },
                "14": {
                    "liquid_depth": 14
                },
                "15": {
                    "liquid_depth": 15
                }
            }
        },
        "minecraft:lava": {
            "id": 11,
            "data": {
                "0": {
                    "liquid_depth": 0
                },
                "1": {
                    "liquid_depth": 1
                },
                "2": {
                    "liquid_depth": 2
                },
                "3": {
                    "liquid_depth": 3
                },
                "4": {
                    "liquid_depth": 4
                },
                "5": {
                    "liquid_depth": 5
                },
                "6": {
                    "liquid_depth": 6
                },
                "7": {
                    "liquid_depth": 7
                },
                "8": {
                    "liquid_depth": 8
                },
                "9": {
                    "liquid_depth": 9
                },
                "10": {
                    "liquid_depth": 10
                },
                "11": {
                    "liquid_depth": 11
                },
                "12": {
                    "liquid_depth": 12
                },
                "13": {
                    "liquid_depth": 13
                },
                "14": {
                    "liquid_depth": 14
                },
                "15": {
                    "liquid_depth": 15
                }
            }
        },
        "minecraft:sand": {
            "id": 12,
            "data": {
                "0": {
                    "sand_type": "red"
                }
            }
        },
        "minecraft:gravel": {
            "id": 13,
            "data": {}
        },
        "minecraft:gold_ore": {
            "id": 14,
            "data": {}
        },
        "minecraft:iron_ore": {
            "id": 15,
            "data": {}
        },
        "minecraft:coal_ore": {
            "id": 16,
            "data": {}
        },
        "minecraft:log": {
            "id": 17,
            "data": {
                "0": {
                    "old_log_type": "oak",
                    "pillar_axis": "y"
                },
                "1": {
                    "old_log_type": "spruce",
                    "pillar_axis": "y"
                },
                "2": {
                    "old_log_type": "birch",
                    "pillar_axis": "y"
                },
                "3": {
                    "old_log_type": "jungle",
                    "pillar_axis": "x"
                },
                "4": {
                    "old_log_type": "oak",
                    "pillar_axis": "x"
                },
                "5": {
                    "old_log_type": "spruce",
                    "pillar_axis": "x"
                },
                "6": {
                    "old_log_type": "birch",
                    "pillar_axis": "x"
                },
                "7": {
                    "old_log_type": "jungle",
                    "pillar_axis": "x"
                },
                "8": {
                    "old_log_type": "oak",
                    "pillar_axis": "z"
                },
                "9": {
                    "old_log_type": "spruce",
                    "pillar_axis": "z"
                },
                "10": {
                    "old_log_type": "birch",
                    "pillar_axis": "z"
                },
                "11": {
                    "old_log_type": "jungle",
                    "pillar_axis": "z"
                }
            }
        },
        "minecraft:leaves": {
            "id": 18,
            "data": {
                "0": {
                    "old_leaf_type": "oak",
                    "update_bit": false,
                    "persistent_bit": false
                },
                "1": {
                    "old_leaf_type": "spruce",
                    "update_bit": false,
                    "persistent_bit": false
                },
                "2": {
                    "old_leaf_type": "birch",
                    "update_bit": false,
                    "persistent_bit": false
                },
                "3": {
                    "old_leaf_type": "jungle",
                    "update_bit": false,
                    "persistent_bit": false
                },
                "4": {
                    "old_leaf_type": "oak",
                    "update_bit": true,
                    "persistent_bit": false
                },
                "5": {
                    "old_leaf_type": "spruce",
                    "update_bit": true,
                    "persistent_bit": false
                },
                "6": {
                    "old_leaf_type": "birch",
                    "update_bit": true,
                    "persistent_bit": false
                },
                "7": {
                    "old_leaf_type": "jungle",
                    "update_bit": true,
                    "persistent_bit": false
                },
                "8": {
                    "old_leaf_type": "oak",
                    "update_bit": false,
                    "persistent_bit": true
                },
                "9": {
                    "old_leaf_type": "spruce",
                    "update_bit": false,
                    "persistent_bit": true
                },
                "10": {
                    "old_leaf_type": "birch",
                    "update_bit": false,
                    "persistent_bit": true
                },
                "11": {
                    "old_leaf_type": "jungle",
                    "update_bit": false,
                    "persistent_bit": true
                },
                "12": {
                    "old_leaf_type": "oak",
                    "update_bit": true,
                    "persistent_bit": true
                },
                "13": {
                    "old_leaf_type": "spruce",
                    "update_bit": true,
                    "persistent_bit": true
                },
                "14": {
                    "old_leaf_type": "birch",
                    "update_bit": true,
                    "persistent_bit": true
                },
                "15": {
                    "old_leaf_type": "jungle",
                    "update_bit": true,
                    "persistent_bit": true
                }
            }
        },
        "minecraft:sponge": {
            "id": 19,
            "data": {
                "0": {
                    "sponge_type": "dry"
                },
                "1": {
                    "sponge_type": "wet"
                }
            }
        },
        "minecraft:glass": {
            "id": 20,
            "data": {}
        },
        "minecraft:lapis_ore": {
            "id": 21,
            "data": {}
        },
        "minecraft:lapis_block": {
            "id": 22,
            "data": {}
        },
        "minecraft:dispenser": {
            "id": 23,
            "data": {
                "0": {
                    "facing_direction": 0,
                    "triggered_bit": false
                },
                "1": {
                    "facing_direction": 1,
                    "triggered_bit": false
                },
                "2": {
                    "facing_direction": 2,
                    "triggered_bit": false
                },
                "3": {
                    "facing_direction": 3,
                    "triggered_bit": false
                },
                "4": {
                    "facing_direction": 4,
                    "triggered_bit": false
                },
                "5": {
                    "facing_direction": 5,
                    "triggered_bit": false
                },
                "6": {
                    "facing_direction": 0,
                    "triggered_bit": false
                },
                "7": {
                    "facing_direction": 0,
                    "triggered_bit": false
                },
                "8": {
                    "facing_direction": 0,
                    "triggered_bit": true
                },
                "9": {
                    "facing_direction": 1,
                    "triggered_bit": true
                },
                "10": {
                    "facing_direction": 2,
                    "triggered_bit": true
                },
                "11": {
                    "facing_direction": 3,
                    "triggered_bit": true
                },
                "12": {
                    "facing_direction": 4,
                    "triggered_bit": true
                },
                "13": {
                    "facing_direction": 5,
                    "triggered_bit": true
                },
                "14": {
                    "facing_direction": 0,
                    "triggered_bit": false
                },
                "15": {
                    "facing_direction": 0,
                    "triggered_bit": false
                }
            }
        },
        "minecraft:sandstone": {
            "id": 24,
            "data": {
                "0": {
                    "sand_stone_type": "default"
                },
                "1": {
                    "sand_stone_type": "heiroglyphs"
                },
                "2": {
                    "sand_stone_type": "cut"
                },
                "3": {
                    "sand_stone_type": "smooth"
                }
            }
        },
        "minecraft:noteblock": {
            "id": 25,
            "data": {}
        },
        "minecraft:bed": {
            "id": 26,
            "data": {
                "0": {
                    "direction": 0
                },
                "1": {
                    "direction": 1
                },
                "2": {
                    "direction": 2
                },
                "3": {
                    "direction": 3
                }
            }
        },
        "minecraft:golden_rail": {
            "id": 27,
            "data": {
                "0": {
                    "rail_direction": 0,
                    "rail_data_bit": false
                },
                "1": {
                    "rail_direction": 1,
                    "rail_data_bit": false
                },
                "2": {
                    "rail_direction": 2,
                    "rail_data_bit": false
                },
                "3": {
                    "rail_direction": 3,
                    "rail_data_bit": false
                },
                "4": {
                    "rail_direction": 4,
                    "rail_data_bit": false
                },
                "5": {
                    "rail_direction": 5,
                    "rail_data_bit": false
                },
                "6": {
                    "rail_direction": 0,
                    "rail_data_bit": false
                },
                "7": {
                    "rail_direction": 0,
                    "rail_data_bit": false
                },
                "8": {
                    "rail_direction": 0,
                    "rail_data_bit": true
                },
                "9": {
                    "rail_direction": 1,
                    "rail_data_bit": true
                },
                "10": {
                    "rail_direction": 2,
                    "rail_data_bit": true
                },
                "11": {
                    "rail_direction": 3,
                    "rail_data_bit": true
                },
                "12": {
                    "rail_direction": 4,
                    "rail_data_bit": true
                },
                "13": {
                    "rail_direction": 5,
                    "rail_data_bit": true
                },
                "14": {
                    "rail_direction": 0,
                    "rail_data_bit": true
                },
                "15": {
                    "rail_direction": 0,
                    "rail_data_bit": true
                }
            }
        },
        "minecraft:detector_rail": {
            "id": 28,
            "data": {
                "0": {
                    "facing_direction": 0,
                    "triggered_bit": false
                },
                "1": {
                    "facing_direction": 1,
                    "triggered_bit": false
                },
                "2": {
                    "facing_direction": 2,
                    "triggered_bit": false
                },
                "3": {
                    "facing_direction": 3,
                    "triggered_bit": false
                },
                "4": {
                    "facing_direction": 4,
                    "triggered_bit": false
                },
                "5": {
                    "facing_direction": 5,
                    "triggered_bit": false
                },
                "6": {
                    "facing_direction": 0,
                    "triggered_bit": false
                },
                "7": {
                    "facing_direction": 0,
                    "triggered_bit": false
                },
                "8": {
                    "facing_direction": 0,
                    "triggered_bit": true
                },
                "9": {
                    "facing_direction": 1,
                    "triggered_bit": true
                },
                "10": {
                    "facing_direction": 2,
                    "triggered_bit": true
                },
                "11": {
                    "facing_direction": 3,
                    "triggered_bit": true
                },
                "12": {
                    "facing_direction": 4,
                    "triggered_bit": true
                },
                "13": {
                    "facing_direction": 5,
                    "triggered_bit": true
                },
                "14": {
                    "facing_direction": 0,
                    "triggered_bit": false
                },
                "15": {
                    "facing_direction": 0,
                    "triggered_bit": false
                }
            }
        },
        "minecraft:sticky_piston": {
            "id": 29,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:web": {
            "id": 30,
            "data": {}
        },
        "minecraft:tallgrass": {
            "id": 31,
            "data": {
                "0": {
                    "tall_grass_type": "default"
                },
                "1": {
                    "tall_grass_type": "tall"
                },
                "2": {
                    "tall_grass_type": "fern"
                },
                "3": {
                    "tall_grass_type": "snow"
                }
            }
        },
        "minecraft:deadbush": {
            "id": 32,
            "data": {}
        },
        "minecraft:piston": {
            "id": 33,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:pistonArmCollision": {
            "id": 34,
            "data": {}
        },
        "minecraft:wool": {
            "id": 35,
            "data": {
                "0": {
                    "color": "white"
                },
                "1": {
                    "color": "orange"
                },
                "2": {
                    "color": "magenta"
                },
                "3": {
                    "color": "light_blue"
                },
                "4": {
                    "color": "yellow"
                },
                "5": {
                    "color": "lime"
                },
                "6": {
                    "color": "pink"
                },
                "7": {
                    "color": "gray"
                },
                "8": {
                    "color": "silver"
                },
                "9": {
                    "color": "cyan"
                },
                "10": {
                    "color": "purple"
                },
                "11": {
                    "color": "blue"
                },
                "12": {
                    "color": "brown"
                },
                "13": {
                    "color": "green"
                },
                "14": {
                    "color": "red"
                },
                "15": {
                    "color": "black"
                }
            }
        },
        "minecraft:element_0": {
            "id": 36,
            "data": {}
        },
        "minecraft:yellow_flower": {
            "id": 37,
            "data": {}
        },
        "minecraft:red_flower": {
            "id": 38,
            "data": {
                "0": {
                    "flower_type": "poppy"
                },
                "1": {
                    "flower_type": "orchid"
                },
                "2": {
                    "flower_type": "allium"
                },
                "3": {
                    "flower_type": "houstonia"
                },
                "4": {
                    "flower_type": "tulip_red"
                },
                "5": {
                    "flower_type": "tulip_orange"
                },
                "6": {
                    "flower_type": "tulip_white"
                },
                "7": {
                    "flower_type": "tulip_pink"
                },
                "8": {
                    "flower_type": "oxeye"
                },
                "9": {
                    "flower_type": "cornflower"
                },
                "10": {
                    "flower_type": "lily_of_the_valley"
                }
            }
        },
        "minecraft:brown_mushroom": {
            "id": 39,
            "data": {}
        },
        "minecraft:red_mushroom": {
            "id": 40,
            "data": {}
        },
        "minecraft:gold_block": {
            "id": 41,
            "data": {}
        },
        "minecraft:iron_block": {
            "id": 42,
            "data": {}
        },
        "minecraft:double_stone_slab": {
            "id": 43,
            "data": {
                "0": {
                    "stone_slab_type": "smooth_stone",
                    "top_slot_bit": false
                },
                "1": {
                    "stone_slab_type": "sandstone",
                    "top_slot_bit": false
                },
                "2": {
                    "stone_slab_type": "wood",
                    "top_slot_bit": false
                },
                "3": {
                    "stone_slab_type": "cobblestone",
                    "top_slot_bit": false
                },
                "4": {
                    "stone_slab_type": "brick",
                    "top_slot_bit": false
                },
                "5": {
                    "stone_slab_type": "stone_brick",
                    "top_slot_bit": false
                },
                "6": {
                    "stone_slab_type": "quartz",
                    "top_slot_bit": false
                },
                "7": {
                    "stone_slab_type": "nether_brick",
                    "top_slot_bit": false
                },
                "8": {
                    "stone_slab_type": "smooth_stone",
                    "top_slot_bit": true
                },
                "9": {
                    "stone_slab_type": "sandstone",
                    "top_slot_bit": true
                },
                "10": {
                    "stone_slab_type": "wood",
                    "top_slot_bit": true
                },
                "11": {
                    "stone_slab_type": "cobblestone",
                    "top_slot_bit": true
                },
                "12": {
                    "stone_slab_type": "brick",
                    "top_slot_bit": true
                },
                "13": {
                    "stone_slab_type": "stone_brick",
                    "top_slot_bit": true
                },
                "14": {
                    "stone_slab_type": "quartz",
                    "top_slot_bit": true
                },
                "15": {
                    "stone_slab_type": "nether_brick",
                    "top_slot_bit": true
                }
            }
        },
        "minecraft:stone_slab": {
            "id": 44,
            "data": {
                "0": {
                    "stone_slab_type": "smooth_stone",
                    "top_slot_bit": false
                },
                "1": {
                    "stone_slab_type": "sandstone",
                    "top_slot_bit": false
                },
                "2": {
                    "stone_slab_type": "wood",
                    "top_slot_bit": false
                },
                "3": {
                    "stone_slab_type": "cobblestone",
                    "top_slot_bit": false
                },
                "4": {
                    "stone_slab_type": "brick",
                    "top_slot_bit": false
                },
                "5": {
                    "stone_slab_type": "stone_brick",
                    "top_slot_bit": false
                },
                "6": {
                    "stone_slab_type": "quartz",
                    "top_slot_bit": false
                },
                "7": {
                    "stone_slab_type": "nether_brick",
                    "top_slot_bit": false
                },
                "8": {
                    "stone_slab_type": "smooth_stone",
                    "top_slot_bit": true
                },
                "9": {
                    "stone_slab_type": "sandstone",
                    "top_slot_bit": true
                },
                "10": {
                    "stone_slab_type": "wood",
                    "top_slot_bit": true
                },
                "11": {
                    "stone_slab_type": "cobblestone",
                    "top_slot_bit": true
                },
                "12": {
                    "stone_slab_type": "brick",
                    "top_slot_bit": true
                },
                "13": {
                    "stone_slab_type": "stone_brick",
                    "top_slot_bit": true
                },
                "14": {
                    "stone_slab_type": "quartz",
                    "top_slot_bit": true
                },
                "15": {
                    "stone_slab_type": "nether_brick",
                    "top_slot_bit": true
                }
            }
        },
        "minecraft:brick_block": {
            "id": 45,
            "data": {}
        },
        "minecraft:tnt": {
            "id": 46,
            "data": {
                "0": {
                    "explode_bit": false,
                    "allow_underwater_bit": false
                },
                "1": {
                    "explode_bit": true,
                    "allow_underwater_bit": false
                },
                "2": {
                    "explode_bit": false,
                    "allow_underwater_bit": true
                },
                "3": {
                    "explode_bit": true,
                    "allow_underwater_bit": true
                }
            }
        },
        "minecraft:bookshelf": {
            "id": 47,
            "data": {}
        },
        "minecraft:mossy_cobblestone": {
            "id": 48,
            "data": {}
        },
        "minecraft:obsidian": {
            "id": 49,
            "data": {}
        },
        "minecraft:torch": {
            "id": 50,
            "data": {
                "0": {
                    "torch_facing_direction": "unknown"
                },
                "1": {
                    "torch_facing_direction": "west"
                },
                "2": {
                    "torch_facing_direction": "east"
                },
                "3": {
                    "torch_facing_direction": "north"
                },
                "4": {
                    "torch_facing_direction": "south"
                },
                "5": {
                    "torch_facing_direction": "top"
                }
            }
        },
        "minecraft:fire": {
            "id": 51,
            "data": {
                "0": {
                    "age": 0
                },
                "1": {
                    "age": 1
                },
                "2": {
                    "age": 2
                },
                "3": {
                    "age": 3
                },
                "4": {
                    "age": 4
                },
                "5": {
                    "age": 5
                },
                "6": {
                    "age": 6
                },
                "7": {
                    "age": 7
                },
                "8": {
                    "age": 8
                },
                "9": {
                    "age": 9
                },
                "10": {
                    "age": 10
                },
                "11": {
                    "age": 11
                },
                "12": {
                    "age": 12
                },
                "13": {
                    "age": 13
                },
                "14": {
                    "age": 14
                },
                "15": {
                    "age": 15
                }
            }
        },
        "minecraft:mob_spawner": {
            "id": 52,
            "data": {}
        },
        "minecraft:oak_stairs": {
            "id": 53,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:chest": {
            "id": 54,
            "data": {
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:redstone_wire": {
            "id": 55,
            "data": {
                "0": {
                    "redstone_signal": 0
                },
                "1": {
                    "redstone_signal": 1
                },
                "2": {
                    "redstone_signal": 2
                },
                "3": {
                    "redstone_signal": 3
                },
                "4": {
                    "redstone_signal": 4
                },
                "5": {
                    "redstone_signal": 5
                },
                "6": {
                    "redstone_signal": 6
                },
                "7": {
                    "redstone_signal": 7
                },
                "8": {
                    "redstone_signal": 8
                },
                "9": {
                    "redstone_signal": 9
                },
                "10": {
                    "redstone_signal": 10
                },
                "11": {
                    "redstone_signal": 11
                },
                "12": {
                    "redstone_signal": 12
                },
                "13": {
                    "redstone_signal": 13
                },
                "14": {
                    "redstone_signal": 14
                },
                "15": {
                    "redstone_signal": 15
                }
            }
        },
        "minecraft:diamond_ore": {
            "id": 56,
            "data": {}
        },
        "minecraft:diamond_block": {
            "id": 57,
            "data": {}
        },
        "minecraft:crafting_table": {
            "id": 58,
            "data": {}
        },
        "minecraft:wheat": {
            "id": 59,
            "data": {
                "0": {
                    "growth": 0
                },
                "1": {
                    "growth": 1
                },
                "2": {
                    "growth": 2
                },
                "3": {
                    "growth": 3
                },
                "4": {
                    "growth": 4
                },
                "5": {
                    "growth": 5
                },
                "6": {
                    "growth": 6
                },
                "7": {
                    "growth": 7
                }
            }
        },
        "minecraft:farmland": {
            "id": 60,
            "data": {
                "0": {
                    "moisturized_amount": 0
                },
                "1": {
                    "moisturized_amount": 1
                },
                "2": {
                    "moisturized_amount": 2
                },
                "3": {
                    "moisturized_amount": 3
                },
                "4": {
                    "moisturized_amount": 4
                },
                "5": {
                    "moisturized_amount": 5
                },
                "6": {
                    "moisturized_amount": 6
                },
                "7": {
                    "moisturized_amount": 7
                }
            }
        },
        "minecraft:furnace": {
            "id": 61,
            "data": {
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:lit_furnace": {
            "id": 62,
            "data": {
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:standing_sign": {
            "id": 63,
            "data": {
                "0": {
                    "ground_sign_direction": 0
                },
                "1": {
                    "ground_sign_direction": 1
                },
                "2": {
                    "ground_sign_direction": 2
                },
                "3": {
                    "ground_sign_direction": 3
                },
                "4": {
                    "ground_sign_direction": 4
                },
                "5": {
                    "ground_sign_direction": 5
                },
                "6": {
                    "ground_sign_direction": 6
                },
                "7": {
                    "ground_sign_direction": 7
                },
                "8": {
                    "ground_sign_direction": 8
                },
                "9": {
                    "ground_sign_direction": 9
                },
                "10": {
                    "ground_sign_direction": 10
                },
                "11": {
                    "ground_sign_direction": 11
                },
                "12": {
                    "ground_sign_direction": 12
                },
                "13": {
                    "ground_sign_direction": 13
                },
                "14": {
                    "ground_sign_direction": 14
                },
                "15": {
                    "ground_sign_direction": 15
                }
            }
        },
        "minecraft:wooden_door": {
            "id": 64,
            "data": {
                "0": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "1": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "2": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "3": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "4": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "5": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "6": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "7": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "8": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "9": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "10": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "11": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "12": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "13": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "14": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "15": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": true
                }
            }
        },
        "minecraft:ladder": {
            "id": 65,
            "data": {
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:rail": {
            "id": 66,
            "data": {
                "0": {
                    "rail_direction": 0
                },
                "1": {
                    "rail_direction": 1
                },
                "2": {
                    "rail_direction": 2
                },
                "3": {
                    "rail_direction": 3
                },
                "4": {
                    "rail_direction": 4
                },
                "5": {
                    "rail_direction": 5
                },
                "6": {
                    "rail_direction": 6
                },
                "7": {
                    "rail_direction": 7
                },
                "8": {
                    "rail_direction": 8
                }
            }
        },
        "minecraft:stone_stairs": {
            "id": 67,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:wall_sign": {
            "id": 68,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:lever": {
            "id": 69,
            "data": {
                "0": {
                    "lever_direction": "down_east_west",
                    "open_bit": false
                },
                "1": {
                    "lever_direction": "east",
                    "open_bit": false
                },
                "2": {
                    "lever_direction": "west",
                    "open_bit": false
                },
                "3": {
                    "lever_direction": "south",
                    "open_bit": false
                },
                "4": {
                    "lever_direction": "north",
                    "open_bit": false
                },
                "5": {
                    "lever_direction": "up_north_south",
                    "open_bit": false
                },
                "6": {
                    "lever_direction": "up_east_west",
                    "open_bit": false
                },
                "7": {
                    "lever_direction": "down_north_south",
                    "open_bit": false
                },
                "8": {
                    "lever_direction": "down_east_west",
                    "open_bit": true
                },
                "9": {
                    "lever_direction": "east",
                    "open_bit": true
                },
                "10": {
                    "lever_direction": "west",
                    "open_bit": true
                },
                "11": {
                    "lever_direction": "south",
                    "open_bit": true
                },
                "12": {
                    "lever_direction": "north",
                    "open_bit": true
                },
                "13": {
                    "lever_direction": "up_north_south",
                    "open_bit": true
                },
                "14": {
                    "lever_direction": "up_east_west",
                    "open_bit": true
                },
                "15": {
                    "lever_direction": "down_north_south",
                    "open_bit": true
                }
            }
        },
        "minecraft:stone_pressure_plate": {
            "id": 70,
            "data": {
                "0": {
                    "redstone_signal": 0
                },
                "1": {
                    "redstone_signal": 1
                }
            }
        },
        "minecraft:iron_door": {
            "id": 71,
            "data": {
                "0": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "1": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "2": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "3": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "4": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "5": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "6": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "7": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "8": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "9": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "10": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "11": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "12": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "13": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "14": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "15": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": true
                }
            }
        },
        "minecraft:wooden_pressure_plate": {
            "id": 72,
            "data": {
                "0": {
                    "redstone_signal": 0
                },
                "1": {
                    "redstone_signal": 1
                }
            }
        },
        "minecraft:redstone_ore": {
            "id": 73,
            "data": {}
        },
        "minecraft:lit_redstone_ore": {
            "id": 74,
            "data": {}
        },
        "minecraft:unlit_redstone_torch": {
            "id": 75,
            "data": {
                "0": {
                    "torch_facing_direction": "unknown"
                },
                "1": {
                    "torch_facing_direction": "west"
                },
                "2": {
                    "torch_facing_direction": "east"
                },
                "3": {
                    "torch_facing_direction": "north"
                },
                "4": {
                    "torch_facing_direction": "south"
                },
                "5": {
                    "torch_facing_direction": "top"
                }
            }
        },
        "minecraft:redstone_torch": {
            "id": 76,
            "data": {
                "0": {
                    "torch_facing_direction": "unknown"
                },
                "1": {
                    "torch_facing_direction": "west"
                },
                "2": {
                    "torch_facing_direction": "east"
                },
                "3": {
                    "torch_facing_direction": "north"
                },
                "4": {
                    "torch_facing_direction": "south"
                },
                "5": {
                    "torch_facing_direction": "top"
                }
            }
        },
        "minecraft:stone_button": {
            "id": 77,
            "data": {
                "0": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "1": {
                    "facing_direction": 1,
                    "button_pressed_bit": false
                },
                "2": {
                    "facing_direction": 2,
                    "button_pressed_bit": false
                },
                "3": {
                    "facing_direction": 3,
                    "button_pressed_bit": false
                },
                "4": {
                    "facing_direction": 4,
                    "button_pressed_bit": false
                },
                "5": {
                    "facing_direction": 5,
                    "button_pressed_bit": false
                },
                "6": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "7": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "8": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                },
                "9": {
                    "facing_direction": 1,
                    "button_pressed_bit": true
                },
                "10": {
                    "facing_direction": 2,
                    "button_pressed_bit": true
                },
                "11": {
                    "facing_direction": 3,
                    "button_pressed_bit": true
                },
                "12": {
                    "facing_direction": 4,
                    "button_pressed_bit": true
                },
                "13": {
                    "facing_direction": 5,
                    "button_pressed_bit": true
                },
                "14": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                },
                "15": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                }
            }
        },
        "minecraft:snow_layer": {
            "id": 78,
            "data": {
                "0": {
                    "height": 0,
                    "covered_bit": false
                },
                "1": {
                    "height": 1,
                    "covered_bit": false
                },
                "2": {
                    "height": 2,
                    "covered_bit": false
                },
                "3": {
                    "height": 3,
                    "covered_bit": false
                },
                "4": {
                    "height": 4,
                    "covered_bit": false
                },
                "5": {
                    "height": 5,
                    "covered_bit": false
                },
                "6": {
                    "height": 6,
                    "covered_bit": false
                },
                "7": {
                    "height": 7,
                    "covered_bit": false
                },
                "8": {
                    "height": 0,
                    "covered_bit": true
                },
                "9": {
                    "height": 1,
                    "covered_bit": true
                },
                "10": {
                    "height": 2,
                    "covered_bit": true
                },
                "11": {
                    "height": 3,
                    "covered_bit": true
                },
                "12": {
                    "height": 4,
                    "covered_bit": true
                },
                "13": {
                    "height": 5,
                    "covered_bit": true
                },
                "14": {
                    "height": 6,
                    "covered_bit": true
                },
                "15": {
                    "height": 7,
                    "covered_bit": true
                }
            }
        },
        "minecraft:ice": {
            "id": 79,
            "data": {}
        },
        "minecraft:snow": {
            "id": 80,
            "data": {}
        },
        "minecraft:cactus": {
            "id": 81,
            "data": {
                "0": {
                    "age": 0
                },
                "1": {
                    "age": 1
                },
                "2": {
                    "age": 2
                },
                "3": {
                    "age": 3
                },
                "4": {
                    "age": 4
                },
                "5": {
                    "age": 5
                },
                "6": {
                    "age": 6
                },
                "7": {
                    "age": 7
                },
                "8": {
                    "age": 8
                },
                "9": {
                    "age": 9
                },
                "10": {
                    "age": 10
                },
                "11": {
                    "age": 11
                },
                "12": {
                    "age": 12
                },
                "13": {
                    "age": 13
                },
                "14": {
                    "age": 14
                },
                "15": {
                    "age": 15
                }
            }
        },
        "minecraft:clay": {
            "id": 82,
            "data": {}
        },
        "minecraft:reeds": {
            "id": 83,
            "data": {
                "0": {
                    "age": 0
                },
                "1": {
                    "age": 1
                },
                "2": {
                    "age": 2
                },
                "3": {
                    "age": 3
                },
                "4": {
                    "age": 4
                },
                "5": {
                    "age": 5
                },
                "6": {
                    "age": 6
                },
                "7": {
                    "age": 7
                },
                "8": {
                    "age": 8
                },
                "9": {
                    "age": 9
                },
                "10": {
                    "age": 10
                },
                "11": {
                    "age": 11
                },
                "12": {
                    "age": 12
                },
                "13": {
                    "age": 13
                },
                "14": {
                    "age": 14
                },
                "15": {
                    "age": 15
                }
            }
        },
        "minecraft:jukebox": {
            "id": 84,
            "data": {}
        },
        "minecraft:fence": {
            "id": 85,
            "data": {
                "0": {
                    "wood_type": "oak"
                },
                "1": {
                    "wood_type": "spruce"
                },
                "2": {
                    "wood_type": "birch"
                },
                "3": {
                    "wood_type": "jungle"
                },
                "4": {
                    "wood_type": "acacia"
                },
                "5": {
                    "wood_type": "dark_oak"
                }
            }
        },
        "minecraft:pumpkin": {
            "id": 86,
            "data": {
                "0": {
                    "direction": 0
                },
                "1": {
                    "direction": 1
                },
                "2": {
                    "direction": 2
                },
                "3": {
                    "direction": 3
                }
            }
        },
        "minecraft:netherrack": {
            "id": 87,
            "data": {}
        },
        "minecraft:soul_sand": {
            "id": 88,
            "data": {}
        },
        "minecraft:glowstone": {
            "id": 89,
            "data": {}
        },
        "minecraft:portal": {
            "id": 90,
            "data": {
                "0": {
                    "portal_axis": "unknown"
                },
                "1": {
                    "portal_axis": "x"
                },
                "2": {
                    "portal_axis": "z"
                }
            }
        },
        "minecraft:lit_pumpkin": {
            "id": 91,
            "data": {
                "0": {
                    "direction": 0
                },
                "1": {
                    "direction": 1
                },
                "2": {
                    "direction": 2
                },
                "3": {
                    "direction": 3
                }
            }
        },
        "minecraft:cake": {
            "id": 92,
            "data": {
                "0": {
                    "bite_counter": 0
                },
                "1": {
                    "bite_counter": 1
                },
                "2": {
                    "bite_counter": 2
                },
                "3": {
                    "bite_counter": 3
                },
                "4": {
                    "bite_counter": 4
                },
                "5": {
                    "bite_counter": 5
                },
                "6": {
                    "bite_counter": 6
                }
            }
        },
        "minecraft:unpowered_repeater": {
            "id": 93,
            "data": {
                "0": {
                    "repeater_delay": 0,
                    "direction": 0
                },
                "1": {
                    "repeater_delay": 0,
                    "direction": 1
                },
                "2": {
                    "repeater_delay": 0,
                    "direction": 2
                },
                "3": {
                    "repeater_delay": 0,
                    "direction": 3
                },
                "4": {
                    "repeater_delay": 1,
                    "direction": 0
                },
                "5": {
                    "repeater_delay": 1,
                    "direction": 1
                },
                "6": {
                    "repeater_delay": 1,
                    "direction": 2
                },
                "7": {
                    "repeater_delay": 1,
                    "direction": 3
                },
                "8": {
                    "repeater_delay": 2,
                    "direction": 0
                },
                "9": {
                    "repeater_delay": 2,
                    "direction": 1
                },
                "10": {
                    "repeater_delay": 2,
                    "direction": 2
                },
                "11": {
                    "repeater_delay": 2,
                    "direction": 3
                },
                "12": {
                    "repeater_delay": 3,
                    "direction": 0
                },
                "13": {
                    "repeater_delay": 3,
                    "direction": 1
                },
                "14": {
                    "repeater_delay": 3,
                    "direction": 2
                },
                "15": {
                    "repeater_delay": 3,
                    "direction": 3
                }
            }
        },
        "minecraft:powered_repeater": {
            "id": 94,
            "data": {
                "0": {
                    "repeater_delay": 0,
                    "direction": 0
                },
                "1": {
                    "repeater_delay": 0,
                    "direction": 1
                },
                "2": {
                    "repeater_delay": 0,
                    "direction": 2
                },
                "3": {
                    "repeater_delay": 0,
                    "direction": 3
                },
                "4": {
                    "repeater_delay": 1,
                    "direction": 0
                },
                "5": {
                    "repeater_delay": 1,
                    "direction": 1
                },
                "6": {
                    "repeater_delay": 1,
                    "direction": 2
                },
                "7": {
                    "repeater_delay": 1,
                    "direction": 3
                },
                "8": {
                    "repeater_delay": 2,
                    "direction": 0
                },
                "9": {
                    "repeater_delay": 2,
                    "direction": 1
                },
                "10": {
                    "repeater_delay": 2,
                    "direction": 2
                },
                "11": {
                    "repeater_delay": 2,
                    "direction": 3
                },
                "12": {
                    "repeater_delay": 3,
                    "direction": 0
                },
                "13": {
                    "repeater_delay": 3,
                    "direction": 1
                },
                "14": {
                    "repeater_delay": 3,
                    "direction": 2
                },
                "15": {
                    "repeater_delay": 3,
                    "direction": 3
                }
            }
        },
        "minecraft:invisibleBedrock": {
            "id": 95,
            "data": {}
        },
        "minecraft:trapdoor": {
            "id": 96,
            "data": {
                "0": {
                    "direction": 0,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "1": {
                    "direction": 1,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "2": {
                    "direction": 2,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "3": {
                    "direction": 3,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "4": {
                    "direction": 0,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "5": {
                    "direction": 1,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "6": {
                    "direction": 2,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "7": {
                    "direction": 3,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "8": {
                    "direction": 0,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "9": {
                    "direction": 1,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "10": {
                    "direction": 2,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "11": {
                    "direction": 3,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "12": {
                    "direction": 0,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "13": {
                    "direction": 1,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "14": {
                    "direction": 2,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "15": {
                    "direction": 3,
                    "upside_down_bit": true,
                    "open_bit": true
                }
            }
        },
        "minecraft:monster_egg": {
            "id": 97,
            "data": {
                "0": {
                    "monster_egg_stone_type": "stone"
                },
                "1": {
                    "monster_egg_stone_type": "cobblestone"
                },
                "2": {
                    "monster_egg_stone_type": "stone_brick"
                },
                "3": {
                    "monster_egg_stone_type": "mossy_stone_brick"
                },
                "4": {
                    "monster_egg_stone_type": "cracked_stone_brick"
                },
                "5": {
                    "monster_egg_stone_type": "chiseled_stone_brick"
                }
            }
        },
        "minecraft:stonebrick": {
            "id": 98,
            "data": {
                "0": {
                    "stone_brick_type": "default"
                },
                "1": {
                    "stone_brick_type": "mossy"
                },
                "2": {
                    "stone_brick_type": "cracked"
                },
                "3": {
                    "stone_brick_type": "chiseled"
                },
                "4": {
                    "stone_brick_type": "smooth"
                }
            }
        },
        "minecraft:brown_mushroom_block": {
            "id": 99,
            "data": {}
        },
        "minecraft:red_mushroom_block": {
            "id": 100,
            "data": {}
        },
        "minecraft:iron_bars": {
            "id": 101,
            "data": {}
        },
        "minecraft:glass_pane": {
            "id": 102,
            "data": {}
        },
        "minecraft:melon_block": {
            "id": 103,
            "data": {}
        },
        "minecraft:pumpkin_stem": {
            "id": 104,
            "data": {
                "0": {
                    "growth": 0
                },
                "1": {
                    "growth": 1
                },
                "2": {
                    "growth": 2
                },
                "3": {
                    "growth": 3
                },
                "4": {
                    "growth": 4
                },
                "5": {
                    "growth": 5
                },
                "6": {
                    "growth": 6
                },
                "7": {
                    "growth": 7
                }
            }
        },
        "minecraft:melon_stem": {
            "id": 105,
            "data": {
                "0": {
                    "growth": 0
                },
                "1": {
                    "growth": 1
                },
                "2": {
                    "growth": 2
                },
                "3": {
                    "growth": 3
                },
                "4": {
                    "growth": 4
                },
                "5": {
                    "growth": 5
                },
                "6": {
                    "growth": 6
                },
                "7": {
                    "growth": 7
                }
            }
        },
        "minecraft:vine": {
            "id": 106,
            "data": {
                "0": {
                    "vine_direction_bits": 0
                },
                "1": {
                    "vine_direction_bits": 1
                },
                "2": {
                    "vine_direction_bits": 2
                },
                "3": {
                    "vine_direction_bits": 3
                },
                "4": {
                    "vine_direction_bits": 4
                },
                "5": {
                    "vine_direction_bits": 5
                },
                "6": {
                    "vine_direction_bits": 6
                },
                "7": {
                    "vine_direction_bits": 7
                },
                "8": {
                    "vine_direction_bits": 8
                },
                "9": {
                    "vine_direction_bits": 9
                },
                "10": {
                    "vine_direction_bits": 10
                },
                "11": {
                    "vine_direction_bits": 11
                },
                "12": {
                    "vine_direction_bits": 12
                },
                "13": {
                    "vine_direction_bits": 13
                },
                "14": {
                    "vine_direction_bits": 14
                },
                "15": {
                    "vine_direction_bits": 15
                }
            }
        },
        "minecraft:fence_gate": {
            "id": 107,
            "data": {
                "0": {
                    "direction": 0,
                    "open_bit": false
                },
                "1": {
                    "direction": 1,
                    "open_bit": false
                },
                "2": {
                    "direction": 2,
                    "open_bit": false
                },
                "3": {
                    "direction": 3,
                    "open_bit": false
                },
                "4": {
                    "direction": 0,
                    "open_bit": true
                },
                "5": {
                    "direction": 1,
                    "open_bit": true
                },
                "6": {
                    "direction": 2,
                    "open_bit": true
                },
                "7": {
                    "direction": 3,
                    "open_bit": true
                }
            }
        },
        "minecraft:brick_stairs": {
            "id": 108,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:stone_brick_stairs": {
            "id": 109,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:mycelium": {
            "id": 110,
            "data": {}
        },
        "minecraft:waterlily": {
            "id": 111,
            "data": {}
        },
        "minecraft:nether_brick": {
            "id": 112,
            "data": {}
        },
        "minecraft:nether_brick_fence": {
            "id": 113,
            "data": {}
        },
        "minecraft:nether_brick_stairs": {
            "id": 114,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:nether_wart": {
            "id": 115,
            "data": {
                "0": {
                    "age": 0
                },
                "1": {
                    "age": 1
                },
                "2": {
                    "age": 2
                },
                "3": {
                    "age": 3
                }
            }
        },
        "minecraft:enchanting_table": {
            "id": 116,
            "data": {}
        },
        "minecraft:brewing_stand": {
            "id": 117,
            "data": {}
        },
        "minecraft:cauldron": {
            "id": 118,
            "data": {
                "0": {
                    "fill_level": 0
                },
                "1": {
                    "fill_level": 1
                },
                "2": {
                    "fill_level": 2
                },
                "3": {
                    "fill_level": 3
                },
                "4": {
                    "fill_level": 4
                },
                "5": {
                    "fill_level": 5
                },
                "6": {
                    "fill_level": 6
                }
            }
        },
        "minecraft:end_portal": {
            "id": 119,
            "data": {}
        },
        "minecraft:end_portal_frame": {
            "id": 120,
            "data": {
                "0": {
                    "direction": 0,
                    "end_portal_eye_bit": false
                },
                "1": {
                    "direction": 1,
                    "end_portal_eye_bit": false
                },
                "2": {
                    "direction": 2,
                    "end_portal_eye_bit": false
                },
                "3": {
                    "direction": 3,
                    "end_portal_eye_bit": false
                },
                "4": {
                    "direction": 0,
                    "end_portal_eye_bit": true
                },
                "5": {
                    "direction": 1,
                    "end_portal_eye_bit": true
                },
                "6": {
                    "direction": 2,
                    "end_portal_eye_bit": true
                },
                "7": {
                    "direction": 3,
                    "end_portal_eye_bit": true
                }
            }
        },
        "minecraft:end_stone": {
            "id": 121,
            "data": {}
        },
        "minecraft:dragon_egg": {
            "id": 122,
            "data": {}
        },
        "minecraft:redstone_lamp": {
            "id": 123,
            "data": {}
        },
        "minecraft:lit_redstone_lamp": {
            "id": 124,
            "data": {}
        },
        "minecraft:dropper": {
            "id": 125,
            "data": {
                "0": {
                    "facing_direction": 0,
                    "triggered_bit": false
                },
                "1": {
                    "facing_direction": 1,
                    "triggered_bit": false
                },
                "2": {
                    "facing_direction": 2,
                    "triggered_bit": false
                },
                "3": {
                    "facing_direction": 3,
                    "triggered_bit": false
                },
                "4": {
                    "facing_direction": 4,
                    "triggered_bit": false
                },
                "5": {
                    "facing_direction": 5,
                    "triggered_bit": false
                },
                "6": {
                    "facing_direction": 0,
                    "triggered_bit": false
                },
                "7": {
                    "facing_direction": 0,
                    "triggered_bit": false
                },
                "8": {
                    "facing_direction": 0,
                    "triggered_bit": true
                },
                "9": {
                    "facing_direction": 1,
                    "triggered_bit": true
                },
                "10": {
                    "facing_direction": 2,
                    "triggered_bit": true
                },
                "11": {
                    "facing_direction": 3,
                    "triggered_bit": true
                },
                "12": {
                    "facing_direction": 4,
                    "triggered_bit": true
                },
                "13": {
                    "facing_direction": 5,
                    "triggered_bit": true
                },
                "14": {
                    "facing_direction": 0,
                    "triggered_bit": false
                },
                "15": {
                    "facing_direction": 0,
                    "triggered_bit": false
                }
            }
        },
        "minecraft:activator_rail": {
            "id": 126,
            "data": {
                "0": {
                    "facing_direction": 0,
                    "triggered_bit": false
                },
                "1": {
                    "facing_direction": 1,
                    "triggered_bit": false
                },
                "2": {
                    "facing_direction": 2,
                    "triggered_bit": false
                },
                "3": {
                    "facing_direction": 3,
                    "triggered_bit": false
                },
                "4": {
                    "facing_direction": 4,
                    "triggered_bit": false
                },
                "5": {
                    "facing_direction": 5,
                    "triggered_bit": false
                },
                "6": {
                    "facing_direction": 0,
                    "triggered_bit": false
                },
                "7": {
                    "facing_direction": 0,
                    "triggered_bit": false
                },
                "8": {
                    "facing_direction": 0,
                    "triggered_bit": true
                },
                "9": {
                    "facing_direction": 1,
                    "triggered_bit": true
                },
                "10": {
                    "facing_direction": 2,
                    "triggered_bit": true
                },
                "11": {
                    "facing_direction": 3,
                    "triggered_bit": true
                },
                "12": {
                    "facing_direction": 4,
                    "triggered_bit": true
                },
                "13": {
                    "facing_direction": 5,
                    "triggered_bit": true
                },
                "14": {
                    "facing_direction": 0,
                    "triggered_bit": false
                },
                "15": {
                    "facing_direction": 0,
                    "triggered_bit": false
                }
            }
        },
        "minecraft:cocoa": {
            "id": 127,
            "data": {
                "0": {
                    "direction": 0,
                    "age": 0
                },
                "1": {
                    "direction": 1,
                    "age": 0
                },
                "2": {
                    "direction": 2,
                    "age": 0
                },
                "3": {
                    "direction": 3,
                    "age": 0
                },
                "4": {
                    "direction": 0,
                    "age": 1
                },
                "5": {
                    "direction": 1,
                    "age": 1
                },
                "6": {
                    "direction": 2,
                    "age": 1
                },
                "7": {
                    "direction": 3,
                    "age": 1
                },
                "8": {
                    "direction": 0,
                    "age": 2
                },
                "9": {
                    "direction": 1,
                    "age": 2
                },
                "10": {
                    "direction": 2,
                    "age": 2
                },
                "11": {
                    "direction": 3,
                    "age": 2
                }
            }
        },
        "minecraft:sandstone_stairs": {
            "id": 128,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:emerald_ore": {
            "id": 129,
            "data": 129
        },
        "minecraft:ender_chest": {
            "id": 130,
            "data": {
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:tripwire_hook": {
            "id": 131,
            "data": {
                "0": {
                    "direction": 0,
                    "attached_bit": false,
                    "powered_bit": false
                },
                "1": {
                    "direction": 1,
                    "attached_bit": false,
                    "powered_bit": false
                },
                "2": {
                    "direction": 2,
                    "attached_bit": false,
                    "powered_bit": false
                },
                "3": {
                    "direction": 3,
                    "attached_bit": false,
                    "powered_bit": false
                },
                "4": {
                    "direction": 0,
                    "attached_bit": true,
                    "powered_bit": false
                },
                "5": {
                    "direction": 1,
                    "attached_bit": true,
                    "powered_bit": false
                },
                "6": {
                    "direction": 2,
                    "attached_bit": true,
                    "powered_bit": false
                },
                "7": {
                    "direction": 3,
                    "attached_bit": true,
                    "powered_bit": false
                },
                "8": {
                    "direction": 0,
                    "attached_bit": false,
                    "powered_bit": true
                },
                "9": {
                    "direction": 1,
                    "attached_bit": false,
                    "powered_bit": true
                },
                "10": {
                    "direction": 2,
                    "attached_bit": false,
                    "powered_bit": true
                },
                "11": {
                    "direction": 3,
                    "attached_bit": false,
                    "powered_bit": true
                },
                "12": {
                    "direction": 0,
                    "attached_bit": true,
                    "powered_bit": true
                },
                "13": {
                    "direction": 1,
                    "attached_bit": true,
                    "powered_bit": true
                },
                "14": {
                    "direction": 2,
                    "attached_bit": true,
                    "powered_bit": true
                },
                "15": {
                    "direction": 3,
                    "attached_bit": true,
                    "powered_bit": true
                }
            }
        },
        "minecraft:tripWire": {
            "id": 132,
            "data": {
                "0": {
                    "powered_bit": false,
                    "attached_bit": false,
                    "disarmed_bit": false
                },
                "1": {
                    "powered_bit": true,
                    "attached_bit": false,
                    "disarmed_bit": false
                },
                "4": {
                    "powered_bit": false,
                    "attached_bit": true,
                    "disarmed_bit": false
                },
                "5": {
                    "powered_bit": true,
                    "attached_bit": true,
                    "disarmed_bit": false
                },
                "8": {
                    "powered_bit": false,
                    "attached_bit": false,
                    "disarmed_bit": true
                },
                "9": {
                    "powered_bit": true,
                    "attached_bit": false,
                    "disarmed_bit": true
                },
                "12": {
                    "powered_bit": false,
                    "attached_bit": true,
                    "disarmed_bit": true
                },
                "13": {
                    "powered_bit": true,
                    "attached_bit": true,
                    "disarmed_bit": true
                }
            }
        },
        "minecraft:emerald_block": {
            "id": 133,
            "data": {}
        },
        "minecraft:spruce_stairs": {
            "id": 134,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:birch_stairs": {
            "id": 135,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:jungle_stairs": {
            "id": 136,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:command_block": {
            "id": 137,
            "data": {
                "0": {
                    "facing_direction": 0,
                    "conditional_bit": false
                },
                "1": {
                    "facing_direction": 1,
                    "conditional_bit": false
                },
                "2": {
                    "facing_direction": 2,
                    "conditional_bit": false
                },
                "3": {
                    "facing_direction": 3,
                    "conditional_bit": false
                },
                "4": {
                    "facing_direction": 4,
                    "conditional_bit": false
                },
                "5": {
                    "facing_direction": 5,
                    "conditional_bit": false
                },
                "6": {
                    "facing_direction": 0,
                    "conditional_bit": false
                },
                "7": {
                    "facing_direction": 0,
                    "conditional_bit": false
                },
                "8": {
                    "facing_direction": 0,
                    "conditional_bit": true
                },
                "9": {
                    "facing_direction": 1,
                    "conditional_bit": true
                },
                "10": {
                    "facing_direction": 2,
                    "conditional_bit": true
                },
                "11": {
                    "facing_direction": 3,
                    "conditional_bit": true
                },
                "12": {
                    "facing_direction": 4,
                    "conditional_bit": true
                },
                "13": {
                    "facing_direction": 5,
                    "conditional_bit": true
                },
                "14": {
                    "facing_direction": 0,
                    "conditional_bit": true
                },
                "15": {
                    "facing_direction": 0,
                    "conditional_bit": true
                }
            }
        },
        "minecraft:beacon": {
            "id": 138,
            "data": {}
        },
        "minecraft:cobblestone_wall": {
            "id": 139,
            "data": {
                "0": {
                    "wall_block_type": "cobblestone"
                },
                "1": {
                    "wall_block_type": "mossy_cobblestone"
                },
                "2": {
                    "wall_block_type": "granite"
                },
                "3": {
                    "wall_block_type": "diorite"
                },
                "4": {
                    "wall_block_type": "andesite"
                },
                "5": {
                    "wall_block_type": "sandstone"
                },
                "6": {
                    "wall_block_type": "brick"
                },
                "7": {
                    "wall_block_type": "stone_brick"
                },
                "8": {
                    "wall_block_type": "mossy_stone_brick"
                },
                "9": {
                    "wall_block_type": "nether_brick"
                },
                "10": {
                    "wall_block_type": "end_brick"
                },
                "11": {
                    "wall_block_type": "prismarine"
                },
                "12": {
                    "wall_block_type": "red_sandstone"
                },
                "13": {
                    "wall_block_type": "red_nether_brick"
                }
            }
        },
        "minecraft:flower_pot": {
            "id": 140,
            "data": {}
        },
        "minecraft:carrots": {
            "id": 141,
            "data": {
                "0": {
                    "growth": 0
                },
                "1": {
                    "growth": 1
                },
                "2": {
                    "growth": 2
                },
                "3": {
                    "growth": 3
                },
                "4": {
                    "growth": 4
                },
                "5": {
                    "growth": 5
                },
                "6": {
                    "growth": 6
                },
                "7": {
                    "growth": 7
                }
            }
        },
        "minecraft:potatoes": {
            "id": 142,
            "data": {
                "0": {
                    "growth": 0
                },
                "1": {
                    "growth": 1
                },
                "2": {
                    "growth": 2
                },
                "3": {
                    "growth": 3
                },
                "4": {
                    "growth": 4
                },
                "5": {
                    "growth": 5
                },
                "6": {
                    "growth": 6
                },
                "7": {
                    "growth": 7
                }
            }
        },
        "minecraft:wooden_button": {
            "id": 143,
            "data": {
                "0": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "1": {
                    "facing_direction": 1,
                    "button_pressed_bit": false
                },
                "2": {
                    "facing_direction": 2,
                    "button_pressed_bit": false
                },
                "3": {
                    "facing_direction": 3,
                    "button_pressed_bit": false
                },
                "4": {
                    "facing_direction": 4,
                    "button_pressed_bit": false
                },
                "5": {
                    "facing_direction": 5,
                    "button_pressed_bit": false
                },
                "6": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "7": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "8": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                },
                "9": {
                    "facing_direction": 1,
                    "button_pressed_bit": true
                },
                "10": {
                    "facing_direction": 2,
                    "button_pressed_bit": true
                },
                "11": {
                    "facing_direction": 3,
                    "button_pressed_bit": true
                },
                "12": {
                    "facing_direction": 4,
                    "button_pressed_bit": true
                },
                "13": {
                    "facing_direction": 5,
                    "button_pressed_bit": true
                },
                "14": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                },
                "15": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                }
            }
        },
        "minecraft:skull": {
            "id": 144,
            "data": {
                "0": {
                    "facing_direction": 0,
                    "no_drop_bit": false
                },
                "1": {
                    "facing_direction": 1,
                    "no_drop_bit": false
                },
                "2": {
                    "facing_direction": 2,
                    "no_drop_bit": false
                },
                "3": {
                    "facing_direction": 3,
                    "no_drop_bit": false
                },
                "4": {
                    "facing_direction": 4,
                    "no_drop_bit": false
                },
                "5": {
                    "facing_direction": 5,
                    "no_drop_bit": false
                },
                "6": {
                    "facing_direction": 0,
                    "no_drop_bit": false
                },
                "7": {
                    "facing_direction": 0,
                    "no_drop_bit": false
                },
                "8": {
                    "facing_direction": 0,
                    "no_drop_bit": true
                },
                "9": {
                    "facing_direction": 1,
                    "no_drop_bit": true
                },
                "10": {
                    "facing_direction": 2,
                    "no_drop_bit": true
                },
                "11": {
                    "facing_direction": 3,
                    "no_drop_bit": true
                },
                "12": {
                    "facing_direction": 4,
                    "no_drop_bit": true
                },
                "13": {
                    "facing_direction": 5,
                    "no_drop_bit": true
                },
                "14": {
                    "facing_direction": 0,
                    "no_drop_bit": true
                },
                "15": {
                    "facing_direction": 0,
                    "no_drop_bit": true
                }
            }
        },
        "minecraft:anvil": {
            "id": 145,
            "data": {
                "0": {
                    "direction": 0,
                    "damage": "undamaged"
                },
                "1": {
                    "direction": 1,
                    "damage": "undamaged"
                },
                "2": {
                    "direction": 2,
                    "damage": "undamaged"
                },
                "3": {
                    "direction": 3,
                    "damage": "undamaged"
                },
                "4": {
                    "direction": 0,
                    "damage": "slightly_damaged"
                },
                "5": {
                    "direction": 1,
                    "damage": "slightly_damaged"
                },
                "6": {
                    "direction": 2,
                    "damage": "slightly_damaged"
                },
                "7": {
                    "direction": 3,
                    "damage": "slightly_damaged"
                },
                "8": {
                    "direction": 0,
                    "damage": "very_damaged"
                },
                "9": {
                    "direction": 1,
                    "damage": "very_damaged"
                },
                "10": {
                    "direction": 2,
                    "damage": "very_damaged"
                },
                "11": {
                    "direction": 3,
                    "damage": "very_damaged"
                },
                "12": {
                    "direction": 0,
                    "damage": "broken"
                },
                "13": {
                    "direction": 1,
                    "damage": "broken"
                },
                "14": {
                    "direction": 2,
                    "damage": "broken"
                },
                "15": {
                    "direction": 3,
                    "damage": "broken"
                }
            }
        },
        "minecraft:trapped_chest": {
            "id": 146,
            "data": {
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:light_weighted_pressure_plate": {
            "id": 147,
            "data": {
                "0": {
                    "redstone_signal": 0
                },
                "1": {
                    "redstone_signal": 1
                }
            }
        },
        "minecraft:heavy_weighted_pressure_plate": {
            "id": 148,
            "data": {
                "0": {
                    "redstone_signal": 0
                },
                "1": {
                    "redstone_signal": 1
                }
            }
        },
        "minecraft:unpowered_comparator": {
            "id": 149,
            "data": {
                "0": {
                    "direction": 0,
                    "output_subtract_bit": false,
                    "output_lit_bit": false
                },
                "1": {
                    "direction": 1,
                    "output_subtract_bit": false,
                    "output_lit_bit": false
                },
                "2": {
                    "direction": 2,
                    "output_subtract_bit": false,
                    "output_lit_bit": false
                },
                "3": {
                    "direction": 3,
                    "output_subtract_bit": false,
                    "output_lit_bit": false
                },
                "4": {
                    "direction": 0,
                    "output_subtract_bit": true,
                    "output_lit_bit": false
                },
                "5": {
                    "direction": 1,
                    "output_subtract_bit": true,
                    "output_lit_bit": false
                },
                "6": {
                    "direction": 2,
                    "output_subtract_bit": true,
                    "output_lit_bit": false
                },
                "7": {
                    "direction": 3,
                    "output_subtract_bit": true,
                    "output_lit_bit": false
                },
                "8": {
                    "direction": 0,
                    "output_subtract_bit": false,
                    "output_lit_bit": true
                },
                "9": {
                    "direction": 1,
                    "output_subtract_bit": false,
                    "output_lit_bit": true
                },
                "10": {
                    "direction": 2,
                    "output_subtract_bit": false,
                    "output_lit_bit": true
                },
                "11": {
                    "direction": 3,
                    "output_subtract_bit": false,
                    "output_lit_bit": true
                },
                "12": {
                    "direction": 0,
                    "output_subtract_bit": true,
                    "output_lit_bit": true
                },
                "13": {
                    "direction": 1,
                    "output_subtract_bit": true,
                    "output_lit_bit": true
                },
                "14": {
                    "direction": 2,
                    "output_subtract_bit": true,
                    "output_lit_bit": true
                },
                "15": {
                    "direction": 3,
                    "output_subtract_bit": true,
                    "output_lit_bit": true
                }
            }
        },
        "minecraft:powered_comparator": {
            "id": 150,
            "data": {
                "0": {
                    "direction": 0,
                    "output_subtract_bit": false,
                    "output_lit_bit": false
                },
                "1": {
                    "direction": 1,
                    "output_subtract_bit": false,
                    "output_lit_bit": false
                },
                "2": {
                    "direction": 2,
                    "output_subtract_bit": false,
                    "output_lit_bit": false
                },
                "3": {
                    "direction": 3,
                    "output_subtract_bit": false,
                    "output_lit_bit": false
                },
                "4": {
                    "direction": 0,
                    "output_subtract_bit": true,
                    "output_lit_bit": false
                },
                "5": {
                    "direction": 1,
                    "output_subtract_bit": true,
                    "output_lit_bit": false
                },
                "6": {
                    "direction": 2,
                    "output_subtract_bit": true,
                    "output_lit_bit": false
                },
                "7": {
                    "direction": 3,
                    "output_subtract_bit": true,
                    "output_lit_bit": false
                },
                "8": {
                    "direction": 0,
                    "output_subtract_bit": false,
                    "output_lit_bit": true
                },
                "9": {
                    "direction": 1,
                    "output_subtract_bit": false,
                    "output_lit_bit": true
                },
                "10": {
                    "direction": 2,
                    "output_subtract_bit": false,
                    "output_lit_bit": true
                },
                "11": {
                    "direction": 3,
                    "output_subtract_bit": false,
                    "output_lit_bit": true
                },
                "12": {
                    "direction": 0,
                    "output_subtract_bit": true,
                    "output_lit_bit": true
                },
                "13": {
                    "direction": 1,
                    "output_subtract_bit": true,
                    "output_lit_bit": true
                },
                "14": {
                    "direction": 2,
                    "output_subtract_bit": true,
                    "output_lit_bit": true
                },
                "15": {
                    "direction": 3,
                    "output_subtract_bit": true,
                    "output_lit_bit": true
                }
            }
        },
        "minecraft:daylight_detector": {
            "id": 151,
            "data": {
                "0": {
                    "redstone_signal": 0
                },
                "1": {
                    "redstone_signal": 1
                },
                "2": {
                    "redstone_signal": 2
                },
                "3": {
                    "redstone_signal": 3
                },
                "4": {
                    "redstone_signal": 4
                },
                "5": {
                    "redstone_signal": 5
                },
                "6": {
                    "redstone_signal": 6
                },
                "7": {
                    "redstone_signal": 7
                },
                "8": {
                    "redstone_signal": 8
                },
                "9": {
                    "redstone_signal": 9
                },
                "10": {
                    "redstone_signal": 10
                },
                "11": {
                    "redstone_signal": 11
                },
                "12": {
                    "redstone_signal": 12
                },
                "13": {
                    "redstone_signal": 13
                },
                "14": {
                    "redstone_signal": 14
                },
                "15": {
                    "redstone_signal": 15
                }
            }
        },
        "minecraft:redstone_block": {
            "id": 152,
            "data": {}
        },
        "minecraft:quartz_ore": {
            "id": 153,
            "data": {}
        },
        "minecraft:hopper": {
            "id": 154,
            "data": {
                "0": {
                    "facing_direction": 0,
                    "toggle_bit": false
                },
                "1": {
                    "facing_direction": 1,
                    "toggle_bit": false
                },
                "2": {
                    "facing_direction": 2,
                    "toggle_bit": false
                },
                "3": {
                    "facing_direction": 3,
                    "toggle_bit": false
                },
                "4": {
                    "facing_direction": 4,
                    "toggle_bit": false
                },
                "5": {
                    "facing_direction": 5,
                    "toggle_bit": false
                },
                "6": {
                    "facing_direction": 0,
                    "toggle_bit": false
                },
                "7": {
                    "facing_direction": 0,
                    "toggle_bit": false
                },
                "8": {
                    "facing_direction": 0,
                    "toggle_bit": true
                },
                "9": {
                    "facing_direction": 1,
                    "toggle_bit": true
                },
                "10": {
                    "facing_direction": 2,
                    "toggle_bit": true
                },
                "11": {
                    "facing_direction": 3,
                    "toggle_bit": true
                },
                "12": {
                    "facing_direction": 4,
                    "toggle_bit": true
                },
                "13": {
                    "facing_direction": 5,
                    "toggle_bit": true
                },
                "14": {
                    "facing_direction": 0,
                    "toggle_bit": true
                },
                "15": {
                    "facing_direction": 0,
                    "toggle_bit": true
                }
            }
        },
        "minecraft:quartz_block": {
            "id": 155,
            "data": {
                "0": {
                    "chisel_type": "default",
                    "pillar_axis": "y"
                },
                "1": {
                    "chisel_type": "chiseled",
                    "pillar_axis": "y"
                },
                "2": {
                    "chisel_type": "lines",
                    "pillar_axis": "y"
                },
                "3": {
                    "chisel_type": "smooth",
                    "pillar_axis": "y"
                },
                "4": {
                    "chisel_type": "default",
                    "pillar_axis": "x"
                },
                "5": {
                    "chisel_type": "chiseled",
                    "pillar_axis": "x"
                },
                "6": {
                    "chisel_type": "lines",
                    "pillar_axis": "x"
                },
                "7": {
                    "chisel_type": "smooth",
                    "pillar_axis": "x"
                },
                "8": {
                    "chisel_type": "default",
                    "pillar_axis": "z"
                },
                "9": {
                    "chisel_type": "chiseled",
                    "pillar_axis": "z"
                },
                "10": {
                    "chisel_type": "lines",
                    "pillar_axis": "z"
                },
                "11": {
                    "chisel_type": "smooth",
                    "pillar_axis": "z"
                }
            }
        },
        "minecraft:quartz_stairs": {
            "id": 156,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:double_wooden_slab": {
            "id": 157,
            "data": {
                "0": {
                    "wood_type": "oak",
                    "top_slot_bit": false
                },
                "1": {
                    "wood_type": "spruce",
                    "top_slot_bit": false
                },
                "2": {
                    "wood_type": "birch",
                    "top_slot_bit": false
                },
                "3": {
                    "wood_type": "jungle",
                    "top_slot_bit": false
                },
                "4": {
                    "wood_type": "acacia",
                    "top_slot_bit": false
                },
                "5": {
                    "wood_type": "dark_oak",
                    "top_slot_bit": false
                },
                "8": {
                    "wood_type": "oak",
                    "top_slot_bit": true
                },
                "9": {
                    "wood_type": "spruce",
                    "top_slot_bit": true
                },
                "10": {
                    "wood_type": "birch",
                    "top_slot_bit": true
                },
                "11": {
                    "wood_type": "jungle",
                    "top_slot_bit": true
                },
                "12": {
                    "wood_type": "acacia",
                    "top_slot_bit": true
                },
                "13": {
                    "wood_type": "dark_oak",
                    "top_slot_bit": true
                }
            }
        },
        "minecraft:wooden_slab": {
            "id": 158,
            "data": {
                "0": {
                    "wood_type": "oak",
                    "top_slot_bit": false
                },
                "1": {
                    "wood_type": "spruce",
                    "top_slot_bit": false
                },
                "2": {
                    "wood_type": "birch",
                    "top_slot_bit": false
                },
                "3": {
                    "wood_type": "jungle",
                    "top_slot_bit": false
                },
                "4": {
                    "wood_type": "acacia",
                    "top_slot_bit": false
                },
                "5": {
                    "wood_type": "dark_oak",
                    "top_slot_bit": false
                },
                "8": {
                    "wood_type": "oak",
                    "top_slot_bit": true
                },
                "9": {
                    "wood_type": "spruce",
                    "top_slot_bit": true
                },
                "10": {
                    "wood_type": "birch",
                    "top_slot_bit": true
                },
                "11": {
                    "wood_type": "jungle",
                    "top_slot_bit": true
                },
                "12": {
                    "wood_type": "acacia",
                    "top_slot_bit": true
                },
                "13": {
                    "wood_type": "dark_oak",
                    "top_slot_bit": true
                }
            }
        },
        "minecraft:stained_hardened_clay": {
            "id": 159,
            "data": {
                "0": {
                    "color": "white"
                },
                "1": {
                    "color": "orange"
                },
                "2": {
                    "color": "magenta"
                },
                "3": {
                    "color": "light_blue"
                },
                "4": {
                    "color": "yellow"
                },
                "5": {
                    "color": "lime"
                },
                "6": {
                    "color": "pink"
                },
                "7": {
                    "color": "gray"
                },
                "8": {
                    "color": "silver"
                },
                "9": {
                    "color": "cyan"
                },
                "10": {
                    "color": "purple"
                },
                "11": {
                    "color": "blue"
                },
                "12": {
                    "color": "brown"
                },
                "13": {
                    "color": "green"
                },
                "14": {
                    "color": "red"
                },
                "15": {
                    "color": "black"
                }
            }
        },
        "minecraft:stained_glass_pane": {
            "id": 160,
            "data": {
                "0": {
                    "color": "white"
                },
                "1": {
                    "color": "orange"
                },
                "2": {
                    "color": "magenta"
                },
                "3": {
                    "color": "light_blue"
                },
                "4": {
                    "color": "yellow"
                },
                "5": {
                    "color": "lime"
                },
                "6": {
                    "color": "pink"
                },
                "7": {
                    "color": "gray"
                },
                "8": {
                    "color": "silver"
                },
                "9": {
                    "color": "cyan"
                },
                "10": {
                    "color": "purple"
                },
                "11": {
                    "color": "blue"
                },
                "12": {
                    "color": "brown"
                },
                "13": {
                    "color": "green"
                },
                "14": {
                    "color": "red"
                },
                "15": {
                    "color": "black"
                }
            }
        },
        "minecraft:leaves2": {
            "id": 161,
            "data": {
                "0": {
                    "new_leaf_type": "acacia",
                    "update_bit": false,
                    "persistent_bit": false
                },
                "1": {
                    "new_leaf_type": "dark_oak",
                    "update_bit": false,
                    "persistent_bit": false
                },
                "4": {
                    "new_leaf_type": "acacia",
                    "update_bit": true,
                    "persistent_bit": false
                },
                "5": {
                    "new_leaf_type": "dark_oak",
                    "update_bit": true,
                    "persistent_bit": false
                },
                "8": {
                    "new_leaf_type": "acacia",
                    "update_bit": false,
                    "persistent_bit": true
                },
                "9": {
                    "new_leaf_type": "dark_oak",
                    "update_bit": false,
                    "persistent_bit": true
                },
                "12": {
                    "new_leaf_type": "acacia",
                    "update_bit": true,
                    "persistent_bit": true
                },
                "13": {
                    "new_leaf_type": "dark_oak",
                    "update_bit": true,
                    "persistent_bit": true
                }
            }
        },
        "minecraft:log2": {
            "id": 162,
            "data": {
                "0": {
                    "new_log_type": "acacia",
                    "pillar_axis": "y"
                },
                "1": {
                    "new_log_type": "dark_oak",
                    "pillar_axis": "y"
                },
                "4": {
                    "new_log_type": "acacia",
                    "pillar_axis": "x"
                },
                "5": {
                    "new_log_type": "dark_oak",
                    "pillar_axis": "x"
                },
                "8": {
                    "new_log_type": "acacia",
                    "pillar_axis": "z"
                },
                "9": {
                    "new_log_type": "dark_oak",
                    "pillar_axis": "z"
                }
            }
        },
        "minecraft:acacia_stairs": {
            "id": 163,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:dark_oak_stairs": {
            "id": 164,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:slime": {
            "id": 165,
            "data": {}
        },
        "minecraft:iron_trapdoor": {
            "id": 167,
            "data": {
                "0": {
                    "direction": 0,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "1": {
                    "direction": 1,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "2": {
                    "direction": 2,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "3": {
                    "direction": 3,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "4": {
                    "direction": 0,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "5": {
                    "direction": 1,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "6": {
                    "direction": 2,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "7": {
                    "direction": 3,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "8": {
                    "direction": 0,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "9": {
                    "direction": 1,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "10": {
                    "direction": 2,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "11": {
                    "direction": 3,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "12": {
                    "direction": 0,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "13": {
                    "direction": 1,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "14": {
                    "direction": 2,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "15": {
                    "direction": 3,
                    "upside_down_bit": true,
                    "open_bit": true
                }
            }
        },
        "minecraft:prismarine": {
            "id": 168,
            "data": {
                "0": {
                    "prismarine_block_type": "default"
                },
                "1": {
                    "prismarine_block_type": "dark"
                },
                "2": {
                    "prismarine_block_type": "bricks"
                }
            }
        },
        "minecraft:seaLantern": {
            "id": 169,
            "data": {}
        },
        "minecraft:hay_block": {
            "id": 170,
            "data": {
                "0": {
                    "deprecated": 0,
                    "pillar_axis": "y"
                },
                "1": {
                    "deprecated": 1,
                    "pillar_axis": "y"
                },
                "2": {
                    "deprecated": 2,
                    "pillar_axis": "y"
                },
                "3": {
                    "deprecated": 3,
                    "pillar_axis": "y"
                },
                "4": {
                    "deprecated": 0,
                    "pillar_axis": "x"
                },
                "5": {
                    "deprecated": 1,
                    "pillar_axis": "x"
                },
                "6": {
                    "deprecated": 2,
                    "pillar_axis": "x"
                },
                "7": {
                    "deprecated": 3,
                    "pillar_axis": "x"
                },
                "8": {
                    "deprecated": 0,
                    "pillar_axis": "z"
                },
                "9": {
                    "deprecated": 1,
                    "pillar_axis": "z"
                },
                "10": {
                    "deprecated": 2,
                    "pillar_axis": "z"
                },
                "11": {
                    "deprecated": 3,
                    "pillar_axis": "z"
                }
            }
        },
        "minecraft:carpet": {
            "id": 171,
            "data": {
                "0": {
                    "color": "white"
                },
                "1": {
                    "color": "orange"
                },
                "2": {
                    "color": "magenta"
                },
                "3": {
                    "color": "light_blue"
                },
                "4": {
                    "color": "yellow"
                },
                "5": {
                    "color": "lime"
                },
                "6": {
                    "color": "pink"
                },
                "7": {
                    "color": "gray"
                },
                "8": {
                    "color": "silver"
                },
                "9": {
                    "color": "cyan"
                },
                "10": {
                    "color": "purple"
                },
                "11": {
                    "color": "blue"
                },
                "12": {
                    "color": "brown"
                },
                "13": {
                    "color": "green"
                },
                "14": {
                    "color": "red"
                },
                "15": {
                    "color": "black"
                }
            }
        },
        "minecraft:hardened_clay": {
            "id": 172,
            "data": {}
        },
        "minecraft:coal_block": {
            "id": 173,
            "data": {}
        },
        "minecraft:packed_ice": {
            "id": 174,
            "data": {}
        },
        "minecraft:double_plant": {
            "id": 175,
            "data": {
                "0": {
                    "double_plant_type": "sunflower",
                    "upper_block_bit": false
                },
                "1": {
                    "double_plant_type": "syringa",
                    "upper_block_bit": false
                },
                "2": {
                    "double_plant_type": "grass",
                    "upper_block_bit": false
                },
                "3": {
                    "double_plant_type": "fern",
                    "upper_block_bit": false
                },
                "4": {
                    "double_plant_type": "rose",
                    "upper_block_bit": false
                },
                "5": {
                    "double_plant_type": "paeonia",
                    "upper_block_bit": false
                },
                "8": {
                    "double_plant_type": "sunflower",
                    "upper_block_bit": true
                },
                "9": {
                    "double_plant_type": "syringa",
                    "upper_block_bit": true
                },
                "10": {
                    "double_plant_type": "grass",
                    "upper_block_bit": true
                },
                "11": {
                    "double_plant_type": "fern",
                    "upper_block_bit": true
                },
                "12": {
                    "double_plant_type": "rose",
                    "upper_block_bit": true
                },
                "13": {
                    "double_plant_type": "paeonia",
                    "upper_block_bit": true
                }
            }
        },
        "minecraft:standing_banner": {
            "id": 176,
            "data": {
                "0": {
                    "ground_sign_direction": 0
                },
                "1": {
                    "ground_sign_direction": 1
                },
                "2": {
                    "ground_sign_direction": 2
                },
                "3": {
                    "ground_sign_direction": 3
                },
                "4": {
                    "ground_sign_direction": 4
                },
                "5": {
                    "ground_sign_direction": 5
                },
                "6": {
                    "ground_sign_direction": 6
                },
                "7": {
                    "ground_sign_direction": 7
                },
                "8": {
                    "ground_sign_direction": 8
                },
                "9": {
                    "ground_sign_direction": 9
                },
                "10": {
                    "ground_sign_direction": 10
                },
                "11": {
                    "ground_sign_direction": 11
                },
                "12": {
                    "ground_sign_direction": 12
                },
                "13": {
                    "ground_sign_direction": 13
                },
                "14": {
                    "ground_sign_direction": 14
                },
                "15": {
                    "ground_sign_direction": 15
                }
            }
        },
        "minecraft:wall_banner": {
            "id": 177,
            "data": {
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:daylight_detector_inverted": {
            "id": 178,
            "data": {
                "0": {
                    "redstone_signal": 0
                },
                "1": {
                    "redstone_signal": 1
                },
                "2": {
                    "redstone_signal": 2
                },
                "3": {
                    "redstone_signal": 3
                },
                "4": {
                    "redstone_signal": 4
                },
                "5": {
                    "redstone_signal": 5
                },
                "6": {
                    "redstone_signal": 6
                },
                "7": {
                    "redstone_signal": 7
                },
                "8": {
                    "redstone_signal": 8
                },
                "9": {
                    "redstone_signal": 9
                },
                "10": {
                    "redstone_signal": 10
                },
                "11": {
                    "redstone_signal": 11
                },
                "12": {
                    "redstone_signal": 12
                },
                "13": {
                    "redstone_signal": 13
                },
                "14": {
                    "redstone_signal": 14
                },
                "15": {
                    "redstone_signal": 15
                }
            }
        },
        "minecraft:red_sandstone": {
            "id": 179,
            "data": {
                "0": {
                    "sand_stone_type": "default"
                },
                "1": {
                    "sand_stone_type": "heiroglyphs"
                },
                "2": {
                    "sand_stone_type": "cut"
                },
                "3": {
                    "sand_stone_type": "smooth"
                }
            }
        },
        "minecraft:red_sandstone_stairs": {
            "id": 180,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:double_stone_slab2": {
            "id": 181,
            "data": {
                "0": {
                    "stone_slab_type_2": "red_sandstone",
                    "top_slot_bit": false
                },
                "1": {
                    "stone_slab_type_2": "purpur",
                    "top_slot_bit": false
                },
                "2": {
                    "stone_slab_type_2": "prismarine_rough",
                    "top_slot_bit": false
                },
                "3": {
                    "stone_slab_type_2": "prismarine_dark",
                    "top_slot_bit": false
                },
                "4": {
                    "stone_slab_type_2": "prismarine_brick",
                    "top_slot_bit": false
                },
                "5": {
                    "stone_slab_type_2": "mossy_cobblestone",
                    "top_slot_bit": false
                },
                "6": {
                    "stone_slab_type_2": "smooth_sandstone",
                    "top_slot_bit": false
                },
                "7": {
                    "stone_slab_type_2": "red_nether_brick",
                    "top_slot_bit": false
                },
                "8": {
                    "stone_slab_type_2": "red_sandstone",
                    "top_slot_bit": true
                },
                "9": {
                    "stone_slab_type_2": "purpur",
                    "top_slot_bit": true
                },
                "10": {
                    "stone_slab_type_2": "prismarine_rough",
                    "top_slot_bit": true
                },
                "11": {
                    "stone_slab_type_2": "prismarine_dark",
                    "top_slot_bit": true
                },
                "12": {
                    "stone_slab_type_2": "prismarine_brick",
                    "top_slot_bit": true
                },
                "13": {
                    "stone_slab_type_2": "mossy_cobblestone",
                    "top_slot_bit": true
                },
                "14": {
                    "stone_slab_type_2": "smooth_sandstone",
                    "top_slot_bit": true
                },
                "15": {
                    "stone_slab_type_2": "red_nether_brick",
                    "top_slot_bit": true
                }
            }
        },
        "minecraft:stone_slab2": {
            "id": 182,
            "data": {
                "0": {
                    "stone_slab_type_2": "red_sandstone",
                    "top_slot_bit": false
                },
                "1": {
                    "stone_slab_type_2": "purpur",
                    "top_slot_bit": false
                },
                "2": {
                    "stone_slab_type_2": "prismarine_rough",
                    "top_slot_bit": false
                },
                "3": {
                    "stone_slab_type_2": "prismarine_dark",
                    "top_slot_bit": false
                },
                "4": {
                    "stone_slab_type_2": "prismarine_brick",
                    "top_slot_bit": false
                },
                "5": {
                    "stone_slab_type_2": "mossy_cobblestone",
                    "top_slot_bit": false
                },
                "6": {
                    "stone_slab_type_2": "smooth_sandstone",
                    "top_slot_bit": false
                },
                "7": {
                    "stone_slab_type_2": "red_nether_brick",
                    "top_slot_bit": false
                },
                "8": {
                    "stone_slab_type_2": "red_sandstone",
                    "top_slot_bit": true
                },
                "9": {
                    "stone_slab_type_2": "purpur",
                    "top_slot_bit": true
                },
                "10": {
                    "stone_slab_type_2": "prismarine_rough",
                    "top_slot_bit": true
                },
                "11": {
                    "stone_slab_type_2": "prismarine_dark",
                    "top_slot_bit": true
                },
                "12": {
                    "stone_slab_type_2": "prismarine_brick",
                    "top_slot_bit": true
                },
                "13": {
                    "stone_slab_type_2": "mossy_cobblestone",
                    "top_slot_bit": true
                },
                "14": {
                    "stone_slab_type_2": "smooth_sandstone",
                    "top_slot_bit": true
                },
                "15": {
                    "stone_slab_type_2": "red_nether_brick",
                    "top_slot_bit": true
                }
            }
        },
        "minecraft:spruce_fence_gate": {
            "id": 183,
            "data": {
                "0": {
                    "direction": 0,
                    "open_bit": false
                },
                "1": {
                    "direction": 1,
                    "open_bit": false
                },
                "2": {
                    "direction": 2,
                    "open_bit": false
                },
                "3": {
                    "direction": 3,
                    "open_bit": false
                },
                "4": {
                    "direction": 0,
                    "open_bit": true
                },
                "5": {
                    "direction": 1,
                    "open_bit": true
                },
                "6": {
                    "direction": 2,
                    "open_bit": true
                },
                "7": {
                    "direction": 3,
                    "open_bit": true
                }
            }
        },
        "minecraft:birch_fence_gate": {
            "id": 184,
            "data": {
                "0": {
                    "direction": 0,
                    "open_bit": false
                },
                "1": {
                    "direction": 1,
                    "open_bit": false
                },
                "2": {
                    "direction": 2,
                    "open_bit": false
                },
                "3": {
                    "direction": 3,
                    "open_bit": false
                },
                "4": {
                    "direction": 0,
                    "open_bit": true
                },
                "5": {
                    "direction": 1,
                    "open_bit": true
                },
                "6": {
                    "direction": 2,
                    "open_bit": true
                },
                "7": {
                    "direction": 3,
                    "open_bit": true
                }
            }
        },
        "minecraft:jungle_fence_gate": {
            "id": 185,
            "data": {
                "0": {
                    "direction": 0,
                    "open_bit": false
                },
                "1": {
                    "direction": 1,
                    "open_bit": false
                },
                "2": {
                    "direction": 2,
                    "open_bit": false
                },
                "3": {
                    "direction": 3,
                    "open_bit": false
                },
                "4": {
                    "direction": 0,
                    "open_bit": true
                },
                "5": {
                    "direction": 1,
                    "open_bit": true
                },
                "6": {
                    "direction": 2,
                    "open_bit": true
                },
                "7": {
                    "direction": 3,
                    "open_bit": true
                }
            }
        },
        "minecraft:dark_oak_fence_gate": {
            "id": 186,
            "data": {
                "0": {
                    "direction": 0,
                    "open_bit": false
                },
                "1": {
                    "direction": 1,
                    "open_bit": false
                },
                "2": {
                    "direction": 2,
                    "open_bit": false
                },
                "3": {
                    "direction": 3,
                    "open_bit": false
                },
                "4": {
                    "direction": 0,
                    "open_bit": true
                },
                "5": {
                    "direction": 1,
                    "open_bit": true
                },
                "6": {
                    "direction": 2,
                    "open_bit": true
                },
                "7": {
                    "direction": 3,
                    "open_bit": true
                }
            }
        },
        "minecraft:acacia_fence_gate": {
            "id": 187,
            "data": {
                "0": {
                    "direction": 0,
                    "open_bit": false
                },
                "1": {
                    "direction": 1,
                    "open_bit": false
                },
                "2": {
                    "direction": 2,
                    "open_bit": false
                },
                "3": {
                    "direction": 3,
                    "open_bit": false
                },
                "4": {
                    "direction": 0,
                    "open_bit": true
                },
                "5": {
                    "direction": 1,
                    "open_bit": true
                },
                "6": {
                    "direction": 2,
                    "open_bit": true
                },
                "7": {
                    "direction": 3,
                    "open_bit": true
                }
            }
        },
        "minecraft:repeating_command_block": {
            "id": 188,
            "data": {
                "0": {
                    "facing_direction": 0,
                    "conditional_bit": false
                },
                "1": {
                    "facing_direction": 1,
                    "conditional_bit": false
                },
                "2": {
                    "facing_direction": 2,
                    "conditional_bit": false
                },
                "3": {
                    "facing_direction": 3,
                    "conditional_bit": false
                },
                "4": {
                    "facing_direction": 4,
                    "conditional_bit": false
                },
                "5": {
                    "facing_direction": 5,
                    "conditional_bit": false
                },
                "6": {
                    "facing_direction": 0,
                    "conditional_bit": false
                },
                "7": {
                    "facing_direction": 0,
                    "conditional_bit": false
                },
                "8": {
                    "facing_direction": 0,
                    "conditional_bit": true
                },
                "9": {
                    "facing_direction": 1,
                    "conditional_bit": true
                },
                "10": {
                    "facing_direction": 2,
                    "conditional_bit": true
                },
                "11": {
                    "facing_direction": 3,
                    "conditional_bit": true
                },
                "12": {
                    "facing_direction": 4,
                    "conditional_bit": true
                },
                "13": {
                    "facing_direction": 5,
                    "conditional_bit": true
                },
                "14": {
                    "facing_direction": 0,
                    "conditional_bit": true
                },
                "15": {
                    "facing_direction": 0,
                    "conditional_bit": true
                }
            }
        },
        "minecraft:chain_command_block": {
            "id": 189,
            "data": {
                "0": {
                    "facing_direction": 0,
                    "conditional_bit": false
                },
                "1": {
                    "facing_direction": 1,
                    "conditional_bit": false
                },
                "2": {
                    "facing_direction": 2,
                    "conditional_bit": false
                },
                "3": {
                    "facing_direction": 3,
                    "conditional_bit": false
                },
                "4": {
                    "facing_direction": 4,
                    "conditional_bit": false
                },
                "5": {
                    "facing_direction": 5,
                    "conditional_bit": false
                },
                "6": {
                    "facing_direction": 0,
                    "conditional_bit": false
                },
                "7": {
                    "facing_direction": 0,
                    "conditional_bit": false
                },
                "8": {
                    "facing_direction": 0,
                    "conditional_bit": true
                },
                "9": {
                    "facing_direction": 1,
                    "conditional_bit": true
                },
                "10": {
                    "facing_direction": 2,
                    "conditional_bit": true
                },
                "11": {
                    "facing_direction": 3,
                    "conditional_bit": true
                },
                "12": {
                    "facing_direction": 4,
                    "conditional_bit": true
                },
                "13": {
                    "facing_direction": 5,
                    "conditional_bit": true
                },
                "14": {
                    "facing_direction": 0,
                    "conditional_bit": true
                },
                "15": {
                    "facing_direction": 0,
                    "conditional_bit": true
                }
            }
        },
        "minecraft:hard_glass_pane": {
            "id": 190,
            "data": {}
        },
        "minecraft:hard_stained_glass_pane": {
            "id": 191,
            "data": {}
        },
        "minecraft:chemical_heat": {
            "id": 192,
            "data": {}
        },
        "minecraft:spruce_door": {
            "id": 193,
            "data": {
                "0": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "1": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "2": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "3": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "4": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "5": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "6": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "7": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "8": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "9": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "10": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "11": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "12": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "13": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "14": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "15": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": true
                }
            }
        },
        "minecraft:birch_door": {
            "id": 194,
            "data": {
                "0": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "1": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "2": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "3": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "4": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "5": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "6": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "7": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "8": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "9": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "10": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "11": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "12": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "13": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "14": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "15": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": true
                }
            }
        },
        "minecraft:jungle_door": {
            "id": 195,
            "data": {
                "0": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "1": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "2": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "3": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "4": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "5": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "6": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "7": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "8": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "9": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "10": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "11": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "12": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "13": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "14": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "15": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": true
                }
            }
        },
        "minecraft:acacia_door": {
            "id": 196,
            "data": {
                "0": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "1": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "2": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "3": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "4": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "5": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "6": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "7": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "8": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "9": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "10": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "11": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "12": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "13": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "14": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "15": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": true
                }
            }
        },
        "minecraft:dark_oak_door": {
            "id": 197,
            "data": {
                "0": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "1": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "2": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "3": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": false
                },
                "4": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "5": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "6": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "7": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": false
                },
                "8": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "9": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "10": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "11": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": false,
                    "upper_block_bit": true
                },
                "12": {
                    "direction": 0,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "13": {
                    "direction": 1,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "14": {
                    "direction": 2,
                    "door_hinge_bit": false,
                    "open_bit": true,
                    "upper_block_bit": true
                },
                "15": {
                    "direction": 3,
                    "door_hinge_bit": true,
                    "open_bit": true,
                    "upper_block_bit": true
                }
            }
        },
        "minecraft:grass_path": {
            "id": 198,
            "data": {}
        },
        "minecraft:frame": {
            "id": 199,
            "data": {
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:chorus_flower": {
            "id": 200,
            "data": {
                "0": {
                    "age": 0
                },
                "1": {
                    "age": 1
                },
                "2": {
                    "age": 2
                },
                "3": {
                    "age": 3
                },
                "4": {
                    "age": 4
                },
                "5": {
                    "age": 5
                }
            }
        },
        "minecraft:purpur_block": {
            "id": 201,
            "data": {
                "0": {
                    "chisel_type": "default",
                    "pillar_axis": "y"
                },
                "1": {
                    "chisel_type": "chiseled",
                    "pillar_axis": "y"
                },
                "2": {
                    "chisel_type": "lines",
                    "pillar_axis": "y"
                },
                "3": {
                    "chisel_type": "smooth",
                    "pillar_axis": "y"
                },
                "4": {
                    "chisel_type": "default",
                    "pillar_axis": "x"
                },
                "5": {
                    "chisel_type": "chiseled",
                    "pillar_axis": "x"
                },
                "6": {
                    "chisel_type": "lines",
                    "pillar_axis": "x"
                },
                "7": {
                    "chisel_type": "smooth",
                    "pillar_axis": "x"
                },
                "8": {
                    "chisel_type": "default",
                    "pillar_axis": "z"
                },
                "9": {
                    "chisel_type": "chiseled",
                    "pillar_axis": "z"
                },
                "10": {
                    "chisel_type": "lines",
                    "pillar_axis": "z"
                },
                "11": {
                    "chisel_type": "smooth",
                    "pillar_axis": "z"
                }
            }
        },
        "minecraft:colored_torch_rg": {
            "id": 202,
            "data": {}
        },
        "minecraft:purpur_stairs": {
            "id": 203,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:colored_torch_bp": {
            "id": 204,
            "data": {}
        },
        "minecraft:undyed_shulker_box": {
            "id": 205,
            "data": {}
        },
        "minecraft:end_bricks": {
            "id": 206,
            "data": {}
        },
        "minecraft:frosted_ice": {
            "id": 207,
            "data": {}
        },
        "minecraft:end_rod": {
            "id": 208,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:end_gateway": {
            "id": 209,
            "data": {}
        },
        "minecraft:magma": {
            "id": 213,
            "data": {}
        },
        "minecraft:nether_wart_block": {
            "id": 214,
            "data": {}
        },
        "minecraft:red_nether_brick": {
            "id": 215,
            "data": {}
        },
        "minecraft:bone_block": {
            "id": 216,
            "data": {
                "0": {
                    "deprecated": 0,
                    "pillar_axis": "y"
                },
                "1": {
                    "deprecated": 1,
                    "pillar_axis": "y"
                },
                "2": {
                    "deprecated": 2,
                    "pillar_axis": "y"
                },
                "3": {
                    "deprecated": 3,
                    "pillar_axis": "y"
                },
                "4": {
                    "deprecated": 0,
                    "pillar_axis": "x"
                },
                "5": {
                    "deprecated": 1,
                    "pillar_axis": "x"
                },
                "6": {
                    "deprecated": 2,
                    "pillar_axis": "x"
                },
                "7": {
                    "deprecated": 3,
                    "pillar_axis": "x"
                },
                "8": {
                    "deprecated": 0,
                    "pillar_axis": "z"
                },
                "9": {
                    "deprecated": 1,
                    "pillar_axis": "z"
                },
                "10": {
                    "deprecated": 2,
                    "pillar_axis": "z"
                },
                "11": {
                    "deprecated": 3,
                    "pillar_axis": "z"
                }
            }
        },
        "minecraft:structure_void": {
            "id": 217,
            "data": {
                "0": {
                    "structure_void_type": "void"
                },
                "1": {
                    "structure_void_type": "air"
                }
            }
        },
        "minecraft:shulker_box": {
            "id": 218,
            "data": {
                "0": {
                    "color": "white"
                },
                "1": {
                    "color": "orange"
                },
                "2": {
                    "color": "magenta"
                },
                "3": {
                    "color": "light_blue"
                },
                "4": {
                    "color": "yellow"
                },
                "5": {
                    "color": "lime"
                },
                "6": {
                    "color": "pink"
                },
                "7": {
                    "color": "gray"
                },
                "8": {
                    "color": "silver"
                },
                "9": {
                    "color": "cyan"
                },
                "10": {
                    "color": "purple"
                },
                "11": {
                    "color": "blue"
                },
                "12": {
                    "color": "brown"
                },
                "13": {
                    "color": "green"
                },
                "14": {
                    "color": "red"
                },
                "15": {
                    "color": "black"
                }
            }
        },
        "minecraft:purple_glazed_terracotta": {
            "id": 219,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:white_glazed_terracotta": {
            "id": 220,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:orange_glazed_terracotta": {
            "id": 221,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:magenta_glazed_terracotta": {
            "id": 222,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:light_blue_glazed_terracotta": {
            "id": 223,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:yellow_glazed_terracotta": {
            "id": 224,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:lime_glazed_terracotta": {
            "id": 225,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:pink_glazed_terracotta": {
            "id": 226,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:gray_glazed_terracotta": {
            "id": 227,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:silver_glazed_terracotta": {
            "id": 228,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:cyan_glazed_terracotta": {
            "id": 229,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:blue_glazed_terracotta": {
            "id": 231,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:brown_glazed_terracotta": {
            "id": 232,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:green_glazed_terracotta": {
            "id": 233,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:red_glazed_terracotta": {
            "id": 234,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:black_glazed_terracotta": {
            "id": 235,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:concrete": {
            "id": 236,
            "data": {
                "0": {
                    "color": "white"
                },
                "1": {
                    "color": "orange"
                },
                "2": {
                    "color": "magenta"
                },
                "3": {
                    "color": "light_blue"
                },
                "4": {
                    "color": "yellow"
                },
                "5": {
                    "color": "lime"
                },
                "6": {
                    "color": "pink"
                },
                "7": {
                    "color": "gray"
                },
                "8": {
                    "color": "silver"
                },
                "9": {
                    "color": "cyan"
                },
                "10": {
                    "color": "purple"
                },
                "11": {
                    "color": "blue"
                },
                "12": {
                    "color": "brown"
                },
                "13": {
                    "color": "green"
                },
                "14": {
                    "color": "red"
                },
                "15": {
                    "color": "black"
                }
            }
        },
        "minecraft:concretePowder": {
            "id": 237,
            "data": {
                "0": {
                    "color": "white"
                },
                "1": {
                    "color": "orange"
                },
                "2": {
                    "color": "magenta"
                },
                "3": {
                    "color": "light_blue"
                },
                "4": {
                    "color": "yellow"
                },
                "5": {
                    "color": "lime"
                },
                "6": {
                    "color": "pink"
                },
                "7": {
                    "color": "gray"
                },
                "8": {
                    "color": "silver"
                },
                "9": {
                    "color": "cyan"
                },
                "10": {
                    "color": "purple"
                },
                "11": {
                    "color": "blue"
                },
                "12": {
                    "color": "brown"
                },
                "13": {
                    "color": "green"
                },
                "14": {
                    "color": "red"
                },
                "15": {
                    "color": "black"
                }
            }
        },
        "minecraft:chemistry_table": {
            "id": 238,
            "data": {}
        },
        "minecraft:underwater_torch": {
            "id": 239,
            "data": {}
        },
        "minecraft:chorus_plant": {
            "id": 240,
            "data": {}
        },
        "minecraft:stained_glass": {
            "id": 241,
            "data": {
                "0": {
                    "color": "white"
                },
                "1": {
                    "color": "orange"
                },
                "2": {
                    "color": "magenta"
                },
                "3": {
                    "color": "light_blue"
                },
                "4": {
                    "color": "yellow"
                },
                "5": {
                    "color": "lime"
                },
                "6": {
                    "color": "pink"
                },
                "7": {
                    "color": "gray"
                },
                "8": {
                    "color": "silver"
                },
                "9": {
                    "color": "cyan"
                },
                "10": {
                    "color": "purple"
                },
                "11": {
                    "color": "blue"
                },
                "12": {
                    "color": "brown"
                },
                "13": {
                    "color": "green"
                },
                "14": {
                    "color": "red"
                },
                "15": {
                    "color": "black"
                }
            }
        },
        "minecraft:camera": {
            "id": 242,
            "data": {}
        },
        "minecraft:podzol": {
            "id": 243,
            "data": {}
        },
        "minecraft:beetroot": {
            "id": 244,
            "data": {
                "0": {
                    "growth": 0
                },
                "1": {
                    "growth": 1
                },
                "2": {
                    "growth": 2
                },
                "3": {
                    "growth": 3
                },
                "4": {
                    "growth": 4
                },
                "5": {
                    "growth": 5
                },
                "6": {
                    "growth": 6
                },
                "7": {
                    "growth": 7
                }
            }
        },
        "minecraft:stonecutter": {
            "id": 245,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:glowingobsidian": {
            "id": 246,
            "data": {}
        },
        "minecraft:netherreactor": {
            "id": 247,
            "data": {}
        },
        "minecraft:info_update": {
            "id": 248,
            "data": {}
        },
        "minecraft:info_update2": {
            "id": 249,
            "data": {}
        },
        "minecraft:movingBlock": {
            "id": 250,
            "data": {}
        },
        "minecraft:observer": {
            "id": 251,
            "data": {
                "0": {
                    "facing_direction": 0,
                    "powered_bit": false
                },
                "1": {
                    "facing_direction": 1,
                    "powered_bit": false
                },
                "2": {
                    "facing_direction": 2,
                    "powered_bit": false
                },
                "3": {
                    "facing_direction": 3,
                    "powered_bit": false
                },
                "4": {
                    "facing_direction": 4,
                    "powered_bit": false
                },
                "5": {
                    "facing_direction": 5,
                    "powered_bit": false
                },
                "8": {
                    "facing_direction": 0,
                    "powered_bit": true
                },
                "9": {
                    "facing_direction": 1,
                    "powered_bit": true
                },
                "10": {
                    "facing_direction": 2,
                    "powered_bit": true
                },
                "11": {
                    "facing_direction": 3,
                    "powered_bit": true
                },
                "12": {
                    "facing_direction": 4,
                    "powered_bit": true
                },
                "13": {
                    "facing_direction": 5,
                    "powered_bit": true
                }
            }
        },
        "minecraft:structure_block": {
            "id": 252,
            "data": {
                "0": {
                    "structure_block_type": "data"
                },
                "1": {
                    "structure_block_type": "save"
                },
                "2": {
                    "structure_block_type": "load"
                },
                "3": {
                    "structure_block_type": "corner"
                },
                "4": {
                    "structure_block_type": "invalid"
                },
                "5": {
                    "structure_block_type": "export"
                }
            }
        },
        "minecraft:hard_glass": {
            "id": 253,
            "data": {}
        },
        "minecraft:hard_stained_glass": {
            "id": 254,
            "data": {}
        },
        "minecraft:reserved6": {
            "id": 255,
            "data": {}
        },
        "minecraft:prismarine_stairs": {
            "id": 257,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:dark_prismarine_stairs": {
            "id": 258,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:prismarine_bricks_stairs": {
            "id": 259,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:stripped_spruce_log": {
            "id": 260,
            "data": {
                "0": {
                    "pillar_axis": "y"
                },
                "1": {
                    "pillar_axis": "x"
                },
                "2": {
                    "pillar_axis": "z"
                }
            }
        },
        "minecraft:stripped_birch_log": {
            "id": 261,
            "data": {
                "0": {
                    "pillar_axis": "y"
                },
                "1": {
                    "pillar_axis": "x"
                },
                "2": {
                    "pillar_axis": "z"
                }
            }
        },
        "minecraft:stripped_jungle_log": {
            "id": 262,
            "data": {
                "0": {
                    "pillar_axis": "y"
                },
                "1": {
                    "pillar_axis": "x"
                },
                "2": {
                    "pillar_axis": "z"
                }
            }
        },
        "minecraft:stripped_acacia_log": {
            "id": 263,
            "data": {
                "0": {
                    "pillar_axis": "y"
                },
                "1": {
                    "pillar_axis": "x"
                },
                "2": {
                    "pillar_axis": "z"
                }
            }
        },
        "minecraft:stripped_dark_oak_log": {
            "id": 264,
            "data": {
                "0": {
                    "pillar_axis": "y"
                },
                "1": {
                    "pillar_axis": "x"
                },
                "2": {
                    "pillar_axis": "z"
                }
            }
        },
        "minecraft:stripped_oak_log": {
            "id": 265,
            "data": {
                "0": {
                    "pillar_axis": "y"
                },
                "1": {
                    "pillar_axis": "x"
                },
                "2": {
                    "pillar_axis": "z"
                }
            }
        },
        "minecraft:blue_ice": {
            "id": 266,
            "data": {}
        },
        "minecraft:element_1": {
            "id": 267,
            "data": 267
        },
        "minecraft:element_2": {
            "id": 268,
            "data": 268
        },
        "minecraft:element_3": {
            "id": 269,
            "data": 269
        },
        "minecraft:element_4": {
            "id": 270,
            "data": 270
        },
        "minecraft:element_5": {
            "id": 271,
            "data": 271
        },
        "minecraft:element_6": {
            "id": 272,
            "data": 272
        },
        "minecraft:element_7": {
            "id": 273,
            "data": 273
        },
        "minecraft:element_8": {
            "id": 274,
            "data": 274
        },
        "minecraft:element_9": {
            "id": 275,
            "data": 275
        },
        "minecraft:element_10": {
            "id": 276,
            "data": 276
        },
        "minecraft:element_11": {
            "id": 277,
            "data": 277
        },
        "minecraft:element_12": {
            "id": 278,
            "data": 278
        },
        "minecraft:element_13": {
            "id": 279,
            "data": 279
        },
        "minecraft:element_14": {
            "id": 280,
            "data": 280
        },
        "minecraft:element_15": {
            "id": 281,
            "data": 281
        },
        "minecraft:element_16": {
            "id": 282,
            "data": 282
        },
        "minecraft:element_17": {
            "id": 283,
            "data": 283
        },
        "minecraft:element_18": {
            "id": 284,
            "data": 284
        },
        "minecraft:element_19": {
            "id": 285,
            "data": 285
        },
        "minecraft:element_20": {
            "id": 286,
            "data": 286
        },
        "minecraft:element_21": {
            "id": 287,
            "data": 287
        },
        "minecraft:element_22": {
            "id": 288,
            "data": 288
        },
        "minecraft:element_23": {
            "id": 289,
            "data": 289
        },
        "minecraft:element_24": {
            "id": 290,
            "data": 290
        },
        "minecraft:element_25": {
            "id": 291,
            "data": 291
        },
        "minecraft:element_26": {
            "id": 292,
            "data": 292
        },
        "minecraft:element_27": {
            "id": 293,
            "data": 293
        },
        "minecraft:element_28": {
            "id": 294,
            "data": 294
        },
        "minecraft:element_29": {
            "id": 295,
            "data": 295
        },
        "minecraft:element_30": {
            "id": 296,
            "data": 296
        },
        "minecraft:element_31": {
            "id": 297,
            "data": 297
        },
        "minecraft:element_32": {
            "id": 298,
            "data": 298
        },
        "minecraft:element_33": {
            "id": 299,
            "data": 299
        },
        "minecraft:element_34": {
            "id": 300,
            "data": 300
        },
        "minecraft:element_35": {
            "id": 301,
            "data": 301
        },
        "minecraft:element_36": {
            "id": 302,
            "data": 302
        },
        "minecraft:element_37": {
            "id": 303,
            "data": 303
        },
        "minecraft:element_38": {
            "id": 304,
            "data": 304
        },
        "minecraft:element_39": {
            "id": 305,
            "data": 305
        },
        "minecraft:element_40": {
            "id": 306,
            "data": 306
        },
        "minecraft:element_41": {
            "id": 307,
            "data": 307
        },
        "minecraft:element_42": {
            "id": 308,
            "data": 308
        },
        "minecraft:element_43": {
            "id": 309,
            "data": 309
        },
        "minecraft:element_44": {
            "id": 310,
            "data": 310
        },
        "minecraft:element_45": {
            "id": 311,
            "data": 311
        },
        "minecraft:element_46": {
            "id": 312,
            "data": 312
        },
        "minecraft:element_47": {
            "id": 313,
            "data": 313
        },
        "minecraft:element_48": {
            "id": 314,
            "data": 314
        },
        "minecraft:element_49": {
            "id": 315,
            "data": 315
        },
        "minecraft:element_50": {
            "id": 316,
            "data": 316
        },
        "minecraft:element_51": {
            "id": 317,
            "data": 317
        },
        "minecraft:element_52": {
            "id": 318,
            "data": 318
        },
        "minecraft:element_53": {
            "id": 319,
            "data": 319
        },
        "minecraft:element_54": {
            "id": 320,
            "data": 320
        },
        "minecraft:element_55": {
            "id": 321,
            "data": 321
        },
        "minecraft:element_56": {
            "id": 322,
            "data": 322
        },
        "minecraft:element_57": {
            "id": 323,
            "data": 323
        },
        "minecraft:element_58": {
            "id": 324,
            "data": 324
        },
        "minecraft:element_59": {
            "id": 325,
            "data": 325
        },
        "minecraft:element_60": {
            "id": 326,
            "data": 326
        },
        "minecraft:element_61": {
            "id": 327,
            "data": 327
        },
        "minecraft:element_62": {
            "id": 328,
            "data": 328
        },
        "minecraft:element_63": {
            "id": 329,
            "data": 329
        },
        "minecraft:element_64": {
            "id": 330,
            "data": 330
        },
        "minecraft:element_65": {
            "id": 331,
            "data": 331
        },
        "minecraft:element_66": {
            "id": 332,
            "data": 332
        },
        "minecraft:element_67": {
            "id": 333,
            "data": 333
        },
        "minecraft:element_68": {
            "id": 334,
            "data": 334
        },
        "minecraft:element_69": {
            "id": 335,
            "data": 335
        },
        "minecraft:element_70": {
            "id": 336,
            "data": 336
        },
        "minecraft:element_71": {
            "id": 337,
            "data": 337
        },
        "minecraft:element_72": {
            "id": 338,
            "data": 338
        },
        "minecraft:element_73": {
            "id": 339,
            "data": 339
        },
        "minecraft:element_74": {
            "id": 340,
            "data": 340
        },
        "minecraft:element_75": {
            "id": 341,
            "data": 341
        },
        "minecraft:element_76": {
            "id": 342,
            "data": 342
        },
        "minecraft:element_77": {
            "id": 343,
            "data": 343
        },
        "minecraft:element_78": {
            "id": 344,
            "data": 344
        },
        "minecraft:element_79": {
            "id": 345,
            "data": 345
        },
        "minecraft:element_80": {
            "id": 346,
            "data": 346
        },
        "minecraft:element_81": {
            "id": 347,
            "data": 347
        },
        "minecraft:element_82": {
            "id": 348,
            "data": 348
        },
        "minecraft:element_83": {
            "id": 349,
            "data": 349
        },
        "minecraft:element_84": {
            "id": 350,
            "data": 350
        },
        "minecraft:element_85": {
            "id": 351,
            "data": 351
        },
        "minecraft:element_86": {
            "id": 352,
            "data": 352
        },
        "minecraft:element_87": {
            "id": 353,
            "data": 353
        },
        "minecraft:element_88": {
            "id": 354,
            "data": 354
        },
        "minecraft:element_89": {
            "id": 355,
            "data": 355
        },
        "minecraft:element_90": {
            "id": 356,
            "data": 356
        },
        "minecraft:element_91": {
            "id": 357,
            "data": 357
        },
        "minecraft:element_92": {
            "id": 358,
            "data": 358
        },
        "minecraft:element_93": {
            "id": 359,
            "data": 359
        },
        "minecraft:element_94": {
            "id": 360,
            "data": 360
        },
        "minecraft:element_95": {
            "id": 361,
            "data": 361
        },
        "minecraft:element_96": {
            "id": 362,
            "data": 362
        },
        "minecraft:element_97": {
            "id": 363,
            "data": 363
        },
        "minecraft:element_98": {
            "id": 364,
            "data": 364
        },
        "minecraft:element_99": {
            "id": 365,
            "data": 365
        },
        "minecraft:element_100": {
            "id": 366,
            "data": 366
        },
        "minecraft:element_101": {
            "id": 367,
            "data": 367
        },
        "minecraft:element_102": {
            "id": 368,
            "data": 368
        },
        "minecraft:element_103": {
            "id": 369,
            "data": 369
        },
        "minecraft:element_104": {
            "id": 370,
            "data": 370
        },
        "minecraft:element_105": {
            "id": 371,
            "data": 371
        },
        "minecraft:element_106": {
            "id": 372,
            "data": 372
        },
        "minecraft:element_107": {
            "id": 373,
            "data": 373
        },
        "minecraft:element_108": {
            "id": 374,
            "data": 374
        },
        "minecraft:element_109": {
            "id": 375,
            "data": 375
        },
        "minecraft:element_110": {
            "id": 376,
            "data": 376
        },
        "minecraft:element_111": {
            "id": 377,
            "data": 377
        },
        "minecraft:element_112": {
            "id": 378,
            "data": 378
        },
        "minecraft:element_113": {
            "id": 379,
            "data": 379
        },
        "minecraft:element_114": {
            "id": 380,
            "data": 380
        },
        "minecraft:element_115": {
            "id": 381,
            "data": 381
        },
        "minecraft:element_116": {
            "id": 382,
            "data": 382
        },
        "minecraft:element_117": {
            "id": 383,
            "data": 383
        },
        "minecraft:element_118": {
            "id": 384,
            "data": 384
        },
        "minecraft:seagrass": {
            "id": 385,
            "data": 385
        },
        "minecraft:coral": {
            "id": 386,
            "data": {
                "0": {
                    "coral_color": "blue",
                    "dead_bit": false
                },
                "1": {
                    "coral_color": "pink",
                    "dead_bit": false
                },
                "2": {
                    "coral_color": "purple",
                    "dead_bit": false
                },
                "3": {
                    "coral_color": "red",
                    "dead_bit": false
                },
                "4": {
                    "coral_color": "yellow",
                    "dead_bit": false
                },
                "8": {
                    "coral_color": "blue",
                    "dead_bit": true
                },
                "9": {
                    "coral_color": "pink",
                    "dead_bit": true
                },
                "10": {
                    "coral_color": "purple",
                    "dead_bit": true
                },
                "11": {
                    "coral_color": "red",
                    "dead_bit": true
                },
                "12": {
                    "coral_color": "yellow",
                    "dead_bit": true
                }
            }
        },
        "minecraft:coral_block": {
            "id": 387,
            "data": {
                "0": {
                    "coral_color": "blue",
                    "dead_bit": false
                },
                "1": {
                    "coral_color": "pink",
                    "dead_bit": false
                },
                "2": {
                    "coral_color": "purple",
                    "dead_bit": false
                },
                "3": {
                    "coral_color": "red",
                    "dead_bit": false
                },
                "4": {
                    "coral_color": "yellow",
                    "dead_bit": false
                },
                "8": {
                    "coral_color": "blue",
                    "dead_bit": true
                },
                "9": {
                    "coral_color": "pink",
                    "dead_bit": true
                },
                "10": {
                    "coral_color": "purple",
                    "dead_bit": true
                },
                "11": {
                    "coral_color": "red",
                    "dead_bit": true
                },
                "12": {
                    "coral_color": "yellow",
                    "dead_bit": true
                }
            }
        },
        "minecraft:coral_fan": {
            "id": 388,
            "data": {
                "0": {
                    "coral_color": "blue",
                    "coral_fan_direction": 0
                },
                "1": {
                    "coral_color": "pink",
                    "coral_fan_direction": 0
                },
                "2": {
                    "coral_color": "purple",
                    "coral_fan_direction": 0
                },
                "3": {
                    "coral_color": "red",
                    "coral_fan_direction": 0
                },
                "4": {
                    "coral_color": "yellow",
                    "coral_fan_direction": 0
                }
            }
        },
        "minecraft:coral_fan_dead": {
            "id": 389,
            "data": {
                "0": {
                    "coral_color": "blue",
                    "coral_fan_direction": 0
                },
                "1": {
                    "coral_color": "pink",
                    "coral_fan_direction": 0
                },
                "2": {
                    "coral_color": "purple",
                    "coral_fan_direction": 0
                },
                "3": {
                    "coral_color": "red",
                    "coral_fan_direction": 0
                },
                "4": {
                    "coral_color": "yellow",
                    "coral_fan_direction": 0
                }
            }
        },
        "minecraft:coral_fan_hang": {
            "id": 390,
            "data": {}
        },
        "minecraft:coral_fan_hang2": {
            "id": 391,
            "data": {}
        },
        "minecraft:coral_fan_hang3": {
            "id": 392,
            "data": {}
        },
        "minecraft:kelp": {
            "id": 393,
            "data": {
                "0": {
                    "kelp_age": 0
                },
                "1": {
                    "kelp_age": 1
                },
                "2": {
                    "kelp_age": 2
                },
                "3": {
                    "kelp_age": 3
                },
                "4": {
                    "kelp_age": 4
                },
                "5": {
                    "kelp_age": 5
                },
                "6": {
                    "kelp_age": 6
                },
                "7": {
                    "kelp_age": 7
                },
                "8": {
                    "kelp_age": 8
                },
                "9": {
                    "kelp_age": 9
                },
                "10": {
                    "kelp_age": 10
                },
                "11": {
                    "kelp_age": 11
                },
                "12": {
                    "kelp_age": 12
                },
                "13": {
                    "kelp_age": 13
                },
                "14": {
                    "kelp_age": 14
                },
                "15": {
                    "kelp_age": 15
                }
            }
        },
        "minecraft:dried_kelp_block": {
            "id": 394,
            "data": {}
        },
        "minecraft:acacia_button": {
            "id": 395,
            "data": {
                "0": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "1": {
                    "facing_direction": 1,
                    "button_pressed_bit": false
                },
                "2": {
                    "facing_direction": 2,
                    "button_pressed_bit": false
                },
                "3": {
                    "facing_direction": 3,
                    "button_pressed_bit": false
                },
                "4": {
                    "facing_direction": 4,
                    "button_pressed_bit": false
                },
                "5": {
                    "facing_direction": 5,
                    "button_pressed_bit": false
                },
                "6": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "7": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "8": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                },
                "9": {
                    "facing_direction": 1,
                    "button_pressed_bit": true
                },
                "10": {
                    "facing_direction": 2,
                    "button_pressed_bit": true
                },
                "11": {
                    "facing_direction": 3,
                    "button_pressed_bit": true
                },
                "12": {
                    "facing_direction": 4,
                    "button_pressed_bit": true
                },
                "13": {
                    "facing_direction": 5,
                    "button_pressed_bit": true
                },
                "14": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                },
                "15": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                }
            }
        },
        "minecraft:birch_button": {
            "id": 396,
            "data": {
                "0": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "1": {
                    "facing_direction": 1,
                    "button_pressed_bit": false
                },
                "2": {
                    "facing_direction": 2,
                    "button_pressed_bit": false
                },
                "3": {
                    "facing_direction": 3,
                    "button_pressed_bit": false
                },
                "4": {
                    "facing_direction": 4,
                    "button_pressed_bit": false
                },
                "5": {
                    "facing_direction": 5,
                    "button_pressed_bit": false
                },
                "6": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "7": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "8": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                },
                "9": {
                    "facing_direction": 1,
                    "button_pressed_bit": true
                },
                "10": {
                    "facing_direction": 2,
                    "button_pressed_bit": true
                },
                "11": {
                    "facing_direction": 3,
                    "button_pressed_bit": true
                },
                "12": {
                    "facing_direction": 4,
                    "button_pressed_bit": true
                },
                "13": {
                    "facing_direction": 5,
                    "button_pressed_bit": true
                },
                "14": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                },
                "15": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                }
            }
        },
        "minecraft:dark_oak_button": {
            "id": 397,
            "data": {
                "0": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "1": {
                    "facing_direction": 1,
                    "button_pressed_bit": false
                },
                "2": {
                    "facing_direction": 2,
                    "button_pressed_bit": false
                },
                "3": {
                    "facing_direction": 3,
                    "button_pressed_bit": false
                },
                "4": {
                    "facing_direction": 4,
                    "button_pressed_bit": false
                },
                "5": {
                    "facing_direction": 5,
                    "button_pressed_bit": false
                },
                "6": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "7": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "8": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                },
                "9": {
                    "facing_direction": 1,
                    "button_pressed_bit": true
                },
                "10": {
                    "facing_direction": 2,
                    "button_pressed_bit": true
                },
                "11": {
                    "facing_direction": 3,
                    "button_pressed_bit": true
                },
                "12": {
                    "facing_direction": 4,
                    "button_pressed_bit": true
                },
                "13": {
                    "facing_direction": 5,
                    "button_pressed_bit": true
                },
                "14": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                },
                "15": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                }
            }
        },
        "minecraft:jungle_button": {
            "id": 398,
            "data": {
                "0": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "1": {
                    "facing_direction": 1,
                    "button_pressed_bit": false
                },
                "2": {
                    "facing_direction": 2,
                    "button_pressed_bit": false
                },
                "3": {
                    "facing_direction": 3,
                    "button_pressed_bit": false
                },
                "4": {
                    "facing_direction": 4,
                    "button_pressed_bit": false
                },
                "5": {
                    "facing_direction": 5,
                    "button_pressed_bit": false
                },
                "6": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "7": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "8": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                },
                "9": {
                    "facing_direction": 1,
                    "button_pressed_bit": true
                },
                "10": {
                    "facing_direction": 2,
                    "button_pressed_bit": true
                },
                "11": {
                    "facing_direction": 3,
                    "button_pressed_bit": true
                },
                "12": {
                    "facing_direction": 4,
                    "button_pressed_bit": true
                },
                "13": {
                    "facing_direction": 5,
                    "button_pressed_bit": true
                },
                "14": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                },
                "15": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                }
            }
        },
        "minecraft:spruce_button": {
            "id": 399,
            "data": {
                "0": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "1": {
                    "facing_direction": 1,
                    "button_pressed_bit": false
                },
                "2": {
                    "facing_direction": 2,
                    "button_pressed_bit": false
                },
                "3": {
                    "facing_direction": 3,
                    "button_pressed_bit": false
                },
                "4": {
                    "facing_direction": 4,
                    "button_pressed_bit": false
                },
                "5": {
                    "facing_direction": 5,
                    "button_pressed_bit": false
                },
                "6": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "7": {
                    "facing_direction": 0,
                    "button_pressed_bit": false
                },
                "8": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                },
                "9": {
                    "facing_direction": 1,
                    "button_pressed_bit": true
                },
                "10": {
                    "facing_direction": 2,
                    "button_pressed_bit": true
                },
                "11": {
                    "facing_direction": 3,
                    "button_pressed_bit": true
                },
                "12": {
                    "facing_direction": 4,
                    "button_pressed_bit": true
                },
                "13": {
                    "facing_direction": 5,
                    "button_pressed_bit": true
                },
                "14": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                },
                "15": {
                    "facing_direction": 0,
                    "button_pressed_bit": true
                }
            }
        },
        "minecraft:acacia_trapdoor": {
            "id": 400,
            "data": {
                "0": {
                    "direction": 0,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "1": {
                    "direction": 1,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "2": {
                    "direction": 2,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "3": {
                    "direction": 3,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "4": {
                    "direction": 0,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "5": {
                    "direction": 1,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "6": {
                    "direction": 2,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "7": {
                    "direction": 3,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "8": {
                    "direction": 0,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "9": {
                    "direction": 1,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "10": {
                    "direction": 2,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "11": {
                    "direction": 3,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "12": {
                    "direction": 0,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "13": {
                    "direction": 1,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "14": {
                    "direction": 2,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "15": {
                    "direction": 3,
                    "upside_down_bit": true,
                    "open_bit": true
                }
            }
        },
        "minecraft:birch_trapdoor": {
            "id": 401,
            "data": {
                "0": {
                    "direction": 0,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "1": {
                    "direction": 1,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "2": {
                    "direction": 2,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "3": {
                    "direction": 3,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "4": {
                    "direction": 0,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "5": {
                    "direction": 1,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "6": {
                    "direction": 2,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "7": {
                    "direction": 3,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "8": {
                    "direction": 0,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "9": {
                    "direction": 1,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "10": {
                    "direction": 2,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "11": {
                    "direction": 3,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "12": {
                    "direction": 0,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "13": {
                    "direction": 1,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "14": {
                    "direction": 2,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "15": {
                    "direction": 3,
                    "upside_down_bit": true,
                    "open_bit": true
                }
            }
        },
        "minecraft:dark_oak_trapdoor": {
            "id": 402,
            "data": {
                "0": {
                    "direction": 0,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "1": {
                    "direction": 1,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "2": {
                    "direction": 2,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "3": {
                    "direction": 3,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "4": {
                    "direction": 0,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "5": {
                    "direction": 1,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "6": {
                    "direction": 2,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "7": {
                    "direction": 3,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "8": {
                    "direction": 0,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "9": {
                    "direction": 1,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "10": {
                    "direction": 2,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "11": {
                    "direction": 3,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "12": {
                    "direction": 0,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "13": {
                    "direction": 1,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "14": {
                    "direction": 2,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "15": {
                    "direction": 3,
                    "upside_down_bit": true,
                    "open_bit": true
                }
            }
        },
        "minecraft:jungle_trapdoor": {
            "id": 403,
            "data": {
                "0": {
                    "direction": 0,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "1": {
                    "direction": 1,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "2": {
                    "direction": 2,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "3": {
                    "direction": 3,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "4": {
                    "direction": 0,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "5": {
                    "direction": 1,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "6": {
                    "direction": 2,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "7": {
                    "direction": 3,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "8": {
                    "direction": 0,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "9": {
                    "direction": 1,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "10": {
                    "direction": 2,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "11": {
                    "direction": 3,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "12": {
                    "direction": 0,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "13": {
                    "direction": 1,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "14": {
                    "direction": 2,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "15": {
                    "direction": 3,
                    "upside_down_bit": true,
                    "open_bit": true
                }
            }
        },
        "minecraft:spruce_trapdoor": {
            "id": 404,
            "data": {
                "0": {
                    "direction": 0,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "1": {
                    "direction": 1,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "2": {
                    "direction": 2,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "3": {
                    "direction": 3,
                    "upside_down_bit": false,
                    "open_bit": false
                },
                "4": {
                    "direction": 0,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "5": {
                    "direction": 1,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "6": {
                    "direction": 2,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "7": {
                    "direction": 3,
                    "upside_down_bit": true,
                    "open_bit": false
                },
                "8": {
                    "direction": 0,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "9": {
                    "direction": 1,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "10": {
                    "direction": 2,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "11": {
                    "direction": 3,
                    "upside_down_bit": false,
                    "open_bit": true
                },
                "12": {
                    "direction": 0,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "13": {
                    "direction": 1,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "14": {
                    "direction": 2,
                    "upside_down_bit": true,
                    "open_bit": true
                },
                "15": {
                    "direction": 3,
                    "upside_down_bit": true,
                    "open_bit": true
                }
            }
        },
        "minecraft:acacia_pressure_plate": {
            "id": 405,
            "data": {
                "0": {
                    "redstone_signal": 0
                },
                "1": {
                    "redstone_signal": 1
                }
            }
        },
        "minecraft:birch_pressure_plate": {
            "id": 406,
            "data": {
                "0": {
                    "redstone_signal": 0
                },
                "1": {
                    "redstone_signal": 1
                }
            }
        },
        "minecraft:dark_oak_pressure_plate": {
            "id": 407,
            "data": {
                "0": {
                    "redstone_signal": 0
                },
                "1": {
                    "redstone_signal": 1
                }
            }
        },
        "minecraft:jungle_pressure_plate": {
            "id": 408,
            "data": {
                "0": {
                    "redstone_signal": 0
                },
                "1": {
                    "redstone_signal": 1
                }
            }
        },
        "minecraft:spruce_pressure_plate": {
            "id": 409,
            "data": {
                "0": {
                    "redstone_signal": 0
                },
                "1": {
                    "redstone_signal": 1
                }
            }
        },
        "minecraft:carved_pumpkin": {
            "id": 410,
            "data": {
                "0": {
                    "direction": 0
                },
                "1": {
                    "direction": 1
                },
                "2": {
                    "direction": 2
                },
                "3": {
                    "direction": 3
                }
            }
        },
        "minecraft:sea_pickle": {
            "id": 411,
            "data": {
                "0": {
                    "cluster_count": 0,
                    "dead_bit": false
                },
                "1": {
                    "cluster_count": 1,
                    "dead_bit": false
                },
                "2": {
                    "cluster_count": 2,
                    "dead_bit": false
                },
                "3": {
                    "cluster_count": 3,
                    "dead_bit": false
                },
                "4": {
                    "cluster_count": 0,
                    "dead_bit": true
                },
                "5": {
                    "cluster_count": 1,
                    "dead_bit": true
                },
                "6": {
                    "cluster_count": 2,
                    "dead_bit": true
                },
                "7": {
                    "cluster_count": 3,
                    "dead_bit": true
                }
            }
        },
        "minecraft:conduit": {
            "id": 412,
            "data": {}
        },
        "minecraft:turtle_egg": {
            "id": 414,
            "data": {
                "0": {
                    "turtle_egg_count": "one_egg",
                    "cracked_state": "no_cracks"
                },
                "1": {
                    "turtle_egg_count": "two_egg",
                    "cracked_state": "no_cracks"
                },
                "2": {
                    "turtle_egg_count": "three_egg",
                    "cracked_state": "no_cracks"
                },
                "3": {
                    "turtle_egg_count": "four_egg",
                    "cracked_state": "no_cracks"
                },
                "4": {
                    "turtle_egg_count": "one_egg",
                    "cracked_state": "cracked"
                },
                "5": {
                    "turtle_egg_count": "two_egg",
                    "cracked_state": "cracked"
                },
                "6": {
                    "turtle_egg_count": "three_egg",
                    "cracked_state": "cracked"
                },
                "7": {
                    "turtle_egg_count": "four_egg",
                    "cracked_state": "cracked"
                },
                "8": {
                    "turtle_egg_count": "one_egg",
                    "cracked_state": "max_cracked"
                },
                "9": {
                    "turtle_egg_count": "two_egg",
                    "cracked_state": "max_cracked"
                },
                "10": {
                    "turtle_egg_count": "three_egg",
                    "cracked_state": "max_cracked"
                },
                "11": {
                    "turtle_egg_count": "four_egg",
                    "cracked_state": "max_cracked"
                }
            }
        },
        "minecraft:bubble_column": {
            "id": 415,
            "data": {}
        },
        "minecraft:barrier": {
            "id": 416,
            "data": {}
        },
        "minecraft:stone_slab3": {
            "id": 417,
            "data": {
                "0": {
                    "stone_slab_type_3": "end_stone_brick",
                    "top_slot_bit": false
                },
                "1": {
                    "stone_slab_type_3": "smooth_red_sandstone",
                    "top_slot_bit": false
                },
                "2": {
                    "stone_slab_type_3": "polishe_andesite",
                    "top_slot_bit": false
                },
                "3": {
                    "stone_slab_type_3": "andesite",
                    "top_slot_bit": false
                },
                "4": {
                    "stone_slab_type_3": "diorite",
                    "top_slot_bit": false
                },
                "5": {
                    "stone_slab_type_3": "polished_diorite",
                    "top_slot_bit": false
                },
                "6": {
                    "stone_slab_type_3": "granite",
                    "top_slot_bit": false
                },
                "7": {
                    "stone_slab_type_3": "polished_granite",
                    "top_slot_bit": false
                },
                "8": {
                    "stone_slab_type_3": "end_stone_brick",
                    "top_slot_bit": true
                },
                "9": {
                    "stone_slab_type_3": "smooth_red_sandstone",
                    "top_slot_bit": true
                },
                "10": {
                    "stone_slab_type_3": "polishe_andesite",
                    "top_slot_bit": true
                },
                "11": {
                    "stone_slab_type_3": "andesite",
                    "top_slot_bit": true
                },
                "12": {
                    "stone_slab_type_3": "diorite",
                    "top_slot_bit": true
                },
                "13": {
                    "stone_slab_type_3": "polished_diorite",
                    "top_slot_bit": true
                },
                "14": {
                    "stone_slab_type_3": "granite",
                    "top_slot_bit": true
                },
                "15": {
                    "stone_slab_type_3": "polished_granite",
                    "top_slot_bit": true
                }
            }
        },
        "minecraft:bamboo": {
            "id": 418,
            "data": {
                "0": {
                    "bamboo_stalk_thickness": "thin",
                    "bamboo_leaf_size": "no_leaves"
                },
                "1": {
                    "bamboo_stalk_thickness": "thick",
                    "bamboo_leaf_size": "no_leaves"
                },
                "2": {
                    "bamboo_stalk_thickness": "thin",
                    "bamboo_leaf_size": "small_leaves"
                },
                "3": {
                    "bamboo_stalk_thickness": "thick",
                    "bamboo_leaf_size": "small_leaves"
                },
                "4": {
                    "bamboo_stalk_thickness": "thin",
                    "bamboo_leaf_size": "large_leaves"
                },
                "5": {
                    "bamboo_stalk_thickness": "thick",
                    "bamboo_leaf_size": "large_leaves"
                }
            }
        },
        "minecraft:bamboo_sapling": {
            "id": 419,
            "data": {
                "0": {
                    "age_bit": false,
                    "sapling_type": "oak"
                },
                "1": {
                    "age_bit": true,
                    "sapling_type": "oak"
                }
            }
        },
        "minecraft:scaffolding": {
            "id": 420,
            "data": {}
        },
        "minecraft:stone_slab4": {
            "id": 421,
            "data": {
                "0": {
                    "stone_slab_type_4": "mossy_stone_brick",
                    "top_slot_bit": false
                },
                "1": {
                    "stone_slab_type_4": "smooth_quartz",
                    "top_slot_bit": false
                },
                "2": {
                    "stone_slab_type_4": "stone",
                    "top_slot_bit": false
                },
                "3": {
                    "stone_slab_type_4": "cut_sandstone",
                    "top_slot_bit": false
                },
                "4": {
                    "stone_slab_type_4": "cut_red_sandstone",
                    "top_slot_bit": false
                },
                "8": {
                    "stone_slab_type_4": "mossy_stone_brick",
                    "top_slot_bit": true
                },
                "9": {
                    "stone_slab_type_4": "smooth_quartz",
                    "top_slot_bit": true
                },
                "10": {
                    "stone_slab_type_4": "stone",
                    "top_slot_bit": true
                },
                "11": {
                    "stone_slab_type_4": "cut_sandstone",
                    "top_slot_bit": true
                },
                "12": {
                    "stone_slab_type_4": "cut_red_sandstone",
                    "top_slot_bit": true
                }
            }
        },
        "minecraft:double_stone_slab3": {
            "id": 422,
            "data": {
                "0": {
                    "stone_slab_type_3": "end_stone_brick",
                    "top_slot_bit": false
                },
                "1": {
                    "stone_slab_type_3": "smooth_red_sandstone",
                    "top_slot_bit": false
                },
                "2": {
                    "stone_slab_type_3": "polishe_andesite",
                    "top_slot_bit": false
                },
                "3": {
                    "stone_slab_type_3": "andesite",
                    "top_slot_bit": false
                },
                "4": {
                    "stone_slab_type_3": "diorite",
                    "top_slot_bit": false
                },
                "5": {
                    "stone_slab_type_3": "polished_diorite",
                    "top_slot_bit": false
                },
                "6": {
                    "stone_slab_type_3": "granite",
                    "top_slot_bit": false
                },
                "7": {
                    "stone_slab_type_3": "polished_granite",
                    "top_slot_bit": false
                },
                "8": {
                    "stone_slab_type_3": "end_stone_brick",
                    "top_slot_bit": true
                },
                "9": {
                    "stone_slab_type_3": "smooth_red_sandstone",
                    "top_slot_bit": true
                },
                "10": {
                    "stone_slab_type_3": "polishe_andesite",
                    "top_slot_bit": true
                },
                "11": {
                    "stone_slab_type_3": "andesite",
                    "top_slot_bit": true
                },
                "12": {
                    "stone_slab_type_3": "diorite",
                    "top_slot_bit": true
                },
                "13": {
                    "stone_slab_type_3": "polished_diorite",
                    "top_slot_bit": true
                },
                "14": {
                    "stone_slab_type_3": "granite",
                    "top_slot_bit": true
                },
                "15": {
                    "stone_slab_type_3": "polished_granite",
                    "top_slot_bit": true
                }
            }
        },
        "minecraft:double_stone_slab4": {
            "id": 423,
            "data": {
                "0": {
                    "stone_slab_type_4": "mossy_stone_brick",
                    "top_slot_bit": false
                },
                "1": {
                    "stone_slab_type_4": "smooth_quartz",
                    "top_slot_bit": false
                },
                "2": {
                    "stone_slab_type_4": "stone",
                    "top_slot_bit": false
                },
                "3": {
                    "stone_slab_type_4": "cut_sandstone",
                    "top_slot_bit": false
                },
                "4": {
                    "stone_slab_type_4": "cut_red_sandstone",
                    "top_slot_bit": false
                },
                "8": {
                    "stone_slab_type_4": "mossy_stone_brick",
                    "top_slot_bit": true
                },
                "9": {
                    "stone_slab_type_4": "smooth_quartz",
                    "top_slot_bit": true
                },
                "10": {
                    "stone_slab_type_4": "stone",
                    "top_slot_bit": true
                },
                "11": {
                    "stone_slab_type_4": "cut_sandstone",
                    "top_slot_bit": true
                },
                "12": {
                    "stone_slab_type_4": "cut_red_sandstone",
                    "top_slot_bit": true
                }
            }
        },
        "minecraft:granite_stairs": {
            "id": 424,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:diorite_stairs": {
            "id": 425,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:andesite_stairs": {
            "id": 426,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:polished_granite_stairs": {
            "id": 427,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:polished_diorite_stairs": {
            "id": 428,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:polished_andesite_stairs": {
            "id": 429,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:mossy_stone_brick_stairs": {
            "id": 430,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:smooth_red_sandstone_stairs": {
            "id": 431,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:smooth_sandstone_stairs": {
            "id": 432,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:end_brick_stairs": {
            "id": 433,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:mossy_cobblestone_stairs": {
            "id": 434,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:normal_stone_stairs": {
            "id": 435,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:spruce_standing_sign": {
            "id": 436,
            "data": {
                "0": {
                    "ground_sign_direction": 0
                },
                "1": {
                    "ground_sign_direction": 1
                },
                "2": {
                    "ground_sign_direction": 2
                },
                "3": {
                    "ground_sign_direction": 3
                },
                "4": {
                    "ground_sign_direction": 4
                },
                "5": {
                    "ground_sign_direction": 5
                },
                "6": {
                    "ground_sign_direction": 6
                },
                "7": {
                    "ground_sign_direction": 7
                },
                "8": {
                    "ground_sign_direction": 8
                },
                "9": {
                    "ground_sign_direction": 9
                },
                "10": {
                    "ground_sign_direction": 10
                },
                "11": {
                    "ground_sign_direction": 11
                },
                "12": {
                    "ground_sign_direction": 12
                },
                "13": {
                    "ground_sign_direction": 13
                },
                "14": {
                    "ground_sign_direction": 14
                },
                "15": {
                    "ground_sign_direction": 15
                }
            }
        },
        "minecraft:spruce_wall_sign": {
            "id": 437,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:smooth_stone": {
            "id": 438,
            "data": {}
        },
        "minecraft:red_nether_brick_stairs": {
            "id": 439,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:smooth_quartz_stairs": {
            "id": 440,
            "data": {
                "0": {
                    "weirdo_direction": 0,
                    "upside_down_bit": false
                },
                "1": {
                    "weirdo_direction": 1,
                    "upside_down_bit": false
                },
                "2": {
                    "weirdo_direction": 2,
                    "upside_down_bit": false
                },
                "3": {
                    "weirdo_direction": 3,
                    "upside_down_bit": false
                },
                "4": {
                    "weirdo_direction": 0,
                    "upside_down_bit": true
                },
                "5": {
                    "weirdo_direction": 1,
                    "upside_down_bit": true
                },
                "6": {
                    "weirdo_direction": 2,
                    "upside_down_bit": true
                },
                "7": {
                    "weirdo_direction": 3,
                    "upside_down_bit": true
                }
            }
        },
        "minecraft:birch_standing_sign": {
            "id": 441,
            "data": {
                "0": {
                    "ground_sign_direction": 0
                },
                "1": {
                    "ground_sign_direction": 1
                },
                "2": {
                    "ground_sign_direction": 2
                },
                "3": {
                    "ground_sign_direction": 3
                },
                "4": {
                    "ground_sign_direction": 4
                },
                "5": {
                    "ground_sign_direction": 5
                },
                "6": {
                    "ground_sign_direction": 6
                },
                "7": {
                    "ground_sign_direction": 7
                },
                "8": {
                    "ground_sign_direction": 8
                },
                "9": {
                    "ground_sign_direction": 9
                },
                "10": {
                    "ground_sign_direction": 10
                },
                "11": {
                    "ground_sign_direction": 11
                },
                "12": {
                    "ground_sign_direction": 12
                },
                "13": {
                    "ground_sign_direction": 13
                },
                "14": {
                    "ground_sign_direction": 14
                },
                "15": {
                    "ground_sign_direction": 15
                }
            }
        },
        "minecraft:birch_wall_sign": {
            "id": 442,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:jungle_standing_sign": {
            "id": 443,
            "data": {
                "0": {
                    "ground_sign_direction": 0
                },
                "1": {
                    "ground_sign_direction": 1
                },
                "2": {
                    "ground_sign_direction": 2
                },
                "3": {
                    "ground_sign_direction": 3
                },
                "4": {
                    "ground_sign_direction": 4
                },
                "5": {
                    "ground_sign_direction": 5
                },
                "6": {
                    "ground_sign_direction": 6
                },
                "7": {
                    "ground_sign_direction": 7
                },
                "8": {
                    "ground_sign_direction": 8
                },
                "9": {
                    "ground_sign_direction": 9
                },
                "10": {
                    "ground_sign_direction": 10
                },
                "11": {
                    "ground_sign_direction": 11
                },
                "12": {
                    "ground_sign_direction": 12
                },
                "13": {
                    "ground_sign_direction": 13
                },
                "14": {
                    "ground_sign_direction": 14
                },
                "15": {
                    "ground_sign_direction": 15
                }
            }
        },
        "minecraft:jungle_wall_sign": {
            "id": 444,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:acacia_standing_sign": {
            "id": 445,
            "data": {
                "0": {
                    "ground_sign_direction": 0
                },
                "1": {
                    "ground_sign_direction": 1
                },
                "2": {
                    "ground_sign_direction": 2
                },
                "3": {
                    "ground_sign_direction": 3
                },
                "4": {
                    "ground_sign_direction": 4
                },
                "5": {
                    "ground_sign_direction": 5
                },
                "6": {
                    "ground_sign_direction": 6
                },
                "7": {
                    "ground_sign_direction": 7
                },
                "8": {
                    "ground_sign_direction": 8
                },
                "9": {
                    "ground_sign_direction": 9
                },
                "10": {
                    "ground_sign_direction": 10
                },
                "11": {
                    "ground_sign_direction": 11
                },
                "12": {
                    "ground_sign_direction": 12
                },
                "13": {
                    "ground_sign_direction": 13
                },
                "14": {
                    "ground_sign_direction": 14
                },
                "15": {
                    "ground_sign_direction": 15
                }
            }
        },
        "minecraft:acacia_wall_sign": {
            "id": 446,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:darkoak_standing_sign": {
            "id": 447,
            "data": {
                "0": {
                    "ground_sign_direction": 0
                },
                "1": {
                    "ground_sign_direction": 1
                },
                "2": {
                    "ground_sign_direction": 2
                },
                "3": {
                    "ground_sign_direction": 3
                },
                "4": {
                    "ground_sign_direction": 4
                },
                "5": {
                    "ground_sign_direction": 5
                },
                "6": {
                    "ground_sign_direction": 6
                },
                "7": {
                    "ground_sign_direction": 7
                },
                "8": {
                    "ground_sign_direction": 8
                },
                "9": {
                    "ground_sign_direction": 9
                },
                "10": {
                    "ground_sign_direction": 10
                },
                "11": {
                    "ground_sign_direction": 11
                },
                "12": {
                    "ground_sign_direction": 12
                },
                "13": {
                    "ground_sign_direction": 13
                },
                "14": {
                    "ground_sign_direction": 14
                },
                "15": {
                    "ground_sign_direction": 15
                }
            }
        },
        "minecraft:darkoak_wall_sign": {
            "id": 448,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:lectern": {
            "id": 449,
            "data": {
                "0": {
                    "direction": 0,
                    "powered_bit": false
                },
                "1": {
                    "direction": 1,
                    "powered_bit": false
                },
                "2": {
                    "direction": 2,
                    "powered_bit": false
                },
                "3": {
                    "direction": 3,
                    "powered_bit": false
                },
                "4": {
                    "direction": 0,
                    "powered_bit": true
                },
                "5": {
                    "direction": 1,
                    "powered_bit": true
                },
                "6": {
                    "direction": 2,
                    "powered_bit": true
                },
                "7": {
                    "direction": 3,
                    "powered_bit": true
                }
            }
        },
        "minecraft:grindstone": {
            "id": 450,
            "data": {
                "0": {
                    "direction": 0,
                    "attachment": "standing"
                },
                "1": {
                    "direction": 1,
                    "attachment": "standing"
                },
                "2": {
                    "direction": 2,
                    "attachment": "standing"
                },
                "3": {
                    "direction": 3,
                    "attachment": "standing"
                },
                "4": {
                    "direction": 0,
                    "attachment": "hanging"
                },
                "5": {
                    "direction": 1,
                    "attachment": "hanging"
                },
                "6": {
                    "direction": 2,
                    "attachment": "hanging"
                },
                "7": {
                    "direction": 3,
                    "attachment": "hanging"
                },
                "8": {
                    "direction": 0,
                    "attachment": "side"
                },
                "9": {
                    "direction": 1,
                    "attachment": "side"
                },
                "10": {
                    "direction": 2,
                    "attachment": "side"
                },
                "11": {
                    "direction": 3,
                    "attachment": "side"
                },
                "12": {
                    "direction": 0,
                    "attachment": "multiple"
                },
                "13": {
                    "direction": 1,
                    "attachment": "multiple"
                },
                "14": {
                    "direction": 2,
                    "attachment": "multiple"
                },
                "15": {
                    "direction": 3,
                    "attachment": "multiple"
                }
            }
        },
        "minecraft:blast_furnace": {
            "id": 451,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:stonecutter_block": {
            "id": 452,
            "data": {}
        },
        "minecraft:smoker": {
            "id": 453,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:lit_smoker": {
            "id": 454,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:cartography_table": {
            "id": 455,
            "data": {}
        },
        "minecraft:fletching_table": {
            "id": 456,
            "data": {}
        },
        "minecraft:smithing_table": {
            "id": 457,
            "data": {}
        },
        "minecraft:barrel": {
            "id": 458,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "1": {
                    "facing_direction": 1
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:loom": {
            "id": 459,
            "data": {
                "0": {
                    "direction": 0
                },
                "1": {
                    "direction": 1
                },
                "2": {
                    "direction": 2
                }
            }
        },
        "minecraft:bell": {
            "id": 461,
            "data": {
                "0": {
                    "direction": 0,
                    "attachment": "standing"
                },
                "1": {
                    "direction": 1,
                    "attachment": "standing"
                },
                "2": {
                    "direction": 2,
                    "attachment": "standing"
                },
                "3": {
                    "direction": 3,
                    "attachment": "standing"
                },
                "4": {
                    "direction": 0,
                    "attachment": "hanging"
                },
                "5": {
                    "direction": 1,
                    "attachment": "hanging"
                },
                "6": {
                    "direction": 2,
                    "attachment": "hanging"
                },
                "7": {
                    "direction": 3,
                    "attachment": "hanging"
                },
                "8": {
                    "direction": 0,
                    "attachment": "side"
                },
                "9": {
                    "direction": 1,
                    "attachment": "side"
                },
                "10": {
                    "direction": 2,
                    "attachment": "side"
                },
                "11": {
                    "direction": 3,
                    "attachment": "side"
                },
                "12": {
                    "direction": 0,
                    "attachment": "multiple"
                },
                "13": {
                    "direction": 1,
                    "attachment": "multiple"
                },
                "14": {
                    "direction": 2,
                    "attachment": "multiple"
                },
                "15": {
                    "direction": 3,
                    "attachment": "multiple"
                }
            }
        },
        "minecraft:sweet_berry_bush": {
            "id": 462,
            "data": {
                "0": {
                    "growth": 0
                },
                "1": {
                    "growth": 1
                },
                "2": {
                    "growth": 2
                },
                "3": {
                    "growth": 3
                },
                "4": {
                    "growth": 4
                },
                "5": {
                    "growth": 5
                },
                "6": {
                    "growth": 6
                },
                "7": {
                    "growth": 7
                }
            }
        },
        "minecraft:lantern": {
            "id": 463,
            "data": {
                "0": {
                    "hanging": false
                },
                "1": {
                    "hanging": true
                }
            }
        },
        "minecraft:campfire": {
            "id": 464,
            "data": {
                "0": {
                    "direction": 0,
                    "extinguished": false
                },
                "1": {
                    "direction": 1,
                    "extinguished": false
                },
                "2": {
                    "direction": 2,
                    "extinguished": false
                },
                "3": {
                    "direction": 3,
                    "extinguished": false
                },
                "4": {
                    "direction": 0,
                    "extinguished": true
                },
                "5": {
                    "direction": 1,
                    "extinguished": true
                },
                "6": {
                    "direction": 2,
                    "extinguished": true
                },
                "7": {
                    "direction": 3,
                    "extinguished": true
                }
            }
        },
        "minecraft:lava_cauldron": {
            "id": 465,
            "data": {
                "0": {
                    "fill_level": 0
                },
                "1": {
                    "fill_level": 1
                },
                "2": {
                    "fill_level": 2
                },
                "3": {
                    "fill_level": 3
                },
                "4": {
                    "fill_level": 4
                },
                "5": {
                    "fill_level": 5
                },
                "6": {
                    "fill_level": 6
                }
            }
        },
        "minecraft:jigsaw": {
            "id": 466,
            "data": {}
        },
        "minecraft:wood": {
            "id": 467,
            "data": {
                "0": {
                    "wood_type": "oak",
                    "stripped_bit": false
                },
                "1": {
                    "wood_type": "spruce",
                    "stripped_bit": false
                },
                "2": {
                    "wood_type": "birch",
                    "stripped_bit": false
                },
                "3": {
                    "wood_type": "jungle",
                    "stripped_bit": false
                },
                "4": {
                    "wood_type": "acacia",
                    "stripped_bit": false
                },
                "5": {
                    "wood_type": "dark_oak",
                    "stripped_bit": false
                },
                "8": {
                    "wood_type": "oak",
                    "stripped_bit": true
                },
                "9": {
                    "wood_type": "spruce",
                    "stripped_bit": true
                },
                "10": {
                    "wood_type": "birch",
                    "stripped_bit": true
                },
                "11": {
                    "wood_type": "jungle",
                    "stripped_bit": true
                },
                "12": {
                    "wood_type": "acacia",
                    "stripped_bit": true
                },
                "13": {
                    "wood_type": "dark_oak",
                    "stripped_bit": true
                }
            }
        },
        "minecraft:composter": {
            "id": 468,
            "data": {
                "0": {
                    "composter_fill_level": 0
                },
                "1": {
                    "composter_fill_level": 1
                },
                "2": {
                    "composter_fill_level": 2
                },
                "3": {
                    "composter_fill_level": 3
                },
                "4": {
                    "composter_fill_level": 4
                },
                "5": {
                    "composter_fill_level": 5
                },
                "6": {
                    "composter_fill_level": 6
                },
                "7": {
                    "composter_fill_level": 7
                },
                "8": {
                    "composter_fill_level": 8
                }
            }
        },
        "minecraft:lit_blast_furnace": {
            "id": 469,
            "data": {
                "0": {
                    "facing_direction": 0
                },
                "2": {
                    "facing_direction": 2
                },
                "3": {
                    "facing_direction": 3
                },
                "4": {
                    "facing_direction": 4
                },
                "5": {
                    "facing_direction": 5
                }
            }
        },
        "minecraft:light_block": {
            "id": 470,
            "data": {
                "0": {
                    "block_light_level": 0
                },
                "1": {
                    "block_light_level": 1
                },
                "2": {
                    "block_light_level": 2
                },
                "3": {
                    "block_light_level": 3
                },
                "4": {
                    "block_light_level": 4
                },
                "5": {
                    "block_light_level": 5
                },
                "6": {
                    "block_light_level": 6
                },
                "7": {
                    "block_light_level": 7
                },
                "8": {
                    "block_light_level": 8
                },
                "9": {
                    "block_light_level": 9
                },
                "10": {
                    "block_light_level": 10
                },
                "11": {
                    "block_light_level": 11
                },
                "12": {
                    "block_light_level": 12
                },
                "13": {
                    "block_light_level": 13
                },
                "14": {
                    "block_light_level": 14
                },
                "15": {
                    "block_light_level": 15
                }
            }
        },
        "minecraft:wither_rose": {
            "id": 471,
            "data": {}
        },
        "minecraft:stickyPistonArmCollision": {
            "id": 472,
            "data": {}
        },
        "minecraft:bee_nest": {
            "id": 473,
            "data": {}
        },
        "minecraft:beehive": {
            "id": 474,
            "data": {}
        },
        "minecraft:honey_block": {
            "id": 475,
            "data": {}
        },
        "minecraft:honeycomb_block": {
            "id": 476,
            "data": {}
        }
    }
}

export { blockStateTranslator }
