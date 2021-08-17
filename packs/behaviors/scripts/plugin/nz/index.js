import { systemInstance as system, Description, Usage, Block, Coordinate, Position, BlockType, BuildInstruction, canonicalGeneratorFactory } from 'norma-core';
(function () {
    system.registerGenerator({
        name: "OSMCity - Building Generator",
        ui: [],
        onInit(e) {
            e.state.positions = [];
        },
        onAddPosition(e) {
            e.state.positions.push(e.position);
        },
        onAddBlockType(e) { /* no-op */ },
        onAddDirection(e) { /* no-op */ },
        onRemovePoistion(e) {
            if (index === undefined)
                for (index = e.state.positions.length - 1; index >= 0 && e.state.positions[index] == undefined; index--);
            if (index >= 0) e.state.positions[index] = undefined
            e.runtime.logger.logObject("info", e.state.positions)
        },
        onRemoveBlockType(e) { /* no-op */ },
        onRemoveDirection(e) { /* no-op */ },
        isValidParameter(e) {
            let result = ""
            e.state.positions = e.state.positions.filter((e) => e != undefined || e != null)
            if (e.state.positions.length < 3) result += "Too few positions!Refusing to execute.\n"
            if (result == "") result = "success"
            else e.runtime.logger.log("error", result)

            return result;
        },
        generate(e) {
            let { logger } = e.runtime

            let blockInstructions = []

            let setblock = function (x, y, z, blockIdentifier, tiledata) {
                this.push(new BuildInstruction("setblockWithTiledata", { x, y, z, blockIdentifier, tiledata }))
            }.bind(blockInstructions)

            logger.log("debug", "Start building...")

            /*============================================ OSMCity - BuildingGenerator ===========================================*/

            const undef = -1073741824;
            const inf = 1073741824;
            const MAX_LEVEL = 256;
            const DEBUG = false;
            // 以下为结构体声明
            class myBlock {
                id;
                data;
                bump;
                random; rand_min; rand_max;
                constructor(id) {
                    this.id = id;
                    switch (arguments.length) {
                        case 2:     //id, data
                            this.data = arguments[1];
                            this.bump = false;
                            this.random = 0;
                            this.rand_min = arguments[1];
                            this.rand_max = arguments[1];
                            break;
                        case 3:     //id, data, bump
                            this.data = arguments[1];
                            this.bump = arguments[2];
                            this.random = 0;
                            this.rand_min = arguments[1];
                            this.rand_max = arguments[1];
                            break;
                        case 5:     //id, data, random, rand_min, rand_max
                            this.data = arguments[1];
                            this.random = arguments[2];
                            this.rand_min = arguments[3];
                            this.rand_max = arguments[4];
                            this.bump = false;
                            break;
                        case 6:     //id, data, bump, random, rand_min, rand_max
                            this.data = arguments[1];
                            this.bump = arguments[2];
                            this.random = arguments[3];
                            this.rand_min = arguments[4];
                            this.rand_max = arguments[5];
                            break;
                    }
                }
                Equals(n) {
                    return n.id === this.id && n.data === this.data;
                }
            }
            class myCoordinate {
                x; z;
                constructor(x, z) {
                    this.x = x;
                    this.z = z;
                }
                Equals(n) {
                    return n.x === this.x && n.z === this.z;
                }
                toString() {
                    return "(" + this.x.toString() + "," + this.z.toString() + ")";
                }
            }
            class node {
                x; y;
                constructor(x, y) {
                    this.x = x;
                    this.y = y;
                }
                Equals(n) {
                    return n.x === this.x && n.y === this.y;
                }
            }
            class Roof {
                WindowFrame;
                Window;
                Base;
                Data;
                constructor(windowFrame, window, Base, Data) {
                    this.WindowFrame = windowFrame;
                    this.Window = window;
                    this.Base = Base;
                    this.Data = Data;
                }
                GetReduceDelta() {
                    //return Data[0].length - 1;
                    return 2;
                }
                GetLength() {
                    return this.Data.length;
                }
                GetWidth() {
                    return this.Data[0].length;
                }
                GetHeight() {
                    return this.Data[0][0].length;
                }
            }
            class FirstFloor {
                Base;
                Window;
                U1;
                U2;
                Data;
                constructor(Base, window, u1, u2, Data) {
                    this.Base = Base;
                    this.Window = window;
                    this.U1 = u1;
                    this.U2 = u2;
                    this.Data = Data;
                }
                GetReduceDelta() {
                    //return GetWidth();
                    return 2;
                }
                GetHeight() {
                    return this.Data.length;
                }
                GetLength() {
                    return this.Data[0].length;
                }
                GetWidth() {
                    return this.Data[0][0].length;
                }
            }
            class Interior {
                Base;
                Light;
                Data;
                constructor(Base, Light, Data) {
                    this.Base = Base;
                    this.Light = Light;
                    this.Data = Data;
                }
                GetReduceDelta() {
                    //return this.GetWidth();
                    return Math.min(6, this.GetWidth() / 2);
                }
                GetHeight() {
                    return this.Data.length;
                }
                GetLength() {
                    return this.Data[0].length;
                }
                GetWidth() {
                    return this.Data[0][0].length;
                }
            }
            class FirstFloorInfo {
                start;
                end;
                firstfloor_kind;
                Base;
                constructor(start, end, firstfloor_kind, Base) {
                    this.start = start;
                    this.end = end;
                    this.firstfloor_kind = firstfloor_kind;
                    this.Base = Base;
                }
            }
            class InteriorInfo {
                start; end;
                interior_kind;
                clevel;
                sh;
                Base;
                constructor(start, end, interior_kind, clevel, sh, Base) {
                    this.start = start;
                    this.end = end;
                    this.interior_kind = interior_kind;
                    this.clevel = clevel;
                    this.sh = sh;
                    this.Base = Base;
                }
            }
            class Vector2 {
                x; y;
                constructor(x, y) {
                    this.x = x;
                    this.y = y;
                }
                static Dot(a, b) {
                    return a.x * b.x + a.y * b.y;
                }
                Length() {
                    return Math.sqrt(this.x * this.x + this.y * this.y);
                }
            }
            class Vector3 {
                x; y; z;
                constructor(x, y, z) {
                    this.x = x;
                    this.y = y;
                    this.z = z;
                }
                toString() {
                    let str = "(" + this.x.toString() + "," + this.y.toString() + "," + this.z.toString() + ")";
                    return str;
                }
            }
            class Random {
                Next(begin, end) {
                    return Math.floor(Math.random() * (end - begin) + begin);
                }
                NextDouble() {
                    return Math.random();
                }
            }

            const B = new myBlock(-1);
            const WF = new myBlock(-2);
            const W = new myBlock(-3);
            const U1 = new myBlock(-4);
            const U2 = new myBlock(-5);
            const L = new myBlock(-6);
            const air = new myBlock(0);
            let rd = new Random();

            function pnpoly4(nodes, test) {
                let c = false;
                let n = nodes.length;
                for (let i = 0; i < n; i++) {
                    let j;
                    if (i === 0 || nodes[i - 1].x === undef || nodes[i - 1].y === undef) {
                        for (j = i + 1; j < nodes.length; j++) {
                            if (nodes[j].x === undef || nodes[j].y === undef) {
                                break;
                            }
                        }
                        j--;
                    } else {
                        j = i - 1;
                    }
                    if (nodes[i].x === undef || nodes[j].x === undef) continue;
                    if (nodes[i].x === test.x && test.x === nodes[j].x && Math.min(nodes[i].y, nodes[j].y) <= test.y && test.y <= Math.max(nodes[i].y, nodes[j].y)
                        || nodes[i].y === test.y && test.y === nodes[j].y && Math.min(nodes[i].x, nodes[j].x) <= test.x && test.x <= Math.max(nodes[i].x, nodes[j].x))
                        return false;
                    if (((nodes[i].y > test.y) !== (nodes[j].y > test.y)) && (test.x < (nodes[j].x - nodes[i].x) * (test.y - nodes[i].y) / (nodes[j].y - nodes[i].y) + nodes[i].x)) {
                        c = !c;
                    }
                }
                return c;
            }

            class OSMCity {
                // 以下为常量
                min_level = 3;                     // 最矮楼层数
                max_level = 7;                     // 最高楼层数
                max_legal_level = 36;              // 最高允许楼层
                max_small_level = 3;               // 小建筑最高楼层
                cmplx_building_nodenum = 30;       // 复杂建筑物顶点数
                cos_th = 0.5;                   // 使用在屋顶和内饰生成内的
                skipKCheck = true;                // 对于简单建筑物跳过斜率检查
                refalist = false;                 // 延伸是否加入nodelist
                base_y = 4;                       //地基开始的y

                WallConfig = [
                    [
                        [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 2, true)],
                        [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(24, 0, false), new myBlock(24, 2, true)],
                        [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(24, 0, false), new myBlock(24, 2, true)],
                        [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(24, 0, false), new myBlock(24, 2, true)],
                        [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(44, 0, true), new myBlock(44, 0, true), new myBlock(24, 0, false), new myBlock(24, 2, true)],
                        [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 2, true)],
                        [new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true)]
                    ],
                    [
                        [new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15)],
                        [new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(159, 2, false, 1, 0, 15)],
                        [new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(155, 1, false), new myBlock(159, 2, false, 1, 0, 15)],
                        [new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(155, 1, false), new myBlock(159, 2, false, 1, 0, 15)],
                        [new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(159, 2, false, 1, 0, 15)],
                        [new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 2, false, 1, 0, 15)],
                        [new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true)]
                    ],
                    [
                        [new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 2, true)],
                        [new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 2, true)],
                        [new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(155, 1, false), new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 2, true)],
                        [new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(155, 1, false), new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 2, true)],
                        [new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 2, true)],
                        [new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15), new myBlock(155, 2, true)],
                        [new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 2, true)]
                    ],
                    [
                        [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false)],
                        [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(159, 8, false), new myBlock(159, 8, false), new myBlock(159, 8, false), new myBlock(159, 8, false), new myBlock(24, 0, false)],
                        [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(159, 8, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 8, false), new myBlock(24, 0, false)],
                        [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(159, 8, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 8, false), new myBlock(24, 0, false)],
                        [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(159, 8, false), new myBlock(159, 8, false), new myBlock(159, 8, false), new myBlock(159, 8, false), new myBlock(24, 0, false)],
                        [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false)],
                        [new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true)]
                    ],
                    [
                        [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false)],
                        [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(24, 0, false)],
                        [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(45, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(45, 0, false), new myBlock(24, 0, false)],
                        [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(45, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(45, 0, false), new myBlock(24, 0, false)],
                        [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(24, 0, false)],
                        [new myBlock(24, 2, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false)],
                        [new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true)]
                    ],
                    [
                        [new myBlock(155, 2, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 2, false), new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 2, false), new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 2, false), new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 2, false), new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 2, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true)]
                    ],
                    [
                        [new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false)],
                        [new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false)],
                        [new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false)],
                        [new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false)],
                        [new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false)],
                        [new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 9, false)],
                        [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(159, 9, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(159, 9, false)]
                    ],
                    [
                        [new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 8, true), new myBlock(159, 8, true), new myBlock(159, 8, true), new myBlock(159, 8, true), new myBlock(159, 0, false), new myBlock(159, 0, false)],
                        [new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false)],
                        [new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false)],
                        [new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false)],
                        [new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false), new myBlock(159, 0, false)]
                    ],
                    [
                        [new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 2, false)],
                        [new myBlock(159, 11, false, 1, 0, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 2, false)],
                        [new myBlock(159, 11, false, 1, 0, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 2, false)],
                        [new myBlock(159, 11, false, 1, 0, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 2, false)],
                        [new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 2, false)],
                        [new myBlock(159, 11, false, 1, 0, 15), new myBlock(159, 11, false, 1, 0, 15), new myBlock(159, 11, false, 1, 0, 15), new myBlock(159, 11, false, 1, 0, 15), new myBlock(159, 11, false, 1, 0, 15), new myBlock(159, 11, false, 1, 0, 15), new myBlock(159, 11, false, 1, 0, 15), new myBlock(155, 2, false)]
                    ],
                    [
                        [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(159, 8, false)],
                        [new myBlock(155, 0, false), new myBlock(160, 0, false), new myBlock(160, 0, false), new myBlock(155, 0, false), new myBlock(159, 8, false)],
                        [new myBlock(155, 0, false), new myBlock(160, 0, false), new myBlock(160, 0, false), new myBlock(155, 0, false), new myBlock(159, 8, false)],
                        [new myBlock(155, 0, false), new myBlock(160, 0, false), new myBlock(160, 0, false), new myBlock(155, 0, false), new myBlock(159, 8, false)],
                        [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(159, 8, false)],
                        [new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true)]
                    ],
                    [
                        [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(155, 2, false)],
                        [new myBlock(24, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 0, false), new myBlock(155, 2, false)],
                        [new myBlock(24, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 0, false), new myBlock(155, 2, false)],
                        [new myBlock(24, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 0, false), new myBlock(155, 2, false)],
                        [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(155, 2, false)],
                        [new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true)]
                    ],
                    [
                        [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false)],
                        [new myBlock(24, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(24, 0, false)],
                        [new myBlock(24, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(24, 0, false)],
                        [new myBlock(24, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(24, 0, false)],
                        [new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false)]
                    ],
                    [
                        [new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false), new myBlock(45, 0, false)],
                        [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, true), new myBlock(155, 0, false)],
                        [new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 0, false), new myBlock(45, 0, false)],
                        [new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 0, false), new myBlock(45, 0, false)],
                        [new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 0, false), new myBlock(45, 0, false)],
                        [new myBlock(155, 0, false), new myBlock(45, 0, false), new myBlock(155, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 0, false), new myBlock(45, 0, false)],
                        [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false)]
                    ],
                    [
                        [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(160, 0, false), new myBlock(160, 0, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(160, 0, false), new myBlock(160, 0, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(160, 0, false), new myBlock(160, 0, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(160, 0, false), new myBlock(160, 0, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true)]
                    ],
                    [
                        [new myBlock(216, 0, false), new myBlock(216, 0, false), new myBlock(216, 0, false), new myBlock(216, 0, false), new myBlock(216, 0, false), new myBlock(216, 0, false)],
                        [new myBlock(216, 0, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(216, 0, false)],
                        [new myBlock(216, 0, false), new myBlock(155, 1, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 1, false), new myBlock(216, 0, false)],
                        [new myBlock(216, 0, false), new myBlock(155, 1, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 1, false), new myBlock(216, 0, false)],
                        [new myBlock(216, 0, false), new myBlock(155, 1, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 1, false), new myBlock(216, 0, false)],
                        [new myBlock(216, 0, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(216, 0, false)],
                        [new myBlock(216, 0, false), new myBlock(216, 0, false), new myBlock(216, 0, false), new myBlock(216, 0, false), new myBlock(216, 0, false), new myBlock(216, 0, false)],
                        [new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true)]
                    ],
                    [
                        [new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false)],
                        [new myBlock(24, 2, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(24, 2, false)],
                        [new myBlock(24, 2, false), new myBlock(155, 1, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 1, false), new myBlock(24, 2, false)],
                        [new myBlock(24, 2, false), new myBlock(155, 1, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 1, false), new myBlock(24, 2, false)],
                        [new myBlock(24, 2, false), new myBlock(155, 1, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(155, 1, false), new myBlock(24, 2, false)],
                        [new myBlock(24, 2, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(155, 1, false), new myBlock(24, 2, false)],
                        [new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false)],
                        [new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true), new myBlock(155, 1, true)]
                    ],
                    [
                        [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 0, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 0, false), new myBlock(24, 2, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 2, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 0, false), new myBlock(24, 2, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 2, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 0, false), new myBlock(24, 2, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(24, 2, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 0, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(24, 2, false), new myBlock(155, 0, false)],
                        [new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false)],
                        [new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true), new myBlock(24, 2, true)]
                    ],
                    [
                        [new myBlock(43, 0, false), new myBlock(43, 0, false), new myBlock(43, 0, false), new myBlock(43, 0, false), new myBlock(35, 7, true)],
                        [new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 7, true)],
                        [new myBlock(35, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(35, 0, false), new myBlock(35, 7, true)],
                        [new myBlock(35, 0, false), new myBlock(102, 0, false), new myBlock(102, 0, false), new myBlock(35, 0, false), new myBlock(35, 7, true)],
                        [new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 7, true)]
                    ],
                    [
                        [new myBlock(155, 0, false), new myBlock(236, 7, true)],
                        [new myBlock(20, 0, false), new myBlock(236, 7, true)],
                        [new myBlock(20, 0, false), new myBlock(236, 7, true)],
                        [new myBlock(20, 0, false), new myBlock(236, 7, true)],
                        [new myBlock(20, 0, false), new myBlock(236, 7, true)],
                        [new myBlock(20, 0, false), new myBlock(236, 7, true)],
                        [new myBlock(155, 0, false), new myBlock(236, 7, true)]
                    ],
                    [
                        [new myBlock(159, 9, false), new myBlock(159, 9, false), new myBlock(159, 9, false), new myBlock(159, 9, false)],
                        [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                        [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                        [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                        [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                        [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                        [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                        [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                        [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                        [new myBlock(159, 9, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(20, 0, false)],
                        [new myBlock(159, 9, false), new myBlock(159, 9, false), new myBlock(159, 9, false), new myBlock(159, 9, false)]
                    ],
                    [
                        [new myBlock(35, 7, false), new myBlock(35, 7, false), new myBlock(35, 7, false), new myBlock(35, 7, false), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                        [new myBlock(35, 7, false), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(35, 7, false), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                        [new myBlock(35, 7, false), new myBlock(35, 7, false), new myBlock(35, 7, false), new myBlock(35, 7, false), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                        [new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true)]
                    ],
                    [
                        [new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                        [new myBlock(35, 11, false, 1, 1, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                        [new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                        [new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true)],
                        [new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                        [new myBlock(35, 11, false, 1, 1, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(20, 0, false), new myBlock(20, 0, false), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                        [new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 11, false, 1, 1, 15), new myBlock(35, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(20, 0, true), new myBlock(35, 0, true)],
                        [new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, false), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true), new myBlock(35, 0, true)]
                    ]
                ];
                WallConfig_v2 = [
                    [
                        [[new myBlock(155, 0), new myBlock(155, 0), new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(155, 0), new myBlock(155, 2)]],
                        [[new myBlock(155, 0), new myBlock(0, 0), new myBlock(85, 2)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(85, 2)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(85, 2)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(85, 2)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(85, 2)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(85, 2)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(85, 2)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(85, 2)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(155, 2)]],
                        [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(155, 2)]],
                        [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(155, 2)]],
                        [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(155, 2)]],
                        [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(155, 2)]],
                        [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(0, 0), new myBlock(155, 2)]],
                    ],
                    [
                        [[new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(35, 0)]],
                        [[new myBlock(35, 7)], [new myBlock(20, 0)], [new myBlock(20, 0)], [new myBlock(35, 7)], [new myBlock(20, 0)], [new myBlock(20, 0)], [new myBlock(35, 7)], [new myBlock(35, 7), new myBlock(35, 0)]],
                        [[new myBlock(35, 7)], [new myBlock(20, 0)], [new myBlock(20, 0)], [new myBlock(35, 7)], [new myBlock(20, 0)], [new myBlock(20, 0)], [new myBlock(35, 7)], [new myBlock(35, 7), new myBlock(35, 0)]],
                        [[new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(35, 0)]],
                        [[new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(35, 0)]],
                        [[new myBlock(35, 7)], [new myBlock(20, 0)], [new myBlock(20, 0)], [new myBlock(35, 7)], [new myBlock(20, 0)], [new myBlock(20, 0)], [new myBlock(35, 7)], [new myBlock(35, 7), new myBlock(35, 0)]],
                        [[new myBlock(35, 7)], [new myBlock(20, 0)], [new myBlock(20, 0)], [new myBlock(35, 7)], [new myBlock(20, 0)], [new myBlock(20, 0)], [new myBlock(35, 7)], [new myBlock(35, 7), new myBlock(35, 0)]],
                        [[new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(44, 14)], [new myBlock(35, 7), new myBlock(35, 0)]]
                    ],
                    [
                        [[new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(155, 2)]],
                        [[new myBlock(24, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(24, 0), new myBlock(101, 0)], [new myBlock(24, 0), new myBlock(155, 2)]],
                        [[new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)]],
                        [[new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)]],
                        [[new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)]],
                        [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)]]
                    ],
                    [
                        [[new myBlock(24, 2), new myBlock(44, 9)], [new myBlock(24, 2), new myBlock(44, 9)], [new myBlock(24, 2), new myBlock(44, 9)], [new myBlock(24, 2), new myBlock(44, 9)], [new myBlock(24, 2), new myBlock(24, 0)]],
                        [[new myBlock(24, 2), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(24, 2), new myBlock(101, 0)], [new myBlock(24, 2), new myBlock(24, 0)]],
                        [[new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 0)]],
                        [[new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 0)]],
                        [[new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 0)]],
                        [[new myBlock(24, 2)], [new myBlock(24, 2)], [new myBlock(24, 2)], [new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 0)]]
                    ],
                    [
                        [[new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(24, 2)]],
                        [[new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(155, 0), new myBlock(24, 2)]],
                        [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(24, 2)]],
                        [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(24, 2)]],
                        [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(24, 2)]],
                        [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0), new myBlock(24, 2)]]
                    ],
                    [
                        [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(156, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0), new myBlock(156, 1)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)],],
                        [[new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)],],
                        [[new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)],],
                        [[new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)],],
                        [[new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)],],
                        [[new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)],],
                        [[new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(24, 0)],],
                        [[new myBlock(24, 0)], [new myBlock(128, 5)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(128, 4)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(128, 5)], [new myBlock(160, 0, 2, 0, 15)], [new myBlock(128, 4)], [new myBlock(24, 0)],],
                        [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)],],
                        [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(156, 4)], [new myBlock(24, 0), new myBlock(155, 2)], [new myBlock(24, 0), new myBlock(156, 5)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)],],
                        [[new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)], [new myBlock(24, 2), new myBlock(24, 2)]]
                    ],
                    [
                        [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0), new myBlock(156, 4)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(155, 0), new myBlock(156, 5)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(156, 7), new myBlock(44, 14)], [new myBlock(156, 7), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0), new myBlock(156, 0)], [new myBlock(45, 0), new myBlock(156, 7)], [new myBlock(45, 0), new myBlock(156, 7)], [new myBlock(45, 0), new myBlock(156, 1)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(45, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                    ],
                    [
                        [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(155, 0), new myBlock(156, 4)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(155, 0), new myBlock(156, 5)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(156, 7), new myBlock(44, 14)], [new myBlock(156, 7), new myBlock(44, 14)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(156, 0)], [new myBlock(24, 0), new myBlock(156, 7)], [new myBlock(24, 0), new myBlock(156, 7)], [new myBlock(24, 0), new myBlock(156, 1)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                    ],
                    [
                        [[new myBlock(24, 0), new myBlock(0, 0), new myBlock(101, 0)], [new myBlock(24, 0), new myBlock(0, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(0, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(0, 0), new myBlock(101, 0)], [new myBlock(24, 0), new myBlock(0, 0), new myBlock(101, 0)], [new myBlock(24, 0), new myBlock(0, 0), new myBlock(101, 0)], [new myBlock(24, 2), new myBlock(0, 0), new myBlock(101, 0)]],
                        [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                        [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                        [[new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                        [[new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(128, 0)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(128, 1)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                        [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(44, 1)], [new myBlock(24, 0), new myBlock(44, 1)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                        [[new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(101, 0)], [new myBlock(128, 3), new myBlock(101, 0)], [new myBlock(128, 3), new myBlock(101, 0)], [new myBlock(24, 0), new myBlock(101, 0)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                        [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                        [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                        [[new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                        [[new myBlock(24, 0)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(128, 7)], [new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0)], [new myBlock(24, 2)]],
                        [[new myBlock(24, 0), new myBlock(44, 9), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(128, 7), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(128, 7), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(44, 9), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(44, 9), new myBlock(44, 9)]]
                    ],
                    [
                        [[new myBlock(24, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(24, 0), new myBlock(101, 0)], [new myBlock(159, 4)]],
                        [[new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(159, 4)]],
                        [[new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(159, 4)]],
                        [[new myBlock(24, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 0)], [new myBlock(159, 4)]],
                        [[new myBlock(24, 0)], [new myBlock(24, 2)], [new myBlock(24, 2)], [new myBlock(24, 0)], [new myBlock(159, 4)]],
                        [[new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(159, 4), new myBlock(128, 7)]]
                    ],
                    [
                        [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(159, 0, 1, 0, 15)]],
                        [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(159, 0, 1, 0, 15)]],
                        [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(159, 0, 1, 0, 15)]],
                        [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(159, 0, 1, 0, 15)]],
                        [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(159, 0, 1, 0, 15)]],
                        [[new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(155, 0), new myBlock(156, 7)], [new myBlock(155, 0), new myBlock(156, 7)]]
                    ],
                    [
                        [[new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(128, 7)], [new myBlock(128, 7)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(155, 0), new myBlock(128, 4)], [new myBlock(155, 0), new myBlock(128, 7)], [new myBlock(155, 0), new myBlock(128, 7)], [new myBlock(155, 0), new myBlock(128, 5)], [new myBlock(155, 0)]],
                        [[new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(155, 0), new myBlock(101, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(128, 7)], [new myBlock(128, 7)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)], [new myBlock(155, 0)]],
                        [[new myBlock(155, 0), new myBlock(128, 7)], [new myBlock(155, 0), new myBlock(128, 7)], [new myBlock(155, 0), new myBlock(128, 7)], [new myBlock(155, 0), new myBlock(128, 7)], [new myBlock(155, 0), new myBlock(128, 7)]]
                    ],
                    [
                        [[new myBlock(159, 0, 1, 0, 15), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(159, 0, 1, 0, 15), new myBlock(101, 0)], [new myBlock(159, 0, 1, 0, 15)]],
                        [[new myBlock(159, 0, 1, 0, 15)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)]],
                        [[new myBlock(159, 0, 1, 0, 15)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)]],
                        [[new myBlock(159, 0, 1, 0, 15)], [new myBlock(128, 7)], [new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)]],
                        [[new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)]],
                        [[new myBlock(159, 0, 1, 0, 15), new myBlock(128, 4)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 5)], [new myBlock(159, 0, 1, 0, 15)]],
                        [[new myBlock(159, 0, 1, 0, 15), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(160, 0), new myBlock(101, 0)], [new myBlock(159, 0, 1, 0, 15), new myBlock(101, 0)], [new myBlock(159, 0, 1, 0, 15)]],
                        [[new myBlock(159, 0, 1, 0, 15)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)]],
                        [[new myBlock(159, 0, 1, 0, 15)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)]],
                        [[new myBlock(159, 0, 1, 0, 15)], [new myBlock(128, 7)], [new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)]],
                        [[new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)]],
                        [[new myBlock(159, 0, 1, 0, 15), new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 7)]]
                    ],
                    [
                        [
                            [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)],
                            [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)]
                        ],
                        [
                            [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)], [new myBlock(128, 7)], [new myBlock(128, 7)], [new myBlock(24, 0)], [new myBlock(159, 0, 1, 0, 15)],
                            [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)], [new myBlock(128, 7)], [new myBlock(128, 7)], [new myBlock(24, 0)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)]
                        ],
                        [
                            [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(159, 0, 1, 0, 15)],
                            [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)]
                        ],
                        [
                            [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(159, 0, 1, 0, 15)],
                            [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)]
                        ],
                        [
                            [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(159, 0, 1, 0, 15)],
                            [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 2)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)]
                        ],
                        [
                            [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 2), new myBlock(128, 7)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2), new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15)],
                            [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 2), new myBlock(128, 7)], [new myBlock(160, 0)], [new myBlock(160, 0)], [new myBlock(24, 2), new myBlock(128, 7)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)]
                        ],
                        [
                            [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 0)], [new myBlock(159, 0, 1, 0, 15), new myBlock(24, 0)], [new myBlock(159, 0, 1, 0, 15), new myBlock(24, 0)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 1)], [new myBlock(159, 0, 1, 0, 15)],
                            [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 0)], [new myBlock(159, 0, 1, 0, 15), new myBlock(24, 0)], [new myBlock(159, 0, 1, 0, 15), new myBlock(24, 0)], [new myBlock(159, 0, 1, 0, 15), new myBlock(128, 1)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)]
                        ],
                        [
                            [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)],
                            [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(159, 0, 1, 0, 15)], [new myBlock(24, 0)]
                        ],
                        [
                            [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(44, 9)],
                            [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(128, 7)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(44, 9)], [new myBlock(24, 0), new myBlock(128, 7)]
                        ]
                    ]
                ];
                BaseBlock = [
                    new myBlock(24, 0, false), new myBlock(159, 2, false, 1, 0, 15), new myBlock(159, 1, false, 1, 0, 15),
                    new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(159, 0, false), new myBlock(159, 11, false, 1, 0, 15),
                    new myBlock(155, 0, false), new myBlock(24, 0, false), new myBlock(24, 0, false), new myBlock(155, 0, false), new myBlock(155, 0, false), new myBlock(216, 0, false), new myBlock(24, 2, false), new myBlock(155, 0, false), new myBlock(35, 0, false),
                    new myBlock(155, 0, false), new myBlock(159, 9, false), new myBlock(35, 7, false), new myBlock(35, 11, false, 1, 1, 15)
                ];
                BaseBlock_v2 = [
                    new myBlock(155, 0), new myBlock(35, 7), new myBlock(24, 0), new myBlock(24, 2), new myBlock(155, 0), new myBlock(24, 0), new myBlock(45, 0), new myBlock(24, 0), new myBlock(24, 0)
                    , new myBlock(24, 0), new myBlock(155, 0), new myBlock(155, 0), new myBlock(159, 0, 1, 0, 15), new myBlock(159, 0, 1, 0, 15)
                ];
                RoofConfig = [
                    null,
                    null,
                    new Roof(
                        new myBlock(155, 1), new myBlock(102, 0), null,
                        [
                            //方向 外->里然后下->上
                            [[B, air, air, air, air], [air, B, air, air, air], [air, air, B, air, air], [air, air, air, B, air], [air, air, air, air, B]],
                            [[B, air, air, air, air], [air, B, air, air, air], [air, air, B, air, air], [air, air, air, B, air], [air, air, air, air, B]],
                            [[B, air, air, air, air], [air, B, air, air, air], [air, air, B, air, air], [air, air, air, B, air], [air, air, air, air, B]],
                        ]
                    ),
                    new Roof(
                        new myBlock(155, 1), new myBlock(102, 0), null,
                        [
                            [[B, air, air, air, air], [air, B, air, air, air], [air, air, B, air, air], [air, air, air, B, air], [air, air, air, air, B]],
                            [[B, air, air, air, air], [air, B, air, air, air], [air, air, B, air, air], [air, air, air, B, air], [air, air, air, air, B]],
                            [[B, air, air, air, air], [air, B, air, air, air], [air, air, B, air, air], [air, air, air, B, air], [air, air, air, air, B]],
                        ]
                    ),
                    new Roof(
                        new myBlock(45, 0), new myBlock(102, 0), new myBlock(45, 0),
                        [
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                        ]
                    ),
                    new Roof(
                        new myBlock(24, 2), new myBlock(160, 4), null,
                        [
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, WF, WF, WF, air], [air, air, air, WF, WF, WF, air], [air, air, air, air, WF, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, W, W, WF, WF], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, W, W, WF, WF], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, WF, WF, WF, air], [air, air, air, WF, WF, WF, air], [air, air, air, air, WF, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, WF]],
                        ]
                    ),
                    new Roof(
                        new myBlock(24, 2), new myBlock(102, 0), null,
                        [
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, WF, WF, WF, air], [air, air, air, WF, WF, WF, air], [air, air, air, air, WF, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, W, W, WF, WF], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, W, W, WF, WF], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, WF, WF, WF, air], [air, air, air, WF, WF, WF, air], [air, air, air, air, WF, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, B]],
                        ]
                    ),
                    new Roof(
                        new myBlock(155, 1), new myBlock(160, 0), null,
                        [
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, WF, WF, WF, air], [air, air, air, WF, WF, WF, air], [air, air, air, air, WF, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, W, W, WF, WF], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, W, W, WF, WF], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, WF]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, WF, WF, WF, WF, air], [air, air, air, WF, WF, WF, air], [air, air, air, air, WF, WF, air], [air, air, air, air, air, WF, air], [air, air, air, air, air, air, WF]],
                        ]
                    ),
                    new Roof(
                        new myBlock(45, 0), new myBlock(102, 0), null,
                        [
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, air, air, air, air], [air, air, air, B, air, air, air], [air, air, air, air, B, air, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, B, B, B, air], [air, air, air, B, B, B, air], [air, air, air, air, B, B, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, W, W, B, B], [air, air, air, air, air, B, air], [air, air, air, air, air, B, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, W, W, B, B], [air, air, air, air, air, B, air], [air, air, air, air, air, B, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                            [[B, air, air, air, air, air, air], [air, B, air, air, air, air, air], [air, air, B, B, B, B, air], [air, air, air, B, B, B, air], [air, air, air, air, B, B, air], [air, air, air, air, air, B, air], [air, air, air, air, air, air, B]],
                        ]
                    ),
                    new Roof(
                        new myBlock(45, 0), new myBlock(102, 0), new myBlock(45, 0),
                        [
                            [[new myBlock(44, 4), air, air, air], [new myBlock(44, 12), air, air, air], [air, new myBlock(44, 4), air, air], [air, new myBlock(44, 12), air, air], [air, air, new myBlock(44, 4), air], [air, air, new myBlock(44, 12), air], [air, air, air, new myBlock(44, 4)], [air, air, air, new myBlock(44, 12)]],
                            [[new myBlock(44, 4), air, air, air], [new myBlock(44, 12), air, air, air], [air, new myBlock(44, 4), air, air], [air, new myBlock(44, 12), air, air], [air, air, new myBlock(44, 4), air], [air, air, new myBlock(44, 12), air], [air, air, air, new myBlock(44, 4)], [air, air, air, new myBlock(44, 12)]],
                            [[new myBlock(44, 4), air, air, air], [new myBlock(44, 12), air, air, air], [air, new myBlock(44, 4), air, air], [air, new myBlock(44, 12), air, air], [air, air, new myBlock(44, 4), air], [air, air, new myBlock(44, 12), air], [air, air, air, new myBlock(44, 4)], [air, air, air, new myBlock(44, 12)]],
                        ]
                    ),
                    new Roof(
                        new myBlock(24, 0), new myBlock(102, 0), new myBlock(35, 7),
                        [
                            [[WF, air, air, air, air, air], [B, B, B, air, air, air], [B, B, B, B, B, air]],
                            [[WF, air, air, air, air, air], [B, B, B, air, air, air], [B, B, B, B, B, air]],
                            [[WF, air, air, air, air, air], [B, B, B, air, air, air], [B, B, B, B, B, air]],
                            [[WF, air, air, air, air, air], [B, B, B, air, air, air], [B, B, B, B, B, air]],
                            [[WF, air, air, air, air, air], [B, B, B, air, air, air], [B, B, B, B, B, air]],
                            [[WF, air, air, air, air, air], [B, B, B, air, air, air], [B, B, B, B, B, air]],
                            [[WF, air, air, air, air, air], [B, B, B, air, air, air], [B, B, B, B, B, air]],
                            [[WF, air, air, air, air, air], [WF, WF, WF, WF, new myBlock(128, 0), air], [B, B, B, B, B, air]],
                            [[WF, air, air, air, air, air], [WF, W, W, W, WF, new myBlock(44, 1)], [air, air, air, air, B, air]],
                            [[WF, air, air, air, air, air], [WF, W, W, W, WF, new myBlock(44, 1)], [air, air, air, air, B, air]],
                            [[WF, air, air, air, air, air], [WF, WF, WF, WF, new myBlock(128, 1), air], [air, air, air, air, B, air]],
                        ]
                    )
                ];
                FirstFloorConfig = [
                    null,
                    null,
                    null,
                    new FirstFloor(
                        new myBlock(159, 7), new myBlock(160, 8), null, null,
                        [
                            [[B, air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [air, air, air], [air, air, air], [B, air, air]],
                            [[B, air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air], [B, air, air], [air, air, air], [air, air, air], [B, air, air]],
                            [[B, air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air]],
                            [[B, air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air]],
                            [[B, air, new myBlock(35, 4)], [B, air, new myBlock(35, 0)], [B, air, new myBlock(35, 4)], [B, air, new myBlock(35, 0)], [B, air, new myBlock(35, 4)], [B, air, new myBlock(35, 0)], [B, air, new myBlock(35, 4)], [B, air, new myBlock(35, 0)], [B, air, new myBlock(35, 4)]],
                            [[B, new myBlock(35, 4), air], [B, new myBlock(35, 0), air], [B, new myBlock(35, 4), air], [B, new myBlock(35, 0), air], [B, new myBlock(35, 4), air], [B, new myBlock(35, 0), air], [B, new myBlock(35, 4), air], [B, new myBlock(35, 0), air], [B, new myBlock(35, 4), air]]
                        ]
                    ),
                    new FirstFloor(
                        new myBlock(159, 7), new myBlock(160, 8), null, null,
                        [
                            [[new myBlock(162, 1), air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [new myBlock(162, 1), air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [new myBlock(162, 1), air, air], [B, air, air], [air, air, air], [air, air, air], [B, air, air], [new myBlock(162, 1), air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air]],
                            [[new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air], [new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air], [new myBlock(162, 1), air, air], [B, air, air], [air, air, air], [air, air, air], [B, air, air], [new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air]],
                            [[new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air], [new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air], [new myBlock(162, 1), air, air], [B, air, air], [air, air, air], [air, air, air], [B, air, air], [new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air]],
                            [[new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air], [new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air], [new myBlock(162, 1), air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [new myBlock(162, 1), air, air], [W, air, air], [W, air, air], [W, air, air], [W, air, air]],
                            [[new myBlock(162, 1), air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [new myBlock(162, 1), air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [new myBlock(162, 1), air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air], [new myBlock(162, 1), air, air], [B, air, air], [B, air, air], [B, air, air], [B, air, air]],
                            [[new myBlock(162, 1), air, new myBlock(134, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [new myBlock(162, 1), air, new myBlock(134, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [new myBlock(162, 1), air, new myBlock(134, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [new myBlock(162, 1), air, new myBlock(134, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)], [B, air, new myBlock(53, 3)]],
                            [[new myBlock(162, 1), new myBlock(134, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [new myBlock(162, 1), new myBlock(134, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [new myBlock(162, 1), new myBlock(134, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [new myBlock(162, 1), new myBlock(134, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air], [B, new myBlock(53, 3), air]]
                        ]
                    ),
                    new FirstFloor(
                        null, new myBlock(102, 0), new myBlock(35, 11), new myBlock(35, 3),
                        [
                            [
                                [B, air, air, air, new myBlock(114, 4), new myBlock(114, 4), new myBlock(114, 4)], [B, air, air, air, new myBlock(53, 1), new myBlock(53, 1), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [B, air, air, air, new myBlock(156, 4), new myBlock(156, 4), new myBlock(114, 7)], [B, air, air, air, new myBlock(156, 5), new myBlock(156, 5), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [B, air, air, air, new myBlock(53, 0), new myBlock(53, 0), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [air, air, air, air, air, new myBlock(58, 0), new myBlock(114, 7)], [air, air, air, air, air, new myBlock(54, 0), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)],
                                [B, air, air, air, new myBlock(53, 1), new myBlock(53, 1), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [B, air, air, air, new myBlock(156, 4), new myBlock(156, 4), new myBlock(114, 7)], [B, air, air, air, new myBlock(156, 5), new myBlock(156, 5), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [B, air, air, air, new myBlock(53, 0), new myBlock(53, 0), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [B, air, air, air, air, new myBlock(58, 0), new myBlock(114, 7)], [B, air, air, air, air, new myBlock(54, 0), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)],
                                [B, air, air, air, new myBlock(53, 1), new myBlock(53, 1), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [B, air, air, air, new myBlock(156, 4), new myBlock(156, 4), new myBlock(114, 7)], [B, air, air, air, new myBlock(156, 5), new myBlock(156, 5), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [B, air, air, air, new myBlock(53, 0), new myBlock(53, 0), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)], [B, air, air, air, air, new myBlock(58, 0), new myBlock(114, 7)], [B, air, air, air, air, new myBlock(54, 0), new myBlock(114, 7)], [B, air, air, air, air, air, new myBlock(114, 7)],
                                [B, air, air, air, new myBlock(114, 5), new myBlock(114, 5), new myBlock(114, 5)]
                            ],
                            [
                                [B, air, air, air, new myBlock(113, 0), air, new myBlock(113, 0)], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, new myBlock(463, 0), air], [W, air, air, air, air, air, new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [air, air, air, air, air, new myBlock(117, 0), new myBlock(113, 0)], [air, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, new myBlock(171, 0), new myBlock(171, 12), air], [W, air, air, air, new myBlock(171, 12), new myBlock(171, 0), new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, new myBlock(117, 0), new myBlock(113, 0)], [W, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, new myBlock(463, 0), air], [W, air, air, air, air, air, new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, new myBlock(117, 0), new myBlock(113, 0)], [W, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                [B, air, air, air, new myBlock(113, 0), air, new myBlock(113, 0)]
                            ],
                            [
                                [B, air, air, air, new myBlock(113, 0), air, new myBlock(113, 0)], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [air, air, air, air, air, air, new myBlock(113, 0)], [air, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [W, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [W, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                [B, air, air, air, new myBlock(113, 0), air, new myBlock(113, 0)]
                            ],
                            [
                                [B, air, air, air, new myBlock(113, 0), air, new myBlock(113, 0)], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [air, air, air, air, air, air, new myBlock(113, 0)], [air, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [W, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [B, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, air], [W, air, air, air, air, air, new myBlock(113, 0)], [W, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                [B, air, air, air, new myBlock(113, 0), air, new myBlock(113, 0)]
                            ],
                            [
                                [B, U1, U1, U1, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1],
                                [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1],
                                [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1], [B, air, air, air, U2, U2, U2], [B, air, air, air, U1, U1, U1],
                                [B, U2, U2, U2, U2, U2, U2]
                            ],
                            [
                                [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air],
                                [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air],
                                [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air], [B, U2, U2, U2, air, air, air], [B, U1, U1, U1, air, air, air],
                                [B, U2, U2, U2, air, air, air]
                            ]
                        ]
                    ),
                    new FirstFloor(
                        null, new myBlock(102, 0), new myBlock(35, 14), new myBlock(35, 0),
                        [
                            [
                                [B, air, air, air], [B, air, new myBlock(164, 1), air], [B, new myBlock(164, 3), new myBlock(85, 5), new myBlock(164, 2)], [B, air, new myBlock(164, 0), air], [B, air, air, air], [B, air, air, air], [new myBlock(24, 0), new myBlock(145, 3), air, air], [new myBlock(196, 1), air, air, air], [new myBlock(196, 1), air, air, air], [new myBlock(24, 0), new myBlock(145, 3), air, air],
                                [B, air, air, air], [B, air, new myBlock(164, 1), air], [B, new myBlock(164, 3), new myBlock(85, 5), new myBlock(164, 2)], [B, air, new myBlock(164, 0), air], [B, air, air, air], [B, air, new myBlock(164, 1), air], [B, new myBlock(164, 3), new myBlock(85, 5), new myBlock(164, 2)], [B, air, new myBlock(164, 0), air], [B, air, air, air], [B, air, air, air], [B, air, air, air]
                            ],
                            [
                                [B, air, air, air], [W, air, air, air], [W, air, new myBlock(171, 14), air], [W, air, air, air], [W, air, air, air], [B, air, air, air], [new myBlock(24, 0), new myBlock(18, 0), air, air], [new myBlock(196, 9), air, air, air], [new myBlock(196, 8), air, air, air], [new myBlock(24, 0), new myBlock(18, 0), air, air],
                                [B, air, air, air], [W, air, air, air], [W, air, new myBlock(171, 14), air], [W, air, air, air], [W, air, air, air], [B, air, air, air], [W, air, new myBlock(171, 14), air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [B, air, air, air]
                            ],
                            [
                                [B, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [B, air, air, air], [new myBlock(24, 0), new myBlock(18, 0), air, air], [new myBlock(164, 7), air, air, air], [new myBlock(164, 7), air, air, air], [new myBlock(24, 0), new myBlock(18, 0), air, air],
                                [B, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [B, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [B, air, air, air]
                            ],
                            [
                                [B, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [B, air, air, air], [new myBlock(24, 0), new myBlock(128, 7), air, air], [new myBlock(24, 0), new myBlock(128, 7), air, air], [new myBlock(24, 0), new myBlock(128, 7), air, air], [new myBlock(24, 0), new myBlock(128, 7), air, air],
                                [B, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [B, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [W, air, air, air], [B, air, air, air]
                            ],
                            [
                                [B, air, air, air], [B, air, air, U1], [B, air, air, U2], [B, air, air, U1], [B, air, air, U2], [B, air, air, U1], [new myBlock(24, 0), new myBlock(24, 0), air, U2], [new myBlock(24, 0), new myBlock(24, 0), air, U1], [new myBlock(24, 0), new myBlock(24, 0), air, U2], [new myBlock(24, 0), new myBlock(24, 0), air, U1],
                                [B, air, air, U2], [B, air, air, U1], [B, air, air, U2], [B, air, air, U1], [B, air, air, U2], [B, air, air, air], [B, air, air, air], [B, air, air, air], [B, air, air, air], [B, air, air, air], [B, air, air, air]
                            ],
                            [
                                [B, air, air, air], [B, U1, U1, air], [B, U2, U2, air], [B, U1, U1, air], [B, U2, U2, air], [B, U1, U1, air], [B, U2, U2, air], [B, U1, U1, air], [B, U2, U2, air], [B, U1, U1, air],
                                [B, U2, U2, air], [B, U1, U1, air], [B, U2, U2, air], [B, U1, U1, air], [B, U2, U2, air], [B, air, air, air], [B, air, air, air], [B, air, air, air], [B, air, air, air], [B, air, air, air], [B, air, air, air]
                            ]
                        ]
                    ),
                    new FirstFloor(
                        null, new myBlock(160, 0), new myBlock(35, 14, 1, 1, 15), new myBlock(35, 0),
                        [
                            [[B, air, air, air, air], [B, air, air, air, air], [new myBlock(64, 3), air, air, air, air], [new myBlock(64, 3), air, air, air, air], [B, air, air, air, air], [B, new myBlock(162, 1), air, air, air], [B, new myBlock(158, 13), air, air, air], [B, new myBlock(158, 13), air, air, air], [B, new myBlock(158, 13), air, air, air], [B, new myBlock(158, 13), air, air, air], [B, new myBlock(162, 1), air, air, air]],
                            [[B, air, air, air, air], [B, air, air, air, air], [new myBlock(64, 9), air, air, air, air], [new myBlock(64, 8), air, air, air, air], [B, air, air, air, air], [B, new myBlock(162, 1), air, air, air], [B, new myBlock(140, 0), air, air, air], [B, air, air, air, air], [B, new myBlock(140, 0), air, air, air], [B, new myBlock(140, 0), air, air, air], [B, new myBlock(162, 1), air, air, air]],
                            [[B, air, air, air, air], [B, air, air, air, air], [new myBlock(128, 7), air, air, air, air], [new myBlock(128, 7), air, air, air, air], [B, air, air, air, air], [B, new myBlock(162, 1), air, air, air], [B, new myBlock(158, 13), air, air, air], [B, new myBlock(158, 13), air, air, air], [B, new myBlock(158, 13), air, air, air], [B, new myBlock(158, 13), air, air, air], [B, new myBlock(162, 1), air, air, air]],
                            [[B, new myBlock(85, 0), new myBlock(85, 0), new myBlock(85, 0), new myBlock(85, 0)], [B, air, air, air, air], [new myBlock(241, 0), air, air, air, air], [new myBlock(241, 0), air, air, air, air], [B, air, air, air, air], [B, new myBlock(162, 1), air, air, air], [B, air, air, air, air], [B, new myBlock(140, 0), air, air, air], [B, air, air, air, air], [B, air, air, air, air], [B, new myBlock(162, 1), air, air, air]],
                            [[B, air, air, U1, U1], [B, air, air, U2, U2], [new myBlock(241, 0), air, air, U1, U1], [new myBlock(241, 0), air, air, U2, U2], [B, air, air, U1, U1], [B, new myBlock(158, 5), air, U2, U2], [B, new myBlock(158, 5), air, U1, U1], [B, new myBlock(158, 5), air, U2, U2], [B, new myBlock(158, 5), air, U1, U1], [B, new myBlock(158, 5), air, U2, U2], [B, new myBlock(158, 5), air, U1, U1]],
                            [[B, U1, U1, air, air], [B, U2, U2, air, air], [B, U1, U1, air, air], [B, U2, U2, air, air], [B, U1, U1, air, air], [B, U2, U2, air, air], [B, U1, U1, air, air], [B, U2, U2, air, air], [B, U1, U1, air, air], [B, U2, U2, air, air], [B, U1, U1, air, air]]
                        ]
                    )
                ];
                InteriorConfig = [
                    //null,
                    new Interior(
                        new myBlock(5, 1), new myBlock(89, 0),
                        [
                            [
                                [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B]
                            ],
                            [
                                [B, B, B, air, air, B, B, B], [B, new myBlock(164, 3), new myBlock(164, 1), new myBlock(164, 1), new myBlock(164, 2), air, air, air], [B, air, air, air, air, air, air, air], [B, new myBlock(158, 2), new myBlock(158, 2), new myBlock(158, 2), air, air, air, air], [B, air, air, air, air, air, air, air], [B, new myBlock(164, 3), new myBlock(164, 0), new myBlock(164, 0), new myBlock(164, 2), air, air, air],
                                [B, air, air, air, air, air, air, air], [B, new myBlock(164, 3), new myBlock(164, 1), new myBlock(164, 1), new myBlock(164, 2), air, air, air], [B, air, air, air, air, air, air, air], [B, new myBlock(158, 2), new myBlock(158, 2), new myBlock(158, 2), air, air, air, air], [B, air, air, air, air, air, air, air], [B, new myBlock(164, 3), new myBlock(164, 0), new myBlock(164, 0), new myBlock(164, 2), air, air, air],
                                [B, air, air, air, air, air, air, air], [B, new myBlock(164, 3), new myBlock(164, 1), new myBlock(164, 1), new myBlock(164, 2), air, air, air], [B, air, air, air, air, air, air, air], [B, new myBlock(158, 2), new myBlock(158, 2), new myBlock(158, 2), air, air, air, air], [B, air, air, air, air, air, air, air], [B, new myBlock(164, 3), new myBlock(164, 0), new myBlock(164, 0), new myBlock(164, 2), air, air, air],
                                [B, B, B, air, air, B, B, B]
                            ],
                            [
                                [B, B, B, air, air, B, B, B], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, B, B, air, air, B, B, B]
                            ],
                            [
                                [B, B, B, B, B, B, B, B], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, B, B, B, B, B, B, B]
                            ],
                            [
                                [B, B, B, B, B, B, B, B], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, B, B, B, B, B, B, B]
                            ],
                            [
                                [B, B, B, B, B, B, B, B], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, B, B, B, B, B, B, B]
                            ],
                            [
                                [B, B, B, B, B, B, B, B], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, B, B, B, B, B, B, B]
                            ],
                            [
                                [B, B, B, L, L, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, L, L, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, L, L, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, L, L, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, L, L, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B]
                            ]
                        ]
                    ),
                    new Interior(
                        new myBlock(5, 3), new myBlock(89, 0),
                        [
                            [
                                [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B]
                            ],
                            [
                                [B, new myBlock(145, 3), air, air, air, air, air, new myBlock(145, 3)], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, new myBlock(134, 5)], [B, new myBlock(114, 3), new myBlock(85, 0), new myBlock(114, 2), air, air, air, new myBlock(134, 4)], [B, new myBlock(114, 3), air, air, air, air, air, air],
                                [B, new myBlock(114, 3), air, air, air, air, air, air], [B, new myBlock(114, 3), new myBlock(85, 0), new myBlock(114, 2), air, air, air, new myBlock(134, 4)], [B, air, air, air, air, air, air, air]
                            ],
                            [
                                [B, new myBlock(18, 0), air, air, air, air, air, new myBlock(18, 0)], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, new myBlock(140, 0)], [B, air, new myBlock(171, 12), air, air, air, air, new myBlock(140, 0)], [B, air, air, air, air, air, air, air],
                                [B, air, air, air, air, air, air, air], [B, air, new myBlock(171, 12), air, air, air, air, air], [B, air, air, air, air, air, air, air]
                            ],
                            [
                                [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air]
                            ],
                            [
                                [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air]
                            ],
                            [
                                [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air]
                            ],
                            [
                                [B, B, B, L, L, L, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, L, L, L, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B]
                            ]
                        ]
                    ),
                    new Interior(
                        new myBlock(5, 3, 1, 0, 5), new myBlock(89, 0),
                        [
                            [
                                [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B]
                            ],
                            [
                                [B, new myBlock(145, 3), air, air, air, air, air, air, air, new myBlock(145, 3)], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, new myBlock(134, 5)], [B, new myBlock(114, 3), new myBlock(85, 0), new myBlock(114, 2), air, air, air, air, air, new myBlock(134, 4)], [B, new myBlock(114, 3), air, air, air, air, air, air, air, air],
                                [B, new myBlock(114, 3), air, air, air, air, air, air, air, air], [B, new myBlock(114, 3), new myBlock(85, 0), new myBlock(114, 2), air, air, air, air, air, new myBlock(134, 4)], [B, air, air, air, air, air, air, air, air, air]
                            ],
                            [
                                [B, new myBlock(18, 0), air, air, air, air, air, air, air, new myBlock(18, 0)], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, new myBlock(140, 0)], [B, air, new myBlock(72, 0), air, air, air, air, air, air, new myBlock(140, 0)], [B, air, air, air, air, air, air, air, air, air],
                                [B, air, air, air, air, air, air, air, air, air], [B, air, new myBlock(72, 0), air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air]
                            ],
                            [
                                [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air]
                            ],
                            [
                                [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air]
                            ],
                            [
                                [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air, air, air]
                            ],
                            [
                                [B, B, B, B, L, L, L, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, L, L, L, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B, B, B]
                            ]
                        ]
                    ),
                    new Interior(
                        new myBlock(5, 0, 3, 0, 9), new myBlock(89, 0),
                        [
                            [
                                [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B],
                                [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B]
                            ],
                            [
                                [B, air, air, B, B, B, B], [B, air, air, air, new myBlock(53, 1, 3, 0, 9), new myBlock(53, 1, 3, 0, 9), new myBlock(53, 1, 3, 0, 9)], [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(85, 0, 3, 0, 9), new myBlock(85, 0, 3, 0, 9), new myBlock(85, 0, 3, 0, 9)], [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(53, 0, 3, 0, 9), new myBlock(53, 0, 3, 0, 9), new myBlock(53, 0, 3, 0, 9)], [B, air, air, air, air, air, air],
                                [B, air, air, air, new myBlock(53, 1, 3, 0, 9), new myBlock(53, 1, 3, 0, 9), new myBlock(53, 1, 3, 0, 9)], [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(85, 0, 3, 0, 9), new myBlock(85, 0, 3, 0, 9), new myBlock(85, 0, 3, 0, 9)], [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(53, 0, 3, 0, 9), new myBlock(53, 0, 3, 0, 9), new myBlock(53, 0, 3, 0, 9)], [B, air, air, air, air, air, air],
                                [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(53, 3, 3, 0, 9), air, new myBlock(53, 6, 3, 0, 9)], [B, air, air, air, new myBlock(53, 3, 3, 0, 9), air, new myBlock(53, 6, 3, 0, 9)], [B, air, air, air, air, air, air],
                                [B, air, air, air, new myBlock(53, 1, 3, 0, 9), new myBlock(53, 1, 3, 0, 9), new myBlock(53, 1, 3, 0, 9)], [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(85, 0, 3, 0, 9), new myBlock(85, 0, 3, 0, 9), new myBlock(85, 0, 3, 0, 9)], [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(53, 0, 3, 0, 9), new myBlock(53, 0, 3, 0, 9), new myBlock(53, 0, 3, 0, 9)]
                            ],
                            [
                                [B, air, air, B, B, B, B], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(171, 12), new myBlock(171, 12), new myBlock(171, 12)],
                                [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, new myBlock(171, 12), new myBlock(171, 12), new myBlock(171, 12)], [B, air, air, air, air, air, air],
                                [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, new myBlock(140, 0)], [B, air, air, air, air, air, new myBlock(171, 0)], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, new myBlock(171, 12), new myBlock(171, 12), new myBlock(171, 12)], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air]
                            ],
                            [
                                [B, B, B, B, B, B, B], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air],
                                [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air],
                                [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air],
                                [B, air, air, air, air, air, air], [B, air, air, air, air, air, air]
                            ],
                            [
                                [B, B, B, B, B, B, B], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air],
                                [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air],
                                [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air],
                                [B, air, air, air, air, air, air], [B, air, air, air, air, air, air]
                            ],
                            [
                                [B, B, B, B, B, B, B], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air], [B, air, air, air, air, air, air],
                                [B, air, air, air, air, air, air], [B, air, air, air, air, air, air]
                            ],
                            [
                                [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B],
                                [B, B, B, L, L, B, B], [B, B, B, L, L, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B],
                                [B, B, B, L, L, B, B], [B, B, B, L, L, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B],
                                [B, B, B, L, L, B, B], [B, B, B, L, L, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B],
                                [B, B, B, L, L, B, B], [B, B, B, L, L, B, B], [B, B, B, B, B, B, B], [B, B, B, B, B, B, B]
                            ]
                        ]
                    ),
                    new Interior(
                        new myBlock(5, 0, 3, 0, 9), new myBlock(169, 0),
                        [
                            [
                                [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B],
                                [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B],
                                [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B],
                                [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B]
                            ],
                            [
                                [B, air, air, B, B, B, B, B], [B, air, air, air, air, B, B, new myBlock(47, 0)], [B, air, air, air, air, new myBlock(53, 5, 3, 0, 9), new myBlock(53, 5, 3, 0, 9), new myBlock(47, 0)], [B, air, air, air, air, air, air, air], [B, air, air, air, air, new myBlock(53, 0, 3, 0, 9), new myBlock(53, 0, 3, 0, 9), air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                [B, air, air, air, air, new myBlock(35, 3), new myBlock(35, 3), new myBlock(35, 0)], [B, air, air, air, air, new myBlock(35, 3), new myBlock(35, 3), new myBlock(35, 0)], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, new myBlock(53, 6, 3, 0, 9), B], [B, air, air, air, air, air, new myBlock(53, 6, 3, 0, 9), B], [B, air, air, air, air, air, air, air],
                                [B, air, air, air, air, new myBlock(35, 6), new myBlock(35, 6), new myBlock(35, 0)], [B, air, air, air, air, new myBlock(35, 6), new myBlock(35, 6), new myBlock(35, 0)], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                [B, air, air, air, air, new myBlock(53, 1, 3, 0, 9), new myBlock(53, 1, 3, 0, 9), new myBlock(53, 1, 3, 0, 9)], [B, air, air, air, air, air, air, air], [B, air, air, air, air, new myBlock(85, 0, 3, 0, 9), new myBlock(85, 0, 3, 0, 9), new myBlock(85, 0, 3, 0, 9)]
                            ],
                            [
                                [B, air, air, B, B, B, B, B], [B, air, air, air, air, new myBlock(140, 0), air, air], [B, air, air, air, air, new myBlock(171, 0), new myBlock(171, 0), air], [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                [B, air, air, air, air, air, air, new myBlock(171, 0)], [B, air, air, air, air, air, air, new myBlock(171, 0)], [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, new myBlock(463, 0)], [B, air, air, air, air, air, air, new myBlock(140, 0)], [B, air, air, air, air, air, air, air],
                                [B, air, air, air, air, air, air, new myBlock(171, 0)], [B, air, air, air, air, air, air, new myBlock(171, 0)], [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, air],
                                [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, new myBlock(171, 12), new myBlock(171, 12), new myBlock(171, 12)]
                            ],
                            [
                                [B, B, B, B, B, B, B, B], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air]
                            ],
                            [
                                [B, B, B, B, B, B, B, B], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                [new myBlock(20, 0), air, air, air, air, air, air, air], [new myBlock(20, 0), air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air]
                            ],
                            [
                                [B, B, B, B, B, B, B, B], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air],
                                [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air], [B, air, air, air, air, air, air, air]
                            ],
                            [
                                [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B],
                                [B, B, B, L, L, L, B, B], [B, B, B, L, L, L, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B],
                                [B, B, B, L, L, L, B, B], [B, B, B, L, L, L, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B],
                                [B, B, B, L, L, L, B, B], [B, B, B, L, L, L, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B], [B, B, B, B, B, B, B, B]
                            ]
                        ]
                    )
                ];

                // 以下为全局变量
                v2_prob = 0.5;
                c_rand_data = -1;
                cnt = 0;
                Cnt = [];
                roof_node_list = [];

                //以下为函数

                Generate(coordinates) {
                    // 仅使用多边形坐标生成建筑物
                    // 移植到ModPE或Addon大概会更方便
                    // 当前版本日期为2021.3.2（可能是最终版）
                    // Initialize
                    let v2_prob = this.WallConfig_v2.length / (this.WallConfig.length + this.WallConfig_v2.length);
                    for (let i = 0; i < MAX_LEVEL; i++) this.Cnt.push(0);
                    if (!coordinates[coordinates.length - 1].Equals(coordinates[0]))
                        coordinates.push(coordinates[0]);
                    // Generate
                    let lastz = undef, lastx = undef;
                    let building = true;
                    let dynamic_add_nodes = true;
                    let building_node_list = [];
                    let const_building_node_list = [];
                    let building_version = 1;
                    let height = -1, levels = -1;
                    let wall_kind = -1;
                    let doNotChangeStyle = false;
                    let firstFloorInfos = [];
                    let interiorInfos = [];

                    for (let coordinate of coordinates) {
                        const_building_node_list.push(new node(coordinate.x, coordinate.z));
                    }

                    let prob = Math.random();
                    if (prob >= (1 - v2_prob)) building_version = 2;
                    else building_version = 1;

                    if (building_version === 1)
                        wall_kind = rd.Next(0, this.WallConfig.length);
                    else if (building_version === 2)
                        wall_kind = rd.Next(0, this.WallConfig_v2.length);

                    //确定楼层数
                    if (levels === -1 && height === -1)
                        levels = rd.Next(this.min_level, this.max_level);
                    else if (height !== -1) {
                        if (building_version === 1)
                            levels = Math.ceil(height / this.WallConfig[wall_kind].length);
                        else if (building_version === 2)
                            levels = Math.ceil(height / this.WallConfig_v2[wall_kind].length);
                    }
                    if (this.IsSmallBuilding(const_building_node_list))
                        levels = Math.min(levels, this.max_small_level);
                    if (this.IsMiniBuilding(const_building_node_list))
                        levels = 1;
                    levels = Math.min(levels, this.max_legal_level);

                    if (building_version === 1)
                        height = levels * this.WallConfig[wall_kind].length;
                    else if (building_version === 2)
                        height = levels * this.WallConfig_v2[wall_kind].length;

                    logger.log("debug", coordinates);

                    for (let coordinate of coordinates) {
                        //新的
                        let cx = coordinate.x;
                        let cz = coordinate.z;
                        if (this.IsUndefined(new node(cx, cz))) {
                            lastx = undef;
                            lastz = undef;
                            building_node_list.push(new node(undef, undef));
                            this.ClearCnt();
                            continue;
                        }

                        let currentz = cz;
                        let currentx = cx;

                        if (building && dynamic_add_nodes) {
                            let valid = true;
                            if (building_node_list.length > 0 && building_node_list[building_node_list.length - 1].Equals(new node(currentx, currentz))) valid = false;
                            for (let i = building_node_list.length - 1; i >= 0; i--) {
                                if (i === 0 || this.IsUndefined(building_node_list[i])) {
                                    if (building_node_list[i].Equals(new node(currentx, currentz)))
                                        valid = false;
                                    break;
                                }
                            }
                            if (valid) building_node_list.push(new node(currentx, currentz));
                        }
                        //连线
                        if (!this.IsUndefined(new node(lastx, lastz))) {
                            if (building) {
                                //一楼选定
                                let startheight = 0;
                                let firstfloor_kind = rd.Next(0, this.FirstFloorConfig.length);
                                if (this.FirstFloorConfig[firstfloor_kind] !== null) {
                                    if (Math.max(Math.abs(currentx - lastx), Math.abs(currentz - lastz)) < this.FirstFloorConfig[firstfloor_kind].GetLength())
                                        startheight = 0;
                                    else {
                                        let singleheight = 0;
                                        let Base = null;
                                        if (building_version === 1) {
                                            Base = this.BaseBlock[wall_kind];
                                            singleheight = this.WallConfig[wall_kind].length;
                                        } else if (building_version === 2) {
                                            Base = this.BaseBlock_v2[wall_kind];
                                            singleheight = this.WallConfig_v2[wall_kind].length;
                                        }
                                        if (Base !== null && Base.random === 1) {
                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(Base.rand_min, Base.rand_max);
                                            Base.data = this.c_rand_data;
                                        }
                                        startheight = this.FirstFloorConfig[firstfloor_kind].GetHeight();
                                        firstFloorInfos.push(new FirstFloorInfo(new node(lastx, lastz), new node(currentx, currentz), firstfloor_kind, Base));
                                    }
                                }
                                for (let level = 0; level < levels; level++) {
                                    let interior_kind = rd.Next(0, this.InteriorConfig.length);
                                    if (building_version === 1) {
                                        //内饰选定
                                        let shI = level * this.WallConfig[wall_kind].length;
                                        let Base = this.BaseBlock[wall_kind];
                                        if (Base.random === 1) {
                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(Base.rand_min, Base.rand_max);
                                            Base.data = this.c_rand_data;
                                        }
                                        interiorInfos.push(new InteriorInfo(new node(lastx, lastz), new node(currentx, currentz), interior_kind, level, shI, Base));
                                        //墙面建造
                                        let shW = Math.max(startheight, level * this.WallConfig[wall_kind].length);
                                        this.DrawLine_Building_Advanced(lastx, lastz, currentx, currentz, level, shW, this.WallConfig[wall_kind]);
                                    } else if (building_version === 2) {
                                        let shI = level * this.WallConfig_v2[wall_kind].length;
                                        let Base = this.BaseBlock_v2[wall_kind];
                                        if (Base.random === 1) {
                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(Base.rand_min, Base.rand_max);
                                            Base.data = this.c_rand_data;
                                        }
                                        interiorInfos.push(new InteriorInfo(new node(lastx, lastz), new node(currentx, currentz), interior_kind, level, shI, Base));
                                        let shW = Math.max(startheight, level * this.WallConfig_v2[wall_kind].length);
                                        this.DrawLine_Building_Advanced_v2(lastx, lastz, currentx, currentz, level, shW, this.WallConfig_v2[wall_kind]);
                                    }
                                }
                            }
                        }
                        lastz = currentz;
                        lastx = currentx;
                    }

                    /////////////////////////////////上一个建筑物/用地的多边形填充////////////////////////////
                    //try {
                    if (building_node_list.length >= 3) {
                        let id = 0, data = 0;
                        if (building_version === 1) {
                            id = this.BaseBlock[wall_kind].id;
                            data = this.BaseBlock[wall_kind].data;
                            if (this.c_rand_data !== -1 && this.BaseBlock[wall_kind].random === 1) data = this.c_rand_data;
                        } else if (building_version === 2) {
                            id = this.BaseBlock_v2[wall_kind].id;
                            data = this.BaseBlock_v2[wall_kind].data;
                            if (this.c_rand_data !== -1 && this.BaseBlock[wall_kind].random === 1) data = this.c_rand_data;
                        }
                        //填充建筑物最顶层的平面
                        this.FillPolygonScanline(building_node_list, height, id, data);
                        //建筑物屋顶与内饰放置，必须为非迷你建筑
                        if (!this.IsMiniBuilding(building_node_list)) {
                            //建筑物屋顶放置
                            this.cnt = 0;
                            let roof_kind = rd.Next(0, this.RoofConfig.length);
                            let roof = this.RoofConfig[roof_kind];
                            if (roof !== null && !this.IsSmallBuilding(building_node_list)) {
                                if (roof.Base !== null) {
                                    id = roof.Base.id;
                                    data = roof.Base.data;
                                }
                                for (let i = 0; i < building_node_list.length; i++) {
                                    let startnode = building_node_list[i];
                                    let endnode = startnode;
                                    if (i !== building_node_list.length - 1) endnode = building_node_list[i + 1];
                                    if (this.IsUndefined(startnode)) {
                                        this.roof_node_list.push(startnode);
                                        continue;
                                    }
                                    let lastnode, nextnode;
                                    if (i === 0 || building_node_list[i - 1].x === undef || building_node_list[i - 1].y === undef) {
                                        nextnode = building_node_list[i + 2];
                                        let j;
                                        for (j = i + 1; j < building_node_list.length; j++) {
                                            if (building_node_list[j].x === undef || building_node_list[j].y === undef)
                                                break;
                                        }
                                        lastnode = building_node_list[j - 1];
                                    } else if (i === building_node_list.length - 1 || building_node_list[i + 1].x === undef) {
                                        lastnode = building_node_list[i - 1];
                                        let j;
                                        for (j = i - 1; j >= 0; j--) {
                                            if (building_node_list[j].x === undef || building_node_list[j].y === undef)
                                                break;
                                        }
                                        endnode = building_node_list[j + 1];
                                        nextnode = building_node_list[j + 2];
                                    } else if (i === building_node_list.length - 2 || building_node_list[i + 2].x === undef || building_node_list[i + 2].y === undef) {
                                        lastnode = building_node_list[i - 1];
                                        let j;
                                        for (j = i - 1; j >= 0; j--) {
                                            if (building_node_list[j].x === undef || building_node_list[j].y === undef)
                                                break;
                                        }
                                        nextnode = building_node_list[j + 1];
                                    } else {
                                        lastnode = building_node_list[i - 1];
                                        nextnode = building_node_list[i + 2];
                                    }
                                    if (lastnode.x === undef || lastnode.y === undef) lastnode = null;
                                    if (nextnode.x === undef || nextnode.y === undef) nextnode = null;
                                    let Base = new myBlock(id, data);
                                    if (building_node_list.length < this.cmplx_building_nodenum)
                                        this.DrawLine_Roof_Improved_v2(startnode.x, startnode.y, endnode.x, endnode.y, height + 1, roof, building_node_list, lastnode, nextnode, Base, this.skipKCheck);
                                    else
                                        this.DrawLine_Roof_Improved_v2(startnode.x, startnode.y, endnode.x, endnode.y, height + 1, roof, building_node_list, lastnode, nextnode, Base, false);
                                }
                                this.FillPolygonScanline(this.roof_node_list, height + roof.Data[0][0].length, id, data);
                            }
                            //建筑物内饰放置
                            this.ClearCnt();
                            let interior_kind = rd.Next(0, this.InteriorConfig.length);
                            for (let i = 0; i < building_node_list.length; i++) {
                                if (this.InteriorConfig[interior_kind] === null) continue;
                                let startnode = building_node_list[i];
                                let endnode = startnode;
                                if (i !== building_node_list.length - 1) endnode = building_node_list[i + 1];
                                if (this.IsUndefined(startnode)) continue;
                                let lastnode, nextnode;
                                if (i === 0 || building_node_list[i - 1].x === undef || building_node_list[i - 1].y === undef) {
                                    nextnode = building_node_list[i + 2];
                                    let j;
                                    for (j = i + 1; j < building_node_list.length; j++) {
                                        if (building_node_list[j].x === undef || building_node_list[j].y === undef)
                                            break;
                                    }
                                    lastnode = building_node_list[j - 1];
                                } else if (i === building_node_list.length - 1 || building_node_list[i + 1].x === undef) {
                                    lastnode = building_node_list[i - 1];
                                    let j;
                                    for (j = i - 1; j >= 0; j--) {
                                        if (building_node_list[j].x === undef || building_node_list[j].y === undef)
                                            break;
                                    }
                                    endnode = building_node_list[j + 1];
                                    nextnode = building_node_list[j + 2];
                                } else if (i === building_node_list.length - 2 || building_node_list[i + 2].x === undef || building_node_list[i + 2].y === undef) {
                                    lastnode = building_node_list[i - 1];
                                    let j;
                                    for (j = i - 1; j >= 0; j--) {
                                        if (building_node_list[j].x === undef || building_node_list[j].y === undef)
                                            break;
                                    }
                                    nextnode = building_node_list[j + 1];
                                } else {
                                    lastnode = building_node_list[i - 1];
                                    nextnode = building_node_list[i + 2];
                                }
                                if (this.IsUndefined(lastnode)) lastnode = null;
                                if (this.IsUndefined(nextnode)) nextnode = null;
                                let max_level = Math.floor(height / this.InteriorConfig[interior_kind].GetHeight());
                                let Base = new myBlock(id, data);
                                this.DrawLine_Interior_v3(startnode.x, startnode.y, endnode.x, endnode.y, max_level, this.InteriorConfig[interior_kind], building_node_list, lastnode, nextnode, Base);
                            }

                            for (let ffi of firstFloorInfos) {
                                if (this.FirstFloorConfig[ffi.firstfloor_kind] !== null) {
                                    this.cnt = 0;
                                    this.DrawLine_FirstFloor(ffi.start.x, ffi.start.y, ffi.end.x, ffi.end.y, this.FirstFloorConfig[ffi.firstfloor_kind], building_node_list, ffi.Base);
                                }
                            }
                        }
                    }
                    /*}
                    catch (e) {
                        print(e.message);
                        print("INFO: Skipping roof, interior or first floor for current building");
                    }*/
                    building_node_list = [];
                    this.roof_node_list = [];
                    firstFloorInfos = [];
                    interiorInfos = [];
                    this.ClearCnt();
                    this.cnt = 0;
                    if (!doNotChangeStyle) this.c_rand_data = -1;
                    this.block_list = [];
                }


                DrawLine_Building_Advanced(startx, starty, endx, endy, clevel, sh, WallConfig) {
                    if (startx !== endx) {
                        let k = (endy - starty) / (endx - startx);
                        let b = (endy * startx - starty * endx) / (startx - endx);
                        if (-1 < k && k < 1) {
                            if (startx <= endx) {
                                for (let x = startx; x < endx; x++) {
                                    let y = Math.round(k * x + b);
                                    for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                        let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length];
                                        let id = cblock.id, data = cblock.data;
                                        if (cblock.random === 1) {
                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            data = this.c_rand_data;
                                        } else if (cblock.random === 2) {
                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                        }
                                        if (cblock.bump) {
                                            this.setTile(x, h + 1, y - 1, id, data);
                                            this.setTile(x, h + 1, y + 1, id, data);
                                        }
                                        this.setTile(x, h + 1, y, id, data);
                                    }
                                    this.Cnt[clevel]++;
                                }
                            } else {
                                for (let x = startx; x > endx; x--) {
                                    let y = Math.round(k * x + b);
                                    for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                        let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length];
                                        let id = cblock.id, data = cblock.data;
                                        if (cblock.random === 1) {
                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            data = this.c_rand_data;
                                        } else if (cblock.random === 2) {
                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                        }
                                        if (cblock.bump) {
                                            this.setTile(x, h + 1, y - 1, id, data);
                                            this.setTile(x, h + 1, y + 1, id, data);
                                        }
                                        this.setTile(x, h + 1, y, id, data);
                                    }
                                    this.Cnt[clevel]++;
                                }
                            }
                        } else {
                            if (starty <= endy) {
                                for (let y = starty; y < endy; y++) {
                                    let x = Math.floor((y - b) / k);
                                    for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                        let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length];
                                        let id = cblock.id, data = cblock.data;
                                        if (cblock.random === 1) {
                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            data = this.c_rand_data;
                                        } else if (cblock.random === 2) {
                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                        }
                                        if (cblock.bump) {
                                            this.setTile(x - 1, h + 1, y, id, data);
                                            this.setTile(x + 1, h + 1, y, id, data);
                                        }
                                        this.setTile(x, h + 1, y, id, data);
                                    }
                                    this.Cnt[clevel]++;
                                }
                            } else {
                                for (let y = starty; y > endy; y--) {
                                    let x = Math.floor((y - b) / k);
                                    for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                        let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length];
                                        let id = cblock.id, data = cblock.data;
                                        if (cblock.random === 1) {
                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            data = this.c_rand_data;
                                        } else if (cblock.random === 2) {
                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                        }
                                        if (cblock.bump) {
                                            this.setTile(x - 1, h + 1, y, id, data);
                                            this.setTile(x + 1, h + 1, y, id, data);
                                        }
                                        this.setTile(x, h + 1, y, id, data);
                                    }
                                    this.Cnt[clevel]++;
                                }
                            }
                        }
                    } else {
                        if (starty <= endy) {
                            for (let y = starty; y < endy; y++) {
                                for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                    let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length];
                                    let id = cblock.id, data = cblock.data;
                                    if (cblock.random === 1) {
                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                        data = this.c_rand_data;
                                    } else if (cblock.random === 2) {
                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                    }
                                    if (cblock.bump) {
                                        this.setTile(startx - 1, h + 1, y, id, data);
                                        this.setTile(startx + 1, h + 1, y, id, data);
                                    }
                                    this.setTile(startx, h + 1, y, id, data);
                                }
                                this.Cnt[clevel]++;
                            }
                        } else {
                            for (let y = starty; y > endy; y--) {
                                for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                    let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length];
                                    let id = cblock.id, data = cblock.data;
                                    if (cblock.random === 1) {
                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                        data = this.c_rand_data;
                                    } else if (cblock.random === 2) {
                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                    }
                                    if (cblock.bump) {
                                        this.setTile(startx - 1, h + 1, y, id, data);
                                        this.setTile(startx + 1, h + 1, y, id, data);
                                    }
                                    this.setTile(startx, h + 1, y, id, data);
                                }
                                this.Cnt[clevel]++;
                            }
                        }
                    }
                }

                DrawLine_Building_Advanced_v2(startx, starty, endx, endy, clevel, sh, WallConfig) {
                    if (startx !== endx) {
                        let k = (endy - starty) / (endx - startx);
                        let b = (endy * startx - starty * endx) / (startx - endx);
                        if (-1 < k && k < 1) {
                            if (startx <= endx) {
                                for (let x = startx; x < endx; x++) {
                                    let y = Math.round(k * x + b);
                                    for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                        let delta = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length].length;
                                        for (let dy = 0; dy < delta; dy++) {
                                            let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length][dy];
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (cblock.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                data = this.c_rand_data;
                                            } else if (cblock.random === 2) {
                                                data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            }
                                            if (id === 0) continue;
                                            this.setTile(x, h + 1, y - dy, id, data, 0, null);
                                            if (dy !== 0) this.setTile(x, h + 1, y + dy, id, data, 0, true);
                                        }
                                    }
                                    this.Cnt[clevel]++;
                                }
                            } else {
                                for (let x = startx; x > endx; x--) {
                                    let y = Math.round(k * x + b);
                                    for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                        let delta = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length].length;
                                        for (let dy = 0; dy < delta; dy++) {
                                            let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length][dy];
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (cblock.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                data = this.c_rand_data;
                                            } else if (cblock.random === 2) {
                                                data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            }
                                            if (id === 0) continue;
                                            if (dy !== 0) this.setTile(x, h + 1, y - dy, id, data, 180, true);
                                            this.setTile(x, h + 1, y + dy, id, data, 180, null);
                                        }
                                    }
                                    this.Cnt[clevel]++;
                                }
                            }
                        } else {
                            if (starty <= endy) {
                                for (let y = starty; y < endy; y++) {
                                    let x = Math.floor((y - b) / k);
                                    for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                        let delta = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length].length;
                                        for (let dx = 0; dx < delta; dx++) {
                                            let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length][dx];
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (cblock.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                data = this.c_rand_data;
                                            } else if (cblock.random === 2) {
                                                data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            }
                                            if (id === 0) continue;
                                            if (dx !== 0) this.setTile(x - dx, h + 1, y, id, data, 90, false);
                                            this.setTile(x + dx, h + 1, y, id, data, 90, null);
                                        }
                                    }
                                    this.Cnt[clevel]++;
                                }
                            } else {
                                for (let y = starty; y > endy; y--) {
                                    let x = Math.floor((y - b) / k);
                                    for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                        let delta = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length].length;
                                        for (let dx = 0; dx < delta; dx++) {
                                            let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length][dx];
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (id === 0) continue;
                                            if (cblock.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                data = this.c_rand_data;
                                            } else if (cblock.random === 2) {
                                                data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            }
                                            this.setTile(x - dx, h + 1, y, id, data, 270, null);
                                            if (dx !== 0) this.setTile(x + dx, h + 1, y, id, data, 270, false);
                                        }
                                    }
                                    this.Cnt[clevel]++;
                                }
                            }
                        }
                    } else {
                        if (starty <= endy) {
                            for (let y = starty; y < endy; y++) {
                                for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                    let delta = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length].length;
                                    for (let dx = 0; dx < delta; dx++) {
                                        let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length][dx];
                                        let id = cblock.id;
                                        let data = cblock.data;
                                        if (cblock.random === 1) {
                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            data = this.c_rand_data;
                                        } else if (cblock.random === 2) {
                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                        }
                                        if (id === 0) continue;
                                        if (dx !== 0) this.setTile(startx - dx, h + 1, y, id, data, 90, false);
                                        this.setTile(startx + dx, h + 1, y, id, data, 90, null);
                                    }
                                }
                                this.Cnt[clevel]++;
                            }
                        } else {
                            for (let y = starty; y > endy; y--) {
                                for (let h = sh; h < (clevel + 1) * WallConfig.length; h++) {
                                    let delta = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length].length;
                                    for (let dx = 0; dx < delta; dx++) {
                                        let cblock = WallConfig[h % WallConfig.length][this.Cnt[clevel] % WallConfig[0].length][dx];
                                        let id = cblock.id;
                                        let data = cblock.data;
                                        if (cblock.random === 1) {
                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            data = this.c_rand_data;
                                        } else if (cblock.random === 2) {
                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                        }
                                        if (id === 0) continue;
                                        this.setTile(startx - dx, h + 1, y, id, data, 270, null);
                                        if (dx !== 0) this.setTile(startx + dx, h + 1, y, id, data, 270, false);
                                    }
                                }
                                this.Cnt[clevel]++;
                            }
                        }
                    }
                }

                DrawLine_Roof_Improved_v2(startx, starty, endx, endy, sh, RoofConfig, nodes, last, next, Base = null, skipKCheck = false) {
                    let roof = RoofConfig.Data;
                    if (RoofConfig.Base !== null) Base = RoofConfig.Base;
                    if (last === null || next === null) return;
                    if (startx !== endx) {
                        let k = (endy - starty) / (endx - startx);
                        let b = (endy * startx - starty * endx) / (startx - endx);
                        if (-1 <= k && k < 1) {
                            let reflex_last = false;
                            let vec1 = new Vector2(startx - last.x, starty - last.y);
                            let vec2 = new Vector2(endx - startx, endy - starty);
                            let vec3 = new Vector2(next.x - endx, next.y - endy);
                            let cos1 = Vector2.Dot(vec1, vec2) / (vec1.Length() * vec2.Length());
                            let cos2 = Vector2.Dot(vec2, vec3) / (vec2.Length() * vec3.Length());
                            if (!(last == null) && -this.cos_th < cos1 && cos1 < this.cos_th) {
                                let triangle1 = [];
                                triangle1.push(last);
                                triangle1.push(new node(startx, starty));
                                triangle1.push(new node(endx, endy));
                                let PosiInPolygon = null, PosiInTriangle = null;
                                if (this.pnpoly4(nodes, new node(startx, starty - RoofConfig.GetReduceDelta()))) PosiInPolygon = false;
                                else if (this.pnpoly4(nodes, new node(startx, starty + RoofConfig.GetReduceDelta()))) PosiInPolygon = true;
                                if (this.pnpoly3(triangle1, new node(startx, starty - RoofConfig.GetReduceDelta()))) PosiInTriangle = false;
                                else if (this.pnpoly3(triangle1, new node(startx, starty + RoofConfig.GetReduceDelta()))) PosiInTriangle = true;
                                if (PosiInPolygon === null || PosiInTriangle === null) {
                                    if (this.pnpoly4(nodes, new node(startx - RoofConfig.GetReduceDelta(), starty))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(startx + RoofConfig.GetReduceDelta(), starty))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle1, new node(startx - RoofConfig.GetReduceDelta(), starty))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle1, new node(startx + RoofConfig.GetReduceDelta(), starty))) PosiInTriangle = true;
                                    if (PosiInPolygon !== null && PosiInTriangle !== null)
                                        reflex_last = PosiInPolygon ^ PosiInTriangle;
                                    else
                                        reflex_last = false;
                                } else {
                                    reflex_last = PosiInPolygon ^ PosiInTriangle;
                                }
                                if (reflex_last && DEBUG) {
                                    print("reflex_last is true");
                                    this.setTile(startx, sh + roof[0][0].length + 2, starty, 133, 0);
                                    print("last:(" + last.x + "," + last.y + ")");
                                    print("start:(" + startx + "," + starty + ")");
                                    print("end:(" + endx + "," + endy + ")");
                                    print("next:(" + next.x + "," + next.y + ")");
                                }
                            }
                            let reflex_next = false;
                            if (!(next === null) && -this.cos_th < cos2 && cos2 < this.cos_th) {
                                let triangle2 = [];
                                triangle2.push(new node(startx, starty));
                                triangle2.push(new node(endx, endy));
                                triangle2.push(next);
                                let PosiInPolygon = null, PosiInTriangle = null;
                                if (this.pnpoly4(nodes, new node(endx, endy - RoofConfig.GetReduceDelta()))) PosiInPolygon = false;
                                else if (this.pnpoly4(nodes, new node(endx, endy + RoofConfig.GetReduceDelta()))) PosiInPolygon = true;
                                if (this.pnpoly3(triangle2, new node(endx, endy - RoofConfig.GetReduceDelta()))) PosiInTriangle = false;
                                else if (this.pnpoly3(triangle2, new node(endx, endy + RoofConfig.GetReduceDelta()))) PosiInTriangle = true;
                                if (PosiInPolygon === null || PosiInTriangle === null) {
                                    if (this.pnpoly4(nodes, new node(endx - RoofConfig.GetReduceDelta(), endy))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(endx + RoofConfig.GetReduceDelta(), endy))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle2, new node(endx - RoofConfig.GetReduceDelta(), endy))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle2, new node(endx + RoofConfig.GetReduceDelta(), endy))) PosiInTriangle = true;
                                    if (PosiInPolygon !== null && PosiInTriangle !== null)
                                        reflex_next = PosiInPolygon ^ PosiInTriangle;
                                    else
                                        reflex_next = false;
                                } else {
                                    reflex_next = PosiInPolygon ^ PosiInTriangle;
                                }
                                if (reflex_next && DEBUG) {
                                    print("reflex_next is true");
                                    this.setTile(endx, sh + roof[0][0].length + 2, endy, 133, 0);
                                    print("last:(" + last.x + "," + last.y + ")");
                                    print("start:(" + startx + "," + starty + ")");
                                    print("end:(" + endx + "," + endy + ")");
                                    print("next:(" + next.x + "," + next.y + ")");
                                }
                            }

                            let d = 0;
                            let mx = Math.round((startx + endx) / 2);
                            let my = Math.round(k * mx + b);
                            if (this.pnpoly2(nodes, new node(mx, my - RoofConfig.GetReduceDelta()))) d = -1;
                            else if (this.pnpoly2(nodes, new node(mx, my + RoofConfig.GetReduceDelta()))) d = 1;

                            if (startx <= endx) {
                                if (reflex_last) {
                                    for (let x = startx - roof[0].length; x < startx; x++) {
                                        let y = Math.round(k * x + b);
                                        let start_dy = startx - x;
                                        for (let _dy = start_dy; _dy < roof[0].length; _dy++) {
                                            let dy = (_dy - 1) * d;
                                            if (_dy === roof[0].length - 1 && this.refalist) {
                                                this.roof_node_list.push(new node(x, y + dy));
                                                if (DEBUG) this.setTile(x, sh + roof[0][0].length, y + dy, 133, 0);
                                            }
                                            for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                let h = _h + sh;
                                                let cblock = roof[this.cnt % roof.length][_dy][_h];
                                                if (cblock.Equals(B))
                                                    cblock = Base;
                                                else if (cblock.Equals(WF))
                                                    cblock = RoofConfig.WindowFrame;
                                                else if (cblock.Equals(W))
                                                    cblock = RoofConfig.Window;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === -1)
                                                    this.setTile(x, h, y + dy, id, data, 0, null);
                                                else if (d === 1)
                                                    this.setTile(x, h, y + dy, id, data, 0, true);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                }
                                for (let x = startx; x <= endx; x++) {
                                    let y = Math.round(k * x + b);
                                    if (DEBUG && reflex_last) print("d=" + d + " x=" + x);
                                    let end_dy = roof[0].length;
                                    if (!(last === null) && !reflex_last) {
                                        if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                            if (startx === last.x) {
                                                end_dy = Math.min(roof[0].length, x - startx + 1);
                                            } else {
                                                let last_k = (starty - last.y) / (startx - last.x);
                                                if (last_k >= 1 || last_k < -1 || skipKCheck) end_dy = Math.min(roof[0].length, x - startx + 1);
                                            }
                                        }
                                    }
                                    if (!(next === null) && !reflex_next) {
                                        if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                            if (endx === next.x) {
                                                end_dy = Math.min(end_dy, endx - x + 1);
                                            } else {
                                                let next_k = (next.y - endy) / (next.x - endx);
                                                if (next_k >= 1 || next_k < -1 || skipKCheck) end_dy = Math.min(end_dy, endx - x + 1);
                                            }
                                        }
                                    }
                                    for (let _dy = 0; _dy < end_dy; _dy++) {
                                        let dy = (_dy - 1) * d;
                                        if (_dy === roof[0].length - 1) {
                                            this.roof_node_list.push(new node(x, y + dy));
                                            if (DEBUG) this.setTile(x, sh + roof[0][0].length, y + dy, 133, 0);
                                        }
                                        for (let _h = 0; _h < roof[0][0].length; _h++) {
                                            let h = _h + sh;
                                            let cblock = roof[this.cnt % roof.length][_dy][_h];
                                            if (cblock.Equals(B))
                                                cblock = Base;
                                            else if (cblock.Equals(WF))
                                                cblock = RoofConfig.WindowFrame;
                                            else if (cblock.Equals(W))
                                                cblock = RoofConfig.Window;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (id === 0) continue;
                                            if (d === -1)
                                                this.setTile(x, h, y + dy, id, data, 0, null);
                                            else if (d === 1)
                                                this.setTile(x, h, y + dy, id, data, 0, true);
                                        }
                                    }
                                    this.cnt++;
                                }
                                if (reflex_next) {
                                    for (let x = endx; x < endx + roof[0].length; x++) {
                                        let y = Math.round(k * x + b);
                                        let start_dy = x - endx;
                                        for (let _dy = start_dy; _dy < roof[0].length; _dy++) {
                                            let dy = (_dy - 1) * d;
                                            if (_dy === roof[0].length - 1 && this.refalist) {
                                                this.roof_node_list.push(new node(x, y + dy));
                                                if (DEBUG) this.setTile(x, sh + roof[0][0].length, y + dy, 133, 0);
                                            }
                                            for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                let h = _h + sh;
                                                let cblock = roof[this.cnt % roof.length][_dy][_h];
                                                if (cblock.Equals(B))
                                                    cblock = Base;
                                                else if (cblock.Equals(WF))
                                                    cblock = RoofConfig.WindowFrame;
                                                else if (cblock.Equals(W))
                                                    cblock = RoofConfig.Window;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === -1)
                                                    this.setTile(x, h, y + dy, id, data, 0, null);
                                                else if (d === 1)
                                                    this.setTile(x, h, y + dy, id, data, 0, true);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                }
                            } else {
                                if (reflex_last) {
                                    for (let x = startx + roof[0].length; x > startx; x--) {
                                        let y = Math.round(k * x + b);
                                        let start_dy = x - startx;
                                        for (let _dy = start_dy; _dy < roof[0].length; _dy++) {
                                            let dy = (_dy - 1) * d;
                                            if (_dy === roof[0].length - 1 && this.refalist) {
                                                this.roof_node_list.push(new node(x, y + dy));
                                                if (DEBUG) this.setTile(x, sh + roof[0][0].length, y + dy, 133, 0);
                                            }
                                            for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                let h = _h + sh;
                                                let cblock = roof[this.cnt % roof.length][_dy][_h];
                                                if (cblock.Equals(B))
                                                    cblock = Base;
                                                else if (cblock.Equals(WF))
                                                    cblock = RoofConfig.WindowFrame;
                                                else if (cblock.Equals(W))
                                                    cblock = RoofConfig.Window;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === -1)
                                                    this.setTile(x, h, y + dy, id, data, 180, true);
                                                else if (d === 1)
                                                    this.setTile(x, h, y + dy, id, data, 180, null);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                }
                                for (let x = startx; x >= endx; x--) {
                                    let y = Math.round(k * x + b);
                                    let end_dy = roof[0].length;
                                    if (!(last === null) && !reflex_last) {
                                        if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                            if (startx === last.x) {
                                                end_dy = Math.min(roof[0].length, startx - x + 1);
                                            } else {
                                                let last_k = (starty - last.y) / (startx - last.x);
                                                if (last_k >= 1 || last_k < -1 || skipKCheck) end_dy = Math.min(roof[0].length, startx - x + 1);
                                            }
                                        }
                                    }
                                    if (!(next === null) && !reflex_next) {
                                        if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                            if (next.x === endx) {
                                                end_dy = Math.min(end_dy, x - endx + 1);
                                            } else {
                                                let next_k = (next.y - endy) / (next.x - endx);
                                                if (next_k >= 1 || next_k < -1 || skipKCheck) end_dy = Math.min(end_dy, x - endx + 1);
                                            }
                                        }
                                    }
                                    for (let _dy = 0; _dy < end_dy; _dy++) {
                                        let dy = (_dy - 1) * d;
                                        if (_dy === roof[0].length - 1) {
                                            this.roof_node_list.push(new node(x, y + dy));
                                            if (DEBUG) this.setTile(x, sh + roof[0][0].length, y + dy, 133, 0);
                                        }
                                        for (let _h = 0; _h < roof[0][0].length; _h++) {
                                            let h = _h + sh;
                                            let cblock = roof[this.cnt % roof.length][_dy][_h];
                                            if (cblock.Equals(B))
                                                cblock = Base;
                                            else if (cblock.Equals(WF))
                                                cblock = RoofConfig.WindowFrame;
                                            else if (cblock.Equals(W))
                                                cblock = RoofConfig.Window;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (id === 0) continue;
                                            if (d === -1)
                                                this.setTile(x, h, y + dy, id, data, 180, true);
                                            else if (d === 1)
                                                this.setTile(x, h, y + dy, id, data, 180, null);
                                        }
                                    }
                                    this.cnt++;
                                }
                                if (reflex_next) {
                                    for (let x = endx - 1; x >= endx - roof[0].length; x--) {
                                        let y = Math.round(k * x + b);
                                        let start_dy = endx - x;
                                        for (let _dy = start_dy; _dy < roof[0].length; _dy++) {
                                            let dy = (_dy - 1) * d;
                                            if (_dy === roof[0].length - 1 && this.refalist) {
                                                this.roof_node_list.push(new node(x, y + dy));
                                                if (DEBUG) this.setTile(x, sh + roof[0][0].length, y + dy, 133, 0);
                                            }
                                            for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                let h = _h + sh;
                                                let cblock = roof[this.cnt % roof.length][_dy][_h];
                                                if (cblock.Equals(B))
                                                    cblock = Base;
                                                else if (cblock.Equals(WF))
                                                    cblock = RoofConfig.WindowFrame;
                                                else if (cblock.Equals(W))
                                                    cblock = RoofConfig.Window;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === -1)
                                                    this.setTile(x, h, y + dy, id, data, 180, true);
                                                else if (d === 1)
                                                    this.setTile(x, h, y + dy, id, data, 180, null);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                }
                            }
                        } else {
                            let reflex_last = false;
                            let vec1 = new Vector2(startx - last.x, starty - last.y);
                            let vec2 = new Vector2(endx - startx, endy - starty);
                            let vec3 = new Vector2(next.x - endx, next.y - endy);
                            let cos1 = Vector2.Dot(vec1, vec2) / (vec1.Length() * vec2.Length());
                            let cos2 = Vector2.Dot(vec2, vec3) / (vec2.Length() * vec3.Length());
                            if (!(last === null) && -this.cos_th < cos1 && cos1 < this.cos_th) {
                                let triangle1 = [];
                                triangle1.push(last);
                                triangle1.push(new node(startx, starty));
                                triangle1.push(new node(endx, endy));
                                let PosiInPolygon = null, PosiInTriangle = null;
                                if (this.pnpoly4(nodes, new node(startx - RoofConfig.GetReduceDelta(), starty))) PosiInPolygon = false;
                                else if (this.pnpoly4(nodes, new node(startx + RoofConfig.GetReduceDelta(), starty))) PosiInPolygon = true;
                                if (this.pnpoly3(triangle1, new node(startx - RoofConfig.GetReduceDelta(), starty))) PosiInTriangle = false;
                                else if (this.pnpoly3(triangle1, new node(startx + RoofConfig.GetReduceDelta(), starty))) PosiInTriangle = true;
                                if (PosiInPolygon === null || PosiInTriangle === null) {
                                    if (this.pnpoly4(nodes, new node(startx, starty - RoofConfig.GetReduceDelta()))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(startx, starty + RoofConfig.GetReduceDelta()))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle1, new node(startx, starty - RoofConfig.GetReduceDelta()))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle1, new node(startx, starty + RoofConfig.GetReduceDelta()))) PosiInTriangle = true;
                                    if (PosiInPolygon !== null && PosiInTriangle !== null)
                                        reflex_last = PosiInPolygon ^ PosiInTriangle;
                                    else
                                        reflex_last = false;
                                } else {
                                    reflex_last = PosiInPolygon ^ PosiInTriangle;
                                }
                                if (reflex_last && DEBUG) {
                                    print("reflex_last is true");
                                    this.setTile(startx, sh + roof[0][0].length + 2, starty, 133, 0);
                                    print("last:(" + last.x + "," + last.y + ")");
                                    print("start:(" + startx + "," + starty + ")");
                                    print("end:(" + endx + "," + endy + ")");
                                    print("next:(" + next.x + "," + next.y + ")");
                                }
                            }
                            let reflex_next = false;
                            if (!(next === null) && -this.cos_th < cos2 && cos2 < this.cos_th) {
                                let triangle2 = [];
                                triangle2.push(new node(startx, starty));
                                triangle2.push(new node(endx, endy));
                                triangle2.push(next);
                                let PosiInPolygon = null, PosiInTriangle = null;
                                if (this.pnpoly4(nodes, new node(endx - RoofConfig.GetReduceDelta(), endy))) PosiInPolygon = false;
                                else if (this.pnpoly4(nodes, new node(endx + RoofConfig.GetReduceDelta(), endy))) PosiInPolygon = true;
                                if (this.pnpoly3(triangle2, new node(endx - RoofConfig.GetReduceDelta(), endy))) PosiInTriangle = false;
                                else if (this.pnpoly3(triangle2, new node(endx + RoofConfig.GetReduceDelta(), endy))) PosiInTriangle = true;
                                if (PosiInPolygon === null || PosiInTriangle === null) {
                                    if (this.pnpoly4(nodes, new node(endx, endy - RoofConfig.GetReduceDelta()))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(endx, endy + RoofConfig.GetReduceDelta()))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle2, new node(endx, endy - RoofConfig.GetReduceDelta()))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle2, new node(endx, endy + RoofConfig.GetReduceDelta()))) PosiInTriangle = true;
                                    if (PosiInPolygon !== null && PosiInTriangle !== null)
                                        reflex_next = PosiInPolygon ^ PosiInTriangle;
                                    else
                                        reflex_next = false;
                                } else {
                                    reflex_next = PosiInPolygon ^ PosiInTriangle;
                                }
                                if (reflex_next && DEBUG) {
                                    print("reflex_next is true");
                                    this.setTile(endx, sh + roof[0][0].length + 2, endy, 133, 0);
                                    print("last:(" + last.x + "," + last.y + ")");
                                    print("start:(" + startx + "," + starty + ")");
                                    print("end:(" + endx + "," + endy + ")");
                                    print("next:(" + next.x + "," + next.y + ")");
                                }
                            }

                            let d = 0;
                            let my = Math.round((starty + endy) / 2);
                            let mx = Math.floor((my - b) / k);
                            if (this.pnpoly2(nodes, new node(mx - RoofConfig.GetReduceDelta(), my))) d = -1;
                            else if (this.pnpoly2(nodes, new node(mx + RoofConfig.GetReduceDelta(), my))) d = 1;

                            if (starty <= endy) {
                                if (reflex_last) {
                                    for (let y = starty - roof[0].length; y < starty; y++) {
                                        let x = Math.floor((y - b) / k);
                                        let start_dx = starty - y;
                                        for (let _dx = start_dx; _dx < roof[0].length; _dx++) {
                                            let dx = (_dx - 1) * d;
                                            if (_dx === roof[0].length - 1 && this.refalist) {
                                                this.roof_node_list.push(new node(x + dx, y));
                                                if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                            }
                                            for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                let h = _h + sh;
                                                let cblock = roof[this.cnt % roof.length][_dx][_h];
                                                if (cblock.Equals(B))
                                                    cblock = Base;
                                                else if (cblock.Equals(WF))
                                                    cblock = RoofConfig.WindowFrame;
                                                else if (cblock.Equals(W))
                                                    cblock = RoofConfig.Window;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 90, null);
                                                else if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 90, false);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                }
                                for (let y = starty; y <= endy; y++) {
                                    let x = Math.floor((y - b) / k);
                                    let end_dx = roof[0].length;
                                    if (!(last === null) && !reflex_last) {
                                        if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                            if (startx !== last.x) {
                                                let last_k = (starty - last.y) / (startx - last.x);
                                                if (-1 <= last_k && last_k < 1 || skipKCheck) end_dx = Math.min(roof[0].length, y - starty + 1);
                                            }
                                        }
                                    }
                                    if (!(next === null) && !reflex_next) {
                                        if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                            if (next.x !== endx) {
                                                let next_k = (next.y - endy) / (next.x - endx);
                                                if (-1 <= next_k && next_k < 1 || skipKCheck) end_dx = Math.min(end_dx, endy - y + 1);
                                            }
                                        }
                                    }
                                    for (let _dx = 0; _dx < end_dx; _dx++) {
                                        let dx = (_dx - 1) * d;
                                        if (_dx === roof[0].length - 1) {
                                            this.roof_node_list.push(new node(x + dx, y));
                                            if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                        }
                                        for (let _h = 0; _h < roof[0][0].length; _h++) {
                                            let h = _h + sh;
                                            let cblock = roof[this.cnt % roof.length][_dx][_h];
                                            if (cblock.Equals(B))
                                                cblock = Base;
                                            else if (cblock.Equals(WF))
                                                cblock = RoofConfig.WindowFrame;
                                            else if (cblock.Equals(W))
                                                cblock = RoofConfig.Window;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (id === 0) continue;
                                            if (d === 1)
                                                this.setTile(x + dx, h, y, id, data, 90, false);
                                            else if (d === -1)
                                                this.setTile(x + dx, h, y, id, data, 90, null);
                                        }
                                    }
                                    this.cnt++;
                                }
                                if (reflex_next) {
                                    for (let y = endy; y < endy + roof[0].length; y++) {
                                        let x = Math.floor((y - b) / k);
                                        let start_dx = y - endy;
                                        for (let _dx = start_dx; _dx < roof[0].length; _dx++) {
                                            let dx = (_dx - 1) * d;
                                            if (_dx === roof[0].length - 1 && this.refalist) {
                                                this.roof_node_list.push(new node(x + dx, y));
                                                if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                            }
                                            for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                let h = _h + sh;
                                                let cblock = roof[this.cnt % roof.length][_dx][_h];
                                                if (cblock.Equals(B))
                                                    cblock = Base;
                                                else if (cblock.Equals(WF))
                                                    cblock = RoofConfig.WindowFrame;
                                                else if (cblock.Equals(W))
                                                    cblock = RoofConfig.Window;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 90, null);
                                                else if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 90, false);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                }
                            } else {
                                if (reflex_last) {
                                    for (let y = starty + roof[0].length; y > starty; y--) {
                                        let x = Math.floor((y - b) / k);
                                        let start_dx = y - starty;
                                        for (let _dx = start_dx; _dx < roof[0].length; _dx++) {
                                            let dx = (_dx - 1) * d;
                                            if (_dx === roof[0].length - 1 && this.refalist) {
                                                this.roof_node_list.push(new node(x + dx, y));
                                                if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                            }
                                            for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                let h = _h + sh;
                                                let cblock = roof[this.cnt % roof.length][_dx][_h];
                                                if (cblock.Equals(B))
                                                    cblock = Base;
                                                else if (cblock.Equals(WF))
                                                    cblock = RoofConfig.WindowFrame;
                                                else if (cblock.Equals(W))
                                                    cblock = RoofConfig.Window;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 270, null);
                                                else if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 270, false);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                }
                                for (let y = starty; y >= endy; y--) {
                                    let x = Math.floor((y - b) / k);
                                    let end_dx = roof[0].length;
                                    if (!(last === null) && !reflex_last) {
                                        if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                            if (startx !== last.x) {
                                                let last_k = (starty - last.y) / (startx - last.x);
                                                if (-1 <= last_k && last_k < 1 || skipKCheck) end_dx = Math.min(roof[0].length, starty - y + 1);
                                            }
                                        }
                                    }
                                    if (!(next === null) && !reflex_next) {
                                        if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                            if (next.x !== endx) {
                                                let next_k = (next.y - endy) / (next.x - endx);
                                                if (-1 <= next_k && next_k < 1 || skipKCheck) end_dx = Math.min(end_dx, y - endy + 1);
                                            }
                                        }
                                    }
                                    for (let _dx = 0; _dx < end_dx; _dx++) {
                                        let dx = (_dx - 1) * d;
                                        if (_dx === roof[0].length - 1) {
                                            this.roof_node_list.push(new node(x + dx, y));
                                            if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                        }
                                        for (let _h = 0; _h < roof[0][0].length; _h++) {
                                            let h = _h + sh;
                                            let cblock = roof[this.cnt % roof.length][_dx][_h];
                                            if (cblock.Equals(B))
                                                cblock = Base;
                                            else if (cblock.Equals(WF))
                                                cblock = RoofConfig.WindowFrame;
                                            else if (cblock.Equals(W))
                                                cblock = RoofConfig.Window;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (cblock.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                data = this.c_rand_data;
                                            } else if (cblock.random === 2) {
                                                data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            }
                                            if (id === 0) continue;
                                            if (d === 1)
                                                this.setTile(x + dx, h, y, id, data, 270, false);
                                            else if (d === -1)
                                                this.setTile(x + dx, h, y, id, data, 270, null);
                                        }
                                    }
                                    this.cnt++;
                                }
                                if (reflex_next) {
                                    for (let y = endy - 1; y > endy - roof[0].length; y--) {
                                        let x = Math.floor((y - b) / k);
                                        let start_dx = endy - y;
                                        for (let _dx = start_dx; _dx < roof[0].length; _dx++) {
                                            let dx = (_dx - 1) * d;
                                            if (_dx === roof[0].length - 1 && this.refalist) {
                                                this.roof_node_list.push(new node(x + dx, y));
                                                if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                            }
                                            for (let _h = 0; _h < roof[0][0].length; _h++) {
                                                let h = _h + sh;
                                                let cblock = roof[this.cnt % roof.length][_dx][_h];
                                                if (cblock.Equals(B))
                                                    cblock = Base;
                                                else if (cblock.Equals(WF))
                                                    cblock = RoofConfig.WindowFrame;
                                                else if (cblock.Equals(W))
                                                    cblock = RoofConfig.Window;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 270, null);
                                                else if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 270, false);
                                            }
                                        }
                                        this.cnt++;
                                    }
                                }
                            }
                        }
                    } else {
                        let reflex_last = false;
                        let vec1 = new Vector2(startx - last.x, starty - last.y);
                        let vec2 = new Vector2(endx - startx, endy - starty);
                        let vec3 = new Vector2(next.x - endx, next.y - endy);
                        let cos1 = Vector2.Dot(vec1, vec2) / (vec1.Length() * vec2.Length());
                        let cos2 = Vector2.Dot(vec2, vec3) / (vec2.Length() * vec3.Length());
                        if (!(last === null) && -this.cos_th < cos1 && cos1 < this.cos_th) {
                            let triangle1 = [];
                            triangle1.push(last);
                            triangle1.push(new node(startx, starty));
                            triangle1.push(new node(endx, endy));
                            let PosiInPolygon = null, PosiInTriangle = null;
                            if (this.pnpoly4(nodes, new node(startx - RoofConfig.GetReduceDelta(), starty))) PosiInPolygon = false;
                            else if (this.pnpoly4(nodes, new node(startx + RoofConfig.GetReduceDelta(), starty))) PosiInPolygon = true;
                            if (this.pnpoly3(triangle1, new node(startx - RoofConfig.GetReduceDelta(), starty))) PosiInTriangle = false;
                            else if (this.pnpoly3(triangle1, new node(startx + RoofConfig.GetReduceDelta(), starty))) PosiInTriangle = true;
                            if (PosiInPolygon === null || PosiInTriangle === null) {
                                if (this.pnpoly4(nodes, new node(startx, starty - RoofConfig.GetReduceDelta()))) PosiInPolygon = false;
                                else if (this.pnpoly4(nodes, new node(startx, starty + RoofConfig.GetReduceDelta()))) PosiInPolygon = true;
                                if (this.pnpoly3(triangle1, new node(startx, starty - RoofConfig.GetReduceDelta()))) PosiInTriangle = false;
                                else if (this.pnpoly3(triangle1, new node(startx, starty + RoofConfig.GetReduceDelta()))) PosiInTriangle = true;
                                if (PosiInPolygon !== null && PosiInTriangle !== null)
                                    reflex_last = PosiInPolygon ^ PosiInTriangle;
                                else
                                    reflex_last = false;
                            } else {
                                reflex_last = PosiInPolygon ^ PosiInTriangle;
                            }
                            if (reflex_last && DEBUG) {
                                print("reflex_last is true");
                                this.setTile(startx, sh + roof[0][0].length + 2, starty, 133, 0);
                                print("last:(" + last.x + "," + last.y + ")");
                                print("start:(" + startx + "," + starty + ")");
                                print("end:(" + endx + "," + endy + ")");
                                print("next:(" + next.x + "," + next.y + ")");
                            }
                        }
                        let reflex_next = false;
                        if (!(next === null) && -this.cos_th < cos2 && cos2 < this.cos_th) {
                            let triangle2 = [];
                            triangle2.push(new node(startx, starty));
                            triangle2.push(new node(endx, endy));
                            triangle2.push(next);
                            let PosiInPolygon = null, PosiInTriangle = null;
                            if (this.pnpoly4(nodes, new node(endx - RoofConfig.GetReduceDelta(), endy))) PosiInPolygon = false;
                            else if (this.pnpoly4(nodes, new node(endx + RoofConfig.GetReduceDelta(), endy))) PosiInPolygon = true;
                            if (this.pnpoly3(triangle2, new node(endx - RoofConfig.GetReduceDelta(), endy))) PosiInTriangle = false;
                            else if (this.pnpoly3(triangle2, new node(endx + RoofConfig.GetReduceDelta(), endy))) PosiInTriangle = true;
                            if (PosiInPolygon === null || PosiInTriangle === null) {
                                if (this.pnpoly4(nodes, new node(endx, endy - RoofConfig.GetReduceDelta()))) PosiInPolygon = false;
                                else if (this.pnpoly4(nodes, new node(endx, endy + RoofConfig.GetReduceDelta()))) PosiInPolygon = true;
                                if (this.pnpoly3(triangle2, new node(endx, endy - RoofConfig.GetReduceDelta()))) PosiInTriangle = false;
                                else if (this.pnpoly3(triangle2, new node(endx, endy + RoofConfig.GetReduceDelta()))) PosiInTriangle = true;
                                if (PosiInPolygon !== null && PosiInTriangle !== null)
                                    reflex_next = PosiInPolygon ^ PosiInTriangle;
                                else
                                    reflex_next = false;
                            } else {
                                reflex_next = PosiInPolygon ^ PosiInTriangle;
                            }
                            if (reflex_next && DEBUG) {
                                print("reflex_next is true");
                                this.setTile(endx, sh + roof[0][0].length + 2, endy, 133, 0);
                                print("last:(" + last.x + "," + last.y + ")");
                                print("start:(" + startx + "," + starty + ")");
                                print("end:(" + endx + "," + endy + ")");
                                print("next:(" + next.x + "," + next.y + ")");
                            }
                        }

                        let d = 0;
                        let my = Math.round((starty + endy) / 2);
                        let mx = startx;
                        if (this.pnpoly2(nodes, new node(mx - RoofConfig.GetReduceDelta(), my))) d = -1;
                        else if (this.pnpoly2(nodes, new node(mx + RoofConfig.GetReduceDelta(), my))) d = 1;

                        if (starty <= endy) {
                            if (reflex_last) {
                                for (let y = starty - roof[0].length; y < starty; y++) {
                                    let x = startx;
                                    let start_dx = starty - y;
                                    for (let _dx = start_dx; _dx < roof[0].length; _dx++) {
                                        let dx = (_dx - 1) * d;
                                        if (_dx === roof[0].length - 1 && this.refalist) {
                                            this.roof_node_list.push(new node(x + dx, y));
                                            if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                        }
                                        for (let _h = 0; _h < roof[0][0].length; _h++) {
                                            let h = _h + sh;
                                            let cblock = roof[this.cnt % roof.length][_dx][_h];
                                            if (cblock.Equals(B))
                                                cblock = Base;
                                            else if (cblock.Equals(WF))
                                                cblock = RoofConfig.WindowFrame;
                                            else if (cblock.Equals(W))
                                                cblock = RoofConfig.Window;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (id === 0) continue;
                                            if (d === -1)
                                                this.setTile(x + dx, h, y, id, data, 90, false);
                                            else if (d === 1)
                                                this.setTile(x + dx, h, y, id, data, 90, null);
                                        }
                                    }
                                    this.cnt++;
                                }
                            }
                            for (let y = starty; y <= endy; y++) {
                                let x = startx;
                                let end_dx = roof[0].length;
                                if (!(last === null) && !reflex_last) {
                                    if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                        if (startx !== last.x) {
                                            let last_k = (starty - last.y) / (startx - last.x);
                                            if (-1 <= last_k && last_k < 1 || skipKCheck) end_dx = Math.min(roof[0].length, y - starty + 1);
                                        }
                                    }
                                }
                                if (!(next === null) && !reflex_next) {
                                    if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                        if (next.x !== endx) {
                                            let next_k = (next.y - endy) / (next.x - endx);
                                            if (-1 <= next_k && next_k < 1 || skipKCheck) end_dx = Math.min(end_dx, endy - y + 1);
                                        }
                                    }
                                }
                                for (let _dx = 0; _dx < end_dx; _dx++) {
                                    let dx = (_dx - 1) * d;
                                    if (_dx === roof[0].length - 1) {
                                        this.roof_node_list.push(new node(x + dx, y));
                                        if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                    }
                                    for (let _h = 0; _h < roof[0][0].length; _h++) {
                                        let h = _h + sh;
                                        let cblock = roof[this.cnt % roof.length][_dx][_h];
                                        if (cblock.Equals(B))
                                            cblock = Base;
                                        else if (cblock.Equals(WF))
                                            cblock = RoofConfig.WindowFrame;
                                        else if (cblock.Equals(W))
                                            cblock = RoofConfig.Window;
                                        let id = cblock.id;
                                        let data = cblock.data;
                                        if (cblock.random === 1) {
                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            data = this.c_rand_data;
                                        } else if (cblock.random === 2) {
                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                        }
                                        if (id === 0) continue;
                                        if (d === 1)
                                            this.setTile(x + dx, h, y, id, data, 90, null);
                                        else if (d === -1)
                                            this.setTile(x + dx, h, y, id, data, 90, false);
                                    }
                                }
                                this.cnt++;
                            }
                            if (reflex_next) {
                                for (let y = endy; y < endy + roof[0].length; y++) {
                                    let x = startx;
                                    let start_dx = y - endy;
                                    for (let _dx = start_dx; _dx < roof[0].length; _dx++) {
                                        let dx = (_dx - 1) * d;
                                        if (_dx === roof[0].length - 1 && this.refalist) {
                                            this.roof_node_list.push(new node(x + dx, y));
                                            if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                        }
                                        for (let _h = 0; _h < roof[0][0].length; _h++) {
                                            let h = _h + sh;
                                            let cblock = roof[this.cnt % roof.length][_dx][_h];
                                            if (cblock.Equals(B))
                                                cblock = Base;
                                            else if (cblock.Equals(WF))
                                                cblock = RoofConfig.WindowFrame;
                                            else if (cblock.Equals(W))
                                                cblock = RoofConfig.Window;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (id === 0) continue;
                                            if (d === -1)
                                                this.setTile(x + dx, h, y, id, data, 90, false);
                                            else if (d === 1)
                                                this.setTile(x + dx, h, y, id, data, 90, null);
                                        }
                                    }
                                    this.cnt++;
                                }
                            }
                        } else {
                            if (reflex_last) {
                                for (let y = starty + roof[0].length; y > starty; y--) {
                                    let x = startx;
                                    let start_dx = y - starty;
                                    for (let _dx = start_dx; _dx < roof[0].length; _dx++) {
                                        let dx = (_dx - 1) * d;
                                        if (_dx === roof[0].length - 1 && this.refalist) {
                                            this.roof_node_list.push(new node(x + dx, y));
                                            if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                        }
                                        for (let _h = 0; _h < roof[0][0].length; _h++) {
                                            let h = _h + sh;
                                            let cblock = roof[this.cnt % roof.length][_dx][_h];
                                            if (cblock.Equals(B))
                                                cblock = Base;
                                            else if (cblock.Equals(WF))
                                                cblock = RoofConfig.WindowFrame;
                                            else if (cblock.Equals(W))
                                                cblock = RoofConfig.Window;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (id === 0) continue;
                                            if (d === -1)
                                                this.setTile(x + dx, h, y, id, data, 270, null);
                                            else if (d === 1)
                                                this.setTile(x + dx, h, y, id, data, 270, false);
                                        }
                                    }
                                    this.cnt++;
                                }
                            }
                            for (let y = starty; y >= endy; y--) {
                                let x = startx;
                                let end_dx = roof[0].length;
                                if (!(last === null) && !reflex_last) {
                                    if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                        if (startx !== last.x) {
                                            let last_k = (starty - last.y) / (startx - last.x);
                                            if (-1 <= last_k && last_k < 1 || skipKCheck) end_dx = Math.min(roof[0].length, starty - y + 1);
                                        }
                                    }
                                }
                                if (!(next === null) && !reflex_next) {
                                    if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                        if (next.x !== endx) {
                                            let next_k = (next.y - endy) / (next.x - endx);
                                            if (-1 <= next_k && next_k < 1 || skipKCheck) end_dx = Math.min(end_dx, y - endy + 1);
                                        }
                                    }
                                }
                                for (let _dx = 0; _dx < end_dx; _dx++) {
                                    let dx = (_dx - 1) * d;
                                    if (_dx === roof[0].length - 1) {
                                        this.roof_node_list.push(new node(x + dx, y));
                                        if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                    }
                                    for (let _h = 0; _h < roof[0][0].length; _h++) {
                                        let h = _h + sh;
                                        let cblock = roof[this.cnt % roof.length][_dx][_h];
                                        if (cblock.Equals(B))
                                            cblock = Base;
                                        else if (cblock.Equals(WF))
                                            cblock = RoofConfig.WindowFrame;
                                        else if (cblock.Equals(W))
                                            cblock = RoofConfig.Window;
                                        let id = cblock.id;
                                        let data = cblock.data;
                                        if (cblock.random === 1) {
                                            if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            data = this.c_rand_data;
                                        } else if (cblock.random === 2) {
                                            data = rd.Next(cblock.rand_min, cblock.rand_max);
                                        }
                                        if (id === 0) continue;
                                        if (d === 1)
                                            this.setTile(x + dx, h, y, id, data, 270, false);
                                        else if (d === -1)
                                            this.setTile(x + dx, h, y, id, data, 270, null);
                                    }
                                }
                                this.cnt++;
                            }
                            if (reflex_next) {
                                for (let y = endy - 1; y > endy - roof[0].length; y--) {
                                    let x = startx;
                                    let start_dx = endy - y;
                                    for (let _dx = start_dx; _dx < roof[0].length; _dx++) {
                                        let dx = (_dx - 1) * d;
                                        if (_dx === roof[0].length - 1 && this.refalist) {
                                            this.roof_node_list.push(new node(x + dx, y));
                                            if (DEBUG) this.setTile(x + dx, sh + roof[0][0].length, y, 133, 0);
                                        }
                                        for (let _h = 0; _h < roof[0][0].length; _h++) {
                                            let h = _h + sh;
                                            let cblock = roof[this.cnt % roof.length][_dx][_h];
                                            if (cblock.Equals(B))
                                                cblock = Base;
                                            else if (cblock.Equals(WF))
                                                cblock = RoofConfig.WindowFrame;
                                            else if (cblock.Equals(W))
                                                cblock = RoofConfig.Window;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (id === 0) continue;
                                            if (d === -1)
                                                this.setTile(x + dx, h, y, id, data, 270, null);
                                            else if (d === 1)
                                                this.setTile(x + dx, h, y, id, data, 270, false);
                                        }
                                    }
                                    this.cnt++;
                                }
                            }
                        }
                    }
                }

                DrawLine_Interior_v3(startx, starty, endx, endy, max_level, InteriorConfig, nodes, last, next, Base = null, skipKCheck = false) {
                    // v3的内饰放置算法：和v2相比，对于扩展判定如果cos范围大于this.cos_th直接认定为需要扩展
                    let interior = InteriorConfig.Data;
                    if (InteriorConfig.Base === null) InteriorConfig.Base = Base;
                    if (last === null || next === null) return;
                    let c_rand_type = -1;
                    if (startx !== endx) {
                        let k = (endy - starty) / (endx - startx);
                        let b = (endy * startx - starty * endx) / (startx - endx);
                        if (Math.abs(k) <= 1) {
                            let reflex_last = false, reflex_next = false;
                            let vec1 = new Vector2(startx - last.x, starty - last.y);
                            let vec2 = new Vector2(endx - startx, endy - starty);
                            let vec3 = new Vector2(next.x - endx, next.y - endy);
                            let cos1 = Vector2.Dot(vec1, vec2) / (vec1.Length() * vec2.Length());
                            let cos2 = Vector2.Dot(vec2, vec3) / (vec2.Length() * vec3.Length());
                            let last_k = (starty - last.y) / (startx - last.x);
                            let next_k = (next.y - endy) / (next.x - endx);
                            if (startx === last.x) last_k = inf;
                            if (next.x === endx) next_k = inf;
                            if (Math.abs(last_k) > 1) {
                                if (Math.abs(cos1) > this.cos_th)
                                    reflex_last = true;
                                else {
                                    let triangle1 = [];
                                    triangle1.push(last);
                                    triangle1.push(new node(startx, starty));
                                    triangle1.push(new node(endx, endy));
                                    let PosiInPolygon = null, PosiInTriangle = null;
                                    if (this.pnpoly4(nodes, new node(startx, starty - InteriorConfig.GetReduceDelta()))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(startx, starty + InteriorConfig.GetReduceDelta()))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle1, new node(startx, starty - InteriorConfig.GetReduceDelta()))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle1, new node(startx, starty + InteriorConfig.GetReduceDelta()))) PosiInTriangle = true;
                                    if (PosiInPolygon === null || PosiInTriangle === null) {
                                        if (this.pnpoly4(nodes, new node(startx - InteriorConfig.GetReduceDelta(), starty))) PosiInPolygon = false;
                                        else if (this.pnpoly4(nodes, new node(startx + InteriorConfig.GetReduceDelta(), starty))) PosiInPolygon = true;
                                        if (this.pnpoly3(triangle1, new node(startx - InteriorConfig.GetReduceDelta(), starty))) PosiInTriangle = false;
                                        else if (this.pnpoly3(triangle1, new node(startx + InteriorConfig.GetReduceDelta(), starty))) PosiInTriangle = true;
                                        if (PosiInPolygon !== null && PosiInTriangle !== null)
                                            reflex_last = PosiInPolygon ^ PosiInTriangle;
                                        else
                                            reflex_last = false;
                                    } else {
                                        reflex_last = PosiInPolygon ^ PosiInTriangle;
                                    }
                                }
                            }
                            if (Math.abs(next_k) > 1) {
                                if (Math.abs(cos2) > this.cos_th)
                                    reflex_next = true;
                                else {
                                    let triangle2 = [];
                                    triangle2.push(new node(startx, starty));
                                    triangle2.push(new node(endx, endy));
                                    triangle2.push(next);
                                    let PosiInPolygon = null, PosiInTriangle = null;
                                    if (this.pnpoly4(nodes, new node(endx, endy - InteriorConfig.GetReduceDelta()))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(endx, endy + InteriorConfig.GetReduceDelta()))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle2, new node(endx, endy - InteriorConfig.GetReduceDelta()))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle2, new node(endx, endy + InteriorConfig.GetReduceDelta()))) PosiInTriangle = true;
                                    if (PosiInPolygon === null || PosiInTriangle === null) {
                                        if (this.pnpoly4(nodes, new node(endx - InteriorConfig.GetReduceDelta(), endy))) PosiInPolygon = false;
                                        else if (this.pnpoly4(nodes, new node(endx + InteriorConfig.GetReduceDelta(), endy))) PosiInPolygon = true;
                                        if (this.pnpoly3(triangle2, new node(endx - InteriorConfig.GetReduceDelta(), endy))) PosiInTriangle = false;
                                        else if (this.pnpoly3(triangle2, new node(endx + InteriorConfig.GetReduceDelta(), endy))) PosiInTriangle = true;
                                        if (PosiInPolygon !== null && PosiInTriangle !== null)
                                            reflex_next = PosiInPolygon ^ PosiInTriangle;
                                        else
                                            reflex_next = false;
                                    } else {
                                        reflex_next = PosiInPolygon ^ PosiInTriangle;
                                    }
                                }
                            }

                            let d = 0;
                            let mx = Math.round((startx + endx) / 2);
                            let my = Math.round(k * mx + b);
                            if (this.pnpoly2(nodes, new node(mx, my - InteriorConfig.GetReduceDelta()))) d = -1;
                            else if (this.pnpoly2(nodes, new node(mx, my + InteriorConfig.GetReduceDelta()))) d = 1;
                            else return;

                            function GetValidWidth(x, y) {
                                let ret = 1;
                                for (; ret <= InteriorConfig.GetWidth(); ret++) {
                                    if (!pnpoly4(nodes, new node(x, y + ret * d))) break;
                                }
                                return ret - 1;
                            }

                            for (let clevel = 0; clevel < max_level; clevel++) {
                                let sh = clevel * InteriorConfig.GetHeight();
                                if (startx <= endx) {
                                    if (reflex_last) {
                                        for (let x = startx - InteriorConfig.GetWidth() - 1; x < startx; x++) {
                                            let y = Math.round(k * x + b);
                                            let start_dy = startx - x;
                                            for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                let h = _h + sh;
                                                for (let _dy = GetValidWidth(x, y); _dy > start_dy; _dy--) {
                                                    let dy = _dy * d;
                                                    let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dy];
                                                    if (cblock.Equals(B))
                                                        cblock = InteriorConfig.Base;
                                                    else if (cblock.Equals(L))
                                                        cblock = InteriorConfig.Light;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (cblock.random === 1) {
                                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        data = this.c_rand_data;
                                                    } else if (cblock.random === 2) {
                                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    } else if (cblock.random === 3) {
                                                        if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        let customed = this.setCustomStyle(cblock, c_rand_type);
                                                        id = customed.id;
                                                        data = customed.data;
                                                    }
                                                    if (d === 1)
                                                        this.setTile(x, h, y + dy, id, data, 0, null, true);
                                                    else if (d === -1)
                                                        this.setTile(x, h, y + dy, id, data, 0, true, true);
                                                }
                                            }
                                            this.Cnt[clevel]++;
                                        }
                                    }
                                    for (let x = startx; x < endx; x++) {
                                        let y = Math.round(k * x + b);
                                        let end_dy = GetValidWidth(x, y);
                                        if (!(last === null) && !reflex_last) {
                                            if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                                if (startx === last.x) {
                                                    end_dy = Math.min(end_dy, x - startx + 1);
                                                } else {
                                                    if (Math.abs(last_k) > 1 || skipKCheck)
                                                        end_dy = Math.min(end_dy, x - startx + 1);
                                                }
                                            }
                                        }
                                        if (!(next === null) && !reflex_next) {
                                            if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                                if (endx === next.x) {
                                                    end_dy = Math.min(end_dy, endx - x + 1);
                                                } else {
                                                    if (Math.abs(next_k) > 1 || skipKCheck)
                                                        end_dy = Math.min(end_dy, endx - x + 1);
                                                }
                                            }
                                        }
                                        for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                            let h = _h + sh;
                                            for (let _dy = end_dy; _dy > 0; _dy--) {
                                                let dy = _dy * d;
                                                let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dy];
                                                if (cblock.Equals(B))
                                                    cblock = InteriorConfig.Base;
                                                else if (cblock.Equals(L))
                                                    cblock = InteriorConfig.Light;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (cblock.random === 1) {
                                                    if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    data = this.c_rand_data;
                                                } else if (cblock.random === 2) {
                                                    data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                } else if (cblock.random === 3) {
                                                    if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    let customed = this.setCustomStyle(cblock, c_rand_type);
                                                    id = customed.id;
                                                    data = customed.data;
                                                }
                                                if (d === 1)
                                                    this.setTile(x, h, y + dy, id, data, 0, null, true);
                                                else if (d === -1)
                                                    this.setTile(x, h, y + dy, id, data, 0, true, true);
                                            }
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                    if (reflex_next) {
                                        for (let x = endx; x <= endx + InteriorConfig.GetWidth(); x++) {
                                            let y = Math.round(k * x + b);
                                            let start_dy = x - endx;
                                            for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                let h = _h + sh;
                                                for (let _dy = GetValidWidth(x, y); _dy > start_dy; _dy--) {
                                                    let dy = _dy * d;
                                                    let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dy];
                                                    if (cblock.Equals(B))
                                                        cblock = InteriorConfig.Base;
                                                    else if (cblock.Equals(L))
                                                        cblock = InteriorConfig.Light;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (cblock.random === 1) {
                                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        data = this.c_rand_data;
                                                    } else if (cblock.random === 2) {
                                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    } else if (cblock.random === 3) {
                                                        if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        let customed = this.setCustomStyle(cblock, c_rand_type);
                                                        id = customed.id;
                                                        data = customed.data;
                                                    }
                                                    if (d === 1)
                                                        this.setTile(x, h, y + dy, id, data, 0, null, true);
                                                    else if (d === -1)
                                                        this.setTile(x, h, y + dy, id, data, 0, true, true);
                                                }
                                            }
                                            this.Cnt[clevel]++;
                                        }
                                    }
                                } else {
                                    if (reflex_last) {
                                        for (let x = startx + InteriorConfig.GetWidth() + 1; x > startx; x--) {
                                            let y = Math.round(k * x + b);
                                            let start_dy = x - startx;
                                            for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                let h = _h + sh;
                                                for (let _dy = GetValidWidth(x, y); _dy > start_dy; _dy--) {
                                                    let dy = _dy * d;
                                                    let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dy];
                                                    if (cblock.Equals(B))
                                                        cblock = InteriorConfig.Base;
                                                    else if (cblock.Equals(L))
                                                        cblock = InteriorConfig.Light;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (cblock.random === 1) {
                                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        data = this.c_rand_data;
                                                    } else if (cblock.random === 2) {
                                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    } else if (cblock.random === 3) {
                                                        if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        let customed = this.setCustomStyle(cblock, c_rand_type);
                                                        id = customed.id;
                                                        data = customed.data;
                                                    }
                                                    if (d === 1)
                                                        this.setTile(x, h, y + dy, id, data, 180, true, true);
                                                    else if (d === -1)
                                                        this.setTile(x, h, y + dy, id, data, 180, null, true);
                                                }
                                            }
                                            this.Cnt[clevel]++;
                                        }
                                    }
                                    for (let x = startx; x > endx; x--) {
                                        let y = Math.round(k * x + b);
                                        let end_dy = GetValidWidth(x, y);
                                        if (!(last === null) && !reflex_last) {
                                            if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                                if (startx === last.x) {
                                                    end_dy = Math.min(end_dy, startx - x + 1);
                                                } else {
                                                    if (Math.abs(last_k) > 1 || skipKCheck)
                                                        end_dy = Math.min(end_dy, startx - x + 1);
                                                }
                                            }
                                        }
                                        if (!(next === null) && !reflex_next) {
                                            if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                                if (next.x === endx) {
                                                    end_dy = Math.min(end_dy, x - endx + 1);
                                                } else {
                                                    if (Math.abs(next_k) > 1 || skipKCheck)
                                                        end_dy = Math.min(end_dy, x - endx + 1);
                                                }
                                            }
                                        }
                                        for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                            let h = _h + sh;
                                            for (let _dy = end_dy; _dy > 0; _dy--) {
                                                let dy = _dy * d;
                                                let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dy];
                                                if (cblock.Equals(B))
                                                    cblock = InteriorConfig.Base;
                                                else if (cblock.Equals(L))
                                                    cblock = InteriorConfig.Light;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (cblock.random === 1) {
                                                    if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    data = this.c_rand_data;
                                                } else if (cblock.random === 2) {
                                                    data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                } else if (cblock.random === 3) {
                                                    if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    let customed = this.setCustomStyle(cblock, c_rand_type);
                                                    id = customed.id;
                                                    data = customed.data;
                                                }
                                                if (d === 1)
                                                    this.setTile(x, h, y + dy, id, data, 180, true, true);
                                                else if (d === -1)
                                                    this.setTile(x, h, y + dy, id, data, 180, null, true);
                                            }
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                    if (reflex_next) {
                                        for (let x = endx; x >= endx - InteriorConfig.GetWidth(); x--) {
                                            let y = Math.round(k * x + b);
                                            let start_dy = endx - x;
                                            for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                let h = _h + sh;
                                                for (let _dy = GetValidWidth(x, y); _dy > start_dy; _dy--) {
                                                    let dy = _dy * d;
                                                    let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dy];
                                                    if (cblock.Equals(B))
                                                        cblock = InteriorConfig.Base;
                                                    else if (cblock.Equals(L))
                                                        cblock = InteriorConfig.Light;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (cblock.random === 1) {
                                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        data = this.c_rand_data;
                                                    } else if (cblock.random === 2) {
                                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    } else if (cblock.random === 3) {
                                                        if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        let customed = this.setCustomStyle(cblock, c_rand_type);
                                                        id = customed.id;
                                                        data = customed.data;
                                                    }
                                                    if (d === 1)
                                                        this.setTile(x, h, y + dy, id, data, 180, true, true);
                                                    else if (d === -1)
                                                        this.setTile(x, h, y + dy, id, data, 180, null, true);
                                                }
                                            }
                                            this.Cnt[clevel]++;
                                        }
                                    }
                                }
                            }
                        } else {
                            let reflex_last = false, reflex_next = false;
                            let vec1 = new Vector2(startx - last.x, starty - last.y);
                            let vec2 = new Vector2(endx - startx, endy - starty);
                            let vec3 = new Vector2(next.x - endx, next.y - endy);
                            let cos1 = Vector2.Dot(vec1, vec2) / (vec1.Length() * vec2.Length());
                            let cos2 = Vector2.Dot(vec2, vec3) / (vec2.Length() * vec3.Length());
                            let last_k = (starty - last.y) / (startx - last.x);
                            let next_k = (next.y - endy) / (next.x - endx);
                            if (startx === last.x) last_k = inf;
                            if (next.x === endx) next_k = inf;
                            if (Math.abs(last_k) <= 1) {
                                if (Math.abs(cos1) > this.cos_th)
                                    reflex_last = true;
                                else {
                                    let triangle1 = [];
                                    triangle1.push(last);
                                    triangle1.push(new node(startx, starty));
                                    triangle1.push(new node(endx, endy));
                                    let PosiInPolygon = null, PosiInTriangle = null;
                                    if (this.pnpoly4(nodes, new node(startx - InteriorConfig.GetReduceDelta(), starty))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(startx + InteriorConfig.GetReduceDelta(), starty))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle1, new node(startx - InteriorConfig.GetReduceDelta(), starty))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle1, new node(startx + InteriorConfig.GetReduceDelta(), starty))) PosiInTriangle = true;
                                    if (PosiInPolygon === null || PosiInTriangle === null) {
                                        if (this.pnpoly4(nodes, new node(startx, starty - InteriorConfig.GetReduceDelta()))) PosiInPolygon = false;
                                        else if (this.pnpoly4(nodes, new node(startx, starty + InteriorConfig.GetReduceDelta()))) PosiInPolygon = true;
                                        if (this.pnpoly3(triangle1, new node(startx, starty - InteriorConfig.GetReduceDelta()))) PosiInTriangle = false;
                                        else if (this.pnpoly3(triangle1, new node(startx, starty + InteriorConfig.GetReduceDelta()))) PosiInTriangle = true;
                                        if (PosiInPolygon !== null && PosiInTriangle !== null)
                                            reflex_last = PosiInPolygon ^ PosiInTriangle;
                                        else
                                            reflex_last = false;
                                    } else {
                                        reflex_last = PosiInPolygon ^ PosiInTriangle;
                                    }
                                }
                            }
                            if (Math.abs(next_k) <= 1) {
                                if (Math.abs(cos2) > this.cos_th)
                                    reflex_next = true;
                                else {
                                    let triangle2 = [];
                                    triangle2.push(new node(startx, starty));
                                    triangle2.push(new node(endx, endy));
                                    triangle2.push(next);
                                    let PosiInPolygon = null, PosiInTriangle = null;
                                    if (this.pnpoly4(nodes, new node(endx - InteriorConfig.GetReduceDelta(), endy))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(endx + InteriorConfig.GetReduceDelta(), endy))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle2, new node(endx - InteriorConfig.GetReduceDelta(), endy))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle2, new node(endx + InteriorConfig.GetReduceDelta(), endy))) PosiInTriangle = true;
                                    if (PosiInPolygon === null || PosiInTriangle === null) {
                                        if (this.pnpoly4(nodes, new node(endx, endy - InteriorConfig.GetReduceDelta()))) PosiInPolygon = false;
                                        else if (this.pnpoly4(nodes, new node(endx, endy + InteriorConfig.GetReduceDelta()))) PosiInPolygon = true;
                                        if (this.pnpoly3(triangle2, new node(endx, endy - InteriorConfig.GetReduceDelta()))) PosiInTriangle = false;
                                        else if (this.pnpoly3(triangle2, new node(endx, endy + InteriorConfig.GetReduceDelta()))) PosiInTriangle = true;
                                        if (PosiInPolygon !== null && PosiInTriangle !== null)
                                            reflex_next = PosiInPolygon ^ PosiInTriangle;
                                        else
                                            reflex_next = false;
                                    } else {
                                        reflex_next = PosiInPolygon ^ PosiInTriangle;
                                    }
                                }
                            }

                            let d = 0;
                            let my = Math.round((starty + endy) / 2);
                            let mx = Math.floor((my - b) / k);
                            if (this.pnpoly2(nodes, new node(mx - InteriorConfig.GetReduceDelta(), my))) d = -1;
                            else if (this.pnpoly2(nodes, new node(mx + InteriorConfig.GetReduceDelta(), my))) d = 1;
                            else return;

                            function GetValidWidth(x, y) {
                                let ret = 1;
                                for (; ret <= InteriorConfig.GetWidth(); ret++) {
                                    if (!pnpoly4(nodes, new node(x + ret * d, y))) break;
                                }
                                return ret - 1;
                            }

                            for (let clevel = 0; clevel < max_level; clevel++) {
                                let sh = clevel * InteriorConfig.GetHeight();
                                if (starty <= endy) {
                                    if (reflex_last) {
                                        for (let y = starty - InteriorConfig.GetWidth() - 1; y < starty; y++) {
                                            let x = Math.floor((y - b) / k);
                                            let start_dx = starty - y;
                                            for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                let h = _h + sh;
                                                for (let _dx = GetValidWidth(x, y); _dx > start_dx; _dx--) {
                                                    let dx = _dx * d;
                                                    let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                    if (cblock.Equals(B))
                                                        cblock = InteriorConfig.Base;
                                                    else if (cblock.Equals(L))
                                                        cblock = InteriorConfig.Light;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (cblock.random === 1) {
                                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        data = this.c_rand_data;
                                                    } else if (cblock.random === 2) {
                                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    } else if (cblock.random === 3) {
                                                        if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        let customed = this.setCustomStyle(cblock, c_rand_type);
                                                        id = customed.id;
                                                        data = customed.data;
                                                    }
                                                    if (d === -1)
                                                        this.setTile(x + dx, h, y, id, data, 90, null, true);
                                                    else if (d === 1)
                                                        this.setTile(x + dx, h, y, id, data, 90, false, true);
                                                }
                                            }
                                            this.Cnt[clevel]++;
                                        }
                                    }
                                    for (let y = starty; y < endy; y++) {
                                        let x = Math.floor((y - b) / k);
                                        let end_dx = GetValidWidth(x, y);
                                        if (!(last === null) && !reflex_last) {
                                            if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                                if (startx !== last.x) {
                                                    if (Math.abs(last_k) <= 1 || skipKCheck)
                                                        end_dx = Math.min(end_dx, y - starty + 1);
                                                }
                                            }
                                        }
                                        if (!(next === null) && !reflex_next) {
                                            if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                                if (endx !== next.x) {
                                                    if (Math.abs(next_k) <= 1 || skipKCheck)
                                                        end_dx = Math.min(end_dx, endy - y + 1);
                                                }
                                            }
                                        }
                                        for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                            let h = _h + sh;
                                            for (let _dx = end_dx; _dx > 0; _dx--) {
                                                let dx = _dx * d;
                                                let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                if (cblock.Equals(B))
                                                    cblock = InteriorConfig.Base;
                                                else if (cblock.Equals(L))
                                                    cblock = InteriorConfig.Light;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (cblock.random === 1) {
                                                    if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    data = this.c_rand_data;
                                                } else if (cblock.random === 2) {
                                                    data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                } else if (cblock.random === 3) {
                                                    if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    let customed = this.setCustomStyle(cblock, c_rand_type);
                                                    id = customed.id;
                                                    data = customed.data;
                                                }
                                                if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 90, null, true);
                                                else if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 90, false, true);
                                            }
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                    if (reflex_next) {
                                        for (let y = endy; y <= endy + InteriorConfig.GetWidth(); y++) {
                                            let x = Math.floor((y - b) / k);
                                            let start_dx = y - endy;
                                            for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                let h = _h + sh;
                                                for (let _dx = GetValidWidth(x, y); _dx > start_dx; _dx--) {
                                                    let dx = _dx * d;
                                                    let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                    if (cblock.Equals(B))
                                                        cblock = InteriorConfig.Base;
                                                    else if (cblock.Equals(L))
                                                        cblock = InteriorConfig.Light;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (cblock.random === 1) {
                                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        data = this.c_rand_data;
                                                    } else if (cblock.random === 2) {
                                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    } else if (cblock.random === 3) {
                                                        if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        let customed = this.setCustomStyle(cblock, c_rand_type);
                                                        id = customed.id;
                                                        data = customed.data;
                                                    }
                                                    if (d === -1)
                                                        this.setTile(x + dx, h, y, id, data, 90, null, true);
                                                    else if (d === 1)
                                                        this.setTile(x + dx, h, y, id, data, 90, false, true);
                                                }
                                            }
                                            this.Cnt[clevel]++;
                                        }
                                    }
                                } else {
                                    if (reflex_last) {
                                        for (let y = starty + InteriorConfig.GetWidth() + 1; y > starty; y--) {
                                            let x = Math.floor((y - b) / k);
                                            let start_dx = y - starty;
                                            for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                let h = _h + sh;
                                                for (let _dx = GetValidWidth(x, y); _dx > start_dx; _dx--) {
                                                    let dx = _dx * d;
                                                    let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                    if (cblock.Equals(B))
                                                        cblock = InteriorConfig.Base;
                                                    else if (cblock.Equals(L))
                                                        cblock = InteriorConfig.Light;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (cblock.random === 1) {
                                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        data = this.c_rand_data;
                                                    } else if (cblock.random === 2) {
                                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    } else if (cblock.random === 3) {
                                                        if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        let customed = this.setCustomStyle(cblock, c_rand_type);
                                                        id = customed.id;
                                                        data = customed.data;
                                                    }
                                                    if (d === -1)
                                                        this.setTile(x + dx, h, y, id, data, 270, false, true);
                                                    else if (d === 1)
                                                        this.setTile(x + dx, h, y, id, data, 270, null, true);
                                                }
                                            }
                                            this.Cnt[clevel]++;
                                        }
                                    }
                                    for (let y = starty; y > endy; y--) {
                                        let x = Math.floor((y - b) / k);
                                        let end_dx = GetValidWidth(x, y);
                                        if (!(last === null) && !reflex_last) {
                                            if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                                if (startx !== last.x) {
                                                    if (Math.abs(last_k) <= 1 || skipKCheck)
                                                        end_dx = Math.min(end_dx, starty - y + 1);
                                                }
                                            }
                                        }
                                        if (!(next === null) && !reflex_next) {
                                            if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                                if (endx !== next.x) {
                                                    if (Math.abs(next_k) <= 1 || skipKCheck)
                                                        end_dx = Math.min(end_dx, y - endy + 1);
                                                }
                                            }
                                        }
                                        for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                            let h = _h + sh;
                                            for (let _dx = end_dx; _dx > 0; _dx--) {
                                                let dx = _dx * d;
                                                let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                if (cblock.Equals(B))
                                                    cblock = InteriorConfig.Base;
                                                else if (cblock.Equals(L))
                                                    cblock = InteriorConfig.Light;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (cblock.random === 1) {
                                                    if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    data = this.c_rand_data;
                                                } else if (cblock.random === 2) {
                                                    data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                } else if (cblock.random === 3) {
                                                    if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    let customed = this.setCustomStyle(cblock, c_rand_type);
                                                    id = customed.id;
                                                    data = customed.data;
                                                }
                                                if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 270, false, true);
                                                else if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 270, null, true);
                                            }
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                    if (reflex_next) {
                                        for (let y = endy; y >= endy + InteriorConfig.GetWidth(); y--) {
                                            let x = Math.floor((y - b) / k);
                                            let start_dx = endy - y;
                                            for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                                let h = _h + sh;
                                                for (let _dx = GetValidWidth(x, y); _dx > start_dx; _dx--) {
                                                    let dx = _dx * d;
                                                    let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                    if (cblock.Equals(B))
                                                        cblock = InteriorConfig.Base;
                                                    else if (cblock.Equals(L))
                                                        cblock = InteriorConfig.Light;
                                                    let id = cblock.id;
                                                    let data = cblock.data;
                                                    if (id === 0) continue;
                                                    if (cblock.random === 1) {
                                                        if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        data = this.c_rand_data;
                                                    } else if (cblock.random === 2) {
                                                        data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    } else if (cblock.random === 3) {
                                                        if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                        let customed = this.setCustomStyle(cblock, c_rand_type);
                                                        id = customed.id;
                                                        data = customed.data;
                                                    }
                                                    if (d === -1)
                                                        this.setTile(x + dx, h, y, id, data, 270, false, true);
                                                    else if (d === 1)
                                                        this.setTile(x + dx, h, y, id, data, 270, null, true);
                                                }
                                            }
                                            this.Cnt[clevel]++;
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        let reflex_last = false, reflex_next = false;
                        let vec1 = new Vector2(startx - last.x, starty - last.y);
                        let vec2 = new Vector2(endx - startx, endy - starty);
                        let vec3 = new Vector2(next.x - endx, next.y - endy);
                        let cos1 = Vector2.Dot(vec1, vec2) / (vec1.Length() * vec2.Length());
                        let cos2 = Vector2.Dot(vec2, vec3) / (vec2.Length() * vec3.Length());
                        let last_k = (starty - last.y) / (startx - last.x);
                        let next_k = (next.y - endy) / (next.x - endx);
                        if (startx === last.x) last_k = inf;
                        if (next.x === endx) next_k = inf;
                        if (Math.abs(last_k) <= 1) {
                            if (Math.abs(cos1) > this.cos_th)
                                reflex_last = true;
                            else {
                                let triangle1 = [];
                                triangle1.push(last);
                                triangle1.push(new node(startx, starty));
                                triangle1.push(new node(endx, endy));
                                let PosiInPolygon = null, PosiInTriangle = null;
                                if (this.pnpoly4(nodes, new node(startx - InteriorConfig.GetReduceDelta(), starty))) PosiInPolygon = false;
                                else if (this.pnpoly4(nodes, new node(startx + InteriorConfig.GetReduceDelta(), starty))) PosiInPolygon = true;
                                if (this.pnpoly3(triangle1, new node(startx - InteriorConfig.GetReduceDelta(), starty))) PosiInTriangle = false;
                                else if (this.pnpoly3(triangle1, new node(startx + InteriorConfig.GetReduceDelta(), starty))) PosiInTriangle = true;
                                if (PosiInPolygon === null || PosiInTriangle === null) {
                                    if (this.pnpoly4(nodes, new node(startx, starty - InteriorConfig.GetReduceDelta()))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(startx, starty + InteriorConfig.GetReduceDelta()))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle1, new node(startx, starty - InteriorConfig.GetReduceDelta()))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle1, new node(startx, starty + InteriorConfig.GetReduceDelta()))) PosiInTriangle = true;
                                    if (PosiInPolygon !== null && PosiInTriangle !== null)
                                        reflex_last = PosiInPolygon ^ PosiInTriangle;
                                    else
                                        reflex_last = false;
                                } else {
                                    reflex_last = PosiInPolygon ^ PosiInTriangle;
                                }
                            }
                        }
                        if (Math.abs(next_k) <= 1) {
                            if (Math.abs(cos2) > this.cos_th)
                                reflex_next = true;
                            else {
                                let triangle2 = [];
                                triangle2.push(new node(startx, starty));
                                triangle2.push(new node(endx, endy));
                                triangle2.push(next);
                                let PosiInPolygon = null, PosiInTriangle = null;
                                if (this.pnpoly4(nodes, new node(endx - InteriorConfig.GetReduceDelta(), endy))) PosiInPolygon = false;
                                else if (this.pnpoly4(nodes, new node(endx + InteriorConfig.GetReduceDelta(), endy))) PosiInPolygon = true;
                                if (this.pnpoly3(triangle2, new node(endx - InteriorConfig.GetReduceDelta(), endy))) PosiInTriangle = false;
                                else if (this.pnpoly3(triangle2, new node(endx + InteriorConfig.GetReduceDelta(), endy))) PosiInTriangle = true;
                                if (PosiInPolygon === null || PosiInTriangle === null) {
                                    if (this.pnpoly4(nodes, new node(endx, endy - InteriorConfig.GetReduceDelta()))) PosiInPolygon = false;
                                    else if (this.pnpoly4(nodes, new node(endx, endy + InteriorConfig.GetReduceDelta()))) PosiInPolygon = true;
                                    if (this.pnpoly3(triangle2, new node(endx, endy - InteriorConfig.GetReduceDelta()))) PosiInTriangle = false;
                                    else if (this.pnpoly3(triangle2, new node(endx, endy + InteriorConfig.GetReduceDelta()))) PosiInTriangle = true;
                                    if (PosiInPolygon !== null && PosiInTriangle !== null)
                                        reflex_next = PosiInPolygon ^ PosiInTriangle;
                                    else
                                        reflex_next = false;
                                } else {
                                    reflex_next = PosiInPolygon ^ PosiInTriangle;
                                }
                            }
                        }

                        let d = 0;
                        let my = Math.round((starty + endy) / 2);
                        let mx = startx;
                        if (this.pnpoly2(nodes, new node(mx - InteriorConfig.GetReduceDelta(), my))) d = -1;
                        else if (this.pnpoly2(nodes, new node(mx + InteriorConfig.GetReduceDelta(), my))) d = 1;
                        else return;

                        function GetValidWidth(x, y) {
                            let ret = 1;
                            for (; ret <= InteriorConfig.GetWidth(); ret++) {
                                if (!pnpoly4(nodes, new node(x + ret * d, y))) break;
                            }
                            return ret - 1;
                        }

                        for (let clevel = 0; clevel < max_level; clevel++) {
                            let sh = clevel * InteriorConfig.GetHeight();
                            if (starty <= endy) {
                                if (reflex_last) {
                                    for (let y = starty - InteriorConfig.GetWidth() - 1; y < starty; y++) {
                                        let x = startx;
                                        let start_dx = starty - y;
                                        for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                            let h = _h + sh;
                                            for (let _dx = GetValidWidth(x, y); _dx > start_dx; _dx--) {
                                                let dx = _dx * d;
                                                let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                if (cblock.Equals(B))
                                                    cblock = InteriorConfig.Base;
                                                else if (cblock.Equals(L))
                                                    cblock = InteriorConfig.Light;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (cblock.random === 1) {
                                                    if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    data = this.c_rand_data;
                                                } else if (cblock.random === 2) {
                                                    data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                } else if (cblock.random === 3) {
                                                    if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    let customed = this.setCustomStyle(cblock, c_rand_type);
                                                    id = customed.id;
                                                    data = customed.data;
                                                }
                                                if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 90, null, true);
                                                else if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 90, false, true);
                                            }
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                }
                                for (let y = starty; y < endy; y++) {
                                    let x = startx;
                                    let end_dx = GetValidWidth(x, y);
                                    if (!(last === null) && !reflex_last) {
                                        if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                            if (startx !== last.x) {
                                                if (Math.abs(last_k) <= 1 || skipKCheck)
                                                    end_dx = Math.min(end_dx, y - starty + 1);
                                            }
                                        }
                                    }
                                    if (!(next === null) && !reflex_next) {
                                        if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                            if (endx !== next.x) {
                                                if (Math.abs(next_k) <= 1 || skipKCheck)
                                                    end_dx = Math.min(end_dx, endy - y + 1);
                                            }
                                        }
                                    }
                                    for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                        let h = _h + sh;
                                        for (let _dx = end_dx; _dx > 0; _dx--) {
                                            let dx = _dx * d;
                                            let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                            if (cblock.Equals(B))
                                                cblock = InteriorConfig.Base;
                                            else if (cblock.Equals(L))
                                                cblock = InteriorConfig.Light;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (id === 0) continue;
                                            if (cblock.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                data = this.c_rand_data;
                                            } else if (cblock.random === 2) {
                                                data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            } else if (cblock.random === 3) {
                                                if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                let customed = this.setCustomStyle(cblock, c_rand_type);
                                                id = customed.id;
                                                data = customed.data;
                                            }
                                            if (d === -1)
                                                this.setTile(x + dx, h, y, id, data, 90, null, true);
                                            else if (d === 1)
                                                this.setTile(x + dx, h, y, id, data, 90, false, true);
                                        }
                                    }
                                    this.Cnt[clevel]++;
                                }
                                if (reflex_next) {
                                    for (let y = endy; y <= endy + InteriorConfig.GetWidth(); y++) {
                                        let x = startx;
                                        let start_dx = y - endy;
                                        for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                            let h = _h + sh;
                                            for (let _dx = GetValidWidth(x, y); _dx > start_dx; _dx--) {
                                                let dx = _dx * d;
                                                let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                if (cblock.Equals(B))
                                                    cblock = InteriorConfig.Base;
                                                else if (cblock.Equals(L))
                                                    cblock = InteriorConfig.Light;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (cblock.random === 1) {
                                                    if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    data = this.c_rand_data;
                                                } else if (cblock.random === 2) {
                                                    data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                } else if (cblock.random === 3) {
                                                    if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    let customed = this.setCustomStyle(cblock, c_rand_type);
                                                    id = customed.id;
                                                    data = customed.data;
                                                }
                                                if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 90, null, true);
                                                else if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 90, false, true);
                                            }
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                }
                            } else {
                                if (reflex_last) {
                                    for (let y = starty + InteriorConfig.GetWidth() + 1; y > starty; y--) {
                                        let x = startx;
                                        let start_dx = y - starty;
                                        for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                            let h = _h + sh;
                                            for (let _dx = GetValidWidth(x, y); _dx > start_dx; _dx--) {
                                                let dx = _dx * d;
                                                let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                if (cblock.Equals(B))
                                                    cblock = InteriorConfig.Base;
                                                else if (cblock.Equals(L))
                                                    cblock = InteriorConfig.Light;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (cblock.random === 1) {
                                                    if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    data = this.c_rand_data;
                                                } else if (cblock.random === 2) {
                                                    data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                } else if (cblock.random === 3) {
                                                    if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    let customed = this.setCustomStyle(cblock, c_rand_type);
                                                    id = customed.id;
                                                    data = customed.data;
                                                }
                                                if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 270, false, true);
                                                else if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 270, null, true);
                                            }
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                }
                                for (let y = starty; y > endy; y--) {
                                    let x = startx;
                                    let end_dx = GetValidWidth(x, y);
                                    if (!(last === null) && !reflex_last) {
                                        if (-this.cos_th < cos1 && cos1 < this.cos_th) {
                                            if (startx !== last.x) {
                                                if (Math.abs(last_k) <= 1 || skipKCheck)
                                                    end_dx = Math.min(end_dx, starty - y + 1);
                                            }
                                        }
                                    }
                                    if (!(next === null) && !reflex_next) {
                                        if (-this.cos_th < cos2 && cos2 < this.cos_th) {
                                            if (endx !== next.x) {
                                                if (Math.abs(next_k) <= 1 || skipKCheck)
                                                    end_dx = Math.min(end_dx, y - endy + 1);
                                            }
                                        }
                                    }
                                    for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                        let h = _h + sh;
                                        for (let _dx = end_dx; _dx > 0; _dx--) {
                                            let dx = _dx * d;
                                            let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                            if (cblock.Equals(B))
                                                cblock = InteriorConfig.Base;
                                            else if (cblock.Equals(L))
                                                cblock = InteriorConfig.Light;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (id === 0) continue;
                                            if (cblock.random === 1) {
                                                if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                data = this.c_rand_data;
                                            } else if (cblock.random === 2) {
                                                data = rd.Next(cblock.rand_min, cblock.rand_max);
                                            } else if (cblock.random === 3) {
                                                if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                let customed = this.setCustomStyle(cblock, c_rand_type);
                                                id = customed.id;
                                                data = customed.data;
                                            }
                                            if (d === -1)
                                                this.setTile(x + dx, h, y, id, data, 270, false, true);
                                            else if (d === 1)
                                                this.setTile(x + dx, h, y, id, data, 270, null, true);
                                        }
                                    }
                                    this.Cnt[clevel]++;
                                }
                                if (reflex_next) {
                                    for (let y = endy; y >= endy + InteriorConfig.GetWidth(); y--) {
                                        let x = startx;
                                        let start_dx = endy - y;
                                        for (let _h = 0; _h < InteriorConfig.GetHeight(); _h++) {
                                            let h = _h + sh;
                                            for (let _dx = GetValidWidth(x, y); _dx > start_dx; _dx--) {
                                                let dx = _dx * d;
                                                let cblock = interior[_h][this.Cnt[clevel] % InteriorConfig.GetLength()][InteriorConfig.GetWidth() - _dx];
                                                if (cblock.Equals(B))
                                                    cblock = InteriorConfig.Base;
                                                else if (cblock.Equals(L))
                                                    cblock = InteriorConfig.Light;
                                                let id = cblock.id;
                                                let data = cblock.data;
                                                if (id === 0) continue;
                                                if (cblock.random === 1) {
                                                    if (this.c_rand_data === -1) this.c_rand_data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    data = this.c_rand_data;
                                                } else if (cblock.random === 2) {
                                                    data = rd.Next(cblock.rand_min, cblock.rand_max);
                                                } else if (cblock.random === 3) {
                                                    if (c_rand_type === -1) c_rand_type = rd.Next(cblock.rand_min, cblock.rand_max);
                                                    let customed = this.setCustomStyle(cblock, c_rand_type);
                                                    id = customed.id;
                                                    data = customed.data;
                                                }
                                                if (d === -1)
                                                    this.setTile(x + dx, h, y, id, data, 270, false, true);
                                                else if (d === 1)
                                                    this.setTile(x + dx, h, y, id, data, 270, null, true);
                                            }
                                        }
                                        this.Cnt[clevel]++;
                                    }
                                }
                            }
                        }
                    }
                }

                DrawLine_FirstFloor(startx, starty, endx, endy, FirstFloorConfig, nodes, Base) {
                    let firstfloor = FirstFloorConfig.Data;
                    if (FirstFloorConfig.Base === null) FirstFloorConfig.Base = Base;
                    if (startx !== endx) {
                        let k = (endy - starty) / (endx - startx);
                        let b = (endy * startx - starty * endx) / (startx - endx);
                        if (-1 <= k && k < 1) {
                            let d = 0;
                            let mx = Math.round((startx + endx) / 2);
                            let my = Math.round(k * mx + b);
                            if (this.pnpoly2(nodes, new node(mx, my - FirstFloorConfig.GetReduceDelta()))) d = 1;
                            else if (this.pnpoly2(nodes, new node(mx, my + FirstFloorConfig.GetReduceDelta()))) d = -1;
                            if (startx <= endx) {
                                for (let x = startx; x <= endx; x++) {
                                    let y = Math.round(k * x + b);
                                    for (let h = 0; h < firstfloor.length; h++) {
                                        for (let _dy = 0; _dy < firstfloor[0][0].length; _dy++) {
                                            let dy = _dy * d;
                                            let cblock = firstfloor[h][this.cnt % FirstFloorConfig.GetLength()][_dy];
                                            if (cblock.Equals(B))
                                                cblock = FirstFloorConfig.Base;
                                            else if (cblock.Equals(W))
                                                cblock = FirstFloorConfig.Window;
                                            else if (cblock.Equals(U1))
                                                cblock = FirstFloorConfig.U1;
                                            else if (cblock.Equals(U2))
                                                cblock = FirstFloorConfig.U2;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (id === 0) continue;
                                            if (d === -1)
                                                this.setTile(x, h + 1, y + dy, id, data, 0, null);
                                            else if (d === 1)
                                                this.setTile(x, h + 1, y + dy, id, data, 0, true);
                                        }
                                    }
                                    this.cnt++;
                                }
                            } else {
                                for (let x = startx; x >= endx; x--) {
                                    let y = Math.round(k * x + b);
                                    for (let h = 0; h < FirstFloorConfig.GetHeight(); h++) {
                                        for (let _dy = 0; _dy < FirstFloorConfig.GetWidth(); _dy++) {
                                            let dy = _dy * d;
                                            let cblock = firstfloor[h][this.cnt % FirstFloorConfig.GetLength()][_dy];
                                            if (cblock.Equals(B))
                                                cblock = FirstFloorConfig.Base;
                                            else if (cblock.Equals(W))
                                                cblock = FirstFloorConfig.Window;
                                            else if (cblock.Equals(U1))
                                                cblock = FirstFloorConfig.U1;
                                            else if (cblock.Equals(U2))
                                                cblock = FirstFloorConfig.U2;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (id === 0) continue;
                                            if (d === -1)
                                                this.setTile(x, h + 1, y + dy, id, data, 180, true);
                                            else if (d === 1)
                                                this.setTile(x, h + 1, y + dy, id, data, 180, null);
                                        }
                                    }
                                    this.cnt++;
                                }
                            }
                        } else {
                            let d = 0;
                            let my = Math.round((starty + endy) / 2);
                            let mx = Math.floor((my - b) / k);
                            if (this.pnpoly2(nodes, new node(mx - FirstFloorConfig.GetReduceDelta(), my))) d = 1;
                            else if (this.pnpoly2(nodes, new node(mx + FirstFloorConfig.GetReduceDelta(), my))) d = -1;
                            if (starty <= endy) {
                                for (let y = starty; y <= endy; y++) {
                                    let x = Math.floor((y - b) / k);
                                    for (let h = 0; h < FirstFloorConfig.GetHeight(); h++) {
                                        for (let _dx = 0; _dx < FirstFloorConfig.GetWidth(); _dx++) {
                                            let dx = _dx * d;
                                            let cblock = firstfloor[h][this.cnt % FirstFloorConfig.GetLength()][_dx];
                                            if (cblock.Equals(B))
                                                cblock = FirstFloorConfig.Base;
                                            else if (cblock.Equals(W))
                                                cblock = FirstFloorConfig.Window;
                                            else if (cblock.Equals(U1))
                                                cblock = FirstFloorConfig.U1;
                                            else if (cblock.Equals(U2))
                                                cblock = FirstFloorConfig.U2;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (id === 0) continue;
                                            if (d === 1)
                                                this.setTile(x + dx, h + 1, y, id, data, 90, null);
                                            else if (d === -1)
                                                this.setTile(x + dx, h + 1, y, id, data, 90, false);
                                        }
                                    }
                                    this.cnt++;
                                }
                            } else {
                                for (let y = starty; y >= endy; y--) {
                                    let x = Math.floor((y - b) / k);
                                    for (let h = 0; h < FirstFloorConfig.GetHeight(); h++) {
                                        for (let _dx = 0; _dx < FirstFloorConfig.GetWidth(); _dx++) {
                                            let dx = _dx * d;
                                            let cblock = firstfloor[h][this.cnt % FirstFloorConfig.GetLength()][_dx];
                                            if (cblock.Equals(B))
                                                cblock = FirstFloorConfig.Base;
                                            else if (cblock.Equals(W))
                                                cblock = FirstFloorConfig.Window;
                                            else if (cblock.Equals(U1))
                                                cblock = FirstFloorConfig.U1;
                                            else if (cblock.Equals(U2))
                                                cblock = FirstFloorConfig.U2;
                                            let id = cblock.id;
                                            let data = cblock.data;
                                            if (id === 0) continue;
                                            if (d === 1)
                                                this.setTile(x + dx, h + 1, y, id, data, 270, false);
                                            else if (d === -1)
                                                this.setTile(x + dx, h + 1, y, id, data, 270, null);
                                        }
                                    }
                                    this.cnt++;
                                }
                            }
                        }
                    } else {
                        let d = 0;
                        let my = Math.round((starty + endy) / 2);
                        let mx = startx;
                        if (this.pnpoly2(nodes, new node(mx - FirstFloorConfig.GetReduceDelta(), my))) d = 1;
                        else if (this.pnpoly2(nodes, new node(mx + FirstFloorConfig.GetReduceDelta(), my))) d = -1;
                        if (starty <= endy) {
                            for (let y = starty; y <= endy; y++) {
                                let x = startx;
                                for (let h = 0; h < FirstFloorConfig.GetHeight(); h++) {
                                    for (let _dx = 0; _dx < FirstFloorConfig.GetWidth(); _dx++) {
                                        let dx = _dx * d;
                                        let cblock = firstfloor[h][this.cnt % FirstFloorConfig.GetLength()][_dx];
                                        if (cblock.Equals(B))
                                            cblock = FirstFloorConfig.Base;
                                        else if (cblock.Equals(W))
                                            cblock = FirstFloorConfig.Window;
                                        else if (cblock.Equals(U1))
                                            cblock = FirstFloorConfig.U1;
                                        else if (cblock.Equals(U2))
                                            cblock = FirstFloorConfig.U2;
                                        let id = cblock.id;
                                        let data = cblock.data;
                                        if (id === 0) continue;
                                        if (d === 1)
                                            this.setTile(x + dx, h + 1, y, id, data, 90, null);
                                        else if (d === -1)
                                            this.setTile(x + dx, h + 1, y, id, data, 90, false);
                                    }
                                }
                                this.cnt++;
                            }
                        } else {
                            for (let y = starty; y >= endy; y--) {
                                let x = startx;
                                for (let h = 0; h < FirstFloorConfig.GetHeight(); h++) {
                                    for (let _dx = 0; _dx < FirstFloorConfig.GetWidth(); _dx++) {
                                        let dx = _dx * d;
                                        let cblock = firstfloor[h][this.cnt % FirstFloorConfig.GetLength()][_dx];
                                        if (cblock.Equals(B))
                                            cblock = FirstFloorConfig.Base;
                                        else if (cblock.Equals(W))
                                            cblock = FirstFloorConfig.Window;
                                        else if (cblock.Equals(U1))
                                            cblock = FirstFloorConfig.U1;
                                        else if (cblock.Equals(U2))
                                            cblock = FirstFloorConfig.U2;
                                        let id = cblock.id;
                                        let data = cblock.data;
                                        if (id === 0) continue;
                                        if (d === 1)
                                            this.setTile(x + dx, h + 1, y, id, data, 270, false);
                                        else if (d === -1)
                                            this.setTile(x + dx, h + 1, y, id, data, 270, null);
                                    }
                                }
                                this.cnt++;
                            }
                        }
                    }
                }

                FillPolygonScanline(nodes, h, id, data) {
                    let minx = inf, miny = inf, maxx = -inf, maxy = -inf, n = nodes.length;
                    for (let node of nodes) {
                        if (node.x === undef || node.y === undef) continue;
                        minx = Math.min(node.x, minx);
                        miny = Math.min(node.y, miny);
                        maxx = Math.max(node.x, maxx);
                        maxy = Math.max(node.y, maxy);
                    }
                    for (let x = minx; x <= maxx; x++) {
                        for (let y = miny; y <= maxy; y++) {
                            if (this.pnpoly2(nodes, new node(x, y)))
                                this.setTile(x, h, y, id, data);
                        }
                    }
                }

                // Pnpoly2: 增加了对套娃曲线判定的支持
                pnpoly2(nodes, test) {
                    let c = false;
                    let n = nodes.length;
                    for (let i = 0; i < n; i++) {
                        //let j = (i === 0) ? (n - 1) : (i - 1);
                        let j;
                        if (i === 0 || nodes[i - 1].x === undef || nodes[i - 1].y === undef) {
                            for (j = i + 1; j < nodes.length; j++) {
                                if (nodes[j].x === undef || nodes[j].y === undef) {
                                    break;
                                }
                            }
                            j--;
                        } else {
                            j = i - 1;
                        }
                        if (nodes[i].x === undef || nodes[j].x === undef) continue;
                        if (((nodes[i].y > test.y) !== (nodes[j].y > test.y)) && (test.x < (nodes[j].x - nodes[i].x) * (test.y - nodes[i].y) / (nodes[j].y - nodes[i].y) + nodes[i].x)) {
                            c = !c;
                        }
                    }
                    return c;
                }
                // Pnpoly3: 专为Roof建造过程中的判定三角形准备，应用于普通多边形（非套娃曲线），并且边缘部分将会被判定为true
                pnpoly3(nodes, test) {
                    let c = false;
                    let n = nodes.length;
                    for (let i = 0; i < n; i++) {
                        let j = (i === 0) ? (n - 1) : (i - 1);
                        if (nodes[i].x === test.x && test.x === nodes[j].x && Math.min(nodes[i].y, nodes[j].y) <= test.y && test.y <= Math.max(nodes[i].y, nodes[j].y)
                            || nodes[i].y === test.y && test.y === nodes[j].y && Math.min(nodes[i].x, nodes[j].x) <= test.x && test.x <= Math.max(nodes[i].x, nodes[j].x))
                            return true;
                        if (((nodes[i].y > test.y) !== (nodes[j].y > test.y)) && (test.x < (nodes[j].x - nodes[i].x) * (test.y - nodes[i].y) / (nodes[j].y - nodes[i].y) + nodes[i].x)) {
                            c = !c;
                        }
                    }
                    return c;
                }
                // Pnpoly4: 在Pnpoly2的基础上，边缘部分将会被判定为false
                pnpoly4(nodes, test) {
                    let c = false;
                    let n = nodes.length;
                    for (let i = 0; i < n; i++) {
                        let j;
                        if (i === 0 || nodes[i - 1].x === undef || nodes[i - 1].y === undef) {
                            for (j = i + 1; j < nodes.length; j++) {
                                if (nodes[j].x === undef || nodes[j].y === undef) {
                                    break;
                                }
                            }
                            j--;
                        } else {
                            j = i - 1;
                        }
                        if (nodes[i].x === undef || nodes[j].x === undef) continue;
                        if (nodes[i].x === test.x && test.x === nodes[j].x && Math.min(nodes[i].y, nodes[j].y) <= test.y && test.y <= Math.max(nodes[i].y, nodes[j].y)
                            || nodes[i].y === test.y && test.y === nodes[j].y && Math.min(nodes[i].x, nodes[j].x) <= test.x && test.x <= Math.max(nodes[i].x, nodes[j].x))
                            return false;
                        if (((nodes[i].y > test.y) !== (nodes[j].y > test.y)) && (test.x < (nodes[j].x - nodes[i].x) * (test.y - nodes[i].y) / (nodes[j].y - nodes[i].y) + nodes[i].x)) {
                            c = !c;
                        }
                    }
                    return c;
                }

                IsSmallBuilding(nodes) {
                    const small_threshold = 50;
                    let minx = inf, miny = inf, maxx = -inf, maxy = -inf, n = nodes.length;
                    for (let node of nodes) {
                        if (this.IsUndefined(node)) continue;
                        minx = Math.min(node.x, minx);
                        miny = Math.min(node.y, miny);
                        maxx = Math.max(node.x, maxx);
                        maxy = Math.max(node.y, maxy);
                    }
                    if (maxx - minx < small_threshold && maxy - miny < small_threshold)
                        return true;
                    else
                        return false;
                }

                IsMiniBuilding(nodes) {
                    const mini_threshold = 15;
                    let minx = inf, miny = inf, maxx = -inf, maxy = -inf, n = nodes.length;
                    for (let node of nodes) {
                        if (this.IsUndefined(node)) continue;
                        minx = Math.min(node.x, minx);
                        miny = Math.min(node.y, miny);
                        maxx = Math.max(node.x, maxx);
                        maxy = Math.max(node.y, maxy);
                    }
                    if (maxx - minx < mini_threshold && maxy - miny < mini_threshold)
                        return true;
                    else
                        return false;
                }
                IsUndefined(node) {
                    return node.x === undef && node.y === undef;
                }
                IsStair(id) {
                    const stairs = [53, 134, 135, 136, 163, 164, 108, 109, 114, 128, 180, 156, 203];
                    for (let v of stairs) {
                        if (id === v) return true;
                    }
                    return false;
                }
                ClearCnt() {
                    for (let i = 0; i < this.Cnt.length; i++)
                        this.Cnt[i] = 0;
                }

                setCustomStyle(origin, type) {
                    let id = origin.id, idata = origin.data;
                    //Style
                    if (id === 53 || id === 136) {    //Stair
                        switch (type) {
                            case 0: //Oak
                                id = 53;
                                break;
                            case 1: //Spruce
                                id = 134;
                                break;
                            case 2: //Birch
                                id = 135;
                                break;
                            case 3: //Jungle
                                id = 136;
                                break;
                            case 4: //Acacia
                                id = 163;
                                break;
                            case 5: //Dark oak
                                id = 164;
                                break;
                            case 6: //Sand
                                id = 128;
                                break;
                            case 7: //Red sand
                                id = 180;
                                break;
                            case 8: //Purpur
                                id = 203;
                                break;
                            case 9: //Quartz
                                id = 156;
                                break;
                            default:
                                print("Unsupported format");
                                break;
                        }
                    } else if (id === 67) {  //Cobble stair
                        switch (type) {
                            case 6: //Sand
                                id = 128;
                                break;
                            case 7: //Red sand
                                id = 180;
                                break;
                            case 8: //Purpur
                                id = 203;
                                break;
                            case 9: //Quartz
                                id = 156;
                                break;
                        }
                    } else if (id === 5) {   //Plank
                        switch (type) {
                            case 0: //Oak
                                idata = 0;
                                break;
                            case 1: //Spruce
                                idata = 1;
                                break;
                            case 2: //Birch
                                idata = 2;
                                break;
                            case 3: //Jungle
                                idata = 3;
                                break;
                            case 4: //Acacia
                                idata = 4;
                                break;
                            case 5: //Dark oak
                                idata = 5;
                                break;
                            case 6: //Sand
                                id = 24;
                                idata = 2;
                                break;
                            case 7: //Red sand
                                id = 179;
                                idata = 2;
                                break;
                            case 8: //Purpur
                                id = 201;
                                idata = 0;
                                break;
                            case 9: //Quartz
                                id = 155;
                                idata = 0;
                                break;
                            default:
                                print("Unsupported format");
                                break;
                        }
                    } else if (id === 17) {  //Log
                        switch (type) {
                            case 0: //Oak
                                idata = 0;
                                break;
                            case 1: //Spruce
                                idata = 1;
                                break;
                            case 2: //Birch
                                idata = 2;
                                break;
                            case 3: //Jungle
                                idata = 3;
                                break;
                            case 4: //Acacia
                                id = 162;
                                idata = 0;
                                break;
                            case 5: //Dark oak
                                id = 162;
                                idata = 1;
                                break;
                            case 6: //Sand
                                id = 24;
                                idata = 0;
                                break;
                            case 7: //Red sand
                                id = 179;
                                idata = 0;
                                break;
                            case 8: //Purpur
                                id = 201;
                                idata = 2;
                                break;
                            case 9: //Quartz
                                id = 155;
                                idata = 2;
                                break;
                            default:
                                print("Unsupported format");
                                break;
                        }
                    } else if (id === 4) {   //Cobblestone
                        switch (type) {
                            case 6: //Sand
                                id = 24;
                                break;
                            case 7: //Red sand
                                id = 179;
                                break;
                            case 8: //Purpur
                                id = 201;
                                break;
                            case 9: //Quartz
                                id = 155;
                                break;
                        }
                    } else if (id === 64 || id === 195) { //Door
                        switch (type) {
                            case 0: //Oak
                                id = 64;
                                break;
                            case 1: //Spruce
                                id = 193;
                                break;
                            case 2: //Birch
                                id = 194;
                                break;
                            case 3: //Jungle
                                id = 195;
                                break;
                            case 4: //Acacia
                                id = 196;
                                break;
                            case 5: //Dark oak
                                id = 197;
                                break;
                            case 9: //Quartz
                                id = 194;
                                break;
                            default:
                                id = 64;
                                break;
                        }
                    } else if (id === 85) {  //Fence
                        switch (type) {
                            case 0: //Oak
                                idata = 0;
                                break;
                            case 1: //Spruce
                                idata = 1;
                                break;
                            case 2: //Birch
                                idata = 2;
                                break;
                            case 3: //Jungle
                                idata = 3;
                                break;
                            case 4: //Acacia
                                idata = 4;
                                break;
                            case 5: //Dark oak
                                idata = 5;
                                break;
                            case 9: //Quartz
                                idata = 2;
                                break;
                            default:
                                idata = 0;
                                break;
                        }
                    } else if (id === 198) { //Grass walk
                        switch (type) {
                            case 6: //Sand
                                id = 24; idata = 0;
                                break;
                            case 7: //Red sand
                                id = 179; idata = 0;
                                break;
                            case 8: //Purpur
                                id = 121; idata = 0;
                                break;
                            case 9: //Quartz
                                id = 155; idata = 0;
                                break;
                        }
                    } else if (id === 2) {   //Grass block
                        switch (type) {
                            case 6: //Sand
                                id = 3;
                                break;
                            case 7: //Red sand
                                id = 3;
                                break;
                            case 8: //Purpur
                                id = 206;
                                break;
                            case 9: //Quartz
                                id = 155;
                                break;
                        }
                    }
                    let ret = new myBlock(id, idata);
                    return ret;
                }

                RotateData(id, data, rot) {
                    //Rotate, 旋转, 方向逆时针
                    let idata = data;
                    if (this.IsStair(id)) {  //Stair
                        switch (rot) {
                            case 0:
                                break;
                            case 90:
                                switch (idata) {
                                    case 1: idata = 2; break;
                                    case 2: idata = 0; break;
                                    case 0: idata = 3; break;
                                    case 3: idata = 1; break;
                                    case 5: idata = 6; break;
                                    case 6: idata = 4; break;
                                    case 4: idata = 7; break;
                                    case 7: idata = 5; break;
                                }
                                break;
                            case 180:
                                switch (idata) {
                                    case 1: idata = 0; break;
                                    case 2: idata = 3; break;
                                    case 0: idata = 1; break;
                                    case 3: idata = 2; break;
                                    case 5: idata = 4; break;
                                    case 4: idata = 5; break;
                                    case 6: idata = 7; break;
                                    case 7: idata = 6; break;
                                }
                                break;
                            case 270:
                                switch (idata) {
                                    case 1: idata = 3; break;
                                    case 2: idata = 1; break;
                                    case 0: idata = 2; break;
                                    case 3: idata = 0; break;
                                    case 5: idata = 7; break;
                                    case 6: idata = 5; break;
                                    case 4: idata = 6; break;
                                    case 7: idata = 4; break;
                                }
                                break;
                            default:
                                print("Unsupported rotate angle");
                                break;
                        }
                    } else if (id === 68 || id === 61 || id === 54 || id === 65 || id === 77 || id === 143) { //Wallsign, Furnace, Chest, Ladder, Stone Button, Wood Button
                        switch (rot) {
                            case 0:
                                break;
                            case 90:
                                switch (idata) {
                                    case 5: idata = 2; break;
                                    case 2: idata = 4; break;
                                    case 4: idata = 3; break;
                                    case 3: idata = 5; break;
                                }
                                break;
                            case 180:
                                switch (idata) {
                                    case 5: idata = 4; break;
                                    case 2: idata = 3; break;
                                    case 4: idata = 5; break;
                                    case 3: idata = 2; break;
                                }
                                break;
                            case 270:
                                switch (idata) {
                                    case 5: idata = 3; break;
                                    case 2: idata = 5; break;
                                    case 4: idata = 2; break;
                                    case 3: idata = 4; break;
                                }
                                break;
                            default:
                                print("Unsupported rotate angle");
                                break;
                        }
                    } else if (id === 50) {  //Torch
                        switch (rot) {
                            case 0:
                                break;
                            case 90:
                                switch (idata) {
                                    case 1: idata = 4; break;
                                    case 4: idata = 2; break;
                                    case 2: idata = 3; break;
                                    case 3: idata = 1; break;
                                }
                                break;
                            case 180:
                                switch (idata) {
                                    case 1: idata = 2; break;
                                    case 4: idata = 3; break;
                                    case 2: idata = 1; break;
                                    case 3: idata = 4; break;
                                }
                                break;
                            case 270:
                                switch (idata) {
                                    case 1: idata = 3; break;
                                    case 4: idata = 1; break;
                                    case 2: idata = 4; break;
                                    case 3: idata = 2; break;
                                }
                                break;
                        }
                    } else if (id === 64 || id === 71 || id === 193 || id === 194 || id === 195 || id === 196 || id === 197 || id === 199) {    //Door, Item Frame
                        switch (rot) {
                            case 0:
                                break;
                            case 90:
                                switch (idata) {
                                    case 2: idata = 1; break;
                                    case 1: idata = 0; break;
                                    case 0: idata = 3; break;
                                    case 3: idata = 2; break;
                                    case 7: idata = 6; break;
                                    case 6: idata = 5; break;
                                    case 5: idata = 4; break;
                                    case 4: idata = 7; break;
                                }
                                break;
                            case 180:
                                switch (idata) {
                                    case 2: idata = 0; break;
                                    case 1: idata = 3; break;
                                    case 0: idata = 2; break;
                                    case 3: idata = 1; break;
                                    case 7: idata = 5; break;
                                    case 5: idata = 7; break;
                                    case 6: idata = 4; break;
                                    case 4: idata = 6; break;
                                }
                                break;
                            case 270:
                                switch (idata) {
                                    case 2: idata = 3; break;
                                    case 1: idata = 2; break;
                                    case 0: idata = 1; break;
                                    case 3: idata = 0; break;
                                    case 4: idata = 5; break;
                                    case 5: idata = 6; break;
                                    case 6: idata = 7; break;
                                    case 7: idata = 4; break;
                                }
                                break;
                        }
                    }
                    return idata;
                }

                FlipData(id, data, Xaxis) {
                    //Flip, 翻转, Xasix为true则以X轴为轴翻转，false则以Y轴为轴翻转
                    let idata = data;
                    if (this.IsStair(id)) {  //Stair
                        switch (Xaxis) {
                            case true:
                                switch (idata) {
                                    case 0:
                                    case 1:
                                    case 4:
                                    case 5:
                                        break;  //不变
                                    case 2:
                                        idata = 3;
                                        break;
                                    case 3:
                                        idata = 2;
                                        break;
                                    case 6:
                                        idata = 7;
                                        break;
                                    case 7:
                                        idata = 6;
                                        break;
                                }
                                break;
                            case false:
                                switch (idata) {
                                    case 2: case 3: case 6: case 7: break;
                                    case 0:
                                        idata = 1;
                                        break;
                                    case 1:
                                        idata = 0;
                                        break;
                                    case 4:
                                        idata = 5;
                                        break;
                                    case 5:
                                        idata = 4;
                                        break;
                                }
                                break;
                        }
                    } else if (id === 68 || id === 61 || id === 54 || id === 65 || id === 77 || id === 143) { //Wallsign, Furnace, Chest, Ladder, Stone Button, Wood Button
                        switch (Xaxis) {
                            case true:
                                switch (idata) {
                                    case 4:
                                    case 5:
                                        break;
                                    case 2:
                                        idata = 3;
                                        break;
                                    case 3:
                                        idata = 2;
                                        break;
                                }
                                break;
                            case false:
                                switch (idata) {
                                    case 2:
                                    case 3:
                                        break;
                                    case 4:
                                        idata = 5;
                                        break;
                                    case 5:
                                        idata = 4;
                                        break;
                                }
                                break;
                        }
                    } else if (id === 50) {  //Torch
                        print("Not implement warning: Torch flip");
                    } else if (id === 64 || id === 71 || id === 193 || id === 194 || id === 195 || id === 196 || id === 197 || id === 199) {    //Door, Item Frame
                        switch (Xaxis) {
                            case true:
                                switch (data) {
                                    case 0:
                                    case 2:
                                    case 5:
                                    case 7:
                                        break;
                                    case 1:
                                        idata = 3;
                                        break;
                                    case 3:
                                        idata = 1;
                                        break;
                                    case 4: idata = 6; break;
                                    case 6: idata = 4; break;
                                }
                                break;
                            case false:
                                switch (data) {
                                    case 1:
                                    case 3:
                                    case 4:
                                    case 6:
                                        break;
                                    case 0:
                                        idata = 2;
                                        break;
                                    case 2:
                                        idata = 0;
                                        break;
                                    case 5:
                                        idata = 7;
                                        break;
                                    case 7:
                                        idata = 5;
                                        break;
                                }
                                break;
                        }
                    }
                    return idata;
                }

                block_list = {}

                setTile(x, y, z, id, data, rot = 0, Flip_Xaxis = null, doNotReplace = false) {
                    if (doNotReplace) {
                        let _block = this.block_list[new Vector3(x, y, z)];
                        if (_block != undefined) return;
                    }
                    if (rot !== 0) data = this.RotateData(id, data, rot);
                    if (Flip_Xaxis !== null) data = this.FlipData(id, data, Flip_Xaxis);
                    data = this.FlipData(id, data, true);

                    let blockStr = this.IDtoString(id);

                    setblock(x, y + this.base_y, z, blockStr, data);    //调用NC的setBlock

                    this.block_list[new Vector3(x, y, z)] = new Block(id, data);
                }

                setBaseY(y) {
                    this.base_y = y;
                }
                IDtoString(id) {
                    let tn;
                    switch (id) {
                        case 0:
                            tn = "air";
                            break;
                        case 1:
                            tn = "stone";
                            break;
                        case 2:
                            tn = "grass"; break;
                        case 3:
                            tn = "dirt"; break;
                        case 4:
                            tn = "cobblestone"; break;
                        case 5:
                            tn = "planks";
                            break;
                        case 6:
                            tn = "sapling";
                            break;
                        case 7:
                            tn = "bedrock";
                            break;
                        case 8:
                            tn = "flowing_water";
                            break;
                        case 9:
                            tn = "water";
                            break;
                        case 10:
                            tn = "flowing_lava"; break;
                        case 11:
                            tn = "lava"; break;
                        case 12:
                            tn = "sand";
                            break;
                        case 13:
                            tn = "gravel"; break;
                        case 14:
                            tn = "gold_ore"; break;
                        case 15:
                            tn = "iron_ore"; break;
                        case 16:
                            tn = "coal_ore"; break;
                        case 17:
                            tn = "log";
                            break;
                        case 18:
                            tn = "leaves";
                            break;
                        case 19:
                            tn = "sponge"; break;
                        case 20:
                            tn = "glass";
                            break;
                        case 21:
                            tn = "lapis_ore";
                            break;
                        case 22:
                            tn = "lapis_block";
                            break;
                        case 23:
                            tn = "dispenser";
                            break;
                        case 24:
                            tn = "sandstone";
                            break;
                        case 25:
                            tn = "noteblock"; break;
                        case 26:
                            tn = "bed";
                            break;
                        case 27:
                            tn = "golden_rail";
                            break;
                        case 28:
                            tn = "detector_rail";
                            break;
                        case 29:
                            tn = "sticky_piston";
                            break;
                        case 30:
                            tn = "web";
                            break;
                        case 31:
                            tn = "tallgrass";
                            break;
                        case 32:
                            tn = "deadbush";
                            break;
                        case 33:
                            tn = "piston";
                            break;
                        case 34:
                            tn = "piston";
                            break;
                        case 35:
                            tn = "wool";
                            break;
                        case 37:
                            tn = "yellow_flower";
                            break;
                        case 38:
                            tn = "red_flower";
                            break;
                        case 39:
                            tn = "brown_mushroom";
                            break;
                        case 40:
                            tn = "red_mushroom";
                            break;
                        case 41:
                            tn = "gold_block";
                            break;
                        case 42:
                            tn = "iron_block";
                            break;
                        case 43:
                            tn = "double_stone_slab";
                            break;
                        case 44:
                            tn = "stone_slab";
                            break;
                        case 45:
                            tn = "brick_block";
                            break;
                        case 46:
                            tn = "tnt";
                            break;
                        case 47:
                            tn = "bookshelf";
                            break;
                        case 48:
                            tn = "mossy_cobblestone";
                            break;
                        case 49:
                            tn = "obsidian";
                            break;
                        case 50:
                            tn = "torch";
                            break;
                        case 51:
                            tn = "fire";
                            break;
                        case 52:
                            tn = "mob_spawner";
                            break;
                        case 53:
                            tn = "oak_stairs";
                            break;
                        case 54:
                            tn = "chest";
                            break;
                        case 55:
                            tn = "redstone_wire";
                            break;
                        case 56:
                            tn = "diamond_ore";
                            break;
                        case 57:
                            tn = "diamond_block";
                            break;
                        case 58:
                            tn = "crafting_table";
                            break;
                        case 59:
                            tn = "wheat";
                            break;
                        case 60:
                            tn = "farmland";
                            break;
                        case 61:
                            tn = "furnace";
                            break;
                        case 62:
                            tn = "lit_furnace";
                            break;
                        case 63:
                            tn = "standing_sign";
                            break;
                        case 64:
                            tn = "wooden_door";
                            break;
                        case 65:
                            tn = "ladder";
                            break;
                        case 66:
                            tn = "rail";
                            break;
                        case 67:
                            tn = "stone_stairs";
                            break;
                        case 68:
                            tn = "wall_sign";
                            break;
                        case 69:
                            tn = "lever";
                            break;
                        case 70:
                            tn = "stone_pressure_plate";
                            break;
                        case 71:
                            tn = "iron_door";
                            break;
                        case 72:
                            tn = "wooden_pressure_plate";
                            break;
                        case 73:
                            tn = "redstone_ore";
                            break;
                        case 74:
                            tn = "lit_redstone_ore";
                            break;
                        case 75:
                            tn = "unlit_redstone_torch";
                            break;
                        case 76:
                            tn = "redstone_torch";
                            break;
                        case 77:
                            tn = "stone_button";
                            break;
                        case 78:
                            tn = "snow_layer";
                            break;
                        case 79:
                            tn = "ice";
                            break;
                        case 80:
                            tn = "snow";
                            break;
                        case 81:
                            tn = "cactus";
                            break;
                        case 82:
                            tn = "clay";
                            break;
                        case 83:
                            tn = "reeds";
                            break;
                        case 84:
                            tn = "jukebox";
                            break;
                        case 85:
                            tn = "fence";
                            break;
                        case 86:
                            tn = "pumpkin";
                            break;
                        case 87:
                            tn = "netherrack";
                            break;
                        case 88:
                            tn = "soul_sand";
                            break;
                        case 89:
                            tn = "glowstone";
                            break;
                        case 90:
                            tn = "portal";
                            break;
                        case 91:
                            tn = "lit_pumpkin";
                            break;
                        case 92:
                            tn = "cake";
                            break;
                        case 93:
                            tn = "unpowered_repeater";
                            break;
                        case 94:
                            tn = "powered_repeater";
                            break;
                        case 96:
                            tn = "trapdoor";
                            break;
                        case 97:
                            tn = "monster_egg";
                            break;
                        case 98:
                            tn = "stonebrick";
                            break;
                        case 99:
                            tn = "brown_mushroom_block";
                            break;
                        case 100:
                            tn = "red_mushroom_block";
                            break;
                        case 101:
                            tn = "iron_bars";
                            break;
                        case 102:
                            //tn = "glass_pane";
                            tn = "glass";
                            break;
                        case 103:
                            tn = "melon_block";
                            break;
                        case 104:
                            tn = "pumpkin_stem";
                            break;
                        case 105:
                            tn = "melon_stem";
                            break;
                        case 106:
                            tn = "vine";
                            break;
                        case 107:
                            tn = "fence_gate";
                            break;
                        case 108:
                            tn = "brick_stairs";
                            break;
                        case 109:
                            tn = "stone_brick_stairs";
                            break;
                        case 110:
                            tn = "mycelium";
                            break;
                        case 111:
                            tn = "waterlily";
                            break;
                        case 112:
                            tn = "nether_brick";
                            break;
                        case 113:
                            tn = "nether_brick_fence";
                            break;
                        case 114:
                            tn = "nether_brick_stairs";
                            break;
                        case 115:
                            tn = "nether_wart";
                            break;
                        case 116:
                            tn = "enchanting_table";
                            break;
                        case 117:
                            tn = "brewing_stand";
                            break;
                        case 118:
                            tn = "cauldron";
                            break;
                        case 119:
                            tn = "end_portal";
                            break;
                        case 120:
                            tn = "end_portal_frame";
                            break;
                        case 121:
                            tn = "end_stone";
                            break;
                        case 122:
                            tn = "dragon_egg";
                            break;
                        case 123:
                            tn = "redstone_lamp";
                            break;
                        case 124:
                            tn = "lit_redstone_lamp";
                            break;
                        case 125:
                            tn = "dropper";
                            break;
                        case 126:
                            tn = "activator_rail";
                            break;
                        case 127:
                            tn = "cocoa";
                            break;
                        case 128:
                            tn = "sandstone_stairs";
                            break;
                        case 129:
                            tn = "emerald_ore";
                            break;
                        case 130:
                            tn = "ender_chest";
                            break;
                        case 131:
                            tn = "tripwire_hook";
                            break;
                        case 132:
                            tn = "trip_wire";
                            break;
                        case 133:
                            tn = "emerald_block";
                            break;
                        case 134:
                            tn = "spruce_stairs";
                            break;
                        case 135:
                            tn = "birch_stairs";
                            break;
                        case 136:
                            tn = "jungle_stairs";
                            break;
                        case 137:
                            tn = "command_block";
                            break;
                        case 138:
                            tn = "beacon";
                            break;
                        case 139:
                            tn = "cobblestone_wall";
                            break;
                        case 140:
                            tn = "flower_pot";
                            break;
                        case 141:
                            tn = "carrots";
                            break;
                        case 142:
                            tn = "potatoes";
                            break;
                        case 143:
                            tn = "wooden_button";
                            break;
                        case 144:
                            tn = "skull";
                            break;
                        case 145:
                            tn = "anvil";
                            break;
                        case 146:
                            tn = "trapped_chest";
                            break;
                        case 147:
                            tn = "light_weighted_pressure_plate";
                            break;
                        case 148:
                            tn = "heavy_weighted_pressure_plate";
                            break;
                        case 149:
                            tn = "unpowered_comparator";
                            break;
                        case 150:
                            tn = "powered_comparator";
                            break;
                        case 151:
                            tn = "daylight_detector";
                            break;
                        case 152:
                            tn = "redstone_block";
                            break;
                        case 153:
                            tn = "quartz_ore";
                            break;
                        case 154:
                            tn = "hopper";
                            break;
                        case 155:
                            tn = "quartz_block";
                            break;
                        case 156:
                            tn = "quartz_stairs";
                            break;
                        case 157:
                            tn = "double_wooden_slab";
                            break;
                        case 158:
                            tn = "wooden_slab";
                            break;
                        case 159:
                            tn = "stained_hardened_clay";
                            break;
                        case 160:
                            //tn = "stained_glass_pane";
                            tn = "stained_glass";
                            break;
                        case 161:
                            tn = "leaves2";
                            break;
                        case 162:
                            tn = "log2";
                            break;
                        case 163:
                            tn = "acacia_stairs";
                            break;
                        case 164:
                            tn = "dark_oak_stairs";
                            break;
                        case 165:
                            tn = "slime";
                            break;
                        case 167:
                            tn = "iron_trapdoor";
                            break;
                        case 168:
                            tn = "prismarine";
                            break;
                        case 169:
                            tn = "sealantern";
                            break;
                        case 170:
                            tn = "hay_block";
                            break;
                        case 171:
                            tn = "carpet";
                            break;
                        case 172:
                            tn = "hardened_clay";
                            break;
                        case 173:
                            tn = "coal_block";
                            break;
                        case 174:
                            tn = "packed_ice";
                            break;
                        case 175:
                            tn = "double_plant";
                            break;
                        case 176:
                            tn = "standing_banner";
                            break;
                        case 177:
                            tn = "wall_banner";
                            break;
                        case 178:
                            tn = "daylight_detector_inverted";
                            break;
                        case 179:
                            tn = "red_sandstone";
                            break;
                        case 180:
                            tn = "red_sandstone_stairs";
                            break;
                        case 181:
                            tn = "double_stone_slab2";
                            break;
                        case 182:
                            tn = "stone_slab2";
                            break;
                        case 183:
                            tn = "spruce_fence_gate";
                            break;
                        case 184:
                            tn = "birch_fence_gate";
                            break;
                        case 185:
                            tn = "jungle_fence_gate";
                            break;
                        case 186:
                            tn = "dark_oak_fence_gate";
                            break;
                        case 187:
                            tn = "acacia_fence_gate";
                            break;
                        case 188:
                            tn = "repeating_command_block";
                            break;
                        case 189:
                            tn = "chain_command_block";
                            break;
                        case 190:
                            //tn = "hard_glass_pane";
                            tn = "hard_glass";
                            break;
                        case 191:
                            //tn = "hard_stained_glass_pane";
                            tn = "hard_stained_glass";
                            break;
                        case 192:
                            tn = "chemical_heat";
                            break;
                        case 193:
                            tn = "spruce_door";
                            break;
                        case 194:
                            tn = "birch_door";
                            break;
                        case 195:
                            tn = "jungle_door";
                            break;
                        case 196:
                            tn = "acacia_door";
                            break;
                        case 197:
                            tn = "dark_oak_door";
                            break;
                        case 198:
                            tn = "grass_path";
                            break;
                        case 199:
                            tn = "frame";
                            break;
                        case 200:
                            tn = "chorus_flower";
                            break;
                        case 201:
                            tn = "purpur_block";
                            break;
                        case 202:
                            tn = "colored_torch_rg";
                            break;
                        case 203:
                            tn = "purpur_stairs";
                            break;
                        case 204:
                            tn = "colored_torch_bp";
                            break;
                        case 205:
                            tn = "undyed_shulker_box";
                            break;
                        case 206:
                            tn = "end_bricks";
                            break;
                        case 207:
                            tn = "frosted_ice";
                            break;
                        case 208:
                            tn = "end_rod";
                            break;
                        case 209:
                            tn = "end_gateway";
                            break;
                        case 213:
                            tn = "magma";
                            break;
                        case 214:
                            tn = "nether_wart_block";
                            break;
                        case 215:
                            tn = "red_nether_brick";
                            break;
                        case 216:
                            tn = "bone_block";
                            break;
                        case 218:
                            tn = "shulker_box";
                            break;
                        case 220:
                            tn = "white_glazed_terracotta";
                            break;
                        case 221:
                            tn = "orange_glazed_terracotta";
                            break;
                        case 222:
                            tn = "magenta_glazed_terracotta";
                            break;
                        case 223:
                            tn = "light_blue_glazed_terracotta";
                            break;
                        case 224:
                            tn = "yellow_glazed_terracotta";
                            break;
                        case 225:
                            tn = "lime_glazed_terracotta";
                            break;
                        case 226:
                            tn = "pink_glazed_terracotta";
                            break;
                        case 227:
                            tn = "gray_glazed_terracotta";
                            break;
                        case 228:
                            tn = "silver_glazed_terracotta";
                            break;
                        case 229:
                            tn = "cyan_glazed_terracotta";
                            break;
                        case 219:
                            tn = "purple_glazed_terracotta";
                            break;
                        case 231:
                            tn = "blue_glazed_terracotta";
                            break;
                        case 232:
                            tn = "brown_glazed_terracotta";
                            break;
                        case 233:
                            tn = "green_glazed_terracotta";
                            break;
                        case 234:
                            tn = "red_glazed_terracotta";
                            break;
                        case 235:
                            tn = "black_glazed_terracotta";
                            break;
                        case 236:
                            tn = "concrete";
                            break;
                        case 237:
                            tn = "concretepowder";
                            break;
                        case 238:
                            tn = "chemistry_table";
                            break;
                        case 239:
                            tn = "underwater_torch";
                            break;
                        case 240:
                            tn = "chorus_plant";
                            break;
                        case 241:
                            tn = "stained_glass";
                            break;
                        case 243:
                            tn = "podzol";
                            break;
                        case 244:
                            tn = "beetroot";
                            break;
                        case 245:
                            tn = "stonecutter";
                            break;
                        case 246:
                            tn = "glowingobsidian";
                            break;
                        case 247:
                            tn = "netherreactor";
                            break;
                        case 251:
                            tn = "observer";
                            break;
                        case 252:
                            tn = "structure_block";
                            break;
                        case 253:
                            tn = "hard_glass";
                            break;
                        case 254:
                            tn = "hard_stained_glass";
                            break;
                        case 256:
                            return null;
                        case 257:
                            tn = "prismarine_stairs";
                            break;
                        case 258:
                            tn = "dark_prismarine_stairs";
                            break;
                        case 259:
                            tn = "prismarine_bricks_stairs";
                            break;
                        case 260:
                            tn = "stripped_spruce_log";
                            break;
                        case 261:
                            tn = "stripped_birch_log";
                            break;
                        case 262:
                            tn = "stripped_jungle_log";
                            break;
                        case 263:
                            tn = "stripped_acacia_log";
                            break;
                        case 264:
                            tn = "stripped_dark_oak_log";
                            break;
                        case 265:
                            tn = "stripped_oak_log";
                            break;
                        case 266:
                            tn = "blue_ice";
                            break;
                        case 417:
                            tn = "stone_slab3";
                            break;
                        case 421:
                            tn = "stone_slab4";
                            break;
                        case 463:
                            tn = "lantern";
                            break;
                        default:
                            print("Unknown ID! ID=" + id);
                            return null;
                    }
                    tn = "minecraft:" + tn;
                    return tn;
                }
            }
            function print(str) {
                logger.log("warning", str);
            }

            /*==============================================================================================================*/

            let osmCity = new OSMCity();
            let coordinates = [];

            for (const position of e.state.positions) {
                setblock(position.coordinate.x, position.coordinate.y + 1, position.coordinate.z, "minecraft:wool", 14)
                coordinates.push(new myCoordinate(position.coordinate.x, position.coordinate.z))
                osmCity.setBaseY(position.coordinate.y)
            }

            logger.log("info", "NZ IS JULAO")
            osmCity.Generate(coordinates);

            logger.log("info", "Block generating by client finished.")

            e.state.positions = []

            return blockInstructions
        },
        UIHandler(e) { /* no-op */ },
        onExit(e) { /* no-op */ },
    })

})();