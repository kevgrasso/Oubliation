abstract class ComponentInterface {
    public getAllMethodData<T extends Function>(name: string, result: ComponentMethodData<T>[]): ComponentMethodData<T>[] {
        throw new Error('call to unimplemented component method')
    }
    public getDescription(): string {
        throw new Error('call to unimplemented component method')
    }
}
