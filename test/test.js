"use strict";

var assert = require("assert");
var JSONcomments = require("../json-comments");

/* global describe, it */

describe("json-comments", function () {
	describe("#JSONcomments.parse()", function () {

		it("key inheritance", function () {
			var str =
				"{\"k\": \"v\"/*test*//*test*///test\n//test\n}";
			assert.deepEqual(
				JSONcomments.parse(str),
				{"k": "v", "/**/k": "test", "/**//**/k": "test",
					"///**//**/k": "test\ntest"}
			);
		});

		it("block comments in object", function () {
			assert.deepEqual(
				JSONcomments.parse("{/*test*/}"),
				{"/**/": "test"}
			);
			assert.deepEqual(
				JSONcomments.parse("{\"k\":\"v\"/*test*/}"),
				{"k": "v", "/**/k": "test"}
			);
			assert.deepEqual(
				JSONcomments.parse("{\"k\":\"v\",/*test*/\"k2\":\"v2\"}"),
				{"k": "v","/**/k": "test","k2": "v2"}
			);
		});

		it("block comments in array", function () {
			assert.deepEqual(
				JSONcomments.parse("[/**/]"),
				[{"/**/": ""}]
			);
			assert.deepEqual(
				JSONcomments.parse("[1/**/]"),
				[1, {"/**/": ""}]
			);
			assert.deepEqual(
				JSONcomments.parse("[1,/**/2]"),
				[1, {"/**/": ""},2]
			);
		});

		it("line comments in object", function () {
			assert.deepEqual(
				JSONcomments.parse("{//test\n}"),
				{"//": "test"}
			);
			assert.deepEqual(
				JSONcomments.parse("{\"k\":\"v\"//test\n}"),
				{"k": "v", "//k": "test"}
			);
			assert.deepEqual(
				JSONcomments.parse("{\"k\":\"v\",//test\n\"k2\":\"v2\"}"),
				{"k": "v", "//k": "test", "k2": "v2"}
			);
		});

		it("line comments in array", function () {
			assert.deepEqual(
				JSONcomments.parse("[//test\n]"),
				[{"//": "test"}]
			);
			assert.deepEqual(
				JSONcomments.parse("[1//test\n]"),
				[1, {"//": "test"}]
			);
			assert.deepEqual(
				JSONcomments.parse("[1,//test\n2]"),
				[1, {"//": "test"}, 2]
			);
		});


		it("multiple line comments", function () {
			assert.deepEqual(
				JSONcomments.parse("[//test\n//test\n//test\n]"),
				[{"//": "test\ntest\ntest"}]
			);
			assert.deepEqual(
				JSONcomments.parse("[1//test\n//test\n//test\n]"),
				[1, {"//": "test\ntest\ntest"}]
			);
			assert.deepEqual(
				JSONcomments.parse("{//test\n//test\n//test\n}"),
				{"//": "test\ntest\ntest"}
			);
			assert.deepEqual(
				JSONcomments.parse("{\"k\":\"v\"//test\n//test\n//test\n}"),
				{"k": "v", "//k": "test\ntest\ntest"}
			);
		});
	});
	describe("#JSONcomments.stringify()", function () {

		it("block comments in object", function () {
			assert.deepEqual(
				JSONcomments.stringify({"/**/": "test"}),
				"{/*test*/}"
			);
			assert.deepEqual(
				JSONcomments.stringify({"k": "v", "/**/k": "test"}),
				"{\"k\":\"v\"/*test*/}"
			);
			assert.deepEqual(
				JSONcomments.stringify({"k": "v","/**/k": "test","k2": "v2"}),
				"{\"k\":\"v\",/*test*/\"k2\":\"v2\"}"
			);
		});
		it("block comments in array", function () {
			assert.deepEqual(
				JSONcomments.stringify([{"/**/": "test"}]),
				"[/*test*/]"
			);
			assert.deepEqual(
				JSONcomments.stringify([1, {"/**/": "test"}]),
				"[1/*test*/]"
			);
			assert.deepEqual(
				JSONcomments.stringify([1, {"/**/": "test"}, 2]),
				"[1,/*test*/2]"
			);
		});
		it("line comments in object", function () {
			assert.deepEqual(
				JSONcomments.stringify({"//": "test"}),
				"{\n//test\n}"
			);
			assert.deepEqual(
				JSONcomments.stringify({"k": "v", "//k": "test"}),
				"{\"k\":\"v\"\n//test\n}"
			);
			assert.deepEqual(
				JSONcomments.stringify({"k": "v", "//k": "test", "k2": "v2"}),
				"{\"k\":\"v\",\n//test\n\"k2\":\"v2\"}"
			);
		});

		it("line comments in array", function () {
			assert.deepEqual(
				JSONcomments.stringify([{"//": "test"}]),
				"[\n//test\n]"
			);
			assert.deepEqual(
				JSONcomments.stringify([1, {"//": "test"}]),
				"[1\n//test\n]"
			);
			assert.deepEqual(
				JSONcomments.stringify([1, {"//": "test"}, 2]),
				"[1,\n//test\n2]"

			);
		});
		it("multiple line comments", function () {
			assert.deepEqual(
				JSONcomments.stringify([{"//": "test\ntest\ntest"}]),
				"[\n//test\n//test\n//test\n]"
			);
			assert.deepEqual(
				JSONcomments.stringify([1, {"//": "test\ntest\ntest"}]),
				"[1\n//test\n//test\n//test\n]"
			);
			assert.deepEqual(
				JSONcomments.stringify({"//": "test\ntest\ntest"}),
				"{\n//test\n//test\n//test\n}"
			);
			assert.deepEqual(
				JSONcomments.stringify({"k": "v", "//k": "test\ntest\ntest"}),
				"{\"k\":\"v\"\n//test\n//test\n//test\n}"
			);
		});
	});
});
