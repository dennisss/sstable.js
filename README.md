Sorted String Table in plain JS
===============================

A fast, compact, and memory efficient way to load a lot of key-value pairs into Javascript from a server/file/etc.

- Near-zero copy loading means near super fast loading of large datasets
- Integrated prefix compression helps keep file sizes small
- Maps string keys to string values



The general intended pattern to follow with this package is to:
1. Create a `.sst` file from a javascript object
2. Host it on your server (out of the scope of this project)
3. Load it on a client computer
	- Download it to a client (or read it from a local file) into an ArrayBuffer
4. Use as a read-only key-value store


Usage
-----

Install using `npm install sstab`

Generate an sst file from some existing data
> var sst = require('sstab')
>
> var fs = require('fs')
> 
> var buf = sst.build({ a: '1', b: '2', c: '3', d: '4' }) // Serialize some object
>
> fs.writeFileSync('data.sst', buf)

Load in client
> var sst = require('sstab');
>
> var fs = require('fs');
>
> var buf = fs.readFileSync('data.sst');
>
> var tab = sst.load(buf);
>
> tab.get('b') // This will equal '2'