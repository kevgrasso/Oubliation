
"use strict"

class ComponentHub {
    constructor(private spec: {[kind:string]: number}, ...componentSpecs: [new (...any) => ComponentPack, any[]][]) {
        for (let kind in spec) {
            this.componentKinds[kind] = []
        }
        
        for (let componentSpec of componentSpecs) {
            let args = componentSpec[1].splice(0, 0, this)
            this.addPack(new componentSpec[0](...args))
        }
    }
    
    componentKinds: {[kind: string]: ComponentPack[]}
    componentPacks: Map<ComponentPack, ComponentNode[]>
    componentMethods: {[method: string]: ComponentNode[]}
    
    hasPack(componentPack: ComponentPack) {
        const kind = componentPack.getKind()
        return _.includes(this.componentKinds[kind], componentPack)
    }
    
    addPack(componentPack: ComponentPack) {
        
    }
    
    removePack(componentPack: ComponentPack) {
        
    }
}

class ComponentPack {
    constructor(private kind: string, ...componentSpecs: [new (...any) => ComponentNode, any[]][]) {
        for (let componentSpec of componentSpecs) {
            this.componentSpecs.push({
                class: componentSpec[0],
                args:componentSpec[1]
            })
        }
    }
        componentSpecs: {
            class: new (...any) => ComponentNode
            args: any[]
        }[]
    
    
    getKind() {
        return this.kind
    }
    
    getComponents(owner: ComponentHub) {
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
        ...args: any[]  //get rid of this in later Typescript version if possible
    ) { 
        if (args.length != 0) {
            throw new Error("ComponentNode should not be called with arguments besides owner and priority")
        }
    }
    
    getOwner() {
        return this.owner
    }
    getPriority() {
        return this.priority
    }
 
}
