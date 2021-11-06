const progress = require("cli-progress");
const chalk = require("chalk");
const translator = require("@vitalets/google-translate-api");
const fs = require("fs");

module.exports = async (settings) => {
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