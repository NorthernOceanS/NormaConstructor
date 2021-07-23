const MinecraftAddonBuilder = require("minecraft-addon-toolchain/v1");
const BrowserifySupport = require("minecraft-addon-toolchain-browserify");

const builder = new MinecraftAddonBuilder("NormaConstructor");

//!!!!!!!!!!!!!!!!!!!!
const browserifySupport = new BrowserifySupport();
browserifySupport.bundleSources.push("scripts/**/*.*");
browserifySupport.babelOptions.plugins.push("@babel/plugin-proposal-class-properties")

builder.addPlugin(browserifySupport);

module.exports = builder.configureEverythingForMe();
