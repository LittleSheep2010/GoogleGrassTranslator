#! /usr/bin/env node

const { google } = require("translate-platforms");
const prompts = require("prompts");
const chalk = require("chalk");
const fs = require("fs");
const progress = require('cli-progress');

const languages = require("./language.js");

async function configure() {
    let amount = await prompts({
        type: "number",
        name: "amount",
        message: "What translate amount(execute chain amount) do you need?"
    });

    amount = amount.amount;

    if(amount == null) {
        console.log(chalk.red("✖ ") + chalk.bold(`Please input!`));
        process.exit(0);
    }

    let chain = await prompts({
        type: "text",
        name: "chain",
        message: "Please enter translate chain, use \"->\" split(first language is file origin language)"
    })

    if(chain.length == null) {
        console.log(chalk.red("✖ ") + chalk.bold(`Please input right words!`));
        process.exit(0);
    }

    chain = chain.chain.split("->");

    let chain_display = "";
    chain.forEach(line => {
        if(languages.support_list.indexOf(line) === -1) {
            console.log(chalk.red("✖ ") + chalk.bold(`Cannot found language ${line} in language list!`));
            process.exit(0);
        }

        chain_display += line + ", ";
    })

    chain_display = chain_display.slice(0, -2);
    console.log(chalk.cyan("! ") + chalk.bold("Translate chain: ") + chain_display);

    let file = await prompts({
        type: "text",
        name: "file",
        message: "Please drag file in there or enter full path"
    });

    file = file.file;

    let origin = fs.existsSync(file) ? fs.readFileSync(file) : null
    if(origin == null) {
        console.log(chalk.red("✖ ") + chalk.bold(`Please input right address!`));
        process.exit(0);
    }

    origin = origin.toString()
    let output = file + ".out"

    return { origin, output, amount, chain }
}

async function makeGrass() {
    const settings = await configure();

    let working_progress = new progress.SingleBar({
        format: 'Translating |' + chalk.green('{bar}') + '| {percentage}% || {value}/{total} Work(s)',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });

    working_progress.start(settings.amount * settings.chain.length + 1, 0);

    let content = settings.origin;
    for(let i = 0; i < settings.amount; i++) {
        for(let i = 1; i <= settings.chain.length; i++) {
            try {
                content = await google(content, {to: settings.chain[i]})
                content = content.text;
            }

            catch(error) {
                console.log(chalk.red("✖ ") + chalk.bold(`Translate failed at process work ${i}! Wait 10 seconds continue and restart.` +
                `If you want exit, please press Ctrl-C`));

                // Wait 10 seconds
                new Promise((resolve) => { setTimeout(resolve, 10 * 1000); });

                i--;
                working_progress.increment(-1);
            }

            working_progress.increment();
        }
    }

    // Last translate
    content = await google(content, {to: settings.chain[0]})
    content = content.text;
    working_progress.increment();
    working_progress.stop();

    console.log(chalk.green("✔ ") + "Translated! Writing result to file... ");
    fs.writeFileSync(settings.output, content, { flag: "w" });

    console.log(chalk.green("✔ ") + "All are set!");
    process.exit(0);
}

// Exit Listener
process.on('SIGINT', () => {
    console.log(chalk.bold.red("! ") + chalk.red("You stop the task, all changes will reset!"));
    process.exit(0);
});

// Output some information
console.log(chalk.cyan("- ") + chalk.bold.grey("Author: LittleSheep_"));
console.log(chalk.cyan("- ") + chalk.bold.grey("Welcome use GoogleGrassTranslate!"));
console.log(chalk.cyan("- ") + chalk.bold.grey("You are running GrassTranslator v0.21"));

makeGrass()