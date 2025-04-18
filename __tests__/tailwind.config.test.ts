import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../tailwind.config.ts';

describe('Tailwind config resolution', () => {
  it('includes custom theme colors', () => {
    const fullConfig = resolveConfig(tailwindConfig);
    expect(fullConfig.theme.colors.background).toBeDefined();
    expect(fullConfig.theme.colors.foreground).toBeDefined();
    expect(fullConfig.theme.colors['main-blue']).toBe('#4A90E2');
  });
}); 