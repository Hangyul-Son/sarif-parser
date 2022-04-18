
import * as fs from "fs";
import * as path from "path";
import csvParser = require('csv-parser'); 
import {
	Result,
	ReportingDescriptor,
	MultiformatMessageString,
	Location,
	PhysicalLocation,
	ArtifactLocation,
	Region,
	LogicalLocation, Artifact, ToolComponent
} from './sarif-schema';

// const csvFilePath = path.resolve(__dirname, 'sarif_vulnerability_mapping.csv');


export class SarifHolder {
	VULNERABILITY_MAP : object;
	constructor() {}
	async readCSV() {
		return new Promise<void>((resolve, reject) => {
			const VULNERABILITY_MAP = {};
			const headers = ["Tool", "RuleId", "Vulnerability", "Type"];
			fs.readFileSync
			fs.createReadStream("./configuration/sarif_vulnerability_mapping.csv")
			.pipe(csvParser({ headers: headers }))
			.on("data", (row: any) => {
				const tool = row['Tool']
				if(!Object.keys(VULNERABILITY_MAP).includes(tool)) {
					VULNERABILITY_MAP[tool] = [];
				}
				VULNERABILITY_MAP[tool].push({
					RuleID: row["RuleId"],
					Vulnerability: row["Vulnerability"],
					Type: row["Type"],
				})
			})
			.on('end', () => {
				this.VULNERABILITY_MAP = VULNERABILITY_MAP;
				resolve();
			})
		});
	}
	public parseResult(tool: string, vulnerability: string, level: string, uri: string, 
		line: number, snippet: string, logicalLocation: LogicalLocation) {
		const identified =	this.identifyVulnerability(tool, vulnerability);
		const location : Location[] = [{
			physicalLocation : {
				artifact_location: {uri: uri},
				region: {startLine: line,},
				snippet: snippet,
			}
		}];
		// const locations : Location[] = [location];
		//Logical Location out of control
		return  {
			ruleId : identified['RuleId'],
			message:  {text: identified['Vulnerability'],},
			level: this.parseLevel(level),
			locations : location,
		}
	}

	public parseRule(tool: string, vulnerability: string, fullDescription?: string){
		const identified = this.identifyVulnerability(tool, vulnerability);
		if(!fullDescription){
			const reportingDescriptor : ReportingDescriptor = {
				id: identified['RuleId'],
				shortDescription: {text: identified['Vulnerability']},
				name: identified['Type'] + ' vulnerability',
			};
			return reportingDescriptor;
		}
		else {
			const reportingDescriptor : ReportingDescriptor = {
				id: identified['RuleID'],
				shortDescription: {text: identified['Vulnerability']},
				fullDescription: {text: fullDescription},
				name: identified['Type'] + ' vulnerability',
			};
			return reportingDescriptor;
		}
	}
	identifyVulnerability(tool: string, vulnerability_msg: string) : object{
		const tool_vulnerabilities = this.VULNERABILITY_MAP[tool];
		console.log("vulnerability_msg: "+vulnerability_msg);
		for (let i=0; i<tool_vulnerabilities.length; i++) {
			let vulnerability = tool_vulnerabilities[i];
			if (vulnerability_msg.includes(vulnerability.Vulnerability as string) || vulnerability.Vulnerability.includes(vulnerability_msg as string))  {
				return {
					RuleId: vulnerability.RuleID,
					Vulnerability: vulnerability.Vulnerability,
					Type: vulnerability.Type,
				};
			}
		}
		return {
			RuleId: 'undefined',
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


	parseLogicalLocation(name: string, kind: string): LogicalLocation {
		return { name: name, kind: kind};
	}

	parseArtifact(uri: string, kind: string): Artifact {
		return {
			location: {uri: uri},
			sourceLanguage: kind
		};
	}
	parseToolComponent(rulesList: any): ToolComponent {
		return {
			name: "mythril",
			version: '0.4.25',
			rules: rulesList,
			informationUri: "https://mythx.io/",
			fullDescription: {
				text: "Mythril analyses EVM bytecode using symbolic analysis, taint analysis " +
					"and control flow checking to detect a variety of security vulnerabilities."
			}
		};
	}
}