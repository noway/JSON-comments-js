/**
 * JSON-comments-js - realization of comments in JSON
 * Copyright (C) 2013  noway421
 *
 * This program is free software: you can redistribute it and/or modify
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


/*
JSON-comments-js
Based on Douglas Crockford's JSON-js.

This file creates a global JSONcomments object containing two methods:
stringify and parse.

    JSONcomments.stringify(value, replacer, space)
        value       any JavaScript value, usually an object or array.

        replacer    an optional parameter that determines how object
                    values are stringified for objects. It can be a
                    function or an array of strings.

        space       an optional parameter that specifies the indentation
                    of nested structures. If it is omitted, the text will
                    be packed without extra whitespace. If it is a number,
                    it will specify the number of spaces to indent at each
                    level. If it is a string (such as '\t' or '&nbsp;'),
                    it contains the characters used to indent at each level.

        This method produces a JSON text from a JavaScript value.

        When an object value is found, if the object contains a toJSON
        method, its toJSON method will be called and the result will be
        stringified. A toJSON method does not serialize: it returns the
        value represented by the name/value pair that should be serialized,
        or undefined if nothing should be serialized. The toJSON method
        will be passed the key associated with the value, and this will be
        bound to the value

        For example, this would serialize Dates as ISO strings.

            Date.prototype.toJSON = function (key) {
                function f(n) {
                    // Format integers to have at least two digits.
                    return n < 10 ? '0' + n : n;
                }

                return this.getUTCFullYear()   + '-' +
                     f(this.getUTCMonth() + 1) + '-' +
                     f(this.getUTCDate())      + 'T' +
                     f(this.getUTCHours())     + ':' +
                     f(this.getUTCMinutes())   + ':' +
                     f(this.getUTCSeconds())   + 'Z';
            };

        You can provide an optional replacer method. It will be passed the
        key and value of each member, with this bound to the containing
        object. The value that is returned from your method will be
        serialized. If your method returns undefined, then the member will
        be excluded from the serialization.

        If the replacer parameter is an array of strings, then it will be
        used to select the members to be serialized. It filters the results
        such that only members with keys listed in the replacer array are
        stringified.

        Values that do not have JSON representations, such as undefined or
        functions, will not be serialized. Such values in objects will be
        dropped; in arrays they will be replaced with null. You can use
        a replacer function to replace those with JSON values.
        JSON.stringify(undefined) returns undefined.

        The optional space parameter produces a stringification of the
        value that is filled with line breaks and indentation to make it
        easier to read.

        If the space parameter is a non-empty string, then that string will
        be used for indentation. If the space parameter is a number, then
        the indentation will be that many spaces.

        Example:

        text = JSONcomments.stringify(['e', {pluribus: 'unum'}]);
        // text is '["e",{"pluribus":"unum"}]'


        text = JSONcomments.stringify(['e', {pluribus: 'unum'}], null, '\t');
        // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

        text = JSONcomments.stringify([new Date()], function (key, value) {
            return this[key] instanceof Date ?
                'Date(' + this[key] + ')' : value;
        });
        // text is '["Date(---current time---)"]'

    JSONcomments.parse(text, reviver)
        This method parses a JSON text to produce an object or array.
        It can throw a SyntaxError exception.

        The optional reviver parameter is a function that can filter and
        transform the results. It receives each of the keys and values,
        and its return value is used instead of the original value.
        If it returns what it received, then the structure is not modified.
        If it returns undefined then the member is deleted.

        Example:

        // Parse the text. Values that look like ISO date strings will
        // be converted to Date objects.

        myData = JSONcomments.parse(text, function (key, value) {
            var a;
            if (typeof value === 'string') {
                a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                if (a) {
                    return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                        +a[5], +a[6]));
                }
            }
            return value;
        });

        myData = JSONcomments.parse(
            '["Date(09/09/2001)"]',
            function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            }
        );
*/

// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSONcomments !== "object") {
	var JSONcomments = {};
}
/* jshint maxdepth:6, maxcomplexity:15 */

(function () {
	"use strict";

	// If the JSON object have this function stop.

	if (typeof JSONcomments.stringify === "function") {
		return;
	}

	var f = function (n) {
		// Format integers to have at least two digits.
		return n < 10 ? "0" + n : n;
	};

	if (typeof Date.prototype.toJSON !== "function") {

		Date.prototype.toJSON = function () {

			return isFinite(this.valueOf()) ?
				this.getUTCFullYear()     + "-" +
					f(this.getUTCMonth() + 1) + "-" +
					f(this.getUTCDate())      + "T" +
					f(this.getUTCHours())     + ":" +
					f(this.getUTCMinutes())   + ":" +
					f(this.getUTCSeconds())   + "Z" :
				null;
		};

		String.prototype.toJSON      =
			Number.prototype.toJSON  =
			Boolean.prototype.toJSON = function () {
				return this.valueOf();
			};
	}

	var escapable = new RegExp(
		"[\\\\\\\"\\x00-\\x1f\\x7f-\\x9f\\u00ad\\u0600-\\u0604\\u070f" +
		"\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f" +
		"\\ufeff\\ufff0-\\uffff]", "g");

	var gap;
	var indent;
	var meta = {    // table of character substitutions
		"\b": "\\b",
		"\t": "\\t",
		"\n": "\\n",
		"\f": "\\f",
		"\r": "\\r",
		"\"": "\\\"",
		"\\": "\\\\"
	};
	var rep;

	var toStr = function (obj) {
		return Object.prototype.toString.apply(obj);
	};

	var isObjectHasOneElement = function (obj) {
		var keyCount = 0;
		for (var key in obj){
			if (obj.hasOwnProperty(key)){
				keyCount++;
				if (keyCount >= 2) {
					return false;
				}
			}
		}
		return keyCount === 1;
	};

	var isLast = function (value, i) {
		var length = value.length;
		for (var j = i + 1; j < length; j++) {
			if (toStr(value[j]) === "[object Object]") {
				if (!isObjectHasOneElement(value[j])) {
					return false;
				}
				if (typeof value[j]["//"] !== "undefined") {
					continue;
				}
				else if (typeof value[j]["/**/"] !== "undefined") {
					continue;
				}
				else {
					return false;
				}
			}
			return false;
		}
		return true;
	};

	var quote = function (string) {

		// If the string contains no control characters, no quote characters,
		// and no backslash characters, then we can safely slap some
		// quotes around it. Otherwise we must also replace the offending
		// characters with safe escape sequences.

		escapable.lastIndex = 0;
		return escapable.test(string) ? ("\"" +
				string.replace(escapable, function (a) {
					var c = meta[a];

					if (typeof c === "string") {
						return c;
					}
					else {
						return "\\u" +
							("0000" + a.charCodeAt(0).toString(16)).slice(-4);
					}
				}) + "\"") :
			("\"" + string + "\"");
	};

	var objectComment = function (value, k) {
		var commentSection = [];
		if (typeof value["//" + k] !== "undefined") {
			commentSection.push("\n" + gap + "//" +
				value["//" + k].split("\n").join("\n" + gap + "//") +
				"\n");
		}
		else if (typeof value["/**/" + k] !== "undefined") {
			commentSection.push("/*" + value["/**/" + k] + "*/");
		}
		else {
			return [];
		}

		commentSection = commentSection.concat(
			objectComment(value, "//" + k));
		commentSection = commentSection.concat(
			objectComment(value, "/**/" + k));
		return commentSection;
	};

	var array = function (value) {
		var i;            // The loop counter.
		var v;            // The member value.
		var comma;        // Need to put comma?
		var length;
		var mind = gap;

		var partial = [];

		// The value is an array. Stringify every element.
		// Use null as a placeholder for non-JSON values.

		length = value.length;
		for (i = 0; i < length; i += 1) {
			if (toStr(value[i]) === "[object Object]") {
				if (isObjectHasOneElement(value[i])) {
					if (typeof value[i]["//"] !== "undefined") {
						partial[i] = ("\n" + gap + "//" +
							value[i]["//"]
							.split("\n")
							.join("\n" + gap + "//") +
							"\n");
						continue;
					}
					else if (typeof value[i]["/**/"] !== "undefined") {
						partial[i] = "/*" + value[i]["/**/"] + "*/";
						continue;
					}
				}
			}

			comma = (isLast(value, i) ? "" : ",");
			partial[i] = str(i, value) + comma || "null" + comma;
		}

		// Join all of the elements together, separated with commas,
		// and wrap them in brackets.

		v = (partial.length === 0) ?
			"[]" :
			(gap ?
				("[\n" + gap +
					partial.join("\n" + gap) +
					"\n" + mind + "]") :
				("[" + partial.join("") + "]"));
		gap = mind;
		return v;
	};

	var object = function (value) {

		var i;            // The loop counter.
		var k;            // The member key.
		var v;            // The member value.
		var comma;        // Need to put comma?
		var length;
		var mind = gap;
		var partial;

		// Due to a specification blunder in ECMAScript,
		// typeof null is "object", so watch out for that case.

		if (!value) {
			return "null";
		}

		// Make an array to hold the partial results of stringifying
		// this object value.

		gap += indent;
		partial = [];

		// Is the value an array?

		if (toStr(value) === "[object Array]") {
			return array(value);
		}

		// If the replacer is an array, use it to select the members
		// to be stringified.

		if (rep && typeof rep === "object") {
			length = rep.length;
			for (i = 0; i < length; i += 1) {
				if (typeof rep[i] === "string") {
					k = rep[i];
					v = str(k, value);
					if (v) {
						partial.push(quote(k) + (gap ? ": " : ":") + v);
					}
				}
			}
		} else {

			// Otherwise, iterate through all of the keys in the object.
			var keys = [];

			for (k in value) {
				if (Object.prototype.hasOwnProperty.call(value, k)) {
					if (k.substring(0, 2) === "//") {
						continue;
					}
					if (k.substring(0, 4) === "/**/") {
						continue;
					}

					keys.push(k);
				}
			}
			var addedString = "";

			addedString = objectComment(value, "").join("\n" + gap);
			if (addedString) {
				partial.push(addedString);
			}

			for (i = 0; i < keys.length; i++) {
				k = keys[i];
				addedString = "";

				v = str(k, value);
				if (v) {
					comma = (i === keys.length - 1 ? "" : ",");
					addedString = quote(k) + (gap ? ": " : ":") + v;
					partial.push(addedString + comma);
				}

				addedString = objectComment(value, k).join("\n" + gap);

				if (addedString) {
					partial.push(addedString);
				}
			}

		}

		// Join all of the member texts together, separated with commas,
		// and wrap them in braces.

		v = (partial.length === 0) ? "{}" :

			(gap ?

				("{\n" + gap +
					partial.join("\n" + gap) +
					"\n" + mind + "}") :

				("{" + partial.join("") + "}"));

		gap = mind;
		return v;
	};

	var str = function(key, holder) {

		// Produce a string from holder[key].

		var value = holder[key];

		// If the value has a toJSON method, call it to obtain a
		// replacement value.

		if (value && typeof value === "object" &&
				typeof value.toJSON === "function") {
			value = value.toJSON(key);
		}

		// If we were called with a replacer function, then call the
		// replacer to obtain a replacement value.

		if (typeof rep === "function") {
			value = rep.call(holder, key, value);
		}

		// What happens next depends on the value's type.

		switch (typeof value) {
		case "string":
			return quote(value);

		case "number":

			// JSON numbers must be finite. Encode non-finite numbers as null.

			return isFinite(value) ? String(value) : "null";

		case "boolean":
		case "null":

			// If the value is a boolean or null, convert it to a string.
			// Note: typeof null does not produce "null". The case is
			// included here in the remote chance that this gets fixed
			// someday.

			return String(value);

			// If the type is "object", we might be dealing with an object
			// or an array or null.

		case "object":
			return object(value);
		}
	};


	JSONcomments.stringify = function (value, replacer, space) {

		// The stringify method takes a value and an optional replacer,
		// and an optional space parameter, and returns a JSON text.
		// The replacer can be a function that can replace values, or
		// an array of strings that will select the keys.
		// A default replacer method can be provided. Use of the space
		// parameter can produce text that is more easily readable.

		var i;

		gap = "";
		indent = "";

		// If the space parameter is a number, make an indent string
		// containing that many spaces.

		if (typeof space === "number") {
			for (i = 0; i < space; i += 1) {
				indent += " ";
			}

		// If the space parameter is a string, it will be used as the indent
		// string.

		} else if (typeof space === "string") {
			indent = space;
		}

		// If there is a replacer, it must be a function or an array.
		// Otherwise, throw an error.

		rep = replacer;
		if (replacer && typeof replacer !== "function" &&
				(typeof replacer !== "object" ||
				typeof replacer.length !== "number")) {
			throw new Error("JSON.stringify");
		}

		// Make a fake root object containing our value under the key of "".
		// Return the result of stringifying the value.

		return str("", {"": value});
	};

})(); // i love "dog balls"



(function () {
	"use strict";

	// If the JSON object have this function stop.

	if (typeof JSONcomments.parse === "function") {
		return;
	}


	// This is a function that can parse a JSON text, producing a JavaScript
	// data structure. It is a simple, recursive descent parser. It
	// does not use eval or regular expressions, so it can be used
	// as a model for implementing a JSON parser in other languages.

	// We are defining the function inside of another function to avoid
	// creating global variables.

	var at;     // The index of the current character
	var ch;     // The current character
	var escapee = {
		"\"":  "\"",
		"\\": "\\",
		"/":  "/",
		b:    "\b",
		f:    "\f",
		n:    "\n",
		r:    "\r",
		t:    "\t"
	};
	var text;

	var error = function (m) {
		// Call error when something is wrong.
		var err = {
			name:    "SyntaxError",
			message: m,
			at:      at,
			text:    text
		};
		throw err;
	};

	var next = function (c) {

		// If a c parameter is provided, verify that it matches the current
		// character.
		if (at > text.length) {
			return error("Expected \"" + c + "\" instead of END OF FILE");
		}

		if (c && c !== ch) {
			return error("Expected \"" + c + "\" instead of \"" + ch + "\"");
		}

		// Get the next character. When there are no more characters,
		// return the empty string.

		ch = text.charAt(at);
		at += 1;
		return ch;
	};

	var number = function () {

		// Parse a number value.

		var number,
			string = "";

		if (ch === "-") {
			string = "-";
			next("-");
		}
		while (ch >= "0" && ch <= "9") {
			string += ch;
			next();
		}
		if (ch === ".") {
			string += ".";
			while (next() && ch >= "0" && ch <= "9") {
				string += ch;
			}
		}
		if (ch === "e" || ch === "E") {
			string += ch;
			next();
			if (ch === "-" || ch === "+") {
				string += ch;
				next();
			}
			while (ch >= "0" && ch <= "9") {
				string += ch;
				next();
			}
		}
		number = +string;
		if (!isFinite(number)) {
			error("Bad number");
		} else {
			return number;
		}
	};

	var string = function () {
		// Parse a string value.

		var hex,
			i,
			string = "",
			uffff;

		// When parsing for string values, we must look for " and \
		// characters.

		if (ch === "\"") {
			while (next()) {
				if (ch === "\"") {
					next();
					return string;
				}
				if (ch === "\\") {
					next();
					if (ch === "u") {
						uffff = 0;
						for (i = 0; i < 4; i += 1) {
							hex = parseInt(next(), 16);
							if (!isFinite(hex)) {
								break;
							}
							uffff = uffff * 16 + hex;
						}
						string += String.fromCharCode(uffff);
					} else if (typeof escapee[ch] === "string") {
						string += escapee[ch];
					} else {
						break;
					}
				} else {
					string += ch;
				}
			}
		}
		error("Bad string");
	};

	var white = function () {

		// Skip whitespace.

		while (ch && ch <= " ") {
			next();
		}
	};

	var word = function () {

		// true, false, or null.

		switch (ch) {
		case "t":
			next("t");
			next("r");
			next("u");
			next("e");
			return true;
		case "f":
			next("f");
			next("a");
			next("l");
			next("s");
			next("e");
			return false;
		case "n":
			next("n");
			next("u");
			next("l");
			next("l");
			return null;
		}
		error("Unexpected \"" + ch + "\"");
	};

	var value;  // Place holder for the value function.

	var arrayCommennt = function (array) {
		var cmt = null;
		var last = "";
		var currentStack = [];
		var pushing = {};
		while ((cmt = comment()) !== null){
			var tag = cmt[0] === "block" ? "/**/" : "//";
			if (last === "") {
				last = tag;
			}

			if (tag === "//") {
				currentStack.push(cmt[1]);
				last = tag;
			} else {
				if (last === "//") {
					pushing = {};
					pushing[last] = currentStack.join("\n");
					array.push(pushing);
					currentStack = [];
					last = tag;
				}

				pushing = {};
				pushing[last] = cmt[1];
				array.push(pushing);
			}
			white();
		}
		if (currentStack.length) {
			pushing = {};
			pushing[last] = currentStack.join("\n");
			array.push(pushing);
		}
	};

	var objectComment = function (object, lastKey) {
		var cmt = null;
		var last = "";
		var currentStack = [];
		while ((cmt = comment()) !== null){
			var tag = cmt[0] === "block" ? "/**/" : "//";
			if (last === "") {
				last = tag;
			}

			if (tag === "//") {
				currentStack.push(cmt[1]);
				last = tag;
			} else {
				if (last === "//") {
					object[last + lastKey] = currentStack.join("\n");
					lastKey = last + lastKey;
					currentStack = [];
					last = tag;
				}
				object[tag + lastKey] = cmt[1];
				lastKey = tag + lastKey;
			}
			white();
		}
		if (currentStack.length) {
			object[last + lastKey] = currentStack.join("\n");
			lastKey = last + lastKey;
		}
	};

	var array = function () {
		// Parse an array value.

		var array = [];

		if (ch === "[") {
			next("[");
			white();

			arrayCommennt(array);

			if (ch === "]") {
				next("]");
				return array;   // empty array
			}
			while (ch) {

				arrayCommennt(array);

				array.push(value());
				white();

				arrayCommennt(array);

				if (ch === "]") {
					next("]");
					return array;
				}
				next(",");
				white();
			}
		}
		error("Bad array");
	};

	var object = function () {

		// Parse an object value.

		var key;
		var object = {};

		var lastKey = "";

		if (ch === "{") {
			next("{");
			white();

			objectComment(object, lastKey);

			if (ch === "}") {
				next("}");
				return object;   // empty object
			}

			while (ch) {

				objectComment(object, lastKey);

				key = string();
				lastKey = key;
				white();
				next(":");
				if (Object.hasOwnProperty.call(object, key)) {
					error("Duplicate key \"" + key + "\"");
				}
				object[key] = value();
				white();


				objectComment(object, lastKey);


				if (ch === "}") {
					next("}");
					return object;
				}
				next(",");
				white();
			}
		}
		error("Bad object");
	};

	var comment = function () {
		var cmt = "";
		var parsedSlashes = 0;

		if (ch !== "/") {
			return null;
		}

		next("/");
		parsedSlashes += 1;

		if (ch === "*") {
			next("*");

			while (ch) {
				if (ch === "*") {
					next("*");
					if (ch === "/") {
						next("/");
						return ["block", cmt];
					} else {
						// если оказалось
						// что это не конец, звезду в cmt
						cmt += "*";
						continue;
					}
				}
				cmt += ch;
				next();
			}
			error("Bad comment");
		}
		else if (ch === "/"){
			next("/");

			while (ch) {
				if (ch === "\n") {
					next("\n");
					break;
				}
				cmt += ch;
				next();
			}
			return ["line", cmt];
		}
		else {
			return null;
		}
	};


	value = function () {

		// Parse a JSON value. It could be an object, an array, a string,
		// a number, or a word.

		white();
		switch (ch) {
		case "{":
			return object();
		case "[":
			return array();
		case "\"":
			return string();
		case "-":
			return number();
		default:
			return ch >= "0" && ch <= "9" ? number() : word();
		}
	};

	JSONcomments.parse = function (source, reviver) {
		// Return the json_parse function. It will have access to all of the
		// above functions and variables.

		var result;

		text = source;
		at = 0;
		ch = " ";
		result = value();
		white();
		if (ch) {
			error("Syntax error");
		}

		// If there is a reviver function, we recursively walk the
		// new structure, passing each name/value pair to the reviver
		// function for possible transformation, starting with a
		// temporary root object that holds the result in an empty key.
		// If there is not a reviver function, we simply return the result.

		if (typeof reviver === "function") {
			return (function walk(holder, key) {
				var k, v, value = holder[key];
				if (value && typeof value === "object") {
					for (k in value) {
						if (Object.prototype.hasOwnProperty.call(value, k)) {
							v = walk(value, k);
							if (v !== undefined) {
								value[k] = v;
							} else {
								delete value[k];
							}
						}
					}
				}
				return reviver.call(holder, key, value);
			}({"": result}, ""));
		}
		else {
			return result;
		}
	};

})();


if (typeof exports !== "undefined") {
	module.exports = JSONcomments;
}
