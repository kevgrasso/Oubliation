// TODO: consider ComponentModule class
// TODO: store binded methods and nodes together

// experiment; don't use
class ComponentModule<T extends Function> {
    public fire: T
    protected uniqMethods: T[]
    private methods: T[]
    
    // HACK: in 2.0, use specified this types so fire method can be described in constructor call & subclassing is not required
    // HACK: in 2.1, use vararg types to describe fire method
    constructor() {
        this.methods = []
        this.uniqMethods = []
    }
    
    public add(componentNode: ComponentNode, method: T) {
        if (!_.includes<T>(componentNode, method)) {
            throw new Error(`Function ${method} not found in ComponentNode ${componentNode}`)
        }
        
        // NOTE: doesn't guarantee uniqueness, has no order
        Utils.sortedInsert(this.methods, method)
        this.uniqMethods = _.sortedUniq(this.methods)
        
    }
    
    public remove(componentNode: ComponentNode, method: T) {
        if (!_.includes<T>(componentNode, method)) {
            throw new Error(`Function ${method} not found in ComponentNode ${componentNode}`)
        }
        
        Utils.remove(this.methods, method)
        this.uniqMethods = _.sortedUniq(this.methods)
    }
}

class SubModule extends ComponentModule<() => void> {
    public fire: ( () => void ) = () => {
        // fdsa
    }
}

class ComponentHub {
    private componentKinds: {[kind: string]: Set<ComponentPack>}
    private componentPacks: Map<ComponentPack, ComponentNode[]>
    private componentMethods: {[method: string]: (ComponentNode)[]}
    
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
                    
                    // initialize if empty
                    if (componentMethods[componentMethod] == null) {
                        componentMethods[componentMethod] = []
                    }
                    
                    Utils.sortedInsertBy(componentMethods[componentMethod], componentNode, _.method('getPriority'))
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
                Utils.remove(componentMethods[componentMethod], componentNode)
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
        const blacklist = ['']
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
