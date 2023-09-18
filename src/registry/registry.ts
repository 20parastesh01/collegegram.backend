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
        } else if (stats.isFile() && file.endsWith('.ts') && !file.includes('spec')) {
            const modulePath = path.relative(process.cwd(), filePath).replace(/\.ts$/, '')
            const esmModulePath = path.relative(__dirname, filePath).replace(/\.ts$/, '')
            try {
                if (process.env.ENGINE == 'NODE') {
                    let finalPath = `./${modulePath}`
                    finalPath = path.join(process.cwd(), 'dist', finalPath).replace(/\.ts$/, '')
                    const importedModule = await import(finalPath)
                } else {
                    let finalPath = `./${esmModulePath}`
                    const importedModule = await import(finalPath)
                }
            } catch (error) {
                console.error(`Error importing module from ${modulePath}:`, error)
            }
        }
    }
}

export async function scan(app: Express) {
    try {
        for (let i = 0; i < 3; i++) await importFilesRecursively(path.join(process.cwd(), 'src', 'modules'))
        await importFilesRecursively(path.join(process.cwd(), 'src', 'routes'))
        for (let router of routes) {
            app.use(router)
        }
        const swaggerFilePath = path.join(process.cwd(), 'src', 'registry', 'swagger.json')
        if (process.env.SWAGGER) fs.writeFileSync(swaggerFilePath, JSON.stringify(swaggerObject))
        const filePath = swaggerUi.getAbsoluteFSPath() + '/swagger-initializer.js'
        fs.writeFileSync(filePath, fs.readFileSync(filePath).toString().replace('https://petstore.swagger.io/v2/swagger.json', '/swagger'))
        app.use('/api-docs', express.static(swaggerUi.getAbsoluteFSPath()))
        app.use('/swagger', (req, res) => res.sendFile(swaggerFilePath))
    } catch (error) {
        console.error('Error:', error)
    }
}
