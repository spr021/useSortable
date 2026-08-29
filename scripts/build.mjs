import { rollup } from 'rollup';

import config from '../rollup.config.mjs';

let bundle;

try {
  bundle = await rollup(config);
  const outputs = Array.isArray(config.output) ? config.output : [config.output];

  for (const output of outputs) {
    await bundle.write(output);
  }

  await bundle.close();
  // The TypeScript watch host can leave a debounce handle behind after a
  // one-shot build in linked workspaces. All output is flushed at this point.
  process.exit(0);
} catch (error) {
  await bundle?.close();
  console.error(error);
  process.exit(1);
}
