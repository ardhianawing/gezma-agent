/**
 * API Documentation Generator
 *
 * Scans src/app/api/ for route.ts files, extracts HTTP methods,
 * and generates API-REFERENCE.md grouped by domain.
 *
 * Usage: npx tsx scripts/generate-api-docs.ts
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

const API_DIR = join(__dirname, '..', 'src', 'app', 'api');
const OUTPUT = join(__dirname, '..', 'API-REFERENCE.md');

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

interface RouteInfo {
  path: string;
  methods: string[];
}

function findRouteFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...findRouteFiles(full));
    } else if (entry === 'route.ts') {
      files.push(full);
    }
  }
  return files;
}

function extractMethods(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf-8');
  return HTTP_METHODS.filter((method) =>
    new RegExp(`export\\s+(async\\s+)?function\\s+${method}\\b`).test(content)
  );
}

function filePathToApiPath(filePath: string): string {
  const rel = relative(API_DIR, filePath)
    .replace(/\/route\.ts$/, '')
    .replace(/\\/g, '/');

  // Convert Next.js dynamic segments [param] to :param
  return '/api/' + rel.replace(/\[([^\]]+)\]/g, ':$1');
}

function getDomain(apiPath: string): string {
  const segments = apiPath.replace('/api/', '').split('/');
  return segments[0];
}

// Auth requirement heuristic based on domain
function getAuthNote(domain: string): string {
  const publicDomains = ['health', 'verify', 'share'];
  const specialAuth: Record<string, string> = {
    'command-center': 'Command Center auth (cc_token)',
    'pilgrim-portal': 'Pilgrim Portal auth (pilgrim_token)',
    auth: 'Public (login/register) or Agent auth',
  };
  if (publicDomains.includes(domain)) return 'Public (no auth required)';
  if (specialAuth[domain]) return specialAuth[domain];
  return 'Agent auth (JWT cookie)';
}

function main() {
  const routeFiles = findRouteFiles(API_DIR).sort();
  const routes: RouteInfo[] = [];

  for (const file of routeFiles) {
    const methods = extractMethods(file);
    if (methods.length > 0) {
      routes.push({
        path: filePathToApiPath(file),
        methods,
      });
    }
  }

  // Group by domain
  const grouped = new Map<string, RouteInfo[]>();
  for (const route of routes) {
    const domain = getDomain(route.path);
    if (!grouped.has(domain)) grouped.set(domain, []);
    grouped.get(domain)!.push(route);
  }

  // Generate markdown
  const lines: string[] = [
    '# Gezma Agent — API Reference',
    '',
    `> Auto-generated on ${new Date().toISOString().split('T')[0]} by \`npm run docs:api\``,
    '',
    `**Total routes:** ${routes.length}  `,
    `**Domains:** ${grouped.size}`,
    '',
    '---',
    '',
    '## Table of Contents',
    '',
  ];

  // TOC
  for (const domain of grouped.keys()) {
    const count = grouped.get(domain)!.length;
    lines.push(`- [${domain}](#${domain}) (${count} routes)`);
  }

  lines.push('', '---', '');

  // Route tables per domain
  for (const [domain, domainRoutes] of grouped) {
    const auth = getAuthNote(domain);
    lines.push(`## ${domain}`, '');
    lines.push(`**Auth:** ${auth}`, '');
    lines.push('| Method | Path |');
    lines.push('|--------|------|');

    for (const route of domainRoutes) {
      for (const method of route.methods) {
        lines.push(`| \`${method}\` | \`${route.path}\` |`);
      }
    }

    lines.push('');
  }

  const content = lines.join('\n');
  writeFileSync(OUTPUT, content, 'utf-8');

  console.log(`Generated API-REFERENCE.md`);
  console.log(`  Routes: ${routes.length}`);
  console.log(`  Domains: ${grouped.size}`);
}

main();
