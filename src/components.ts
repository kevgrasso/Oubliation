//TODO: TypeScript 1.8: use metagenerics to describe reduce functions
//use this type & new.target to describe constructor functions

interface ComponentSignature { }  //todo: refactor out ComponentSignature

class ComponentNode implements ComponentSignature {
    constructor(private owner: ComponentHub, private origin: new (...any: any[]) => ComponentNode, private priority: number) { }
    getOwner() {
        return this.owner
    }
    getOrigin() {
        return this.origin
    }
    getPriority() {
        return this.priority
    }
    
}

type PrototypeNode<T extends ComponentNode> = (owner: ComponentHub) => T

interface GetModifiers extends ComponentSignature {
    getKind(): string
    getModifiers(): ComponentNode[]
}

//this is all wrong somehow
class Modifier extends ComponentNode implements GetModifiers {
    constructor(owner: ComponentHub, origin: typeof Modifier, priority: number, private kind: string, ...modifiers: [(new (...any: any[]) => ComponentNode), any[]][]) { //needs to know what args each function should recieve
        super(owner, origin, priority)
        this.modifiers = modifiers
    }
    private modifiers: [(new (...any: any[]) => ComponentNode), any[]][]

    getKind() {
        return this.kind
    }

    getModifiers() {
        return _.map(this.modifiers[0], (Constructor: (new (...any: any[]) => ComponentNode)) => {
            return new Constructor(this.getOwner(), Constructor, ...this.modifiers[1])
        })
    }
}

function prepNode<T extends ComponentNode>(LocalNode: new (...any: any[]) => T, ...args: any[]) {
    return function (owner: ComponentHub) {
        new LocalNode(owner, LocalNode, ...args)
    }
}

class ComponentHub {
    constructor(private spec: { [kind: string]: number }, ...modifiers: GetModifiers[]) {
        this.count = {}
        this.modifiers = new Map<GetModifiers, ComponentNode[]>()
        _.forEach(modifiers, this.addModifier)
    }

    private count: { [kind: string]: number }
    private modifiers: Map<GetModifiers, ComponentNode[]>


    //todo: refactor to have appropriate variable names
    hasModifier(modifier: GetModifiers): boolean {
        return this.modifiers.has(modifier)
    }
    addModifier(modifier: GetModifiers): void {
        const kind = modifier.getKind()
        const count = this.count
        if (this.spec[kind] <= count[kind]) {
            const components = modifier.getModifiers()
            this.modifiers.set(modifier, components)
            for (const component of components) {
                let test = _(component).functions().filter(component.hasOwnProperty).value()
                for (const funcName of _(component).functions().filter(component.hasOwnProperty).value()) {
                    const delegator: Delegator<any, ComponentNode> = (<any>this)[funcName]
                    if (delegator != null) {
                        delegator.delegates.push(component)
                    }
                }
            }
            count[kind] += 1
        } else {
            throw new Error("added kind of modifier is already full!")
        }
    }
    removeModifier(modifier: GetModifiers): void {
        const modifiers = this.modifiers
        const components = modifiers.get(modifier)
        for (const component of components) {
            for (const funcName of _.functions(component).filter(component.hasOwnProperty)) {
                const delegator: Delegator<any, ComponentNode> = (<any>this)[funcName]
                if (delegator != null) {
                    const delegates = delegator.delegates
                    _.pullAt(delegates, _.indexOf(delegates, component))
                }
            }
        }
        modifiers.delete(modifier)
        this.count[modifier.getKind()] -= 1
    }
}

interface DelegatorContainer<T extends ComponentSignature> {
    delegates: T[]
}

type Delegator<F extends (...any: any[]) => any, T extends ComponentSignature> = F & DelegatorContainer<T>

function makeDelegator<F extends (...any: any[]) => any, T extends ComponentSignature, R>(name: string, func: F): Delegator<(...any: any[]) => R, T> {
    const delegates: T[] = []
    return _.tap(_.partial(func, [delegates, name]), (func: any) => {
        func.delegates = delegates
    })
}

type ReduceCallback<T> = (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T

//todo: better names, make generic definitions more consistent & readable
//todo: more function, make pure lodash functions

//add more of these
//newSum, newMax, newMin, newRange, newConcat, newFlow, newFlowRight
function newFlatten<T extends ComponentNode, R>(data: T[], methodName: string, ...args: any[]): R[] {
    return _.flatten<R>(_.invokeMap<T>(data, methodName, ...args))
}

function newFirst<T extends ComponentNode, R>(data: T[], methodName: string, ...args: any[]): R {
    return _.invoke(data[0], methodName, ...args)
}

function newReduce<T extends ComponentNode, R>(data: T[], methodName: string, reduceFunc: ReduceCallback<R>, ...args: any[]): R {
    return _.invokeMap<T>(data, methodName, ...args).reduce(reduceFunc)
}

function newReduceRight<T extends ComponentNode, R>(data: T[], methodName: string, reduceFunc: ReduceCallback<R>, ...args: any[]): R {
    return _.invokeMap<T>(data, methodName, ...args).reduceRight(reduceFunc)
}

function newEvery<T extends ComponentNode>(data: T[], methodName: string, ...args: any[]) {
    return data.every(_.method<T, boolean>(methodName, ...args))
}

function newSome<T extends ComponentNode>(data: T[], methodName: string, ...args: any[]) {
    return data.some(_.method<T, boolean>(methodName, ...args))
}

function newJoin<E extends ComponentNode>(data: E[], methodName: string, separator: string, ...args: any[]) {
    return (<string[]>_.invokeMap<E>(data, methodName, ...args)).join(separator)
}

//todo: refactor: functions w/ origin and priority attached directly
class Thing extends ComponentHub implements GetModifiers {
    getModifiers: Delegator<() => ComponentNode[], GetModifiers> = makeDelegator<typeof newFirst, GetModifiers, ComponentNode[]>("getModifiers", newFirst)
    getKind: Delegator<() => string, GetModifiers> = makeDelegator<typeof newFirst, GetModifiers, string>("getKind", newFirst)
}

//ComponentHub constructor must construct all components with itself as owner
//let thing = new Thing({test: 2}, new Modifier(thing, Modifier, 0, "test", [Modifier, []]))



//test for typescript 1.8

//function prepNode2<T extends ComponentNode>(LocalNode: new (...any) => T, ...args): new (owner: ComponentHub) => T {
//    function newNode<this extends T > (owner: ComponentHub) {
//        LocalNode.call(this, owner, LocalNode, ...args)
//    }
//    newNode.prototype = LocalNode.prototype

//    return newNode
//}