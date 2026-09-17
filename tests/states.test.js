import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { JSDOM } from 'jsdom';

const projectRoot = join(process.cwd());

describe('states.st compiler output', () => {
  it('compiles and exposes reactive state helpers', () => {
    const outDir = mkdtempSync(join(tmpdir(), 'short-states-'));
    execFileSync('node', ['compile/cmp.mjs', 'app/kit/states.st', '--out', outDir], {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    const html = readFileSync(join(outDir, 'app', 'kit', 'states.html'), 'utf8');
    const dom = new JSDOM(html, { runScripts: 'dangerously' });
    const { window } = dom;

    expect(typeof window.getCount).toBe('function');
    expect(typeof window.setCount).toBe('function');
    expect(typeof window.getCounter).toBe('function');
    expect(typeof window.setCounter).toBe('function');

    expect(window.getCount()).toBe(0);
    expect(window.getCounter()).toBe(3);

    const incButton = [...window.document.querySelectorAll('button.ct-btn-inc')].find(
      (button) => button.textContent.includes('+') && !button.textContent.includes('Add 2')
    );
    const addTwoButton = [...window.document.querySelectorAll('button.ct-btn-inc')].find(
      (button) => button.textContent.includes('Add 2')
    );
    const resetButton = [...window.document.querySelectorAll('button.ct-btn-reset')][0];

    expect(incButton).toBeTruthy();
    expect(addTwoButton).toBeTruthy();
    expect(resetButton).toBeTruthy();

    incButton.click();
    expect(window.getCount()).toBe(1);

    setTimeout(() => {
      // no-op for deterministic JS event ordering in JSDOM
    });

    addTwoButton.click();
    expect(window.getCounter()).toBe(5);

    resetButton.click();
    expect(window.getCount()).toBe(0);
  });
});
