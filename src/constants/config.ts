import argv from 'minimist'

// console.log(process.argv)

// [
//   'C:\\Program Files\\nodejs\\node.exe',
//   'D:\\Workspace\\NodeJs\\Twitter\\src\\index.ts',
//   '--development'
// ] => node intex.ts --development

const options = argv(process.argv.slice(2)) // get third element in the above array

// console.log(options)
// console.log(options.development) // check the dev environment is development ?

export const isProduction = Boolean(options.production)
