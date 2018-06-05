;
(function($){
	 var globalWidgets=new Map();
	 var resizerColor="#cecfff";
	 var rotatePointColor="#ffff00";
	 var functionPointColor="#ff0000";
	 var selectionColor="#cecfff";
	 resizerColor="#8dc73e";
	 
	$.register=function(type,_function){
		 if(globalWidgets.containsKey(type))
			 alert(type+" was already exist,please rename your widget");
		 else{
			 if(typeof _function!=="function"){
				alert(type+" is not a widget");
				return;
			 }				 
			 try{
				 globalWidgets.put(type,_function);
			 }
			 catch(ex){
				 alert(ex);
			 }
		 }
	};
	
	$.widgets = function(type,option){
		if(!globalWidgets.containsKey(type)){
			alert(type+" is not exist");
			type="widget";
		}
		var _widget=globalWidgets.get(type);			
		return new _widget(option);
		
			
	}; 
	
	$.presenter = function(option) {
		return new presenter(option ? option : {});
	};
	
	widget=function(option) {
		var ths = this;
        this.name= '',
        this.x=0,
        this.y=0,
        this.version=1.0,
        this.width=275,
        this.height=140,
        this.minwidth=36,
        this.minheight=36,
        this.alpha=1,
        this.editable=false,
        this.visible=true,
        this.scaleX=1,
        this.scaleY=1,
        this.scale=1,
    	this.gradient={
    		type:"liner", //none,liner,radial
    		begincolor:"white",
    		endcolor:"#9dd6ea",
    		angle:90,
    		radius:45
    	},	
       
    	this.background={
    		filltype:"color",
        	color : "none",
			image : null,
			imageType : "center"// repeat center fit fill
        },
        this.corner={
			type:"rect", //round,rect
			radius:16
		},
        this.border={
        	width : 1,
        	type:"solid", //solid, dotted,dashed
			color : "none"
        },
        this.shadow={
        	color : "none",
			offsetX : 4,
			offsetY : 4,
			blur : 4
        },
        this.rotate=0,
        this.rotatepoint={
        	x : 0,
			y : 0,
			offsetx : 0,
			offsety : 0
        },
        this.font={
        		style:"normal",  //normal, italic
				weight:"normal", //normal,bold
				family:"Arial",
     			size:"10pt",
				color:"black",
				fill:true
        },
        this.margin=5,
        this.widgets=[],
        this.presenters=[];
    	
        this.mousedown=null,
        this.mousemove=null,
        this.mouseup=null,
        this.mouseover=null,
        this.mouseout=null,
        this.click=null;
        this.resize=null;
        this.afterresize=null;
        this.afterfunctionPoint=null;
        this.dblclick=null;
        this.imageload=null,
        this.ondelete=null;
        this.selectable=true;
        this.allowconnectionPoint=true;
        this.allowRotate=true;
        this.allowResizer=true;
        this.functionPoints=[];     
    	this.type="widget";
		$.extend(true,this,option);		
		this.direction=1;
		this.root = null;
		this.parent = null;
		this.canvas = document.createElement("canvas");	
		this.ctx = this.canvas.getContext("2d");
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.setResizers();
		//this.local = null;
		if(this.widgets.length>0){
			this._widgets=[];
			$.extend(this._widgets,this.widgets);
			this.widgets.splice(0,this.widgets.length);
			if(this.includeChildren){
				this.restoreChildren(this._widgets,{
					editable:this.editable					
				});
			}
			delete this._widgets;
		}
		this.connections=[];		
		if (this.background!=null && this.background.filltype==="image" && typeof this.background.image === "string") {
			this.Background(this.background);
		}
		this.propertyEditors=["common","border","corner","font","background","shadow","hyperlink","paragraph"];
	};	
	
	widget.prototype.Background=function(a,callback){
		if (arguments.length >= 1) {
			this.background=a;	
			if (this.background!=null && this.background.filltype==="image" && typeof this.background.image === "string") {
				var url = this.background.image;
				this.background.image = null;
				var ths=this;		
				var _a = document.createElement("img");
	    		var canvas = document.createElement('canvas'); 
				var ctx2 = canvas.getContext('2d'); 
	    		_a.addEventListener("load", function(e) {	
	    			canvas.height = _a.height; 
					canvas.width = _a.width; 
					ctx2.drawImage(_a,0,0); 
					var dataURL = canvas.toDataURL('image/png');
					
					if(ths.background.image){
						if(ths.background.image.src!=dataURL)
							ths.background.image.src=dataURL;
					}
			    	else{
			    		_a.removeEventListener("load",this);
			    		ths.background.image=e.target;
			    		ths.background.image.src=dataURL;
		    			
			    	}
					if(callback!=null)
						callback();
					else if(ths.imageload!=null){
						ths.imageload.call(ths);
					}
					else if(ths.visible&&!ths.silence)
						ths.paint({action:"loading image"});
				}, true);
		    	_a.src=url;
				
			}
			return this;
		} else {
			return this.background;
		}
	}
	
	widget.prototype.Scale=function(a){
		if (arguments.length === 1) {
			this.scale=a;		
			for(var i=0;i<=this.widgets.length-1;i++)
				this.widgets[i].Scale(a);
			return this;
		} else {
			return this.scale;
		}
	};	
	
	widget.prototype.equals=function(target){
		for(var prop in target){
			if(typeof target[prop]!="object" && target[prop]!=this[prop])
				return false;
		}
		return true;
	};

	widget.prototype.setResizers=function(){
		this.resizers=[
		               {x:0,y:0,cursor:"nw-resize",visible:true},
		               {x:this.width,y:0,cursor:"ne-resize",visible:true},
		               {x:0,y:this.height,cursor:"ne-resize",visible:true},
		               {x:this.width,y:this.height,cursor:"nw-resize",visible:true}
		               ];
		this.setConnectionPoints();
		this.setRotateKeyPoint();
	};
	
	widget.prototype.setConnectionPoints=function(){
		this.connectionPoints=[
								{x:this.width/2,y:0,cursor:"crosshair",visible:true},
								{x:this.width,y:this.height/2,cursor:"crosshair",visible:true},
								{x:this.width/2,y:this.height,cursor:"crosshair",visible:true},
								{x:0,y:this.height/2,cursor:"crosshair",visible:true} 
		                      ];
	};
	
	widget.prototype.setRotateKeyPoint=function(){
		this.rotateKeyPoint={x:this.width/2,y:-20,cursor:"pointer",visible:true};
	};
	
	widget.prototype.fontSize=function(){
		var reg=/\d+/;
		var font_size;
		if(typeof this.font==="String")
		   font_size=parseInt(reg.exec(this.font)[0]);
		else
			font_size=parseInt(reg.exec(this.font.size)[0]);
		font_size=font_size||18;
		return font_size;
	};

	widget.prototype.checkPointIn =function(x, y,scale) {
		if(!this.visible)
			return false;
		if(this.root!=null)
			scale=scale||this.root.scale;
		if(!scale)
			scale=1;
		var _xc = this.relativePoint(x, y,scale);
		var x2 = _xc.x;
		var y2 = _xc.y;
		var result= (x2 >=0 && x2<= this.width*scale*this.scaleX && y2 >= 0 && y2<= this.height*scale*this.scaleY);
		if(!result){
			var functionPoint=math.checkPointInfunctionPoint(this,x,y,scale);
			if(functionPoint>0)
				result=true;
			else 
				result=math.checkPointInRotateKeyPoint(this,x,y,scale);
		}
		return result;
    };
    
    widget.prototype.relativePoint = function(x, y,scale) {
    	if(this.root)
    	  scale=scale||this.root.scale;
    	if(!scale)
			scale=1;
		var angle=math.angle(this.rotate);
		var cos=Math.cos(angle),sin=Math.sin(angle);
		
		var ox = (x-this.rotatepoint.x*scale)*cos+(y-this.rotatepoint.y*scale)*sin+this.rotatepoint.x*scale, 
		oy = (y-this.rotatepoint.y*scale)*cos-(x-this.rotatepoint.x*scale)*sin+this.rotatepoint.y*scale;
		
		return {
			x : ox-(this.x)*scale,
			y : oy-(this.y)*scale
		};
	};

	widget.prototype.clean = function() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		return this;
	};
	
	widget.prototype.persist=function(){
		return widget.persistproperty(this);
	};

	widget.persistproperty=function(widget){
		   var r={};		   
		   r.name=widget.name;
		   r.version=widget.version;
		   r.visible=widget.visible;
	       r.x=widget.x;
	       r.y=widget.y;
	       r.width=widget.width;
	       r.height=widget.height;
	       r.minwidth=widget.minwidth;
	       r.minheight=widget.minheight;
	       r.alpha=widget.alpha;
	       r.type=widget.type;
	       r.margin=widget.margin;
	       r.rotate=widget.rotate;
	       r.text=widget.text;
	       r.scaleX=widget.scaleX;
	       r.scaleY=widget.scaleY;
	       r.scale=widget.scale;
	       r.editable=widget.editable;
	       r.allowResizer=widget.allowResizer;
	       r.allowConnectionPoint=widget.allowConnectionPoint;
	       r.allowRotate=widget.allowRotate;
	       r.functionPoints=[];
	       if(widget.functionPoints.length>0){
	    	  $.extend(true,r.functionPoints,widget.functionPoints);
	       }
	       if(widget.gradient){
	    	   r.gradient={};
	    	   $.extend(r.gradient,widget.gradient);
	       }
	       if(widget.background){
	    	   r.background={};	    	   
	    	   $.extend(r.background,widget.background);
	    	   if(widget.background.image){
	    		   r.background.image=widget.background.image.src;	    
	    	   }
	       }
	       if(widget.corner){
	    	   r.corner={};
	    	   $.extend(r.corner,widget.corner);
	       }
	       if(widget.border){
	    	   r.border={};
	    	   $.extend(r.border,widget.border);
	       }
	       
	       if(widget.shadow){
	    	   r.shadow={};
	    	   $.extend(r.shadow,widget.shadow);
	       }
	       if(widget.rotatepoint){
	    	   r.rotatepoint={};
	    	   $.extend(r.rotatepoint,widget.rotatepoint);
	       }
	       if(widget.font){
	    	   r.font={};
	    	   $.extend(r.font,widget.font);
	       }
	       if(widget.hyperlink){
               r.hyperlink={};
               $.extend(r.hyperlink,widget.hyperlink);
          }
	       if(widget.arrow){
	    	   r.arrow={};
	    	   $.extend(r.arrow,widget.arrow);
	       }
	       r.widgets=[];
	       for(var i=0;i<widget.widgets.length;i++){
	    	   r.widgets.push(widget.widgets[i].persist());
	       }
	       return r;
	};	
	
	widget.prototype.drawImageTo = function(ctx) {
		var _widget=this;
		var dx=1;
		if(_widget.background==null||_widget.background.filltype!="image")
			return;
		var image = _widget.background.image;
		var type = _widget.background.imageType ? _widget.background.imageType : "fit";
		if (image) {
			if (type === "fit") {
				var _w = 0, _h, _x = 0, _y = 0;
				if (image.width > _widget.width) {
					_w = _widget.width;
					_h = (image.height / image.width) * _w;
					if (_h > _widget.height) {
						_h = _widget.height;
						_w = (image.width / image.height) * _h;
					}
				} else {
					_h = _widget.height;
					_w = (image.width / image.height) * _h;
					if (_w > _widget.width) {
						_w = _widget.width;
						_h = (image.height / image.width) * _w;
					}
				}
				_x = (_widget.width - _w) / 2;
				_y = (_widget.height - _h) / 2;
				ctx.drawImage(image, _x+dx, _y+dx, _w, _h);
			} else if (type === "repeat") {
				var _w = _widget.width, _h = _widget.height, _x = 0, _y = 0;
				while (true) {
					ctx.drawImage(image, _x+dx, _y+dx, image.width,image.height);
					_x += image.width;
					if (_x > _w) {
						_y += image.height;
						if (_y < _h) {
							_x = 0;
						} else {
							break;
						}
					}
				}
			} else if (type === "fill") {
				ctx.drawImage(image, dx, dx, _widget.width,_widget.height);
			} else if (type === "center") {
				var _w = image.width, _h = image.height, _x = 0, _y = 0;
				_x = (_widget.width - _w) / 2;
				_y = (_widget.height - _h) / 2;
				var sx=Math.abs(Math.min(0,_x)),sy=Math.abs(Math.min(0,_y));
				var sw=Math.min(_w,_widget.width),sh=Math.min(_h,_widget.height);
				var dx=Math.max(_x,0),dy=Math.max(_y,0);
				ctx.drawImage(image,sx,sy,sw,sh,dx,dy,sw,sh);
			}
		}
		return this;
	};
	
	widget.prototype.calculateSize=function(ctx){
		var margin=this.margin;
		ctx.save();
		if(this.font!=null&&this.text){
			if(typeof this.font==="String")
				ctx.font=this.font;
			else{
				ctx.font=this.font.style+" "+this.font.weight+" "+this.font.size+" "+this.font.family;
			}
			ctx.strokeStyle=this.font.color||"black";
			ctx.fillStyle=this.font.color||"black";
			metrics=ctx.measureText(this.text);	
			if(this.autosize){
				this.width=Math.round(metrics.width+2*margin);
				this.height=Math.round(this.fontSize()+2*margin);
				this.setResizers();
			}
			else{
				this.minwidth=Math.round(metrics.width+2*margin);
				this.minheight=Math.round(this.fontSize()+2*margin);
				this.width=Math.max(this.width,this.minwidth);
				this.height=Math.max(this.height,this.minheight);
			}
		}
		ctx.restore();
		return this;
	};
	
	widget.prototype.drawTextTo=function(ctx){
		var margin=this.margin;
		ctx.save();
		if(this.font!=null&&this.text){
			if(typeof this.font==="String")
				ctx.font=this.font;
			else{
				ctx.font=this.font.style+" "+this.font.weight+" "+this.font.size+" "+this.font.family;
			}
			ctx.strokeStyle=this.font.color||"black";
			ctx.fillStyle=this.font.color||"black";
			this.font.fill=this.font.fill!=null?this.font.fill:true;
			if(this.font.fill)
				ctx.fillText(this.text,margin,this.fontSize()+margin);
			else
				ctx.strokeText(this.text,margin,this.fontSize()+margin);
		}
		ctx.restore();
		return this;
	};
	
	widget.prototype.drawBorderTo=function(ctx){
		var _widget=this;
		if(!_widget.border)
			return;
		var dx=0.5; 
		if(_widget.border.color==="none" && _widget.background && _widget.background.filltype==="color" &&_widget.background.color!="none")
			_widget.border.color=_widget.background.color;
		else if(_widget.border.color==="none" && _widget.background && _widget.background.filltype==="gradient" &&_widget.gradient.begincolor!="none")
			_widget.border.color=_widget.gradient.begincolor;
		if (_widget.border.color !== "none") {
			ctx.save();
			ctx.beginPath();
			ctx.lineJoin="round";
			_widget.border.width=parseInt(_widget.border.width);
			ctx.lineWidth = _widget.border.width;
			ctx.lineCap="round";
			ctx.strokeStyle = _widget.border.color;
			if(_widget.border.type!=="solid"){
				var dashList = _widget.border.type==="dashed"?[ _widget.border.width+3, _widget.border.width+1]:[_widget.border.width+1,_widget.border.width+1]; 
				ctx.setLineDash(dashList);
			}
			if(this.corner&&this.corner.type==="round"){
                 var radius=this.corner.radius;
                 ctx.moveTo(dx,this.height-radius+dx);
                 ctx.lineTo(dx,radius+dx);
                 ctx.arcTo(dx,dx,radius+dx,dx,radius);                    
                 ctx.lineTo(this.width-radius+dx,dx);
                 ctx.arcTo(this.width+dx,dx,this.width+dx,radius+dx,radius);     
                 ctx.lineTo(this.width+dx,this.height-radius+dx);
                 ctx.arcTo(this.width+dx,this.height+dx,this.width-radius+dx,this.height+dx,radius);     
                 ctx.lineTo(radius+dx,this.height+dx);
                 ctx.arcTo(dx,this.height+dx,dx,this.height-radius+dx,radius);     
                 ctx.stroke();
                 this.fillBackgroundTo(ctx,2);
                 ctx.clip();
            }
            else{
            	 ctx.moveTo(dx,dx);
            	 ctx.lineTo(dx+this.width,dx);
            	 ctx.lineTo(dx+this.width,dx+this.height);
            	 ctx.lineTo(dx,this.height+dx);
            	 ctx.closePath();
            	 ctx.stroke();
                 this.fillBackgroundTo(ctx,2);
            	 ctx.clip();           	 
            }
			this.fillBackgroundTo(ctx);
			this.drawImageTo(ctx);	
			ctx.restore();
		}
		else{
			this.fillBackgroundTo(ctx);
			this.drawImageTo(ctx);	
		}
		return this;
	};
	
	widget.prototype.drawSelectionBorderTo=function(ctx){
		if(this.selectable){
			ctx.save();
			ctx.beginPath();
			ctx.globalAlpha = 1;
			ctx.strokeStyle= selectionColor;
			ctx.lineWidth = 1;
			ctx.strokeRect(0.5,0.5,this.width+0.5,this.height+0.5);
			ctx.fill();
			ctx.restore();
		}
	};	
	
	widget.prototype.drawResizerTo=function(ctx){
		ctx.save();
		ctx.beginPath();
		ctx.globalAlpha = 1;
		ctx.fillStyle = resizerColor;
		ctx.lineWidth = 1;
		var l=4;
		if(!this.autosize){
			for(var i=0;i<=this.resizers.length-1;i++){
			  if(this.resizers[i].visible)
			     ctx.fillRect(this.resizers[i].x-l,this.resizers[i].y-l,l*2,l*2);	
			}
		}
		ctx.restore();
	};
	
	widget.prototype.drawFunctionPointTo=function(ctx){
		if(this.functionPoints.length===0)
			return;
		ctx.save();
		ctx.beginPath();
		ctx.globalAlpha = 1;
		ctx.fillStyle = functionPointColor;
		ctx.lineWidth = 1;
		var l=4;
		if(this.functionPoints.length>0){
			for(var i=0;i<=this.functionPoints.length-1;i++){
			  if(this.functionPoints[i].visible){
				 var x=this.functionPoints[i].x;
				 var y=this.functionPoints[i].y;
				 var b=2*l*Math.sin(45*Math.PI/180);
				 ctx.moveTo(x,y-b);
				 ctx.lineTo(x+b,y);
				 ctx.lineTo(x,b+y);
				 ctx.lineTo(x-b,y);
				 ctx.closePath();
			  }
			}
			ctx.stroke();
			ctx.fill();
		}
		ctx.restore();
	};
	
	widget.prototype.drawConnectionPointTo=function(ctx){
		if(!this.allowconnectionPoint)
			return;
		ctx.save();
		ctx.globalAlpha = 1;
		ctx.fillStyle = resizerColor;
		ctx.lineWidth = 1;
		var radius=4;
		for(var i=0;i<=this.connectionPoints.length-1;i++){
		  if(this.connectionPoints[i].visible){
			  ctx.beginPath();
			  ctx.arc(this.connectionPoints[i].x,this.connectionPoints[i].y,radius,0,2*Math.PI);
			  ctx.stroke();
			  ctx.fill();
		  }
		}
		ctx.restore();
	};
	
	widget.prototype.drawRotateKeyPoint=function(ctx){
		if(!this.allowRotate)
			return;
		ctx.save();
		ctx.globalAlpha = 1;
		ctx.strokeStyle=resizerColor;
		ctx.fillStyle = rotatePointColor;
		ctx.lineWidth = 1;
		var radius=4;
		
		if(this.rotateKeyPoint.visible){
			  ctx.beginPath();
			  ctx.moveTo(this.width/2,0);
			  ctx.lineTo(this.rotateKeyPoint.x,this.rotateKeyPoint.y-radius);
			  ctx.stroke();
			  ctx.beginPath();
			  ctx.arc(this.rotateKeyPoint.x,this.rotateKeyPoint.y,radius,0,2*Math.PI);
			  ctx.stroke();
			  ctx.fill();			  
		}
		ctx.restore();
	};
	
	widget.prototype.fillBackgroundTo=function(ctx,type){
		var dx=0.5;
		if (this.gradient&&this.gradient.type!="none"&&(this.background &&this.background.filltype==="gradient")) {
			ctx.save();
			this.drawShadowTo(ctx);
			var gradient;
			if(this.gradient.type==="liner"){
				var angle=Math.atan(this.height/this.width)/Math.PI*180;
				var startx,starty,endx,endy;
				if(this.gradient.angle<90){
					startx=0,starty=0;
					if(this.gradient.angle<angle){
					  endx=this.width;
					  endy=this.width*Math.tan(this.gradient.angle*Math.PI/180);
					}
					else{
						 endy=this.height;
						 endx=this.height*Math.atan(this.gradient.angle*Math.PI/180);
					}
				}
				else if(this.gradient.angle===90){
					startx=0,starty=0;
					endx=0,endy=this.height;
					
				}
				else{
					startx=this.width,starty=0;
					if(this.gradient.angle<angle+90){
						 endy=this.height;
						 endx=this.width-this.height*Math.atan(this.gradient.angle*Math.PI/180);
					}					
					else{
						endx=0;
						endy=-this.height*Math.tan(this.gradient.angle*Math.PI/180);
					}
				}
				gradient = ctx.createLinearGradient(startx,starty,endx,endy);	
				if(this.gradient.angle<180){
					gradient.addColorStop(0,this.gradient.begincolor);
					gradient.addColorStop(1,this.gradient.endcolor);
				}
				else{
					gradient.addColorStop(0,this.gradient.endcolor);
					gradient.addColorStop(1,this.gradient.begincolor);					
				}
			}
			else{
				var radius=Math.max(this.width/2,this.height/2);
				gradient = ctx.createRadialGradient(this.width/2,this.height/2,this.gradient.radius,this.width/2,this.height/2,radius);
				gradient.addColorStop(0,this.gradient.begincolor);
				gradient.addColorStop(1,this.gradient.endcolor);
			}
			ctx.fillStyle = gradient;
			var style=type||1;
			if(style===1)
				ctx.fillRect(dx, dx, this.width-dx, this.height-dx);
			else
				ctx.fill();
			ctx.restore();			
		}
		else if (this.background!=null && this.background.color !== "none" &&(this.background.filltype==="color"||this.background.filltype==="image")) {
			ctx.save();
			this.drawShadowTo(ctx);
			ctx.fillStyle = this.background.color;
			var style=type||1;
			if(style===1)
				ctx.fillRect(dx, dx, this.width-dx, this.height-dx);
			else
				ctx.fill();
			ctx.restore();
		}
	};	

	widget.prototype.drawShadowTo=function(ctx){
		if (this.shadow && this.shadow.color !== "none" && !this.is_mouse_down) {
			ctx.shadowColor = this.shadow.color;
			ctx.shadowBlur = this.shadow.blur;
			ctx.shadowOffsetX = this.shadow.offsetX;
			ctx.shadowOffsetY = this.shadow.offsetY;
		} 
	};
	
	widget.prototype.paintTo=function(canvas,scaleX,scaleY){
		var ctx=canvas.getContext("2d");
		var _widget=this;
		ctx.save();				
		_widget.RotatePoint(_widget.x+_widget.width/2,_widget.y+_widget.height/2);
		if(canvas!=this.canvas){
			if(_widget.rotate===0)
				ctx.translate(_widget.x, _widget.y);
			else{
				var offset=math.getRotatePoint(_widget.rotate,_widget.rotatepoint);
				ctx.translate(_widget.x+offset.x, _widget.y+offset.y);
			}
		}
		else{
			if(_widget.rotate!==0)
			ctx.translate(_widget.rotatepoint.x, _widget.rotatepoint.y);
		}
		ctx.scale(this.scaleX,this.scaleY);
		ctx.rotate(_widget.rotate / 180 * Math.PI);
		ctx.globalAlpha = _widget.alpha;
		this.calculateSize(ctx);
		if(this.beforePaint)
			this.beforePaint(ctx);
		this.drawBorderTo(ctx);
		this.drawTextTo(ctx);
		if(this.focus&&canvas!=this.canvas&&this.editable){
			this.drawSelectionBorderTo(ctx);
			if(!this.focuswidget){
				this.drawRotateKeyPoint(ctx);
				if(this.allowResizer)
				   this.drawResizerTo(ctx);
				this.drawConnectionPointTo(ctx);
				this.drawFunctionPointTo(ctx);
			}
		}
		else if(this.inselect&&canvas!=this.canvas&&this.editable){
			this.drawSelectionBorderTo(ctx);
		}
		if(this.parent!=null){
			for(var i=0;i<=this.widgets.length-1;i++){
				if(this.widgets[i].visible)
					this.widgets[i].paintTo(canvas);
			}
		}
		if(this.afterPaint)
			this.afterPaint(this);
		ctx.restore();
	};
	
	widget.prototype.paint = function() {
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.paintTo(this.canvas);
		if(this.presenters.length>0){
			$(this.presenters).each(function(index,presenter){
				presenter.paint({action:"called from "+this.name});
			});
		}
		else{
			if(this.parent)
				this.parent.paint();
		}
		return this;
	};

	widget.prototype.Width = function(a) {
		if (arguments.length === 1) {
			var nw = (this.rotatepoint.offsetx / this.width) * a;
			this.x -= nw - this.rotatepoint.offsetx;
			this.rotatepoint.offsetx = this.rotatepoint.x - this.x;
			this.width = a;
			this.canvas.width = this.width;
			return this;
		} else {
			return this.width;
		}
	};
	
	widget.prototype.Height = function(a) {
		if (arguments.length === 1) {
			var nh = (this.rotatepoint.offsety / this.height) * a;
			this.y -= nh - this.rotatepoint.offsety;
			this.rotatepoint.offsety = this.rotatepoint.y - this.y;
			this.height = a;
			this.canvas.height = this.height;
			return this;
		} else {
			return this.height;
		}
	};
	
	widget.prototype.Widget = function(a) {
		if (arguments.length === 1) {
			var _a = null;
			if (typeof a === "string") {
				for (var i = 0; i < this.widgets.length; i++) {
					if (this.widgets[i].name === a) {
						_a = this.widgets[i];
						break;
					}
				}
			} else if(typeof a==="number") {
				if (a >= 0 && a < this.widgets.length) {
					_a = this.widgets[a];
				}
			}
			else if (typeof a === "object") {
				for (var i = 0; i < this.widgets.length; i++) {
					var isfound=true;
					for(p in this.widgets[i]){
						if(this.widgets[i][p]!=a[p])
							isfound=false;
							break;
					}
					if(isfound)
						_a = this.widgets[i];
				}
			}
			return _a;
		} else {
			return this.widgets;
		}
	};
	
	widget.prototype.Presenters = function(a) {
		if (arguments.length === 1) {
			var _a = null;
			if (typeof a === "string") {
				for (var i = 0; i < this.presenters.length; i++) {
					if (this.presenters[i].name === a) {
						_a = this.presenters[i];
						break;
					}
				}
			} 
			else if (typeof a === "number" && (a >= 0 && a < this.presenters.length)) {
				_a = this.presenters[a];
			}
			return _a;
		} else {
			return this.presenters;
		}
	};
	
	widget.prototype.downDepth = function() {
		var _a = this.parent.widgets;
        if (_a.length > 0 && this.depth <= _a.length) {
            for(var i=this.depth-2;i>=0;i--){
            	 this.parent.widgets[i+1] = this.parent.widgets[i];
            	 this.parent.widgets[i+1].depth=i+2;
            }
            this.parent.widgets[0] = this;
            this.depth = 1;
        }
		return this;
	};
	
	widget.prototype.downStep = function() {
		var _a = this.parent.widgets;
        if (_a.length > 0 && this.depth <= _a.length && this.depth>1) {
        	this.parent.widgets[this.depth-1]=this.parent.widgets[this.depth-2];
        	this.parent.widgets[this.depth-1].depth=this.depth;
        	this.parent.widgets[this.depth-2]=this;
        	this.parent.widgets[this.depth-2].depth=this.depth-1;
        }
		return this;
	};
		
	widget.prototype.topDepth = function() {
		var _a = this.parent.widgets;
        if (_a.length > 0 && this.depth <= _a.length) {
            var _ac = this;
            for(var i=this.depth-1;i<_a.length-1;i++){
            	this.parent.widgets[i] = this.parent.widgets[i+1];
            	this.parent.widgets[i].depth=i+1;
            }
            this.parent.widgets[_a.length - 1] = _ac;
            _ac.depth = this.parent.widgets.length;
        }
		return this;
	};
	
	widget.prototype.topStep = function() {
		var _a = this.parent.widgets;
        if (_a.length > 0 && this.depth < _a.length) {
            var _ac = this;
            this.parent.widgets[this.depth-1] = this.parent.widgets[this.depth];
            this.parent.widgets[this.depth-1].depth=this.depth;
            this.parent.widgets[this.depth] = _ac;
            _ac.depth = this.depth+1;
        }
		return this;
	};
	
	widget.prototype.appendPresenter = function(presenter) {
		this.parent=presenter.rootwidget;
		this.root=presenter.rootwidget;
		presenter.widgets.push(this);
		this.depth = presenter.widgets.length;
		this.presenters.push(presenter);
		if(this._widgets&&this._widgets.length>0){
			this.restoreChildren(this._widgets,{
				editable:this.editable,				
				includeChildren:true
			});
		 }
		return this;
	};
	
	widget.prototype.appendWidget = function(widget) {
		widget.root = this.root?this.root:this;
		widget.parent = this;
		this.widgets.push(widget);
		widget.depth = this.widgets.length;
		for(var i=0;i<=widget.widgets.length-1;i++){
			widget.widgets[i].root=widget.root;
		}
		return this;
	};
	
	widget.prototype.restoreChildren=function(_widgets,opt){
		var connectors=[];
		for(var i=0;i<=_widgets.length-1;i++){
			_widgets[i].scilence=this.scilence;
			$.extend(_widgets[i],opt);
			if(_widgets[i].background&&_widgets[i].background.image!=null&&_widgets[i].background.filltype==null)
				_widgets[i].background.filltype==="image";
			if(_widgets[i].begin!=null&&_widgets[i].end!=null&&_widgets[i].type.indexOf("Connector")>0)
				connectors.push(_widgets[i]);
			else{
				var _widget=$.widgets(_widgets[i].type,_widgets[i]);
				this.appendWidget(_widget);
			}
		}	
		for(var i=0;i<=connectors.length-1;i++){
			var _widget=$.widgets(connectors[i].type,connectors[i]);
			if(_widget.begin&&_widget.begin.widget){
				 _widget.begin.widget=this.Widget(_widget.begin.widget);
			}
			if(_widget.end&&_widget.end.widget){
				 _widget.end.widget=this.Widget(_widget.end.widget);
			}
			this.appendWidget(_widget);
		}
	};	
	
	widget.prototype.removeWidget = function(widget) {
		var key=this.widgets.length;
		for(var i=0;i<this.widgets.length;i++){
			if(this.widgets[i]===widget){
				for(var j=this.widgets[i].connections.length-1;j>=0;j--){
					this.removeWidget(this.widgets[i].connections[j]);
				}
				key=i;
				this.widgets.splice(i,1);
				i--;
			}
			if(i>=0)
				this.widgets[i].depth=i<key?i+1:i;
		}
		return this;
	};
	
	widget.prototype.RotatePoint = function(x, y) {
		if (arguments.length === 2) {
			this.rotatepoint.x = x;
			this.rotatepoint.y = y;
			this.rotatepoint.offsetx = x - this.x;
			this.rotatepoint.offsety = y - this.y;
			return this;
		} else {
			return this.rotatepoint;
		}
	};
	
	widget.prototype._triggerEvent = function(type, e) {
		if(type=="drop" && !this.allowdrop){
			return;
		}
		this.local = {x:e.x, y:e.y};	
		var _a = this.widgets;
		var ishas = false;
		var ev={};
		$.extend(ev,e);
		if(e.originalEvent){
			ev.originalEvent={};
			$.extend(ev.originalEvent,e.originalEvent);
		}
		for (var i = _a.length - 1; i >= 0; --i) {
			if (_a[i].checkPointIn(e.x, e.y)) {
				var _cc = _a[i].relativePoint(e.x, e.y);
				ev.x=_cc.x;
				ev.y=_cc.y;
				if((type==="mousedown"||type==="mouseup")&&_a[i].shadow&&_a[i].shadow.color!="none"){
					ev.requiredPaint=true;
				}	
				_a[i]._triggerEvent.call(_a[i], type, ev);	
				if(ev.requiredPaint)
					e.requiredPaint=true;
				ishas = true;
				break;
			}
		}
		if(type==="mousedown")
			this.is_mouse_down=true;
		else if(type==="mouseup")
			delete this.is_mouse_down;
		if (!ishas) {			
			ev.target = this;
			ev.eventType=type;
			ev.cancel=false;
			var _mc = this;
			while (_mc) {
				if (_mc[type]&&_mc.local) {
					ev.x =  _mc.local.x;
					ev.y =  _mc.local.y;
					ev.currentTarget = _mc;
					_mc[type].call(_mc, ev);					
				}
				if (ev.cancel) {
					_mc = null;
					e.cancel=true;
				} else {
					_mc = _mc.parent;
				}
			}
		}
	};

	widget.prototype.getImageData = function(x, y, width, height,targetwidth,targetheight) {
		var sx = x || 0,
		sy = y || 0,
		sw =parseInt(width || this.width),
		sh =parseInt(height || this.height),
		
		tw=targetwidth||sw,
		th=targetheight||sh;
	
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		var scale=Math.min(tw/sw,th/sh);
		canvas.width = tw;
		canvas.height = th;
		var pointx=(tw-sw*scale)/2;
		var pointy=(th-sh*scale)/2;
		ctx.drawImage(this.ctx.canvas, sx, sy,sw, sh, pointx, pointy,sw*scale, sh*scale);
		try{
			return  canvas.toDataURL("image/png");
		}
		catch(ex){
			console.warn(ex);
			return null;
		}
	};
	
	widget.prototype.getImageBlob = function(x, y, width, height,type) {
		if(!type)
			return dataURItoBlob(this.getImageData(x, y, width, height));
		else
			return dataURItoBlob(this.getImageData(x, y, width, height).replace("image/png",type));
	};
	
	/****presenter ****/
	presenter=function(option){
		var ops = {	
				name:"presenter",
				title:"presenter",
				dom : $("body"),
				width:1024,
				height:800,
				
				pagesize:"Other",
				pagein:-1,
				pageout:-1,
				pagedirection:"vertical",
				
				type:"panel",				
				background : {
					filltype:"color",
					color : "#ABABAB"
				},
				border:{
					color:"none",
					width:1,
					type:"solid",
				
				},
				showgrid:false,
				scale:1,
				dpi:8,
				aligngrid:true,
				mousedown:null,
				mousemove:null,
				mouseup:null,
				click:null,
				dblclick:null				
			};
		$.extend(ops,option);		
		$.extend(this,ops);
		this.offsetx = ops.dom.offset().left ? parseInt(ops.dom.offset().left): 0;
		this.offsety = ops.dom.offset().top ? parseInt(ops.dom.offset().top): 0;
		this.selectRect={
				x:0,
				y:0,
				width:0,
				height:0				
		};
		this.inSelection=false;
		this.point={
				x : 0,
				y : 0
		};
		var _widget = new widget({
			name : this.name,
			width : this.width,
			height : this.height,
			background : this.background,
			gradient:this.gradient,
			border:this.border,
			dpi:this.dpi,
			scale:this.scale,
			imageload:this.imageload
		});
		_widget.editable=true;
		_widget.paint();
		
		_widget.parent = null;
		_widget.local = {
				x : 0,
				y : 0
		 };
		_widget.mousedown = this.mousedown ? this.mousedown : null;
		_widget.mousemove = this.mousemove ? this.mousemove : null;
		_widget.mouseup = this.mouseup ? this.mouseup : null;
		_widget.click = this.click ? this.click : null;
		_widget.dblclick = this.dblclick ? this.dblclick : null;
		this.rootwidget=_widget;
		this.rootwidget.scale=ops.scale;
		this.ctx=_widget.ctx;
		this.canvas=_widget.canvas;
		if(this.dom && typeof(this.dom)=='object'){
			$(this.canvas).appendTo(this.dom);
			this.textbox=document.createElement("textarea");
			$(this.textbox).appendTo(this.dom).css("position","absolute").hide();
			this.mask=document.createElement("img");
			$(this.mask).appendTo(this.dom).css("position","absolute").hide();
		}
		this.widgets=_widget.widgets;
		this.connectors=[];
		this.history=[];
		this.redohistory=[];
		this.resizer=0;
		var canv = $(this.canvas).css({
			"-webkit-user-select" : "none",
			"-webkit-touch-callout" : "none",
			"-webkit-user-drag" : "none",
			"-webkit-tap-highlight-color" : "rgba(0,0,0,0)"
		}).get(0);
		$(canv).attr("tabindex","0");
		var ths = this;
		this.defaultcursor="default";
		var mousemoveHandler=function(e){
			ths._triggerEvent("mousemove", e);
		};
		
		canv.addEventListener("mousemove",mousemoveHandler);
			
		canv.addEventListener("click", function(e) {
			ths._triggerEvent("click", e);
		});
		canv.addEventListener("dblclick", function(e) {
			ths._triggerEvent("dblclick", e);
		});	
		
		canv.addEventListener("mousedown", function(e) {
			ths.offsetx = parseInt(ths.dom.offset().left);
			ths.offsety = parseInt(ths.dom.offset().top);			
			ths._triggerEvent("mousedown", e);
		});
		
		canv.addEventListener("mouseup", function(e) {
			ths._triggerEvent("mouseup", e);
			ths.Cursor(ths.defaultcursor);			
		});
		this.activewidget=null;	
		this.focuswidget=null;
		this.selectwidgets=[];
	};
	
	presenter.prototype.Height=function(a){
		if (arguments.length === 1) {
			this.height=a;
			this.rootwidget.height=a;
			this.canvas.height= a;
			this.canvas.style.height=a+"px";
			return this;
		} else {
			return this.height;
		}
	};	
	
	presenter.prototype.Width=function(a){
		if (arguments.length === 1) {
			this.width=a;
			this.rootwidget.width=a;
			this.canvas.width= a;
			this.canvas.style.width=a+"px";
			return this;
		} else {
			return this.width;
		}
	};	
	
	
	presenter.prototype.Cursor=function(a){
		if (arguments.length === 1) {
			this.canvas.style.cursor= a;
			return this;
		} else {
			return this.canvas.style.cursor;
		}
	};	
	
	presenter.prototype.Scale=function(a){
		if (arguments.length === 1) {
			this.scale=a;
			this.rootwidget.Scale(a);			
			return this;
		} else {
			return this.rootwidget.scale;
		}
	};	
	
	presenter.prototype.Widget=function(a){
		if(arguments.length===1){
			return this.rootwidget.Widget(a);
		}		
		return this.widgets;
	};
	
	presenter.persistproperty=function(presenter){
		var r={};
		r.name=presenter.rootwidget.name;
		r.width=presenter.rootwidget.width;
		r.height=presenter.rootwidget.height;
		r.title=presenter.title;
		r.scale=presenter.scale;
		r.showgrid=presenter.showgrid;
		r.aligngrid=presenter.aligngrid;
		r.pagesize=presenter.pagesize;
		r.pagein=presenter.pagein;
		r.pageout=presenter.pageout;
		r.pagedirection=presenter.pagedirection;
		if(presenter.rootwidget.background)
		{
			r.background={};
			$.extend(r.background,presenter.rootwidget.background);
			if(presenter.rootwidget.background.image){				
			  r.background.image=presenter.rootwidget.background.image.src;
	    	}
		}
		if(presenter.rootwidget.border)
		{
			r.border={};
			$.extend(r.border,presenter.rootwidget.border);
		}
		r.widgets=[];
		for(var i=0;i<presenter.widgets.length;i++){
			r.widgets.push(presenter.widgets[i].persist());
		}
		return r;
	};
	
	presenter.prototype.persist=function(){
		return presenter.persistproperty(this);
		
	};	

	presenter.prototype.appendWidget = function(widget) {
			widget.root=this.rootwidget;
			widget.parent=this.rootwidget;
			this.widgets.push(widget);
			widget.presenters.push(this);
		return this;
	};
	
	presenter.prototype.drawGrid=function(){
		var dx=0.5;
		var l=4*this.dpi;
		var linecolor="silver";
		this.ctx.save();
		this.ctx.strokeStyle=linecolor;
		this.ctx.lineWidth=1;
		this.ctx.beginPath();
		var dashList =[4,3]; 
        this.ctx.setLineDash(dashList);
		for(var i=l;i<this.rootwidget.width;){
			this.ctx.moveTo(i+dx,0);
			this.ctx.lineTo(i+dx,this.rootwidget.height);
			i+=l;
			
		}
		for(var i=l;i<this.rootwidget.height;){
			this.ctx.moveTo(0,i+dx);
			this.ctx.lineTo(this.rootwidget.width,i+dx);
			i+=l;
		}
		this.ctx.stroke();
		this.ctx.restore();
	};
	
	presenter.prototype.paint=function(opt){
		this.rootwidget.paint();
		if(this.showgrid)
			this.drawGrid();
		this.connectors.splice(0,this.connectors.length);
		var  widgets=[];
		for(var i=0;i<this.widgets.length;i++){
			var _widget=this.widgets[i];
			if(_widget.begin!=null&&_widget.begin.widget!=null&&_widget.end!=null&&_widget.type.indexOf("Connector")>0&&_widget.end.widget!=null)
				this.connectors.push(_widget);
			else{
				if(!opt||!opt.filter||typeof opt.filter!="function"||opt.filter(_widget)==false){
					if(_widget.visible)
						widgets.push(_widget);
					//_widget.paintTo(this.canvas);
				}
			}
		}
	
		for(var j=0;j<=this.connectors.length-1;j++){
			var _connector=this.connectors[j];
			if(!opt||!opt.filter||typeof opt.filter!="function"||opt.filter(_connector)==false){
				if(_connector.visible&&_connector.begin.widget.visible&&_connector.end.widget.visible)
					_connector.paintTo(this.canvas);
			}
		}
		for(var j=0;j<=widgets.length-1;j++){
			if(widgets[j].visible)
				widgets[j].paintTo(this.canvas);
		}
		
		if(this.selectwidgets.length>0){
			this.calculateRect();
			this.fillSelectionRegion();
		}
		
		if(this.afterPaint)
			this.afterPaint(this);
		return this;
	};
		
	presenter.prototype.fillSelectionRegion=function(){
		if(this.inSelection||this.selectwidgets.length>1){
			var ctx=this.canvas.getContext("2d");
			ctx.save();
			ctx.beginPath();
			ctx.globalAlpha = 0.5;
			ctx.fillStyle = selectionColor;
			ctx.strokeStyle= selectionColor;
			ctx.lineWidth = 1;			
			ctx.fillRect(this.selectRect.x/this.scale,this.selectRect.y/this.scale,this.selectRect.width/this.scale,this.selectRect.height/this.scale);
			ctx.restore();			
		}		
	};	
	
	presenter.prototype.removeWidget=function(widgets,skip){
		var _widgets=[];
		var result=[];
		if(widgets.length&&widgets.length>0)
			_widgets=widgets;
		else
			_widgets.push(widgets);
		for(var j=0;j<=_widgets.length-1;j++){
			var widget=_widgets[j];
			for(var i=0;i<this.widgets.length;i++){
				if(this.widgets[i]===widget){
					if(!skip)
						result.push(this.widgets[i].persist());
					for(var j=this.widgets[i].connections.length-1;j>=0;j--){
						if(!skip)
							result.push(this.widgets[i].connections[j].persist());
						this.removeWidget(this.widgets[i].connections[j],true);
					}
					this.widgets.splice(i,1);
					i--;
				}
				if(i>=0)
					this.widgets[i].depth=i+1;
			}
		}
		if(result.length>0 && $.command)
			$.command("delete",this,result);
		return this;
	};	
	
	presenter.prototype.calculateRect=function(){
		var margin=1;
		for(var i=0;i<=this.selectwidgets.length-1;i++){
			var top_left={
					x:this.selectwidgets[i].x*this.scale,
					y:this.selectwidgets[i].y*this.scale
			
			};
			var right_bottom={
				x:	this.selectwidgets[i].x*this.scale+this.selectwidgets[i].width*this.selectwidgets[i].scaleX*this.scale,
				y:  this.selectwidgets[i].y*this.scale+this.selectwidgets[i].height*this.selectwidgets[i].scaleY*this.scale
			};
			if(i===0){
				this.selectRect.x=top_left.x;
				this.selectRect.y=top_left.y;
				this.selectRect.width=right_bottom.x-top_left.x;
				this.selectRect.height=right_bottom.y-top_left.y;
			}
			else{
				right_bottom.x=Math.max(right_bottom.x,this.selectRect.x+this.selectRect.width);
				right_bottom.y=Math.max(right_bottom.y,this.selectRect.y+this.selectRect.height);
				this.selectRect.x=Math.min(this.selectRect.x,top_left.x);
				this.selectRect.y=Math.min(this.selectRect.y,top_left.y);
				this.selectRect.width=right_bottom.x-this.selectRect.x;
				this.selectRect.height=right_bottom.y-this.selectRect.y;
			}
		}
		if(this.selectwidgets.length>0){
			this.selectRect.x=(this.selectRect.x-margin);
			this.selectRect.y=(this.selectRect.y-margin);
			this.selectRect.width=(this.selectRect.width+2*margin);
			this.selectRect.height=(this.selectRect.height+margin*2);
		}
	};

	presenter.prototype.clearSelection=function()
	{
		for(var k=0;k<this.selectwidgets.length;k++){
			this.selectwidgets[k].inselect=false;
		}
		this.selectwidgets.splice(0,this.selectwidgets.length);
	};

	presenter.prototype.deleteFocus=function(){
//		if(!window.confirm("Are you sure delete the item?"))
//			return;
		var _widgets=[];
		if(this.focuswidget&&this.focuswidget.editable){
			this.removeWidget(this.focuswidget);
			if(this.focuswidget.ondelete!=null){
				this.focuswidget.ondelete.call(this.focuswidget);
			}
			this.focuswidget=null;
		}
		for(var i=0;i<this.selectwidgets.length;i++){
			if(this.selectwidgets[i].editable)
				_widgets.push(this.selectwidgets[i]);
		}
		this.removeWidget(_widgets);
		this.clearSelection();
		this.paint({action:"delete focus"});	
		return true;
	};
	
	presenter.prototype.getName=function(prefix){
		var f="widget";
		if (arguments.length === 1){			
				f=prefix;
		}
		var index=1;
		while(this.rootwidget.Widget(f+index)!=null){
			index++;
		}
		return f+index;
	};
	
	presenter.startMoveWidget=function(presenter,e,ev){
		var $mask=$(presenter.mask);
		var ths=presenter;
		if(!ths.activewidget)
			return;
		var left=parseInt(ths.activewidget.x)*ths.scale;
		var top=parseInt(ths.activewidget.y)*ths.scale;
		var width=ths.activewidget.width*ths.scale;
		var height=ths.activewidget.height*ths.scale;
		if(ths.selectwidgets.length>1){
			left=parseInt(ths.selectRect.x);
			top=parseInt(ths.selectRect.y);
			width=ths.selectRect.width;
			height=ths.selectRect.height;
		}
		$mask.css("z-index",0)
		   .css("width",width*ths.activewidget.scaleX)
		   .css("height",height*ths.activewidget.scaleY)
		   .css("left",left)
		   .css("top",top)
		   .css("border","solid 1px")
		   .css("border-color",resizerColor)
		   .css("-moz-transform","rotate("+ths.activewidget.rotate+"deg)")
		   .css("transform","rotate("+ths.activewidget.rotate+"deg)")
		   .css("-webkit-transform","rotate("+ths.activewidget.rotate+"deg)")
		   .css("-o-transform","rotate("+ths.activewidget.rotate+"deg)")
		   .attr("moving",true)
		   .attr("oldx",e.clientX)
		   .attr("oldy",e.clientY)		   
		   .attr("offsetX",ev.x)
		   .attr("offsetY",ev.y)		   
		   .css("cursor","move")		 
		   .bind("click",function(e){
			   var destory=function(){
				   $(window).unbind("mousemove").unbind("mouseup");
				   $mask.unbind();
				   $mask.hide().css("height","1px").css("width","1px").css("cursor","default");   
			   };
			   setTimeout(destory,100);
			   if(ths.activewidget){
				   delete ths.activewidget.is_mouse_down;				   
				   ths.activewidget._triggerEvent("click",ev);
				   ths.activewidget=null;
				   ths.paint();
			   }
		   })
		   .bind("dblclick",function(e){
			   console.info("dblclick");
		   }).show();
		
		$(window).bind("mousemove",function(e){
			e.preventDefault();
			var $this=$mask;
			if($this.attr("moving")){
			   var offsetX=$this.attr("oldx")-e.clientX;
			   var offsetY=$this.attr("oldy")-e.clientY;
			   var left=$this.css("left");
			   var top=$this.css("top");
			   left=(parseInt(left.substring(0,left.length-2))-offsetX);					
			   top=(parseInt(top.substring(0,top.length-2))-offsetY);
			   $this.css("top",top)
			   		.css("left",left)
			   		.attr("oldy",e.clientY)
			   		.attr("oldx",e.clientX);
			}
		}).bind("mouseup",function(e){
		   e.preventDefault();
		   if($mask.attr("moving")){
			   $mask.attr("moving",false);
			   var left2=$mask.css("left");
			   var top2=$mask.css("top");
			   delete ths.is_mouse_down;
			   var offsetX=parseInt(left2.substring(0,left2.length-2))-left;
			   var offsetY=parseInt(top2.substring(0,top2.length-2))-top;
			   if(ths.selectwidgets.length>1){
				   $(ths.selectwidgets).each(function(i,item){
					  item.x=(parseInt(item.x)+offsetX/ths.scale);
					  item.y=(parseInt(item.y)+offsetY/ths.scale);
				   });
			   }
			   else if(ths.activewidget){
				   var position1={x:ths.activewidget.x,y:ths.activewidget.y,width:ths.activewidget.width,height:ths.activewidget.height};
				   ths.activewidget.x=parseInt(left2.substring(0,left2.length-2))/ths.scale;
				   ths.activewidget.y=parseInt(top2.substring(0,top2.length-2))/ths.scale;
				   var position2={x:ths.activewidget.x,y:ths.activewidget.y,width:ths.activewidget.width,height:ths.activewidget.height};
				   if(position1.x!=position2.x||position1.y!=position2.y||position1.width!=position2.width||position1.height!=position2.height)
					   if($.command)
						   $.command("move",ths,ths.activewidget.name,position1,position2);
				   ev.offsetX=offsetX;
				   ev.offsetY=offsetY;
				   if(ths.aligngrid){
					   var dx=ths.activewidget.x%(4*ths.dpi);
					   var dy=ths.activewidget.y%(4*ths.dpi);
					   if(dx>=2*ths.dpi)
						   ths.activewidget.x+=(4*ths.dpi-dx);
					   else
						   ths.activewidget.x-=dx;
					   
					   if(dy>=2*ths.dpi)
						   ths.activewidget.y+=(4*ths.dpi-dy);
					   else
						   ths.activewidget.y-=dy;
				   }
				   				   
				   ths.activewidget._triggerEvent("mouseup",ev);
			   }
			   $mask.trigger("click");		
		   }
		});
		  
	};

	presenter.prototype.adddefaultconnection=function(e){
//		console.info("add default connection from "+this.focuswidget.name+" to "+this.targetwidget.name);
	};

	var oldwidget=null;
	presenter.prototype._triggerEvent = function(type, e) {
		if(type==="keypress"){
			if($(this.textbox).css("display")==="none"){
				if(this.focuswidget!=null&&this.focuswidget.keypress!=null)
					this.focuswidget.keypress.call(this.focuswidget,e);
				if(e.cancel)
					return;
				if(this.keypress)
					this.keypress(e);
			}
			return true;
		}
		if(e.stopPropagation)
			e.stopPropagation();
		e.preventDefault();		
		if(e.center){
			this.point.x = e.center.x;
			this.point.y = e.center.y;
		}
		else if(e.offsetX){
			this.point.x = e.offsetX;
			this.point.y = e.offsetY;
		}
		else{
			this.point.x = e.layerX;
			this.point.y = e.layerY;
		}
		var ev={};
		ev.desktopX=ev.x=this.point.x;
		ev.desktopY=ev.y=this.point.y;
		ev.originalEvent=e;
		ev.button=e.button;	
		ev.buttons=e.buttons;
		this.targetwidget=null;
		var connectors=[];
		var _requiredPaint=false;
		for (var i = this.widgets.length - 1; i >= 0; --i) {
//			console.info(this.widgets[i].name+"-"+this.widgets[i].height);
		
			if(this.widgets[i].begin!=null&&this.widgets[i].end!=null&&this.widgets[i].type.indexOf("Connector")>0)
				connectors.push(this.widgets[i]);
			else if (this.widgets[i].checkPointIn(this.point.x, this.point.y)) {
				var _cc = this.widgets[i].relativePoint(this.point.x,this.point.y);
				ev.x=_cc.x;
				ev.y=_cc.y;
				this.targetwidget=this.widgets[i];
				if (type === "mousedown"&&this.resizer===0&&e.button===0){
					this.activewidget = this.widgets[i];
					if(this.focuswidget!=this.widgets[i]){						
						if(this.focuswidget!=null){
							if(this.focuswidget.root.focus!=undefined)
								this.focuswidget.root.focus=false;
							else if(this.focuswidget.parent.focus!=undefined)
								this.focuswidget.parent.focus=false;	
							this.focuswidget.focus=false;
						}
						this.focuswidget=this.widgets[i];
						this.focuswidget.focus=true;	
						_requiredPaint=true;
					}
			    }
				if(e.center)
					ev=e;		
				this.widgets[i]._triggerEvent.call(this.widgets[i], type, ev);
				e.cancel=ev.cancel;
				break;
			}
		}
		if(this.targetwidget===null){
			for (var i = 0; i <=connectors.length - 1; i++) {
				if (connectors[i].checkPointIn(this.point.x, this.point.y)) {
					var _cc = connectors[i].relativePoint(this.point.x,this.point.y);
					ev.x=_cc.x;
					ev.y=_cc.y;
					this.targetwidget=connectors[i];
					if (type === "mousedown"&&this.resizer===0&&e.button===0){
						this.activewidget = connectors[i];
						if(this.focuswidget!=connectors[i]){
							if(this.focuswidget!=null)
								this.focuswidget.focus=false;
							this.focuswidget=connectors[i];
							this.focuswidget.focus=true;	
							_requiredPaint=true;
						}
				    }
					else if(type=="mousemove"){						
						this.defaultcursor="pointer"
					}
					connectors[i]._triggerEvent.call(connectors[i], type, ev);
					e.cancel=ev.cancel;
					break;
				}
				else
					this.defaultcursor="default"
			}
			this.Cursor(this.defaultcursor);
		}
		
		if(this.targetwidget==null){
			this.rootwidget._triggerEvent.call(this.rootwidget,type,ev);
		}
		_requiredPaint=_requiredPaint||ev.requiredPaint;
		
		if(type==="mousedown" && e.button===0){
			this.is_mouse_down=true;
			if(this.focuswidget!=null&&this.focuswidget.allowconnectionPoint&&(this.functionPoint===0)){
				this.connectionPoint=math.checkPointInconnectionPoint(this.focuswidget,this.point.x, this.point.y);
				if(this.connectionPoint>0){
					this.drawingconnection=true;
				}				
			}
			if(this.activewidget && this.activewidget.shadow&&this.activewidget.shadow.color!="none")
				_requiredPaint=true;
			
			if(this.focuswidget&&this.focuswidget.allowRotate){
				this.rotating=math.checkPointInRotateKeyPoint(this.focuswidget,this.point.x, this.point.y);	
			}
			if (this.activewidget != null && this.activewidget.editable&&!this.rotating&&!this.drawingconnection&&(this.functionPoint===0||!this.functionPoint)) {
				oldwidget=this.activewidget.persist();
				this.inSelection=false;
				this.Cursor("move");				
				this.activewidget.setResizers();		
				this.canvas.focus();
				var ths=this;
				var initMoveWidget=function(){
					if(ths.activewidget&&ths.activewidget.type.indexOf("Connector")<0&&ths.is_mouse_down)
						presenter.startMoveWidget(ths,e,ev);
				};
				setTimeout(initMoveWidget,200);
			}
			else if(this.activewidget == null){
				if(!this.rotating&&(!this.functionPoint||this.functionPoint==0)){
					$(this.textbox).hide();
					this.clearSelection();
					if(this.resizer===0&&!this.drawingconnection){
						this.inSelection=true;
						if(this.focuswidget)
						{
							if(this.focuswidget.root.focus!=undefined)
								this.focuswidget.root.focus=false;
							else if(this.focuswidget.parent.focus!=undefined)
								this.focuswidget.parent.focus=false;
							this.focuswidget.focus=false;
							this.focuswidget=null;
							
						}
					}
					this.selectRect.x=this.point.x;
					this.selectRect.y=this.point.y;
				}					
			}
			if (this.focuswidget!=null&&this.focuswidget.editable){
				this.functionPoint=math.checkPointInfunctionPoint(this.focuswidget,this.point.x, this.point.y);	
				if(this.functionPoint>0){
					this.activewidget=this.focuswidget;
					oldwidget=this.activewidget.persist();
				}				
				this.focuswidget.oldX = this.point.x;
				this.focuswidget.oldY = this.point.y;
			}
				
			if(_requiredPaint)
				this.paint({action: "mousedown"});
		}
		else if(type==="mousemove"){
			this.Cursor(this.defaultcursor);
			if (this.activewidget != null&&this.activewidget.editable) {
				var $mask=$(this.mask);
				if($mask.attr("moving")){
				   var offsetX=$mask.attr("oldx")-e.clientX;
				   var offsetY=$mask.attr("oldy")-e.clientY;
				   var left=$mask.css("left");
				   var top=$mask.css("top");
				   left=parseInt(left.substring(0,left.length-2))-offsetX;					
				   top=parseInt(top.substring(0,top.length-2))-offsetY;
				   $mask.css("top",top)
				   		.css("left",left)
				   		.attr("oldy",e.clientY)
				   		.attr("oldx",e.clientX);
				}
			}	
			if (this.focuswidget!=null&&this.focuswidget.editable){
				if(!this.is_mouse_down){
					this.functionPoint=math.checkPointInfunctionPoint(this.focuswidget,this.point.x, this.point.y);
					if(this.functionPoint>0)
						this.Cursor(this.focuswidget.functionPoints[this.functionPoint-1].cursor?this.focuswidget.functionPoints[this.functionPoint-1].cursor:"move");
					else{
						this.Cursor(this.defaultcursor);
						this.resizer=math.checkPointInResizer(this.focuswidget,this.point.x, this.point.y);
						if(this.resizer>0)
							this.Cursor(this.focuswidget.resizers[this.resizer-1].cursor?this.focuswidget.resizers[this.resizer-1].cursor:"move");	
						else{
							if(this.focuswidget.allowconnectionPoint){
								this.connectionPoint=math.checkPointInconnectionPoint(this.focuswidget,this.point.x, this.point.y);
								if(this.connectionPoint>0)
									this.Cursor(this.focuswidget.connectionPoints[this.connectionPoint-1].cursor?this.focuswidget.connectionPoints[this.connectionPoint-1].cursor:"move");
							}
							if(this.focuswidget.allowRotate){
								if (math.checkPointInRotateKeyPoint(this.focuswidget,this.point.x,this.point.y))
									this.Cursor(this.focuswidget.rotateKeyPoint.cursor);
							}							
						}
					}
				}
				else{
					if(this.drawingconnection){
						this.paint({action:"drawingconnection"});
						this.ctx.save();
						this.ctx.strokeStyle="black";
						this.ctx.lineWidth=1;
						this.ctx.lineCap=this.focuswidget.linecap;
						this.ctx.beginPath();
						this.ctx.moveTo(this.focuswidget.connectionPoints[this.connectionPoint-1].x*this.focuswidget.scaleX+this.focuswidget.x,this.focuswidget.connectionPoints[this.connectionPoint-1].y*this.focuswidget.scaleY+this.focuswidget.y);
						this.ctx.lineTo(this.point.x/this.scale,this.point.y/this.scale);
						this.ctx.stroke();
						this.ctx.restore();
					}
					else if(this.rotating){						
						var ox = this.point.x -this.focuswidget.rotatepoint.x*this.scale;
						var oy = this.point.y -this.focuswidget.rotatepoint.y*this.scale;
						var to = Math.abs( ox/oy );
						var angle = Math.atan(to )/( 2 * Math.PI ) * 360;
						if( ox < 0 && oy < 0)//相对在左上角，第四象限，js中坐标系是从左上角开始的，这里的象限是正常坐标系
						{
							angle = -angle;
						}else if( ox < 0 && oy > 0)//左下角,3象限
						{
							angle = -( 180 - angle );
						}else if( ox > 0 && oy < 0)//右上角，1象限
						{
							angle = angle;
						}else if( ox > 0 && oy > 0)//右下角，2象限
						{
							angle = 180 - angle;
						}
						var offsetAngle = angle - this.focuswidget.rotate;
						this.focuswidget.rotate=Math.round(angle);
						_requiredPaint=true;
					}
					else if(this.functionPoint>0){
						var offsetX = this.point.x - (this.focuswidget.functionPoints[this.functionPoint-1].x+this.focuswidget.x)*this.scale;
						var offsetY = this.point.y - (this.focuswidget.functionPoints[this.functionPoint-1].y+this.focuswidget.y)*this.scale;
						this.focuswidget.functionPoints[this.functionPoint-1].x+=offsetX;
						this.focuswidget.functionPoints[this.functionPoint-1].y+=offsetY;
						if(this.focuswidget.afterfunctionPoint){
							var ev2={
									  offset:{
										  x:offsetX,
										  y:offsetY
									  },
									  point:this.point,
									  functionPoint:this.functionPoint,
									  originalEvent:e
								   };
							this.focuswidget.afterfunctionPoint(ev2);
						}
						_requiredPaint=true;
					}
					else if(this.resizer>0){
						if(this.focuswidget.oldX!=null){
							var dx = (this.point.x - this.focuswidget.oldX)/this.scale;
							var dy = (this.point.y - this.focuswidget.oldY)/this.scale;
							var angle=math.angle(this.focuswidget.rotate);
							var cos=Math.cos(angle),sin=Math.sin(angle);
							
							var offsetX=dx*cos+dy*sin;
							var offsetY=dy*cos-dx*sin;
							if(e.ctrlKey&&this.focuswidget.type.indexOf("Connector")<0)
								offsetY=offsetX;
							this.focuswidget.oldX=this.point.x;
							this.focuswidget.oldY=this.point.y;
							this.focuswidget.oldwidth=this.focuswidget.width;
							this.focuswidget.oldheight=this.focuswidget.height;
							if(this.focuswidget.resize===null){
								if(this.resizer===1){
									this.focuswidget.x+=offsetX;
									this.focuswidget.width-=offsetX;
									this.focuswidget.y+=offsetY;
									this.focuswidget.height-=offsetY;
								}
								else if(this.resizer===2){
									this.focuswidget.width+=offsetX;
									this.focuswidget.y+=offsetY;
									this.focuswidget.height-=offsetY;
								}
								else if(this.resizer===3){
									this.focuswidget.x+=offsetX;
									this.focuswidget.width-=offsetX;
									this.focuswidget.height+=offsetY;
								}
								else if(this.resizer===4){
									this.focuswidget.width+=offsetX;
									this.focuswidget.height+=offsetY;
								}
								if(this.focuswidget.afterresize){
									var ev2={
											  offset:{
												  x:offsetX,
												  y:offsetY
											  },
											  point:this.point,
											  resizer:this.resizer,
											  originalEvent:e
										   };
									this.focuswidget.afterresize(ev2);
								}
								this.focuswidget.setResizers();							
							}
							else{
								var ev2={
								  offset:{
									  x:offsetX,
									  y:offsetY
								  },
								  point:this.point,
								  resizer:this.resizer,
								  originalEvent:e
							   };
								this.focuswidget._triggerEvent.call(this.focuswidget, "resize", ev2);
							}
							if(this.focuswidget.background!=null && this.focuswidget.background.image!=null||this.focuswidget.widgets.length>0){
								this.focuswidget.width=Math.max(this.focuswidget.width,this.focuswidget.minwidth);
								this.focuswidget.height=Math.max(this.focuswidget.height,this.focuswidget.minheight);
							}
							if(!this.focuswidget.disableScale){
								var scaleX=this.focuswidget.width/(this.focuswidget.oldwidth);
								var scaleY=this.focuswidget.height/(this.focuswidget.oldheight);
								for(var i=0;i<=this.focuswidget.widgets.length-1;i++){
									this.focuswidget.widgets[i].width=this.focuswidget.widgets[i].width*scaleX;
									this.focuswidget.widgets[i].height=this.focuswidget.widgets[i].height*scaleY;
									this.focuswidget.widgets[i].x=this.focuswidget.widgets[i].x*scaleX;
									this.focuswidget.widgets[i].y=this.focuswidget.widgets[i].y*scaleY;
								}
							}
							_requiredPaint=true;
						}
					}	
				}
			}
			if(this.targetwidget){
				this.Cursor("pointer");
			}
			if(_requiredPaint)
				this.paint({action:"mousemove"});
			if(this.inSelection&&e.button===0&&e.buttons==1){
				var offsetX=this.point.x-this.selectRect.x;
				var offsetY=this.point.y-this.selectRect.y;
				this.selectRect.width=offsetX;
				this.selectRect.height=offsetY;
				if(!_requiredPaint)
					this.paint({action:"mousemove"});
				this.fillSelectionRegion();
			}			
		}
		else if(type==="mouseup" && e.button===0){
			var $mask=$(this.mask);
			if($mask.attr("moving")){
				$mask.trigger("mouseup");
			}
			
			if($.command&&this.functionPoint>0 && this.focuswidget){
				$.command("change",this,this.focuswidget.persist(),oldwidget);
			}
			
			if(this.drawingconnection&&this.targetwidget!=null&&this.targetwidget!=this.focuswidget){
				var _cc = this.targetwidget.relativePoint(ev.desktopX,ev.desktopY);
				ev.x=_cc.x;
				ev.y=_cc.y;
				this.adddefaultconnection(ev);
			}
			else if(this.drawingconnection&&this.targetwidget==null){
				_requiredPaint=true;
			}
			if(this.focuswidget!=null&&this.focuswidget.is_mouse_down&&!this.focuswidget.editable){
				this.focuswidget.focus=false;
				delete this.focuswidget.is_mouse_down;		
				_requiredPaint=true;
			}
			if (this.focuswidget!=null&&this.focuswidget.editable){
				var widget=this.focuswidget;
				if(widget.width<0 && widget.height>0){
					widget.width=-widget.width;
					widget.x-=widget.width;
					//widget.direction=widget.direction===1?2:1; //2-->4
					if(widget.direction===1)
						widget.direction=2;
					else if(widget.direction===2)
						widget.direction=1;
					else if(widget.direction===4)
						widget.direction=3;
					else if(widget.direction===3)
						widget.direction=4;
				}
				else if(widget.width>0&&widget.height<0){
					widget.height=-widget.height;
					widget.y-=widget.height;
					if(widget.direction===1)
						widget.direction=4;
					else if(widget.direction===2)
						widget.direction=3;
					else if(widget.direction===4)
						widget.direction=1;
					else if(widget.direction===3)
						widget.direction=2;
				}else if(widget.width<0&&widget.height<0){
					widget.height=-widget.height;
					widget.width=-widget.width;
					widget.x-=widget.width;
					widget.y-=widget.height;
					widget.direction=widget.direction>2?widget.direction-2:widget.direction+2;
				}
				if(oldwidget){
					var position1={x:oldwidget.x,y:oldwidget.y,width:oldwidget.width,height:oldwidget.height};
					var position2={x:widget.x,y:widget.y,width:widget.width,height:widget.height};
					if(position1.x!=position2.x||position1.y!=position2.y||position1.width!=position2.width||position1.height!=position2.height)
						if($.command)
							$.command("move",this,widget.persist(),position1,position2);
				}
				widget.setResizers();
				delete this.is_mouse_down;
				delete this.drawingconnection;
				delete this.rotating;
			}
			if (_requiredPaint)
			   this.paint({action:"mouseup"});
			if(this.inSelection){
				var offsetX=this.point.x-this.selectRect.x;
				var offsetY=this.point.y-this.selectRect.y;
				if(offsetX<0)
					this.selectRect.x+=offsetX;
				if(offsetY<0)
					this.selectRect.y+=offsetY;
				this.selectRect.width=Math.abs(offsetX);
				this.selectRect.height=Math.abs(offsetY);
				if(this.selectRect.width>0&&this.selectRect.height>0){
					for(var i=0;i<=this.widgets.length-1;i++){
						if(this.widgets[i].editable&&math.checkwidgetInRect(this.widgets[i],this.selectRect)){
							this.widgets[i].inselect=true;
							this.selectwidgets.push(this.widgets[i]);
						}
					}				
					this.calculateRect();
				}
				this.inSelection=false;
				if (!_requiredPaint)
					this.paint({action:"mouseup"});	
				if(this.selectwidgets.length>0)
					this.fillSelectionRegion();
			}
		}
		else if(type==="click" && e.button===0){	
			if (this.activewidget != null) {
				if(e.ctrlKey){
					if(this.activewidget.type.indexOf("Connector")>0)
						this.activewidget.downDepth();
					else
						this.activewidget.topDepth();
					this.activewidget.inselect=true;
					for(var j=0;j<this.selectwidgets.length;j++){
						if(this.selectwidgets[j]===this.activewidget){
							this.activewidget.inselect=false;
							this.selectwidgets.splice(j,1);
							break;
						}
					}
					if(this.activewidget.inselect){
						this.selectwidgets.push(this.activewidget);
					}
					_requiredPaint=true;
				}
				if(this.activewidget.shadow&&this.activewidget.shadow.color!="none")
					_requiredPaint=true;
				if(_requiredPaint)
					 this.paint({action:"click"});					
				this.activewidget = null;
			}
		}
		else if(type==="dblclick"&& e.button===0&&!ev.cancel){
			if (this.focuswidget!=null&&this.focuswidget.editable){				
				if(!this.focuswidget.dblclick)						
					$(this.textbox).val(this.focuswidget.text)
					   .css("width",Math.max(this.focuswidget.width+30,100)*this.scale)
					   .css("height",Math.max(this.focuswidget.height+30,100)*this.scale)
					   .css("left",this.focuswidget.x*this.scale)
					   .css("top",this.focuswidget.y*this.scale)
					   .show();
						var ths=this;
						$(this.textbox).off("keyup");
						$(this.textbox).on("keyup",function(e){
							e.preventDefault();
						   if(e.keyCode===13&&e.ctrlKey){
							   ths.focuswidget.text=ths.textbox.value;
							   $(ths.textbox).hide();
							   ths.paint({action:"edit text"});
						   }
						   else if(e.keyCode===27){
							   $(ths.textbox).hide();
						   }
						   else{
							   ths.focuswidget.text=ths.textbox.value;
						   }
					   });
			}
		}
	};
	
	
	/** utility **/
	var dataURItoBlob = function(dataURL) {
		var BASE64_MARKER = ';base64,';
		if (dataURL.indexOf(BASE64_MARKER) === -1) {
			var parts = dataURL.split(',');
			var contentType = parts[0].split(':')[1];
			var raw = parts[1];
			return new Blob([ raw ], {
				type : contentType
			});
		}
		var parts = dataURL.split(BASE64_MARKER);
		var contentType = parts[0].split(':')[1];
		var byteString = atob(parts[1]);
		var ab = new ArrayBuffer(byteString.length);
		var ia = new Uint8Array(ab);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}
		return new Blob([ ab ], {
			type : contentType
		});
	};
	
	var blobToBase64Async=function(blob, callback) {
		  var reader = new FileReader();
		  reader.onload = function(e){
		    callback(e.target.result);
		  };
		  reader.readAsDataURL(blob);
	};
	

	math = {
			pi : Math.PI,
			angle : function(num) {
				return Math.PI * (num / 180);
			},
			getRotatePoint:function(rotate,rotatepoint){
				var _pp = this.angle(rotate);
				return {
					x:rotatepoint.offsetx*(1-Math.cos(_pp))+rotatepoint.offsety*Math.sin(_pp),
					y:rotatepoint.offsety*(1-Math.cos(_pp))-rotatepoint.offsetx*Math.sin(_pp)
				};
			},
			checkPointInResizer:function(widget,x,y,scale){
				scale=scale||widget.root.scale;
				var _cc = widget.relativePoint(x,y,scale);
				x=_cc.x;
				y=_cc.y;
				var l=6;
				for(var i=0;i<=widget.resizers.length-1;i++){					
					if(x>(widget.resizers[i].x-l)*scale*widget.scaleX&&x<(widget.resizers[i].x+l)*scale*widget.scaleX&&y>(widget.resizers[i].y-l)*scale*widget.scaleY&&y<(widget.resizers[i].y+l)*scale*widget.scaleY)
						return i+1;
				}
				return 0;
			},
			checkPointInRotateKeyPoint:function(widget,x,y,scale){
				scale=scale||widget.root.scale;
				var _cc = widget.relativePoint(x,y,scale);
				x=_cc.x;
				y=_cc.y;				
				var radius=4;
				if((x-widget.rotateKeyPoint.x*scale*widget.scaleX)*(x-widget.rotateKeyPoint.x*scale*widget.scaleX)+(y-widget.rotateKeyPoint.y*scale*widget.scaleY)*(y-widget.rotateKeyPoint.y*scale*widget.scaleY)<=radius*radius*scale*widget.scaleX*scale*widget.scaleY)
					return true;
				else
					return false;
				
			},
			checkPointInfunctionPoint:function(widget,x,y,scale){
				scale=scale||widget.root.scale;
				var _cc = widget.relativePoint(x,y,scale);
				x=_cc.x;
				y=_cc.y;
				var l=6;
				for(var i=0;i<=widget.functionPoints.length-1;i++){					
					if(widget.functionPoints[i].visible&&x>(widget.functionPoints[i].x-l)*scale*widget.scaleX&&x<(widget.functionPoints[i].x+l)*scale*widget.scaleX&&y>(widget.functionPoints[i].y-l)*scale*widget.scaleY&&y<(widget.functionPoints[i].y+l)*scale*widget.scaleY)
						return i+1;
				}
				return 0;				
			},
			checkPointInconnectionPoint:function(widget,x,y,scale){
				scale=scale||widget.root.scale;
				var _cc = widget.relativePoint(x,y,scale);
				x=_cc.x;
				y=_cc.y;				
				var radius=4;
				for(var i=0;i<=widget.connectionPoints.length-1;i++){					
					if((x-widget.connectionPoints[i].x*scale*widget.scaleX)*(x-widget.connectionPoints[i].x*scale*widget.scaleX)+(y-widget.connectionPoints[i].y*scale*widget.scaleY)*(y-widget.connectionPoints[i].y*scale*widget.scaleY)<=radius*radius*scale*widget.scaleX*scale*widget.scaleY)						
						return i+1;
				}
				return 0;
			},
			checkwidgetInRect:function(widget,rect,scale){
				scale=scale||widget.root.scale;
				var _cc=rect;				
				if ((Math.abs(widget.x*scale+widget.width*scale*widget.scaleX/2-_cc.x-_cc.width/2)<(widget.width*scale*widget.scaleX+_cc.width)/2)&&(Math.abs(widget.y*scale+widget.height*scale*widget.scaleY/2-_cc.y-_cc.height/2)<(widget.height*scale*widget.scaleY+_cc.height)/2))
					return true;
				else 
					return false;
			},
			Multiply:function(px0, py0, px1, py1,px2,py2) {  
			        //return ((px1 - px0) * (py2 - py0) - (px2 - px0) * (py1 - py0));  
			        return ((px1 - px0) * (py1 - py0) - (px2 - px0) * (py2 - py0));
			},  
			isPointOnLine:function(px0, py0, px1,py1,px2,py2){
			        flag = false;  
			        ESP = 50;  
			        if ( ((px0 - px1) * (px0 - px2) <= ESP)  
			                && ((py0 - py1) * (py0 - py2) <= ESP)) {  
			            flag = true;  
			        }  
			        return flag;  
			 }  
		};
	$.register("widget",widget);
})(jQuery);