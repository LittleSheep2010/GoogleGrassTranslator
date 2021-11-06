#! /usr/bin/env node

const chalk = require("chalk");
const LanguageManager = require("language-manager");

const Setup = require("./src/Setup")

const languages = new LanguageManager()
    .setType(LanguageManager.ResourceType.Json)
    .setPath("languages")
    .setLang("en-us")

console.log(chalk.cyan("- ") + chalk.bold(languages.Val("main")["Details"][0]));
console.log(chalk.cyan("- ") + chalk.bold(languages.Val("main")["Details"][1]));
console.log(chalk.cyan("- ") + chalk.bold(languages.Val("main")["Details"][2] + " v0.21"));

(async () => {
    console.log(await Setup())
})()

// Exit Listener
process.on('SIGINT', () => {
    console.log(chalk.bold.red("! ") + chalk.red(languages.Val("messages")["Quit"]));
    process.exit(0);
});