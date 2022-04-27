import { SarifHolder } from "../SarifHolder";
import { ToolComponent, Run } from "../sarif-schema";

export class Mythril {
  sarifHolder: any;
  constructor() {
    this.sarifHolder = new SarifHolder();
  }
  async parseSarif(
    output_results: any,
    file_path_in_repo: string
  ): Promise<Run> {
    await this.sarifHolder.readCSV();
    let resultsList = [];
    let logicalLocationsList = [];
    let rulesList = [];
    const issues: [] = output_results["issues"];
    if (issues.length == 0) {
      return {
        tool: undefined,
        artifacts: undefined,
        logicalLocations: undefined,
        results: undefined,
      };
    }
    for (const issue of issues) {
      const logicalLocation = this.sarifHolder.parseLogicalLocation(
        issue["function"],
        "function"
      );
      const rule = this.sarifHolder.parseRule(
        "mythril",
        issue["swcTitle"],
        issue["description"]
      );
      const result = this.sarifHolder.parseResult(
        "mythril",
        issue["swcTitle"],
        issue["severity"],
        file_path_in_repo,
        issue["lineno"],
        Object.keys(issue).includes("code") ? issue["code"] : undefined
        // logicalLocation
      );
      if (!logicalLocationsList.includes(logicalLocation)) {
        logicalLocationsList.push(logicalLocation);
      }
      resultsList.push(result);
      if (!rulesList.includes(rule)) {
        rulesList.push(rule);
      }
    }
    const artifact = this.sarifHolder.parseArtifact(
      file_path_in_repo,
      "solidity"
    );
    const toolComponent = this.sarifHolder.parseToolComponent(
      "Mythril",
      "0.4.25",
      rulesList,
      "https://mythx.io",
      {
        text:
          "Mythril analyses EVM bytecode using symbolic analysis, taint analysis " +
          "and control flow checking to detect a variety of security vulnerabilities.",
      }
    );
    return {
      artifacts: [artifact],
      logicalLocations: logicalLocationsList,
      results: resultsList,
      tool: { driver: toolComponent },
    };
  }
}

//Task1 check for issue["description"] content
//Tast2 check for interfaces that are not present is sarif-schema.ts
//MESSAGE, PHYSICAL_LOCATION, REGION, ARTIFACT_LOCATION
