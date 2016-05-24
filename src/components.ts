class ComponentHub {
    private componentKinds: {[kind: string]: ComponentPack[]}
    private componentPacks: Map<ComponentPack, ComponentNode[]>
    private componentMethods: {[method: string]: (Function)[]}
    
    constructor(private hubSpec: {[kind: string]: number}, ...componentSpecs: [new (...args: any[]) => ComponentPack, any[]][]) {
        for (const kind of Object.getOwnPropertyNames(hubSpec)) {
            this.componentKinds[kind] = []
        }
        
        for (const componentSpec of componentSpecs) {
            this.addPack(new componentSpec[0](this, ...componentSpec[1]))
        }
    }
    
    public getNumSlotsOpen(kind: string) {
        return this.hubSpec[kind] - this.componentKinds[kind].length
    }
    
    public hasPack(componentPack: ComponentPack) {
        const kind = componentPack.getKind()
        return _.includes(this.componentKinds[kind], componentPack)
    }
    
    public addPack(componentPack: ComponentPack) {
        const kind = componentPack.getKind()
        if (this.getNumSlotsOpen(kind) > 0) {
            const componentSlots = this.componentKinds[kind]
            const componentNodes = componentPack.getComponents(this)
            
            //insert pack into kinds table
            Utils.sortedInsert(componentSlots, $$$$)
            //insert nodes into packs table
            this.componentPacks.set(componentPack, componentNodes)
            
            const componentMethods = this.componentMethods
            for (const componentNode of componentNodes) {
                const priority = componentNode.getPriority()
                for (const componentMethod of componentNode.getMethodNames()) {
                    
                    //initialize if empty
                    if (componentMethods[componentMethod] == null) {
                        componentMethods[componentMethod] = []
                    }
                    
                    componentMethods[componentMethod].push(_.bind(_.get<Function>(componentNode, componentMethod), componentNode)
                    //FIXME: make this a sorted array. Should it be an array of nodes or of binded functions?
                }
                
                
            }
        }
    }
    
    public removePack(componentPack: ComponentPack) {
        const slots = this.componentKinds[componentPack.getKind()]
        Utils.remove(slots, componentPack)
        this.componentPacks.delete(componentPack)
        // TODO: remove methods from componentMethods
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

class ComponentNode {
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
