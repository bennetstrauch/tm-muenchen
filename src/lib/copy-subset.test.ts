import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { copySubset, allSubsetKeys } from './copy-subset';
import { getNestedValue } from './nested';
import de from '../../messages/de.json';

describe('copy-subset-keys.json', () => {
  it('matches allSubsetKeys() so CI workflow stays in sync with the TS definition', () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    const raw = readFileSync(join(dir, 'copy-subset-keys.json'), 'utf-8');
    const jsonKeys: string[] = JSON.parse(raw) as string[];
    expect(jsonKeys).toEqual(allSubsetKeys());
  });
});

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
