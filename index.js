#! /usr/bin/env node

const chalk = require("chalk");
const LanguageManager = require("language-manager");

const setup = require("./src/Setup")
const makeGrass = require("./src/GrassCreator")
const {getConfigure} = require("./src/Configure")

const languages = new LanguageManager()
    .setType(LanguageManager.ResourceType.Json)
    .setPath("languages")
    .setLang(getConfigure()["masterLanguage"])

console.log(chalk.cyan("- ") + chalk.bold(languages.Val("main")["Details"][0]));
console.log(chalk.cyan("- ") + chalk.bold(languages.Val("main")["Details"][1]));
console.log(chalk.cyan("- ") + chalk.bold(languages.Val("main")["Details"][2] + " v0.21"));

if(getConfigure()["default"]) {
    console.log(chalk.cyan("? ") + chalk.red.bold(languages.Val("main")["Update"]["MasterLanguage"]) + chalk.reset(getConfigure()["masterLanguage"]))
}

(async () => {
    let configure = await setup()
    configure["MasterLanguage"] = getConfigure()["masterLanguage"]
    configure["Tld"] = getConfigure()["translatorTld"]

    await makeGrass(configure)
})()

// Exit Listener
process.on('SIGINT', () => {
    const languages = new LanguageManager()
        .setType(LanguageManager.ResourceType.Json)
        .setPath("languages")
        .setLang("en")

    console.log(chalk.bold.red("! ") + chalk.red(languages.Val("messages")["Quit"]));
    process.exit(0);
});