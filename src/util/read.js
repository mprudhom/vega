define(function(require, module, exports) {
  var util = require('./index'),
      d3 = require('d3'),
      formats = {},
      parsers = {
        "number": util.number,
        "boolean": util.boolean,
        "date": Date.parse
      };

  function read(data, format) {
    var type = (format && format.type) || "json";
    data = formats[type](data, format);
    if (format && format.parse) parseValues(data, format.parse);
    return data;
  }

  formats.json = function(data, format) {
    var d = util.isObject(data) ? data : JSON.parse(data);
    if (format && format.property) {
      d = util.accessor(format.property)(d);
    }
    return d;
  };

  formats.csv = function(data, format) {
    var d = d3.csv.parse(data);
    return d;
  };

  formats.tsv = function(data, format) {
    var d = d3.tsv.parse(data);
    return d;
  };
  
  formats.topojson = function(data, format) {
    if (topojson == null) {
      util.error("TopoJSON library not loaded.");
      return [];
    }    
    var t = util.isObject(data) ? data : JSON.parse(data),
        obj = [];

    if (format && format.feature) {
      obj = (obj = t.objects[format.feature])
        ? topojson.feature(t, obj).features
        : (util.error("Invalid TopoJSON object: "+format.feature), []);
    } else if (format && format.mesh) {
      obj = (obj = t.objects[format.mesh])
        ? [topojson.mesh(t, t.objects[format.mesh])]
        : (util.error("Invalid TopoJSON object: " + format.mesh), []);
    }
    else { util.error("Missing TopoJSON feature or mesh parameter."); }

    return obj;
  };
  
  formats.treejson = function(data, format) {
    data = util.isObject(data) ? data : JSON.parse(data);
    return util.tree(data, format.children);
  };
  
  function parseValues(data, types) {
    var cols = util.keys(types),
        p = cols.map(function(col) { return parsers[types[col]]; }),
        tree = util.isTree(data);
    vg_parseArray(tree ? [data] : data, cols, p, tree);
  }
  
  function vg_parseArray(data, cols, p, tree) {
    var d, i, j, len, clen;
    for (i=0, len=data.length; i<len; ++i) {
      d = data[i];
      for (j=0, clen=cols.length; j<clen; ++j) {
        d[cols[j]] = p[j](d[cols[j]]);
      }
      if (tree && d.values) parseValues(d, cols, p, true);
    }
  }

  read.formats = formats;
  read.parse = parseValues;
  return read;
});
