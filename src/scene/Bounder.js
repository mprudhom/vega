define(function(require, exports, module) {
  var Node = require('../dataflow/Node'),
      bounds = require('../util/bounds'),
      C = require('../util/constants'),
      util = require('../util/index');

  function Bounder(model, mark) {
    this._mark = mark;
    return Node.prototype.init.call(this, model.graph).router(true);
  }

  var proto = (Bounder.prototype = new Node());

  proto.evaluate = function(input) {
    util.debug(input, ["bounds", this._mark.marktype]);

    bounds.mark(this._mark);
    if(this._mark.marktype === C.GROUP) 
      bounds.mark(this._mark, null, false);

    input.reflow = true;
    return input;
  };

  return Bounder;
});