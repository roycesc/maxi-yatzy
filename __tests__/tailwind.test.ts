// @ts-nocheck
import config from '../tailwind.config.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Tailwind setup', () => {
  it('globals.css includes Tailwind directives', () => {
    const cssFile = resolve(__dirname, '../src/app/globals.css');
    const css = readFileSync(cssFile, 'utf8');
    expect(css).toContain('@tailwind base;');
    expect(css).toContain('@tailwind components;');
    expect(css).toContain('@tailwind utilities;');
  });

  it('tailwind.config.js includes custom theme colors', () => {
    expect(config.theme.colors.background).toBeDefined();
    expect(config.theme.colors.foreground).toBeDefined();
    expect(config.theme.colors['main-blue']).toBe('#4A90E2');
  });
}); 