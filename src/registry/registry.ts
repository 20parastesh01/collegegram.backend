import { Express } from 'express'
import * as fs from 'fs'
import * as path from 'path'
import swaggerUi from 'swagger-ui-dist'
import express from 'express'
import { routes, swaggerObject } from './layer-decorators'

async function importFilesRecursively(dir: string): Promise<void> {
    const files = await fs.readdirSync(dir)

    for (const file of files) {
        const filePath = path.join(dir, file)
        const stats = await fs.statSync(filePath)

        if (stats.isDirectory()) {
            await importFilesRecursively(filePath)
        } else if (stats.isFile() && file.endsWith('.ts') && !file.includes('.spec')) {
            const modulePath = path.relative(process.cwd(), filePath).replace(/\.ts$/, '')
            try {
                let finalPath = `./${modulePath}`
                if (process.env.ENGINE == 'NODE') {
                    finalPath = path.join(process.cwd(), 'dist', finalPath).replace(/\.ts$/, '')
                }
                const importedModule = await import(finalPath)
            } catch (error) {
                console.error(`Error importing module from ${modulePath}:`, error)
            }
        }
    }
}

export async function scan(app: Express) {
    try {
        await importFilesRecursively(path.join(process.cwd(), 'src', 'modules'))
        await importFilesRecursively(path.join(process.cwd(), 'src', 'modules'))
        await importFilesRecursively(path.join(process.cwd(), 'src', 'routes'))
        for (let router of routes) {
            app.use('/api', router)
        }
        const swaggerFilePath = path.join(process.cwd(), 'src', 'registry', 'swagger.json')
        fs.writeFileSync(swaggerFilePath, JSON.stringify(swaggerObject))
        const filePath = swaggerUi.getAbsoluteFSPath() + '/swagger-initializer.js'
        fs.writeFileSync(filePath, fs.readFileSync(filePath).toString().replace('https://petstore.swagger.io/v2/swagger.json', '/api/swagger'))
        app.use('/api/api-docs', express.static(swaggerUi.getAbsoluteFSPath()))
        app.use('/api/swagger', (req, res) => res.sendFile(swaggerFilePath))
    } catch (error) {
        console.error('Error:', error)
    }
}
