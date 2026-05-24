import { readFileSync } from 'fs';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

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

export default libs.map(lib => {
  const pkgName = lib.pkg || lib.entry;
  const version = getVersion(pkgName);
  const outputName = `${lib.name}@${version}`.replace(/\//g, '__').replace('@', '');

  return {
    input: `src/${safeName(lib.name)}/index.js`,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    output: {
      file: `dist/${lib.name}@${version}.system.js`,
      format: 'system',
      sourcemap: true,
      banner: `/*! ${lib.name}@${version} | Built: ${buildTime} */`
    },
    plugins: [
      resolve(),
      commonjs(),
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
