var sketch

function Sketch(canvas,defaults){

  defaults = defaults || {};

  if(typeof FlashCanvas != 'undefined') FlashCanvas.initElement(canvas);

  this.Point = function(x,y){
    this.x = x;
    this.y = y;
  };
  this.Pen = function(font,stroke_color,fill_color){
    this.font = font;
    this.stroke = stroke_color || defaults.stroke || '#000000';
    this.fill = fill_color || defaults.fill || '#000000';
    this.grab = function(context){
      context.font = this.font;
      context.strokeStyle = this.stroke;
      context.fillStyle = this.fill;
    };
    this.drop = function(context){
      if(defaults.font) context.font = defaults.font;
      if(defaults.stroke) context.strokeStyle = defaults.stroke;
      if(defaults.fill) context.fillStyle = defaults.fill;
    }
  };

  this.layout = function(){};

  this.context = canvas.getContext('2d');

  this.resize = function(){
    var height = $(canvas.parentNode).height(), width = $(canvas.parentNode).width();
    //this.origin = (defaults.origin ? defaults.origin(height,width) : {x: width >> 1, y: height >> 1});
    this.origin = defaults.origin || {x: width >> 1, y: height >> 1};
    this.height = height;
    this.width = width;
    $(canvas).height(height);
    $(canvas).width(width);
    if(window.devicePixelRatio == 2) {
      canvas.height = height * 2;
      canvas.width = width * 2;
      this.context.scale(2,2);
    }else{
      canvas.height = height;
      canvas.width = width;
    }
    this.context.translate(width >> 1, height >>1);
    this.context.translate(this.origin.x, this.origin.y);
  }

  this.line = function(point_a,point_b,stroke_width,stroke_color,fill_color){

    if(fill_color) this.context.fillStyle = fill_color;
    if(stroke_width) this.context.lineWidth = stroke_width;
    if(stroke_color) this.context.strokeStyle = stroke_color;

    this.context.beginPath();
    this.context.moveTo(point_a.x,point_a.y);
    this.context.lineTo(point_b.x,point_b.y);
    this.context.closePath();
    this.context.stroke();

    this.reset()

  };

  this.circle = function(center,radius,stroke_width,stroke_color,fill_color){

    if(fill_color) this.context.fillStyle = fill_color;
    if(stroke_width) this.context.lineWidth = stroke_width;
    if(stroke_color) this.context.strokeStyle = stroke_color;

    this.context.beginPath();
    this.context.arc(center.x,center.y,radius,0,Math.PI*2)
    this.context.closePath();
    if(fill_color) this.context.fill();
    if(stroke_width !== 0) this.context.stroke();

    this.reset()

  };

  this.arc = function(center,radius,from_degrees,to_degrees,stroke_width,stroke_color){
    var from_radians, to_radians;
    from_radians = from_degrees * Math.PI / 180;
    to_radians = to_degrees * Math.PI / 180;
    if(stroke_width) this.context.lineWidth = stroke_width;
    if(stroke_color) this.context.strokeStyle = stroke_color;
    this.context.beginPath();
    this.context.arc(center.x,center.y,radius,from_radians,to_radians);
    this.context.stroke();
  }

  this.rotate = function(radians){
    this.context.rotate(radians);
  }
  this.translate = function(point){
    return {
      x: point.x + this.width / 2 - this.origin.x,
      y: point.y + this.height / 2 - this.origin.y
    };
  }

  this.reset = function(){
    this.context.lineWidth = 1;
    this.context.fillStyle = "#000000";
    this.context.strokeStyle = "#000000";
  }
  this.clear = function(){
    this.context.clearRect(-this.width / 2, -this.height / 2, this.width, this.height);
  }
  this.text = function(text,pen,point){
    pen.grab(this.context);
    this.context.fillText(text,Math.round(point.x)>>1<<1+0.5,Math.round(point.y)>>1<<1+0.5);
    //this.context.strokeText(text,Math.round(point.x)>>1<<1+0.5,Math.round(point.y)>>1<<1+0.5);
    pen.drop(this.context);
  }
  this.measure = function(text,pen){
    pen.grab(this.context);
    var width = this.context.measureText(text).width;
    pen.drop(this.context);
    return width;
  }
  this.polygon = function(points,stroke_width,stroke_color,fill_color){

    if(fill_color) this.context.fillStyle = fill_color;
    if(stroke_width) this.context.lineWidth = stroke_width;
    if(stroke_color) this.context.strokeStyle = stroke_color;

    this.context.beginPath()
    this.context.moveTo(points[points.length-1].x,points[points.length-1].y)
    for (var i = points.length - 2; i >= 0; i--) {
      this.context.lineTo(points[i].x,points[i].y)
    };
    this.context.closePath()
    if(fill_color) this.context.fill();
    this.context.stroke()
  }
  this.rectangle = function(center,height,width,stroke_width,stroke_color,fill_color){

    this.polygon([
      {x:center.x-width/2,y:center.y+height/2},
      {x:center.x+width/2,y:center.y+height/2},
      {x:center.x+width/2,y:center.y-height/2},
      {x:center.x-width/2,y:center.y-height/2}
    ],stroke_width,stroke_color,fill_color)

  }
  this.hexagon = function(center,radius,stroke_width,stroke_color,fill_color){
    this.regular(center,radius,6,null,stroke_width,stroke_color,fill_color);
  }

  this.regular = function(center,radius,sides,start,stroke_width,stroke_color,fill_color){
    if(fill_color) this.context.fillStyle = fill_color;
    if(stroke_width) this.context.lineWidth = stroke_width;
    if(stroke_color) this.context.strokeStyle = stroke_color;
    var angle, step = step = 2 * Math.PI / sides;
    start ? angle = start : angle = step;
    this.context.beginPath();
    this.context.moveTo(Math.cos(angle) * radius + center.x, Math.sin(angle) * radius + center.y);
    angle += step;
    for (var i = sides - 2; i >= 0; i--) {
      this.context.lineTo(Math.cos(angle) * radius + center.x,Math.sin(angle) * radius + center.y);
      angle +=step;
    };
    this.context.closePath();
    if(fill_color) this.context.fill();
    if(stroke_width !== 0) this.context.stroke();
  }

  this.image = function(image,point,height,width){
    this.context.drawImage(image,point.x,point.y,width,height);
  }

  this.scale = function(x,y){
    this.context.scale(x,y);
  }

  this.flow = function(text,pen,max_height,max_width){
    var i = 1, j = 0, words = text.split(' '), lines = [], width, widths = [];
    lines[j] = words[0];
    for(; i < words.length; i++){
      width = this.measure(lines[j] + ' ' + words[i], pen);
      if(width <= max_width){
        lines[j] += ' ' + words[i];
        widths[j] = width;
      }else{
        lines[++j] = words[i];
        widths[j] = this.measure(words[i], pen);
      };
    }
    for(i = 0; i < lines.length; i++){
      lines[i] = {text: lines[i], width: widths[i]};
    }
    return lines;
  };

  this.cos = (function(){
    var degree = Math.PI / 180;
    return $.map(new Array(360),function(v,i){
      return Math.cos(degree * i);
    });
  })()

  this.sin = (function(){
    var degree = Math.PI / 180;
    return $.map(new Array(360),function(v,i){
      return Math.sin(degree * i);
    });
  })()

  this.draw = function(){
    this.clear();
  }
  this.resize();

};
