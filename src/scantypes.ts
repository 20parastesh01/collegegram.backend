import fs from 'fs'
import path from 'path'
import * as TJS from 'typescript-json-schema'

function getTsFilePaths(rootPath: string): string[] {
    const tsFilePaths: string[] = []
    function traverseDirectory(currentPath: string) {
        const items = fs.readdirSync(currentPath)
        for (const item of items) {
            const itemPath = path.join(currentPath, item)
            const stats = fs.statSync(itemPath)

            if (stats.isDirectory()) {
                traverseDirectory(itemPath)
            } else if (stats.isFile() && itemPath.endsWith('.ts')) {
                tsFilePaths.push(itemPath)
            }
        }
    }
    traverseDirectory(rootPath)
    return tsFilePaths
}

function extractNamesFromFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf8')
    const matches = content.match(/(?:interface|type|class)\s+(\w+)/g)
    if (matches) {
        return matches.map((match) => match.split(/\s+/)[1])
    }
    return []
}

const settings: TJS.PartialArgs = {
    required: true,
}

const compilerOptions: TJS.CompilerOptions = {
    strictNullChecks: true,
}

const basePath = './src'
const modelFiles = getTsFilePaths(process.cwd() + '/src/modules').filter((a) => a.includes('model') || a.includes('dto'))
const program = TJS.getProgramFromFiles(modelFiles, compilerOptions, basePath)!
const generator = TJS.buildGenerator(program, settings)!

const mySymbols = modelFiles.flatMap((file) => {
    return extractNamesFromFile(file)
})

function processAllOfProperties(obj: any) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const property = obj[key]
            delete obj.required
            if (property.allOf && Array.isArray(property.allOf)) {
                const newAllOf = property.allOf.find((item: any) => item.type !== 'object')
                if (newAllOf) {
                    obj[key] = newAllOf
                }
            }
            if (property.anyOf) {
                obj[key] = { type: 'string' }
            }

            if (property.properties) {
                processAllOfProperties(property.properties)
            }
        }
    }
}

export const customSymbols: any = {}
for (let s of mySymbols) {
    let a: any = generator.getSchemaForSymbol(s)
    delete a.$schema
    if (!a.properties) {
        customSymbols[s] = a
        continue
    }
    let props = JSON.stringify(a.properties)
    try {
        if (a.definitions && props) {
            while (props.includes('#/definitions/')) {
                for (let key in a.definitions) {
                    props = props.replace(`{"$ref":"#/definitions/${key}"}`, JSON.stringify(a.definitions[key]))
                }
            }
        }
        customSymbols[s] = { properties: JSON.parse(props) }
    } catch (e: any) {
        console.log(e.message)
    }
}
processAllOfProperties(customSymbols)
fs.writeFileSync(path.join(process.cwd(), 'src', 'types.ts'), `export type Types = ` + mySymbols.map((a) => `'${a}'`).join('|'))
