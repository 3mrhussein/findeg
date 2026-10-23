import { describe, expect, it } from 'vitest';
import { DS2_COLORS, DS2_CSS_VARS, DS2_FONTS } from './index';

describe('UI Design System 2 Tokens', () => {
  it('exports canonical hex color tokens', () => {
    expect(DS2_COLORS.bgGraphite).toBe('#0E1014');
    expect(DS2_COLORS.bgGraphiteGlow).toBe('#3B2818');
    expect(DS2_COLORS.bgPaper).toBe('#EAE7DF');
    expect(DS2_COLORS.bgFooter).toBe('#08090B');
    expect(DS2_COLORS.textLight).toBe('#F6F4EE');
    expect(DS2_COLORS.textDark).toBe('#141413');
    expect(DS2_COLORS.accentAmber).toBe('#E07A38');
    expect(DS2_COLORS.accentVolt).toBe('#C9F24B');
    expect(DS2_COLORS.borderBrutalist).toBe('#181816');
  });

  it('exports typography family definitions', () => {
    expect(DS2_FONTS.display).toContain('Inter Tight');
    expect(DS2_FONTS.script).toContain('Caveat');
    expect(DS2_FONTS.monoTech).toContain('JetBrains Mono');
  });

  it('defines valid CSS custom property mapping', () => {
    expect(DS2_CSS_VARS['--bg-graphite']).toBe(DS2_COLORS.bgGraphite);
    expect(DS2_CSS_VARS['--bg-paper']).toBe(DS2_COLORS.bgPaper);
    expect(DS2_CSS_VARS['--accent-volt']).toBe(DS2_COLORS.accentVolt);
    expect(DS2_CSS_VARS['--border-brutalist']).toBe(DS2_COLORS.borderBrutalist);
  });
});
