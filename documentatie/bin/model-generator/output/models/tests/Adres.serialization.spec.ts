import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { TypedJSON } from 'typedjson';
import { Adres } from '../Adres.model';

describe('Adres serialization', () => {
  it('serializes and deserializes correctly', () => {
    const a = new Adres();
    a.uuid = '1234-uuid';
    a.straat = 'Hoofdstraat 1';
    a.geldigVan = new Date('2020-01-01T00:00:00Z');
    a.aangemaaktOp = new Date('2020-01-02T00:00:00Z');

    const ser = new TypedJSON(Adres);
    const json = ser.stringify(a);
    expect(typeof json).toBe('string');

    const parsed = ser.parse(json!);
    expect(parsed).toBeInstanceOf(Adres);
    expect(parsed!.uuid).toBe(a.uuid);
    expect(parsed!.straat).toBe(a.straat);
    expect(parsed!.geldigVan).toBeInstanceOf(Date);
    expect(parsed!.geldigVan!.toISOString()).toBe(a.geldigVan.toISOString());
    expect(parsed!.aangemaaktOp!.toISOString()).toBe(a.aangemaaktOp.toISOString());
  });
});
