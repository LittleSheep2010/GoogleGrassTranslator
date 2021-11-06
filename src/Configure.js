const fs = require("fs")
const fsa = require("fs-extra")
const path = require("path")

/**
 * This function will be init a ware house at ${HOME}/.ggtrc
 * @returns Is overwrite warehouse {Promise<boolean>}
 */
function initWareHouse(overwrite = false) {
    const warehouse = path.join(require('os').homedir(), ".ggtrc")
    if (!fs.existsSync(warehouse))
        overwrite = true
    if (overwrite) {
        if (fs.existsSync(warehouse))
            fsa.removeSync(warehouse)
        fs.writeFileSync(warehouse, JSON.stringify({
            presets: [{
                name: "default",
                workflow: "ny->ca->af->ceb->de->co->en->et->fr->nl",
                round: 5
            }], masterLanguage: "en"
        }))
    }

    process.env.GGT_WAREHOUSE = warehouse

    return overwrite
}

async function getConfigure() {
    if(process.env.GGT_WAREHOUSE == null)
        initWareHouse()
    return fsa.readJsonSync(process.env.GGT_WAREHOUSE)
}

module.exports = {
    initWareHouse,
    getPresets,
}