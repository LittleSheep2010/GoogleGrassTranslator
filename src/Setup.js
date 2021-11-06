const translator = require("@vitalets/google-translate-api");
const LanguageManager = require("language-manager");
const prompts = require("prompts");
const chalk = require("chalk");
const fs = require("fs");

const languages = new LanguageManager()
    .setType(LanguageManager.ResourceType.Json)
    .setPath("languages")
    .setLang("en-us")

module.exports = async () => {
    const data = await prompts([
        {
            type: "number",
            name: "LoopRound",
            message: languages.Val("setup")["Fields"]["LoopRound"],
            validate: value => value > 20 || value <= 1 ? languages.Val("setup")["Error"]["LoopRound"] : true

        },
        {
            type: "text",
            name: "Workflow",
            message: languages.Val("setup")["Fields"]["Workflow"],
            validate: value => value.split("->").length < 2 ? languages.Val("setup")["Error"]["Workflow"] : true
        },
        {
            type: "text",
            name: "Source",
            message: languages.Val("setup")["Fields"]["Source"],
            validate: value => !fs.existsSync(value) ? languages.Val("setup")["Fields"]["Source"] : true
        }
    ], {
        onCancel() {
            console.log(chalk.red("✖ ") + chalk.bold(languages.Val("setup")["LoopInputMessage"]));
            process.exit(0)
        }
    });

    data["Workflow"].split("->").forEach(work => {
        if (translator.languages[work] == null) {
            console.log(chalk.red("✖ ") + chalk.bold(
                languages.Val("setup")["Error"]["LanguageNotFound"][0] +
                work +
                languages.Val("setup")["Error"]["LanguageNotFound"][1]
            ));
            process.exit(0);
        }
    })

    return {
        LoopRound: data.LoopRound,
        Workflow: data.Workflow.split("->"),
        Source: data.Source,
        Output: data.Source + ".out"
    }
}