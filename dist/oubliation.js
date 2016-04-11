class ComponentNode {
    constructor(owner, origin, priority) {
        this.owner = owner;
        this.origin = origin;
        this.priority = priority;
    }
    getOwner() {
        return this.owner;
    }
    getOrigin() {
        return this.origin;
    }
    getPriority() {
        return this.priority;
    }
}
class Modifier extends ComponentNode {
    constructor(owner, origin, priority, kind, ...modifiers) {
        super(owner, origin, priority);
        this.kind = kind;
        this.modifiers = modifiers;
    }
    getKind() {
        return this.kind;
    }
    getModifiers() {
        return _.map(this.modifiers[0], (Constructor) => {
            return new Constructor(this.getOwner(), Constructor, ...this.modifiers[1]);
        });
    }
}
function prepNode(LocalNode, ...args) {
    return function (owner) {
        new LocalNode(owner, LocalNode, ...args);
    };
}
class ComponentHub {
    constructor(spec, ...modifiers) {
        this.spec = spec;
        this.count = {};
        this.modifiers = new Map();
        _.forEach(modifiers, this.addModifier);
    }
    hasModifier(modifier) {
        return this.modifiers.has(modifier);
    }
    addModifier(modifier) {
        const kind = modifier.getKind();
        const count = this.count;
        if (this.spec[kind] <= count[kind]) {
            const components = modifier.getModifiers();
            this.modifiers.set(modifier, components);
            for (const component of components) {
                let test = _(component).functions().filter(component.hasOwnProperty).value();
                for (const funcName of _(component).functions().filter(component.hasOwnProperty).value()) {
                    const delegator = this[funcName];
                    if (delegator != null) {
                        delegator.delegates.push(component);
                    }
                }
            }
            count[kind] += 1;
        }
        else {
            throw new Error("added kind of modifier is already full!");
        }
    }
    removeModifier(modifier) {
        const modifiers = this.modifiers;
        const components = modifiers.get(modifier);
        for (const component of components) {
            for (const funcName of _.functions(component).filter(component.hasOwnProperty)) {
                const delegator = this[funcName];
                if (delegator != null) {
                    const delegates = delegator.delegates;
                    _.pullAt(delegates, _.indexOf(delegates, component));
                }
            }
        }
        modifiers.delete(modifier);
        this.count[modifier.getKind()] -= 1;
    }
}
function makeDelegator(name, func) {
    const delegates = [];
    return _.tap(_.partial(func, [delegates, name]), (func) => {
        func.delegates = delegates;
    });
}
function newFlatten(data, methodName, ...args) {
    return _.flatten(_.invokeMap(data, methodName, ...args));
}
function newFirst(data, methodName, ...args) {
    return _.invoke(data[0], methodName, ...args);
}
function newReduce(data, methodName, reduceFunc, ...args) {
    return _.invokeMap(data, methodName, ...args).reduce(reduceFunc);
}
function newReduceRight(data, methodName, reduceFunc, ...args) {
    return _.invokeMap(data, methodName, ...args).reduceRight(reduceFunc);
}
function newEvery(data, methodName, ...args) {
    return data.every(_.method(methodName, ...args));
}
function newSome(data, methodName, ...args) {
    return data.some(_.method(methodName, ...args));
}
function newJoin(data, methodName, separator, ...args) {
    return _.invokeMap(data, methodName, ...args).join(separator);
}
class Thing extends ComponentHub {
    constructor(...args) {
        super(...args);
        this.getModifiers = makeDelegator("getModifiers", newFirst);
        this.getKind = makeDelegator("getKind", newFirst);
    }
}
//# sourceMappingURL=oubliation.js.map