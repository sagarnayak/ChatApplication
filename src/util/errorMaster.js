const createGenericError = (errorMessage) => {
    if (!errorMessage)
        return { error: 'Something went wrong. Please try again.' }

    return { error: errorMessage }
}

module.exports = { createGenericError }