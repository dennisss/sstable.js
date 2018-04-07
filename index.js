
const SSTable = require('./src/sstable');
const SSTable_build = require('./src/sstable_build');


module.exports = {
	build: SSTable_build,
	load: function(buf) {
		return new SSTable(buf);
	}
};