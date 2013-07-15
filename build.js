// requires
var fs = require('fs')
var crypto = require('crypto')
var swig = require('swig')

// funcs
function hash (str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

// vars
var searches = {
  styles: /~~STYLESHASH~~/,
  content: /~~CONTENT~~/,
  bundle: /~~BUNDLEHASH~~/
}

var files = {
  html: 'orig.html',
  styles: 'styles.css',
  data: 'data.json',
  js: 'main.js'
}

// read files
var strings = {}

for (var f in files) {
  strings[f] = fs.readFileSync(files[f], 'utf8')
}

// hash strings
var hashes = {
  styles: hash(strings.styles).substr(0, 8),
  bundle: hash(strings.js).substr(0, 8)
}

// json
var json = JSON.parse(strings.data)

// templating
var tpl = swig.compileFile(__dirname + '/template.html')
var content = tpl.render(json)

// replace for searches in file
strings.html = strings.html.replace(searches.styles, hashes.styles)
strings.html = strings.html.replace(searches.bundle, hashes.bundle)
strings.html = strings.html.replace(searches.content, content)

// remove old files
var out = 'dist'

if (fs.existsSync(out)) {
  files = fs.readdirSync(out)
  files.forEach(function (file) {
    fs.unlinkSync(out + '/' + file)
  })
  fs.rmdirSync(out)
}

// write new files
fs.mkdirSync(out)

fs.writeFileSync(out + '/styles.' + hashes.styles + '.css', strings.styles)
fs.writeFileSync(out + '/bundle.' + hashes.bundle + '.js', strings.js)
fs.writeFileSync(out + '/index.html', strings.html)

fs.symlink(__dirname + '/favicon.ico', out + '/favicon.ico')
fs.symlink(__dirname + '/images', out + '/images')
