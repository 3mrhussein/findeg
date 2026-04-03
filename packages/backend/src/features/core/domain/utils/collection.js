/**
 * Ensures the input is always an array.
 */
export function asArray(val) {
    if (val === null || val === undefined)
        return [];
    return Array.isArray(val) ? val : [val];
}
/**
 * Deduplicates an array based on a key selector function.
 */
export function uniqueBy(arr, fn) {
    const seen = new Set();
    return arr.filter((item) => {
        const key = fn(item);
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
/**
 * Groups an array of objects by a key selector function.
 */
export function groupBy(arr, fn) {
    return arr.reduce((acc, item) => {
        const key = fn(item);
        if (!acc[key])
            acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});
}
