const floss = require('floss');

function done()
{
    /* eslint-disable-next-line no-console */
    console.log('Done?');
}

floss({
    path: 'node_modules/@pixi-build-tools/floss-rush-monorepo',
    quiet: false,
}, done);
