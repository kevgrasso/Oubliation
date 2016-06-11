// TODO: consider ComponentModule class
// TODO: store binded methods and nodes together

interface ComponentMethodData<T extends Function> {
       origin: ComponentNode
       source: T
       method: T
       priority: number
} 

class ComponentMethodModule<T extends Function> {
    public fire: T
    protected methods: T[]
    private methodData: ComponentMethodData<T>[]
    
    // HACK: in 2.0, use specified this types so fire method can be described in constructor call & subclassing is not required
    // HACK: in 2.1, use vararg types to describe fire method
    constructor() {
        this.methodData = []
        this.methods = []
    }
    
    public add(componentNode: ComponentNode, method: T) {
        if (!_.includes<T>(Object.values(componentNode), method)) {
            throw new Error(`Function ${method} not found in ComponentNode ${componentNode}`)
        }
        
        let entry = {
            origin: componentNode,
            source: method,
            method: _.bind<T, T>(method, componentNode),
            priority: componentNode.getPriority()
        }
        
        // NOTE: does not guarantee uniqueness
        Utils.sortedInsertBy(this.methodData, entry, 'priority')
        this.methods = _.map<ComponentMethodData<T>, T>(this.methodData, 'method')
        
    }
    
    public remove(componentNode: ComponentNode, method: T) {
        if (!_.includes<T>(Object.values(componentNode), method)) {
            throw new Error(`Function ${method} not found in ComponentNode ${componentNode}`)
        }
        let result = _.remove(this.methodData, (data: ComponentMethodData<T>) => {
            return data.origin === componentNode && data.source === method
        })
        
        if (result.length === 0) {
            throw new Error(`Function ${method} of ComponentNode ${componentNode} not found in module`)
        }
        this.methods = _.map<ComponentMethodData<T>, T>(this.methodData, 'method')
    }
}

class TestModule extends ComponentMethodModule<() => void> {
    public fire: ( () => void ) = () => {
        // ONLY FOR TESTING
        return this.methods
    }
}

class ComponentHub {
    private componentKinds: {[kind: string]: Set<ComponentPack>}
    private componentPacks: Map<ComponentPack, ComponentNode[]>
    private componentMethods: {[method: string]: ComponentMethodModule<Function>}
    
    constructor(private hubSpec: {[kind: string]: number}, ...componentSpecs: [new (...args: any[]) => ComponentPack, any[]][]) {
        for (const kind of Object.getOwnPropertyNames(hubSpec)) {
            this.componentKinds[kind] = new Set<ComponentPack>()
        }
        
        for (const componentSpec of componentSpecs) {
            this.addPack(new componentSpec[0](this, ...componentSpec[1]))
        }
    }
    
    public getNumSlotsOpen(kind: string) {
        return this.hubSpec[kind] - this.componentKinds[kind].size
    }
    
    public hasPack(componentPack: ComponentPack) {
        const kind = componentPack.getKind()
        return this.componentKinds[kind].has(componentPack)
    }
    
    public addPack(componentPack: ComponentPack) {
        const kind = componentPack.getKind()
        if (this.getNumSlotsOpen(kind) > 0) {
            const componentNodes = componentPack.getComponents(this)
            
            // insert pack into kinds table
            this.componentKinds[kind].add(componentPack)
            // insert nodes into packs table
            this.componentPacks.set(componentPack, componentNodes)
            
            const componentMethods = this.componentMethods
            for (const componentNode of componentNodes) {
                const priority = componentNode.getPriority()
                for (const componentMethod of componentNode.getMethodNames()) {
                    
                    // TODO: handle nulls properly
                    
                    componentMethods[componentMethod].add(componentNode, _.get<Function>(componentNode, 'getPriority'))
                    // NOTE: doesn't guarantee uniqueness
                }
                
                
            }
        }
    }
    
    public removePack(componentPack: ComponentPack) {
        this.componentKinds[componentPack.getKind()].delete(componentPack)
        this.componentPacks.delete(componentPack)
        
        const componentNodes = componentPack.getComponents(this)
        const componentMethods = this.componentMethods
        for (const componentNode of componentNodes) {
            const priority = componentNode.getPriority()
            for (const componentMethod of componentNode.getMethodNames()) {
                componentMethods[componentMethod].remove(componentNode, _.get<Function>(componentNode, 'getPriority'))
            }
        }
    }
}

type ComponentSpec = {
    class: new (...args: any[]) => ComponentNode
    args: any[]
}

class ComponentPack {
    private componentSpecs: {
        class: new (...args: any[]) => ComponentNode
        args: any[]
    }[]
        
    constructor(private kind: string, ...componentSpecs: ComponentSpec[]) {
        this.componentSpecs = componentSpecs
    }
    
    public getKind() {
        return this.kind
    }
    
    public getComponents(owner: ComponentHub): ComponentNode[] {
        return _.map(this.componentSpecs, (componentSpec: ComponentSpec) => {
            return new componentSpec.class(owner, ...componentSpec.args)
        })
    }
}

abstract class ComponentNode {
    constructor(
        private owner: ComponentHub,
        private priority: number,
        ...args: any[]  // HACK: get rid of this in later Typescript version if possible
    ) {
        if (args.length !== 0) {
            throw new Error('ComponentNode should not be called with arguments besides owner and priority')
        }
    }
    
    public getMethodNames() {
        const blacklist: string[] = []
        return _.difference(
            _.union(
                _.functionsIn(this),
                _.functionsIn(ComponentHub.prototype)
            ),
            blacklist
        )
    }
    
    public getOwner() {
        return this.owner
    }
    public getPriority() {
        return this.priority
    }

}
