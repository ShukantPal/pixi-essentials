const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const sucrase = require('@rollup/plugin-sucrase');

module.exports = [
  {
    input: './pages/gradients/index.ts',
    output: {
      dir: './public/bundles/gradients',
      format: 'es'
    },
    plugins: [
      nodeResolve(),
      sucrase({
        include: ["**/*.ts"],
        transforms: ['typescript']
      }),
      commonjs({ }),
    ],
    preserveEntrySignatures: false,
    treeshake: false,
  }
];
