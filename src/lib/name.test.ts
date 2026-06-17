import { describe, it, expect } from 'vitest';
import { splitName } from './name';

describe('splitName', () => {
  it('splits a two-part name into first and last name', () => {
    expect(splitName('Maria Huber')).toEqual({ first_name: 'Maria', last_name: 'Huber' });
  });

  it('returns empty last_name when only one token is given', () => {
    expect(splitName('Maria')).toEqual({ first_name: 'Maria', last_name: '' });
  });

  it('puts everything after the first space into last_name', () => {
    expect(splitName('Maria Anna Huber')).toEqual({ first_name: 'Maria', last_name: 'Anna Huber' });
  });

  it('trims leading and trailing whitespace', () => {
    expect(splitName('  Maria Huber  ')).toEqual({ first_name: 'Maria', last_name: 'Huber' });
  });
});
