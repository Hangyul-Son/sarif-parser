
import * as fs from "fs";
import * as path from "path";
import csvParser from "csv-parser";
import parse from "csv-parse";
import { Result, ReportingDescriptor, MultiformatMessageString, Location, PhysicalLocation, ArtifactLocation, Region} from './sarif-schema';

// type SarifVulnerabilityMapping = {
//   Tool: string;
//   RuleId: string;
//   Vulnerability: string;
//   Type: string;
// };

// const csvFilePath = path.resolve(__dirname, 'sarif_vulnerability_mapping.csv');

export class SarifHolder {
	VULNERABILITY_MAP : Object;
	constructor() {
		const headers = ["Tool", "RuleId", "Vulnerability", "Type"];
		fs.createReadStream("sarif_vulnerability_mapping.csv")
		.pipe(csvParser({ headers: headers }))
		.on("data", (row: any) => {
			if (this.VULNERABILITY_MAP[row.Tool] == undefined) {
				this.VULNERABILITY_MAP[row.Tool] = [];
			}
			this.VULNERABILITY_MAP[row.Tool].push({
				RuleID: row["RuleId"],
				Vulnerability: row["Vulnerability"],
				Type: row["Type"],
			})
		});
	};
	public parseResult(tool: string, vulnerability: string, level: string, uri: string, 
		line: number, end_line: number, column: number, snippet: string, logicalLocation: string) {
		const identified =	this.identifyVulnerability(tool, vulnerability);
		const parsedLevel : "none" | "note" | "warning" | "error" = this.parseLevel(level);
		const artifactLocation : ArtifactLocation = {uri : uri};
		const region : Region = {
			startLine : line,
			endLine : end_line,
			startColumn: column,
		}
		const physicalLocation : PhysicalLocation = {
			artifact_location : artifactLocation,
			region : region,
			snippet : snippet
		};
		const location : Location[] = [{ 
			physicalLocation : physicalLocation,
		}];
		// const locations : Location[] = [location];
		//Logical Location out of control
		const result : Result = {
			ruleId : identified['RuleID'],
			message:  {text: identified['Vulnerability'],},
			level: parsedLevel,
			locations : location,
		}
		return result;
	}


	public parseRule(tool: string, vulnerability: string, fullDescription?: string){
		const identified = this.identifyVulnerability(tool, vulnerability);
		if(!fullDescription){
			const shortMessage: MultiformatMessageString = {text: identified['Vulnerability']};
			const reportingDescriptor : ReportingDescriptor = {
				id: identified['RuleID'],
				shortDescription: shortMessage,
				name: identified['Type'] + ' vulnerability',
			};
			return reportingDescriptor;
		}
		else {
			const shortMessage: MultiformatMessageString = {text: identified['Vulnerability']};
			const longMessage: MultiformatMessageString = {text: fullDescription};
			const reportingDescriptor : ReportingDescriptor = {
				id: identified['RuleID'],
				shortDescription: shortMessage,
				fullDescription: longMessage,
				name: identified['Type'] + ' vulnerability',
			};
			return reportingDescriptor;
		}
	}
	public identifyVulnerability(tool: string, vulnerability_msg: string) : object{
		const tool_vulnerabilities = this.VULNERABILITY_MAP[tool];
		for (const vulnerability of tool_vulnerabilities) {
			if (vulnerability_msg.includes(vulnerability.Vulnerability) || vulnerability.Vulnerability.includes(vulnerability_msg))  {
				return vulnerability;
			}
		}
		return {
			RuleID: 'undefined',
			Vulnerability: vulnerability_msg,
			Type: 'undefined',
		}
	}

//given a level produced by a tool, returns the level in SARIF format
 parseLevel(level: string) : "none" | "note" | "warning" | "error" {
    if(level.toLowerCase() == "warning" || level.toLowerCase() == "warnings" || level.toLowerCase() == "medium"){
			return "warning"
		}
		if(level.toLowerCase() == "error" || level.toLowerCase() == "violations" || level.toLowerCase() == "high"){
			return "error";
		}
		if(level.toLowerCase() == "note" || level.toLowerCase() == "conflicts" || level.toLowerCase() == "informational"){
			return "note";
		}
    if(level.toLowerCase() == "none" || level.toLowerCase() == "safe"){
			return "none";
		}
    return "warning"
	}
}