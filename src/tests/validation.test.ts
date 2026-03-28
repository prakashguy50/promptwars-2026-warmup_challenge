import { describe, it, expect } from 'vitest';
import { isValidEmail, isEmpty, isWithinBounds, isValidLength } from '../utils/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email', () => expect(isValidEmail('test@example.com')).toBe(true));
    it('should return false for missing @', () => expect(isValidEmail('testexample.com')).toBe(false));
    it('should return false for missing domain', () => expect(isValidEmail('test@.com')).toBe(false));
    it('should return false for empty string', () => expect(isValidEmail('')).toBe(false));
    it('should return false for email with spaces', () => expect(isValidEmail('test @example.com')).toBe(false));
  });

  describe('isEmpty', () => {
    it('should return true for null', () => expect(isEmpty(null)).toBe(true));
    it('should return true for undefined', () => expect(isEmpty(undefined)).toBe(true));
    it('should return true for empty string', () => expect(isEmpty('')).toBe(true));
    it('should return true for whitespace only', () => expect(isEmpty('   ')).toBe(true));
    it('should return false for valid string', () => expect(isEmpty('text')).toBe(false));
  });

  describe('isWithinBounds', () => {
    it('should return true when within bounds', () => expect(isWithinBounds(5, 1, 10)).toBe(true));
    it('should return true when at lower bound', () => expect(isWithinBounds(1, 1, 10)).toBe(true));
    it('should return true when at upper bound', () => expect(isWithinBounds(10, 1, 10)).toBe(true));
    it('should return false when below lower bound', () => expect(isWithinBounds(0, 1, 10)).toBe(false));
    it('should return false when above upper bound', () => expect(isWithinBounds(11, 1, 10)).toBe(false));
    it('should return false for NaN', () => expect(isWithinBounds(NaN, 1, 10)).toBe(false));
  });

  describe('isValidLength', () => {
    it('should return true when length is within bounds', () => expect(isValidLength('abc', 1, 5)).toBe(true));
    it('should return true when length is at lower bound', () => expect(isValidLength('a', 1, 5)).toBe(true));
    it('should return true when length is at upper bound', () => expect(isValidLength('abcde', 1, 5)).toBe(true));
    it('should return false when length is below lower bound', () => expect(isValidLength('', 1, 5)).toBe(false));
    it('should return false when length is above upper bound', () => expect(isValidLength('abcdef', 1, 5)).toBe(false));
  });
});
