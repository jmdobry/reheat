'use strict';

var fs = require('fs'),
	Path = require('path'),
	mocha = require('mocha'),
	globals = require('../support/support');

function lookupFiles(path, recursive) {
	var files = [];

	if (!fs.existsSync(path)) {
		path += '.js';
	}
	var stat = fs.statSync(path);
	if (stat.isFile()) {
		return path;
	}

	fs.readdirSync(path).forEach(function (file) {
		file = Path.join(path, file);
		var stat = fs.statSync(file);
		if (stat.isDirectory()) {
			if (recursive) {
				files = files.concat(lookupFiles(file, recursive));
			}
			return;
		}

		var re = new RegExp('\\.(' + ['js'].join('|') + ')$');

		if (!stat.isFile() || !re.test(file) || Path.basename(file)[0] === '.') {
			return;
		}
		files.push(file);
	});

	return files;
}

// Build an array of files to test
var files = lookupFiles(Path.resolve(__dirname, './'), true);

var test = new mocha();

var testGlobals = [];

for (var key in globals) {
	global[key] = globals[key];
	testGlobals.push(globals[key]);
}
test.globals(testGlobals);

test.files = files;

test.run(function (err) {
	process.exit(err);
});


