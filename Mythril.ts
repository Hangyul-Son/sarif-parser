import * as SarifHolder from './SarifHolder';
import { ToolComponent, Run } from './sarif-schema'



class Mythril {
 	sarifHolder = new SarifHolder.SarifHolder();
  constructor() {
		let resultsList = [];
		let logicalLocationList = [];
		let rulesList = [];	
  }
   parseSarif(mythril_output_results: any, file_path_in_repo: string) : Run {
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
          const logicalLocation = this.sarifHolder.parseLogicalLocation(issue['function'], "function")
          const rule = this.sarifHolder.parseRule("mythril", issue["vulnerability"], issue["description"]);
          const result = this.sarifHolder.parseResult("mythril", issue['title'], issue['type'], file_path_in_repo,
              issue['lineno'], (issue.keys().includes('code')) ? issue['code'] : undefined,
              logicalLocation);
          if (!logicalLocationsList.includes(logicalLocation)) {
              logicalLocationsList.push(logicalLocation);
          }
          resultsList.push(result);
          if (!rulesList.includes(rule)) {
              rulesList.push(rule);
          }
      }
      const artifact = this.sarifHolder.parseArtifact(file_path_in_repo, 'solidity');
      const toolComponent = this.sarifHolder.parseToolComponent(rulesList);
      return {
          tool: {driver: toolComponent},
          artifacts: [artifact],
          logicalLocations: logicalLocationsList,
          results: resultsList
      }
  }
}


	//Task1 check for issue["description"] content
	//Tast2 check for interfaces that are not present is sarif-schema.ts
	//MESSAGE, PHYSICAL_LOCATION, REGION, ARTIFACT_LOCATION
