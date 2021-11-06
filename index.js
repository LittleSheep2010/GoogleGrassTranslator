#! /usr/bin/env node

const translator = require("@vitalets/google-translate-api");
const prompts = require("prompts");
const chalk = require("chalk");
const fs = require("fs");
const progress = require('cli-progress');

async function configure() {
    let amount = await prompts({
        type: "number",
        name: "amount",
        message: "What translate amount(execute workflow amount) do you need?"
    });

    amount = amount.amount;

    if(amount == null) {
        console.log(chalk.red("✖ ") + chalk.bold(`Please input!`));
        process.exit(0);
    }

    let workflow = (await prompts({
        type: "text",
        name: "workflow",
        message: "Please enter translate workflow, use \"->\" split(first language is file origin language)",
        validate: value => value.split("->").length < 2 ? "Please input 2 or more available translate workflow!" : true
    })).workflow.split("->");

    if(workflow.length == null) {
        console.log(chalk.red("✖ ") + chalk.bold(`Please input right words!`));
        process.exit(0);
    }

    let workflow_display = "";
    workflow.forEach(work => {
        if(translator.languages[work] == null) {
            console.log(chalk.red("✖ ") + chalk.bold(`Cannot found language ${work} in language list!`));
            process.exit(0);
        }

        workflow_display += work + ", ";
    })

    workflow_display = workflow_display.slice(0, -2);
    console.log(chalk.cyan("! ") + chalk.bold("Translate workflow: ") + workflow_display);

    let file = await prompts({
        type: "text",
        name: "file",
        message: "Please drag file(To copy path) in there or enter full path"
    });

    file = file.file;

    let origin = fs.existsSync(file) ? fs.readFileSync(file) : null
    if(origin == null) {
        console.log(chalk.red("✖ ") + chalk.bold(`Please input right address!`));
        process.exit(0);
    }

    origin = origin.toString()
    let output = file + ".out"

    return { origin, output, amount, workflow }
}

async function makeGrass() {
    const settings = await configure();

    let working_progress = new progress.SingleBar({
        format: chalk.cyan("! ") + 'Translating [' + chalk.green('{bar}') + '] {percentage}% || {value}/{total} Request(s)',
        barCompleteChar: '=',
        barIncompleteChar: '-',
        hideCursor: true
    });

    working_progress.start(settings.amount * settings.workflow.length + 1, 0);

    let content = settings.origin;
    for(let i = 0; i < settings.amount; i++) {
        for(let j = 1; j <= settings.workflow.length; j++) {
            try {
                content = await translator(content, {to: settings.workflow[j], tld: "cn"})
                content = content.text;
            }

            catch(error) {
                console.error(error)
                console.log(chalk.red("✖ ") + chalk.bold(`Translate failed at process work ${i}:${j}! Wait 10 seconds continue and restart.` +
                `If you want exit, please press Ctrl-C`));

                // Wait 10 seconds
                new Promise((resolve) => { setTimeout(resolve, 10 * 1000); });

                j--;
                working_progress.increment(-1);
            }

            working_progress.increment();
        }
    }

    // Last translate
    content = await translator(content, {to: settings.workflow[0], tld: "cn"})
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