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
		if(opt&&opt.action){
			console.info(opt.action)
		}
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
(function($){
	var globalWidgetPropertyEditor=new Map();
	$.registerPropertyObject = function(type, _function) {
		if (typeof _function !== "function") {
			alert(type + " is not a sinppet");
			return;
		}
		try {
			globalSnippetPropertyEditor.update(type, _function);
		} catch (ex) {
			alert(ex);
		}
	};
	
	$.propertyObject = function(type, option) {
		if (!globalWidgetPropertyEditor.containsKey(type)) {
			return new propertyObject(option);
		}
		var _propertyObject = globalWidgetPropertyEditor.get(type);
		return new _propertyObject(option);
			
		
	};
	
	propertyObject=function(option){
		var opt= {
			datatype:{
				format:"single",
				title:"Data Type",
				required:false,
				editable:true,
				options:[{id:'String',text:"String"},{id:'Integer',text:"Integer"},{id:'Date',text:"Date"},{id:'Boolean',text:"Boolean"},{id:'Array',text:"Array"},{id:'Object',text:"Object"},{id:'MergedObject',text:"MergedObject"}]
			},
			originedatatype:{
				format:"string",
				title:"DB Datatype",
				required:false,
				editable:false
			},
			mappingtype:{
				format:"single",
				title:"Mapping Type",
				required:false,
				editable:true,
				options:[{id:"MergedObject",text:"Merged Object"},{id:"Object",text:"Sub document"},{id:"Array",text:"Array"}]
			},
			matchcriteria:{
				format:"list",
				title:"Array Match <br>Criteria",
				required:false,
				editable:false
			},
			matchcriteria2:{
				format:"list",
				title:"Join Criteria",
				required:false,
				editable:false
			},
			targetpath:{
				format:"string",
				title:"Target Path",
				required:false,
				editable:false
			},
		}
		$.extend(opt,option);
		return opt;
	}
	
	
     $.drawArrow=function(ctx,sp,ep,type,opt){
          return new drawArrow(ctx,sp,ep,type,opt);
     };
     
     $.drawDiamond=function(ctx,sp,ep,type,opt){
          return new drawDiamond(ctx,sp,ep,type,opt);
     };
     
     $.drawEllipse=function(ctx, x, y, a, b){
          return new drawEllipse(ctx, x, y, a, b);
     };
     
     function drawEllipse(ctx, x, y, a, b)
     {
        var k = .5522848,
        ox = a * k, // 水平控制点偏移量
        oy = b * k; // 垂直控制点偏移量

        ctx.beginPath();
        //从椭圆的左端点开始顺时针绘制四条三次贝塞尔曲线
        ctx.moveTo(x - a, y);
        ctx.bezierCurveTo(x - a, y - oy, x - ox, y - b, x, y - b);
        ctx.bezierCurveTo(x + ox, y - b, x + a, y - oy, x + a, y);
        ctx.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b);
        ctx.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y);
        ctx.closePath();
        ctx.stroke();
     };
     
     endpoint=function(opt){
          this.x=0,
          this.y=0,
          this.position="",
          this.shape={
                    name:"arrow", //none,dot,arrow,diamond,other
                    type:1,
                    size:5,
                    sharp:10,
                    radius:5                    
          },
          this.background={
        	   filltype:"color",
               color:"black"
          },
          this.border={
               width : 1,
               type:"solid", //solid, dotted,dashed
               color : "black"
          },
          $.extend(this,opt);
          this.offsetx=0;
          this.offsety=0;
          this.shape.size=this.shape.size?this.shape.size:5;
          this.shape.sharp=this.shape.sharp?this.shape.sharp:10;
          this.shape.radius=this.shape.radius?this.shape.radius:5;
          if(opt)
               this.widget=opt.widget;
          return this;
     };
     endpoint.prototype.persist=function()
     {
          var r={};
          r.x=this.x;
          r.y=this.y;
          r.position=this.position;
          r.shape={};
          $.extend(r.shape,this.shape);
          r.background={};
          $.extend(r.background,this.background);
          r.border={};
          $.extend(r.border,this.border);
          if(this.widget)
               r.widget=this.widget.persist();     
          return r;
     };
     
     var drawDiamond=function(ctx,sp,ep,type,opt){
    	 if(ep===undefined||sp===undefined)
             return null;
    	 if(ep===undefined||sp===undefined)
	           return null;
    	 
	    var sta = new Array(sp.x,sp.y);
	    var end = new Array(ep.x,ep.y);
	    var sizeW = opt.size?opt.size:5;
	    var sizeH = opt.sharp?opt.sharp:10;
	    var sizeM = opt.radius?opt.radius:5;
	    

	    //算出直线偏离Y的角
	    var ang=(end[0]-sta[0])/(end[1]-sta[1]);
	    ang=Math.atan(ang);

	    ctx.save();
	    //画箭头
	    ctx.beginPath();
	    ctx.translate(end[0],end[1]);

	    if(end[1]-sta[1] >= 0){
	        ctx.rotate(-ang);
	    }else{
	        ctx.rotate(Math.PI-ang);//加个180度，反过来
	    }

	    if(type==1){
	        //棱形透明箭头
	        ctx.moveTo(0,-sizeH*2);
	        ctx.lineTo(-sizeW,-sizeH);
	        ctx.lineTo(0,0);
	        ctx.lineTo(sizeW,-sizeH);
	        ctx.lineTo(0,-sizeH*2);
	        ctx.stroke();
	        ctx.restore();
	        ctx.closePath();
	    }else if(type==2){
	        //棱形实心箭头
	        ctx.moveTo(0,-sizeH*2);
	        ctx.lineTo(-sizeW,-sizeH);
	        ctx.lineTo(0,0);
	        ctx.lineTo(sizeW,-sizeH);
	        ctx.lineTo(0,-sizeH*2);
	        ctx.stroke();
	        ctx.fill(); 
	        ctx.restore();
	        ctx.closePath();
	    }
	    else{
	        //棱形空心箭头
	        ctx.moveTo(0,-sizeH*2);
	        ctx.lineTo(-sizeW,-sizeH);
	        ctx.lineTo(0,0);
	        ctx.lineTo(sizeW,-sizeH);
	        ctx.lineTo(0,-sizeH*2);
	        ctx.stroke();
	        ctx.fillStyle="white";
	        ctx.fill();
	        ctx.restore();
	        ctx.closePath();
	    }
     };
     
     var drawArrow=function(ctx,sp,ep,type,opt){
    	    if(ep===undefined||sp===undefined)
    	           return null;
    	    var sta = new Array(sp.x,sp.y);
    	    var end = new Array(ep.x,ep.y);
    	    var sizeW = opt.size?opt.size:5;
    	    var sizeH = opt.sharp?opt.sharp:10;
    	    var sizeM = opt.radius?opt.radius:5;
    	    

    	    //算出直线偏离Y的角
    	    var ang=(end[0]-sta[0])/(end[1]-sta[1]);
    	    ang=Math.atan(ang);

    	    ctx.save();
    	    //画箭头
    	    ctx.beginPath();
    	    ctx.translate(end[0],end[1]);

    	    if(end[1]-sta[1] >= 0){
    	        ctx.rotate(-ang);
    	    }else{
    	        ctx.rotate(Math.PI-ang);//加个180度，反过来
    	    }

    	    if(type==1){
    	        //三角透明箭头
    	    	ctx.moveTo(-sizeW,-sizeH);
     	        ctx.lineTo(0,0);
     	        ctx.lineTo(sizeW,-sizeH);
     	        ctx.stroke();
     	        ctx.restore();
     	        ctx.closePath();
    	    }
    	    if(type==2){
    	        //三角实心箭头
    			ctx.moveTo(-sizeW,-sizeH);
    	        ctx.lineTo(sizeW,-sizeH);
    	        ctx.lineTo(0,0);
    	        ctx.moveTo(-sizeW,-sizeH);
    	        ctx.stroke();
    	        ctx.fill();
    	        ctx.restore();
    	        ctx.closePath();
    	    }else if(type==3){
    	        //三角白心箭头
    			ctx.moveTo(-sizeW,-sizeH);
    	        ctx.lineTo(sizeW,-sizeH);
    	        ctx.lineTo(0,0);
    	        ctx.lineTo(-sizeW,-sizeH);
    	        ctx.stroke();
    	        ctx.fillStyle="white";
    	        ctx.fill();
    	        ctx.restore();
    	        ctx.closePath();
    	    }else if(type==4){
    	        //箭头 ------->>
    	        ctx.moveTo(-sizeW,-sizeH);
    	        ctx.lineTo(0,-sizeM);
    	        ctx.lineTo(sizeW,-sizeH);
    	        ctx.lineTo(0,0);
    	        ctx.lineTo(-sizeW,-sizeH);
    	        ctx.stroke();
    	        ctx.fill();
    	        ctx.restore();
    	        ctx.closePath();
    	    }else if(type==5){
    	        //三爪箭头
    	        ctx.moveTo(-sizeW,0);
    	        ctx.lineTo(0,-sizeH);
    	        ctx.lineTo(sizeW,0);
    	        ctx.stroke();
    	        ctx.restore();
    	        ctx.closePath();
    	    }else if(type==6){
    	        //五爪箭头
    	        ctx.moveTo(-sizeW,0);
    	        ctx.lineTo(0,-sizeH);
    	        ctx.lineTo(sizeW,0);
    	        ctx.moveTo(-sizeW,-sizeH);
    	        ctx.lineTo(sizeW,-sizeH);
    	        ctx.stroke();
    	        ctx.restore();
    	        ctx.closePath();
    	    }
    	 };
     
         
     //旋转坐标  
     var _scrollXOY=function(p,theta){  
         return {  
             x:p.x*Math.cos(theta)+p.y*Math.sin(theta),  
             y:p.y*Math.cos(theta)-p.x*Math.sin(theta)  
         };  
     };  
     
     label=function(option){
         var opt={
                   name:"label",
                   height:22,
                   margin:10,
                   font:{
                        style:"normal", // normal,italic,
                        weight:"normal",//normal,lighter,bold  
                        family:"Arial",
                        size:"11pt",
                        color:"black",
                        fill:true
                   },
                   minheight:17
         };
         $.extend(opt,option);
         $.extend(this,new widget(opt));
         this.type="label";
         this.propertyEditors=["common","font"];
         this.afterresize=function(ev){
             this.font.size=(this.height-2*this.margin)+"pt";
         };
         this.beforePaint=function(ctx){
       	var margin=this.margin;
       	 if(typeof this.font==="String")
              ctx.font=this.font;
       	 else{
              ctx.font=this.font.style+" "+this.font.weight+" "+this.font.size+" "+this.font.family;
       	 }
       	 var metrics=ctx.measureText(this.text);
            this.width=Math.round(metrics.width+2*margin);
            this.setResizers();
         };
         return this;
    }; 
         
     actionWidget=function(option){
    	 var opt={
    	    		name:"actionWidget",
    	    		hyperlink :{
                        window:"",
                        url:"",
                        command:"",
                        type:"url", //url,command,window
                        target:"_blank",
                   },
                   shadow:{
                       	color : "black",
               			offsetX : 4,
               			offsetY : 4,
               			blur : 4
                       },
    	    	};
    	 $.extend(opt,option);
    	 $.extend(this,new widget(opt));
         this.type="actionWidget"; 
         this.click=function(e){
        	 if(!this.editable&&this.hyperlink){
	        	 if(this.hyperlink.type==="url"&&this.hyperlink.url!="")
	                 window.open(this.hyperlink.url,this.hyperlink.target);
	        	 else if(this.hyperlink.type==="window"&&this.hyperlink.window!=""){
	        		 if($.fn.fullpage!=null&&$.fn.fullpage.moveTo&&this.hyperlink.index){
		        		 $.fn.fullpage.moveTo(this.hyperlink.index, 0);
		        	 }
	        		 else if(this.presenters[0])
	        			 this.presenters[0].designer.setActive(parseInt(this.hyperlink.window));	        			 
	        		 else            		 
	        			 this.root.presenters[0].designer.setActive(parseInt(this.hyperlink.window));
	        	 }
        	 }      
	         if(option.click)
	               option.click.call(this,e);
	         this.paint();
         };
         this.tap=function(e){
        	 this.click.call(this,e.originalEvent);
         };
     }; 
     
     link=function(option){
         var opt={
                   name:"link",
                   text:"link",
                   font:{
                        style:"normal",
                        weight:"normal",
                        family:"Arial",
                        size:"10pt",
                        color:"blue",
                        fill:true
                   }, 
                   shadow:null,
                   height:24,
                   minheight:17
         };
         $.extend(opt,option);
         $.extend(this,new actionWidget(opt));
         this.propertyEditors=["common","font","hyperlink"];
         this.afterresize=function(ev){
             this.font.size=(this.height-2*this.margin)+"pt";
        };
        this.beforePaint=function(ctx){
        var margin=this.margin;
      	 if(typeof this.font==="String")
             ctx.font=this.font;
      	 else{
             ctx.font=this.font.style+" "+this.font.weight+" "+this.font.size+" "+this.font.family;
      	 }
      	 var metrics=ctx.measureText(this.text);
           this.width=Math.round(metrics.width+2*margin);
           this.setResizers();
        };
        this.font.color="blue";
        this.type="link";          
        return this;
    };  
     
     note=function(option){
         var opt={
                   name:"note",
                   text:"note",
                   width:160,
                   height:140,
                   corner:{
                        type:"round", //round,rect
                        radius:16
                   },
                   background:{
                   	 filltype:"color",
                        image:"",
                        imageType:"fill",
                        color:"yellow"
                   },
                   font:{
                        style:"normal",
                        weight:"normal",
                        family:"Arial",
                        size:"10pt",
                        color:"blue",
                        fill:true
                   },
                   paragraph:{
                        linespace:10,
                        textalign:"center", //left,center,right
                        textvalign:"middle" //top,middle,bottom
                        
                   },
                   autosize:false,
         };
         $.extend(opt,option);
         $.extend(this,new actionWidget(opt));
         this.type="note";
         this.persist=function(){
              var r=widget.persistproperty(this);
              if(this.paragraph){
                   r.paragraph={};
                   $.extend(r.paragraph,this.paragraph);
              }
              return r;
         };
         
         this.calculateSize=function(ctx){
       	  if(this.text){
                 ctx.save();
                 if(typeof this.font==="String")
                      ctx.font=this.font;
                 else{
                      ctx.font=this.font.style+" "+this.font.weight+" "+this.font.size+" "+this.font.family;
                 }
                 var ths=this;
                 var lines=this.text.split("\n");
                 var formatlines=[];
                 this.paragraph.linespace=parseInt(this.paragraph.linespace);
                 $(lines).each(function(index,line){
                      var words=line.split(/[\s]/);
                      var line1="";
                      while(words.length>0){
                           var word=words.shift();
                           if(ctx.measureText(line1+" "+word).width>ths.width-2*ths.margin){
                                //ctx.fillText(line1,x,y,ths.width-2*ths.margin);
                                if(line1!="")
                                  formatlines.push(line1);
                                if(ctx.measureText(word).width>ths.width-2*ths.margin)
                                {
                                     line1="";
                                     for(var i=0;i<word.length;i++){
                                          var a=word.substring(i,i+1);
                                          if(ctx.measureText(line1+a).width>ths.width-2*ths.margin)
                                          {
                                               formatlines.push(line1);
                                               line1=a;
                                          }
                                          else
                                               line1=line1+a;
                                     }                                   
                                }
                                else
                                     line1=word;
                           }
                           else
                                line1=line1?line1+" "+word:word;
                      }
                      if(line1!=""){
                           formatlines.push(line1);
                      }
                 });
                 this.minheight=this.fontSize()*formatlines.length+this.paragraph.linespace*(formatlines.length-1)+2*this.margin;
                 if(this.height<this.minheight)
                      this.height=this.minheight;
                 ctx.restore();
                 this.formatlines=formatlines;
            }
       	 return this;
         };
         this.drawTextTo=function(ctx){
              if(this.text){
                   ctx.save();
                   if(typeof this.font==="String")
                        ctx.font=this.font;
                   else{
                        ctx.font=this.font.style+" "+this.font.weight+" "+this.font.size+" "+this.font.family;
                   }
                   ctx.StrokeStyle=this.font.color||"black";
                   ctx.fillStyle=this.font.color||"black";
                   
                   var x=this.margin;
                   var y=this.margin+this.fontSize();
                   ctx.textAlign="start";
                   if(this.paragraph.textalign==="center"){
                        x=this.width/2;
                        ctx.textAlign="center";
                   }
                   else if(this.paragraph.textalign==="right"){
                        x=this.width-this.margin;
                        ctx.textAlign="end";
                   }
                   ctx.textBaseline=this.textBaseline||"alphabetic";
                   var ths=this;
                   this.paragraph.linespace=parseInt(this.paragraph.linespace);
                   if(this.paragraph.textvalign==="middle"){
                        y=(this.height-this.minheight)/2+y;
                   }
                   else if(this.paragraph.textvalign==="bottom"){
                        y=(this.height-this.minheight)+y;
                   }
                   $(this.formatlines).each(function(index,line){
                        if(ths.font.fill)
                             ctx.fillText(line,x,y,ths.width-2*ths.margin);
                        else
                             ctx.strokeText(line,x,y,ths.width-2*ths.margin);
                        y=y+ths.fontSize()+ths.paragraph.linespace;
                   });
                   ctx.restore();
              }
         };
         return this;
     };  
     
     noticeboard=function(option){
      	var opt={
      	   name:"noticeboard",
      	   tooltip:null,
      	   shadow:{
      		 color : "none",
 			 offsetX : 4,
 			 offsetY : 4,
 			 blur : 4
      	   },
      	   background:{
      		 color:"none",
      		 filltype:"color",
      		 image : null,
 			 imageType : "center"// repeat center fit fill
      	   },
      	   corner:{
      		 type:"rect",
      		 radius:16
      	   },
      	   border:{
      	     width : 1,
      	     type:"dashed", //solid, dotted,dashed
      		 color : "black"
      	   },
           hint:{
        	 show:true,  
          	 hasmask:true,
          	 maskcolor:"#cecccd",
          	 maskalpha:0.5,
           }
      	}; 
      	$.extend(opt,option);
        $.extend(this,new note(opt));
        this.type="noticeboard";         
        if(this.functionPoints.length===0)
         	this.functionPoints=[
          	                     {x:this.width*3/4,y:0,cursor:"pointer",visible:true},
          	                    ];  
        
        if(this.tooltip==null){
  			 this.tooltip=$.widgets("tooltip",{
  				 editable:this.editable,
  				 height:50,
  				 width:250,
  				 text:"",
  				 tail:{
  					position:"left", //top,bottom,left,right
                    margin:16,
                    size:20
  				 },
  				 name:this.name+"_tooltip"  				 
  			 });
  		}   
        else{
         	this.tooltip=new tooltip(this.tooltip);
         	this.tooltip.name=this.name+"_tooltip";
        }
          
        this.beforePaint=function(ctx){
        	if(this.tooltip.x==0&&this.tooltip.y==0){
        		 this.tooltip.x=this.x+this.width+10,
  				 this.tooltip.y=this.y-60;
        	}
        	this.tooltip.functionPoints[1].visible=false;
          	var point0=this.functionPoints[0];
             var relpoint0=this.tooltip.relativePoint(this.x+point0.x,this.y+point0.y,1);
             this.tooltip.functionPoints[1].x=relpoint0.x;
        	 this.tooltip.functionPoints[1].y=relpoint0.y;
             if(this.editable&&this.presenters[0]&&!this.presenters[0].Widget(this.tooltip)&&this.hint.show){
            	 this.tooltip.editable=true;
               	 this.presenters[0].appendWidget(this.tooltip);
             }
        };
       
        this.mouseup=function(e){
        	  if(e.offsetX){
	        	this.tooltip.x+=e.offsetX/this.scale;
	        	this.tooltip.y+=e.offsetY/this.scale;
        	  }
        };
          
        this.mousemove=function(e){
//          	console.info(this.name+" mousemove at x="+e.x+",y="+e.y+"/x="+e.desktopX+",y="+e.desktopY);
         	if(this.tooltip.text!="" &&!this.editable){
         		var ths=this;
 	     		var relativePoint=this.tooltip.relativePoint(ths.x+ths.functionPoints[0].x,ths.y+ths.functionPoints[0].y);
 	     		this.tooltip.functionPoints[1].x=relativePoint.x;
 	 			this.tooltip.functionPoints[1].y=relativePoint.y;
 	    		ths.paint();
 	    		if(ths.hint.hasmask){
 	        		 ths.paintMask(ths.parent);
 	        		 ths.paintTo(ths.parent.canvas);
 	    		}
 	    		 this.tooltip.paintTo(ths.parent.canvas);
          	}
          };      
          
        this.persist=function(){
        	  if(this.presenters[0]&&this.presenters[0].Widget(this.tooltip))
        	     this.presenters[0].removeWidget(this.tooltip);
        	  else if(this.parent&&this.parent.Widget(this.tooltip))
             	     this.parent.removeWidget(this.tooltip);
              var r=widget.persistproperty(this);
              if(this.paragraph)
              {
            	  r.paragraph={};
            	  $.extend(r.paragraph,this.paragraph);
              }
              if(this.hint){            	 
            	  r.tooltip=this.tooltip.persist();
                  r.hint={};
                  $.extend(r.hint,this.hint);
             }
              return r;
          };
         
     	this.paintMask=function(panel){
     		   if(this.hint.hasmask){
  				var ctx=panel.ctx;
  				var root=panel;
  				ctx.save();
  				ctx.fillStyle =this.hint.maskcolor;
  				ctx.globalAlpha=this.hint.maskalpha;
  				ctx.fillRect(root.x,root.y,root.width,root.height);
  				ctx.restore();
     		   }
     	   };
       }; 
     
     
     
     checkbox=function(option){
          var opt={
                    name:"checkBox",
                    checked:true,
                    size:15,
                    text:"checkBox",
                    autosize:true                    
          };
          $.extend(opt,option);          
          $.extend(this,new widget(opt));
          this.propertyEditors=["common"];
          this.allowRotate=false;
          this.click=function(e){        	  
        	  var ths=this;
               this.checked=!this.checked;
               if(option.click)
                    option.click.call(this,e);
               if(this.presenters.length>0)
            	   ths.paint();
               else
            	   this.root.paint();
          };
          this.type="checkbox";
          this.persist=function(){
               var r=widget.persistproperty(this);
               r.checked=this.checked;
               return r;
          };
          this.drawBorderTo = function(ctx){
               var margin=this.margin;
               ctx.strokeStyle="black";
               ctx.lineWidth=1;
               ctx.beginPath();
               var side=this.size;
               ctx.strokeRect(margin,margin,side,side);
               if(this.checked){
                    ctx.moveTo(0+margin,side/2+margin);
                    ctx.lineTo(side/2+margin,side+margin);
                    ctx.lineTo(side+margin,0+margin);
                    ctx.stroke();
               }
               return this;
          };
          this.drawTextTo=function(ctx){
               var _widget=this;
               var margin=this.margin;
               var length=16;
               var autosize=_widget.autosize||false;          
               if(_widget.text){
                    if(typeof _widget.font==="String")
                         ctx.font=_widget.font;
                    else{
                         var font=_widget.font.style+" "+_widget.font.weight+" "+_widget.font.size+" "+_widget.font.family;
                         ctx.font=font;
                    }
                    ctx.fillStyle=_widget.font.color||"black";
                    ctx.strokeStyle=_widget.font.color||"black";
                    aWidth=ctx.measureText("A");
                    metrics=ctx.measureText(_widget.text);     
                    if(autosize){
                         _widget.width=Math.round(metrics.width+length+length/2+2*margin);
                         _widget.height=Math.round(length+2*margin);
                         this.setConnectionPoints();
                    }
                    if(_widget.font.fill)
                         ctx.fillText(_widget.text,length+length/2+margin,(length+aWidth.width)/2+margin);
                    else
                         ctx.strokeText(_widget.text,length+length/2+margin,(length+aWidth.width)/2+margin);
               }
          };
          return this;
     };
     
     radio=function(option){
          var opt={
                    name:"radio",
                    text:"radio",
                    radius:15,
                    autosize:true,
                    allowRotate:false
          };
          $.extend(opt,option);          
          $.extend(this,new checkbox(opt));
          this.type="radio";
          this.drawBorderTo = function(ctx){
               ctx.beginPath();
               ctx.strokeStyle="black";
               ctx.lineWidth=1;
               var radius=this.radius;
               ctx.arc(radius/2+this.margin,radius/2+this.margin,radius/2,0,2*Math.PI,true);
               ctx.closePath();
               ctx.stroke();
               if(this.checked){
                    ctx.save();
                    ctx.fillStyle="black";
                    ctx.beginPath();
                    ctx.arc(radius/2+this.margin,radius/2+this.margin,radius/2-3,0,2*Math.PI,true);
                    ctx.stroke();                    
                    ctx.fill();
                    ctx.restore();
               }
               return this;
          };
          return this;
     };
     
     box=function(option){
          var opt={
                    border:{
                         width:1,
                         type:"solid",
                         color:"black"
                    },
                    corner:{
                         type:"round", //round,rect
                         radius:16
                    },
                    background:{
                    	 filltype:"none",
                         color:"white",
                         image:"",
                         imageType:"fill"                         
                    },
                    paragraph:{
                         linespace:10,
                         textalign:"center", //left,center,right
                         textvalign:"top" //top,middle,bottom
                    },
                    width:145,
                    height:125 ,  
                    afterresize:function(ev){
                       if(ev.resizer==4){
                    	   this.functionPoints[0].x+=ev.offset.x/2;
                    	   this.functionPoints[0].y+=ev.offset.y;
                       }
                       else if(ev.resizer==1){
                    	   this.functionPoints[0].x-=ev.offset.x/2;
                    	   this.functionPoints[0].y-=ev.offset.y;
                       }
                       else if(ev.resizer==2){
                    	   this.functionPoints[0].x+=ev.offset.x/2;
                    	   this.functionPoints[0].y-=ev.offset.y;
                       }
                       else if(ev.resizer==3){
                    	   this.functionPoints[0].x-=ev.offset.x/2;
                    	   this.functionPoints[0].y+=ev.offset.y;
                       }
                   }
                                   
          };
          $.extend(opt,option);
          $.extend(this,new actionWidget(opt));
          this.propertyEditors=["common","border","corner","font","background","hyperlink"];
          if(this.functionPoints.length===0)
        	  this.functionPoints=[
                              {x:this.width/2,y:this.height+12,cursor:"pointer",visible:true}
                             ];
	      this.calculateSize=function(ctx){
	    	  //do nothing
	      };
          this.drawTextTo=function(ctx){
               if(this.text){
                    ctx.save();
                    if(typeof this.font==="String")
                         ctx.font=this.font;
                    else{
                         ctx.font=this.font.style+" "+this.font.weight+" "+this.font.size+" "+this.font.family;
                    }
                    ctx.StrokeStyle=this.font.color||"black";
                    ctx.fillStyle=this.font.color||"black";
                    
                    var x=this.margin;
                    var y=this.height+this.fontSize()+this.margin;
                    ctx.textAlign="start";
                    if(this.paragraph.textalign==="center"){
                         x=this.width/2;
                         ctx.textAlign="center";
                    }
                    else if(this.paragraph.textalign==="right"){
                         x=this.width-this.margin;
                         ctx.textAlign="end";
                    }
                    x=this.functionPoints[0].x;
                    y=this.functionPoints[0].y+18;
                    this.functionPoints[0].visible=true;
                    ctx.textBaseline=this.textBaseline||"alphabetic";
                    var ths=this;
                    var formatlines=this.text.split("\n");                
                    $(formatlines).each(function(index,line){
                         if(ths.font.fill)
                              ctx.fillText(line,x,y);
                         else
                              ctx.strokeText(line,x,y);
                         y=y+ths.fontSize()+ths.paragraph.linespace;
                    });
                    ctx.restore();
               }
               else{
            	   this.functionPoints[0].visible=false;
               }
          };
          this.type="box";
          return this;
     };  
     
     line=function(option){
          var opt={
                    name:"line",
                    width:250,
                    height:140,
                    border:{
                         width:1,
                         type:"solid",
                         color:"black"
                    },
                    margin:2,
                    linecap:"round",//butt,square
                    minheight:0,
                    minwidth:0,
          };
          $.extend(opt,option);          
          $.extend(this,new widget(opt));
          this.allowconnectionPoint=false;
          this.begin=new endpoint(option.begin);
          this.end=new endpoint(option.end);
          this.type="line";
          this.direction=option.direction?option.direction:1;
          this.persist=function(){
               var r=widget.persistproperty(this);
               r.direction=this.direction;
               r.begin=this.begin.persist();
               r.end=this.end.persist();               
               return r;
          };
          
          this.checkPointIn =function(x, y,scale) {
      		if(this.root!=null)
      			scale=scale||this.root.scale;
      		if(!scale)
      			scale=1;
      		var _xc = this.relativePoint(x, y,scale);
      		var x2 = _xc.x;
      		var y2 = _xc.y;
      		var result=math.isPointOnLine(x2,y2,this.begin.x*scale,this.begin.y*scale,this.end.x*scale,this.end.y*scale);
      		return result;
          };
          
          this.paintTo=function(canvas){
               var ctx=canvas.getContext("2d");
               ctx.save();
               ctx.scale(this.scaleX,this.scaleY);
               if(canvas!=this.canvas)
                    ctx.translate(this.x, this.y);
               ctx.rotate(this.rotate / 180 * Math.PI);
               ctx.globalAlpha = this.alpha;
               this.drawImageTo(ctx);  
               if(this.editable){
	               if(this.focus&&canvas!=this.canvas){
//	                    this.drawSelectRect(ctx);
	                    if(this.editable&&!this.autosize)
	                      this.drawResizerTo(ctx);
	               }
//	               else if(this.inselect&&canvas!=this.canvas){
//	                    this.drawSelectRect(ctx);
//	               }
               }
               ctx.restore();
          };
          this.drawImageTo = function(ctx){
               ctx.beginPath(); 
               ctx.strokeStyle=this.border.color;
               ctx.lineWidth=this.border.width;
               ctx.lineCap=this.linecap;
               ctx.fillStyle=this.border.color;
               if(this.border.type!="solid"&&ctx.setLineDash){
                    var dashList =this.border.type==="dashed"?[this.border.width+5, this.border.width+2]:[this.border.width+2,this.border.width+2]; 
                    ctx.setLineDash(dashList);
               }
               var sp=0,ep=0;
               if(!this.direction||this.direction===1){
                    ctx.moveTo(this.margin,this.margin);
                    ctx.lineTo(this.width,this.height);
                    sp={x:this.margin,y:this.margin};
                    ep={x:this.width,y:this.height};
                    this.resizers[1].visible=false;
                    this.resizers[2].visible=false;
               }
               else if(this.direction===2){
                    ctx.moveTo(this.width,this.margin);
                    ctx.lineTo(this.margin,this.height);
                    sp={x:this.width,y:this.margin};
                    ep={x:this.margin,y:this.height};
                    this.resizers[0].visible=false;
                    this.resizers[3].visible=false;
               }
               else if(this.direction===3){
                    ctx.moveTo(this.width,this.height);
                    ctx.lineTo(this.margin,this.margin);
                    sp={x:this.width,y:this.height};
                    ep={x:this.margin,y:this.margin};
                    this.resizers[1].visible=false;
                    this.resizers[2].visible=false;
               }
               else if(this.direction===4){
                    ctx.moveTo(this.margin,this.height);
                    ctx.lineTo(this.width,this.margin);
                    sp={x:this.margin,y:this.height};
                    ep={x:this.width,y:this.margin};
                    this.resizers[0].visible=false;
                    this.resizers[3].visible=false;
               }
               this.begin.x=sp.x;
               this.begin.y=sp.y;
               this.end.x=ep.x;
               this.end.y=ep.y;
               ctx.stroke();          
               if(this.begin.shape.name==="arrow"&&ep&&sp)
                   $.drawArrow(ctx,ep,sp,this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});
               else if(this.begin.shape.name==="diamond"){
   				   $.drawDiamond(ctx,ep,sp,this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});				
   			   }
               else if(this.begin.shape.name==="dot")
               {
                    ctx.beginPath();
                    ctx.arc(sp.x,sp.y,this.begin.shape.radius,0,2*Math.PI);
                    ctx.stroke();
                    if(this.begin.shape.type===2)
                      ctx.fill();
                    else if(this.begin.shape.type===3){
                         ctx.fillStyle="white";
                         ctx.fill();
                    }
               }
               ctx.fillStyle=this.border.color;
               if(this.end.shape.name==="arrow"&&sp&&ep)
                   $.drawArrow(ctx,sp,ep,this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
               else if(this.end.shape.name==="diamond"){
      				$.drawDiamond(ctx,sp,ep,this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});				
      			  }
               else if(this.end.shape.name==="dot")
               {
                    ctx.beginPath();
                    ctx.arc(ep.x,ep.y,this.end.shape.radius,0,2*Math.PI);
                    ctx.stroke();
                    if(this.end.shape.type===2)
                      ctx.fill();
                    else if(this.end.shape.type===3){
                         ctx.fillStyle="white";
                         ctx.fill();
                    }
               }
               return this;
          };
          return this;
     };
     
     circle=function(option){
          var opt={
                    name:"circle",
                    width:150,
                    height:150,
                    border:{
                         width:1,
                         type:"solid",
                         color:"black"
                    },  
                    background:{
                     	filltype:"none",
                     	color:"white"
                     },
                    corner:null,
                    margin:2,                    
                    minheight:15,
                    minwidth:15,
                    autosize:false
          };
          $.extend(opt,option);     
          if(option.focus)
       	   opt.text="";
          $.extend(this,new note(opt));
          this.propertyEditors=["common","border","font","background","hyperlink"];
          this.type="circle";
          this.drawBorderTo = function(ctx){
        	   ctx.save();
               ctx.beginPath(); 
               ctx.strokeStyle=this.border.color;
               ctx.lineWidth=this.border.width;
               if(this.border.type!="solid"&&ctx.setLineDash){
                    var dashList =this.border.type==="dashed"?[this.border.width+5, this.border.width+2]:[this.border.width+2,this.border.width+2]; 
                    ctx.setLineDash(dashList);
               }
               var x=this.width/2;
               var y=this.height/2;
               var a=(this.width-2*this.margin)/2;
               var b=(this.height-2*this.margin)/2;
               drawEllipse(ctx,x,y,a,b);
               this.fillBackgroundTo(ctx,2);
               ctx.clip();	
               this.fillBackgroundTo(ctx);
   			   this.drawImageTo(ctx);
   			   ctx.restore();
               return this;
          };
          return this;
     };
     
     quadraticCurve=function(option){
          var opt={
                    name:"quadraticCurve",
                    width:250,
                    height:140,
                    margin:2,                    
                    linecap:"round",//butt,square
                    minheight:0,
                    minwidth:0,
                    border:{
                        width:1,
                        type:"solid",
                        color:"black"
                   },
          };
          $.extend(opt,option);          
          $.extend(this,new widget(opt));
          this.allowconnectionPoint=false;
          this.begin=new endpoint(option.begin);
          this.end=new endpoint(option.end);
          this.type="curve";
          this.persist=function(){
               var r=widget.persistproperty(this);
               if(this.resizers){
                    r.resizers=[];
                    $.extend(true,r.resizers,this.resizers);
               }
               r.begin=this.begin.persist();
               r.end=this.end.persist();
               return r;
          };
          var startpoint={
                    x:this.margin,
                    y:this.margin,
                    cursor:"nw-resize",
                    visible:true
          },
          endPoint={
                    x:this.width,
                    y:this.height,
                    cursor:"nw-resize",
                    visible:true
          },
          controlpoint={
                    x:this.margin,
                    y:this.height,
                    cursor:"ne-resize",
                    visible:true
          };     
          this.paintTo=function(canvas){
               var ctx=canvas.getContext("2d");
               ctx.save();
               ctx.scale(this.scaleX,this.scaleY);
               if(canvas!=this.canvas)
                    ctx.translate(this.x, this.y);
               ctx.rotate(this.rotate / 180 * Math.PI);
               ctx.globalAlpha = this.alpha;
               this.setResizers();
               this.drawImageTo(ctx);       
               if(this.focus&&canvas!=this.canvas&&this.editable){
                      this.drawResizerTo(ctx);
                  	  this.drawSelectRect(ctx);
               }
               else if(this.inselect&&canvas!=this.canvas){
                    this.drawSelectRect(ctx);
               }
               ctx.restore();
          };
          this.setResizers=function(){     
               if(option.resizers)
                    this.resizers=option.resizers;
               else 
                   this.resizers=[startpoint,controlpoint,endPoint];
          };          
          this.resize=function(e){
               var offsetX=e.offset.x;
               var offsetY=e.offset.y;
               var resizer=e.resizer-1;
               if(resizer>=0){
                    this.resizers[resizer].x+=offsetX;
                    this.resizers[resizer].y+=offsetY;
                    if(this.resizers[resizer].x<0){
                         this.x+=offsetX;
                         this.resizers[0].x-=offsetX;
                         this.resizers[1].x-=offsetX;
                         this.resizers[2].x-=offsetX;
                    }
                    else{
                         var minX=Math.min(this.resizers[0].x,this.resizers[1].x,this.resizers[2].x);
                         if(minX>0){
                              this.x+=minX;
                              this.resizers[0].x-=minX;
                              this.resizers[1].x-=minX;
                              this.resizers[2].x-=minX;
                         }
                    }
                    
                    if(this.resizers[resizer].y<0){
                         this.y+=offsetY;
                         this.resizers[0].y-=offsetY;
                         this.resizers[1].y-=offsetY;
                         this.resizers[2].y-=offsetY;
                    }
                    else{
                         var minY=Math.min(this.resizers[0].y,this.resizers[1].y,this.resizers[2].y);
                         if(minY>0){
                              this.y+=minY;
                              this.resizers[0].y-=minY;
                              this.resizers[1].y-=minY;
                              this.resizers[2].y-=minY;
                         }
                    }
                    var minX=Math.min(this.resizers[0].x,this.resizers[1].x,this.resizers[2].x);
                    var minY=Math.min(this.resizers[0].y,this.resizers[1].y,this.resizers[2].y);
                    var maxX=Math.max(this.resizers[0].x,this.resizers[1].x,this.resizers[2].x);
                    var maxY=Math.max(this.resizers[0].y,this.resizers[1].y,this.resizers[2].y);
                    this.height=maxY-minY;
                    this.width=maxX-minX;
               }
          };
          this.drawImageTo = function(ctx){
               ctx.beginPath();
               ctx.strokeStyle=this.border.color;
               ctx.lineWidth=this.border.width;
               ctx.lineCap=this.linecap;
               ctx.fillStyle=this.border.color;
               if(this.border.type!="solid"&&ctx.setLineDash){
                    var dashList =this.border.type==="dashed"?[this.border.width+5, this.border.width+2]:[this.border.width+2,this.border.width+2]; 
                    ctx.setLineDash(dashList);
               }
               ctx.moveTo(this.resizers[0].x,this.resizers[0].y);
               ctx.quadraticCurveTo(this.resizers[1].x,this.resizers[1].y,this.resizers[2].x,this.resizers[2].y);
               ctx.stroke();     
               if(this.begin.shape.name==="arrow")
                   $.drawArrow(ctx,this.resizers[1],this.resizers[0],this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});
               else if(this.begin.shape.name==="diamond"){
   				   $.drawDiamond(ctx,this.resizers[1],this.resizers[0],this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});				
   			   }
               else if(this.begin.shape.name==="dot")
               {
                    ctx.beginPath();
                    ctx.arc(this.resizers[0].x,this.resizers[0].y,this.begin.shape.radius,0,2*Math.PI);
                    ctx.stroke();
                    if(this.begin.shape.type===2)
                      ctx.fill();
                    else if(this.begin.shape.type===3){
                         ctx.fillStyle="white";
                         ctx.fill();
                    }
               }
               
               ctx.fillStyle=this.border.color;             
               if(this.end.shape.name==="arrow")
                   $.drawArrow(ctx,this.resizers[1],this.resizers[2],this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
               else if(this.end.shape.name==="diamond"){
   				   $.drawDiamond(ctx,this.resizers[1],this.resizers[2],this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});				
   			   }
               else if(this.end.shape.name==="dot")
               {
                    ctx.beginPath();
                    ctx.arc(this.resizers[2].x,this.resizers[2].y,this.end.shape.radius,0,2*Math.PI);
                    ctx.stroke();
                    if(this.end.shape.type===2)
                      ctx.fill();
                    else if(this.end.shape.type===3){
                         ctx.fillStyle="white";
                         ctx.fill();
                    }
               }
               return this;
          };
          return this;
     };
     
     bezierCurve=function(option){
          var opt={
                    name:"bezierCurve",
                    width:250,
                    height:140,
                    margin:2,                    
                    linecap:"round",//butt,square
                    minheight:20,
                    minwidth:30,
                    border:{
                        width:1,
                        type:"solid",
                        color:"black"
                   }
          };
          $.extend(opt,option);          
          $.extend(this,new widget(opt));
          this.allowconnectionPoint=false;
          this.begin=new endpoint(option.begin);
          this.end=new endpoint(option.end);
          this.type="bezierCurve";
          this.allowRotate=false;
          this.text="";
          this.persist=function(){
               var r=widget.persistproperty(this);
               if(this.resizers){
                    r.resizers=[];
                    $.extend(true,r.resizers,this.resizers);
               }
               r.begin=this.begin.persist();
               r.end=this.end.persist();
               return r;
          };
          var startpoint={
                    x:this.margin,
                    y:this.margin,
                    cursor:"nw-resize",
                    visible:true
          },
          endPoint={
                    x:this.width,
                    y:this.height,
                    cursor:"nw-resize",
                    visible:true
          },
          controlpoint1={
                    x:this.margin,
                    y:this.height,
                    cursor:"ne-resize",
                    visible:true
          };
          controlpoint2={
                    x:this.width,
                    y:this.margin,
                    cursor:"ne-resize",
                    visible:true
          };     
          this.paintTo=function(canvas){
               var ctx=canvas.getContext("2d");
               ctx.save();
               ctx.scale(this.scaleX,this.scaleY);
               if(canvas!=this.canvas)
                    ctx.translate(this.x, this.y);
               ctx.rotate(this.rotate / 180 * Math.PI);
               ctx.globalAlpha = this.alpha;
               this.setResizers();
               this.drawImageTo(ctx);          
               if(this.focus&&canvas!=this.canvas&&this.editable){
                    this.drawResizerTo(ctx);
                    this.drawSelectRect(ctx);
               }
               else if(this.inselect&&canvas!=this.canvas){
                    this.drawSelectRect(ctx);
               }
               ctx.restore();
          };
          this.setResizers=function(){     
               if(option.resizers)
                    this.resizers=option.resizers;
               else 
                   this.resizers=[startpoint,controlpoint1,controlpoint2,endPoint];
          };          
          this.resize=function(e){
               var offsetX=e.offset.x;
               var offsetY=e.offset.y;
               var resizer=e.resizer-1;
               if(resizer>=0){
                    this.resizers[resizer].x+=offsetX;
                    this.resizers[resizer].y+=offsetY;
                    if(this.resizers[resizer].x<0){
                         this.x+=offsetX;
                         this.resizers[0].x-=offsetX;
                         this.resizers[1].x-=offsetX;
                         this.resizers[2].x-=offsetX;
                         this.resizers[3].x-=offsetX;
                    }
                    else{
                         var minX=Math.min(this.resizers[0].x,this.resizers[1].x,this.resizers[2].x);
                         if(minX>0){
                              this.x+=minX;
                              this.resizers[0].x-=minX;
                              this.resizers[1].x-=minX;
                              this.resizers[2].x-=minX;
                              this.resizers[3].x-=minX;
                         }
                    }
                    
                    if(this.resizers[resizer].y<0){
                         this.y+=offsetY;
                         this.resizers[0].y-=offsetY;
                         this.resizers[1].y-=offsetY;
                         this.resizers[2].y-=offsetY;
                         this.resizers[3].y-=offsetY;
                    }
                    else{
                         var minY=Math.min(this.resizers[0].y,this.resizers[1].y,this.resizers[2].y);
                         if(minY>0){
                              this.y+=minY;
                              this.resizers[0].y-=minY;
                              this.resizers[1].y-=minY;
                              this.resizers[2].y-=minY;
                              this.resizers[3].y-=minY;
                         }
                    }
                    var minX=Math.min(this.resizers[0].x,this.resizers[1].x,this.resizers[2].x,this.resizers[3].x);
                    var minY=Math.min(this.resizers[0].y,this.resizers[1].y,this.resizers[2].y,this.resizers[3].y);
                    var maxX=Math.max(this.resizers[0].x,this.resizers[1].x,this.resizers[2].x,this.resizers[3].x);
                    var maxY=Math.max(this.resizers[0].y,this.resizers[1].y,this.resizers[2].y,this.resizers[3].y);
                    this.height=maxY-minY;
                    this.width=maxX-minX;
               }
          };
          this.drawImageTo = function(ctx){
               ctx.beginPath();
               ctx.strokeStyle=this.border.color;
               ctx.lineWidth=this.border.width;
               ctx.lineCap=this.linecap;
               ctx.fillStyle=this.border.color;
               if(this.border.type!="solid"&&ctx.setLineDash){
                    var dashList =this.border.type==="dashed"?[this.border.width+5, this.border.width+2]:[this.border.width+2,this.border.width+2]; 
                    ctx.setLineDash(dashList);
               }
               ctx.moveTo(this.resizers[0].x,this.resizers[0].y);
               ctx.bezierCurveTo(this.resizers[1].x,this.resizers[1].y,this.resizers[2].x,this.resizers[2].y,this.resizers[3].x,this.resizers[3].y);
               ctx.stroke();     
               
               if(this.begin.shape.name==="arrow")
                   $.drawArrow(ctx,this.resizers[1],this.resizers[0],this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});
               else if(this.begin.shape.name==="diamond"){
   				   $.drawDiamond(ctx,this.resizers[1],this.resizers[0],this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});				
   			   }
               else if(this.begin.shape.name==="dot")
               {
                    ctx.beginPath();
                    ctx.arc(this.resizers[0].x,this.resizers[0].y,this.begin.shape.radius,0,2*Math.PI);
                    ctx.stroke();
                    if(this.begin.shape.type===2)
                      ctx.fill();
                    else if(this.begin.shape.type===3){
                         ctx.fillStyle="white";
                         ctx.fill();
                    }
               }
             
               ctx.fillStyle=this.border.color;
               if(this.end.shape.name==="arrow")
                   $.drawArrow(ctx,this.resizers[2],this.resizers[3],this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
               else if(this.begin.shape.name==="diamond"){
   				   $.drawDiamond(ctx,this.resizers[2],this.resizers[3],this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});				
   			   }
               else if(this.end.shape.name==="dot")
               {
                    ctx.beginPath();
                    ctx.arc(this.resizers[3].x,this.resizers[3].y,this.end.shape.radius,0,2*Math.PI);
                    ctx.stroke();
                    if(this.end.shape.type===2)
                      ctx.fill();
                    else if(this.end.shape.type===3){
                         ctx.fillStyle="white";
                         ctx.fill();
                    }
               }
               return this;
          };
          return this;
     };
     
     
     
     
     
     
     
     tooltip=function(option){
         var opt={
                   name:"tooltip",
                   text:"tooltip",
                   height:140,
                   width:280,
                   corner:{
                        type:"round", //round,rect
                        radius:8
                   },
                   background:{
                   	 filltype:"color",
                        image:"",
                        imageType:"fill",
                        color:"white"
                   },
                   font:{
                        style:"normal",
                        weight:"normal",
                        family:"Arial",
                        size:"10pt",
                        color:"black",
                        fill:true
                   },
                   paragraph:{
                        linespace:10,
                        textalign:"left" //left,center,right
                   },
                   tail:{
                        position:"top", //top,bottom,left,right
                        margin:16,
                        size:20
                   }
         };
         $.extend(opt,option);          
         $.extend(this,new note(opt));
         this.type="tooltip";
         this.setFunctionPoints=function(){
       	  if(this.tail.position=="top"){
       		  if(this.functionPoints.length===0)
	            	  this.functionPoints=[
	        		                 {x:this.tail.margin,y:0,cursor:"pointer",visible:true},    		                 
	        		                 {x:this.tail.margin+this.tail.size/2,y:-15,cursor:"pointer",visible:true},
	        		                 {x:this.tail.margin+this.tail.size,y:0,cursor:"pointer",visible:true},    		                 
	        	                    ];
       		  else
       			  this.functionPoints=[
     	        		                 {x:this.tail.margin,y:0,cursor:"pointer",visible:true},    		                 
     	        		                 this.functionPoints[1],
     	        		                 {x:this.tail.margin+this.tail.size,y:0,cursor:"pointer",visible:true},    		                 
     	        	                    ];
       			  
       		  
       	  }
       	  else if(this.tail.position=="bottom")
       		  if(this.functionPoints.length===0)
       			  this.functionPoints=[
       		                 {x:this.tail.margin,y:this.height,cursor:"pointer",visible:true},    		                 
       		                 {x:this.tail.margin+this.tail.size/2,y:this.height+this.tail.size,cursor:"pointer",visible:true},
       		                 {x:this.tail.margin+this.tail.size,y:this.height,cursor:"pointer",visible:true},    		                 
       	                    ];
       		  else
       			  this.functionPoints=[
       	        		                 {x:this.tail.margin,y:this.height,cursor:"pointer",visible:true},    		                 
       	        		                 this.functionPoints[1],
       	        		                 {x:this.tail.margin+this.tail.size,y:this.height,cursor:"pointer",visible:true},    		                 
       	        	                    ];
       			  
       	  else if(this.tail.position=="left")
       		  if(this.functionPoints.length===0)
       			  this.functionPoints=[
             		                 {x:0,y:this.tail.margin,cursor:"pointer",visible:true},    		                 
             		                 {x:-this.tail.size,y:this.tail.margin+this.tail.size/2,cursor:"pointer",visible:true},
             		                 {x:0,y:this.tail.margin+this.tail.size,cursor:"pointer",visible:true},    		                 
             	                    ];
       		  else
       			  this.functionPoints=[
                   		                 {x:0,y:this.tail.margin,cursor:"pointer",visible:true},    		                 
                   		                 this.functionPoints[1],
                   		                 {x:0,y:this.tail.margin+this.tail.size,cursor:"pointer",visible:true},    		                 
                   	                    ];
       			  
       	  else if(this.tail.position=="right")
       		  if(this.functionPoints.length===0)
       			  this.functionPoints=[
             		                 {x:this.width,y:this.tail.margin,cursor:"pointer",visible:true},    		                 
             		                 {x:this.width+this.tail.size,y:this.tail.margin+this.tail.size/2,cursor:"pointer",visible:true},
             		                 {x:this.width,y:this.margin+this.tail.size,y:this.tail.margin+this.tail.size,cursor:"pointer",visible:true},    		                 
             	                    ];
       		  else
       			  this.functionPoints=[
           		                 {x:this.width,y:this.tail.margin,cursor:"pointer",visible:true},    		                 
           		                 this.functionPoints[1],
           		                 {x:this.width,y:this.margin+this.tail.size,y:this.tail.margin+this.tail.size,cursor:"pointer",visible:true},    		                 
           	                    ];
         };
         
         this.setFunctionPoints();
         
         this.beforePaint=function(ctx){
       	  this.setFunctionPoints();
         };
       
         this.persist=function(){
              var r=widget.persistproperty(this);
              if(this.paragraph){
                   r.paragraph={};
                   $.extend(r.paragraph,this.paragraph);
              }
              if(this.tail){
                   r.tail={};
                   $.extend(r.tail,this.tail);
              }
              return r;
         };
         this.drawBorderTo=function(ctx){
              ctx.save();
              var radius=0;
              this.border.width=parseInt(this.border.width);
              ctx.beginPath();
              ctx.lineWidth=this.border.width;
              ctx.strokeStyle=this.border.color;
              ctx.fillStyle=this.background.color;
              if(typeof this.font==="String")
                   ctx.font=this.font;
              else{
                   ctx.font=this.font.style+" "+this.font.weight+" "+this.font.size+" "+this.font.family;
              }
              if(this.border.type!=="solid"&&ctx.setLineDash){
                   var dashList = this.border.type==="dashed"?[ this.border.width+3, this.border.width+1]:[this.border.width+1,this.border.width+1]; 
                   ctx.setLineDash(dashList);
              }
              if(this.corner.type==="round"){
                   radius=this.corner.radius;
              }
              //this.tail.target=this.relativePoint(this.x-200,this.y+100);
              if(this.tail.position==="top"){
                   ctx.moveTo(0,this.height-radius);
                   ctx.lineTo(0,radius);
                   ctx.arcTo(0,0,radius,0,radius);     
                   ctx.lineTo(this.functionPoints[0].x,this.functionPoints[0].y);                    
                   ctx.lineTo(this.functionPoints[1].x,this.functionPoints[1].y);
                   ctx.lineTo(this.functionPoints[2].x,this.functionPoints[2].y);	                
                   ctx.lineTo(this.width-radius,0);
                   ctx.arcTo(this.width,0,this.width,radius,radius);     
                   ctx.lineTo(this.width,this.height-radius);
                   ctx.arcTo(this.width,this.height,this.width-radius,this.height,radius);     
                   ctx.lineTo(radius,this.height);
                   ctx.arcTo(0,this.height,0,this.height-radius,radius);     
                   ctx.stroke();
              }
              else if(this.tail.position==="bottom"){
                   ctx.moveTo(0,this.height-radius);
                   ctx.lineTo(0,radius);
                   ctx.arcTo(0,0,radius,0,radius);                                             
                   ctx.lineTo(this.width-radius,0);
                   ctx.arcTo(this.width,0,this.width,radius,radius);     
                   ctx.lineTo(this.width,this.height-radius);
                   ctx.arcTo(this.width,this.height,this.width-radius,this.height,radius);
                   ctx.lineTo(this.functionPoints[2].x,this.functionPoints[2].y);	
                   ctx.lineTo(this.functionPoints[1].x,this.functionPoints[1].y);
                   ctx.lineTo(this.functionPoints[0].x,this.functionPoints[0].y);
                   ctx.lineTo(radius,this.height);
                   ctx.arcTo(0,this.height,0,this.height-radius,radius);     
                   ctx.stroke();
              }
              else if(this.tail.position==="right"){
                   ctx.moveTo(0,this.height-radius);
                   ctx.lineTo(0,radius);
                   ctx.arcTo(0,0,radius,0,radius);     
                   ctx.lineTo(this.width-radius,0);                         
                   ctx.arcTo(this.width,0,this.width,radius,radius);
                   ctx.lineTo(this.functionPoints[0].x,this.functionPoints[0].y);
                   ctx.lineTo(this.functionPoints[1].x,this.functionPoints[1].y);
                   ctx.lineTo(this.functionPoints[2].x,this.functionPoints[2].y);
                   ctx.lineTo(this.width,this.height-radius);
                   ctx.arcTo(this.width,this.height,this.width-radius,this.height,radius);     
                   ctx.lineTo(radius,this.height);     
                   ctx.arcTo(0,this.height,0,this.height-radius,radius);     
                   ctx.stroke();
                   
              }
              else if(this.tail.position==="left"){
                   ctx.moveTo(0,this.height-radius);
                   ctx.lineTo(0,radius+this.tail.margin+this.tail.size);
                   ctx.lineTo(this.functionPoints[2].x,this.functionPoints[2].y);
                   ctx.lineTo(this.functionPoints[1].x,this.functionPoints[1].y);
                   ctx.lineTo(this.functionPoints[0].x,this.functionPoints[0].y);                    
                   ctx.lineTo(0,radius);                         
                   ctx.arcTo(0,0,radius,0,radius);     
                   ctx.lineTo(this.width-radius,0);                         
                   ctx.arcTo(this.width,0,this.width,radius,radius);
                   ctx.lineTo(this.width,this.height-radius);
                   ctx.arcTo(this.width,this.height,this.width-radius,this.height,radius);     
                   ctx.lineTo(radius,this.height);     
                   ctx.arcTo(0,this.height,0,this.height-radius,radius);     
                   ctx.stroke();
              }    
              this.fillBackgroundTo(ctx,2);
              ctx.clip();
//              this.fillBackgroundTo(ctx);
              this.drawImageTo(ctx);	
              ctx.restore();
              
         };
         this.afterfunctionPoint=function(ev){  
       	  var radius=0;
       	  if(this.corner.type==="round"){
                 radius=this.corner.radius;
            }
       	 if(this.tail.position=="top"){
       		  if(ev.functionPoint==1){
       			  var _x=this.tail.margin+ev.offset.x;
       			  if(_x>radius&&_x<this.width-2*radius-this.tail.size)
       			    this.tail.margin=_x;
       		  }
       		  else if(ev.functionPoint==3){
       			  var _x=this.tail.size+ev.offset.x;
       			  if(_x>15&&_x<this.width-2*radius-this.tail.margin)
       			    this.tail.size=_x;
       		  }
       	  }
       	 else  if(this.tail.position=="bottom"){
	       		  if(ev.functionPoint==1){
	    			  var _x=this.tail.margin+ev.offset.x;
	    			  if(_x>radius&&_x<this.width-2*radius-this.tail.size)
	    			    this.tail.margin=_x;
	    		  }
	    		  else if(ev.functionPoint==3){
	    			  var _x=this.tail.size+ev.offset.x;
	    			  if(_x>15&&_x<this.width-2*radius-this.tail.margin)
	    			    this.tail.size=_x;
	    		  }
	    	  }
       	 else  if(this.tail.position=="right"){
	       		  if(ev.functionPoint==1){
	    			  var _y=this.tail.margin+ev.offset.y;
	    			  if(_y>radius&&_y<this.height-2*radius-this.tail.size)
	    			    this.tail.margin=_y;
	    		  }
	    		  else if(ev.functionPoint==3){
	    			  var _x=this.tail.size+ev.offset.y;
	    			  if(_x>15&&_x<this.height-2*radius-this.tail.margin)
	    			    this.tail.size=_x;
	    		  }
	    	  }
       	 else  if(this.tail.position=="left"){
	       		  if(ev.functionPoint==1){
	    			  var _x=this.tail.margin+ev.offset.y;
	    			  if(_x>radius&&_x<this.height-2*radius-this.tail.size)
	    			    this.tail.margin=_x;
	    		  }
	    		  else if(ev.functionPoint==3){
	    			  var _x=this.tail.size+ev.offset.y;
	    			  if(_x>15&&_x<this.height-2*radius-this.tail.margin)
	    			    this.tail.size=_x;
	    		  }
	    	  }
         };
         return this;
         
    };       
     
     textInput=function(option){
          var opt={
                    name:"textInput",
                    text:"textInput",
                    width:150,
                    height:35,
                    minheight:15,
                    margin:10,
                    shadow:{
                    	color : "none",
               			offsetX : 4,
               			offsetY : 4,
               			blur : 4
                    },
                    corner:{
                         type:"rect", //round,rect
                         radius:8
                    },
                    background:{
                    	 filltype:"color",
                         image:"",
                         imageType:"fill",
                         color:"white"
                    },
                    border:{
                         color:"#e5cdcd",
                         width:1,
                         type:"solid"
                    },
                    font:{
                         style:"italic",
                         weight:"normal",
                         family:"Arial",
                         size:"10pt",
                         color:"black",
                         fill:true
                    }
          };
          $.extend(opt,option);          
          $.extend(this,new note(opt));
          this.propertyEditors=["common","border","font"];
          this.type="textInput";         
     };
     

     
     
     spirograph=function(option){
    	 var opt={
    			 name:"spirograph",
                 corner:null,
                 background:{
                	  filltype:"none",
                      image: "",
                      imageType:"fill",
                      color:"white"
                 },
                 border:{
                     width:1,
                     type:"solid",
                     color:"black"
                 },
                 width:150,
                 height:150,
                 linecap:"round",//butt,square
                 minheight:20,
                 minwidth:20,
                 spirograph:{
                	 R:1,
                	 r:1,
                	 o:40
                 }
    	 };
    	  $.extend(opt,option);          
          $.extend(this,new note(opt));
          this.propertyEditors=["common","border","font","background","shadow","hyperlink","paragraph"];
          this.type="spirograph";
          this.persist=function(){
              var r=widget.persistproperty(this);
              if(this.paragraph)
              {
            	  r.paragraph={};
            	  $.extend(r.paragraph,this.paragraph);
              }
              if(this.spirograph){
                   r.spirograph={};
                   $.extend(r.spirograph,this.spirograph);
              }
              return r;
         };
         this.drawSpirograph=function(ctx,R,r,o){
        	 var x1=R-o;
        	 var y1=0;
        	 var i=1;
        	 ctx.beginPath();
        	 ctx.moveTo(x1,y1);
        	 do{
        		 if(i>2000) break;
        		 var x2=(R+r)*Math.cos(i*Math.PI/72)-(r+o)*Math.cos(((R+r)/r)*(i*Math.PI/72));
        		 var y2=(R+r)*Math.sin(i*Math.PI/72)-(r+o)*Math.sin(((R+r)/r)*(i*Math.PI/72));
        		 ctx.lineTo(x2,y2);
        		 x1=x2;
        		 y1=y2;
        		 i++;
        	 } while(x2!=R-o && y2!=0);
        	 ctx.stroke();
         };
          
          this.drawBorderTo = function(ctx){
        	var _widget=this;
        	//this.height=this.width;    
        	this.spirograph.o=Math.min(this.width,this.height)/2;
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
      			ctx.translate(this.width/2,this.height/2);
      			var radius=this.spirograph.o;
				this.drawSpirograph(ctx,radius*(this.spirograph.r+5)/10,-radius*(this.spirograph.R/10),radius/2);
//      			for (var i=0;i<3;i++){
//      				for (var j=0;j<3;j++){
//      					ctx.save();
//      					ctx.translate(50+j*100,50+i*100);
//      					this.drawSpirograph(ctx,20*(j+2)/(j+1),-8*(i+3)/(i+1),10);
//      					ctx.restore();
//
//      				};
//      			};
                this.drawShadowTo(ctx);
                this.fillBackgroundTo(ctx,2);
                ctx.clip();
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
     };
     
     
     polygon=function(option){
    	 var opt={
    			 name:"polygon",
                 corner:null,
                 background:{
                	  filltype:"none",
                      image: "",
                      imageType:"fill",
                      color:"white"
                 },
                 border:{
                     width:1,
                     type:"solid",
                     color:"black"
                 },
                 width:150,
                 height:150,
                 linecap:"round",//butt,square
                 minheight:20,
                 minwidth:20,
                 polygon:{
                	 sides:7,
                	 startAngle:0
                 }
    	  };
    	  $.extend(opt,option);      
    	  if(option.focus)
        	  opt.text="";
          $.extend(this,new note(opt));
          this.propertyEditors=["common","border","font","background","hyperlink"];
          var points=[];
          this.type="polygon";
          this.persist=function(){
              var r=widget.persistproperty(this);
              
              if(this.paragraph)
              {
            	  r.paragraph={};
            	  $.extend(r.paragraph,this.paragraph);
              }
              if(this.polygon){
                   r.polygon={};
                   $.extend(r.polygon,this.polygon);
              }
              return r;
         };
         var getPolygonPoints=function(centerX,centerY,radius,sides,startAngle){
        	  var points=[], angle=startAngle*Math.PI/180||0;
        	  for(var i=0;i<sides;i++){
        		  points.push({x:centerX+radius*Math.sin(angle),y:centerY-radius*Math.cos(angle)});
        		  angle+=2*Math.PI/sides;
        	  }
        	  return points;
          };
          this.refresh=function(){
        	  points=getPolygonPoints(this.width/2,this.height/2,this.polygon.radius,this.polygon.sides,this.polygon.startAngle);
          };
         
          this.afterresize=function(e){
        	  this.refresh();    
          };
          
        
          this.drawBorderTo = function(ctx){
        	var _widget=this;
        	var dx=0;
        	//this.height=this.width;
        	this.polygon.radius=Math.min(this.height,this.width)/2;
        	this.refresh();   
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
      			if(points.length>0){
	                ctx.moveTo(points[0].x,points[0].y);
	                for(var i=1;i<points.length;i++){
	              	  ctx.lineTo(points[i].x+dx,points[i].y+dx);
	                }
	                ctx.closePath();
      			}
                ctx.stroke();
                this.drawShadowTo(ctx);
                this.fillBackgroundTo(ctx,2);
                ctx.clip();
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
     };
     
     triangle=function(option){
          var opt={
                    name:"triangle",
                    corner:null,
                    background:{
                    	 filltype:"none",
                         image: "",
                         imageType:"fill",
                         color:"white"
                    },
                    width:150,
                    height:150,
                    linecap:"round",//butt,square,round
                    afterresize:function(ev){
                    	this.functionPoints[0].x+=ev.offset.x/2;
                    	this.functionPoints[0].x=Math.max(this.functionPoints[0].x,0);
                    	this.functionPoints[0].x=Math.min(this.functionPoints[0].x,this.width);
                    },
                    afterfunctionPoint:function(ev){
                    	this.functionPoints[0].y=0;
                    	this.functionPoints[0].x=Math.max(this.functionPoints[0].x,0);
                    	this.functionPoints[0].x=Math.min(this.functionPoints[0].x,this.width);
                    }
          };
          $.extend(opt,option);
          if(option.focus)
        	  opt.text="";
          $.extend(this,new note(opt));
          this.propertyEditors=["common","border","font","background","hyperlink"];
          if(this.functionPoints.length==0)
        	  this.functionPoints=[
                                  {x:150/2,y:0,cursor:"pointer",visible:true}  
                                 ];
         // this.font=null;
          this.end=null;
          this.type="triangle";
          this.drawBorderTo = function(ctx){
        	   var dx=0.5;
        	   ctx.save();
               ctx.beginPath();
               ctx.strokeStyle=this.border.color;
               ctx.lineWidth=this.border.width;
               ctx.lineCap=this.linecap;
               ctx.lineJoin="round";
               if(this.border.width>1)
            	   dx=0;
               if(this.border.type!="solid"&&ctx.setLineDash){
                    var dashList =this.border.type==="dashed"?[this.border.width+5, this.border.width+2]:[this.border.width+2,this.border.width+2]; 
                    ctx.setLineDash(dashList);
               }
               ctx.moveTo(this.functionPoints[0].x+dx,this.functionPoints[0].y+dx);
               ctx.lineTo(this.resizers[2].x+dx,this.resizers[2].y+dx);
               ctx.lineTo(this.resizers[3].x+dx,this.resizers[3].y+dx);
               ctx.closePath();
               ctx.stroke();
               this.fillBackgroundTo(ctx,2);
               ctx.clip();	
               this.fillBackgroundTo(ctx);
   			   this.drawImageTo(ctx);
   			   ctx.restore();
               return this;
          };
          return this;
     };
     
     parallelogram=function(option){
    	 var opt={
                 name:"parallelogram",
                 corner:null,
                 width:150,
                 height:150,
                 background:{
                 	filltype:"none",
                 	color:"white"
                 },
                 linecap:"round",//butt,square
                 offsetx:0,
                 afterresize:function(ev){
                	 if(this.width<this.offsetx+10)
                		 this.width=this.offsetx+10;
                 },
                 afterfunctionPoint:function(ev){
                 	this.functionPoints[0].y=0;
                 	var old_offsetx=this.offsetx;
                 	this.offsetx+=ev.offset.x;                 	
                	if(old_offsetx<0&&this.offsetx<0){
                		 this.width-=ev.offset.x;
                		 this.x+=ev.offset.x;
                	} 
                	else if(old_offsetx>0&&this.offsetx>0){
                		this.width+=ev.offset.x;
                	}
                	this.setfunctionPoints();
                 }
       };
       $.extend(opt,option);
       if(option.focus)
     	  opt.text="";
       $.extend(this,new note(opt));
       this.propertyEditors=["common","border","font","background","shadow","hyperlink","paragraph"];
       this.setfunctionPoints=function(){
    	   var x1=this.offsetx;
    	   if(x1>=0)
    		   this.functionPoints=[
      	                       {x:x1,y:0,cursor:"pointer",visible:true},
      	                      ];
    	   else
    		   this.functionPoints=[
    	      	                       {x:0,y:0,cursor:"pointer",visible:true},
    	      	                      ];
    		   
    		
       };
       if(this.functionPoints.length<1) 
    	   this.setfunctionPoints();
      // this.font=null;
       this.type="parallelogram";       
       this.drawBorderTo = function(ctx){
    	   	var dx=0;
     	    ctx.save();
            ctx.beginPath();
            ctx.strokeStyle=this.border.color;
            ctx.lineWidth=this.border.width;
            if(this.border.width===1)
            	dx=0.5;
            ctx.lineCap=this.linecap;
            if(this.border.type!="solid"&&ctx.setLineDash){
                 var dashList =this.border.type==="dashed"?[this.border.width+5, this.border.width+2]:[this.border.width+2,this.border.width+2]; 
                 ctx.setLineDash(dashList);
            }
            this.setResizers();
            ctx.moveTo(this.functionPoints[0].x+dx,this.functionPoints[0].y+dx);
            if(this.offsetx>=0){
            		ctx.lineTo(this.resizers[1].x+dx,this.resizers[1].y+dx);               
            		ctx.lineTo(this.resizers[1].x+dx-this.offsetx,this.resizers[2].y+dx);
            		ctx.lineTo(this.resizers[2].x+dx,this.resizers[2].y+dx);
            }
            else{
            	ctx.lineTo(this.resizers[1].x+dx+this.offsetx,this.resizers[1].y+dx);
            	ctx.lineTo(this.resizers[3].x+dx,this.resizers[3].y+dx);
        		ctx.lineTo(this.resizers[2].x+dx-this.offsetx,this.resizers[2].y+dx);
        		
            }
            ctx.closePath();
            ctx.stroke();
            this.fillBackgroundTo(ctx,2);
            ctx.clip();	
            this.fillBackgroundTo(ctx);
			this.drawImageTo(ctx);
			ctx.restore();
            return this;
       };
       return this;
     };
     
     quadrangle=function(option){
          var opt={
                    name:"quadrangle",
                    corner:null,
                    width:150,
                    height:150,
                    background:{
                    	filltype:"none",
                    	color:"white"
                    },
                    linecap:"round",//butt,square
                    afterresize:function(ev){
                    	this.functionPoints[1].x+=ev.offset.x;
                    	if(ev.resizer==1||ev.resizer==3)
                    		this.functionPoints[1].x-=2*ev.offset.x;
                    	this.functionPoints[0].x=Math.max(0,this.functionPoints[0].x);
                    	this.functionPoints[0].x=Math.min(this.functionPoints[0].x,this.width/2);                    	
                    	this.functionPoints[1].x=Math.max(this.width/2,this.functionPoints[1].x);
                    	this.functionPoints[1].x=Math.min(this.functionPoints[1].x,this.width);
                    	
                    },
                    afterfunctionPoint:function(ev){
                    	this.functionPoints[0].y=0;
                    	this.functionPoints[0].x=Math.max(0,this.functionPoints[0].x);
                    	this.functionPoints[0].x=Math.min(this.functionPoints[0].x,this.width/2);
                    	this.functionPoints[1].y=0;
                    	this.functionPoints[1].x=Math.max(this.width/2,this.functionPoints[1].x);
                    	this.functionPoints[1].x=Math.min(this.functionPoints[1].x,this.width);
                    }
          };
          $.extend(opt,option);
          if(option.focus)
          	  opt.text="";
          $.extend(this,new note(opt));
          this.propertyEditors=["common","border","font","background","hyperlink"];
          if(this.functionPoints.length==0)
        	  this.functionPoints=[
        	                       {x:0,y:0,cursor:"pointer",visible:true},
        	                       {x:this.width,y:0,cursor:"pointer",visible:true} 
        	                      ];
        //  this.font=null;
          this.type="quadrangle";       
          this.drawBorderTo = function(ctx){
        	   var dx=0.5; 
        	   ctx.save();
               ctx.beginPath();
               ctx.strokeStyle=this.border.color;
               ctx.lineWidth=this.border.width;
               if(this.border.width>1)
            	   dx=0;
               ctx.lineCap=this.linecap;
               if(this.border.type!="solid"&&ctx.setLineDash){
                    var dashList =this.border.type==="dashed"?[this.border.width+5, this.border.width+2]:[this.border.width+2,this.border.width+2]; 
                    ctx.setLineDash(dashList);
               }
               this.setResizers();
               ctx.moveTo(this.functionPoints[0].x+dx,this.functionPoints[0].y+dx);
               ctx.lineTo(this.functionPoints[1].x+dx,this.functionPoints[1].y+dx);               
               ctx.lineTo(this.resizers[3].x+dx,this.resizers[3].y+dx);
               ctx.lineTo(this.resizers[2].x+dx,this.resizers[2].y+dx);
               ctx.closePath();
               ctx.stroke();
               this.fillBackgroundTo(ctx,2);
               ctx.clip();	
               this.fillBackgroundTo(ctx);
   			   this.drawImageTo(ctx);
   			   ctx.restore();
               return this;
          };
          return this;
     };
     
     pentagon=function(option){
    	 var opt={
                 name:"pentagon",
                 corner:null,
                 width:200,
                 height:150,
                 linecap:"round",//butt,square
                 background:{
                 	filltype:"none",
                 	color:"white"
                 },
                 arrow:{
                	 sharp:20
                 },
                 afterresize:function(ev){
                	 if(this.width<this.arrow.sharp+10)
                		 this.width=this.arrow.sharp+10;
                	 this.setfunctionPoints();
                 },
                 afterfunctionPoint:function(ev){
                 	this.arrow.sharp-=ev.offset.x;
                 	if(this.arrow.sharp<0)
                 		 this.arrow.sharp=0;
                 	else if(this.arrow.sharp>this.width)
                 		this.arrow.sharp=this.width;
                 	this.setfunctionPoints();
                 }
       };
       $.extend(opt,option);
       if(option.focus)
     	  opt.text="";
       $.extend(this,new note(opt));
       this.propertyEditors=["common","border","font","background","shadow","hyperlink","paragraph"];
       this.setfunctionPoints=function(){
    	   this.functionPoints=[     	                      
      	                       {x:this.width-this.arrow.sharp,y:0,cursor:"pointer",visible:true}
      	                      ]; 
       };
       if(this.functionPoints.length==0) 
    	   this.setfunctionPoints();
      // this.font=null;
       this.type="pentagon";       
       this.drawBorderTo = function(ctx){
    	   	var dx=0;
     	    ctx.save();
            ctx.beginPath();
            ctx.strokeStyle=this.border.color;
            ctx.lineWidth=this.border.width;
            if(this.border.width==1)
            	dx=0.5;
            ctx.lineCap=this.linecap;
            if(this.border.type!="solid"&&ctx.setLineDash){
                 var dashList =this.border.type==="dashed"?[this.border.width+5, this.border.width+2]:[this.border.width+2,this.border.width+2]; 
                 ctx.setLineDash(dashList);
            }
            this.setResizers();
            ctx.moveTo(dx,dx);
            ctx.lineTo(this.width-this.arrow.sharp+dx,dx);
            ctx.lineTo(this.width+dx,this.height/2+dx);
            ctx.lineTo(this.width-this.arrow.sharp+dx,this.height+dx);
            ctx.lineTo(dx,this.height+dx);
            ctx.lineTo(dx,dx);
            ctx.stroke();
            this.fillBackgroundTo(ctx,2);
            ctx.clip();	
            this.fillBackgroundTo(ctx);
			   this.drawImageTo(ctx);
			   ctx.restore();
            return this;
       };
       return this;
     };
     
     swallowtailed=function(option){
    	 var opt={
                 name:"swallowtailed",
                 corner:null,
                 width:200,
                 height:150,
                 linecap:"round",//butt,square
                 background:{
                 	filltype:"none",
                 	color:"white"
                 },
                 afterresize:function(ev){
                 	 if(ev.resizer==2||ev.resizer==4){
                 		this.functionPoints[0].x+=ev.offset.x;
                 	 }
                 },
                 afterfunctionPoint:function(ev){
                 	this.functionPoints[0].y=0;
                 	this.functionPoints[0].x=Math.max(this.functionPoints[0].x,10);
                 	this.functionPoints[0].x=Math.min(this.functionPoints[0].x,this.width);
                 }
       };
       $.extend(opt,option);
       if(option.focus)
     	  opt.text="";
       $.extend(this,new note(opt));
       this.propertyEditors=["common","border","font","background","shadow","hyperlink","paragraph"];
       if(this.functionPoints.length==0) 
     	  this.functionPoints=[     	                      
     	                       {x:this.width-20,y:0,cursor:"pointer",visible:true}
     	                      ];
       //this.font=null;
       this.type="swallowtailed";       
       this.drawBorderTo = function(ctx){
    	   	var dx=0;
     	    ctx.save();
            ctx.beginPath();
            ctx.strokeStyle=this.border.color;
            ctx.lineWidth=this.border.width;
            if(this.border.width===1)
            	dx=0.5;
            ctx.lineCap=this.linecap;
            if(this.border.type!="solid"&&ctx.setLineDash){
                 var dashList =this.border.type==="dashed"?[this.border.width+5, this.border.width+2]:[this.border.width+2,this.border.width+2]; 
                 ctx.setLineDash(dashList);
            }
            this.setResizers();
            ctx.moveTo(this.resizers[0].x+dx,this.resizers[0].y+dx);
            ctx.lineTo(this.functionPoints[0].x+dx,this.functionPoints[0].y+dx);
            ctx.lineTo(this.width+dx,this.height/2+dx);      
            ctx.lineTo(this.functionPoints[0].x+dx,this.height+dx);
            ctx.lineTo(this.resizers[2].x+dx,this.resizers[2].y+dx);
            ctx.lineTo(this.width-this.functionPoints[0].x+dx,this.height/2+dx);
            ctx.closePath();
            ctx.stroke();
            this.fillBackgroundTo(ctx,2);
            ctx.clip();	
            this.fillBackgroundTo(ctx);
			this.drawImageTo(ctx);
			ctx.restore();
            return this;
       };
       return this;
     };
     
//     header=function(option){
//    	 var opt={
//                 name:"header",
//                 corner:null,
//                 width:200,
//                 height:80,
//                 margin:10,
//                 allowdrop:true,
//                 linecap:"round",//butt,square
//                 border:{
//                	width :2,
//                 	type:"solid", //solid, dotted,dashed
//         			color : "#ddd" 
//                 },
//                 shadow:{
//                	color:"none" 
//                 },
//                 background:{
//                 	filltype:"color",
//                 	color:"#000000"
//                 },
//                 font:{
//                 		style:"normal",  //normal, italic
//         				weight:"bold", //normal,bold
//         				family:"Arial",
//              			size:"11pt",
//         				color:"white",
//         				fill:true
//                 },
//                 paragraph:{
//                     linespace:10,
//                     textalign:"center", //left,center,right
//                     textvalign:"bottom" //top,middle,bottom
//                     
//                },
//                 afterresize:function(ev){
//                	 this.setfunctionPoints();
//                 },
//                 afterfunctionPoint:function(ev){
//                 	this.height+=ev.offset.y;
//                 	this.setfunctionPoints();
//                 }
//       };
//       $.extend(opt,option);
//       if(option.focus)
//    	   opt.font.color="white";
//       $.extend(this,new note(opt));
//       this.allowconnectionPoint=false;
//       this.allowRotate=false;
//       this.setfunctionPoints=function(){
//    	   this.functionPoints=[     	                      
//      	                       {x:this.width/2,y:this.height,cursor:"pointer",visible:true}
//      	                      ]; 
//       };
//       if(this.functionPoints.length==0) 
//    	   this.setfunctionPoints();
//       this.type="header";
//       this.drop=function(ev){
//      	 var e=ev.originalEvent;
//    	 var data=e.dataTransfer.getData("text");
//    	 var _widget=this.createWidget(data);
//    	 this.appendWidget(_widget);
//    	 ev.cancel=true;
//       };
//       this.beforePaint=function(){
//    	   this.x=-this.border.width;
//    	   this.y=-this.border.width;
//    	   this.width=parseInt(this.parent.width)+2*this.border.width;    	   
//    	   this.height=Math.min(parseInt(this.parent.height)/2,this.height);
//    	   this.height=Math.max(20,this.height);
//    	   this.setfunctionPoints();
//       };
//       return this;
//     };
//     
//     header.prototype.createWidget=function(data){
//    	 var font={
// 				style:"normal",  //normal, italic
// 				weight:"normal", //normal,bold
// 				family:"verdana",//微软雅黑
//      			size:"11pt",
// 				color:"black",
// 				fill:true
// 		};
// 		var panel=this.presenters[0];
// 		data=data.substring(data.indexOf(":")+1,data.length);
// 		var opt;
// 		var widgetType;
// 		if(data.indexOf("custom:")==0){
// 			var id=data.substring("7",data.length);
// 			widgetModel=$.model(ctx+"/api/visorwidget/"+id);			
// 			var _a=widgetModel.items()[0];
// 			opt=JSON.parse(_a.content);
// 			opt.name=panel.getName(opt.type);
// 			if(opt.background.image!=null&&opt.background.filltype==null)
// 				opt.background.filltype="image";
// 			opt.text=opt.text;
// 			opt.focus=true;
// 			opt.editable=true;
// 			opt.click=designer.widgetClickEvent;
// 			widgetType=opt.type;
// 		}
// 		else if(data.indexOf("image:")==0){
// 			var url=data.substring("6",data.length);
// 			opt={};
// 			opt.type="box";
// 			opt.name=panel.getName(opt.type);
// 			opt.text="";
// 			opt.focus=true;
// 			opt.background={
// 					filltype:"image",
// 					image:url,					
// 					imageType:"fill",
// 					color:"none"
// 			};
// 			opt.border={
// 					color:"none"
// 			};
// 			opt.editable=true;
// 			opt.click=designer.widgetClickEvent;
// 			widgetType=opt.type;
// 		}
// 		else{
// 			var widgetName;
// 			var option={};
// 			if(data.indexOf(":")<0){
// 				widgetType=data;
// 			}
// 			else{
// 				widgetType=data.substring(0, data.indexOf(":"));
// 				option=JSON.parse(data.substring(data.indexOf(":")+1,data.length));
// 			}
// 			widgetName=panel.getName(widgetType);		
// 			opt={
// 				name:widgetName,
// 				text:widgetName,
// 				focus:true,
// 				editable:true,
// 				font:font,
// 				ondelete:designer.widgetDeleteEvent,
// 				click:designer.widgetClickEvent
// 			};
// 			$.extend(opt,option);
// 		}
// 		var _widget=$.widgets(widgetType,opt);
// 		return _widget;
//     };
//     
//     footer=function(option){
//    	 var opt={
//                 name:"footer",
//                 corner:null,
//                 width:200,
//                 height:78,
//                 linecap:"round",//butt,square
//                 border:{
//                 	width : 2,
//                  	type:"solid", //solid, dotted,dashed
//          			color : "#ddd" 
//                  },
//                  shadow:{
//                 	color:"none" 
//                  },
//                  background:{
//                  	filltype:"color",
//                  	color:"#fffbff"
//                  },
//                 afterresize:function(ev){
//                	 this.setfunctionPoints();
//                 },
//                 afterfunctionPoint:function(ev){
//                 	this.height-=ev.offset.y;
//                 	this.setfunctionPoints();
//                 }
//       };
//       $.extend(opt,option);
//       if(option.focus)
//    	   opt.text="";
//       $.extend(this,new note(opt));
//       this.allowconnectionPoint=false;
//       this.allowRotate=false;
//       this.autosize=true;
//       this.setfunctionPoints=function(){
//    	   this.functionPoints=[     	                      
//      	                       {x:this.width/2,y:0,cursor:"pointer",visible:true}
//      	                      ]; 
//       };
//       if(this.functionPoints.length==0) 
//    	   this.setfunctionPoints();
//       this.type="footer";
//       this.beforePaint=function(){
//    	   this.x=-this.border.width;
//    	   this.y=this.parent.height-this.height+this.border.width;
//    	   this.width=parseInt(this.parent.width)+2*this.border.width;    	   
//    	   this.height=Math.min(parseInt(this.parent.height)/2,this.height);
//    	   this.height=Math.max(20,this.height);
//    	   this.setfunctionPoints();
//       };
//       return this;
//     };
//     
//     searchBox=function(option){
//         var opt={
//                   name:"searchBox",
//                   margin:0,
//                   height:40,
//                   width:134,
//                   filltype:"image",
//                   border:{
//                   	 width:1,
//                        type:"solid",
//                        color:"none"
//                   },
//                   background:{
//                   	 filltype:"image",
//                        image: ctx+"/res/images/visor/searchbar.png",
//                        imageType:"fill",
//                        color:"none"
//                   }
//         };
//         $.extend(opt,option);
//         if(option.focus)
//      	     opt.text="";
//         $.extend(this,new header(opt));
//         this.type="searchBox";
//         return this;
//    };
//    
//    keyboard=function(option){
//        var opt={
//                  name:"keyboard",
//                  margin:0,
//                  height:205,
//                  width:134,
//                  filltype:"image",
//                  border:{
//                  	 width:1,
//                       type:"solid",
//                       color:"none"
//                  },
//                  background:{
//                  	 filltype:"image",
//                       image: ctx+"/res/images/visor/keyboard2.png",
//                       imageType:"fill",
//                       color:"none"
//                  }
//        };
//        $.extend(opt,option);
//        if(option.focus)
//     	     opt.text="";
//        $.extend(this,new footer(opt));
//        this.type="keyboard";
//        return this;
//   };
//   
//   imageButton=function(option){
//   var opt={
//             name:"imageButton",
//             margin:0,
//             height:50,
//             width:134,
//             filltype:"image",
//             border:{
//             	 width:1,
//                  type:"solid",
//                  color:"none"
//             },
//             background:{
//             	 filltype:"image",
//                  image: ctx+"/res/images/visor/sample.png",
//                  imageType:"fill",
//                  color:"none"
//             }
//   };
//   $.extend(opt,option);
//   $.extend(this,new button(opt));
//   this.type="imageButton";
//   return this;
//};
//     button=function(option){
//         var opt={
//                   name:"button",
//                   text:"button",
//                   width:120,
//                   height:30,
//                   margin:12,
//                   shadow:{
//                   	color:"none"
//                   },
//                   corner:{
//                        type:"round", //round,rect
//                        radius:4
//                   },
//                   background:{
//                   	 filltype:"color",
//                        image:"",
//                        imageType:"fill",
//                        color:"#ccc"
//                   },
//                   font:{
//                        style:"normal", // normal,italic,
//                        weight:"normal",//normal,lighter,bold  
//                        family:"Arial",
//                        size:"10pt",
//                        color:"black",
//                        fill:true
//                   },
//                   border:{
//                        width:1,
//                        type:"solid",
//                        color:"#4B4B4B"
//                   },
//                   autosize:false
//         };
//         $.extend(opt,option);          
//         $.extend(this,new note(opt));
//         this.type="button";
//    };
   spirit=function(option){
		var opt={
				name:"spirit",
				width:121,
				height:168,
				text:"",
				font:null,
				border:{
					color:"none",
					width:1,
					type:"solid"
				},
				background:{
					filltype:"images",
		        	color : "white",
					image : null,
					imageType : "fill"
				},
				spirit:{
					images:[],
					index:0,
					interval:6,
					direction:"forward",
					autoplay:false
					
				},
				mousedown:function(e){
					this.oldx=e.x;
					this.oldy=e.y;
					this.isdown=true;
				},
				mousemove:function(e){
					var size=2;
					if(this.isdown){
						var dx=e.x-this.oldx;
						this.oldx=e.x;
						this.oldy=e.y;
						if(dx>=size){
							this.spirit.index++;
					    	if(this.spirit.index==this.spirit.images.length)
			    				this.spirit.index=0;
					    	this.paint();
						}
						else if(dx<=-size){
							this.spirit.index--;
							if(this.spirit.index<0)
			    				this.spirit.index=this.spirit.images.length-1;
					    	this.paint();
						}
					}
				},
				mouseup:function(e){
					this.isdown=false;
				},
				click:function(e){
					this.spirit.index++;
			    	if(this.spirit.index==this.spirit.images.length)
	    				this.spirit.index=0;
				  this.paint();
				}
		};
		$.extend(opt,option);
		$.extend(this,new note(opt));
		this.propertyEditors=["common","border","font","background","shadow","hyperlink","paragraph"];
		this.spirit.direction=this.spirit.direction||"forward1";
		this.type="spirit";
		this.isdown=false;
		this.init=function(){
			var _images=[];
			$(this.spirit.images).each(function(i,item){
				var image="";
				if(typeof item==="string")
					image=item;
				else
					image=item.value;				
				if(typeof image==="string"){
				  var img=new Image();
				  img.src=image;
				  _images.push(img); 
				}
			});
			this.spirit._images=_images;
			this.spirit.index=this.spirit.index||0;
			this.spirit.interval=this.spirit.interval||1;
		};
		this.init();
		var pan=0;
		this.panright=function(e){
			pan++;
			if(pan==3){
				this.forward();
				this.paint();
				pan=0;
			}
		};
		this.panleft=function(e){
			pan++;
			if(pan==3){
				this.backward();
				this.paint();
				pan=0;
			}
		};
		this.appendPresenter = function(presenter) {
			this.parent=presenter.rootwidget;
			this.root=presenter.rootwidget;
			presenter.widgets.push(this);
			this.depth = presenter.widgets.length;
			this.presenters.push(presenter);
			if(this.spirit.autoplay){
				if(!presenter.globalAnimations)
					presenter.globalAnimations=[];				
				presenter.globalAnimations.push(this);
			}
			return this;
		};
		this.persist=function(){	          
	          var r=widget.persistproperty(this);
	          r.spirit={};
	          r.spirit.images=[];
	          r.spirit.autoplay=this.spirit.autoplay;
	          r.spirit.interval=this.spirit.interval;
	          $(this.spirit.images).each(function(i,image){
	        	  r.spirit.images.push(image);
	          });	          	             
	          return r;
		};
		this.drawImageTo = function(ctx) {
			var _widget=this;
			var image=null;
			if(_widget.background==null||(_widget.background.filltype!="images"&&_widget.background.filltype!="image"))
				return;
			if(_widget.background.filltype=="images"){
				if(this.spirit.index<this.spirit.images.length){
				    image=this.spirit._images[this.spirit.index];
				}
				if(image==null)
				   image = _widget.background.image;
		    }
			else{
				 image = _widget.background.image;
			}
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
					ctx.drawImage(image, _x, _y, _w, _h);
				} else if (type === "repeat") {
					var _w = _widget.width, _h = _widget.height, _x = 0, _y = 0;
					while (true) {
						ctx.drawImage(image, _x, _y, image.width,image.height);
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
					ctx.drawImage(image, 0, 0, _widget.width,_widget.height);
				} else if (type === "center") {
					var _w = image.width, _h = image.height, _x = 0, _y = 0;
					_x = (_widget.width - _w) / 2;
					_y = (_widget.height - _h) / 2;
					ctx.drawImage(image, _x, _y, _w, _h);
				}
			}
			return this;
		};
		var timeStamp=0;
	    this.run=function(){
	    	var ths=this;
	    	var startValues={index:0};
	    	var endValues={index:this.spirit.images.length-1};	    	
	    	var tweenA=new TWEEN.Tween(startValues).to(endValues, ths.spirit.interval*1000).delay(0).repeat(Infinity).easing(TWEEN.Easing.Linear.None).onUpdate(function(){	    	  
			      for(var s in startValues){
			      		ths.spirit[s]=parseInt(this[s]);
			      }
		     	}).onComplete(function(){
		      	 	      	 
		     	});
	    	tweenA.start();
	    };
   };
   

//     $.register("searchBox",searchBox);
//     $.register("keyboard",keyboard);
//     $.register("header",header);
//     $.register("footer",footer);
//     $.register("imageButton",imageButton);
//   $.register("button",button);
     $.register("box",box);
	 $.register("label",label);
	 $.register("note",note);
	 $.register("link",link);
	 $.register("checkbox",checkbox);
	 $.register("textInput",textInput);
	 $.register("tooltip",tooltip);
	 $.register("radio",radio);
	
	
	 $.register("line",line);
	 $.register("curve",quadraticCurve);
	 $.register("bezierCurve",bezierCurve);
	 $.register("triangle",triangle);
	 $.register("quadrangle",quadrangle);
	 $.register("parallelogram",parallelogram);
	 $.register("pentagon",pentagon);
	 $.register("swallowtailed",swallowtailed);
	 $.register("circle",circle);
	 $.register("noticeboard",noticeboard);	 
	 $.register("polygon",polygon);
	 $.register("spirograph",spirograph);	 
	 $.register("spirit",spirit);
          
})(jQuery);
(function($){
	$.connector = function(type,option) {		
		if (type==="lineConnector")
			return new lineConnector(option? option: {});
		else if (type==="brokenLineConnector")
			return new brokenLineConnector(option? option: {});
		else if (type==="quadraticCurveConnector")
			return new quadraticCurveConnector(option? option: {});
		else if(type==="relationConnector")
			return new relationConnector(option? option: {});
		else if(type==="referenceConnector")
			return new referenceConnector(option? option: {});
		else if(type==="mapConnector")
			return new mapConnector(option? option: {});
		else 
			return new widget(option?option:{});
	};
	
	_connector=function(option){
		var opt={
				border:{
					width:1,
					type:"solid",
					color:"black"
				},
				offsetX:35,
				offsetY:35,
				minOffset:20,
				dashOffset:0,
				dashColor:"green",
				corner:null,
				selectable:false,
				linefixed:false,
				linecap:"round"//butt,square
			};
		$.extend(opt,option);	
		$.extend(this,new widget(opt));
		this.allowconnectionPoint=false;		
		this.appendPresenter = function(presenter) {
			this.parent=presenter.rootwidget;
			this.root=presenter.rootwidget;
			presenter.widgets.push(this);
			this.depth = presenter.widgets.length;			
			this.presenters.push(presenter);
			if(this.begin&&this.begin.widget&&this.end&&this.end.widget){
				this.paint();
			}
			return this;
		};
		
	
		this.persist=function(){
			var r=widget.persistproperty(this);
			r.offsetX=this.offsetX;
			r.offsetY=this.offsetY;
			r.linecap=this.linecap;
			r.minOffset=this.minOffset;
			r.dashOffset=this.dashOffset;
			r.begin=this.begin.persist();
			r.end=this.end.persist();			
			return r;
		};
		this.appendPresenter = function(presenter) {
			this.parent=presenter.rootwidget;
			this.root=presenter.rootwidget;
			presenter.widgets.push(this);
			this.depth = presenter.widgets.length;
			this.presenters.push(presenter);
			if(!presenter.globalAnimations)
				presenter.globalAnimations=[];				
			presenter.globalAnimations.push(this);
			return this;
		};
		this.run=function(frameSpeed){
				var ths=this;
		    	var startValues={dashOffset:0};
		    	var endValues={dashOffset:20};
		    	var tweenA=new TWEEN.Tween(startValues).to(endValues, 1000).delay(0).repeat(Infinity).easing(TWEEN.Easing.Linear.None).onUpdate(function(){	    	  
				      for(var s in startValues){
				      		ths[s]=parseInt(this[s]);
				      }
			     	}).onComplete(function(){
			      	 	      	 
			     	});
		    	tweenA.start();
		};		
		return this;
	};
	
	brokenLineConnector=function(option){
		var opt={
				name:"brokenLineConnector",
				width:150,
				height:50,
				linefixed:false,
				text:"brokenLineConnector"
					
		};
		
		$.extend(opt,option);	
		$.extend(this,new _connector(opt));
		this.propertyEditors=["common","border","arrow"];
		this.begin=new endpoint(option.begin);
		this.end=new endpoint(option.end);
		this.type="brokenLineConnector";
		
		
         this.checkPointIn =function(x, y,scale) {
     		if(this.root!=null)
     			scale=scale||this.root.scale;
     		if(!scale)
     			scale=1;
     		var _xc = this.relativePoint(x, y,scale);
     		var x2 = _xc.x;
     		var y2 = _xc.y;
     		var result=false;
     		for(var i=0;i<this.resizers.length-1;i++){     			
     			result=math.isPointOnLine(x2,y2,this.resizers[i].x*scale,this.resizers[i].y*scale,this.resizers[i+1].x*scale,this.resizers[i+1].y*scale);
     			if(result==true){
     				return true;
     			}
			}
     		return false;
         };
		
		this.persist=function(){
			var r=widget.persistproperty(this);
			r.offsetX=this.offsetX;
			r.offsetY=this.offsetY;
			r.linecap=this.linecap;
			r.minOffset=this.minOffset;
			r.begin=this.begin.persist();
			r.end=this.end.persist();
			r.begin.position=this.begin.position;
			r.end.position=this.end.position;
			//r.resizers=this.resizers;
			return r;
		};
		
		this.setResizers=function(){
			var l=16;
			var sp={
					x:this.begin.x+this.begin.widget.x,
					y:this.begin.y+this.begin.widget.y,
			},
			ep={
					x:this.end.x+this.end.widget.x,
					y:this.end.y+this.end.widget.y
			};
			if(this.begin.widget.x+this.begin.widget.width<this.end.widget.x+this.end.x){ //1,2	
				if(!this.end.position)
					this.end.position="left";
				if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y+this.end.y)//1
				{
					if(this.begin.position==="top"){
						sp.y=this.begin.widget.y;
						this.end.position="top";
						ep.y=this.end.widget.y+this.end.offsety;
					}
					else if(this.begin.position==="left"){
						this.end.position="left";
						sp.x=this.begin.widget.x;
						ep.x=this.end.widget.x+this.end.offsetx;
					}					
					else if(this.begin.position==="right"){
						sp.x=this.begin.widget.x+this.begin.widget.width;
						if(this.begin.widget.x+this.begin.widget.width>this.end.widget.x-l){
							this.end.position="top";
							ep.y=this.end.widget.y+this.end.offsety;
						}
						else if(this.begin.widget.y+this.begin.y>this.end.widget.y-l){
							this.end.position="left";
							ep.x=this.end.widget.x+this.end.offsetx;
						}
					}
					else{//bottom
						sp.y=this.begin.widget.y+this.begin.widget.height;
						if(this.begin.widget.y+this.begin.widget.height>this.end.widget.y-l){
							this.end.position="left";
							ep.x=this.end.widget.x+this.end.offsetx;
						}
						else if(this.begin.widget.x+this.begin.x>this.end.widget.x-l){
							this.end.position="top";
							ep.y=this.end.widget.y+this.end.offsety;
						}						
					}
					if(this.end.position=="left"){
						ep.x=this.end.widget.x+this.end.offsetx;
					}
					else if(this.end.position==="right"){
				    	this.end.position="left";
				    	ep.x=this.end.widget.x+this.end.offsetx;
				    }
				    else if(this.end.position=="top"){
				    	ep.y=this.end.widget.y+this.end.offsety;
				    }
				    else if(this.end.position=="bottom"){
				    	this.end.position="top";
				    	ep.y=this.end.widget.y+this.end.offsety;
				    }
				    
				}
				else if(this.begin.widget.y>this.end.widget.y+this.end.y)//2
				{
					if(this.begin.position==="bottom"){
						sp.y=this.begin.widget.y+this.begin.widget.height;
						this.end.position="bottom";
						ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
					}
					else if(this.begin.position==="left"){
						this.end.position="left";
						sp.x=this.begin.widget.x;
						ep.x=this.end.widget.x+this.end.offsetx;
					}					
					else if(this.begin.position==="right"){
						sp.x=this.begin.widget.x+this.begin.widget.width;
						if(this.begin.widget.x+this.begin.widget.width>this.end.widget.x-l){
							this.end.position="bottom";
							ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
						}
						else if(this.begin.widget.y+this.begin.y<this.end.widget.y+this.end.widget.height-l){
							this.end.position="left";
							ep.x=this.end.widget.x+this.end.offsetx;
							
						}
					}
					else{//top
						sp.y=this.begin.widget.y;
						if(this.begin.widget.y<this.end.widget.y+this.end.widget.height+l){
							this.end.position="left";
							ep.x=this.end.widget.x+this.end.offsetx;
						}
						else if(this.begin.widget.x+this.begin.x>this.end.widget.x-l){
							this.end.position="bottom";
							ep.y=this.end.widget.y-this.end.offsety;
						}
						
					}
					if(this.end.position=="left"){
						ep.x=this.end.widget.x+this.end.offsetx;
					}
					else if(this.end.position=="right"){
						this.end.position="left";
						ep.x=this.end.widget.x+this.end.offsetx;
					}
				    else if(this.end.position=="bottom") {
				    	ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
				    }
				    else if(this.end.position=="top") {
				    	this.end.position="bottom";
				    	ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
				    }
				}
				else{ //左右机构
					if(this.begin.position==="top"){	
						this.end.position="top";
						ep.y=this.end.widget.y+this.end.offsety;
						sp.y=this.begin.widget.y;
					}
					else if(this.begin.position==="bottom"){							
						this.end.position="bottom";	
						ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
						sp.y=this.begin.widget.y+this.begin.widget.height;
					}
					else{
						sp.x=this.begin.widget.x+this.begin.widget.width;
						this.begin.position="right";
						ep.x=this.end.widget.x+this.end.offsetx;
						this.end.position="left";
					}						
				}
			}
			else if(this.end.widget.x+this.end.widget.width<this.begin.widget.x+this.begin.x){//3,4
				//console.info("right-left");
				if(!this.end.position)
					this.end.position="right";
				if(this.begin.widget.y>this.end.widget.y+this.end.y){//4
					//console.info("4");
					if(this.begin.position==="bottom"){
						sp.y=this.begin.widget.y+this.begin.widget.height;
						this.end.position="bottom";
						ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
					}
					else if(this.begin.position==="right"){
						this.end.position="right";
						sp.x=this.begin.widget.x+this.begin.widget.width;
						ep.x=this.end.widget.x+this.end.widget.width;
					}					
					else if(this.begin.position==="left"){
						sp.x=this.begin.widget.x;
						if(this.begin.widget.x-l<this.end.widget.x+this.end.widget.width){
							this.end.position="bottom";
							ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
						}
						else if(this.begin.widget.y+this.begin.y<this.end.widget.y+this.end.widget.height-l){
							this.end.position="right";
							ep.x=this.end.widget.x+this.end.widget.width;
						}
					}
					else{//top
						sp.y=this.begin.widget.y;
						if(this.begin.widget.y<this.end.widget.y+this.end.widget.height-l){
							this.end.position="right";
							ep.x=this.end.widget.x+this.end.widget.width;
						}
						else if(this.begin.widget.x+this.begin.x<this.end.widget.x+this.end.widget.width+l){
							this.end.position="bottom";
							ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
						}
					}
					if(this.end.position=="right"){
						ep.x=this.end.widget.x+this.end.widget.width;
					}
					else if(this.end.position=="left"){
						this.end.position="right";
						ep.x=this.end.widget.x+this.end.widget.width;
					}
				    else if(this.end.position=="bottom") {
				    	ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
				    }
				    else if(this.end.position=="top") {
				    	this.end.position="bottom";
				    	ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
				    }
				}
				else if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y+this.end.y)//3
				{
					if(this.begin.position==="top"){
						sp.y=this.begin.widget.y;
						this.end.position="top";
						ep.y=this.end.widget.y+this.end.offsety;
					}
					else if(this.begin.position==="right"){
						this.end.position="right";
						sp.x=this.begin.widget.x+this.begin.widget.width;
						ep.x=this.end.widget.x+this.end.widget.width;
					}					
					else if(this.begin.position==="left"){
						sp.x=this.begin.widget.x;
						if(this.begin.widget.x<this.end.widget.x+this.end.widget.width+l){
							this.end.position="top";
							ep.y=this.end.widget.y+this.end.offsety;
						}
						else if(this.begin.widget.y+this.begin.y>this.end.widget.y){
							this.end.position="right";
							ep.x=this.end.widget.x+this.end.widget.width;
						}
					}
					else{//bottom
						if(this.end.position!=="bottom"){
							sp.y=this.begin.widget.y+this.begin.widget.height;
							if(this.begin.widget.y+this.begin.widget.height>this.end.widget.y){
								this.end.position="right";
								ep.x=this.end.widget.x+this.end.widget.width;
							}
							else if(this.begin.widget.x+this.begin.x<this.end.widget.x+this.end.widget.width+l){
								this.end.position="top";
								ep.y=this.end.widget.y+this.end.offsety;
							}
						}
						else{
							sp.y=this.begin.widget.y+this.begin.widget.height;
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
						}
						
					}
					if(this.end.position==="right"){
						ep.x=this.end.widget.x+this.end.widget.width;
					}
					else if(this.end.position==="left"){
						this.end.position="right";
						ep.x=this.end.widget.x+this.end.widget.width;
					}
				    else if(this.end.position=="top") {
				    	ep.y=this.end.widget.y+this.end.offsety;
				    }
				    else if(this.end.position=="bottom") {
				    	this.end.position="top";
				    	ep.y=this.end.widget.y+this.end.offsety;
				    }
				}
				else{//左右机构
					if(this.begin.position==="top"){	
							this.end.position="top";
							ep.y=this.end.widget.y+this.end.offsety;
							sp.y=this.begin.widget.y;
					}
					else if(this.begin.position==="bottom"){
							this.end.position="bottom";
							ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
							sp.y=this.begin.widget.y+this.begin.widget.height;
					}
					else{
						sp.x=this.begin.widget.x;
						this.begin.position="left";
						ep.x=this.end.widget.x+this.end.widget.width;
						this.end.position="right";
					}
				}
			}
			else{//上下结构
				//console.info("top-bottom");
				if(this.begin.position==="left"){
						this.end.position="left";
						ep.x=this.end.widget.x+this.end.offsetx;
						sp.x=this.begin.widget.x;
				}
				else if(this.begin.position==="right"){
						this.end.position="right";
						ep.x=this.end.widget.x+this.end.widget.width;
						sp.x=this.begin.widget.x+this.begin.widget.width;
				}				
				else if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
					this.begin.position="bottom";
					sp.y=this.begin.widget.y+this.begin.widget.height;
					this.end.position="top";
					ep.y=this.end.widget.y+this.end.offsety;
				}
				else{
					sp.y=this.begin.widget.y;
					this.begin.position="top";
					ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
					this.end.position="bottom";
				}
			}
			var MIN_OFFSET=30;
			this.x=Math.min(sp.x,ep.x);
			this.y=Math.min(sp.y,ep.y);
			this.width=Math.abs(ep.x-sp.x);
			this.height=Math.abs(ep.y-sp.y);
			var point1={
					x:sp.x-this.x,
					y:sp.y-this.y,
					cursor:"move",
					visible:true
			},
			point2={
					x:ep.x-this.x,
					y:ep.y-this.y,
					cursor:"move",
					visible:true
			};
			if((this.begin.position==this.end.position)&&this.begin.position==="right"){
				this.width=this.width+this.offsetX;
			}
			if((this.begin.position==this.end.position)&&this.begin.position==="left"){
				this.width=this.width+this.offsetX;
//				this.x=this.x-this.offsetX;
			}
			
			if((this.begin.position==this.end.position)&&this.begin.position==="top"){
				this.height=this.height+this.offsetY;
//				this.y=this.y-this.offsetY;
			}
			if((this.begin.position==this.end.position)&&this.begin.position==="bottom"){
				this.height=this.height+this.offsetY;
			}
			this.sp=point1;
			this.ep=point2;
			if(((point1.x===point2.x)||(point1.y===point2.y))&&(this.begin.position!=this.end.position)){
				this.resizers=[point1,point2];
			}
			else{
				if(this.begin.position==="top"||this.begin.position==="bottom"){
					if((this.end.position==="top"||this.end.position==="bottom")&&(this.end.position!=this.begin.position)){
						var point3={
								x:point1.x,
								y:this.offsetY,
								visible:true
						};
						var point4={
								x:point2.x,
								y:this.offsetY,
								visible:true
						};
						if(this.linefixed){
							if(this.begin.position=="bottom"){
								point3={
										x:point1.x,
										y:Math.max(this.height/3,MIN_OFFSET),
										visible:true
								};
								point4={
										x:point2.x,
										y:this.height-Math.max(this.height/3,MIN_OFFSET),
										visible:true
								};
							}
							else{
								point3={
										x:point1.x,
										y:this.height-Math.max(this.height/3,MIN_OFFSET),
										visible:true
								};
								point4={
										x:point2.x,
										y:Math.max(this.height/3,MIN_OFFSET),
										visible:true
								};
							}
						}
						this.resizers=[point1,point3,point4,point2];
					}
					else if(this.end.position==="top"&&this.end.position===this.begin.position){
						var point3={
								x:point1.x,
								y:Math.min(point1.y,point2.y)-Math.max(this.offsetY,MIN_OFFSET),								
								visible:true
						};
						var point4={
								x:point2.x,
								y:Math.min(point1.y,point2.y)-Math.max(this.offsetY,MIN_OFFSET),
								visible:true
						};
						this.resizers=[point1,point3,point4,point2];
						
					}
					else if(this.end.position==="bottom"&&this.end.position===this.begin.position){
						var point3={
								x:point1.x,
								y:Math.max(this.height,MIN_OFFSET),								
								visible:true
						};
						var point4={
								x:point2.x,
								y:Math.max(this.height,MIN_OFFSET),								
								visible:true
						};
						this.resizers=[point1,point3,point4,point2];
					}
					else{
						var point3={
								x:point1.x,
								y:point2.y,
								visible:true
						};	
						this.resizers=[point1,point3,point2];
					}
				}
				else if(this.begin.position==="right"||this.begin.position==="left"){
					if((this.end.position==="right"||this.end.position==="left")&&(this.end.position!=this.begin.position)){
						var point3={
								x:this.offsetX,
								y:point1.y,
								visible:true
						};
						var point4={
								x:this.offsetX,
								y:point2.y,
								visible:true
						};
						if(this.linefixed){
							if(this.begin.position==="right"){
								point3={
										x:Math.max(this.width/3,MIN_OFFSET),
										y:point1.y,
										visible:true
								};
								point4={
										x:this.width-Math.max(this.width/3,MIN_OFFSET),
										y:point2.y,
										visible:true
								};
							}
							else{
								point4={
										x:Math.max(this.width/3,MIN_OFFSET),
										y:point2.y,
										visible:true
								};
								point3={
										x:this.width-Math.max(this.width/3,MIN_OFFSET),
										y:point1.y,
										visible:true
								};
							}
						}
						this.resizers=[point1,point3,point4,point2];
					}
					else if((this.end.position==="left")&&(this.end.position===this.begin.position)){
						var point3={
								x:Math.min(point1.x,point2.x)-Math.max(this.offsetX,MIN_OFFSET),
								y:point1.y,
								visible:true
						};
						var point4={
								x:Math.min(point1.x,point2.x)-Math.max(this.offsetX,MIN_OFFSET),
								y:point2.y,
								visible:true
						};
						//this.x=Math.min(point3.x,point4.x);
						this.resizers=[point1,point3,point4,point2];
					}
					else if((this.end.position==="right")&&(this.end.position===this.begin.position)){
						var point3={
								x:Math.max(this.width,MIN_OFFSET),
								y:point1.y,
								visible:true
						};
						var point4={
								x:Math.max(this.width,MIN_OFFSET),
								y:point2.y,
								visible:true
						};
						this.resizers=[point1,point3,point4,point2];
					}
					else{
						var point3={
								x:point2.x,
								y:point1.y,
								visible:true
						};	
						this.resizers=[point1,point3,point2];
					}
				}
			}
		};
	
		this.resize=function(e){
			var offsetX=e.offset.x;
			var offsetY=e.offset.y;
			this.resizer=e.resizer-1;
			if(this.resizer==0){
				this.begin.x+=offsetX;
				this.begin.y+=offsetY;
				if(this.begin.widget.x+this.begin.widget.width<this.end.widget.x+this.end.x){
					//console.info("resize left-right");
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y+this.end.y){//1
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.position="right";
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
						}
						if(this.begin.y<0)
							this.begin.y=this.begin.widget.margin;
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.position="bottom";
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
						}
					}
					else if(this.end.widget.y+this.end.y<this.begin.widget.y){
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.position="right";							
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
						}
						if(this.begin.y<0){
							this.begin.position="top";
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
					else{ //左右结构
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.position="right";
							this.begin.x=this.begin.widget.width/2;
							this.end.position="left";
							this.end.y=this.end.widget.height/2;
						}
						if(this.begin.y<0){
							this.begin.position="top";
							this.end.position="top";							
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;						
							this.end.x=this.end.widget.width/2;
							this.end.y=this.end.widget.height/2;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.position="bottom";
							this.end.position="bottom";	
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;						
							this.end.x=this.end.widget.width/2;
							this.end.y=this.end.widget.height/2;
						}
						
					}
				}
				else if(this.end.widget.x+this.end.x<this.begin.widget.x){
					//console.info("resize-right--left");
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y+this.end.y){//3
						if(this.begin.x<0){
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
						    this.begin.position="left";
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0)
							this.begin.y=this.begin.widget.margin;
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.position="bottom";
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
						}
						
					}
					else if(this.end.widget.y+this.end.y<this.begin.widget.y){//4
						if(this.begin.x<0){
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
						    this.begin.position="left";
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
							this.begin.position="top";
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
					else{//左右结构 2
						if(this.begin.x<0){
							this.begin.position="left";
							this.begin.x=0;
							this.end.position="right";
							this.end.y=this.end.widget.height/2;
						  		
						}
						else if(this.begin.x>this.begin.widget.width){
							  this.begin.x=this.begin.widget.width;			
						}
						if(this.begin.y<0){
							this.begin.position="top";
							this.end.position="top";							
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;						
							this.end.x=this.end.widget.width/2;
							this.end.y=this.end.widget.height/2;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.position="bottom";
							this.end.position="bottom";	
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;						
							this.end.x=this.end.widget.width/2;
							this.end.y=this.end.widget.height/2;
						}
					}
				}
				else{
					//console.info("resize-top--bottom");
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){  //0-上下结构
						if(this.begin.position!="bottom"){
							if(this.begin.y>this.begin.widget.height){
								this.begin.y=this.begin.widget.height/2;
								this.begin.x=this.begin.widget.width/2;
								this.end.x=this.end.widget.width/2;
								this.begin.position="bottom";
								this.end.position="top";
							}	
							else if(this.begin.y<0)
								this.begin.y=this.begin.widget.margin;
						}
						else{
							if(this.begin.x<0){
							    this.begin.x=0;	
							    this.begin.position="left";
							    this.end.position="left";
								this.begin.y=this.begin.widget.height/2;
								this.end.y=this.end.widget.height/2;
							}
							else if(this.begin.x>this.begin.widget.width){
								this.begin.x=this.begin.widget.width/2;
								this.begin.position="right";
								this.end.position="right";
								this.begin.y=this.begin.widget.height/2;
								this.end.y=this.end.widget.height/2;
							}
						}
					}					
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y)
					{
						if(this.begin.position!="top"){
							if(this.begin.y<0){
								this.begin.position="top";
								this.end.position="bottom";
								this.end.y=this.end.widget.height/2;
								this.end.x=this.end.widget.width/2;
								this.begin.x=this.begin.widget.width/2;							
								this.begin.y=this.begin.widget.height/2;
							}
						}
						else{
							if(this.begin.x<0){
								this.begin.x=this.begin.widget.width/2;
							    this.end.position="left";
							    this.begin.position="left";
							    this.begin.y=this.begin.widget.height/2;
							    this.end.y=this.end.widget.height/2;
							   
							}
							else if(this.begin.x>this.begin.widget.width){
								this.begin.x=this.begin.widget.width/2;
								this.begin.position="right";
								this.end.position="right";
								this.begin.y=this.begin.widget.height/2;
								this.end.y=this.end.widget.height/2;
							}
							else if(this.begin.y>this.begin.widget.height)
								this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
				}
			}
			else if(this.resizer==this.resizers.length-1){
				this.end.x+=offsetX;
				this.end.y+=offsetY;
				if(this.begin.widget.x+this.begin.x<this.end.widget.x){//1,2
					//console.info("resize left-right");
					if(this.begin.widget.y+this.begin.y<this.end.widget.y){//1
						if(this.end.x<0){
							this.end.position="left";
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
						}
						else if(this.end.x>this.end.widget.width)
							this.end.x=this.end.widget.width-this.end.widget.margin;
						if(this.end.y<0){
							this.end.position="top";
							this.end.x=this.end.widget.width/2;
							this.end.y=this.end.widget.height/2;
						}
						else if(this.end.y>this.end.widget.height)
							this.end.y=this.end.widget.height-this.end.widget.margin;
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y+this.begin.y){//2
						if(this.end.x<0){
							this.end.position="left";
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
						}
						else if(this.end.x>this.end.widget.width)
							this.end.x=this.end.widget.width-this.end.widget.margin;							
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
						}
						else if(this.end.y>this.end.widget.height){
							this.end.position="bottom";
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
						}
					}
					else{//左右结构1
						if(this.end.x<0){
							this.end.position="left";
							this.begin.position="right";
							this.begin.y=this.begin.widget.height/2;
						  		
						}
						else if(this.end.x>this.end.widget.width){
							  this.end.x=this.end.widget.width;			
						}
						if(this.end.y<0){
							this.begin.position="top";
							this.end.position="top";							
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
							this.begin.x=this.begin.widget.width/2;
						}
						else if(this.end.y>this.end.widget.height)
						{
							this.begin.position="bottom";
							this.end.position="bottom";	
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
							this.begin.x=this.begin.widget.width/2;
						}
						
					}
				}
				else if(this.end.widget.x+this.end.widget.width<this.begin.widget.x+this.begin.x){//3,4
					//console.info("resize right-left");
					if(this.begin.widget.y+this.begin.y<this.end.widget.y){//3
						if(this.end.x<0){
							this.end.x=this.end.widget.margin;
						}
						else if(this.end.x>this.end.widget.width){
							this.end.position="right";
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
						}
						if(this.end.y<0){
							this.end.position="top";							
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
						}
						else if(this.end.y>this.end.widget.height){
							this.begin.position="bottom";
							this.end.position="bottom";	
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
							this.begin.x=this.begin.widget.width/2;
						}
					}
					else if(this.begin.widget.y+this.begin.y>this.end.widget.y+this.end.widget.height){//4
						//console.info("4");
						if(this.end.x<0){
							this.end.x=this.end.widget.margin;
						}
						else if(this.end.x>this.end.widget.width){
							this.end.position="right";
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
						}
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
						}
						else if(this.end.y>this.end.widget.height){
							this.end.y=this.end.widget.height/2;
							this.end.position="bottom";
						}
					}
					else{
						if(this.end.x<0){
						    this.end.x=this.end.widget.margin;					
						}
						else if(this.end.x>this.end.widget.width){
							this.end.position="right";
							this.end.x=this.end.widget.width/2;
							this.begin.position="left";
							this.begin.y=this.begin.widget.height/2;
						}
						if(this.end.y<0){
							this.end.position="top";
							this.begin.position="top";							
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
							this.begin.x=this.begin.widget.width/2;
						}
						else if(this.end.y>this.end.widget.height)
						{
							this.begin.position="bottom";
							this.end.position="bottom";	
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
							this.begin.x=this.begin.widget.width/2;
						}
					}
				}
				else{//end-上下结构
					//console.info("resize-top--bottom");
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y) 
					{
						if(this.end.position!="top"){
							if(this.end.y<0){
								this.end.y=this.end.widget.height/2;
								this.end.x=this.end.widget.width/2;
								this.begin.x=this.begin.widget.width/2;
								this.begin.y=this.begin.widget.height/2;
								this.end.position="top";
								this.begin.position="bottom";
							}							
							else if(this.end.y>this.end.widget.height){
								this.end.y=this.end.widget.height;
							}
						}
						else{
							if(this.end.x<0){
								this.begin.position="left";
								this.end.position="left";
								this.end.x=this.end.widget.width/2;
								this.end.y=this.end.widget.height/2;
								this.begin.y=this.begin.widget.height/2;								
							}							
							else if(this.end.x>this.end.widget.width){
								this.end.x=this.end.widget.width;
								this.end.y=this.end.widget.margin;
								this.begin.y=this.begin.widget.height/2;
								this.begin.position="right";
								this.end.position="right";
							}
						}
					}
					if(this.end.widget.y+this.end.widget.height<this.begin.widget.y) 
					{
						if(this.end.position!="bottom"){
							if(this.end.y>this.end.widget.height){
								this.end.x=this.end.widget.width/2;
								this.end.y=this.end.widget.height/2;
								this.begin.y=this.begin.widget.height/2;								
								this.begin.x=this.begin.widget.width/2;
								this.end.position="bottom";
								this.begin.position="top";								
							}	
							else if(this.end.y<0){
								this.end.y=0;
							}
						}
						else{
							if(this.end.x<0){
							    this.begin.position="left";
							    this.end.position="left";
							    this.end.x=this.end.widget.width/2;
								this.end.y=this.end.widget.height/2;
								this.begin.y=this.begin.widget.height/2;								
								this.begin.x=this.begin.widget.width/2;	
							}
							else if(this.end.x>this.end.widget.width){
								this.begin.position="right";
								this.end.position="right";
								this.end.x=this.end.widget.width/2;
								this.end.y=this.end.widget.height/2;
								this.begin.y=this.begin.widget.height/2;								
								this.begin.x=this.begin.widget.width/2;
							}
						}
					}
				}
			}
			else{
				if(this.resizer==1){
					if(this.begin.position==="top"||this.begin.position==="bottom"){
						if(this.begin.position!=this.end.position){
							this.begin.x+=offsetX;
							this.offsetY+=offsetY;
							if(this.begin.x<this.begin.widget.margin)
								this.begin.x=this.begin.widget.margin;
							else if(this.begin.x>this.begin.widget.width)
								this.begin.x=this.begin.widget.width-this.begin.widget.margin;
							if(this.offsetY<this.minOffset)
								this.offsetY=this.minOffset;
							else if(this.offsetY>this.height-this.minOffset)
								this.offsetY=this.height-this.minOffset;	
						}
						else if(this.begin.position===this.end.position && this.begin.position==="top"){
							this.begin.x+=offsetX;
							this.offsetY-=offsetY;
							if(this.offsetY<this.minOffset)
								this.offsetY=this.minOffset;
							if(this.begin.x<this.begin.widget.margin)
								this.begin.x=this.begin.widget.margin;
							else if(this.begin.x>this.begin.widget.width-this.begin.widget.margin)
								this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						else if(this.begin.position===this.end.position && this.begin.position==="bottom"){
							this.begin.x+=offsetX;							
							this.offsetY+=offsetY;
							if(this.offsetY<this.minOffset)
								this.offsetY=this.minOffset;
							if(this.begin.x<this.begin.widget.margin)
								this.begin.x=this.begin.widget.margin;
							else if(this.begin.x>this.begin.widget.width-this.begin.widget.margin)
								this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
					}
					else if(this.begin.position==="right"||this.begin.position==="left"){
						if(this.begin.position!=this.end.position){
							this.begin.y+=offsetY;
							this.offsetX+=offsetX;
							if(this.begin.y<this.begin.widget.margin)
								this.begin.y=this.begin.widget.margin;
							else if(this.begin.y>this.begin.widget.height-this.begin.widget.margin)
								this.begin.y=this.begin.widget.height-this.begin.widget.margin;
							if(this.offsetX<this.minOffset)
								this.offsetX=this.minOffset;
							else if(this.offsetX>this.width-this.minOffset)
								this.offsetX=this.width-this.minOffset;
						}
						else if (this.begin.position===this.end.position && this.begin.position==="right"){
							this.offsetX+=offsetX;
							this.begin.y+=offsetY;
							if(this.offsetX<this.minOffset)
								this.offsetX=this.minOffset;
							if(this.begin.y<this.begin.widget.margin)
								this.begin.y=this.begin.widget.margin;
							else if(this.begin.y>this.begin.widget.height-this.begin.widget.margin)
								this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
						else if (this.begin.position===this.end.position && this.begin.position==="left"){
							this.offsetX-=offsetX;	
							this.begin.y+=offsetY;
							if(this.offsetX<this.minOffset)
								this.offsetX=this.minOffset;
							if(this.begin.y<this.begin.widget.margin)
								this.begin.y=this.begin.widget.margin;
							else if(this.begin.y>this.begin.widget.height-this.begin.widget.margin)
								this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
				}
				else if(this.resizer==2){
					if(this.end.position==="top"||this.end.position==="bottom"){
						if(this.begin.position!=this.end.position){
							this.end.x+=offsetX;
							this.offsetY+=offsetY;
							if(this.end.x<this.end.widget.margin)
								this.end.x=this.end.widget.margin;
							else if(this.end.x>this.end.widget.width-this.end.widget.margin)
								this.end.x=this.end.widget.width-this.end.widget.margin;
							if(this.offsetY<this.minOffset)
								this.offsetY=this.minOffset;
							else if(this.offsetY>this.height-this.minOffset)
								this.offsetY=this.height-this.minOffset;	
						}
						else if(this.begin.position===this.end.position && this.begin.position==="top"){
							this.end.x+=offsetX;
							this.offsetY-=offsetY;
							if(this.offsetY<this.minOffset)
								this.offsetY=this.minOffset;
							if(this.end.x<this.end.widget.margin)
								this.end.x=this.end.widget.margin;
							else if(this.end.x>this.end.widget.width-this.end.widget.margin)
								this.end.x=this.end.widget.width-this.end.widget.margin;
						}
						else if(this.begin.position===this.end.position && this.begin.position==="bottom"){
							this.end.x+=offsetX;							
							this.offsetY+=offsetY;
							if(this.offsetY<this.minOffset)
								this.offsetY=this.minOffset;
							if(this.end.x<this.end.widget.margin)
								this.end.x=this.end.widget.margin;
							else if(this.end.x>this.end.widget.width-this.end.widget.margin)
								this.end.x=this.end.widget.width-this.end.widget.margin;
						}
					}
					else if(this.end.position==="right"||this.end.position==="left"){
						if(this.begin.position!=this.end.position){
							this.end.y+=offsetY;
							this.offsetX+=offsetX;
							if(this.end.y<this.end.widget.margin)
								this.end.y=this.end.widget.margin;
							else if(this.end.y>this.end.widget.height-this.end.widget.margin)
								this.end.y=this.end.widget.height-this.end.widget.margin;
							if(this.offsetX<this.minOffset)
								this.offsetX=this.minOffset;
							else if(this.offsetX>this.width-this.minOffset)
								this.offsetX=this.width-this.minOffset;		
						}
						else if (this.begin.position===this.end.position && this.begin.position==="right"){
							this.offsetX+=offsetX;	
							this.end.y+=offsetY;
							if(this.offsetX<this.minOffset)
								this.offsetX=this.minOffset;
							if(this.end.y<this.end.widget.margin)
								this.end.y=this.end.widget.margin;
							else if(this.end.y>this.end.widget.height-this.end.widget.margin)
								this.end.y=this.end.widget.height-this.end.widget.margin;
						}
						else if (this.begin.position===this.end.position && this.begin.position==="left"){
							this.offsetX-=offsetX;	
							this.end.y+=offsetY;
							if(this.offsetX<this.minOffset)
								this.offsetX=this.minOffset;
							if(this.end.y<this.end.widget.margin)
								this.end.y=this.end.widget.margin;
							else if(this.end.y>this.end.widget.height-this.end.widget.margin)
								this.end.y=this.end.widget.height-this.end.widget.margin;
						}
					}
				}
			}
		};
	
		this.paintTo=function(canvas){
			var ctx=canvas.getContext("2d");
			ctx.save();
			ctx.scale(this.scaleX,this.scaleY);
			ctx.globalAlpha = this.alpha;		
			this.setResizers();
			ctx.translate(this.x, this.y);
			ctx.globalCompositeOperation="source-over";
			ctx.rotate(this.rotate / 180 * Math.PI);
			ctx.lineJoin="round";
			ctx.lineCap="round";
		
			if(this.beforePaint)
				this.beforePaint(ctx);
			
			if(this.begin.widget.focus||this.end.widget.focus){
				this.drawImageTo(ctx,true);	
			}
			else
				this.drawImageTo(ctx);	
			if(this.focus){				
				if(this.editable&&!this.autosize)
				  this.drawResizerTo(ctx);
			}
			ctx.restore();
		};
		
		this.drawImageTo = function(ctx,focus){
			focus=focus||false;
			ctx.save();
			ctx.beginPath();
			var dx=0.5;
			if(this.begin.position==="bottom"){
				this.resizers[0].y=	this.resizers[0].y+this.border.width/2;
			}
			else if(this.begin.position==="top"){
				this.resizers[0].y=this.resizers[0].y-this.border.width/2;
			}
			else if(this.begin.position==="left"){
				this.resizers[0].x=this.resizers[0].x-this.border.width/2;
			}
			else if(this.begin.position==="right"){
				this.resizers[0].x=this.resizers[0].x+this.border.width/2;				
			}
			
			var _length=this.resizers.length-1;
			if(this.end.position==="bottom")			
				this.resizers[_length].y=this.resizers[_length].y+this.border.width/2;
			else if(this.end.position==="top")
				this.resizers[_length].y=this.resizers[_length].y-this.border.width/2;
			else if(this.end.position==="left")
				this.resizers[_length].x=this.resizers[_length].x-this.border.width/2;
			else if(this.end.position==="right")
				this.resizers[_length].x=this.resizers[_length].x+this.border.width/2;
			if(!focus){
				ctx.strokeStyle=this.border.color;
				ctx.fillStyle=this.border.color;
				ctx.lineWidth=this.border.width;			
				ctx.lineCap=this.linecap;
				if(this.border.type!="solid"){
					var dashList =this.border.type==="dashed"?[this.border.width+5, this.border.width+2]:[this.border.width+2,this.border.width+2]; 
					ctx.setLineDash(dashList);
				};
			}
			else{
				ctx.strokeStyle=this.dashColor;
				ctx.fillStyle=this.dashColor;
				ctx.lineWidth=this.border.width;
				ctx.lineCap=this.linecap;
				if(!this.editable){
					var dashList =[this.border.width+4, this.border.width+7]; 
					ctx.setLineDash(dashList);
					ctx.lineDashOffset = -this.dashOffset;					
				}
				else
					ctx.lineWidth=this.border.width+1;
				
			}
			ctx.moveTo(parseInt(this.resizers[0].x)+dx,parseInt(this.resizers[0].y)+dx);		
			
			for(var i=1;i<this.resizers.length;i++){
				ctx.lineTo(parseInt(this.resizers[i].x)+dx,parseInt(this.resizers[i].y)+dx);
			}				
			ctx.stroke();
			
			if(this.begin.shape.name==="arrow"){
				$.drawArrow(ctx,this.resizers[1],this.resizers[0],this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});				
			}	
			else if(this.begin.shape.name==="diamond"){
				$.drawDiamond(ctx,this.resizers[1],this.resizers[0],this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});				
			}	
			else if(this.begin.shape.name==="dot")
			{
				ctx.beginPath();
				ctx.arc(this.resizers[0].x,this.resizers[0].y,this.begin.shape.radius,0,2*Math.PI);
				ctx.stroke();
				if(this.begin.shape.type===2)
				  ctx.fill();
				else if(this.begin.shape.type===3){
					ctx.fillStyle="white";
					ctx.fill();
					ctx.fillStyle=this.border.color;
				}
			}
			
			//ctx.fillStyle=this.border.color;
			if(this.end.shape.name==="arrow"){
				if(this.resizers.length===2)
					$.drawArrow(ctx,this.resizers[0],this.resizers[1],this.end.shape.type,{size:this.end.shape.size,shape:this.end.shape.sharp});
				else if(this.resizers.length===3)
					$.drawArrow(ctx,this.resizers[1],this.resizers[2],this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
				else if(this.resizers.length===4)
					$.drawArrow(ctx,this.resizers[2],this.resizers[3],this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
				
			}
			else if(this.end.shape.name==="diamond"){
				if(this.resizers.length===2)
					$.drawDiamond(ctx,this.resizers[0],this.resizers[1],this.end.shape.type,{size:this.end.shape.size,shape:this.end.shape.sharp});
				else if(this.resizers.length===3)
					$.drawDiamond(ctx,this.resizers[1],this.resizers[2],this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
				else if(this.resizers.length===4)
					$.drawDiamond(ctx,this.resizers[2],this.resizers[3],this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
			}	
			else if(this.end.shape.name==="dot")
			{
				ctx.beginPath();
				ctx.arc(this.ep.x,this.ep.y,this.end.shape.radius,0,2*Math.PI);
				ctx.stroke();
				if(this.end.shape.type===2)
				  ctx.fill();
				else if(this.end.shape.type===3){
					ctx.fillStyle="white";
					ctx.fill();
				}
			}
			ctx.restore();
			return this;
		};
	
		return this;
	};
	
	lineConnector=function(option){
		var opt={
				name:"lineConnector",
				width:150,
				height:30,
				text:"lineConnector",
				linecap:"square"
					
		};
		$.extend(opt,option);		
		$.extend(this,new _connector(opt));
		this.propertyEditors=["common","border","arrow"];
		this.begin=new endpoint(option.begin);
		this.end=new endpoint(option.end);
		this.type="lineConnector";		
         
        this.checkPointIn =function(x, y,scale) {
     		if(this.root!=null)
     			scale=scale||this.root.scale;
     		if(!scale)
     			scale=1;
     		var _xc = this.relativePoint(x, y,scale);
     		var x2 = _xc.x;
     		var y2 = _xc.y;
     		var result=math.isPointOnLine(x2,y2,this.sp.x*scale,this.sp.y*scale,this.ep.x*scale,this.ep.y*scale);
     		return result;
         };
         
		this.setResizers=function(){
			var sp={
					x:this.begin.x+this.begin.widget.x,
					y:this.begin.y+this.begin.widget.y,
			},
			ep={
					x:this.end.x+this.end.widget.x,
					y:this.end.y+this.end.widget.y
			};
			if(this.begin.position=="top"){
				sp.y=this.begin.widget.y;
			}
			else if(this.begin.position=="bottom"){
				sp.y=this.begin.widget.y+this.begin.widget.height;
			}
			else if(this.begin.position=="left"){
				sp.x=this.begin.widget.x;
			}
			else if(this.begin.position=="right"){
				sp.x=this.begin.widget.x+this.begin.widget.width;
			}
			if(this.begin.widget.x+this.begin.widget.width<this.end.widget.x){			
				if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y)
				{
//					if(this.begin.position!="right"){
//						sp.y=this.begin.widget.y+this.begin.widget.height;
////						this.begin.position="bottom";
//					}
//					else{
//						sp.x=this.begin.widget.x+this.begin.widget.width;
//					}
					if(this.end.position!="top"){
						ep.x=this.end.widget.x+this.end.offsetx;
						this.end.position="left";
					}
					else{
						ep.y=this.end.widget.y+this.end.offsety;
					}
				}
				else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
//					if(this.begin.position!="right"){
//						sp.y=this.begin.widget.y;
////						this.begin.position="top";
//					}
//					else{
//						sp.x=this.begin.widget.x+this.begin.widget.width;
//					}
					if(this.end.position!="left"){
						ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
						this.end.position="bottom";
					}
					else{
						ep.x=this.end.widget.x+this.end.offsetx;
					}
				}
				else{
					sp.x=this.begin.widget.x+this.begin.widget.width;
//					this.begin.position="right";
					ep.x=this.end.widget.x+this.end.offsetx;
					this.end.position="left";
				}
			}
			else if(this.end.widget.x+this.end.widget.width<this.begin.widget.x){
				if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y)
				{
//					if(this.begin.position!="left"){
//						sp.y=this.begin.widget.y+this.begin.widget.height;
////						this.begin.position="bottom";
//					}
//					else{
//						sp.x=this.begin.widget.x;
//					}
					if(this.end.position!="top"){
						ep.x=this.end.widget.x+this.end.widget.width;
						this.end.position="right";
					}
					else{
						ep.y=this.end.widget.y+this.end.offsety;
					}
				}
				else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
//					if(this.begin.position!="left"){
//						sp.y=this.begin.widget.y;
////						this.begin.position="top";
//					}
//					else{
//						sp.x=this.begin.widget.x;
//					}
					if(this.end.position!="right"){
						ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
						this.end.position="bottom";
					}
					else{
						ep.x=this.end.widget.x+this.end.widget.width;
					}
				}
//				else{
//					sp.x=this.begin.widget.x;
////					this.begin.position="left";
//					ep.x=this.end.widget.x+this.end.widget.width;
//					this.end.position="right";
//				}
			}
			else{
				if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
//					sp.y=this.begin.widget.y+this.begin.widget.height;
//					this.begin.position="bottom";
					ep.y=this.end.widget.y+this.end.offsety;
					this.end.position="top";			
				}
				else{
//					sp.y=this.begin.widget.y;
//					this.begin.position="top";
					ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
					this.end.position="bottom";
				}
			}
			var point1={
					x:sp.x-this.x,
					y:sp.y-this.y,
					cursor:"move",
					visible:true
			},
			point2={
					x:ep.x-this.x,
					y:ep.y-this.y,
					cursor:"move",
					visible:true
			};
			this.x=Math.min(sp.x,ep.x);
			this.y=Math.min(sp.y,ep.y);
			this.width=Math.abs(ep.x-sp.x);
			this.height=Math.abs(ep.y-sp.y);
			this.sp=point1;
			this.ep=point2;
			this.resizers=[point1,point2];
		};
		this.resize=function(e){
			var offsetX=e.offset.x;
			var offsetY=e.offset.y;
			this.resizer=e.resizer-1;
			if(this.resizer==0){
				this.begin.x+=offsetX;
				this.begin.y+=offsetY;
				if(this.begin.widget.x+this.begin.widget.width<this.end.widget.x){
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
						
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.position="right";
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0)
							this.begin.y=this.begin.widget.margin;
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.position="bottom";
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.position="right";
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.position="top";
							this.begin.y=this.begin.widget.margin;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
					else{
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.y=this.begin.widget.margin;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
						
					}
				}
				
				else if(this.end.widget.x+this.end.widget.width<this.begin.widget.x){
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;	
						    this.begin.position="left";
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0)
							this.begin.y=this.begin.widget.margin;
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.position="bottom";
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
						
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;	
						    this.begin.position="left";
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.y=this.begin.widget.margin;
							this.begin.position="top";
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
					else{
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.y=this.begin.widget.margin;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
				}
				else{
					if(this.begin.x<0){
					    this.begin.x=this.begin.widget.margin;					
					}
					else if(this.begin.x>this.begin.widget.width){
						this.begin.x=this.begin.widget.width-this.begin.widget.margin;
					}
					if(this.begin.y<0){
						this.begin.y=this.begin.widget.margin;
					}
					else if(this.begin.y>this.begin.widget.height)
					{
						this.begin.y=this.begin.widget.height-this.begin.widget.margin;
					}
				}
//				if(this.begin.x<0){
//					    this.begin.x=this.begin.widget.margin;					
//				}
//				else if(this.begin.x>this.begin.widget.width)
//					this.begin.x=this.begin.widget.width-this.begin.widget.margin;
//				if(this.begin.y<0)
//					this.begin.y=this.begin.widget.margin;
//				else if(this.begin.y>this.begin.widget.height)
//					this.begin.y=this.begin.widget.height-this.begin.widget.margin;
			}
			else if(this.resizer==this.resizers.length-1){
				this.end.x+=offsetX;
				this.end.y+=offsetY;
				if(this.begin.widget.x+this.begin.widget.width<this.end.widget.x){
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
						if(this.end.x<this.end.widget.margin){
							this.end.x=this.end.widget.margin;
							this.end.position="left";
						}
						else if(this.end.x>this.end.widget.width-this.end.widget.margin)
							this.end.x=this.end.widget.width-this.end.widget.margin;
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
							this.end.position="top";
						}
						else if(this.end.y>this.end.widget.height)
							this.end.y=this.end.widget.height-this.end.widget.margin;
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
						if(this.end.x<this.end.widget.margin){
							this.end.x=this.end.widget.margin;
							this.end.position="left";
						}
						else if(this.end.x>this.end.widget.width-this.end.widget.margin)
							this.end.x=this.end.widget.width-this.end.widget.margin;							
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
						}
						else if(this.end.y>this.end.widget.height){
							this.end.y=this.end.widget.height-this.end.widget.margin;
							this.end.position="bottom";
						}
					}
					else{
						if(this.end.x<this.end.widget.margin)
							this.end.x=this.end.widget.margin;
						else if(this.end.x>this.end.widget.width-this.end.widget.margin)
							this.end.x=this.end.widget.width-this.end.widget.margin;
						if(this.end.y<0)
							this.end.y=this.end.widget.margin;
						else if(this.end.y>this.end.widget.height)
							this.end.y=this.end.widget.height-this.end.widget.margin;
						
					}
				}
				
				else if(this.end.widget.x+this.end.widget.width<this.begin.widget.x){
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
						if(this.end.x<this.end.widget.margin){
							this.end.x=this.end.widget.margin;
						}
						else if(this.end.x>this.end.widget.width-this.end.widget.margin){
							this.end.x=this.end.widget.width-this.end.widget.margin;
							this.end.position="right";
						}
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
							this.end.position="top";
						}
						else if(this.end.y>this.end.widget.height){
							this.end.y=this.end.widget.height-this.end.widget.margin;
						}
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
						if(this.end.x<this.end.widget.margin){
							this.end.x=this.end.widget.margin;
						}
						else if(this.end.x>this.end.widget.width-this.end.widget.margin){
							this.end.x=this.end.widget.width-this.end.widget.margin;
							this.end.position="right";
						}
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
						}
						else if(this.end.y>this.end.widget.height){
							this.end.y=this.end.widget.height-this.end.widget.margin;
							this.end.position="bottom";
						}
					}
					else{
						if(this.end.x<this.end.widget.margin)
							this.end.x=this.end.widget.margin;
						else if(this.end.x>this.end.widget.width-this.end.widget.margin)
							this.end.x=this.end.widget.width-this.end.widget.margin;
						if(this.end.y<0)
							this.end.y=this.end.widget.margin;
						else if(this.end.y>this.end.widget.height)
							this.end.y=this.end.widget.height-this.end.widget.margin;
						
					}
				}
				else{
					if(this.end.x<this.end.widget.margin)
						this.end.x=this.end.widget.margin;
					else if(this.end.x>this.end.widget.width-this.end.widget.margin)
						this.end.x=this.end.widget.width-this.end.widget.margin;
					if(this.end.y<0)
						this.end.y=this.end.widget.margin;
					else if(this.end.y>this.end.widget.height)
						this.end.y=this.end.widget.height-this.end.widget.margin;
				}
			}			
		};
		this.paintTo=function(canvas){
			var ctx=canvas.getContext("2d");
			ctx.save();
			ctx.scale(this.scaleX,this.scaleY);
			ctx.globalAlpha = this.alpha;			
			ctx.translate(this.x, this.y);
			ctx.rotate(this.rotate / 180 * Math.PI);
			this.setResizers();
			this.drawImageTo(ctx);	
			
			if(this.begin.widget.focus||this.end.widget.focus){
				this.drawImageTo(ctx,true);	
			}
			if(this.focus){
				if(this.editable&&!this.autosize)
				  this.drawResizerTo(ctx);
			}
			ctx.restore();
		};
		this.drawImageTo = function(ctx,focus){
			var sp=this.sp;
			var ep=this.ep;
			ctx.save();
			var dx=0.5;
			ctx.beginPath(); 
			if(!focus){
				ctx.strokeStyle=this.border.color;
				ctx.fillStyle=this.border.color;
				ctx.lineWidth=this.border.width;
				ctx.lineCap=this.linecap;
				if(this.border.type!="solid"){
					var dashList =this.border.type==="dashed"?[this.border.width+5, this.border.width+2]:[this.border.width+2,this.border.width+2]; 
					ctx.setLineDash(dashList);
				}
			}
			else{
				ctx.strokeStyle=this.dashColor;
				ctx.fillStyle=this.dashColor;
				ctx.lineWidth=this.border.width+1;
				ctx.lineCap=this.linecap;
				var dashList =[this.border.width+4, this.border.width+7]; 
				ctx.setLineDash(dashList);
				ctx.lineDashOffset = -this.dashOffset;				
			}
			ctx.moveTo(this.resizers[0].x+dx,this.resizers[0].y+dx);
			for(var i=1;i<this.resizers.length;i++)
				ctx.lineTo(this.resizers[i].x+dx,this.resizers[i].y+dx);
			ctx.lineTo(ep.x+dx,ep.y+dx);				
			ctx.stroke();
			
//			if(this.begin.border.color!="none"){
//				ctx.strokeStyle=this.begin.border.color;
//			}
//			if(this.begin.background.color!="none"){
//				ctx.fillStyle=this.begin.background.color;
//			}
			if(this.begin.shape.name==="arrow")
		    	$.drawArrow(ctx,ep,sp,this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});
			else if(this.begin.shape.name==="diamond"){
				$.drawDiamond(ctx,ep,sp,this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});				
			}
			else if(this.begin.shape.name==="dot")
			{
				ctx.beginPath();
				ctx.arc(sp.x,sp.y,this.begin.shape.radius,0,2*Math.PI);
				ctx.stroke();
				if(this.begin.shape.type===2)
				  ctx.fill();
				else if(this.begin.shape.type===3){
					ctx.fillStyle="white";
					ctx.fill();
					ctx.fillStyle=this.border.color;
				}
			}
			
//			if(this.end.border.color!="none"){
//				ctx.strokeStyle=this.end.border.color;
//			}
//			if(this.end.background.color!="none"){
//				ctx.fillStyle=this.end.background.color;
//			}
			
			if(this.end.shape.name==="arrow")
		    	$.drawArrow(ctx,sp,ep,this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
			else if(this.end.shape.name==="diamond")
		    	$.drawDiamond(ctx,sp,ep,this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
			else if(this.end.shape.name==="dot")
			{
				ctx.beginPath();
				ctx.arc(ep.x,ep.y,this.end.shape.radius,0,2*Math.PI);
				ctx.stroke();
				if(this.end.shape.type===2)
				  ctx.fill();
				else if(this.end.shape.type===3){
					ctx.fillStyle="white";
					ctx.fill();
				}
			}
			ctx.restore();
			return this;
		};
		return this;
	};
	
	quadraticCurveConnector=function(option){
		var opt={
				name:"quadraticCurveConnector",
				width:150,
				height:30,
				text:"quadraticCurveConnector"				
		};
		$.extend(opt,option);		
		$.extend(this,new _connector(opt));
		this.propertyEditors=["common","border","arrow"];
		this.begin=new endpoint(option.begin);
		this.end=new endpoint(option.end);
		this.offsetX=0;
		this.offsetY=0;
		var _offsetX=this.offsetX;
		var _offsetY=this.offsetY;
		this.type="quadraticCurveConnector";	
		this.persist=function(){
			var r=widget.persistproperty(this);
			r.offsetX=this.offsetX;
			r.offsetY=this.offsetY;
			r.linecap=this.linecap;
			r.minOffset=this.minOffset;
			r.begin=this.begin.persist();
			r.end=this.end.persist();
			r.begin.position=this.begin.position;
			r.end.position=this.end.position;
			return r;
		};
		
		 this.checkPointIn =function(x, y,scale) {
	     		if(this.root!=null)
	     			scale=scale||this.root.scale;
	     		if(!scale)
	     			scale=1;
	     		var _xc = this.relativePoint(x, y,scale);
	     		var x2 = _xc.x;
	     		var y2 = _xc.y;
	     		var result=false;
	     		for(var i=0;i<this.resizers.length-1;i++){
	     			result=math.isPointOnLine(x2,y2,this.resizers[i].x*scale,this.resizers[i].y*scale,this.resizers[i+1].x*scale,this.resizers[i+1].y*scale);
	     			if(result==true)
	     				return true;
				}
	     		return false;
	         };
	         
		this.setResizers=function(){
			var sp={
					x:this.begin.x+this.begin.widget.x,
					y:this.begin.y+this.begin.widget.y,
			},
			ep={
					x:this.end.x+this.end.widget.x,
					y:this.end.y+this.end.widget.y
			};
			
			if(this.begin.position=="top"){
				sp.y=this.begin.widget.y;
			}
			else if(this.begin.position=="bottom"){
				sp.y=this.begin.widget.y+this.begin.widget.height;
			}
			else if(this.begin.position=="left"){
				sp.x=this.begin.widget.x;
			}
			else if(this.begin.position=="right"){
				sp.x=this.begin.widget.x+this.begin.widget.width;
			}
			
			if(this.begin.widget.x+this.begin.widget.width<this.end.widget.x){	
				var dx=(this.end.widget.x-this.begin.widget.x+this.begin.widget.width)/2;
				if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y)
				{					
					var dy=(this.end.widget.y-this.begin.widget.y+this.begin.widget.height)/2;
					if(this.begin.position=="right"){
						_offsetX=this.begin.widget.x+this.offsetX-this.x+dx;
						_offsetY=this.begin.widget.y-this.y+this.begin.widget.height/2+this.offsetY;
						if(this.end.position!="left"){
							ep.y=this.end.widget.y+this.end.offsety;
							this.end.position="top";
						}
						else						
							ep.x=this.end.widget.x+this.end.offsetx;
					}
					else if(this.begin.position=="bottom"){
						_offsetX=this.begin.widget.x+this.offsetX+this.begin.widget.width/2-this.x;
						_offsetY=this.begin.widget.y-this.y+dy+this.offsetY;
						if(this.end.position!="top"){
							ep.x=this.end.widget.x+this.end.offsetx;
							this.end.position="left";
						}
						else
							ep.y=this.end.widget.y+this.end.offsety;
							
					}
					else if(this.begin.position=="top"){
						_offsetX=this.begin.widget.x+this.offsetX+dx-this.x;
						_offsetY=this.begin.widget.y-this.y-dy+this.offsetY;
						if(this.end.position!="left"){
							ep.y=this.end.widget.y+this.end.offsety;
							this.end.position="top";
						}
						else
							ep.x=this.end.widget.x+this.end.offsetx;
						
					}
					else if(this.begin.position=="left"){
						_offsetX=this.begin.widget.x+this.offsetX-dx-this.x;
						_offsetY=this.begin.widget.y+dy+this.offsetY-this.y;
						if(this.end.position!="top"){
							ep.x=this.end.widget.x+this.end.offsetx;
							this.end.position="left";
						}
						else
							ep.y=this.end.widget.y+this.end.offsety;
					}
				}
				else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
					var dy=(this.begin.widget.y-this.end.widget.y-this.end.widget.height)/2;
					if(this.begin.position=="right"){
						_offsetX=this.begin.widget.x+this.offsetX-this.x+dx;
						_offsetY=this.begin.widget.y-this.y+this.begin.widget.height/2+this.offsetY;
						if(this.end.position!="left"){
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
							this.end.position="bottom";
						}
						else
							ep.x=this.end.widget.x+this.end.offsetx;
					}
					else if(this.begin.position=="top"){//top
						_offsetX=this.begin.widget.x+this.offsetX-this.x+this.begin.widget.width/2;
						_offsetY=this.begin.widget.y-this.y+this.offsetY-dy;
						if(this.end.position!="bottom"){
							ep.x=this.end.widget.x+this.end.offsetx;
							this.end.position="left";
						}
						else
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
					}
					else if(this.begin.position=="left"){//top
						_offsetX=this.begin.widget.x-dx+this.offsetX-this.x;
						_offsetY=this.begin.widget.y-dy+this.offsetY-this.y;
						if(this.end.position!="bottom"){
							ep.x=this.end.widget.x+this.end.offsetx;
							this.end.position="left";
						}
						else
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
					}
					else if(this.begin.position=="bottom"){//top
						_offsetX=this.begin.widget.x+dx+this.offsetX-this.x;
						_offsetY=this.begin.widget.y+this.begin.widget.height+dy+this.offsetY-this.y;
						if(this.end.position!="left"){
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
							this.end.position="bottom";
						}
						else
							ep.x=this.end.widget.x+this.end.offsetx;
					}
				}
				else{
					_offsetX=this.begin.widget.x-this.x+dx+this.offsetX;
					if(this.begin.position=="right"){
						sp.x=this.begin.widget.x+this.begin.widget.width;					
						ep.x=this.end.widget.x+this.end.offsetx;
						this.end.position="left";
						_offsetY=this.begin.widget.y-this.y-dx/4+this.offsetY;
					}
					else{
						this.end.position=this.begin.position;
						if(this.begin.position=="top"){
							_offsetY=this.begin.widget.y-this.y-dx/4+this.offsetY;
							ep.y=this.end.widget.y+this.end.offsety;
						}
						else if(this.begin.position=="bottom"){
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
							_offsetY=this.begin.widget.y+this.begin.widget.height-this.y+dx/4+this.offsetY;
						}
					}
				}
			}
			else if(this.end.widget.x+this.end.widget.width<this.begin.widget.x){
				var dx=(this.begin.widget.x-this.end.widget.x+this.end.widget.width)/2;
				if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
					var dy=(this.end.widget.y-this.begin.widget.y+this.begin.widget.height)/2;
					if(this.begin.position=="bottom"){
						_offsetX=this.begin.widget.x+(this.begin.widget.width)/2+this.offsetX-this.x;
						_offsetY=this.begin.widget.y+dy+this.offsetY-this.y;
						if(this.end.position!="top"){
							ep.x=this.end.widget.x+this.end.widget.width;
							this.end.position="right";
						}
						else
							ep.y=this.end.widget.y+this.end.offsety;
					}
					else if(this.begin.position=="left"){
						_offsetX=this.begin.widget.x-dx+this.offsetX-this.x;
						_offsetY=this.begin.widget.y+this.begin.widget.height/2+this.offsetY-this.y;
						if(this.end.position!="right"){
							ep.y=this.end.widget.y+this.end.offsety;
							this.end.position="top";
						}
						else
							ep.x=this.end.widget.x+this.end.widget.width;
					}
					else if(this.begin.position=="top"){
						_offsetX=this.begin.widget.x-dx+this.offsetX-this.x;
						_offsetY=this.begin.widget.y-dy+this.offsetY-this.y;
						if(this.end.position!="right"){
							ep.y=this.end.widget.y+this.end.offsety;
							this.end.position="top";
						}
						else
							ep.x=this.end.widget.x+this.end.widget.width;
					}
					else if(this.begin.position=="right"){
						_offsetX=this.begin.widget.x+dx+this.offsetX-this.x;
						_offsetY=this.begin.widget.y+dy+this.offsetY-this.y;
						if(this.end.position!="top"){
							ep.x=this.end.widget.x+this.end.widget.width;
							this.end.position="right";
						}
						else
							ep.y=this.end.widget.y+this.end.offsety;
					}
										
				}
				else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
					var dy=(this.begin.widget.y-this.end.widget.y+this.end.widget.height)/2;
					if(this.begin.position=="top"){
						_offsetX=this.begin.widget.x+this.begin.widget.width/2+this.offsetX-this.x;
						_offsetY=this.end.widget.y+dy+this.offsetY-this.y;
						if(this.end.position!="bottom"){
							ep.x=this.end.widget.x+this.end.widget.width;
							this.end.position="right";
						}
						else
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
					}
					else if(this.begin.position=="left"){//left
						_offsetX=this.begin.widget.x-dx+this.offsetX-this.x;
						_offsetY=this.begin.widget.y+this.offsetY-this.y;
						if(this.end.position!="right"){
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
							this.end.position="bottom";
						}
						else
							ep.x=this.end.widget.x+this.end.widget.width;
					}
					else if(this.begin.position=="bottom"){
						_offsetX=this.begin.widget.x-dx+this.offsetX-this.x;
						_offsetY=this.begin.widget.y+dy+this.offsetY-this.y;
						if(this.end.position!="right"){
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
							this.end.position="bottom";
						}
						else
							ep.x=this.end.widget.x+this.end.widget.width;
					}
					else if(this.begin.position=="right"){
						_offsetX=this.begin.widget.x+this.begin.widget.width+dx+this.offsetX-this.x;
						_offsetY=this.begin.widget.y-dy+this.offsetY-this.y;
						if(this.end.position!="bottom"){
							ep.x=this.end.widget.x+this.end.widget.width;
							this.end.position="right";
						}
						else
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
							
					}
				}
				else{
					_offsetX=this.begin.widget.x-(this.begin.widget.x-this.end.widget.x+this.end.widget.width)/2+this.offsetY-this.y;
					if(this.begin.position=="left"){
						ep.x=this.end.widget.x+this.end.widget.width;
						this.end.position="right";
						_offsetY=this.end.widget.y+this.offsetY-this.y;
					}
					else{
						this.end.position=this.begin.position;
						if(this.end.position=="top"){
							ep.y=this.end.widget.y+this.end.offsety;							
							_offsetY=this.end.widget.y-this.end.widget.height+this.offsetY-this.y;
						}
						else{
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
							_offsetY=this.end.widget.y+2*this.end.widget.height+this.offsetY-this.y;
						}
					}
					
				}
			}
			else{
				if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
					var dy=(this.end.widget.y-this.begin.widget.y+this.begin.widget.height)/2;
					if(this.begin.position=="bottom"){
						this.end.position="top";
						ep.y=this.end.widget.y+this.end.offsety;
						_offsetX=this.begin.widget.x+this.offsetX-this.x;
						_offsetY=this.end.widget.y-dy+this.offsetY-this.y;
					}
					else{
						this.end.position=this.begin.position;
						if(this.begin.position=="left"){
							ep.x=this.end.widget.x+this.end.offsetx;
							_offsetX=this.begin.widget.x-dy/3+this.offsetX-this.x;
							_offsetY=this.end.widget.y-dy+this.offsetY-this.y;
						}
						else if(this.begin.position=="right"){
							ep.x=this.end.widget.x+this.end.widget.width;
							_offsetX=this.begin.widget.x+this.begin.widget.width+dy/3+this.offsetX-this.x;
							_offsetY=this.end.widget.y-dy+this.offsetY-this.y;
						}
					}
				}
				else{	
					var dy=(this.begin.widget.y-this.end.widget.y+this.end.widget.height)/2;
					if(this.begin.position=="top"){
						this.end.position="bottom";
						ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
						_offsetX=this.begin.widget.x+this.offsetX-this.x;
						_offsetY=this.end.widget.y+dy+this.offsetY-this.y;
					}
					else{
						this.end.position=this.begin.position;
						if(this.end.position=="left"){
							ep.x=this.end.widget.x+this.end.offsetx;
							_offsetX=this.begin.widget.x-dy/3+this.offsetX-this.x;
							_offsetY=this.begin.widget.y-this.y-dy+this.offsetY;
						}
						else if(this.end.position=="right"){
							ep.x=this.end.widget.x+this.end.widget.width;
							_offsetX=this.begin.widget.x+this.begin.widget.width+dy/3+this.offsetX-this.x;
							_offsetY=this.begin.widget.y-dy+this.offsetY-this.y;
						}
					}					
				}
			}
			var point1={
					x:sp.x-this.x,
					y:sp.y-this.y,
					cursor:"move",
					visible:true
			},
			point2={
					x:ep.x-this.x,
					y:ep.y-this.y,
					cursor:"move",
					visible:true
			};
			this.x=Math.min(sp.x,ep.x);
			this.y=Math.min(sp.y,ep.y);
			this.width=Math.abs(ep.x-sp.x);
			this.height=Math.abs(ep.y-sp.y);
			this.sp=point1;
			this.ep=point2;
			var point3={
					x:_offsetX,
					y:_offsetY,
					visible:true
			};
			this.resizers=[point1,point3,point2];
		};
		this.resize=function(e){
			var offsetX=e.offset.x;
			var offsetY=e.offset.y;
			this.resizer=e.resizer-1;
			if(this.resizer==0){
				this.begin.x+=offsetX;
				this.begin.y+=offsetY;
				if(this.begin.widget.x+this.begin.widget.width<this.end.widget.x){
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
						
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.position="right";
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0)
							this.begin.y=this.begin.widget.margin;
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.position="bottom";
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.position="right";
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.position="top";
							this.begin.y=this.begin.widget.margin;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
					else{
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.y=this.begin.widget.margin;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
						
					}
				}
				
				else if(this.end.widget.x+this.end.widget.width<this.begin.widget.x){
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;	
						    this.begin.position="left";
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0)
							this.begin.y=this.begin.widget.margin;
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.position="bottom";
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
						
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;	
						    this.begin.position="left";
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.y=this.begin.widget.margin;
							this.begin.position="top";
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
					else{
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.y=this.begin.widget.margin;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
				}
				else{
					if(this.begin.x<0){
					    this.begin.x=this.begin.widget.margin;					
					}
					else if(this.begin.x>this.begin.widget.width){
						this.begin.x=this.begin.widget.width-this.begin.widget.margin;
					}
					if(this.begin.y<0){
						this.begin.y=this.begin.widget.margin;
					}
					else if(this.begin.y>this.begin.widget.height)
					{
						this.begin.y=this.begin.widget.height-this.begin.widget.margin;
					}
				}
			}
			else if(this.resizer==this.resizers.length-1){
				this.end.x+=offsetX;
				this.end.y+=offsetY;
				if(this.begin.widget.x+this.begin.widget.width<this.end.widget.x){
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
						if(this.end.x<this.end.widget.margin){
							this.end.x=this.end.widget.margin;
							this.end.position="left";
						}
						else if(this.end.x>this.end.widget.width-this.end.widget.margin)
							this.end.x=this.end.widget.width-this.end.widget.margin;
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
							this.end.position="top";
						}
						else if(this.end.y>this.end.widget.height)
							this.end.y=this.end.widget.height-this.end.widget.margin;
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
						if(this.end.x<this.end.widget.margin){
							this.end.x=this.end.widget.margin;
							this.end.position="left";
						}
						else if(this.end.x>this.end.widget.width-this.end.widget.margin)
							this.end.x=this.end.widget.width-this.end.widget.margin;							
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
						}
						else if(this.end.y>this.end.widget.height){
							this.end.y=this.end.widget.height-this.end.widget.margin;
							this.end.position="bottom";
						}
					}
					else{
						if(this.end.x<this.end.widget.margin)
							this.end.x=this.end.widget.margin;
						else if(this.end.x>this.end.widget.width-this.end.widget.margin)
							this.end.x=this.end.widget.width-this.end.widget.margin;
						if(this.end.y<0)
							this.end.y=this.end.widget.margin;
						else if(this.end.y>this.end.widget.height)
							this.end.y=this.end.widget.height-this.end.widget.margin;
						
					}
				}
				
				else if(this.end.widget.x+this.end.widget.width<this.begin.widget.x){
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
						if(this.end.x<this.end.widget.margin){
							this.end.x=this.end.widget.margin;
						}
						else if(this.end.x>this.end.widget.width-this.end.widget.margin){
							this.end.x=this.end.widget.width-this.end.widget.margin;
							this.end.position="right";
						}
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
							this.end.position="top";
						}
						else if(this.end.y>this.end.widget.height){
							this.end.y=this.end.widget.height-this.end.widget.margin;
						}
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
						if(this.end.x<this.end.widget.margin){
							this.end.x=this.end.widget.margin;
						}
						else if(this.end.x>this.end.widget.width-this.end.widget.margin){
							this.end.x=this.end.widget.width-this.end.widget.margin;
							this.end.position="right";
						}
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
						}
						else if(this.end.y>this.end.widget.height){
							this.end.y=this.end.widget.height-this.end.widget.margin;
							this.end.position="bottom";
						}
					}
					else{
						if(this.end.x<this.end.widget.margin)
							this.end.x=this.end.widget.margin;
						else if(this.end.x>this.end.widget.width-this.end.widget.margin)
							this.end.x=this.end.widget.width-this.end.widget.margin;
						if(this.end.y<0)
							this.end.y=this.end.widget.margin;
						else if(this.end.y>this.end.widget.height)
							this.end.y=this.end.widget.height-this.end.widget.margin;
						
					}
				}
				else{
					if(this.end.x<this.end.widget.margin)
						this.end.x=this.end.widget.margin;
					else if(this.end.x>this.end.widget.width-this.end.widget.margin)
						this.end.x=this.end.widget.width-this.end.widget.margin;
					if(this.end.y<0)
						this.end.y=this.end.widget.margin;
					else if(this.end.y>this.end.widget.height)
						this.end.y=this.end.widget.height-this.end.widget.margin;
				}
			}
			else{
				if(this.resizer==1){
						this.offsetX+=offsetX;
						this.offsetY+=offsetY;		
				}
			}
		};
		
		this.paintTo=function(canvas){
			var ctx=canvas.getContext("2d");
			ctx.save();
			ctx.scale(this.scaleX,this.scaleY);
			ctx.globalAlpha = this.alpha;			
			ctx.translate(this.x, this.y);
			ctx.rotate(this.rotate / 180 * Math.PI);
			this.setResizers();
			this.drawImageTo(ctx);	
			if(this.begin.widget.focus||this.end.widget.focus){
				this.drawImageTo(ctx,true);	
			}
			if(this.focus){
				if(this.editable&&!this.autosize)
				  this.drawResizerTo(ctx);
			}
			ctx.restore();
		};
		this.drawImageTo = function(ctx,focus){
			var sp=this.sp;
			var ep=this.ep;
			ctx.save();
			var dx=0.5;
			ctx.beginPath(); 
			if(!focus){
				ctx.strokeStyle=this.border.color;
				ctx.lineWidth=this.border.width;
				ctx.fillStyle=this.border.color;
				ctx.lineCap=this.linecap;
				if(this.border.type!="solid"){
					var dashList =this.border.type==="dashed"?[this.border.width+5, this.border.width+2]:[this.border.width+2,this.border.width+2]; 
					ctx.setLineDash(dashList);
				}
			}
			else{
				ctx.strokeStyle=this.dashColor;
				ctx.fillStyle=this.dashColor;
				ctx.lineWidth=this.border.width+1;
				ctx.lineCap=this.linecap;
				var dashList =[this.border.width+4, this.border.width+7]; 
				ctx.setLineDash(dashList);
				ctx.lineDashOffset = -this.dashOffset;				
			}
			ctx.moveTo(this.resizers[0].x+dx,this.resizers[0].y+dx);
			if(this.resizers.length===2){
				ctx.lineTo(ep.x+dx+dx,ep.y+dx+dx);	
			}
			else{
				ctx.quadraticCurveTo(this.resizers[1].x+dx,this.resizers[1].y+dx,this.resizers[2].x+dx,this.resizers[2].y+dx);
			}
			ctx.stroke();
			
			if(this.begin.shape.name==="arrow")
		    	$.drawArrow(ctx,this.resizers[1],this.resizers[0],this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});
			else if(this.begin.shape.name==="diamond")
		    	$.drawDiamond(ctx,this.resizers[1],this.resizers[0],this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});
			else if(this.begin.shape.name==="dot")
			{
				ctx.beginPath();
				ctx.arc(sp.x,sp.y,this.begin.shape.radius,0,2*Math.PI);
				ctx.stroke();
				if(this.begin.shape.type===2)
				  ctx.fill();
				else if(this.begin.shape.type===3){
					ctx.fillStyle="white";
					ctx.fill();
					ctx.fillStyle=this.border.color;
				}
			}
			
			if(this.end.shape.name==="arrow")
		    	$.drawArrow(ctx,this.resizers[1],this.resizers[2],this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
			else if(this.end.shape.name==="diamond")
		    	$.drawDiamond(ctx,this.resizers[1],this.resizers[2],this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
			else if(this.end.shape.name==="dot")
			{
				ctx.beginPath();
				ctx.arc(ep.x,ep.y,this.end.shape.radius,0,2*Math.PI);
				ctx.stroke();
				if(this.end.shape.type===2)
				  ctx.fill();
				else if(this.end.shape.type===3){
					ctx.fillStyle="white";
					ctx.fill();
				}
			}
			ctx.restore();
			return this;
		};
		return this;
	};
	 $.register("lineConnector",lineConnector);
	 $.register("brokenLineConnector",brokenLineConnector);
	 $.register("quadraticCurveConnector",quadraticCurveConnector);
	
})(jQuery);
(function($){
	
	field=function(option){
		var opt={
				border:null,
				corner:null,
				background:null,
				font:{
					style:"normal", // normal,italic,
					weight:"normal",//normal,lighter,bold  
					family:"Arial",
	     			size:"12px",
	     			color:"none",
	     			fill:true
				},
				data:{
					name:"",
					text:"",
					abbreviation:"",
					datatype:"varchar",
					precision:0,
					ispk:false,
					isfk:false,
					reftable:"",
					refield:"",
					nullable:true,
					unique:false,
					annotation:"",
					defaultvalue:"",
					length:255,
					integer:19,
					decimal:0					
				},				
				hyperlink :null,
				shadow:null,
				width:140,
				height:44,
				text:""
		};
		$.extend(opt,option);
		$.extend(this,new widget(opt));
		this.propertyEditors=[];
		this.allowconnectionPoint=false;
		this.type="field";
		if(this.text==="")
			this.text=this.name;
		this.autosize=false;
		this.editable=false;
		this.persist=function(){
			var r=widget.persistproperty(this);
			r.data={};
			delete r.font;
			$.extend(r.data,this.data);
			return r;
		};
		this.drawBorderTo=function(ctx){
			this.x=0;
			if(!this.parent.focus)
				this.focus=false;
		};

		this.click=function(e){
			var inputbox=this.parent.presenters[0].textbox;
			if(this.parent.focuswidget&&this.parent.focuswidget!=this){
				this.parent.focuswidget.focus=false;
			}		
			this.parent.focuswidget=this;
//			for(var i=0;i<=this.parent.widgets.length-1;i++){
//				this.parent.widgets[i].focus=false;
//			}
			if(this.parent.presenters[0].focuswidget&&(this.parent.presenters[0].focuswidget!=this.parent))
				this.parent.presenters[0].focuswidget.focus=false;
			this.parent.Widget(this).focus=true;
			this.parent.presenters[0].focuswidget=this;
			$(inputbox).hide();
			this.parent.paint();		
			if(this.parent.fieldclickEvent){
				this.parent.fieldclickEvent.call(this,e);
			}
			e.cancel=true;
		};
		
		this.prev=function(e){
			var _a = this.parent.fields;
			if(this.data.ispk)
			  _a = this.parent.pk;
			for(var i=0;i<=_a.length-1;i++){
				if(_a[i]===this&&i>0){	
				  _a[i].focus=false;
				  _a[i-1].focus=true;
				  this.parent.focuswidget=_a[i-1];
				  this.parent.paint();
				  if(this.parent.fieldclickEvent){
						this.parent.fieldclickEvent.call(this,e);
				  }
				  e.cancel=true;				  
				}					
			}
		};
		
		this.next=function(e){
			var _a = this.parent.fields;
			if(this.data.ispk)
			  _a = this.parent.pk;
			for(var i=0;i<=_a.length-1;i++){
				if(_a[i]===this&&i<_a.length){
					  _a[i].focus=false;
					  _a[i+1].focus=true;
				  this.parent.focuswidget=_a[i+1];
				  this.parent.paint();
				  if(this.parent.fieldclickEvent){
						this.parent.fieldclickEvent.call(this,e);
				  }
				  e.cancel=true;
				}					
			}
		};
		
		this.goup=function(){
			var _a = this.parent.fields;
			if(this.data.ispk)
			  _a = this.parent.pk;
			for(var i=0;i<=_a.length-1;i++){
				if(_a[i]===this&&i>0){
				  var _temp=_a[i-1];				 
				  _a[i-1]=this;
				  _a[i]=_temp;
				  this.parent.widgets.splice(0,this.parent.widgets.length);
				  $(this.parent.pk).each(function(i,item){
					  this.parent.widgets.push(item);  
				  });
				  $(this.parent.fields).each(function(i,item){
					  this.parent.widgets.push(item);  
				  });
				  this.parent.paint();
				  return;
				}					
			}
		};
		this.godown=function(){
			var _a = this.parent.fields;
			if(this.data.ispk)
			  _a = this.parent.pk;
			for(var i=0;i<=_a.length-1;i++){
				if(_a[i]===this&&i<_a.length-1){
				  var _temp=_a[i+1];
				  _a[i+1]=this;
				  _a[i]=_temp;
				  this.parent.widgets.splice(0,this.parent.widgets.length);
				  $(this.parent.pk).each(function(i,item){
					  this.parent.widgets.push(item);  
				  });
				  $(this.parent.fields).each(function(i,item){
					  this.parent.widgets.push(item);  
				  });
				  this.parent.paint();
				  return;
				}					
			}
		};		
		
		this.beforePaint=function(ctx){
			this.data.name=this.name;
			this.data.text=this.text;
		};
		this.drawTextTo=function(ctx){
			var text=this.data.name+":"+this.data.datatype;
			if(this.parent.showtype==="logical")
				text=this.data.text+":"+this.data.datatype;
			var keys=[];
			if(this.data.ispk)
				keys.push("PK");
			if(this.data.isfk)
				keys.push("FK");
			if(keys.length>0)
			text=text+"("+keys.join(",")+")";
			var margin=this.margin;
			var autosize=this.autosize||false;		
			ctx.save();
			var font=this.font;
			if(this.font.color==="none")
			   font=this.parent.font;
			if(this.focus){
				ctx.fillStyle= "#cae2ff";
				ctx.fillRect(0,0,this.width,this.height);
//				ctx.fillStyle="white";
//				ctx.strokeStyle="white";
				ctx.fillStyle=font.color||"black";
				ctx.strokeStyle=font.color||"black";
			}
			else if(this.data.ispk){
				ctx.fillStyle="blue";
				ctx.strokeStyle="blue";
			}
			else{
				ctx.fillStyle=font.color||"black";
				ctx.strokeStyle=font.color||"black";
			}
			
			if(font!=null&&text){
				if(typeof font==="String")
					ctx.font=font;
				else{
					ctx.font=font.style+" "+font.weight+" "+font.size+" "+font.family;
				}
				metrics=ctx.measureText(text);	
				this.minwidth=metrics.width+2*this.margin;
				if(!autosize){
					if(this.parent){
						this.width=this.parent.width;
					}
					this.height=Math.round(this.fontSize()+2*margin);
				}
				font.fill=font.fill!=null?font.fill:true;
				if(font.fill)
					ctx.fillText(text,margin,this.parent.fontSize()+margin);
				else
					ctx.strokeText(text,margin,this.parent.fontSize()+margin);
			}
			ctx.restore();
			return this;
		};
	};
	
	
	table=function(option){
		var opt={
				border:{
		        	width : 1,
		        	type:"solid", //solid, dotted,dashed
					color : "black"
		        },
				corner:null,
				background:{
					filltype:"image",
					color:"white",
					image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAABQ0lEQVRYR2PU2ff/P8MgBoyjDqQwdkZDkMIAZBgNQYpDsGvecpRi5i2HUN4zDtFLlBpMjn6pH6/1hH+8m4Ssl3HmzJno5aBtenr6EXIsoFTPzJkzbRgYGA6POpDckKQoBOfMmaPy9+/fUnItR9bHzMzcnZKScgfdLIociE0zBY7Fms5HHUhCiFI/BKdPn67DxMTUT4IjcCr99+9fYWZm5hWqpkFqOIyQGRSlQUKGU0N+eDtw0KfB0XKQgYGBojQ46ENw0NfF1ChGCJlBURQTMpwa8sPbgTNmzDBhZGRcSY2Q+v//f3hGRsYZqtbFgz4XjzqQ0oJ66tSpEiwsLH7USIN//vzZlJ2d/YKqaZAaDiNkxvAuZgj5nhryxIZgISMjI0Z/gRoOIGTG////dRgYGFD6PdjGZgiZQ1f5UQdSGtyDPgQB56phnoLYMZwAAAAASUVORK5CYII="
				},
				font:{
					style:"normal", // normal,italic,
					weight:"normal",//normal,lighter,bold  
					family:"Arial",
	     			size:"12px",
	     			color:"black",
	     			fill:true
				},
				hyperlink :null,
				shadow:{
		        	color : "black",
					offsetX : 4,
					offsetY : 4,
					blur : 4
		        },
		        settings:{
		        	name:"",		        	        	
		        	text:"",
		        	auditable:false,
		        	prefix:"",
		        	abbreviation:"",
		        	annotation:"",
		        	cachable:false,
		        	namespace:"",
		        	strategy:"seqence",//table,auto,sequence
		        	sequenceName:"",
		        	owner:""
		        },
		        includeChildren:true,
				width:140,
				height:160,
				showtype:"physical",
				mode:"full",
				pk:[],
				fields:[]
		};
		$.extend(opt,option);
		opt.click=this.click;
		$.extend(this,new widget(opt));
		this.propertyEditors=[];
		this.gradient=null;
		this.allowRotate=false;
		var ths=this;
		this.margin=5;
		this.type="table";		
		if(this.widgets.length>0){
			var _widgets=[];
			$.extend(_widgets,this.widgets);
			this.widgets.splice(0,this.widgets.length);
			this.restoreChildren(_widgets,{
				editable:ths.editable				
			});
		}
		if(this.fields.length>0){
			var _fields=[];
			$.extend(_fields,this.fields);
			this.fields.splice(0,this.fields.length);
			for(var i=0;i<=_fields.length-1;i++){
				this.fields.push(ths.Widget(_fields[i]));
			}
		}
		
		if(this.pk.length>0){
			var _pk=[];
			$.extend(_pk,this.pk);
			this.pk.splice(0,this.pk.length);
			for(var i=0;i<=_pk.length-1;i++){
				this.pk.push(ths.Widget(_pk[i]));
			}
		}
		
		this.persist=function(){
			var r=widget.persistproperty(this);
			r.pk=[];
			for(var i=0;i<=this.pk.length-1;i++)
				r.pk.push(this.pk[i].name);
			r.showtype=this.showtype;
			r.mode=this.mode||"full";
			r.fields=[];
			for(var i=0;i<=this.fields.length-1;i++)
				r.fields.push(this.fields[i].name);
			r.settings={};
			$.extend(r.settings,this.settings);
			
			delete r.font;
			delete r.background;
			return r;
		};
		
		this.click=function(e){
			if(this.focuswidget){
				this.focuswidget.focus=false;
				this.focuswidget=null;
			}
			if(option.click)
				option.click.call(this,e);			
			this.paint();
		};
		
		this.dblclick=function(e){
			if(e.y>this.lineheight)
				e.cancel=true;
		};
		
		this.keypress=function(e){
			console.info(e.keyCode);
			if(e.keyCode===46){
				if(this.focuswidget){
					this.deletefield();
					e.cancel=true;
				}				
			}
			else if(e.keyCode===45){
				this.newfield();
			}
			else if(e.keyCode===38){
				var focusfield=this.focuswidget;
				if(e.ctrlKey){					
					if(focusfield!=null){
						e.preventDefault();
						focusfield.goup();
						e.cancel=true;
					}
				}
				else{
					if(focusfield!=null){
						e.preventDefault();
						focusfield.prev(e);
						e.cancel=true;
					}	
				}
			}
			else if(e.keyCode===40){
				var focusfield=this.focuswidget;
				if(e.ctrlKey){
					if(focusfield!=null){
						e.preventDefault();
						focusfield.godown();
						e.cancel=true;
					}
				}
				else{
					if(focusfield!=null){
						e.preventDefault();
						focusfield.next(e);
						e.cancel=true;
					}					
				}
				
			}
		};
		//var ths=this;
		pkcount=1;
		fieldcount=2;
		this.drawBorderTo=function(ctx){
			ctx.save();
			var ths=this;
			pkcount=this.pk.length;
			fieldcount=pkcount+1+Math.max(this.fields.length,2);
			this.lineheight=ths.fontSize()+2*ths.margin;
			this.minheight=(fieldcount+1)*(ths.lineheight);
			if(this.height<this.minheight)
				this.height=this.minheight;
			$(this.widgets).each(function(i,item){
				ths.minwidth=Math.max(ths.minwidth,item.minwidth);
			});
			ths.width=Math.max(this.width,this.minwidth);
			$(this.pk).each(function(i,item){
				var _w=ths.findfield(item.name);
				if(_w)
					_w.y=(i+1)*(ths.lineheight)+ths.margin;
			});
			var  index=0;
			$(this.fields).each(function(i,item){
				if(ths.mode=="full"||(ths.mode=="simple"&&item.data.isfk)){
					item.visible=true;
					ths.findfield(item.name).y=(index+1+pkcount)*(ths.lineheight)+ths.margin;
					index++;
				}
				else  
					item.visible=false;
			});
			fieldcount=pkcount+1+Math.max(index,2);
			this.minheight=(fieldcount+1)*(ths.lineheight);
			this.height=this.minheight;
			var _widget=this;
			if (_widget.border.color !== "none") {
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
				if(!this.focus||!this.editable)
					ctx.strokeRect(-0.5,-0.5,_widget.width+0.5,_widget.height+0.5);
				ctx.restore();
			}
			this.fillBackgroundTo(ctx);
			return this;
		};
		
		this.fillBackgroundTo=function(ctx){
			if (this.background!=null && this.background.color !== "none") {
				ctx.save();
				ctx.fillStyle = this.background.color;
//				this.drawShadowTo(ctx);
				ctx.fillRect(0, 0,this.width,this.height);
				ctx.restore();				
			}
			if(this.focus&&this.editable){
				ctx.save();
				ctx.fillStyle="#cae2ff";
				ctx.fillRect(0, 0, this.width, ths.lineheight+ths.margin);
				ctx.restore();				
			}
			ctx.moveTo(0,ths.lineheight+ths.margin+0.5);
			ctx.lineTo(ths.width,ths.lineheight+ths.margin+0.5);
			ctx.stroke();
			this.drawImageTo(ctx);
		};	
		
		var iconwidth=18;
		this.drawImageTo = function(ctx) {
			var _widget=this;
			var dx=1;
			if(_widget.background==null||_widget.background.filltype!="image")
				return;
			var image = _widget.background.image;
			if (image) {
				var left=this.margin/2;
				ctx.drawImage(image, left, this.margin/2, iconwidth,iconwidth);
			}
			return this;
		};
		this.drawResizerTo=function(ctx){
			ctx.save();
			ctx.beginPath();
			ctx.globalAlpha = 1;
			ctx.fillStyle = "#cecfff";
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
		this.drawSelectRect=function(ctx){
			if(this.selectable){
				ctx.save();
				ctx.beginPath();
				ctx.globalAlpha = 1;
				ctx.strokeStyle= "#cecfff";
				ctx.strokeRect(0,0,this.width,this.height);
				ctx.closePath();
				ctx.restore();
			}
			return this;
		};	
		this.drawTextTo=function(ctx){
			var margin=this.margin;
			var text=this.name;
			if(this.showtype==="logical")
				text=this.text;
			ctx.save();
			if(this.font!=null&&this.text){
				if(typeof this.font==="String")
					ctx.font=this.font;
				else{
					ctx.font=this.font.style+" "+this.font.weight+" "+this.font.size+" "+this.font.family;
				}
				if(this.focus&&this.editable){
					ctx.strokeStyle="black";
					ctx.fillStyle="black";
				}
				else{
					ctx.strokeStyle=this.font.color||"black";
					ctx.fillStyle=this.font.color||"black";
				}
				this.font.fill=this.font.fill!=null?this.font.fill:true;
				if(this.font.fill)
					ctx.fillText(text,margin+iconwidth,this.fontSize()+margin);
				else
					ctx.strokeText(text,margin+iconwidth,this.fontSize()+margin);
			}
			ctx.restore();
			return this;
		};
		
		this.getName=function(prefix){
			var f="field";
			if (arguments.length === 1){
				if(this.findfield(prefix)==null)
					return prefix;
				else
					f=prefix;
			}
			var index=1;
			while(this.findfield(f+index)!=null){
				index++;
			}
			return f+index;
		};	
		
		
		this.addpk=function(pk){
			if(pk.type&&pk.type==="field"&&this.findfield(pk.name)==null){
				pk.data.ispk=true;
				pk.data.nullable=false;
				this.pk.push(pk);
				this.appendWidget(pk);
			}
			if(this.connections.length>0){
				for(var i=0;i<=this.connections.length-1;i++){
					if(this.connections[i].type=="relationConnector"&&this.connections[i].begin.widget==this){
						this.connections[i].refresh();
					};
				}
			}	
			return this;
		};
	
		this.addfield=function(field){
			if(field.type&&field.type==="field"&&this.findfield(field.name)==null){
				field.data.ispk=false;
				this.fields.push(field);
				this.appendWidget(field);
			}
			return this;
		};
		
		
		this.newfield=function(option){
			var fieldname=this.getName();
			var opt={
				name:fieldname,
				editable:true,
				font:this.font
			};
			$.extend(opt,option);	
			var field1=new field(opt);
			field1.data.name=fieldname;
			this.addfield(field1);
			if(!option.silence)
				this.paint();
			return field1;
		};
		
		this.deletefield=function(field){
			var focusfield=field;
			if(focusfield!=null&&focusfield.data.isfk){
				alert("外键不能这样删除,如果要删除外键，请删除连接关联");
				e.cancel=true;
				return;
			}
			else if(focusfield!=null){
				this.removefield(focusfield);
				if(this.widgets.length>0){
					this.widgets[this.widgets.length-1].focus=true;
					this.presenters[0].focuswidget=this.widgets[this.widgets.length-1];
				}
				else
					this.presenters[0].focuswidget=this;
				this.paint();
			}
		};
		
		this.newpk=function(option){
			var fieldname=this.getName();
			var opt={
				name:fieldname,
				editable:true
			};
			$.extend(opt,option);	
			var field1=new field(opt);
			field1.data.name=fieldname;
			this.addpk(field1);
			if(!option.silence)
				field1.click({x:0,y:0});
			return field1;
		};
		
		this.findfield=function(fieldname){
			for(var i=0;i<=this.widgets.length-1;i++){
				if(this.widgets[i].name===fieldname)
					return this.widgets[i];
			}
			return null;
		};
		
		this.removefield=function(field){
			for(var i=0;i<this.fields.length;i++){
				if(this.fields[i]===field){
					this.fields.splice(i,1);
					this.removeWidget(field);
					return this;
				}
			}
			for(var i=0;i<this.pk.length;i++){
				if(this.pk[i]===field){
					this.pk.splice(i,1);
					this.removeWidget(field);
					if(this.connections.length>0){
						for(var i=0;i<=this.connections.length-1;i++){
							if(this.connections[i].type=="relationConnector"&&this.connections[i].begin.widget==this){
								this.connections[i].refresh();
							};
						}
					}	
					return this;
				}
			}
			return this;
		};
		this.getdata=function(){
		  var r={};
		  $.extend(r,this.settings);
		  r.name=this.name;
		  r.text=this.text;
		  r.fields=[];
		  r.pks=[];
		  for(var i=0;i<=this.pk.length-1;i++){
			  r.pks.push(this.pk[i].data);
			  r.fields.push(this.pk[i].data);
		  }
		  for(var i=0;i<=this.fields.length-1;i++){
			  r.fields.push(this.fields[i].data);
		  }
		  if(this.settings.auditable){
			  field_created_by={
					    name:"created_by",					
						datatype:"number",
						precision:0,
						ispk:false,
						isfk:false,
						reftable:"",
						refield:"",
						nullable:true,
						unique:false,
						annotation:"",
						defaultvalue:"",
						length:255,
						integer:19,
						decimal:0	
			  };
			  r.fields.push(field_created_by);
			  var field_last_mosified_by={};
			  $.extend(field_last_mosified_by,field_created_by,{name:"last_modified_by"});
			  r.fields.push(field_last_mosified_by);
			  var field_created_date={};
			  $.extend(field_created_date,field_created_by,{name:"created_date",datatype:"datetime"});
			  var field_last_modified_date={};
			  $.extend(field_last_modified_date,field_created_by,{name:"last_modified_date",datatype:"datetime"});
			  r.fields.push(field_created_date);
			  r.fields.push(field_last_modified_date);
		  }
		  return r;
		};	
	};
	
	relationConnector=function(option){
		var opt={
				name:"relationConnector",
				width:150,
				height:30,
				border:{
		        	width : 1,
		        	type:"solid", //solid, dotted,dashed
					color : "#ccc"
		        },
				key:{
					name:"",
					identifying:false,
					nullable:false
				}
		};
		
		$.extend(opt,option);		
		$.extend(this,new brokenLineConnector(opt));	
		this.propertyEditors=["common"];
		this.text=this.text?this.name:this.text;
		if(this.key.identifying)
			this.border.type="solid";
		else
			this.border.type="dashed";
		this.begin.shape.name="none";
		this.end.shape.name="arrow";
		this.type="relationConnector";
		this.fieldmaps=new Map();
		if(option.elements)
			this.fieldmaps.elements=option.elements;
		this.persist=function(){
			var r=widget.persistproperty(this);
			r.offsetX=this.offsetX;
			r.offsetY=this.offsetY;
			r.linecap=this.linecap;
			r.minOffset=this.minOffset;
			r.begin=this.begin.persist();
			r.end=this.end.persist();
			r.begin.position=this.begin.position;
			r.end.position=this.end.position;
			r.elements=[];
			$.extend(r.elements,this.fieldmaps.elements);
			r.key={};
			$.extend(r.key,this.key);
			return r;
		};
		
		this.ondelete=function(){
			for(var i=0;i<=this.fieldmaps.size()-1;i++){
				var fkfield=this.end.widget.findfield(this.fieldmaps.element(i).value);
			   if(fkfield!=null){
				   if((this.key.identifying&&fkfield.data.ispk)||(!this.key.identifying&&!fkfield.data.ispk))
				   this.end.widget.removefield(fkfield);
			   }
			}
			for(var i=0;i<=this.begin.widget.connections.length-1;i++){
				if(this.begin.widget.connections[i]===this)
					this.begin.widget.connections.splice(i,1);
			}
			for(var i=0;i<=this.end.widget.connections.length-1;i++){
				if(this.end.widget.connections[i]===this)
					this.end.widget.connections.splice(i,1);
			}
			
			this.fieldmaps.clear();
		};
		this.onconnected=function(){
			for(var i=0;i<=this.begin.widget.pk.length-1;i++){
				for(var j=0;j<this.begin.widget.connections.length;j++){
					var connection=this.begin.widget.connections[j];
					if(connection!==this&&connection.begin.widget===this.end.widget&&connection.end.widget===this.begin.widget){
//						alert("表之间已经有建立好的关系�);
						alert("there is already has relationship between tables");
						this.presenters[0].removeWidget(this);
						return;
					}
					if(connection!==this&&connection.begin.widget===this.begin.widget&&connection.end.widget===this.end.widget){
						for(var l=0;l<=connection.fieldmaps.size()-1;l++){
						   var fkfield=connection.end.widget.findfield(connection.fieldmaps.element(l).value);
						   if(fkfield!=null){
							   connection.end.widget.removefield(fkfield);
						   }
						   if(this.key.identifying){
							   connection.end.widget.addpk(widget);
							}
							else{
								connection.end.widget.addfield(widget);
							}
						}
						this.presenters[0].removeWidget(connection);
					}
				}
				var r=this.begin.widget.pk[i].persist();				
				var field1=new field(r);
				field1.data.isfk=true;
				field1.name=this.begin.widget.name+"_"+field1.name;
				field1.data.reftable=this.begin.widget.name;
				field1.data.refield=r.name;
				var pkfield=this.end.widget.findfield(field1.name);
				if(pkfield!=null){
					field1.name=this.begin.widget.getName(this.begin.widget.name+"_"+r.name);
					field1.data.name=field1.name;
					field1.text=field1.name;
				}
				this.fieldmaps.put(r.name,field1.name);
				if(this.key.identifying){					
					this.end.widget.addpk(field1);
				}
				else{
					this.end.widget.addfield(field1);
				}
//				console.info("pk length-"+this.end.widget.pk.length);
			}
		};
		this.beforePaint=function(ctx){		
			if(this.key.identifying){
				this.border.type="solid";
				this.key.nullable=false;
			}
			else
				this.border.type="dashed";
			
			if(this.key.nullable){
				this.begin.shape.name="arrow";
				this.begin.shape.type=3;
			}
			else{
				this.begin.shape.name="none";
			}

		};
		
		this.refresh=function(){			
			for(var i=0;i<=this.fieldmaps.size()-1;i++){
				var fkfield=this.end.widget.findfield(this.fieldmaps.element(i).value);
			   if(fkfield!=null){
				   this.end.widget.removefield(fkfield);
			   }
			}
			this.fieldmaps.clear();
			for(var i=0;i<=this.begin.widget.pk.length-1;i++){
				var r=this.begin.widget.pk[i].persist();
				var field1=new field(r);
				field1.data.isfk=true;
				if(this.end.widget.findfield(field1.name)!=null){
					field1.name=this.begin.widget.getName(this.begin.widget.name+"_"+r.name);
					field1.data.name=field1.name;
					field1.text=field1.name;
				}
				this.fieldmaps.put(r.name,field1.name);
				if(this.key.identifying){					
					this.end.widget.addpk(field1);
				}
				else{
					this.end.widget.addfield(field1);
				}
			}
		};
	};
	 $.register("relationConnector",relationConnector);
	 $.register("field",field);
	 $.register("table",table);
})(jQuery);
(function($){
	
	treeNode=function(option){
		var opt={
				font:{
					style:"normal", // normal,italic,
					weight:"normal",//normal,lighter,bold  
					family:"Arial",
	     			size:"12px",
	     			color:"none",
	     			fill:true
				},
				background:{
					filltype:"image",
		        	color : "white",
					image : 'images/tree/40-1-1.png',
					imageType : "center"// repeat center fit fill
				},
				objectdata:{
					originedatatype:"",
					datatype:"String",//String,Integer,object,array,Datetime
					targetpath:'',
					collapse:false,
					layer:0,
					index:0	
				},	
				hyperlink:null,
				shadow:null,
				width:140,
				height:44,				
				includeChildren:false,
				text:""
		};		
		if(option.objectdata){
			$.extend(opt.objectdata,option.objectdata);
			delete option.objectdata;
		}	
		
		$.extend(opt,option);		
		$.extend(this,new widget(opt));
		this.margin=4;
		this.propertyEditors=["common"];
		var ths=this;
		var  getDataType=function(datatype){
			switch(datatype){
				case "String":
				case "varchar2":
				case "char":
				case "varchar":
					return "String";
				case "Integer":
				case "number":
				case "int":
					return "Integer";	
				case "Date":
				case "timestamp(6)":
				case "time":
					return Date;
				default:
					return "datatype"
			}
		}
		var  src='images/tree/40-1-1.png';
		var  dataType=getDataType(this.objectdata.datatype);
		switch(dataType){
			case "String":
				break;
			case "Array":
				src='images/tree/40-1.png';
				break;
			case "Object":
				src='images/tree/json-40-1.png';
				break;
			case "MergedObject":
				src="images/tree/lable.png";
				break;
			case "Date":
				src='images/tree/date-40-1.png';
				break;
			case "Integer":
				src='images/tree/number-40-1.png';
				break;
		}
		this.Background({filltype:'image',image:src},function(){
			ths.paint();
		});
		this.click=function(e){
			var inputbox=this.collection().presenters[0].textbox;
			for(var i=0;i<=this.parent.widgets.length-1;i++){
				this.parent.widgets[i].focus=false;
			}
			this.focus=true;
			this.collection().presenters[0].focuswidget=this;
			
			$(inputbox).hide();
			this.collection().presenters[0].paint();			
			if(this.collection().fieldclickEvent){
				this.collection().fieldclickEvent.call(this,e);
			}
			e.cancel=true;
		};

		if(!this.includeChildren&&option.widgets&&option.widgets.length>0){
			var _widgets=[];
			$.extend(_widgets,option.widgets);
			option.widgets.splice(0,option.widgets.length);
			this.restoreChildren(_widgets,{
				editable:true,
				click:this.click
			});
		}
		
		
		this.type="treeNode";	
		this.autosize=false;
		this.editable=false;
		var ths=this;
		this.collection=function(){
			  var collection=this.parent;
			  while(collection&&collection.type!="collection")
				  collection=collection.parent;
			  return collection;
		}
		
		this.persist=function(){			
			var r=widget.persistproperty(this);
			r.treename=this.collection().name;
			r.objectdata={};
			$.extend(r.objectdata,this.objectdata);
			return r;
		};
		
		
		this.newfield=function(option){
			debugger;
			var attributename=this.getName();
			var opt={
				name:attributename,
				font:this.font
			};
			$.extend(opt,option);	
			var node1=new treeNode(opt);
			this.addnode(node1);
			return node1;
		};
		
		this.addnode=function(node){
			if(node.type&&node.type==="treeNode"&&this.findnode(node.name)==null){
				node.objectdata.index=this.widgets.length+1;
				node.objectdata.layer=this.objectdata.layer+1;
				this.objectdata.originedatatype=this.objectdata.datatype||"Object";
				this.objectdata.datatype=this.objectdata.datatype||"Object";
				this.appendWidget(node);
				node.fieldclickEvent=this.fieldclickEvent;
				debugger;
				//src='images/tree/3-40.png';
				this.Background({filltype:'image',image:src},function(){
					ths.paint();
				});
			}
			return this;
		};
		
		this.deletefield=function(){
			var parent=this.parent;
			var index=parent.widgets.indexOf(this);
			if(index<0)
				return;
			var presenter=this.collection().presenters[0];
			if(this.objectdata.targetpath){
				var connector=presenter.Widget(this.objectdata.targetpath);
				presenter.removeWidget(connector);
			}
			parent.removeWidget(this);
			if(parent.widgets.length>0){
				if(index==parent.widgets.length){
					parent.widgets[index-1].focus=true;
					presenter.focuswidget=parent.widgets[index-1];
				}
				else {
					parent.widgets[index].focus=true;
					presenter.focuswidget=parent.widgets[index];
				}
			}
			this.paint();
		};	
		
		this.findnode=function(attributename){
			for(var i=0;i<=this.widgets.length-1;i++){
				if(this.widgets[i].name===attributename)
					return this.widgets[i];
			}
			return null;
		};
		
		
		this.beforePaint=function(ctx){
			if(this.parent.type=="collection")
				this.objectdata.layer=0;
			else if(this.parent.type=="treeNode")
				this.objectdata.layer=this.parent.objectdata.layer+1;
			var lineheight=this.fontSize()+2*this.margin;
			var height=lineheight+Math.round(this.margin/2);
			if(this.widgets.length>0){
				$(this.widgets).each(function(i,item){
					item.y=height;
					height=height+item.height;
				})
				if(this.objectdata.targetpath){
					var connector=this.collection().presenters[0].Widget(this.objectdata.targetpath);
					if(connector){
						if(connector.end.position=='left'||connector.end.position=='right'){
							connector.end.y=relativeY(this)+lineheight/2;
							connector.end.offsetx=this.margin+this.objectdata.layer*(layerinst+iconwidth)+0.5;
						}
					}
				}
			}
			this.Height(height);
			if(this.parent){
				this.Width(this.parent.canvas.width);
			}	
		};
		
		var relativeY=function(node){
			var y=node.y;
			while(node.parent&&node.parent.type=="treeNode"){
				y+=node.parent.y;
				node=node.parent;
			}
			return y;
		}
		
		
		this.drawBorderTo=function(ctx){
			this.x=0;
			ctx.save();
			var ths=this;
			this.lineheight=ths.fontSize()+2*ths.margin;
			var _widget=this;
			if(this.widgets.length>0&&this.objectdata.targetpath){
				_widget.border.type="dashed";
				_widget.border.color="#00eeff";
			}
			if (_widget.border.color !== "none") {
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
				var left=this.margin+this.objectdata.layer*(layerinst+iconwidth)+0.5;
				var offsetX=this.objectdata.layer*3;
				ctx.strokeRect(left,-1,_widget.width-left-(this.objectdata.layer+1)*2+0.5,_widget.height+1);
			}
			this.drawImageTo(ctx);	
			ctx.restore();
			return this;
		};
		
		this.drawImageTo = function(ctx) {
			var _widget=this;
			var dx=1;
			if(_widget.background==null||_widget.background.filltype!="image")
				return;
			var image = _widget.background.image;
			if (image) {
				var left=this.margin+this.objectdata.layer*(layerinst+iconwidth)+iconwidth+3;
				if(this.parent.objectdata&&this.parent.objectdata.datatype=="MergedObject"){
					left=this.margin+(this.objectdata.layer-1)*(layerinst+iconwidth)+iconwidth+3;
				}	
				ctx.drawImage(image, left-iconwidth, this.margin/2, iconwidth,iconwidth);
			}
			return this;
		};
	
		var layerinst=5;
		var iconwidth=18;
		this.drawTextTo=function(ctx){
			var text=this.name;
			var margin=this.margin;
			var autosize=this.autosize||false;		
			ctx.save();
			debugger;
			var font=this.font;
			if(this.font.color==="none")
			   font=this.parent.font;
			if(this.focus){
				ctx.fillStyle= "#cae2ff";
				var left=margin+this.objectdata.layer*(layerinst+iconwidth)+3;
				if(this.parent.objectdata&&this.parent.objectdata.datatype=="MergedObject"){
					left=this.margin+(this.objectdata.layer-1)*(layerinst+iconwidth)+3;
				}
				ctx.fillRect(left,0,this.width-left-(this.objectdata.layer+1)*2,this.height-2);
				ctx.fillStyle="black";
				ctx.strokeStyle="black";
			}
			else{
				ctx.fillStyle=font.color||"black";
				ctx.strokeStyle=font.color||"black";
				if(this.objectdata&&this.objectdata.datatype=="MergedObject"){
					ctx.fillStyle="blue"
					ctx.strokeStyle="blue";
				}
			}
			if(font!=null&&text){
				if(typeof font==="String")
					ctx.font=font;
				else{
					ctx.font=font.style+" "+font.weight+" "+font.size+" "+font.family;
				}
				metrics=ctx.measureText(text);	
				this.minwidth=metrics.width+2*this.margin+this.objectdata.layer*(layerinst+iconwidth);
				var left=margin+this.objectdata.layer*(layerinst+iconwidth)+iconwidth+2*margin;
				if(this.parent.objectdata&&this.parent.objectdata.datatype=="MergedObject"){
					left=margin+(this.objectdata.layer-1)*(layerinst+iconwidth)+iconwidth+2*margin;
				}				
				font.fill=font.fill!=null?font.fill:true;
				if(font.fill)
					ctx.fillText(text,left,margin+this.parent.fontSize(),this.width-margin);
				else
					ctx.strokeText(text,margin,this.parent.fontSize()+margin);
				ctx.save()
				ctx.restore();
			}
			ths.drawImageTo(ctx);
			ctx.restore();
			return this;
		};
		
		this.keypress=function(e){
			if(e.keyCode===46){  //delete
				if(this.focus){
					this.deletefield();
					e.cancel=true;
				}		
			}
			else if(e.keyCode===45){  //insert
				this.newfield();
			}
			else if(e.keyCode===38){ //ctrl+up
				if(e.ctrlKey){					
					e.preventDefault();
					this.goup();
					e.cancel=true;
				}
				else{
					var parent=this.parent;
					var index=parent.widgets.indexOf(this);
					this.focus=false;
					if(index>0){
						this.collection().presenters[0].focuswidget=parent.widgets[index-1];
						parent.widgets[index-1].focus=true;
					}
					else if(ths.parent.type=="treeNode"){
						this.collection().presenters[0].focuswidget=ths.parent;
						ths.parent.focus=true;
					}
					parent.paint();
					e.preventDefault();
					e.cancel=true;
				}
			}
			else if(e.keyCode===40){ //ctrl+down
				if(e.ctrlKey){					
					e.preventDefault();
					this.godown();
					e.cancel=true;
				}
				else{
					var parent=this.parent;
					var index=parent.widgets.indexOf(this);
					this.focus=false;
					if(index<parent.widgets.length-1){
						this.collection().presenters[0].focuswidget=parent.widgets[index+1];
						parent.widgets[index+1].focus=true;
						parent.paint();
					}
					e.preventDefault();
					e.cancel=true;
				}
			}
		};

		this.goup=function(){
			var _a = this.parent.widgets;
			for(var i=0;i<=_a.length-1;i++){
				if(_a[i]===this&&i>0){
				  var _temp=_a[i-1];
				  _a[i-1]=this;
				  _a[i]=_temp;
				  this.parent.widgets[i-1]=this;
				  this.parent.widgets[i]=_temp;
				  this.parent.paint();
				  return;
				}					
			}
		};
		this.godown=function(){
			var _a = this.parent.widgets;
			for(var i=0;i<=_a.length-1;i++){
				if(_a[i]===this&&i<_a.length-1){
				  var _temp=_a[i+1];
				  _a[i+1]=this;
				  _a[i]=_temp;
				  this.parent.widgets[i+1]=this;
				  this.parent.widgets[i]=_temp;
				  this.parent.paint();
				  return;
				}					
			}
		};
		
		this.prev=function(e){
			var _a = this.parent.widgets;
			for(var i=0;i<=_a.length-1;i++){
				if(_a[i]===this&&i>0){	
				  this.parent.widgets[i].focus=false;
				  this.parent.widgets[i-1].focus=true;
				  this.parent.focuswidget=_a[i-1];
				  this.parent.paint();
				  if(this.parent.fieldclickEvent){
						this.parent.fieldclickEvent.call(this,e);
				  }
				  e.cancel=true;				  
				}					
			}
		};
		
		this.next=function(e){
			var _a = this.parent.widgets;
			for(var i=0;i<=_a.length-1;i++){
				if(_a[i]===this&&i<_a.length-1){
				  this.parent.widgets[i].focus=false;
				  this.parent.widgets[i+1].focus=true;
				  this.parent.focuswidget=_a[i+1];
				  this.parent.paint();
				  if(this.parent.fieldclickEvent){
						this.parent.fieldclickEvent.call(this,e);
				  }
				  e.cancel=true;
				}					
			}
		};
		
		this.getName=function(prefix){
			var f="treeNode";
			if (arguments.length === 1){
				if(this.findnode(prefix)==null)
					return prefix;
				else
					f=prefix;
			}
			var index=1;
			while(this.findnode(f+index)!=null){
				index++;
			}
			return f+index;
		};	
		
	};
	
	//*  collection
	collection=function(option){
		var opt={
				border:{
		        	width : 1,
		        	type:"solid", //solid, dotted,dashed
					color : "black"
		        },
				corner:null,
				background:{
					filltype:"image",
					color:"white",
					image:"images/tree/jsontree40.png"
				},
				font:{
					style:"normal", // normal,italic,
					weight:"bold",//normal,lighter,bold  
					family:"Arial",
	     			size:"12px",
	     			color:"black",
	     			fill:true
				},
				hyperlink :null,
				shadow:{
		        	color : "black",
					offsetX : 4,
					offsetY : 4,
					blur : 4
		        },
				width:180,
				height:260,
				includeChildren: false,
				references:[]
		};
		$.extend(opt,option);
		$.extend(this,new widget(opt));
		this.propertyEditors=["common"];
		this.gradient=null;
		var ths=this;
		this.margin=6;
		this.type="collection";	
		this.allowRotate=false;
		this.click=function(e){
			for(var i=0;i<=this.widgets.length-1;i++){
				this.widgets[i].focus=false;
			}	
			if(this.presenters[0].focuswidget!=this)
				this.presenters[0].focuswidget.focus=false;
			this.focuswidget=null;
			if(option.click)
				option.click.call(this,e);			
			this.paint();
		};
		
		if(!this.includeChildren&&option.widgets&&option.widgets.length>0){
			var _widgets=[];
			$.extend(_widgets,option.widgets);
			option.widgets.splice(0,option.widgets.length);
			this.restoreChildren(_widgets,{
				editable:true,
				click:this.click
			});
		}

		this.persist=function(){
			var r=widget.persistproperty(this);
			return r;
		};
		
		this.dblclick=function(e){
			if(e.y>this.lineheight)
				e.cancel=true;
		};
		
		this.keypress=function(e){
			if(e.keyCode===46){
				if(this.focuswidget){
					this.deletenode();
					e.cancel=true;
				}		
			}
			else if(e.keyCode===45){
				this.newfield();
			}
			else if(e.keyCode===38){
				var focusfield=this.focuswidget;
				if(e.ctrlKey){					
					if(focusfield!=null){
						e.preventDefault();
						focusfield.goup();
						e.cancel=true;
					}
				}
				else{
					if(focusfield!=null){
						e.preventDefault();
						focusfield.prev(e);						
					}	
					e.cancel=true;
				}
			}
			else if(e.keyCode===40){
				var focusfield=this.focuswidget;
				if(e.ctrlKey){					
					if(focusfield!=null){
						e.preventDefault();
						focusfield.godown();
						e.cancel=true;
					}
				}
				else{
					if(focusfield!=null){
						e.preventDefault();
						focusfield.next(e);
					}	
					e.cancel=true;
				}
			}
		};
		
		
		this.findtargets= function(e) {
			var ths=this;
			var targets=[];
			var findtarget=function(widget,e){
				var _a = widget.widgets;
				for (var i = _a.length - 1; i >= 0; --i) {
					if (_a[i].checkPointIn(e.x, e.y)) {
						var _cc = _a[i].relativePoint(e.x, e.y);
						var ev={};
						ev.x=_cc.x;
						ev.y=_cc.y;
						targets.push(_a[i]);
						findtarget(_a[i],ev);
						break;
					}
				}		
			}
			findtarget(this,e);
			return targets;
		};
		
		this.beforePaint=function(ctx){
			var lineheight=this.parent.fontSize()+2*this.margin;
			var height=lineheight+ths.margin;
			this.minheight=60;
			var  y=this.y;
			$(this.widgets).each(function(i,item){
				ths.minwidth=Math.max(ths.minwidth,item.minwidth);
				item.y=height+ths.margin;
				height+=item.height+ths.margin;
				item.width=this.width;
			})
			if(this.minheight<height){
				this.Height(height);
			}
			this.y=y;
		};
		
		this.drawBorderTo=function(ctx){
			ctx.save();
			var ths=this;
			this.lineheight=ths.fontSize()+2*ths.margin;
			var _widget=this;
			if (_widget.border.color !== "none") {
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
				if(!this.focus||!this.editable)
					ctx.strokeRect(-0.5,-0.5,_widget.width+0.5,_widget.height+0.5);
				
			}
			this.fillBackgroundTo(ctx);
			ctx.restore();
			return this;
		};
		
		this.fillBackgroundTo=function(ctx){
			if (this.background!=null && this.background.color !== "none") {
				ctx.save();
				ctx.fillStyle = this.background.color;
//				this.drawShadowTo(ctx);
				ctx.fillRect(0, 0,this.width,this.height);
				ctx.restore();				
			}
			if(this.focus&&this.editable){
				ctx.save();
				ctx.fillStyle="#cae2ff";
				ctx.fillRect(0, 0, this.width, ths.lineheight+ths.margin);
				ctx.restore();				
			}
			ctx.moveTo(0,ths.lineheight+ths.margin+0.5);
			ctx.lineTo(ths.width,ths.lineheight+ths.margin+0.5);
			ctx.stroke();
			this.drawImageTo(ctx);
		};	
		
		this.drawResizerTo=function(ctx){
			ctx.save();
			ctx.beginPath();
			ctx.globalAlpha = 1;
			ctx.fillStyle = "#cecfff";
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
		var iconwidth=18;
		this.drawImageTo = function(ctx) {
			var _widget=this;
			var dx=1;
			if(_widget.background==null||_widget.background.filltype!="image")
				return;
			var image = _widget.background.image;
			if (image) {
				var left=this.margin/2;
				ctx.drawImage(image, left, this.margin/2, iconwidth,iconwidth);
			}
			return this;
		};
		
		this.drawTextTo=function(ctx){
			var margin=this.margin;
			var text=this.name;
			ctx.save();
			if(this.font!=null&&this.text){
				if(typeof this.font==="String")
					ctx.font=this.font;
				else{
					ctx.font=this.font.style+" "+this.font.weight+" "+this.font.size+" "+this.font.family;
				}
				ctx.strokeStyle=this.font.color||"black";
					ctx.fillStyle=this.font.color||"black";
//				if(this.focus&&this.editable){
//					ctx.strokeStyle="white";
//					ctx.fillStyle="white";
//				}
				this.font.fill=this.font.fill!=null?this.font.fill:true;
				if(this.font.fill)
					ctx.fillText(text,margin+iconwidth,this.fontSize()+margin);
				else
					ctx.strokeText(text,margin+iconwidth,this.fontSize()+margin);
			}
			ctx.restore();
			return this;
		};
		
		this.getName=function(prefix){
			var f="treeNode";
			if (arguments.length === 1){
				if(this.findnode(prefix)==null)
					return prefix;
				else
					f=prefix;
			}
			var index=1;
			while(this.findnode(f+index)!=null){
				index++;
			}
			return f+index;
		};
		
		this.newfield=function(option){
			var attributename=this.getName();
			var opt={
				name:attributename,
			};
			$.extend(opt,option);	
			var node1=new treeNode(opt);
			node1.objectdata.name=attributename;
			this.addnode(node1);
			return node1;
		};
		
		this.addnode=function(node){
			if(node.type&&node.type==="treeNode"&&this.findnode(node.name)==null){
				node.objectdata.index=this.widgets.length+1;
				node.objectdata.layer=1;
				this.appendWidget(node);
				this.paint();
			}
			return this;
		};
		
		this.deletefield=function(){
			var parent=this.parent;
			var index=parent.widgets.indexOf(this);
			if(index<0)
				return;
			parent.removeWidget(this);
			if(parent.widgets.length>0){
				if(index==parent.widgets.length){
					parent.widgets[index-1].focus=true;
					this.focuswidget=parent.widgets[index-1];
				}
				else {
					parent.widgets[index].focus=true;
					this.focuswidget=parent.widgets[index];
				}
			}
			this.paint();
		};	
		
		this.findnode=function(attributename){
			for(var i=0;i<=this.widgets.length-1;i++){
				if(this.widgets[i].name===attributename)
					return this.widgets[i];
			}
			return null;
		};
	};
	
	mapConnector=function(option){
		var opt={
				name:"mapConnector",
				width:150,
				height:30,
				referpath:'',
				border:{
					width:1,
					type:"solid",
					color:"blue"
				},
				objectdata:{
					mappingtype:'MergedObject',
					targetpath:'',
					matchcriteria:{
						type:'object',
						fields:[
						        {id:"source",value:"",type:"textinput",title:"源"},
						        {id:"target",value:"",type:"textinput",title:"目标"}
						       ],
						values:[]
					},
					matchcriteria2:{
						type:'object',
						fields:[
						        {id:"source",value:"",type:"textinput",title:"源"},
						        {id:"target",value:"",type:"textinput",title:"目标"}
						       ],
						values:[]
					},
					fieldmaps:{
						type:'object',
						fields:[
						        {id:"source",value:"",type:"textinput",title:"源"},
						        {id:"target",value:"",type:"textinput",title:"目标"}
						       ],
						values:[]
					}
				}
		};
		
		$.extend(opt,option);		
		$.extend(this,new brokenLineConnector(opt));
		this.propertyEditors=["common"];
		this.text=this.text?this.name:this.text;
		this.border.type="solid";
		this.begin.shape.name="none";
		this.end.shape.name="arrow";
		this.type="mapConnector";
		var ths=this;
		
		var gettargetpath=function(node,enablemerge,excluderoot){
			var paths=[];
			if(node.type=="treeNode")
				paths.push(node.name);
			while(node.parent&&node.parent.type=="treeNode"){
				node=node.parent;
				paths.push(node.name);
			}
			if(ths.objectdata.mappingtype=="MergedObject"&&enablemerge){
				paths.splice(0,1);
			}
			if(!excluderoot)
				paths.push(node.parent.name);
			return paths.reverse().join(".");
		}
		
		this.gettargetpath=gettargetpath;
		
		this.persist=function(){
			var r=widget.persistproperty(this);
			r.offsetX=this.offsetX;
			r.offsetY=this.offsetY;
			r.linecap=this.linecap;
			r.minOffset=this.minOffset;
			r.begin=this.begin.persist();
			r.end=this.end.persist();
			r.begin.position=this.begin.position;
			r.end.position=this.end.position;
			r.targetpath=this.targetpath;
			r.elements=[];
			r.objectdata={};
			$.extend(r.objectdata,this.objectdata);
			if(this.objectdata.target){
				r.objectdata.targetpath=gettargetpath(this.objectdata.target,1,1);
				delete r.objectdata.target;
			}
			return r;
		};
		
		this.ondelete=function(){
			for(var i=0;i<=this.begin.widget.connections.length-1;i++){
				if(this.begin.widget.connections[i]===this)
					this.begin.widget.connections.splice(i,1);
			}
			for(var i=0;i<=this.end.widget.connections.length-1;i++){
				if(this.end.widget.connections[i]===this)
					this.end.widget.connections.splice(i,1);
			}
		
			if(this.objectdata.target)
				this.objectdata.target.parent.removeWidget(this.objectdata.target);
			else if(this.targetpath){
				var paths=this.targetpath.split(".");
				if(paths.length>0){
					this.end.widget.includeChildren=true;
					var collection=this.presenters[0].Widget(this.end.widget.name);
					this.objectdata.target=collection;
					for(var i=1;i<=paths.length-1;i++){
						this.objectdata.target=this.objectdata.target.Widget(paths[i]);
					}
					this.objectdata.target.parent.removeWidget(this.objectdata.target);
				}
			}
			
		};
		
		this.beforePaint=function(ctx){
			if(this.objectdata.mappingtype=="Array"){
				this.begin.shape.name="arrow";
				this.begin.shape.type=5;
			}
			else{
				this.begin.shape.name="none";
			}
			if(this.end.position!="left"&&this.end.position!="right"){
				if(this.end.widget.x>this.begin.widget.x+this.begin.widget.width){
					this.end.position="left";
					this.begin.position="right";
				}
				else if((this.begin.widget.x+this.begin.widget.width>this.end.widget.x)&&(this.begin.widget.x+this.begin.widget.width<this.end.widget.x+this.end.x)){
					if(this.begin.position!="left"){
						this.begin.position="left";
						this.end.position="left";
					}					
				}
				else if((this.begin.widget.x>this.end.widget.x)&&(this.begin.widget.x<this.end.widget.x+this.end.widget.width)){
					if(this.begin.position!="right"){
						this.begin.position="right";
						this.end.position="right";
					}
				}
				else if((this.end.widget.x+this.end.widget.width<this.begin.x)){
					if(this.begin.position!="right"){
						this.begin.position="right";
						this.end.position="left";
					}
				}
			}
		};
		
		this.onconnected=function(target){
			this.begin.widget.focus=false;
			this.end.widget.focus=true;
			this.presenters[0].focuswidget=this.end.widget;
			var newNode;
			var mappingtype="MergedObject";
			this.name=this.presenters[0].getName("Rule");
			this.text=this.name;
			debugger;
			if(target){
				if(target.objectdata.datatype=="Object"){
					newNode=target.newfield({
						name:this.begin.widget.name,
						text:this.begin.widget.name
					});
					mappingtype="Object";
				}
				else{
					alert("The target field data type is not object");
					this.parent.removeWidget(this);
					return;
				}
			}
			else{
				if(this.end.widget.widgets.length>0){
					mappingtype="Object";
				}
				newNode=this.end.widget.newfield({
					name:this.begin.widget.name,
					text:this.begin.widget.name,
					objectdata:{
						datatype:mappingtype,
					}
				});
			}
			this.end.offsetx=newNode.x;
			this.end.offsety=newNode.y;
			this.targetpath=gettargetpath(newNode);
			this.objectdata={
				target:newNode,
				mappingtype:mappingtype,
				matchcriteria2:{
					type:'object',
					fields:[
					        {id:"source",value:"",type:"textinput",title:"源"},
					        {id:"target",value:"",type:"textinput",title:"目标"}
					       ],
					values:[]
				},
				matchcriteria:{
					type:'object',
					fields:[
					        {id:"source",value:"",type:"textinput",title:"源"},
					        {id:"target",value:"",type:"textinput",title:"目标"}
					       ],
					values:[]
				},
				fieldmaps:{
					type:'object',
					fields:['source','target'],
					values:[]
				},
				targetpath:gettargetpath(newNode,1,1),
				layer:newNode.objectdata.layer,
				index:newNode.objectdata.index
			};
			if(mappingtype!="MergedObject"){
				this.objectdata.targetpath=gettargetpath(newNode,0,1);
			}
			
			if(mappingtype!="Array"){
				this.objectdata.matchcriteria.visible=false;
			}

			this.objectdata.target.objectdata={
					visible:false,
					datatype:mappingtype,
					targetpath:this.name
			};
			
			for(var i=0;i<=this.begin.widget.pk.length-1;i++){
				var field=this.begin.widget.pk[i];
				var name=field.name;	
				if(field.data.isfk){
					this.objectdata.matchcriteria2.values.push({source:name,target:name});
				}
				var prefix=gettargetpath(newNode,1,1);
				if(prefix)
					this.objectdata.matchcriteria.values.push({source:name,target:prefix+"."+name});
				else
					this.objectdata.matchcriteria.values.push({source:name,target:name});
				this.objectdata.fieldmaps.values.push({source:name,target:name});
				newNode.newfield({
					name:field.name,
					text:field.name,
					objectdata:{
						originedatatype:field.data.datatype,
						datatype:field.data.datatype,
					}
				});
			}
			for(var i=0;i<=this.begin.widget.fields.length-1;i++){
				var field=this.begin.widget.fields[i];
				var name=field.name;	
				if(field.data.isfk){
					this.objectdata.matchcriteria2.values.push({source:name,target:name});
				}
				newNode.newfield({
					name:field.name,
					objectdata:{
						originedatatype:field.data.datatype,
						datatype:field.data.datatype,
					}
				});
			}			
			var src='images/tree/json-40-1.png';
			if(this.objectdata.mappingtype=="MergedObject")
			    src="images/tree/lable.png"
			newNode.Background({filltype:'image',image:src},function(){
				ths.paint();
			});
		};
		
		this.refresh=function(){			
			for(var i=0;i<=this.begin.widget.pk.length-1;i++){
				var r=this.begin.widget.pk[i].persist();
				var field1=new field(r);
				field1.data.isfk=true;
				if(this.end.widget.findfield(field1.name)!=null){
					field1.name=this.begin.widget.getName(this.begin.widget.name+"_"+r.name);
					field1.data.name=field1.name;
					field1.text=field1.name;
				}
				this.end.widget.addfield(field1);
			}
		};
	};
	
	
		
	 $.register("collection",collection);
	 $.register("treeNode",treeNode);
	 $.register("mapConnector",mapConnector);
})(jQuery);