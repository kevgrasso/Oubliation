abstract class ComponentMethods {
    public getAllMethodData<T extends Function>(name: string, result: ComponentMethodData<T>[]): ComponentMethodData<T>[] {
        throw new Error('call to unimplemented component method')
    }
    public getDescription(): string {
        throw new Error('call to unimplemented component method')
    }
}

class Thing extends ComponentHub implements ComponentMethods {
    public getDescription(): string {
        return _(this.getAllMethods<() => string>('getDescription')).invokeMap(_.attempt).join(' ')
    }
}

class Descriptor extends ComponentNode {
    public constructor(owner: ComponentHub, priority: number, public description: string) {
        super(owner, priority)
    }

    public getDescription() {
        return this.description
    }
}

let test = new Thing([Descriptor, [2, 'World!']], [Descriptor, [1, 'Hello']]) 

alert(test.getDescription())
