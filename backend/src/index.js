import connectDB from './db/index.js'
import config from './config/config.js'
import app from './app.js'

/* OLD IMPLEMENTATION - KEPT FOR REFERENCE
connectDB().then(() => {
    app.listen(config.port, () => {
        console.log(`The server is runing on http://localhost:${config.port}`)
    })
}).catch((mongodbError) => {
    console.error(mongodbError)
})
*/

// NEW VERCEL-COMPATIBLE IMPLEMENTATION
if (process.env.VERCEL !== "1") {
    connectDB().then(() => {
        app.listen(config.port, () => {
            console.log(`RedirectHQ API listening on port ${config.port}`)
        })
    }).catch((mongodbError) => {
        console.error("MongoDB startup failed:", mongodbError)
        process.exitCode = 1
    })
}

export default app