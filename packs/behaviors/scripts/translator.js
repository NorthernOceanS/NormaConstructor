// Block.js a custom implimentation to get block's id or data
// Bedrock v1.14
// by WavePlayz
import * as TranslatorData from 'translator-data.json';

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
    _data: TranslatorData,
}

export { blockStateTranslator }
