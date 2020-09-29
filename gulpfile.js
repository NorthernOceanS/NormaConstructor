const MinecraftAddonBuilder = require("minecraft-addon-toolchain/v1");
const BrowserifySupport = require("minecraft-addon-toolchain-browserify");

const builder = new MinecraftAddonBuilder("NormaConstructor");

//!!!!!!!!!!!!!!!!!!!!
const browserifySupport = new BrowserifySupport();
browserifySupport.bundleSources = ["scripts/**/*.*" ];

builder.addPlugin(new BrowserifySupport());

module.exports = builder.configureEverythingForMe();
