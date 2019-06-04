const mongoose = require('mongoose')

mongoose.connect(
    process.env.MONGOOSE_DB_PATH,
    {
        useNewUrlParser: true,
        useCreateIndex: true
    },
    (error) => {
        if (error)
            console.log('mongoose error : ' + error)
        else
            console.log('mongoose is up')
    }
)