const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const sucrase = require('@rollup/plugin-sucrase');

function config(input)
{
    return {
        input,
        output: {
            dir: `./public/bundles/${input.split('/').slice(1, -1).join('/')}`,
            format: 'es',
        },
        plugins: [
            nodeResolve(),
            sucrase({
                include: ['**/*.ts'],
                transforms: ['typescript'],
            }),
            commonjs({ }),
        ],
        preserveEntrySignatures: false,
        treeshake: false,
    };
}

module.exports = [
    config('pages/gradients/index.ts'),
    config('pages/texture-allocator/atlas/index.ts'),
    config('pages/texture-allocator/canvas/index.ts'),
];
