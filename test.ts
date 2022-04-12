import {Mythril} from "./Mythril";
const { exec } = require('child_process');
// @ts-ignore
import * as fs from 'fs';
import { Run, StaticAnalysisResultsFormatSARIFVersion210JSONSchema} from "./sarif-schema";
import {SarifHolder} from "./SarifHolder";

// exec('docker run -v $(pwd):/tmp mythril/myth analyze ' +
//     '/tmp/test_contracts/auction2.sol --solv 0.8.0 -o jsonv2 ' +
//     '--execution-timeout 10 > Mythril_output.txt',
//     (err, stdout, stderr) => {
//         if (err) {
//             console.error(err);
//             return;
//         }
//         console.log(stderr);
//     });

const filecontent = fs.readFileSync('Mythril_output.txt');


const mythril = new Mythril();


let mythril_outputs;
try{
     mythril_outputs = JSON.parse(filecontent.toString());
} catch (e){
    console.log("Error parsing JSON");
}
let runs: Run[] =[];
let properties = {};
for(let i = 0; i < mythril_outputs.length; i++){
     runs.push(mythril.parseSarif(mythril_outputs[i], process.cwd()));
     properties[i+1] = mythril_outputs[i].meta.logs;
}
const final_result : StaticAnalysisResultsFormatSARIFVersion210JSONSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    runs: runs,
    version: "2.1.0",
    properties: properties
}
fs.writeFileSync('Mythril_SARIF_output.json', JSON.stringify(final_result, null, 2), 'utf8');
