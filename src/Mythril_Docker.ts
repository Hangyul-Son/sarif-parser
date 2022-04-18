const { exec } = require('child_process');
exec('docker run -v $(pwd):/tmp mythril/myth analyze ' +
    '/tmp/test_contracts/dataset/front_running/FindThisHash.sol --solv 0.4.24 -o jsonv2 > Mythril_output1.txt',
    (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
				console.log(stdout)
        console.log(stderr);
    });