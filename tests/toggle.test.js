import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { JSDOM } from 'jsdom';

const projectRoot = join(process.cwd());

describe('toggle.st compiler output', () => {
  it('compiles the template and both toggle sets work', () => {
    const outDir = mkdtempSync(join(tmpdir(), 'short-toggle-'));
    execFileSync('node', ['compile/cmp.mjs', 'app/kit/toggle.st', '--out', outDir], {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    const html = readFileSync(join(outDir, 'app', 'kit', 'toggle.html'), 'utf8');
    const dom = new JSDOM(html, { runScripts: 'dangerously' });
    const { document } = dom.window;

    const bhi = document.getElementById('bhi');
    const bbye = document.getElementById('bbye');
    const byes = document.getElementById('byes');
    const bno = document.getElementById('bno');

    expect(bhi).toBeTruthy();
    expect(bbye).toBeTruthy();
    expect(byes).toBeTruthy();
    expect(bno).toBeTruthy();

    expect(bhi.classList.contains('hidden')).toBe(false);
    expect(bbye.classList.contains('hidden')).toBe(true);
    expect(byes.classList.contains('hidden')).toBe(false);
    expect(bno.classList.contains('hidden')).toBe(true);

    bhi.onclick();
    expect(bhi.classList.contains('hidden')).toBe(true);
    expect(bbye.classList.contains('hidden')).toBe(false);

    byes.onclick();
    expect(byes.classList.contains('hidden')).toBe(true);
    expect(bno.classList.contains('hidden')).toBe(false);
  });
});
