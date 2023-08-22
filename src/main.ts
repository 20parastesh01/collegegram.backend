import { makeApp } from './api'
import { AppDataSource } from './data-source'

const PORT = 3000
AppDataSource.initialize().then(async (dataSource) => {
    const app = makeApp(dataSource)
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`)
    })
})
