const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const attacks = fs.readdirSync("./dataset2");

async function run() {
  console.log("Starting Mythril security analysis upon src/dataset2");
  for (const file in attacks) {
    await scanOnAttackBasis(attacks[file]);
  }
}

async function scanOnAttackBasis(file: string): Promise<void> {
  const filePath = "." + path.join("/dataset2", file);
  if (fs.statSync(filePath).isDirectory()) {
    const contractsRepositories = fs.readdirSync(filePath);
    for (const contractRepo in contractsRepositories) {
      await scanOnFileBasis(filePath, contractsRepositories[contractRepo]);
    }
  }
  return;
}

async function scanOnFileBasis(
  filePath: string,
  contractAddress: string
): Promise<void> {
  const contractPath = "./" + path.join(filePath, contractAddress);
  if (fs.statSync(contractPath).isDirectory()) {
    const contractName = contractAddress.split("-")[0];
    await locateSolidityFile(contractPath, contractName);
  }
  return;
}

async function locateSolidityFile(
  filePath: string,
  contractName: string
): Promise<void> {
  const files = fs.readdirSync(filePath);
  for (const fileName in files) {
    await mythrilExecute(files[fileName], filePath, contractName);
  }
  return;
}

async function mythrilExecute(
  fileName: string,
  filePath: string,
  contractName: string
): Promise<void> {
  if (fileName === contractName + ".sol") {
    console.log("\n\nStarting Mytrhil analysis of " + fileName);
    const accessPoint = filePath.substring(1) + "/" + fileName;
    let mythrilResult = execSync(
      "docker run -v $(pwd):/tmp mythril/myth analyze /tmp/" +
        accessPoint +
        " -o jsonv2 --max-depth 15",
      { stdio: "inherit" }
    );
    fs.writeFileSync(
      filePath + "/" + contractName + ".log",
      mythrilResult.toString()
    );
    return;
  }
  const appendedFilePath = "./" + path.join(filePath, fileName);
  if (fs.statSync(appendedFilePath).isDirectory()) {
    locateSolidityFile(appendedFilePath, contractName);
  } else {
    return;
  }
}

run();
fs.readdirSync("../src/").forEach((file) => {
  if (file.startsWith(".solcx-lock")) {
    fs.unlinkSync("../src/" + file);
  }
});
