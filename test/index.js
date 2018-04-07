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

		var tab = sst.load(buf);
		
		assert.equal(tab.get("c"), "3");
		assert.equal(tab.get("b"), "2");
		assert.equal(tab.get("a"), "1");
		assert.equal(tab.get("d"), undefined);
	});

	it('works for many values spanning many buckets', function() {

		var obj = {};
		for(var i = 0; i < 50; i++) {
			var k = String.fromCharCode('A'.charCodeAt(0) + i);

			var r = Math.floor(15*Math.random());
			for(var j = 0; j < r; j++) {
				k += k.charAt(0);
			}

			var v = i + '';
			obj[k] = v;
		}


		var buf = sst.build(obj);

		var tab = sst.load(buf);

		for(var k in obj) {
			if(obj.hasOwnProperty(k)) {
				assert.equal(tab.get(k), obj[k]);
			}
		}

		assert.equal(tab.get('%fsdf34'), undefined);
		assert.equal(tab.get('12'), undefined);
		assert.equal(tab.get('5'), undefined);
		assert.equal(tab.get('z|{'), undefined);

	})

})