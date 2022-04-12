#!/usr/bin/env node

const { argv } = require('yargs');
import { readFileSync, writeFileSync, readdirSync, write } from 'fs';
import { execSync } from 'child_process';
if (argv['package-json']) {                 // create dist/package.json (minus devDeps&scripts)
    const packageData = JSON.parse(readFileSync('./package.json', 'utf8'));
    delete packageData.devDependencies;
    delete packageData.scripts;
    const json = JSON.stringify(packageData, null, 2);
    writeFileSync('./dist/package.json', json);
    console.info(json);
} else if (argv['peer-dependencies']) {     // install peer dependencies
    const packageData = JSON.parse(readFileSync('./package.json', 'utf8'));
    const packages = Object
        .entries(packageData.peerDependencies)
        .map(([_package, version]) => `${_package}@${version}`)
    console.log(`start npm i ${packages.join(' ')}`);
    console.log(execSync(`start npm i ${packages.join(' ')}`));
} else {
    console.info([
        `Usage: hawryschuk [options]`,
        '\t--package-json       : copies ./package.json to ./dist with the devDependencies and scripts removed',
        '\t--peer-dependencies  : installs the peer dependencies of the package'
    ].join('\n'));
}
