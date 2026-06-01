import { createRequire } from 'module';
import { readFileSync, copyFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

const require = createRequire(import.meta.url);
const { libraries: libs } = JSON.parse(readFileSync('libs.json', 'utf-8'));

const buildTime = new Date(Date.now() + 7 * 60 * 60 * 1000)
  .toISOString()
  .replace('T', ' ')
  .replace(/\.\d+Z$/, ' UTC+7');

function getVersion(pkgName) {
  const pkg = JSON.parse(
    readFileSync(`node_modules/${pkgName}/package.json`, 'utf-8')
  );
  return pkg.version;
}

function safeName(name) {
  return name.replace(/\//g, '__').replace('@', '');
}

const baseExternal = ['react', 'react-dom', 'react/jsx-runtime'];

libs
  .filter(lib => lib.copyFrom)
  .forEach(lib => {
    const outputFile = lib.path.replace(/^\//, '');
    mkdirSync(dirname(outputFile), { recursive: true });
    copyFileSync(lib.copyFrom, outputFile);
  });

export default libs.filter(lib => !lib.copyFrom).map(lib => {
  const pkgName = lib.pkg || lib.entry;
  const version = lib.version || getVersion(pkgName);
  const outputName = `${lib.name}@${version}`.replace(/\//g, '__').replace('@', '');
  const exclude = new Set(lib.excludeFromExternal || []);
  const external = [...baseExternal, ...(lib.externals || [])].filter(e => !exclude.has(e));
  const aliasEntries = Object.fromEntries(
    Object.entries(lib.alias || {}).map(([key, value]) => [key, require.resolve(value)])
  );

  return {
    input: `src/${safeName(lib.name)}/index.js`,
    external,
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
      if (warning.code === 'NAMESPACE_CONFLICT') return;
      warn(warning);
    },
    output: {
      file: `dist/${lib.name}@${version}.system.js`,
      format: 'system',
      sourcemap: true,
      inlineDynamicImports: true,
      banner: `/*! ${lib.name}@${version} | Built: ${buildTime} */`
    },
    plugins: [
      {
        name: 'lib-alias',
        resolveId(source) {
          return aliasEntries[source] || null;
        }
      },
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      json(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true
      }),
      terser({
        format: {
          comments: function(node, comment) {
            return comment.value.includes('Built:');
          }
        }
      })
    ]
  };
});
