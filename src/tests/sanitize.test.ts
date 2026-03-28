import { describe, it, expect } from 'vitest';
import { sanitizeInput } from '../utils/sanitize';

describe('sanitizeInput', () => {
  it('should return empty string when input is null', () => {
    expect(sanitizeInput(null)).toBe('');
  });

  it('should return empty string when input is undefined', () => {
    expect(sanitizeInput(undefined)).toBe('');
  });

  it('should return empty string when input is empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('should escape < script > tags to prevent XSS', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
  });

  it('should escape ampersands', () => {
    expect(sanitizeInput('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should escape double quotes', () => {
    expect(sanitizeInput('"Hello"')).toBe('&quot;Hello&quot;');
  });

  it('should escape single quotes', () => {
    expect(sanitizeInput("'Hello'")).toBe('&#x27;Hello&#x27;');
  });

  it('should escape forward slashes', () => {
    expect(sanitizeInput('path/to/file')).toBe('path&#x2F;to&#x2F;file');
  });

  it('should leave safe strings unchanged', () => {
    expect(sanitizeInput('Safe string 123')).toBe('Safe string 123');
  });

  it('should handle complex mixed special characters', () => {
    expect(sanitizeInput('<div class="test">\'&/</div>')).toBe('&lt;div class=&quot;test&quot;&gt;&#x27;&amp;&#x2F;&lt;&#x2F;div&gt;');
  });
});
