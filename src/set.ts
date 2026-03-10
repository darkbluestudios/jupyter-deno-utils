/**
 * Utilities / Functional methods for manipulating JavaScript sets.
 *
 * * Add Values
 *   * {@link add} - add specific values to a set
 *   * {@link union} - combine two arrays
 * * common values
 *   * {@link intersection} - items in both of the lists
 * * Remove values
 *   * {@link remove} - remove specific values from set and return set
 *   * {@link difference} - remove set values from another
 * * unique
 *   * new Set([ ...utils.set.difference(setA, setB), ...utils.set.difference(setB, setA)])
 *
 * Note that the EcmaScript is catching up and union, difference, etc. will be supported soon.
 *
 * However, this library removes a value and returns the set - which can be very helpful for functional programming.
 */

type SetOrIterable<T> = Set<T> | Iterable<T>;

/**
 * Mutably Adds all the values from a target into a set. (Allowing Chaining)
 *
 * (If you wish to union immutably, use ES6: `new Set([...setA, ...setB])`)
 *
 * **Note**: this works with Arrays and other things iterable
 *
 * @param setTarget - set to add values to
 * @param iteratable - iterable that can be unioned into the set
 * @param rest - additional iterables to add to the union
 * @returns new set that contains values from all sources
 * @example
 * setA = new Set([1, 2, 3]);
 * setB = new Set([4, 5, 6]);
 * utils.set.union(setA, setB) // Set([1, 2, 3, 4, 5, 6])
 *
 * setA = new Set([1, 2, 3]);
 * listB = [4, 5, 6];
 * utils.set.union(setA, listB) // Set([1, 2, 3, 4, 5, 6])
 *
 * setC = new Set([7, 8, 9]);
 * utils.set.union(setA, listB, setC);
 * // Set(1, 2, 3, 4, 5, 6, 7, 8, 9);
 */
function union<T>(
  setTarget: Set<T> | Iterable<T> | null | undefined,
  iteratable: Iterable<T> | null | undefined,
  ...rest: Array<Iterable<T> | null | undefined>
): Set<T> {
  const target =
    setTarget instanceof Set ? setTarget : new Set(setTarget ?? []);
  if (iteratable) {
    for (const v of iteratable) {
      target.add(v);
    }
  }
  if (rest.length > 0) {
    return union(target, rest[0], ...rest.slice(1));
  }
  return target;
}

/**
 * Mutably adds a value to a set, and then returns the set. (Allowing Chaining)
 *
 * (If you wish to add immutably, use ES6: `new Set([...setA, value1, value2])`
 * or use the {@link union} command)
 *
 * @param setTarget - set to add values to
 * @param rest - values to add to the set
 * @returns setTarget
 * @see {@link union}
 * @example
 * setA = new Set([1, 2, 3]);
 * utils.set.add(setA, 4, 5, 6); // Set([1, 2, 3, 4, 5, 6])
 */
function add<T>(setTarget: Set<T> | Iterable<T>, ...rest: T[]): Set<T> {
  return union(setTarget, rest);
}

/**
 * Immutably identify all items that are common in two sets of iterable items
 *
 * **Note**: this works with Arrays and other things iterable
 *
 * @param sourceA - the set to check for common items
 * @param sourceB - another set to check for common items
 * @param rest - additional iterables to verify
 * @returns set of items that are in all sources
 * @example
 * setA = new Set([1, 2, 3, 4]);
 * setB = new Set([3, 4, 5, 6]);
 * utils.set.intersection(setA, setB); // Set([3, 4])
 *
 * // Note that you can use other iterable things too
 * utils.set.intersection([1, 2, 3, 4], [3, 4, 5, 6]); // Set([3, 4])
 *
 * setC = new Set([3, 4, 9, 10]);
 * utils.set.intersection(setA, setB, setC); // Set([3, 4]);
 */
function intersection<T>(
  sourceA: Set<T> | Iterable<T>,
  sourceB: Iterable<T>,
  ...rest: Array<Iterable<T>>
): Set<T> {
  const targetA = sourceA instanceof Set ? sourceA : new Set(sourceA);
  const results = new Set([...sourceB].filter((val) => targetA.has(val)));
  if (rest.length > 0) {
    return intersection(results, rest[0], ...rest.slice(1));
  }
  return results;
}

/**
 * Mutably removes all the values from one set in another
 *
 * @param setTarget - set to remove values from
 * @param iteratable - iterable that can be removed from the set
 * @returns setTarget
 * @example
 * setA = new Set([1, 2, 3, 4, 5, 6])
 * setB = new Set([4, 5, 6])
 * utils.set.difference(setA, setB) // Set([1, 2, 3])
 */
function difference<T>(
  setTarget: Set<T> | Iterable<T>,
  iteratable: Iterable<T> | null | undefined
): Set<T> {
  const target = setTarget instanceof Set ? setTarget : new Set(setTarget);
  if (iteratable) {
    for (const v of iteratable) {
      target.delete(v);
    }
  }
  return target;
}

/**
 * Mutably removes a value from a set, and then returns the set. (Allowing for chaining)
 *
 * @param setTarget - set to remove values from
 * @param rest - values to remove from the set
 * @returns setTarget
 * @example
 * setA = new Set([1, 2, 3, 4, 5])
 * utils.set.remove(setA, 4, 5); // Set([1, 2, 3])
 */
function remove<T>(setTarget: Set<T> | Iterable<T>, ...rest: T[]): Set<T> {
  return difference(setTarget, rest);
}

/**
 * Immutably verifies the superset contains all items in iterable,
 * and returns the set of items not found in the superset.
 *
 * @param superSet - set to check it contains all iterable items
 * @param iteratable - iterable with all items to check
 * @returns set with items not in superSet (or an empty set if all contained)
 * @example
 *
 * const possibleSuperSet = new Set([1,2,3,4,5,6]);
 * const subset = new Set([4,5,6,7]);
 * utils.set.findItemsNotContained(possibleSuperSet, subset); // Set([7]);
 */
function findItemsNotContained<T>(
  superSet: Set<T> | Iterable<T>,
  iteratable: Iterable<T> | null | undefined
): Set<T> {
  const target = superSet instanceof Set ? superSet : new Set(superSet);
  const result = new Set<T>();
  if (iteratable) {
    for (const v of iteratable) {
      if (!target.has(v)) {
        result.add(v);
      }
    }
  }
  return result;
}

export { add, union, intersection, remove, difference, findItemsNotContained };
