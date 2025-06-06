/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const Source = require("./Source");
const { SourceNode } = require("source-map");
const { SourceListMap } = require("source-list-map");
const { getSourceAndMap, getMap } = require("./helpers");

const SPLIT_REGEX = /(?!$)[^\n\r;{}]*[\n\r;{}]*/g;

function _splitCode(code) {
	return code.match(SPLIT_REGEX) || [];
}

class OriginalSource extends Source {
	constructor(value, name) {
		super();
		const isBuffer = Buffer.isBuffer(value);
		this._value = isBuffer ? undefined : value;
		this._valueAsBuffer = isBuffer ? value : undefined;
		this._name = name;
	}

	getName() {
		return this._name;
	}

	source() {
		if (this._value === undefined) {
			this._value = this._valueAsBuffer.toString("utf-8");
		}
		return this._value;
	}

	buffer() {
		if (this._valueAsBuffer === undefined) {
			this._valueAsBuffer = Buffer.from(this._value, "utf-8");
		}
		return this._valueAsBuffer;
	}

	map(options) {
		return getMap(this, options);
	}

	sourceAndMap(options) {
		return getSourceAndMap(this, options);
	}

	node(options) {
		if (this._value === undefined) {
			this._value = this._valueAsBuffer.toString("utf-8");
		}
		const value = this._value;
		const name = this._name;
		const lines = value.split("\n");
		const node = new SourceNode(
			null,
			null,
			null,
			lines.map(function (line, idx) {
				let pos = 0;
				if (options && options.columns === false) {
					const content = line + (idx !== lines.length - 1 ? "\n" : "");
					return new SourceNode(idx + 1, 0, name, content);
				}
				return new SourceNode(
					null,
					null,
					null,
					_splitCode(line + (idx !== lines.length - 1 ? "\n" : "")).map(
						function (item) {
							if (/^\s*$/.test(item)) {
								pos += item.length;
								return item;
							}
							const res = new SourceNode(idx + 1, pos, name, item);
							pos += item.length;
							return res;
						}
					)
				);
			})
		);
		node.setSourceContent(name, value);
		return node;
	}

	listMap(options) {
		if (this._value === undefined) {
			this._value = this._valueAsBuffer.toString("utf-8");
		}
		return new SourceListMap(this._value, this._name, this._value);
	}

	updateHash(hash) {
		if (this._valueAsBuffer === undefined) {
			this._valueAsBuffer = Buffer.from(this._value, "utf-8");
		}
		hash.update("OriginalSource");
		hash.update(this._valueAsBuffer);
		hash.update(this._name || "");
	}
}

module.exports = OriginalSource;
d
			};
		} else if (finalSource) {
			// Without column info and with final source we only
			// need meta info to generate mapping
			const result = getGeneratedSourceInfo(this._value);
			const { generatedLine, generatedColumn } = result;
			if (generatedColumn === 0) {
				for (let line = 1; line < generatedLine; line++)
					onChunk(undefined, line, 0, 0, line, 0, -1);
			} else {
				for (let line = 1; line <= generatedLine; line++)
					onChunk(undefined, line, 0, 0, line, 0, -1);
			}
			return result;
		} else {
			// Without column info, but also without final source
			// we need to split source by lines
			let line = 1;
			const matches = splitIntoLines(this._value);
			let match;
			for (match of matches) {
				onChunk(finalSource ? undefined : match, line, 0, 0, line, 0, -1);
				line++;
			}
			return matches.length === 0 || match.endsWith("\n")
				? {
						generatedLine: matches.length + 1,
						generatedColumn: 0,
						source: finalSource ? this._value : undefined
				  }
				: {
						generatedLine: matches.length,
						generatedColumn: match.length,
						source: finalSource ? this._value : undefined
				  };
		}
	}

	updateHash(hash) {
		if (this._valueAsBuffer === undefined) {
			this._valueAsBuffer = Buffer.from(this._value, "utf-8");
		}
		hash.update("OriginalSource");
		hash.update(this._valueAsBuffer);
		hash.update(this._name || "");
	}
}

module.exports = OriginalSource;
