var Sketch = function(canvas,defaults){

  var _defaults;
  var _context;

  var _this = function(canvas,defaults){
    _defaults = defaults || {};
    _this.canvas = canvas;
    _this.context = _context = canvas.getContext('2d');
    return _this;
  };

  function _setup_fill(params){
    var fill = params.fill_style || (params.fill !== undefined ? params.fill : !!_defaults.fill);
    if(fill){
      _context.fillStyle = params.fill_style || _defaults.fill_style;
    };
    return fill;
  };

  function _setup_stroke(params){
    var stroke = params.stroke_style || params.stroke_width || (params.stroke !== undefined ? params.stroke : !!_defaults.stroke);
    if(stroke){
      _context.strokeStyle = params.stroke_style || _defaults.stroke_style;
      _context.strokeWidth = params.stroke_width || _defaults.stroke_width;
    };
    return stroke;
  }

  function _to_radians(degrees){
    return degrees * Math.PI / 180;
  }

  _.extend(_this,{

    cos: (function(){
      var degree = Math.PI / 180;
      return $.map(new Array(360),function(v,i){
        return Math.cos(degree * i);
      });
    })(),

    sin: (function(){
      var degree = Math.PI / 180;
      return $.map(new Array(360),function(v,i){
        return Math.sin(degree * i);
      });
    })(),

  })

  _.extend(_this,{

    resize: function(){
      var width = $(this.canvas.parentNode).width();
      var height = $(this.canvas.parentNode).height();

      this.width = width;
      this.height = height;

      $(this.canvas).height(height);
      $(this.canvas).width(width);

      if(window.devicePixelRatio == 2) {
        this.canvas.height = height * 2;
        this.canvas.width = width * 2;
        this.context.scale(2,2);
      }else{
        this.canvas.height = height;
        this.canvas.width = width;
      }

      this.origin = _defaults.origin || {x: width, y: height};
      if(_defaults.origin) _context.translate(this.origin.x, this.origin.y);

      return _this;

    },

    draw: function(){
      _context.clearRect(0, 0, this.width, this.height);
      return _this;
    },


    line: function(params){

      var point_a = params.point_a;
      var point_b = params.point_b;

      _setup_stroke(params);

      _context.beginPath();
      _context.moveTo(point_a.x,point_a.y);
      _context.lineTo(point_b.x,point_b.y);
      _context.closePath();
      _context.stroke();

    },

    circle: function(params){

      var center = params.center;
      var radius = params.radius;

      var fill = _setup_fill(params);
      var stroke = _setup_stroke(params);

      _context.beginPath();
      _context.arc(center.x,center.y,radius,0,Math.PI*2)
      _context.closePath();

      if(fill) _context.fill();
      if(stroke) _context.stroke();

    },

    arc: function(params){

      var center = params.center;
      var radius = params.radius;
      var from = _to_radians(params.from);
      var to = _to_radians(params.to);

      _setup_stroke(params);

      _context.beginPath();
      _context.arc(center.x,center.y,radius,from,to);
      _context.stroke();

    },

    polygon: function(params){

      var points = params.points;

      var fill = _setup_fill(params);
      var stroke = _setup_stroke(params);

      var point = points.shift();

      _context.beginPath();
      _context.moveTo(point.x,point.y);
      _.each(points,function(p){ _context.lineTo(p.x,p.y); });
      _context.closePath();

      if(fill) _context.fill();
      if(stroke) _context.stroke();

    },

    rectangle: function(params){

      var center = params.center;
      var width = params.width;
      var height = params.height;

      var points = [
        {x:center.x-width/2,y:center.y+height/2},
        {x:center.x+width/2,y:center.y+height/2},
        {x:center.x+width/2,y:center.y-height/2},
        {x:center.x-width/2,y:center.y-height/2}
      ]

      this.polygon(params);

    },

    regular: function(params){

      var center = params.center;
      var radius = params.radius;
      var sides = params.sides;
      var start = _to_radians(params.start) || 0;

      var fill = _setup_fill(params);
      var stroke = _setup_stroke(params);

      var step = 2 * Math.PI / sides;
      var angle = start;

      var points = _.map(new Array(sides),function(){
        return {
          x: this.cos[angle] * radius + center.x,
          y: this.sin[angle] * radius + center.y
        };
      });
      var point = points.shift();

      _context.beginPath();
      _context.moveTo(point.x,point.y);
      _.each(points,function(p){ _context.lineTo(p.x,p.y); });
      _context.closePath();

    },

    hexagon: function(params){

      this.regular(_.extend({sides: 6},params));

    },

    image: function(image,point,height,width){

      var image = params.image;
      var point = params.point;
      var width = params.width;
      var height = params.height;

      _context.drawImage(image,point.x,point.y,width,height);

    },

    translate: function(point){
      return {
        x: point.x + this.width / 2 - this.origin.x,
        y: point.y + this.height / 2 - this.origin.y
      };
    }

  });

  return _this(canvas,defaults);

}