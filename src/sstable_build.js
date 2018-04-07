'use strict';


/**
 * Serializes an object into a buffer that can be loaded quickly later with sst.load
 * 
 * @param {object} obj any plain object with just string keys and values
 * @return {Buffer} the serialized sst that should be written to a file
 */
function SSTable_build(obj, options) {

	options = options || {};

	var binSize = options.binSize || 12;


	// Object to array
	var pairs = [];
	for(var k in obj) {
		if(obj.hasOwnProperty(k)) {

			var v = obj[k];

			if(typeof(v) !== 'string') {
				throw new Error('Value for key "' + k + '" must be a string');
			}

			pairs.push({ k: Buffer.from(k, 'utf8'), v: v });
		}
	}


	// This will perform a sort on UTF-8 strings in the buffers
	pairs.sort((a, b) => {
		return Buffer.compare(a.k, b.k);
	})


	// Generate bin boundaries
	var bins = []; // NOTE: This is an array of buffers
	var strings = []; // < Also an array of buffers

	var pos = 0;
	var binI = 0, /**< Starting pair index for the current bin */
		prefix = null; /**< Common prefix of all keys seen so far in this bin */

	var i; /**< Index of the current pair we are on */

	// Called when we want to flush all pairs in the range [binI, i) into the buffer we are building
	function finishBucket() {

		var posBuf = Buffer.allocUnsafe(4);
		posBuf.writeUInt32LE(pos, 0);

		var b = Buffer.concat([
			posBuf, /**< 32bit position in table (starting at end of indexes) */
			Buffer.from([ prefix.length ]), /**< Number of prefix bytes */
			Buffer.from([ pairs[binI].k.byteLength ]),  /**< Length of key below */
			pairs[binI].k /**< The full key located at the beginning of this bucket */
		]);
		bins.push(b);

		for(var j = binI; j < i; j++) {

			var p = pairs[j];

			var kb = p.k;
			kb = kb.slice(prefix.length);

			var vb = Buffer.from(p.v, 'utf8');

			var str = Buffer.concat([
				Buffer.from([ kb.byteLength ]),
				kb,
				Buffer.from([ vb.byteLength ]),
				vb
			]);

			strings.push(str);
			pos += str.length;
		}
	}

	for(i = 0; i < pairs.length; i++) {

		// At a fixed interval, flush the button and start a new one
		if(i % binSize === 0) {
			// Finish the last button
			if(i > 0) {
				finishBucket();
			}

			// Start a new bucket
			binI = i;
			prefix = pairs[i].k;
		}
		// Otherwise, we are still adding to a bucket, so update the prefix seen so far
		else {
			var c;
			for(c = 0; c < Math.min(pairs[i].k.byteLength, prefix.byteLength); c++) {
				if(pairs[i].k[c] !== prefix[c]) {
					break;
				}
			}

			prefix = prefix.slice(0, c);
		}

		if(options.debug && (i % 2000 === 0)) {
			console.log('- ' + i + ' / ' + pairs.length);
		}
	}

	if(prefix !== null) {
		finishBucket();
	}


	if(options.debug) {
		console.log('- Created: ' + bins.length + ' bins from ' + pairs.length + ' key-value pairs');
	}
	


	// Make one file out of all of the buffers

	var bufBinsLen = Buffer.allocUnsafe(4);
	bufBinsLen.writeUInt32LE(bins.length);
	var bufBins = Buffer.concat(bins);
	var bufStrings = Buffer.concat(strings);

	var sstBuf = Buffer.concat([ bufBinsLen, bufBins, bufStrings ]);

	return sstBuf;
}

module.exports = SSTable_build;


