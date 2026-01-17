import { describe, it } from '@std/testing/bdd';
import { expect } from '@std/expect';
import { add, subtract } from './simple.ts';

describe('add function', () => {
  it('adds two numbers correctly', () => {
    const result = add(2, 3);
    expect(result).toBe(5);
  });

  it('handles negative numbers', () => {
    const result = add(-2, -3);
    expect(result).toBe(-5);
  });
});

describe('subtract function', () => {
  it('subtract two numbers correctly', () => {
    const result = subtract(5, 3);
    expect(result).toBe(2);
  });

  it('handles negative numbers', () => {
    const result = subtract(-2, -3);
    expect(result).toBe(1);
  });
});