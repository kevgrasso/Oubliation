type ComponentSpec = [new (...args: any[]) => ComponentNode, any[]]

interface ComponentMethodData<T extends Function> {
    method: T
    priority: number
}
const Components = {
    extractMethods<T extends Function>(methodData: ComponentMethodData<T>[]): T[] {
        return _.map<ComponentMethodData<T>, T>(methodData, 'method')
    },
    
    insertMethodData<T extends Function>(name: string, componentNodes: ComponentNode[], result: ComponentMethodData<T>[]): ComponentMethodData<T>[] {
        for (const componentNode of componentNodes) {
            const method = _.get<ComponentNode, T>(componentNode, name)
            // only insert retrieved methods that aren't the invalid defaults 
            if (method !== _.get<ComponentMethods, T>(ComponentMethods.prototype, name)) { 
                const methodData: ComponentMethodData<T> = {
                    method: _.bind<T, T>(method, componentNode),
                    priority: componentNode.getPriority()
                }
                Utils.sortedInsertBy(methodData, result, 'priority')
            }
        }
        return result
    }
}

abstract class ComponentHub {
    private componentNodes: ComponentNode[]

    constructor(...componentSpecs: ComponentSpec[]) {
        this.componentNodes = _.map<ComponentSpec, ComponentNode>(componentSpecs, (componentSpec: [new (...args: any[]) => ComponentNode, any[]]): ComponentNode => {
            // what's wrong with this coloring??
            return new componentSpec[0](this, ...componentSpec[1])
        })
    }

    public getAllMethodData<T extends Function>(name: string, result: ComponentMethodData<T>[]): ComponentMethodData<T>[] {
        return this.getDirectMethodData<T>(name, this.getIndirectMethodData<T>(name, []))
    }

    protected getAllMethods<T extends Function>(name: string): T[] {
        return Components.extractMethods<T>(this.getAllMethodData<T>(name, []))
    }

    private getDirectMethodData<T extends Function>(name: string, result: ComponentMethodData<T>[]): ComponentMethodData<T>[] {
        return Components.insertMethodData(name, this.componentNodes, result)
    }

    private getIndirectMethodData<T extends Function>(name: string, result: ComponentMethodData<T>[]): ComponentMethodData<T>[] {
        for (const retrieverData of this.getDirectMethodData<(name: string, result: ComponentMethodData<T>[]) => ComponentMethodData<T>[]>('getIndirectMethodData', [])) {
            retrieverData.method(name, result)
        }
        return result
    }

}

abstract class ComponentNode extends ComponentMethods {
    constructor(
        private owner: ComponentHub,
        private priority: number,
        ...args: any[]  // HACK: get rid of this in later Typescript version if possible
    ) {
        super()
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
