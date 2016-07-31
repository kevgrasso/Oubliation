namespace Utils {
    'use strict';
    
    export function sortedInsert<T>(element: T, array: T[]) {
        array.splice(_.sortedIndex(array, element), 0, element);
    }
    
    export function sortedInsertBy<T>(element: T, array: T[], iteratee: any) {
        array.splice(_.sortedIndexBy(array, element, iteratee), 0, element);
    }
    
    export function remove<T>(element: T, array: T[]) {
        array.splice(_.indexOf(array, element), 1);
    }
    
    export function sortedRemove<T>(element: T, array: T[]) {
        array.splice(_.sortedIndexOf(array, element), 1);
    }
};
