const { floss } = require('floss');

function done()
{
    /* eslint-disable-next-line no-console */
    console.log('Done?');
}

try {
    floss({
        path: 'node_modules/@pixi-build-tools/floss-rush-monorepo',
        reporter: 'tap',
        args: []
    }, done);
} catch (e) {
    console.error(e);
    throw e;
}