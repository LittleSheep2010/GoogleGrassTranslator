const progressbar = require("cli-progress");
const chalk = require("chalk");
const translator = require("@vitalets/google-translate-api");
const fs = require("fs");

module.exports = async (settings) => {
    let progress = new progressbar.SingleBar({
        format: chalk.cyan("! ") + 'Translating [' + chalk.green('{bar}') + '] {percentage}% || {value}/{total} Request(s)',
        barCompleteChar: '=',
        barIncompleteChar: '-',
        hideCursor: true
    });

    progress.start(settings.LoopRound * settings.Workflow.length + 1, 0);

    let content = settings.Source;
    for(let i = 0; i < settings.LoopRound; i++) {
        for(let j = 1; j <= settings.Workflow.length; j++) {
            try {
                content = await translator(content, {to: settings.Workflow[j], tld: settings.Tld})
                content = content.text;
            }

            catch(error) {
                console.error(error)
                console.log(chalk.red("✖ ") + chalk.bold(`Translate failed at process work ${i}:${j}!` +
                    `If you want exit, please press Ctrl-C`));

                j--;
                progress.increment(-1);
            }

            progress.increment();
        }
    }

    // Last translate
    content = await translator(content, {to: settings.MasterLanguage, tld: settings.Tld})
    content = content.text;
    progress.increment();
    progress.stop();

    console.log(chalk.green("✔ ") + "Translated! Writing result to file... ");
    fs.writeFileSync(settings.Output, content, { flag: "w" });

    console.log(chalk.green("✔ ") + "All are set!");
    process.exit(0);
}