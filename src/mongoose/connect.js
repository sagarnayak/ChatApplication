const mongoose = require('mongoose')
const chalk = require('chalk')

mongoose.connect(
    process.env.MONGOOSE_DB_PATH,
    {
        useNewUrlParser: true,
        useCreateIndex: true
    },
    (error) => {
        if (error) {
            console.log(chalk.red('mongoose error : ' + error))
        } else {
            console.log(chalk.green.inverse('mongoose') + chalk.green(' is up'))
        }
    }
)