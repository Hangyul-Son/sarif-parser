import * as SarifHolder from './SarifHolder';




class Mythril {
  // constructor() {
	// 	let resultsList = [];
	// 	let logicalLocationList = [];
	// 	let rulesList = [];	
  // }
  async parseSarif(mythril_output_results: any, file_path_in_repo: string) {
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

    for (const issue of issues) {
				
			}
    }
  }
}
