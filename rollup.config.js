import { readFileSync } from 'fs';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const { libraries: libs } = JSON.parse(readFileSync('libs.json', 'utf-8'));

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
      sourcemap: true
    },
    plugins: [resolve(), commonjs(), terser()]
  };
});
