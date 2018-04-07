const sst = require('..');
const assert = require('assert');

describe('sstable', function() {

	it('basic functionality', function() {

		var buf = sst.build({
			"a": "1",
			"c": "3",
			"b": "2",
		});

		assert(buf instanceof Buffer);

		console.log(buf);


		var tab = sst.load(buf);
		
		assert.equal(tab.get("c"), "3");
		assert.equal(tab.get("b"), "2");
		assert.equal(tab.get("a"), "1");
		assert.equal(tab.get("d"), undefined);
	});

})