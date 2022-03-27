import './sarif-schema.ts'
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';

type SarifVulnerabilityMapping = {
	Tool: string,
	RuleId: string,
	Vulnerability: string,
	Type: string,
}

// const csvFilePath = path.resolve(__dirname, 'sarif_vulnerability_mapping.csv');
const headers = ['Tool', 'RuleId', 'Vulnerability', 'Type'];
let VULNERABILITY_MAP : any = {};
const parse_csv = async () => {
		await new Promise(() => {
			fs.createReadStream('sarif_vulnerability_mapping.csv').pipe(csvParser({ headers: headers })).on('data', (row: any) => {
			if (VULNERABILITY_MAP[row.Tool as string] == undefined) {
 				VULNERABILITY_MAP[row.Tool as string] = [];
			}
			VULNERABILITY_MAP[row.Tool as string].push({ RuleID: row['RuleId'], Vulnerability: row['Vulnerability'], Type: row['Type'] });
		}).on('end', ()=> {console.log("finished");}
		);});
		console.log(VULNERABILITY_MAP['manticore']);
}

	// console.log(VULNERABILITY_MAP['maian'])
	
parse_csv();

class Mythril {
	constructor(){
		// console.log(VULNERABILITY_MAP);
	}	
	async parseSarif(mythril_output_results : any, file_path_in_repo: string) {
		let resultsList = [];
		let logicalLocationsList = [];
		let rulesList = [];
		let output_results;
		try {
			output_results = JSON.parse(mythril_output_results);
		} catch (e) {
			console.error("Error parsing mythril output: " + e);
			return;
		}
		const issues = output_results["anaylsis"]["issues"];
		
		for(const issue of issues) {
		}
	}
}

