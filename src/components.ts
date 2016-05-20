
'use strict'

class ComponentHub {
    private componentKinds: {[kind: string]: ComponentPack[]}
    private componentPacks: Map<ComponentPack, ComponentNode[]>
    private componentMethods: {[method: string]: ComponentNode[]}
    
    constructor(private spec: {[kind: string]: number}, ...componentSpecs: [new (...args: any[]) => ComponentPack, any[]][]) {
        for (let kind of Object.getOwnPropertyNames(spec)) {
            this.componentKinds[kind] = []
        }
        
        for (let componentSpec of componentSpecs) {
            let args = componentSpec[1].splice(0, 0, this)
            this.addPack(new componentSpec[0](...args))
        }
    }
    
    public hasPack(componentPack: ComponentPack) {
        const kind = componentPack.getKind()
        return _.includes(this.componentKinds[kind], componentPack)
    }
    
    public addPack(componentPack: ComponentPack) {
        // TODO
    }
    
    public removePack(componentPack: ComponentPack) {
        // TODO
    }
}

class ComponentPack {
        private componentSpecs: {
            class: new (...args: any[]) => ComponentNode
            args: any[]
        }[]
        
    constructor(private kind: string, ...componentSpecs: [new (...args: any[]) => ComponentNode, any[]][]) {
        for (let componentSpec of componentSpecs) {
            this.componentSpecs.push({
                class: componentSpec[0],
                args: componentSpec[1]
            })
        }
    }
    
    public getKind() {
        return this.kind
    }
    
    public getComponents(owner: ComponentHub) {
        return _.map(this.componentSpecs, (componentSpec) => {
            let args = componentSpec.args.splice(0, 0, ComponentHub)
            return new componentSpec.class(...args)
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
    
    public getOwner() {
        return this.owner
    }
    public getPriority() {
        return this.priority
    }

}
