import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import {
  add,
  union,
  intersection,
  remove,
  difference,
  findItemsNotContained
} from "../src/set.ts";

describe("SetUtils", () => {
  it("can add a value to set", () => {
    const source = new Set([1, 2, 3]);
    const results = add(source, 4, 5);
    const expected = new Set([1, 2, 3, 4, 5]);
    expect(results).toEqual(expected);
  });

  describe("setUnion", () => {
    it("can add a union of sets", () => {
      const source = new Set([1, 2, 3]);
      const results = union(source, new Set([4, 5]));
      const expected = new Set([1, 2, 3, 4, 5]);
      expect(results).toEqual(expected);
    });
    it("can add a union of array", () => {
      const source = new Set([1, 2, 3]);
      const results = union(source, [4, 5]);
      const expected = new Set([1, 2, 3, 4, 5]);
      expect(results).toEqual(expected);
    });
    it("can add an array to an array", () => {
      const source = [1, 2, 3];
      const results = union(source, [4, 5]);
      const expected = new Set([1, 2, 3, 4, 5]);
      expect(results).toEqual(expected);
    });
    it("throws an error if a non-iterable is asked to union", () => {
      const source = new Set([1, 2, 3]);
      expect(() =>
        union(source, { john: "doe" } as unknown as Iterable<number>)
      ).toThrow();
    });
    it("adds nothing if the target is null", () => {
      const source = new Set([1, 2, 3]);
      const target = null;
      const expected = new Set(source);
      const results = union(source, target);
      expect(results).toEqual(expected);
    });
    describe("union multiple sets", () => {
      it("can union two sets", () => {
        const sourceA = new Set([1, 2, 3]);
        const sourceB = new Set([4, 5, 6]);
        const expected = new Set([1, 2, 3, 4, 5, 6]);
        const results = union(sourceA, sourceB);
        expect(results).toEqual(expected);
      });
      it("can union three sets", () => {
        const sourceA = new Set([1, 2, 3]);
        const sourceB = new Set([4, 5, 6]);
        const sourceC = new Set([7, 8, 9]);
        const expected = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        const results = union(sourceA, sourceB, sourceC);
        expect(results).toEqual(expected);
      });
      it("can union three intersecting sets", () => {
        const sourceA = new Set([1, 2, 3]);
        const sourceB = new Set([3, 4, 5]);
        const sourceC = new Set([5, 6, 7]);
        const expected = new Set([1, 2, 3, 4, 5, 6, 7]);
        const results = union(sourceA, sourceB, sourceC);
        expect(results).toEqual(expected);
      });
      it("can union four intersecting sets", () => {
        const sourceA = new Set([1, 2, 3]);
        const sourceB = new Set([3, 4, 5]);
        const sourceC = new Set([5, 6, 7]);
        const sourceD = new Set([7, 8, 9]);
        const expected = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        const results = union(sourceA, sourceB, sourceC, sourceD);
        expect(results).toEqual(expected);
      });
      it("can union a single set and multiple arrays", () => {
        const sourceA = new Set<number>();
        const sourceB = [1, 2, 3, 4];
        const sourceC = [5, 6, 7, 8];
        const expected = new Set([1, 2, 3, 4, 5, 6, 7, 8]);
        const results = union(sourceA, sourceB, sourceC);
        expect(results).toEqual(expected);
      });
    });
  });

  describe("intersection", () => {
    it("can find intersection of two sets", () => {
      const sourceA = new Set([1, 2, 3]);
      const sourceB = new Set([3, 4, 5]);
      const expected = new Set([3]);
      const results = intersection(sourceA, sourceB);
      expect(results).toEqual(expected);
    });
    it("can find intersection of set and array", () => {
      const sourceA = new Set([1, 2, 3]);
      const sourceB = [3, 4, 5];
      const expected = new Set([3]);
      const results = intersection(sourceA, sourceB);
      expect(results).toEqual(expected);
    });
    it("can find intersection of array and set", () => {
      const sourceA = [1, 2, 3];
      const sourceB = new Set([3, 4, 5]);
      const expected = new Set([3]);
      const results = intersection(sourceA, sourceB);
      expect(results).toEqual(expected);
    });
    it("can find intersection of array and array", () => {
      const sourceA = [1, 2, 3];
      const sourceB = [3, 4, 5];
      const expected = new Set([3]);
      const results = intersection(sourceA, sourceB);
      expect(results).toEqual(expected);
    });
    it("can find intersection where they do not intersect", () => {
      const sourceA = new Set([1, 2, 3]);
      const sourceB = new Set([4, 5, 6]);
      const expected = new Set<number>([]);
      const results = intersection(sourceA, sourceB);
      expect(results).toEqual(expected);
    });
    describe("intersect multiple sets", () => {
      it("can intersect two sets", () => {
        const sourceA = new Set([1, 2, 3]);
        const sourceB = new Set([2, 3, 4]);
        const expected = new Set([2, 3]);
        const results = intersection(sourceA, sourceB);
        expect(results).toEqual(expected);
      });
      it("can intersect three sets", () => {
        const sourceA = new Set([1, 2, 3]);
        const sourceB = new Set([2, 3, 4]);
        const sourceC = new Set([3, 4, 5]);
        const expected = new Set([3]);
        const results = intersection(sourceA, sourceB, sourceC);
        expect(results).toEqual(expected);
      });
      it("can intersect three unique sets", () => {
        const sourceA = new Set([1, 2, 3]);
        const sourceB = new Set([3, 4, 5]);
        const sourceC = new Set([5, 6, 7]);
        const expected = new Set<number>([]);
        const results = intersection(sourceA, sourceB, sourceC);
        expect(results).toEqual(expected);
      });
      it("can intersect four intersecting sets", () => {
        const sourceA = new Set([1, 2, 3, 4]);
        const sourceB = new Set([4, 5, 6]);
        const sourceC = new Set([1, 4, 9]);
        const sourceD = new Set([4, 5, 9]);
        const expected = new Set([4]);
        const results = intersection(
          sourceA,
          sourceB,
          sourceC,
          sourceD
        );
        expect(results).toEqual(expected);
      });
      it("can intersect a single set and multiple arrays", () => {
        const sourceA = new Set([1, 2, 3]);
        const sourceB = [1, 2, 3, 4];
        const sourceC = [1, 2, 3, 9];
        const expected = new Set([1, 2, 3]);
        const results = intersection(sourceA, sourceB, sourceC);
        expect(results).toEqual(expected);
      });
    });
  });

  describe("setRemove", () => {
    it("can remove an individual item from a set", () => {
      const source = new Set([1, 2, 3, 4, 5]);
      const results = remove(source, 4, 5);
      const expected = new Set([1, 2, 3]);
      expect(results).toEqual(expected);
    });
    it("can remove a set", () => {
      const source = new Set([1, 2, 3, 4, 5]);
      const results = difference(source, new Set([4, 5]));
      const expected = new Set([1, 2, 3]);
      expect(results).toEqual(expected);
    });
    it("can remove a list", () => {
      const source = new Set([1, 2, 3, 4, 5]);
      const results = difference(source, [4, 5]);
      const expected = new Set([1, 2, 3]);
      expect(results).toEqual(expected);
    });
    it("can remove a list from a list", () => {
      const source = [1, 2, 3, 4, 5];
      const results = difference(source, [4, 5]);
      const expected = new Set([1, 2, 3]);
      expect(results).toEqual(expected);
    });
    it("throws an error if a non-iterable is asked to remove", () => {
      const source = new Set([1, 2, 3]);
      expect(() => difference(source, 1 as unknown as Iterable<number>)).toThrow();
    });
    it("removes nothing is target is null", () => {
      const source = new Set([1, 2, 3]);
      const target = null;
      const expected = new Set(source);
      const results = difference(source, target);
      expect(results).toEqual(expected);
    });
  });

  describe("find items not contained", () => {
    it("superset contains everything", () => {
      const expected = new Set<number>();
      const possibleSuperSet = new Set([1, 2, 3, 4, 5, 6]);
      const subset = new Set([4, 5, 6]);
      const result = findItemsNotContained(possibleSuperSet, subset);
      expect(result).toEqual(expected);
    });
    it("superset missing one item", () => {
      const expected = new Set([7]);
      const possibleSuperSet = new Set([1, 2, 3, 4, 5, 6]);
      const subset = new Set([4, 5, 6, 7]);
      const result = findItemsNotContained(possibleSuperSet, subset);
      expect(result).toEqual(expected);
    });
    it("superset missing multiple", () => {
      const expected = new Set([7, 8, 9]);
      const possibleSuperSet = new Set([1, 2, 3, 4, 5, 6]);
      const subset = new Set([4, 5, 6, 7, 8, 9]);
      const result = findItemsNotContained(possibleSuperSet, subset);
      expect(result).toEqual(expected);
    });
    it("superset disjointed", () => {
      const expected = new Set([4, 5, 6]);
      const possibleSuperSet = new Set([1, 2, 3]);
      const subset = new Set([4, 5, 6]);
      const result = findItemsNotContained(possibleSuperSet, subset);
      expect(result).toEqual(expected);
    });
    it("identifies missing items in arrays", () => {
      const expected = new Set([7]);
      const possibleSuperSet = [1, 2, 3, 4, 5, 6];
      const subset = [4, 5, 6, 7];
      const result = findItemsNotContained(possibleSuperSet, subset);
      expect(result).toEqual(expected);
    });
    it("finds nothing if not an iteratable", () => {
      const expected = new Set<number>();
      const possibleSuperSet = [1, 2, 3, 4, 5, 6];
      const subset = null;
      const result = findItemsNotContained(possibleSuperSet, subset);
      expect(result).toEqual(expected);
    });
  });
});
