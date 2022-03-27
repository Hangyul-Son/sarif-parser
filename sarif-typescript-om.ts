import { compile, compileFromFile } from 'json-schema-to-typescript'
import fs from 'fs'

// compile from file
compileFromFile('sarif-schema-2.1.0.json')
  .then(ts => fs.writeFileSync('sarif-schema.ts', ts))


