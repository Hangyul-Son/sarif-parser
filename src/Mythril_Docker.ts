//Personal usage of docker connection
// @ts-ignore
import fs from "fs";

const { exec } = require('child_process');
exec('docker run -v $(pwd):/tmp mythril/myth analyze ' +
    '/tmp/dataset/bad_randomness/blackjack.sol --solv 0.4.2 -o jsonv2 > ../tests/Mythril_output.txt',
    (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(stdout)
        console.log(stderr);
    });