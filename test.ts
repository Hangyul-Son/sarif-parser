import {Mythril} from "./src/Mythril";
// @ts-ignore
import * as fs from 'fs';
import { Run, StaticAnalysisResultsFormatSARIFVersion210JSONSchema} from "./src/sarif-schema";
import {SarifHolder} from "./src/SarifHolder";


async function main(): Promise<void> {
	const filecontent = fs.readFileSync('Mythril_output.txt');
	const mythril = new Mythril();
	let mythril_outputs;
	try{
			 mythril_outputs = JSON.parse(filecontent.toString());
	} catch (e){
			console.log("Error parsing JSON");
	}
	let runs = [];
	let properties = {};
	for(let i = 0; i < mythril_outputs.length; i++){
			runs.push(await mythril.parseSarif(mythril_outputs[i], process.cwd()));
			properties[i+1] = mythril_outputs[i].meta.logs;
	}
	const final_result : StaticAnalysisResultsFormatSARIFVersion210JSONSchema = {
			$schema: "http://json-schema.org/draft-07/schema#",
			runs: runs,
			version: "2.1.0",
			properties: properties
	}
	fs.writeFileSync('Mythril_SARIF_output.json', JSON.stringify(final_result, null, 2), 'utf8');
}

main();
