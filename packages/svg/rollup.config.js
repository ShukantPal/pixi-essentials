const { main } = require('@pixi-build-tools/rollup-configurator/main');

module.exports = main({
    globals: {
        'd-path-parser': 'dPathParse',
        libtess: 'libtess',
        tinycolor2: 'tinycolor',
    },
});