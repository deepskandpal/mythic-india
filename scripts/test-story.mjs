// Node-side check of the ink story: compiles it, walks EVERY choice
// path, and asserts each one reaches END. Run with `npm run test:story`.
import { readFileSync } from 'node:fs';
import { Compiler, CompilerOptions } from 'inkjs/full';
import { Story } from 'inkjs';

const inkPath = new URL('../src/story/test-conversation.ink', import.meta.url);
const source = readFileSync(inkPath, 'utf8');

const errors = [];
const options = new CompilerOptions(null, [], false, (message) => errors.push(message));
let compiled;
try {
  compiled = new Compiler(source, options).Compile();
} catch (e) {
  console.error('Ink compile failed:\n' + errors.join('\n'));
  process.exit(1);
}
if (errors.length > 0) {
  console.error('Ink compile errors:\n' + errors.join('\n'));
  process.exit(1);
}
const json = compiled.ToJson();

/** Replays a fixed choice sequence; reports how the story ended. */
function run(choiceSeq) {
  const story = new Story(json);
  story.onError = (message) => {
    throw new Error(`ink runtime error on path [${choiceSeq}]: ${message}`);
  };
  const lines = [];
  let seqIdx = 0;
  for (let guard = 0; guard < 1000; guard++) {
    while (story.canContinue) {
      const line = (story.Continue() ?? '').trim();
      if (line) lines.push(line);
    }
    const n = story.currentChoices.length;
    if (n === 0) return { lines, ended: true };
    if (seqIdx >= choiceSeq.length) return { lines, ended: false, pendingChoices: n };
    story.ChooseChoiceIndex(choiceSeq[seqIdx++]);
  }
  throw new Error(`story did not terminate on path [${choiceSeq}]`);
}

// Breadth-first enumeration of all complete choice paths.
const queue = [[]];
const completePaths = [];
while (queue.length > 0) {
  const seq = queue.shift();
  const result = run(seq);
  if (result.ended) {
    completePaths.push({ seq, lineCount: result.lines.length });
  } else {
    for (let i = 0; i < result.pendingChoices; i++) queue.push([...seq, i]);
  }
}

console.log(`All paths reach END: ${completePaths.length} complete paths`);
for (const p of completePaths) {
  console.log(`  path [${p.seq.join(', ')}] — ${p.lineCount} lines`);
}

// Show one full transcript so a human can eyeball tone and speaker parsing.
const sample = run(completePaths[Math.min(1, completePaths.length - 1)].seq);
console.log('\nSample transcript (path 2):\n' + sample.lines.map((l) => '  ' + l).join('\n'));
