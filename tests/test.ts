import { Mythril } from "../src/Mythril/Mythril";
import { Oyente } from "../src/Oyente/Oyente";
// @ts-ignore
import * as fs from "fs";
import { StaticAnalysisResultsFormatSARIFVersion210JSONSchema } from "../src/sarif-schema";
async function testOyente(): Promise<void> {
  const filecontent = fs.readFileSync("./Oyente_Test/Oyente_Output.txt");
  const oyente = new Oyente(); //It would be nice to intialize the csv here
  const oyenteOutput = await oyente.parseSarif(
    filecontent.toString(),
    "Oyente_Test/Oyente_Output.txt"
  );
  let runs = [oyenteOutput];
  const final_result: StaticAnalysisResultsFormatSARIFVersion210JSONSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    runs: runs,
    version: "2.1.0",
  };
  fs.writeFileSync(
    "./Oyente_Test/Oytente_SARIF_Output.json",
    JSON.stringify(final_result, null, 2),
    "utf8"
  );
}
async function testMythril(): Promise<void> {
  const filecontent = fs.readFileSync("./Mythril_Test/Mythril_output.txt");
  const mythril = new Mythril();
  let mythril_outputs;
  try {
    mythril_outputs = JSON.parse(filecontent.toString());
  } catch (e) {
    console.log(e + "\n");
    console.log("Error parsing JSON\n");
    return;
  }
  let runs = [];
  let properties = {};
  for (let i = 0; i < mythril_outputs.length; i++) {
    runs.push(
      await mythril.parseSarif(
        mythril_outputs[i],
        "Mythril_Test/Mythril_output.txt"
      )
    );
    properties[i + 1] = mythril_outputs[i].meta.logs;
  }
  const final_result: StaticAnalysisResultsFormatSARIFVersion210JSONSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    runs: runs,
    version: "2.1.0",
    properties: properties,
  };
  fs.writeFileSync(
    "./Mythril_Test/Mythril_SARIF_output.json",
    JSON.stringify(final_result, null, 2),
    "utf8"
  );
}

testOyente();
testMythril();
