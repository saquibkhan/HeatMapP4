var stream = require('stream')
var P4Filter = new stream.Transform( { objectMode: true } )
var os = require('os'); 

P4Filter._processBuffer = function() {

	if (!this._buff)
		return;
	
	// check if string has newline symbol
	if (this._buff.indexOf(os.EOL) !== -1) {
		if (this._buff.indexOf('#1') !== -1) {
			// push to stream skipping this line line
			this.push(this._buff.slice(this._buff.indexOf(os.EOL) + 2));
			// clear string buffer
			this._buff = null;
		}
	}
}


P4Filter._transform = function (chunk, encoding, done) {

	var buff = chunk.toString();
	if (buff && buff.length > 0)
	{
		buff = buff + os.EOL;
		if (buff && buff.indexOf('#1') === -1
			&& buff.indexOf('QA/Automation') === -1
			&& buff.indexOf('qa/Automation') === -1)
			this.push(buff);
	}
	
	/*
	if (!this._buff)
		this._buff = chunk.toString();
	else
		this._buff += chunk.toString();
	
	if (!this._buff)
		return;
	
	// check if string has newline symbol
	if (this._buff.indexOf(os.EOL) !== -1) {
		if (this._buff.indexOf('#1') === -1) {
			// push to stream skipping this line line
			this.push(this._buff.slice(this._buff.indexOf(os.EOL) + 2));
			// clear string buffer
			this._buff = null;
		}
	}
	*/

	done();
}

P4Filter._flush = function (done) {
	//this._processBuffer();
	done()
}

module.exports = P4Filter


