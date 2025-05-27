const fs = require("fs");
const core = require("@actions/core");

async function main() {
  try {
    const logPath = core.getInput("log-path", { required: true });
    const logContent = fs.readFileSync(logPath, "utf-8");
    console.log("Test log content:", logContent);
    core.setOutput("log-content", logContent);
  } catch (error) {
    core.setFailed(`Error parsing test logs: ${error.message}`);
  }
}

main();
