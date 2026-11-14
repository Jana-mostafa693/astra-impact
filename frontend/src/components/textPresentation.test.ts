import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { fieldLabel } from './ScientificEvidence';

const current = readFileSync(resolve(process.cwd(), 'src/components/ScientificEvidence.tsx'), 'utf8');
const baseline = readFileSync(resolve(process.cwd(), '../validation/text_only/baseline/ScientificEvidence.tsx.txt'), 'utf8');
const parse = (source: string) => ts.createSourceFile('evidence.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const attributes = (source: string) => {
  const result: string[] = [];
  const tree = parse(source);
  const visit = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      result.push(`${node.tagName.getText(tree)}:${node.attributes.getText(tree)}`);
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
  return result;
};

describe('strict text-only presentation preservation', () => {
  it('replaces technical separators with readable, non-breaking spaces', () => {
    expect(fieldLabel('snow_cover_frequency')).toBe('Snow\u00a0cover\u00a0frequency');
  });

  it('keeps label length and scientific unit suffix letters unchanged', () => {
    for (const key of ['elevation_mean_m', 'brightness_temperature_k', 'soil_ph', 'modeled_pressure_pa']) {
      const shown = fieldLabel(key);
      expect(shown.length).toBe(key.length);
      expect(shown.slice(1).replaceAll('\u00a0', '_')).toBe(key.slice(1));
    }
  });

  it('does not alter a field identifier or add a missing-data value', () => {
    const key = 'accessible_water_ice_confirmed';
    fieldLabel(key);
    expect(key).toBe('accessible_water_ice_confirmed');
    expect(fieldLabel('')).toBe('');
  });

  it('preserves every JSX tag, class, style, prop, key, icon and handler', () => {
    expect(attributes(current)).toEqual(attributes(baseline));
  });

  it('allows exactly one missing-chip display expression and the formatter, nothing else', () => {
    const addition = "// Non-breaking spaces retain the existing monospace label width and wrapping.\nexport function fieldLabel(key: string): string {\n  return key.replace(/_/g, '\\u00a0').replace(/^[a-z]/, (letter) => letter.toUpperCase());\n}\n\n";
    const expected = baseline
      .replace('function quality(value: unknown): string {', addition + 'function quality(value: unknown): string {')
      .replace('>{item}</span>) :', '>{fieldLabel(item)}</span>) :');
    expect(current).toBe(expected);
  });

  it('leaves value formatting, QA flags and all existing explanations intact', () => {
    for (const name of ['text', 'value', 'quality']) {
      const body = (source: string) => parse(source).statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name)?.getText();
      expect(body(current)).toBe(body(baseline));
    }
    for (const text of [
      'Unavailable variables remain unavailable; no values are inferred, interpolated, or replaced.',
      'No site-level quality flags supplied',
      'Null values are explicitly labeled unavailable.'
    ]) expect(current.includes(text)).toBe(baseline.includes(text));
  });
});
