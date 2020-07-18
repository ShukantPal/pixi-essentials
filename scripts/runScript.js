const spawnSync = require('child_process').spawnSync;
const path = require('path');
const { RushConfiguration } = require('@microsoft/rush-lib');

const command = process.argv[2];
const rootFolder = path.join(__dirname, '..');
const config = RushConfiguration.loadFromDefaultLocation({ startingFolder: rootFolder });

config.projects.forEach(({ projectFolder }) =>
{
    console.log(projectFolder);
    const output = spawnSync(`npm run --if-present ${command}`, { cwd: projectFolder, shell: true, encoding: 'utf8' });
    const { stderr, stdout } = output;

    console.error(stderr);
    console.log(stdout);
});
