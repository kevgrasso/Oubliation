
// TODO: alongside refactoring of ComponentCore: (leaves can implement this)
//

// interface MethodSource {
//     target?: ComponentLeaf[]; // assigned via _.create for optomization, combin
//     getAllMethods<T extends Function>(name: string): T;

// }

// namespace Methods { // can we use namespaces for this?? then we could make it an abstract class
//     'use strict';
//     export abstract class GetDescription implements MethodSource {
//         // TODO: 2.0 use private constructor
//         constructor() {
//             throw new Error('Component method classes should not be invoked directly');
//         }

//         public getDescription() {
//             const self = this.getDescription;

//             const funcArray = this.getAllMethods<typeof self>('getDescription');
//             return _(funcArray).invokeMap(_.call, null).join(' ').valueOf();
//         }
//     }
// };

// type ComponentMethodCalls = Methods.GetDescription & MethodSource 

// const Messaging: {[id: number]: MethodSource} = {
//     all: {
//         // mass messaging functions go here
//     }
// };


class Thing extends ComponentComposite {
    public getDescription() {
        return _(this.getAllMethods<() => string>('getDescription')).invokeMap(_.call, null).join(' ').valueOf();
    }

    public getMaxHealth() {
        return _(this.getAllMethods<() => number>('getMaxHealth')).invokeMap(_.call, null).sum().valueOf();
    }

    public setStatus(StatusClass: typeof Status) {
        return _.flow<(status: typeof Status) => typeof Status>(...this.getAllMethods<(status: typeof Status) => typeof Status>('setStatus'))(StatusClass);
    }

    public getLevel() {
        return _.first(this.getAllMethods<() => number>('getLevel'))();
    }

    public getExperience() {
        return _.first(this.getAllMethods<() => number>('getExperience'))();
    }
}

class Descriptor extends ComponentLeaf {
    public constructor(owner: Thing, priority: number, public description: string) {
        super(owner, priority);
    }

    public getDescription() {
        return this.description;
    }
}

let test = new Thing([Descriptor, [2, 'World!']], [Descriptor, [1, 'Hello']]);

console.log(test.getDescription());
