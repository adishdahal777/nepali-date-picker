import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';

// Use JSON.parse for ES modules
import { readFileSync } from 'fs';
const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
);

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'NepaliDatePicker',
        sourcemap: true,
        globals: {},
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
      }),
      postcss({
        modules: false,
        extract: 'styles.css',
        minimize: true,
      }),
      terser(),
    ],
    external: Object.keys(packageJson.peerDependencies || {}),
  },
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [
      // Add a plugin to handle CSS imports in .d.ts files
      {
        name: 'ignore-css-imports',
        resolveId(source) {
          if (source.endsWith('.css')) {
            return { id: 'empty-css-module', external: true };
          }
          return null;
        }
      },
      dts(),
    ],
  },
];