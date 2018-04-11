
const SSTable = require('./sstable');
const SSTable_build = require('./sstable_build');

module.exports = {
	build: SSTable_build,
	load: function(buf) {
		return new SSTable(buf);
	}
};