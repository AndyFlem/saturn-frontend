const fs = require('fs').promises
let metadata
let package

console.log('Incrementing build number...')

fs.readFile('src/metadata.json')
  .then(content => {
    metadata = JSON.parse(content)
    metadata.buildRevision = metadata.buildRevision + 1

    return fs.writeFile('src/metadata.json', JSON.stringify(metadata,null,2))
  })
  .then(() => {
    return fs.readFile('package.json')
  })
  .then(content => {
    package = JSON.parse(content)
    package.version = `${metadata.buildMajor}.${metadata.buildMinor}.${metadata.buildRevision}`
    return fs.writeFile('package.json', JSON.stringify(package,null,2))
  })
  .then(()=>{
    console.log(`Build number incremented to ${package.version}`)
  })
  .catch(err => {
    console.log(err)
  })
