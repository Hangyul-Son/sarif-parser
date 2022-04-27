import { SarifHolder } from "../SarifHolder";
import { Run } from "../sarif-schema";

export class Oyente {
  sarifHolder: any;
  constructor() {
    this.sarifHolder = new SarifHolder();
  }

  private extract_result_line(line: string) {
    line = line.replace("INFO:symExec:	  ", "");
    let index_split = line.indexOf(":");
    let key = line.slice(0, index_split);
    console.log("key1: " + key);
    key = key
      .toLowerCase()
      .replace(" ", "_")
      .replace("(", "")
      .replace(")", "")
      .trimEnd();
    console.log("key2: " + key);
    let value = line.slice(index_split + 1).trimEnd();
    console.log("value :", value);
    return { key: key, value: value };
  }

  private parse(str_output: string): object[] {
    let output = [];
    let current_contract = null;
    let lines = str_output.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("INFO:root:")) {
        if (current_contract != null) {
          output.push(current_contract);
        }
        current_contract = {
          errors: [],
        };
        let splited = lines[i].replace("INFO:root:contract ", "").split(":");
        current_contract.file = splited[0];
        current_contract.name = splited[1];
      } else if (lines[i].includes("INFO:symExec:")) {
        let result = this.extract_result_line(lines[i]);
        current_contract[result.key] = result.value;
      } else if (
        current_contract != null &&
        lines[i].includes(current_contract.file)
      ) {
        console.log("lines[i]: " + lines[i] + "\n");

        // if (!lines[i].includes("INFO:symExec:")) {
        //   lines[i] = "INFO:symExec:" + lines[i];
        // }
        let splited = lines[i]
          .replace(current_contract["file"] + ":", "")
          .split(":");
        current_contract["errors"].push({
          line: splited[0],
          column: splited[1],
          level: splited[2].trim(),
          message: splited[3].trim(),
        });
      }
    }
    if (current_contract != null) {
      output.push(current_contract);
    }
    return output;
  }

  async parseSarif(
    oyente_output_results: string,
    file_path_in_repo: string
  ): Promise<Run> {
    await this.sarifHolder.readCSV();
    let resultsList = [];
    let logicalLocationsList = [];
    let rulesList = [];
    let parsedOyenteOutput = this.parse(oyente_output_results);
    for (let analysis of parsedOyenteOutput) {
      for (let issue of analysis["errors"]) {
        let rule = this.sarifHolder.parseRule("oyente", issue["message"]);
        let result = this.sarifHolder.parseResult(
          "oyente",
          issue["message"],
          issue["level"],
          file_path_in_repo,
          issue["line"]
        );
        resultsList.push(result);
        if (!rulesList.includes(rule)) {
          rulesList.push(rule);
        }
      }
      let logicalLocation = this.sarifHolder.parseLogicalLocation(
        analysis["name"]
      );
      if (!logicalLocationsList.includes(logicalLocation)) {
        logicalLocationsList.push(logicalLocation);
      }
    }
    const artifact = this.sarifHolder.parseArtifact(
      file_path_in_repo,
      "Solidity"
    );
    const toolComponent = this.sarifHolder.parseToolComponent(
      "Oyente",
      "0.4.25",
      rulesList,
      "https://oyente.tech/",
      {
        text:
          "Oyente runs on symbolic execution, determines which inputs cause which program branches to execute, to" +
          " find potential security vulnerabilities. Oyente works directly with EVM bytecode without access high level representation and does not provide soundness nor completeness.",
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
