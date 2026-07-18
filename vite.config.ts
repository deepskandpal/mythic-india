import { defineConfig, type Plugin } from 'vite';
import { Compiler } from 'inkjs/full';

/**
 * Compiles .ink files to ink runtime JSON at build time, so the browser
 * bundle only needs the small inkjs runtime (not the compiler).
 * Usage: `import storyJson from './story/foo.ink';` → compiled JSON string.
 */
function inkPlugin(): Plugin {
  return {
    name: 'vite-plugin-ink',
    transform(source, id) {
      if (!id.endsWith('.ink')) return null;
      const story = new Compiler(source).Compile();
      const json = story.ToJson();
      return {
        code: `export default ${JSON.stringify(json)};`,
        map: null,
      };
    },
  };
}

export default defineConfig({
  plugins: [inkPlugin()],
  server: { port: 5173 },
});
