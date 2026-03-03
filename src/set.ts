/**
 * Utilities / functional methods for manipulating JavaScript Sets.
 *
 * @module set
 */

type SetOrIterable<T> = Set<T> | Iterable<T>;

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

function add<T>(setTarget: Set<T> | Iterable<T>, ...rest: T[]): Set<T> {
  return union(setTarget, rest);
}

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

function remove<T>(setTarget: Set<T> | Iterable<T>, ...rest: T[]): Set<T> {
  return difference(setTarget, rest);
}

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

const SetUtils = {
  add,
  union,
  intersection,
  remove,
  difference,
  findItemsNotContained
};

export default SetUtils;
