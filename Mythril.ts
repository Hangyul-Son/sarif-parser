import * as SarifHolder from './SarifHolder';




class Mythril {
 	sarifHolder = new SarifHolder.SarifHolder();
  constructor() {
		let resultsList = [];
		let logicalLocationList = [];
		let rulesList = [];	
  }
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
				const rule = this.sarifHolder.parseRule(issue["tool"], issue["vulnerability"], issue["description"]);
				const result = this.sarifHolder
			}
    }
  }


	//Task1 check for issue["description"] content
	//Tast2 check for interfaces that are not present is sarif-schema.ts
	//MESSAGE, PHYSICAL_LOCATION, REGION, ARTIFACT_LOCATION
