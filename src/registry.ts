import * as fs from 'fs'
import * as path from 'path'
import { DataSource } from 'typeorm'
import { AppDataSource } from './data-source'
import { Express } from 'express'

async function importFilesRecursively(dir: string): Promise<void> {
    const files = await fs.readdirSync(dir)

    for (const file of files) {
        const filePath = path.join(dir, file)
        const stats = await fs.statSync(filePath)

        if (stats.isDirectory()) {
            await importFilesRecursively(filePath)
        } else if (stats.isFile() && file.endsWith('.ts') && !file.includes('.spec')) {
            const modulePath = path.relative(__dirname, filePath).replace(/\.ts$/, '')
            try {
                let finalPath = `./${modulePath}`
                if (process.env.ENGINE == 'NODE') {
                    finalPath = path.join(process.cwd(), 'dist', filePath).replace(/\.ts$/, '')
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
        await importFilesRecursively(path.join('.', 'src', 'modules'))
        await importFilesRecursively(path.join('.', 'src', 'modules'))
        await importFilesRecursively(path.join('.', 'src', 'routes'))
        for (let key in routes) {
            app.use(key, routes[key])
        }
    } catch (error) {
        console.error('Error:', error)
    }
}

export const Service = (...deps: any[]): ClassDecorator => {
    return (target: any) => {
        if (deps.map((dep) => dep.name).every((name) => name in repos)) {
            const newArgs = []
            for (let dep of deps) {
                newArgs.push(repos[dep.name])
            }
            const instance = new target(...newArgs)
            services[target.name] = instance
        }
    }
}

export const Route = (...deps: any[]): ClassDecorator => {
    return (target: any) => {
        console.log(target)
        const basePath = deps.shift()
        if (deps.map((dep) => dep.name).every((name) => name in services)) {
            console.log('all deps')
            const newArgs = []
            for (let dep of deps) {
                newArgs.push(services[dep.name])
            }
            const instance = new target().makeRouter(...newArgs)
            routes[basePath] = instance
        }
    }
}
export const Repo = (): ClassDecorator => {
    return (target: any) => {
        const instance = new target(AppDataSource)
        repos[target.name] = instance
    }
}

const repos: any = {}
const routes: any = {}
const services: any = {}
