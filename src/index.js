const { server } = require('./express/init')
const chalk = require('chalk')
require('./mongoose/connect')
require('../src/socket/chat')

const port = process.env.PORT || 3000

server.listen(
    port,
    () => {
        console.log(chalk.green.inverse('express') + chalk.green(' up on ') + chalk.green.inverse(port));
    }
)