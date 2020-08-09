import path from 'path';
import resolve from 'rollup-plugin-node-resolve';
import { string } from 'rollup-plugin-string';
import sourcemaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript';
import minimist from 'minimist';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import fs from 'fs';
import { RushConfiguration } from '@microsoft/rush-lib';

/**
 * Returns the root packageJSON
 */
function getRepositoryJson()
{
    const jsonPath = path.join(__dirname, 'package.json');
    const jsonContents = fs.readFileSync(jsonPath, 'utf8');

    return JSON.parse(jsonContents);
}

/**
 * Get a list of the non-private sorted packages with rush-lib.
 *
 * @see https://rushstack.io/pages/api/rush-lib.rushconfigurationproject/
 * @returns {PackageJson}
 */
function getSortedPackages(scope, ignore)
{
    const config = RushConfiguration.loadFromConfigurationFile(path.join(__dirname, 'rush.json'));
    const packages = config.projects;
    const filtered = packages.filter((project) =>
    {
        const packageName = project.packageName;

        if (scope && !packageName.includes(scope))
        {
            return false;
        }
        if (ignore && packageName.includes(ignore))
        {
            return false;
        }

        return true;
    });
    const sorted = filtered.sort((p0, p1) =>
    {
        if (p0.downstreamDependencyProjects.includes(p1))
        {
            return -1;
        }
        if (p1.downstreamDependencyProjects.includes(p0))
        {
            return 1;
        }

        return 0;
    });

    const packageJsons = sorted
        .map((project) => fs.readFileSync(path.join(project.projectFolder, 'package.json'), 'utf8'))
        .map((packageJsonContents, i) =>
        {
            const project = sorted[i];
            const packageJson = JSON.parse(packageJsonContents);

            packageJson.location = project.projectFolder;

            return packageJson;
        });

    return packageJsons;
}

async function main()
{
    const repo = getRepositoryJson();
    const plugins = [
        sourcemaps(),
        resolve({
            browser: true,
            preferBuiltins: false,
        }),
        commonjs({
            namedExports: {
                'resource-loader': ['Resource'],
            },
        }),
        typescript(),
        string({
            include: [
                '**/*.frag',
                '**/*.vert',
            ],
        }),
        replace({
            __VERSION__: repo.version,
        }),
    ];

    const compiled = (new Date()).toUTCString().replace(/GMT/g, 'UTC');
    const sourcemap = true;
    const results = [];

    // Support --scope and --ignore globs if passed in via commandline
    const { scope, ignore } = minimist(process.argv.slice(2));
    const packages = getSortedPackages(scope, ignore);

    const namespaces = {};
    const pkgData = {};

    // Create a map of globals to use for bundled packages
    packages.forEach((pkg) =>
    {
        const data = pkg;

        pkgData[pkg.name] = data;
        namespaces[pkg.name] = data.namespace || 'PIXI';
    });

    packages.forEach((pkg) =>
    {
        let banner = [
            `/*!`,
            ` * ${pkg.name} - v${pkg.version}`,
            ` * Compiled ${compiled}`,
            ` *`,
            ` * ${pkg.name} is licensed under the MIT License.`,
            ` * http://www.opensource.org/licenses/mit-license`,
            ` * `,
            ` * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved`,
            ` * `,
            ` */`,
        ].join('\n');

        // Check for bundle folder
        const external = Object.keys(pkg.peerDependencies || []);
        const basePath = path.relative(__dirname, pkg.location);

        let input = path.join(basePath, 'src/index.ts');

        // TODO: remove check once all packages have been converted to typescript
        if (!fs.existsSync(input))
        {
            input = path.join(basePath, 'src/index.js');
        }

        const {
            main,
            module,
            bundle,
            bundleInput,
            bundleOutput,
            bundleNoExports,
            standalone } = pkgData[pkg.name];
        const freeze = false;

        results.push({
            input,
            output: [
                {
                    banner,
                    file: path.join(basePath, main),
                    format: 'cjs',
                    freeze,
                    sourcemap,
                },
                {
                    banner,
                    file: path.join(basePath, module),
                    format: 'esm',
                    freeze,
                    sourcemap,
                },
            ],
            external,
            plugins,
        });

        // The package.json file has a bundle field
        // we'll use this to generate the bundle file
        // this will package all dependencies
        if (bundle)
        {
            const input = path.join(basePath, bundleInput || 'src/index.ts');

            const file = path.join(basePath, bundle);
            // const external =  standalone ? null : Object.keys(namespaces);
            const globals = {
                '@pixi/ticker': 'PIXI',
                'pixi.js': 'PIXI',
            };
            const ns = namespaces[pkg.name];
            const name = pkg.name.replace(/[^a-z]+/g, '_');
            let footer;

            // Ignore self-contained packages like polyfills and unsafe-eval
            // as well as the bundles pixi.js and pixi.js-legacy
            if (!standalone)
            {
                if (bundleNoExports !== true)
                {
                    footer = `Object.assign(this.${ns}, ${name});`;
                }

                if (ns.includes('.'))
                {
                    const base = ns.split('.')[0];

                    banner += `\nthis.${base} = this.${base} || {};`;
                }

                banner += `\nthis.${ns} = this.${ns} || {};`;
            }

            results.push({
                input,
                external,
                output: Object.assign({
                    banner,
                    file,
                    format: 'iife',
                    freeze,
                    globals,
                    name,
                    footer,
                    sourcemap,
                }, bundleOutput),
                treeshake: false,
                plugins: [...plugins, terser()],
            });
        }
    });

    return results;
}

export default main();
