const app = require('./express/init')
const chalk = require('chalk')
require('./mongoose/connect')

const port = process.env.PORT || 3000

app.listen(
    port,
    () => {
        console.log(chalk.green('express up on ') + chalk.green.inverse(port));
    }
)

const test = () => {
    const date = new Date(0)
    console.log(date)
}

test()