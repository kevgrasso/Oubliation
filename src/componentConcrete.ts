class Thing extends ComponentComposite implements ComponentInterface {
    public getDescription(): string {
        return _(this.getAllMethods<() => string>('getDescription')).invokeMap(_.attempt).join(' ')
    }
}

class Descriptor extends ComponentLeaf {
    public constructor(owner: ComponentComposite, priority: number, public description: string) {
        super(owner, priority)
    }

    public getDescription() {
        return this.description
    }
}

let test = new Thing([Descriptor, [2, 'World!']], [Descriptor, [1, 'Hello']]) 

alert(test.getDescription())
