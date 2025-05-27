const fs = require("fs");
const path = require("path");

async function main() {
  try {
    const logPath = process.env["INPUT_LOG_PATH"] || "test-log.txt";
    const resolvedPath = path.resolve(logPath);
    const content = fs.readFileSync(resolvedPath, "utf-8");

    const passed = (content.match(/✓/g) || []).length;
    const failed = (content.match(/✖/g) || []).length;

    console.log(`Test log summary: ${passed} passed, ${failed} failed`);

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("Error parsing test logs:", error);
    process.exit(1);
  }
}

main();
