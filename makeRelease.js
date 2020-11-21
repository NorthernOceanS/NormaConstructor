const ar = require("archiver")
const fs = require("fs")
const cp = require('child_process')
const path = require("path");
function delPath(path) {//清除目录
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                delPath(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
function CopyDirectory(src, dest) { //完整复制文件
    if (fs.existsSync(dest) == false) {
        fs.mkdir(dest, (e) => { });
    }
    if (fs.existsSync(src) == false) {
        return false;
    }
    var dirs = fs.readdirSync(src);
    dirs.forEach(function (item) {
        var item_path = path.join(src, item);
        var temp = fs.statSync(item_path);
        if (temp.isFile()) {
            fs.copyFile(item_path, path.join(dest, item), (e) => { });
        } else if (temp.isDirectory()) {
            CopyDirectory(item_path, path.join(dest, item));
        }
    });
}
delPath(path.resolve("./release/"))
fs.mkdir(path.resolve("./release/"), (e) => { })
fs.mkdir(path.resolve("./release/item/"), (e) => { })
CopyDirectory(path.resolve("./packs/"), path.resolve("./release/item/"))
delPath(path.resolve("./release/item/behaviors/scripts/"))
cp.execSync("webpack ./packs/behaviors/scripts/client/client.js -o ./release/item/behaviors/scripts/client")
//非定制版的代码：fs.renameSync(path.resolve("./release/item/behaviors/scripts/client/main.js"), path.resolve("./release/item/behaviors/scripts/client/client.js"))
//nc定制功能——防傻逼scriptingAPI的解码错误 {
fs.writeFileSync(path.resolve("./release/item/behaviors/scripts/client/client.js"), fs.readFileSync(path.resolve("./release/item/behaviors/scripts/client/main.js"), { encoding: "utf-8" }).replace('"this is a debug message"', fs.readFileSync(path.resolve("./packs/behaviors/scripts/preset/font.real"), { encoding: "utf-8" })), { encoding: "utf-8" })
fs.unlinkSync(path.resolve("./release/item/behaviors/scripts/client/main.js"))
//}
cp.execSync("webpack ./packs/behaviors/scripts/server/server.js -o ./release/item/behaviors/scripts/server")
fs.renameSync(path.resolve("./release/item/behaviors/scripts/server/main.js"), path.resolve("./release/item/behaviors/scripts/server/server.js"))
let releasezip = ar('zip', { zlib: { level: 9 } }) 
fs.mkdir(path.resolve("./release/push/"), function (e) { })
releasezip.pipe(fs.createWriteStream("./release/push/Release.zip"))
releasezip.append(fs.createReadStream(path.resolve("./LICENSE")), { name: 'LICENSE' })
releasezip.directory(path.resolve('./release/item/behaviors/'), 'behaviors')
releasezip.directory(path.resolve('./release/item/resources/'), 'resources')
releasezip.finalize()
fs.renameSync(path.resolve("./release/push/Release.zip"), path.resolve("./release/push/Release.mcaddon"))