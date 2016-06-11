const Utils = {
    sortedInsert<T>(array: T[], element: T) {
        array.splice(_.sortedIndex(array, element), 0, element)
    },
    
    sortedInsertBy<T>(array: T[], element: T, iteratee: any) {
        array.splice(_.sortedIndexBy(array, element, iteratee), 0, element)
    },
    
    remove<T>(array: T[], element: T) {
        array.splice(_.indexOf(array, element), 1)
    },
    
    sortedRemove<T>(array: T[], element: T) {
        array.splice(_.sortedIndexOf(array, element), 1)
    }
}