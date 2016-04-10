
//for lodash.d.ts

    //_.invoke
    interface LoDashStatic {
        /**
        * Invokes the method named by methodName on each element in the collection returning
        * an array of the results of each invoked method. Additional arguments will be provided
        * to each invoked method. If methodName is a function it will be invoked for, and this
        * bound to, each element in the collection.
        * @param object The object to query.
        * @param methodName The path of the method to invoke.
        * @param args Arguments to invoke the method with.
        **/
        invoke<TObject extends {}, TResult>(
            object: TObject,
            path: string|string[],
            ...args: any[]): TResult;
            
        /**
        * @see _.invoke
        **/
        invoke<TResult>(
            object: {},
            path: string|string[],
            ...args: any[]): TResult;
    }
    
    interface LoDashImplicitWrapper<T> {
        /**
        * @see _.invoke
        **/
        invoke<TResult>(
            path: string|string[],
            ...args: any[]): LoDashImplicitWrapper<TResult>;
    }
    
    interface LoDashExplicitWrapper<T> {
        /**
        * @see _.invoke
        **/
        invoke<TResult>(
            path: string|string[],
            ...args: any[]): LoDashExplicitWrapper<TResult>;
    }