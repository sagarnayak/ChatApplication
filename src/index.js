const app = require('./express/init')
const chalk = require('chalk')
require('./mongoose/connect')

const port = process.env.PORT || 3000

app.listen(
    port,
    () => {
        console.log(chalk.green.inverse('express') + chalk.green(' up on ') + chalk.green.inverse(port));
    }
)