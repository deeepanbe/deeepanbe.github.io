import fs from 'node:fs/promises';

const file = new URL('./dj-ai-regression.json', import.meta.url);
const suite = JSON.parse(await fs.readFile(file, 'utf8'));

if (!Array.isArray(suite.cases) || suite.cases.length === 0) {
  throw new Error('DJ AI regression suite is empty');
}

const ids = new Set();
for (const test of suite.cases) {
  if (!test.id || !test.category || !test.prompt || !test.expected) {
    throw new Error(`Invalid regression case: ${JSON.stringify(test)}`);
  }
  if (ids.has(test.id)) throw new Error(`Duplicate regression case: ${test.id}`);
  ids.add(test.id);
}

console.log(`DJ AI regression suite valid: ${suite.cases.length} cases`);
for (const test of suite.cases) console.log(`- ${test.id}: ${test.category}`);
