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
    hasUser(id) {
        return this._users.has(id);
    }
    getUser(id) {
        if(!this.hasUser(id)) {
            throw new Error(`unknown playid: ${id}
users: system: ${[...this._users.entries()]}`);
        }
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
        this._ids.set(user, id);
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
    registerCanonicalGenerator(o) {
        this.registerGenerator(canonicalGeneratorFactory(o));
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
    useItem(data) {
        let gen = this._generators[this._generatorIndex];
        gen.onItemUsed && gen.onItemUsed({
            state: this._generatorStates[this._generatorIndex],
            data,
            runtime: this._createRuntime(gen),
        })
    }
    isValidParameter() {
        let gen = this._generators[this._generatorIndex];
        if(!gen.isValidParameter) return true;
        return gen.isValidParameter({
            state: this._generatorStates[this._generatorIndex],
            runtime: this._createRuntime(gen),
        })
    }
    generate() {
        let gen = this._generators[this._generatorIndex];
        return gen.generate({
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
    UIHandler(data) {
        let gen = this._generators[this._generatorIndex];
        gen.UIHandler({
            data,
            state: this._generatorStates[this._generatorIndex],
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
    getCurrentUI() {
        return this._generators[this._generatorIndex].ui;
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

export function canonicalGeneratorFactory({
    description,
    criteria: {
        positionArrayLength,
        blockTypeArrayLength,
        directionArrayLength
    },
    option,
    method: {
        generate, postGenerate, UIHandler
    }
}) {
    function onAdd(type, arrayname) {
        return function (e) {
            let { state, runtime } = e
            let { logger } = runtime;
            let data = e[type]
            let array = state[arrayname]
            let indexOfVacancy = array.indexOf(undefined)
            if (indexOfVacancy !== -1) {
                array[indexOfVacancy] = data
                logger && logger.log("info", `New ${type} accepted.`);
            } else {
                logger && logger.log("warning", `Too many ${type}s!New one is ignored`);
            }
        };
    }
    function onRemove(type, arrayname) {
        return function (e) {
            let { state, index, runtime } = e
            let { logger } = runtime;
            let array = state[arrayname];
            if (index === undefined) {
			    for (index = array.length - 1;
                     index >= 0 && array[index] == undefined;
                     index--);
            }
            if (index >= 0) array[index] = undefined;
            logger && logger.logObject("info", array)
        };
    }
    function createGenerate(generate, postGenerate) {
        return async function (e) {
            let result = await generate(e);
            await postGenerate(e);
            return result;
        };
    }
    function defaultPostGenerate(e) {
        let {state} = e;
        state.positions.fill(undefined);
        state.blockTypes.fill(undefined);
        state.directions.fill(undefined);
    }
    function defaultIsValidParameter(e) {
        let { state, runtime } = e;
        let result = "";
        if (state.blockTypes.indexOf(undefined) != -1)
            result += "Too few blockTypes!Refusing to execute.\n"
        if (state.positions.indexOf(undefined) != -1)
            result += "Too few positions!Refusing to execute.\n"
        if (state.directions.indexOf(undefined) != -1)
            result += "Too few directions!Refusing to execute."
        if (result == "") return true;
        let { logger } = runtime;
        if(logger) logger.log("error", result);
        return false;
    }
    return {
        name: description.name,
        ui: description.usage.optionUsage,
        onInit(e) {
            let {state} = e
            for(let p in option) {
                state[p] = option[p]
            }
            state.positions = (new Array(positionArrayLength)).fill(undefined)
            state.blockTypes = (new Array(blockTypeArrayLength)).fill(undefined)
            state.directions = (new Array(directionArrayLength)).fill(undefined)
        },
        onAddPosition: onAdd("position", "positions"),
        onAddBlockType: onAdd("blockType", "blockTypes"),
        onAddDirection: onAdd("direction", "directions"),
        onRemovePoistion: onRemove("position", "positions"),
        onRemoveBlockType: onRemove("blockType", "blockTypes"),
        onRemoveDirection: onRemove("direction", "directions"),
        isValidParameter: defaultIsValidParameter,
        generate: createGenerate(generate, postGenerate || defaultPostGenerate),
        UIHandler,
        onExit(e) { /* no-op */ },
    }
}
