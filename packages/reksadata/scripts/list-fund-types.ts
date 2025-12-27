import { getFundTypes } from '../dist/index.js'

const fundTypes = getFundTypes()

console.log('Fund Types:')
fundTypes.forEach(type => {
  console.log(`- \`${type}\``)
})
