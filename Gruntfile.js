/**
 * This file is part of Cjdmaid.
 *
 * Cjdmaid program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

module.exports = function(grunt) {
	// Project configuration.

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		jshint: {
			options: {
				"jshintrc": ".jshintrc"
			},
			all: ["json-comments.js", "Gruntfile.js", "test/*.js"]
		},

		simplemocha: {
			options: {
				globals: [],
				timeout: 3000,
				ignoreLeaks: false,
				ui: "bdd",
				reporter: "spec"
			},

			all: {
				src: ["test/*.js"]
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-simple-mocha");

	// Default task(s).
	grunt.registerTask("default", ["jshint", "simplemocha"]);

};
