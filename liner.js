var os = require('os');
var stream = require('stream');
var util = require('util');
var debug = require('debug')('liner');

var Transform = stream.Transform;
util.inherits(Liner, Transform);

function Liner()
{
  if (!(this instanceof Liner))
    return new Liner(options);

  Transform.call(this, { objectMode: true });
  this._lastLineData = null;
}
 
Liner.prototype._transform = function (chunk, encoding, done) {
      debug('transform');
	var data = chunk.toString()
	if (this._lastLineData) data = this._lastLineData + data

	var lines = data.split(os.EOL)
	this._lastLineData = lines.splice(lines.length-1,1)[0]

	lines.forEach(this.push.bind(this))
	done()
}

Liner.prototype._flush = function (done) {
	debug('_flush');
	if (this._lastLineData) this.push(this._lastLineData)
	this._lastLineData = null
	done()
}

module.exports = Liner
