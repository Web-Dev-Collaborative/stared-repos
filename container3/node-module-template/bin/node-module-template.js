#!/usr/bin/env node

var chalk = require('chalk')
var program = require('commander')
var licenses = require('osi-licenses')
var licenseFiles = require('osi-licenses-full')
var githubUsername = require('github-username')
var paramCase = require('param-case')
var titleCase = require('title-case')
var camelCase = require('camel-case')
var sentenceCase = require('sentence-case')
var fs = require('fs')
var path = require('path')
var format = require('util').format
var Handlebars = require('handlebars')
var rimraf = require('rimraf')
var somebody = require('somebody')
var glob = require('glob')
var mkdirp = require('mkdirp')
var spawnSync = require('spawn-sync')
var pkg = require('../package.json')

// Program commands.
program
  .version(pkg.version)
  .description(pkg.description)
  .option('-a, --author [value]', 'set the author information')
  .option('-l, --license [value]', 'set the module license [MIT]', 'MIT')
  .option('-u, --username [value]', 'set the repository github username')
  .option('-r, --repo [value]', 'set the module repository name on github')
  .option('-d, --dev', 'create a dev package')
  .parse(process.argv)

// Exit when no arguments.
if (!program.args.length) {
  program.help()
  process.exit()
}

var license = program.license

// Add whitespace below command line.
log()

// Exit on unknown license.
if (!licenses.hasOwnProperty(license)) {
  log('Unknown license (%s), use one of:', license)
  log()
  log(Object.keys(licenses).join(', '))
  log()

  process.exit()
}

// Set the author string.
var author = program.author || somebody.stringify({
  name: require('git-user-name'),
  email: require('git-user-email')
})

if (!author) {
  log(
    'Unable to get author name and email, run with %s option',
    chalk.bold('--author')
  )
  log()

  process.exit()
}

var moduleName = paramCase(program.args[0])
var email = somebody.parse(author).email
var licenseName = licenses[license]
var username = program.username
var repoName = program.repo || moduleName

if (!username && !email) {
  log(
    'Unable to find GitHub username, run with %s option',
    chalk.bold('--username')
  )
  log()

  process.exit()
}

log('Using author: %s', chalk.bold(author))
log('Using license: %s', chalk.bold(licenseName))
log('Using module name: %s', chalk.bold(moduleName))
log('Using repository name: %s', chalk.bold(repoName))

// Use passed in username, or search GitHub for your email.
if (!username) {
  log()
  log(chalk.dim('Searching GitHub usernames for "%s"...'), email)
  log()

  githubUsername(email, function (err, username) {
    if (err) {
      log(chalk.red('Unable to find GitHub username for "%s"'), email)
      log()

      return
    }

    return createModuleWithUsername(username)
  })
} else {
  createModuleWithUsername(username)
}

/**
 * Create a module for username.
 *
 * @param {String} username
 */
function createModuleWithUsername (username) {
  log('Using username: %s', chalk.bold(username))
  log()

  return createModule(path.join(process.cwd(), repoName), {
    moduleName: moduleName,
    moduleTitle: titleCase(moduleName),
    moduleVariable: camelCase(moduleName),
    moduleSentence: sentenceCase(moduleName),
    author: author,
    repoName: repoName,
    dev: program.dev,
    description: '',
    username: username,
    license: license,
    licenseName: licenseName,
    moduleGit: format('git://github.com/%s/%s.git', username, repoName),
    moduleSsh: format('git@github.com:%s/%s.git', username, repoName),
    moduleHomepage: format('https://github.com/%s/%s', username, repoName)
  })
}

/**
 * Create a module folder.
 *
 * @param {String} destDir
 * @param {Object} opts
 */
function createModule (destDir, opts) {
  var srcDir = path.join(__dirname, '../src')

  log(chalk.dim('Creating module...'))
  log()

  /**
   * Write a file to the filesystem.
   *
   * @param {String} destFile
   * @param {String} contens
   */
  function writeFile (basename, contents) {
    var filename = path.join(destDir, basename)

    log('Writing "%s" to filesystem...', filename)

    mkdirp.sync(path.dirname(filename))
    fs.writeFileSync(filename, contents)
  }

  /**
   * Create a file in the destination directory.
   *
   * @param {String} filename
   */
  function generateFile (filename) {
    var contents = fs.readFileSync(path.join(srcDir, filename), 'utf8')
    var template = Handlebars.compile(contents)

    // Remove underscore prefix from base filename.
    var outFilename = path.join(
      path.dirname(filename),
      path.basename(filename).replace(/^_/, '')
    )

    writeFile(outFilename, template(opts))
  }

  try {
    // Create the destination directory.
    fs.mkdirSync(destDir)
  } catch (e) {
    log(chalk.red('Directory "%s" already exists'), destDir)
    log()

    return
  }

  try {
    // Copy files into destination directory.
    glob.sync('**/_*', { cwd: srcDir, nodir: true }).forEach(generateFile)

    // Write dynamic files.
    writeFile('LICENSE', licenseFiles[license])
    log()
  } catch (err) {
    // Remove everything if an error occurs.
    rimraf.sync(destDir)

    // Rethrow errors.
    log(chalk.red(err.message))
    log()

    return
  }

  spawnSync('git', ['init'], { cwd: destDir })
  spawnSync('git', ['remote', 'add', 'origin', opts.moduleSsh], { cwd: destDir })

  log('Git remote %s added', chalk.yellow(opts.moduleSsh))
  log()
  log(
    'Done! Remember to update %s with the year and author name',
    chalk.magenta('LICENSE')
  )
  log()
  log(chalk.yellow('cd %s'), destDir)
  log()
}

/**
 * Log strings to the terminal.
 */
function log () {
  console.log(format.apply(null, arguments))
}
