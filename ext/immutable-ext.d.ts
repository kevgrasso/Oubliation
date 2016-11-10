// TODO: make pull request for implementing guard function support for .every & .filter
// also: change their `module` to `namespace`

declare namespace Immutable {
    export interface Iterable<K, V> {
        filter<T extends V>(
            predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => value is T,
            context?: any
        ): /*this*/Iterable<K, T>;
        filter<T extends K>(
            predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => key is T,
            context?: any
        ): /*this*/Iterable<T, V>;

        every<T extends V>(
            predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => value is T,
            context?: any
        ): this is Collection<K, T>;
        every<T extends K>(
            predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => key is T,
            context?: any
        ): this is Collection<T, V>;
    }
}