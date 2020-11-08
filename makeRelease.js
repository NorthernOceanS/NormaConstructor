const ar = require("archiver")
const fs = require("fs")
const cp = require('child_process')
const path = require("path")
function starter(path) {//重置release目录 禁止套娃
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                starter(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
            fs.rmdir(path, function (e) { })
        });
    }
}
function CopyDirectory(src, dest) {
    if (fs.existsSync(dest) == false) {
        fs.mkdirSync(dest);
    }
    if (fs.existsSync(src) == false) {
        return false;
    }
    var dirs = fs.readdirSync(src);
    dirs.forEach(function (item) {
        var item_path = path.join(src, item);
        var temp = fs.statSync(item_path);
        if (temp.isFile()) {
            fs.copyFileSync(item_path, path.join(dest, item));
        } else if (temp.isDirectory()) {
            CopyDirectory(item_path, path.join(dest, item));
        }
    });
}
function delOutOfDir(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                delOutOfDir(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
    }
};
starter(path.resolve("./release/"))
fs.mkdir(path.resolve("./release/"), function (e) { })
fs.mkdir(path.resolve("./release/item/"), function (e) { })
CopyDirectory(path.resolve("./packs/"), path.resolve("./release/item/"))
delOutOfDir(path.resolve("./release/item/behaviors/scripts/"))
cp.execSync("webpack ./packs/behaviors/scripts/client/client.js -o ./release/item/behaviors/scripts/client")
fs.renameSync(path.resolve("./release/item/behaviors/scripts/client/main.js"), path.resolve("./release/item/behaviors/scripts/client/client.js"))
cp.execSync("webpack ./packs/behaviors/scripts/server/server.js -o ./release/item/behaviors/scripts/server")
fs.renameSync(path.resolve("./release/item/behaviors/scripts/server/main.js"), path.resolve("./release/item/behaviors/scripts/server/server.js"))
let releasezip = ar('zip')
fs.mkdir(path.resolve("./release/push/"), function (e) { })
releasezip.pipe(fs.createWriteStream("./release/push/Release.zip"))
releasezip.append(fs.createReadStream(path.resolve("./release/item/LICENSE")), { name: 'LICENSE' })
releasezip.directory(path.resolve('./release/item/behaviors/'), 'behaviors')
releasezip.directory(path.resolve('./release/item/resources/'), 'resources')
releasezip.finalize()
fs.rename(fs.createWriteStream("./release/push/Release.zip"), fs.createWriteStream("./release/push/Release.mcaddon"))