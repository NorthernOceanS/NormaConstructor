/*
** This file may be separated as a npm package in future,
** but currently it isn't.
*/

export const emptyPlatform = {
    use() { /* no-op */ }
}

export class System {
    constructor() {
        this._platform = null;
        this._generators = [];
    }
    /*
    ** Following functions are used by platform.
    ** If you are a generator developer,
    ** please don't rely on these functions.
    */
    inject(platform) {
        this._platform = platform;
    }
    /*
    ** Following functions are used by users,
    ** If you are a generator developer,
    ** please don't rely on these functions.
    */
    addUser(user) {
        // no-op
    }
    removeUser(user) {
        // no-op
    }
    getGenerators() {
        return Array.from(this._generators);
    }
    createRuntime(auth) {
        let runtime = Object.assign({},this._platform);
        runtime.user = undefined;
    }
    /*
    ** Following functions are register API of system.
    */
    registerGenerator(generator) {
        this._generators.push(generator);
    }
}

export class UserSystem {
    constructor(system) {
        this._system = system;
        this._system.addUser(this);
        this._generators = system.getGenerators();
        this._generatorStates = Array(this._generators.length);
        for(let i = 0; i < this._generatorStates.length; ++i) {
            this._generatorStates[i] = {};
        }
        for(let i = 0; i < this._generatorStates.length; ++i) {
            this._generators[i].onInit({
                state: this._generatorStates[i],
                runtime: this._createRuntime(this._generators[i]),
            });
        }
        this._generatorIndex = 0;
    }
    function nextGenerator() {
        this._generatorIndex++;
    }
    function perviousGenerator() {
        this._generatorIndex++;
    }
    function addPosition(position) {
        let gen = this._generators[this._generatorIndex];
        gen.onAddPosition({
            position,
            runtime: this._createRuntime(gen),
        })
    }
    function addBlockType(blockType) {
        let gen = this._generators[this._generatorIndex];
        gen.onAddBlockType({
            blockType,
            runtime: this._createRuntime(gen),
        })
    }
    function addDirection(direction) {
        let gen = this._generators[this._generatorIndex];
        gen.onAddDirection({
            direction,
            runtime: this._createRuntime(gen),
        })
    }
    function removePosition(index) {
        let gen = this._generators[this._generatorIndex];
        gen.onRemovePosition({
            index,
            runtime: this._createRuntime(gen),
        })
    }
    function removeBlockType(index) {
        let gen = this._generators[this._generatorIndex];
        gen.onRemoveBlockType({
            index,
            runtime: this._createRuntime(gen),
        })
    }
    function removeDirection(index) {
        let gen = this._generators[this._generatorIndex];
        gen.onRemoveDirection({
            index,
            runtime: this._createRuntime(gen),
        })
    }
    function exit() {
        for(let i = 0; i < this._generatorStates.length; ++i) {
            this._generators[i].onExit({
                state: this._generatorStates[i],
                runtime: this._createRuntime(this._generators[i]),
            });
        }
        this._system.removeUser(this);
    }
    function _createRuntime(plugin) {
        return this._system.createRuntime({
            user: this,
            plugin,
        })
    }
}
