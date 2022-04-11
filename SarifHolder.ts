
import * as fs from "fs";
import * as path from "path";
import csvParser from "csv-parser";
import parse from "csv-parse";
import { ReportingDescriptor, MultiformatMessageString } from './sarif-schema';

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
}