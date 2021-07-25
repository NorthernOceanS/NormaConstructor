const MinecraftAddonBuilder = require("minecraft-addon-toolchain/v1");
const BrowserifySupport = require("minecraft-addon-toolchain-browserify");
const AutoFileGenerationSupport = require("./file-generation.js");

const builder = new MinecraftAddonBuilder("NormaConstructor");

//!!!!!!!!!!!!!!!!!!!!
const browserifySupport = new BrowserifySupport();
const autoFileGenerationSupport = new AutoFileGenerationSupport();
browserifySupport.bundleSources.push("scripts/**/*.*");
autoFileGenerationSupport.bundleDir = browserifySupport.intermediateDir;

builder.addPlugin(autoFileGenerationSupport);
builder.addPlugin(browserifySupport);

module.exports = builder.configureEverythingForMe();
