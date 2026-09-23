import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const projectRoot = join(process.cwd());

describe('route menu rendering', () => {
  it('renders menu links and marks the selected route as active', () => {
    const outDir = mkdtempSync(join(tmpdir(), 'short-menu-'));
    execFileSync('node', ['compile/cmp.mjs', 'app/kit/route/home.st', '--out', outDir], {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    const html = readFileSync(join(outDir, 'app', 'kit', 'route', 'home.html'), 'utf8');

    expect(html).not.toContain('undefined');
    expect(html).toContain('Home');
    expect(html).toContain('Products');
    expect(html).toContain('bg-slate-200');
    expect(html).toContain('pointer-events-none');
    expect(html).toContain('href="home"');
  });
});
