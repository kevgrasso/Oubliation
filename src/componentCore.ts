// OPTOMIZE: collapse Composite & Thing class into singleton with ids mapping to a list of leaves. use _.assign instead of classes & prototypes

type ComponentSpec = [new (...args: any[]) => ComponentLeaf, any[]]

interface ComponentMethodData<T extends Function> {
    method: T;
    priority: number;
}
namespace Components {
    'use strict';

    export function extractMethods<T extends Function>(methodData: ComponentMethodData<T>[]): T[] {
        return _.map<ComponentMethodData<T>, T>(methodData, 'method');
    }
    
    export function insertMethodData<T extends Function>(name: string, componentNodes: ComponentLeaf[], result: ComponentMethodData<T>[]): ComponentMethodData<T>[] {
        if (name !== 'getAllMethodData') {
            let retrieverData = Components.insertMethodData<(name: string, result: ComponentMethodData<T>[]) => ComponentMethodData<T>[]>('getAllMethodData', componentNodes, []);
            for (const retrieverDatum of retrieverData) {
                retrieverDatum.method(name, result);
            }
        }

        for (const componentNode of componentNodes) {
            const method = _.get<ComponentLeaf, T>(componentNode, name);
            if (method != null) {
                const methodData: ComponentMethodData<T> = {
                    method: _.bind<T, T>(method, componentNode),
                    priority: componentNode.getPriority()
                };
                Utils.sortedInsertBy(methodData, result, 'priority');
            }
        }
        return result;
    }
};

abstract class ComponentComposite {
    private componentNodes: ComponentLeaf[];

    constructor(...componentSpecs: ComponentSpec[]) {
        this.componentNodes = _.map<ComponentSpec, ComponentLeaf>(componentSpecs, (componentSpec: [new (...args: any[]) => ComponentLeaf, any[]]): ComponentLeaf => {
            // NOTE: what's wrong with this coloring??
            return new componentSpec[0](this, ...componentSpec[1]);
        });
    }

    public getAllMethodData<T extends Function>(name: string, result: ComponentMethodData<T>[]): ComponentMethodData<T>[] {
        return Components.insertMethodData(name, this.componentNodes, result);
    }

    protected getAllMethods<T extends Function>(name: string): T[] {
        return Components.extractMethods<T>(this.getAllMethodData<T>(name, []));
    }

}

abstract class ComponentLeaf {
    constructor(
        protected owner: Thing,
        private priority: number,
        ...args: any[]  // HACK: get rid of this in later Typescript version if possible
    ) {
        if (args.length !== 0) {
            throw new Error('ComponentNode should not be called with arguments besides owner and priority');
        }
    }

    public getOwner() {
        return this.owner;
    }
    public getPriority() {
        return this.priority;
    }

}
