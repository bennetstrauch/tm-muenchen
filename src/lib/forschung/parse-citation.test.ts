import { describe, it, expect } from 'vitest';
import { parseCitation } from './parse-citation';

// Fixtures are the flattened text of real column-H cells from the January 2026
// spreadsheet (see data/forschung/README.md). parseCitation is best-effort; the
// raw cell is always kept as citation_raw, so "good enough" is the bar here.

describe('parseCitation', () => {
  it('parses a standard Authors. Title. Journal Year Vol(Issue):Pages Abstract row', () => {
    const raw =
      'Abrams AI, Siegel LM. The Transcendental Meditation program and rehabilitation at Folsom State Prison: a cross-validation study. Criminal Justice and Behavior 1978 5(1):3-20 The Transcendental Meditation program in a maximum security prison was studied via cross-validation design.';
    const c = parseCitation(raw);
    expect(c.authors).toBe('Abrams AI, Siegel LM');
    expect(c.title).toBe(
      'The Transcendental Meditation program and rehabilitation at Folsom State Prison: a cross-validation study',
    );
    expect(c.journal).toBe('Criminal Justice and Behavior');
    expect(c.year).toBe(1978);
    expect(c.abstract).toBe(
      'The Transcendental Meditation program in a maximum security prison was studied via cross-validation design.',
    );
  });

  it('recovers title/journal even when the author→title period is missing (1970s format)', () => {
    // Real row 16: no period after "Siegel LM" before the title.
    const raw =
      'Abrams AI, Siegel LM Transcendental Meditation and rehabilitation at Folsom Prison: response to a critique. Criminal Justice and Behavior 1979 6(1):13-21 The benefits of Transcendental Meditation reported in the previous paper were found not to be the result of selection bias.';
    const c = parseCitation(raw);
    expect(c.authors).toBe('Abrams AI, Siegel LM');
    expect(c.title).toBe(
      'Transcendental Meditation and rehabilitation at Folsom Prison: response to a critique',
    );
    expect(c.journal).toBe('Criminal Justice and Behavior');
    expect(c.year).toBe(1979);
    expect(c.abstract).toMatch(/^The benefits of Transcendental Meditation/);
  });

  it('handles a single-letter final initial and colon-page format', () => {
    const raw =
      'Agarwal BL, Kharbanda A. Effect of transcendental meditation on mild and moderate hypertension. Journal of the Association of Physicians of India 1981 29:591-596  Reductions in systolic and diastolic blood pressure were found in mild and moderately hypertensive subjects.';
    const c = parseCitation(raw);
    expect(c.authors).toBe('Agarwal BL, Kharbanda A');
    expect(c.title).toBe('Effect of transcendental meditation on mild and moderate hypertension');
    expect(c.journal).toBe('Journal of the Association of Physicians of India');
    expect(c.year).toBe(1981);
    expect(c.abstract).toMatch(/^Reductions in systolic/);
  });

  it('parses a long multi-author list and drops an inline DOI from the abstract start', () => {
    const raw =
      'Chhatre S, Metzger DS, Frank I, Boyer J, Thompson E, Nidich S, Montaner LJ, Jayadevappa R. Effects of behavioral stress reduction Transcendental Meditation intervention in persons with HIV. AIDS Care: Psychological and Socio-medical Aspects of AIDS/HIV 2013 25(10): 1291-1297. doi.org/10.1080/09540121.2013.764396 Stress is implicated in the pathogenesis and progression of HIV.';
    const c = parseCitation(raw);
    expect(c.authors).toBe(
      'Chhatre S, Metzger DS, Frank I, Boyer J, Thompson E, Nidich S, Montaner LJ, Jayadevappa R',
    );
    expect(c.title).toBe(
      'Effects of behavioral stress reduction Transcendental Meditation intervention in persons with HIV',
    );
    expect(c.journal).toBe('AIDS Care: Psychological and Socio-medical Aspects of AIDS/HIV');
    expect(c.year).toBe(2013);
    expect(c.abstract).toMatch(/^Stress is implicated/);
    expect(c.abstract).not.toMatch(/doi\.org/);
  });

  it('collapses a newline between citation and a structured abstract', () => {
    // Real row 300: citation and abstract separated by a newline; structured abstract.
    const raw =
      'Nidich SI, Nidich RJ, Salerno J, Hadfield B, Elder C. Stress reduction with the Transcendental Meditation program in caregivers: a pilot study. International Archives of Nursing and Health Care 2015 1(2): 011\nObjective: To determine feasibility and potential effects of the Transcendental Meditation technique on caregivers.';
    const c = parseCitation(raw);
    expect(c.authors).toBe('Nidich SI, Nidich RJ, Salerno J, Hadfield B, Elder C');
    expect(c.year).toBe(2015);
    expect(c.journal).toBe('International Archives of Nursing and Health Care');
    expect(c.abstract).toMatch(/^Objective: To determine feasibility/);
  });

  it('keeps a Collected-Papers style row without an abstract from inventing one', () => {
    const raw =
      'Orme-Johnson DW. Autonomic stability and Transcendental Meditation. Psychosomatic Medicine 1973 35:341-349';
    const c = parseCitation(raw);
    expect(c.authors).toBe('Orme-Johnson DW');
    expect(c.title).toBe('Autonomic stability and Transcendental Meditation');
    expect(c.journal).toBe('Psychosomatic Medicine');
    expect(c.year).toBe(1973);
    expect(c.abstract).toBe('');
  });

  it('degrades gracefully on an unparseable blob (no year, no clear structure)', () => {
    const raw = 'Some unstructured note about a study with no citation shape';
    const c = parseCitation(raw);
    expect(c.year).toBeUndefined();
    // authors best-effort may be empty or partial, but must never throw and always returns strings
    expect(typeof c.title).toBe('string');
    expect(typeof c.abstract).toBe('string');
  });
});
