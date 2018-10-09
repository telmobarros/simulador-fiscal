var compressor = require('node-minify');

compressor.minify({
	compressor: 'gcc',
	input: './javascripts/app.js',
	output: './dist/javascripts/app.js',
	callback: function(err, min) {}
});

compressor.minify({
	compressor: 'clean-css',
	input: './stylesheets/style.css',
	output: './dist/stylesheets/style.css',
	callback: function(err, min) {}
});

//plain copy
var fs = require('fs');

fs.createReadStream('./images/favicon.png').pipe(fs.createWriteStream('./dist/images/favicon.png'));
fs.createReadStream('./images/loading.svg').pipe(fs.createWriteStream('./dist/images/loading.svg'));
fs.createReadStream('./images/logo.png').pipe(fs.createWriteStream('./dist/images/logo.png'));
fs.createReadStream('./partials/calculo.htm').pipe(fs.createWriteStream('./dist/partials/calculo.htm'));
fs.createReadStream('./partials/footer.htm').pipe(fs.createWriteStream('./dist/partials/footer.htm'));
fs.createReadStream('./partials/index.htm').pipe(fs.createWriteStream('./dist/partials/index.htm'));
fs.createReadStream('./partials/resultado.htm').pipe(fs.createWriteStream('./dist/partials/resultado.htm'));
fs.createReadStream('./index.html').pipe(fs.createWriteStream('./dist/index.html'));
fs.createReadStream('./index.html').pipe(fs.createWriteStream('./dist/404.html'));
fs.createReadStream('./index.html').pipe(fs.createWriteStream('./404.html'));