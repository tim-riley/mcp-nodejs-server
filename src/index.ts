#!/usr/bin/env node
import {GentoroServer} from "./server.js";
async function main() {
    await new GentoroServer().start();
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
