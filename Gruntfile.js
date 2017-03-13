var path = require("path");

module.exports = function (grunt, options) {
	var scaffoldingDir = path.dirname( require.resolve("scaffolding") );
	var scaffoldingRelativePath = path.relative(process.cwd(), scaffoldingDir);

	var getPaidPostConfig = require("scaffolding/grunt-support/getPaidPostConfig");
	var PaidPost = getPaidPostConfig(grunt, scaffoldingRelativePath);

	require('load-grunt-config')(grunt, {
		configPath: [
			// Look for Grunt tasks specified by the `scaffolding` NPM package
			path.join(scaffoldingDir, 'grunt'),
			path.join(process.cwd(), 'grunt')
		],
		data: {
			PaidPost: PaidPost
		},
		jitGrunt: true
	});
};