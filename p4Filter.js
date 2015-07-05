var stream = require('stream');
var util = require('util');
var os = require('os'); 
var debug = require('debug')('p4Filter');

var Transform = stream.Transform;
util.inherits(P4Filter, Transform);

function P4Filter(options)
{
  if (!(this instanceof P4Filter))
    return new P4Filter(options);

  if(options && options.excludeFilters)
  {
    this._excludeFilters = options.excludeFilters;
    debug('exclude filters: ' + this._excludeFilters);
  }

  Transform.call(this, { objectMode: true });
}

P4Filter.prototype._transform = function (chunk, encoding, done) {
  var buff = chunk.toString();
  if (buff && buff.length > 0)
  {
    buff = buff + os.EOL;
    if (this._excludeFilters)
    {
      var bInclude = true;
      this._excludeFilters.forEach(function(element, index){
        if (buff.indexOf(element) !== -1)
          bInclude = false;
      });

      if (bInclude)
        this.push(buff);
    }
  }
  done();
}

P4Filter.prototype._flush = function (done) {
	done()
}

module.exports = P4Filter


