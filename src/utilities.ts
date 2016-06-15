const Utils = {
    sortedInsert<T>(element: T, array: T[]) {
        array.splice(_.sortedIndex(array, element), 0, element)
    },
    
    sortedInsertBy<T>(element: T, array: T[], iteratee: any) {
        array.splice(_.sortedIndexBy(array, element, iteratee), 0, element)
    },
    
    remove<T>(element: T, array: T[]) {
        array.splice(_.indexOf(array, element), 1)
    },
    
    sortedRemove<T>(element: T, array: T[]) {
        array.splice(_.sortedIndexOf(array, element), 1)
    }
}