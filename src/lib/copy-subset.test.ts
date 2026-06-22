import { describe, it, expect } from 'vitest';
import { copySubset } from './copy-subset';
import de from '../../messages/de.json';

function getNestedValue(obj: Record<string, unknown>, dotPath: string): unknown {
  return dotPath.split('.').reduce<unknown>((cur, key) => {
    if (cur && typeof cur === 'object') return (cur as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

describe('copySubset', () => {
  it('every field key exists in de.json', () => {
    const missing: string[] = [];
    for (const section of copySubset) {
      for (const field of section.fields) {
        const val = getNestedValue(de as Record<string, unknown>, field.key);
        if (val === undefined) missing.push(field.key);
      }
    }
    expect(missing).toEqual([]);
  });

  it('every field has a non-empty label', () => {
    for (const section of copySubset) {
      for (const field of section.fields) {
        expect(field.label.trim(), `field ${field.key} missing label`).not.toBe('');
      }
    }
  });

  it('every field type is text or textarea', () => {
    for (const section of copySubset) {
      for (const field of section.fields) {
        expect(['text', 'textarea']).toContain(field.type);
      }
    }
  });
});
