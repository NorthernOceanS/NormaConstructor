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
        this._users = new Map();
        this._ids = new Map();
    }
    /*
    ** Following functions are used by platform.
    ** If you are a generator developer,
    ** please don't rely on these functions.
    */
    inject(platform) {
        this._platform = platform;
    }
    createUser(id) {
        return new UserSystem(this, id);
    }
    getUser(id) {
        return this._users.get(id);
    }
    _getID(user) {
        return this._ids.get(user);
    }
    /*
    ** Following functions are used by users,
    ** If you are a generator developer,
    ** please don't rely on these functions.
    */
    addUser(id, user) {
        this._users.set(id, user);
        this._ids.set(user, user);
    }
    removeUser(user) {
        let id = this._ids.get(user);
        this._users.delete(id);
        this._ids.delete(user);
    }
    getGenerators() {
        return Array.from(this._generators);
    }
    createRuntime(auth) {
        let runtime = this._platform.createRuntime(this._getID(auth.user));
        return runtime;
    }
    /*
    ** Following functions are register API of system.
    */
    registerGenerator(generator) {
        this._generators.push(generator);
    }
}

export class UserSystem {
    constructor(system, id) {
        this._system = system;
        this.session = {};
        this._system.addUser(id, this);
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
    nextGenerator() {
        this._generatorIndex++;
        this._generatorIndex %= this._generators.length;
    }
    perviousGenerator() {
        this._generatorIndex--;
        this._generatorIndex += this._generators.length;
        this._generatorIndex %= this._generators.length;
    }
    addPosition(position) {
        let gen = this._generators[this._generatorIndex];
        gen.onAddPosition({
            state: this._generatorStates[this._generatorIndex],
            position,
            runtime: this._createRuntime(gen),
        })
    }
    addBlockType(blockType) {
        let gen = this._generators[this._generatorIndex];
        gen.onAddBlockType({
            state: this._generatorStates[this._generatorIndex],
            blockType,
            runtime: this._createRuntime(gen),
        })
    }
    addDirection(direction) {
        let gen = this._generators[this._generatorIndex];
        gen.onAddDirection({
            state: this._generatorStates[this._generatorIndex],
            direction,
            runtime: this._createRuntime(gen),
        })
    }
    removePosition(index) {
        let gen = this._generators[this._generatorIndex];
        gen.onRemovePosition({
            state: this._generatorStates[this._generatorIndex],
            index,
            runtime: this._createRuntime(gen),
        })
    }
    removeBlockType(index) {
        let gen = this._generators[this._generatorIndex];
        gen.onRemoveBlockType({
            state: this._generatorStates[this._generatorIndex],
            index,
            runtime: this._createRuntime(gen),
        })
    }
    generate() {
        let gen = this._generators[this._generatorIndex];
        gen.generate({
            state: this._generatorStates[this._generatorIndex],
            runtime: this._createRuntime(gen),
        })
    }
    removeDirection(index) {
        let gen = this._generators[this._generatorIndex];
        gen.onRemoveDirection({
            state: this._generatorStates[this._generatorIndex],
            index,
            runtime: this._createRuntime(gen),
        })
    }
    exit() {
        for(let i = 0; i < this._generatorStates.length; ++i) {
            this._generators[i].onExit({
                state: this._generatorStates[i],
                runtime: this._createRuntime(this._generators[i]),
            });
        }
        this._system.removeUser(this);
    }
    getCurrentGeneratorName() {
        return this._generators[this._generatorIndex].name;
    }
    getCurrentState() {
        return this._generatorStates[this._generatorIndex];
    }
    _createGeneratorBasicE(index) {
        return {
            state: this._generatorStates[index],
            runtime: this._generatorIndex(this._generators[index]),
        }
    }
    _createRuntime(plugin) {
        return this._system.createRuntime({
            user: this,
            plugin,
        })
    }
}
