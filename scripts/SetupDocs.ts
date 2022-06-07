import fs from "fs";
import path from "path";

function main()
{
	const rootFolder = path.join(__dirname, "..");
	const docsFolder = path.join(rootFolder, "docs");

	// Clean up docs folder
	fs.rmSync(docsFolder, { recursive: true, force: true });
	fs.mkdirSync(docsFolder);
}

main();
