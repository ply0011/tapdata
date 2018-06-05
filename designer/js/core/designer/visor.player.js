(function($) {
	player=function(opt){
		this.parent=$("document");
		this.panels=[];
		this.activePanel=null;
		this.pageindex=0;
		this.scale=1;
		this.scaleType=1; //1=fixed,2=width,3=height
		this.timeout=3000;
		this.updateinfo=null;
		this.id=null;
		this.showtype=-1;
		this.name="";
		this.speed=1000;
		this.loops=false;		
		this.playhandler=null;
		this.enableAnimation=true;
		$.extend(this,opt);
		var currentdoc=opt.currentdoc||null;
		if(typeof this.parent==="string")
			this.parent=$(this.parent);
		this.init(currentdoc);
	
		var showtips=false;
		var offsetx=0,offsety=0;
		var point={x:0,y:0};
		
		this.mousemove=function(e){
			 var ths=this;
			 var _widget=ths.activePanel.targetwidget;
			 if(_widget&&_widget.hyperlink&&((_widget.hyperlink.url!="")||(_widget.hyperlink.window!=""))&&!_widget.editable){
				 ths.activePanel.Cursor("pointer");
        	 }
			 else if(_widget&&_widget.type==="noticeboard"&&_widget.tooltip.text!=""){
				 ths.activePanel.Cursor("pointer");        		 
       			 showtips=true;
       			 console.info("showtips");
			 }
			 else{
				 ths.activePanel.Cursor("default");
				 if(showtips){
					 console.info("no active widget");
					 ths.activePanel.paint();
					 showtips=false;
				 }
			 }
			 if(e.button===0 && e.buttons===1){
				 offsetx=e.originalEvent.clientX-point.x;
				 offsety=e.originalEvent.clientY-point.y;
				 point.x=e.originalEvent.clientX;
				 point.y=e.originalEvent.clientY;
				 var scrollleft=$(this.parent).scrollLeft()-offsetx;
				 var scrolltop=$(this.parent).scrollTop()-offsety;
				 $(this.parent).scrollLeft(scrollleft);
				 $(this.parent).scrollTop(scrolltop);
			 }
			 if(opt.mousemove)
				 opt.mousemove(e);
		 };
		this.mouseup=function(e){
			 if(opt.mouseup)
				 opt.mouseup(e);
		};
		this.mousedown=function(e){
			 if(e.button===0){
				 point.x=e.originalEvent.clientX;
				 point.y=e.originalEvent.clientY;
			 }
			 if(opt.mousedown)
				 opt.mousedown(e);
		 };
		 
		this.click=function(e){		
			 if(opt.click)
				 opt.click.call(this,e);
		 };
	};
	
	player.prototype.setKeypress=function(e){
		var ths=this;
		ths.activePanel.canvas.addEventListener('keydown', function(e){
			ths.activePanel._triggerEvent("keypress", e);
		},true);
	};
	
	player.prototype.playGlobalAnimation=function(){
		if(this.activePanel.globalAnimations){	
			$(this.activePanel.globalAnimations).each(function(i,item){
				item.run();
			});
			this.playAnimation();
			
		}
	};
	
	player.prototype.pageIn=function(panel,showtype){
		var ths=this;
		var activePanel=null;
		activePanel=this.findPanel(panel);
		var $curPanel=this.parent.find("#"+panel);
		var direction=showtype===-1?Math.round(Math.random()*3+1):showtype;
		var width=ths.parent.css("width");
		var height=ths.parent.css("height");
		width=parseInt(width.substring(0,width.length-2));
		var portrait=parseInt($curPanel.find("canvas").attr("height"));
		var scale=document.body.clientHeight/activePanel.height+0.05;				
		this.scale=parseFloat(scale.toFixed(1));
		this.Scale(this.scale);	
		
	
		var fn_callback=function(){
			if(ths.updateInfo)
				ths.updateInfo();
			ths.playGlobalAnimation();
		};
		if(ths.prepareEnter&&ths.enableAnimation)
			ths.prepareEnter();
		
		if(direction===2){
//			right enter
			var distance=width;
			$curPanel.css("left",+distance).show().animate({left:0},ths.speed,fn_callback);
		}
		else if(direction===1){
//			left enter
			var distance=width;
			$curPanel.css("left",-distance).show().animate({left:0},ths.speed,fn_callback);
		}
		else if(direction===4){
//			top enter
			var distance=portrait;
			$curPanel.css("top",-distance).show().animate({top:0},ths.speed,fn_callback);
		}
		else if(direction===3){
//			bottom enter
			var distance=portrait;
			$curPanel.css("top",distance).show().animate({top:0},ths.speed,fn_callback);
		}
		else if(direction===5){
//			top left top enter
			var distance=portrait;
			$curPanel.css("top",distance).css("left",-distance).show().animate({top:0,left:0},ths.speed,fn_callback);
		}
		else if(direction===6){
//			bottom left bottom enter
			var distance=portrait;
			$curPanel.css("top",-distance).css("left",-distance).show().animate({top:0,left:0},ths.speed,fn_callback);
		}
		else if(direction===7){
//			top right top enter
			var distance=portrait;
			$curPanel.css("top",distance).css("left",distance).show().animate({top:0,left:0},ths.speed,fn_callback);
		}
		else if(direction===8){
//			bottom right enter
			var distance=portrait;
			$curPanel.css("top",-distance).css("left",distance).show().animate({top:0,left:0},ths.speed,fn_callback);
		}
		else if(direction===9){
//			fadein enter
			$curPanel.css("top",0).css("left",0).css("opacity",0.1).show().animate({opacity:1},ths.speed,fn_callback);
		}
		
	};
	
	player.prototype.setActive=function(panel){
		var ths=this;
		var pageinStyle;
		if(this.changing)
			return;
		if(typeof panel==="number"){
			pageinStyle=this.panels[panel].pageinStyle;
			panel=this.panels[panel].rootwidget.name;
		}
		else{
			pageinStyle=this.findPanel(panel).pageinStyle||-1;
		}
		pageinStyle=pageinStyle||-1;
		
		for(var i=0;i<this.panels.length;i++){
			if(this.panels[i].rootwidget.name===panel){
				this.activePanel=this.panels[i];
				this.pageindex=i;
				break;
			}
		}
		
		var sections=this.parent.find(".section:visible");
		if(sections.size()>1){
			sections.hide();
			ths.pageIn(panel,pageinStyle);
		}
		else{
			var $curPanel=this.parent.find(".section:visible");
			var _currentPanel=this.findPanel($curPanel.attr("id"));
			var pageoutStyle=_currentPanel.pageoutStyle||-1;
			if(this.showtype>0)
				pageoutStyle=this.showtype;	
			var direction=pageoutStyle===-1?Math.round(Math.random()*4+1):pageoutStyle;
			var landscape=document.body.clientWidth;
			var portrait=document.body.clientHeight;
			
			if($curPanel.attr("id")!=panel){
				this.changing=true;
				if(direction===2){
					ths.distance=landscape;
//					right-->left
					$curPanel.animate({left:-ths.distance},ths.speed,function(){
						$(this).hide().css("left",0).appendTo(ths.parent);						
						ths.pageIn(panel,pageinStyle);
						ths.changing=false;
					});				
				}
				else if(direction===1){
					ths.distance=landscape;
//					left-->right
					$curPanel.animate({left:ths.distance},ths.speed,function(){
						$(this).hide().css("left",0).appendTo(ths.parent);
						ths.pageIn(panel,pageinStyle);
						ths.changing=false;
					});
				}
				else if(direction===4){
					ths.distance=portrait;
//					top-->bottom
					$curPanel.animate({top:ths.distance},ths.speed,function(){
						$(this).hide().css("top",0).appendTo(ths.parent);
						ths.pageIn(panel,pageinStyle);
						ths.changing=false;
					});
				}
				else if(direction===3){
					ths.distance=portrait;
//					bottom-->top
					$curPanel.animate({top:-ths.distance},ths.speed,function(){
						$(this).hide().css("top",0).appendTo(ths.parent);
						ths.pageIn(panel,pageinStyle);
						ths.changing=false;
					});
				}
				else if(direction===5){
					ths.distance=portrait;
//					bottom-->top,right
					$curPanel.animate({top:-ths.distance,left:ths.distance},ths.speed,function(){
						$(this).hide().css("top",0).css("left",0).appendTo(ths.parent);
						ths.pageIn(panel,pageinStyle);
						ths.changing=false;
					});
				}
				else if(direction===6){
					ths.distance=portrait;
//					bottom-->top,left
					$curPanel.animate({top:-ths.distance,left:-ths.distance},ths.speed,function(){
						$(this).hide().css("top",0).css("left",0).appendTo(ths.parent);
						ths.pageIn(panel,pageinStyle);
						ths.changing=false;
					});
				}
				else if(direction===7){
					ths.distance=portrait;
//					top-->bottom,right
					$curPanel.animate({top:ths.distance,left:ths.distance},ths.speed,function(){
						$(this).hide().css("top",0).css("left",0).appendTo(ths.parent);
						ths.pageIn(panel,pageinStyle);
						ths.changing=false;
					});
				}
				else if(direction===8){
					ths.distance=portrait;
//					top-->bottom,left
					$curPanel.animate({top:ths.distance,left:-ths.distance},ths.speed,function(){
						$(this).hide().css("top",0).css("left",0).appendTo(ths.parent);
						ths.pageIn(panel,pageinStyle);
						ths.changing=false;
					});
				}
				else if(direction===9){
					ths.distance=portrait;
//					fadeout
					$curPanel.animate({opacity:0.2},ths.speed,function(){
						$(this).hide().css("top",0).css("left",0).css("opacity",1).appendTo(ths.parent);
						ths.pageIn(panel,pageinStyle);
						ths.changing=false;
					});
				}
			}
			else{
				this.activePanel.Scale(this.scale);
				ths.pageIn(panel,pageinStyle);
			}
			for(var i=0;i<this.panels.length;i++){
				if(this.panels[i].rootwidget.name===panel){
					this.activePanel=this.panels[i];
					this.pageindex=i;
					break;
				}
			}	
			ths.activePanel.designer=this;
			ths.activePanel.paint();
		}
	};
	
	player.prototype.init=function(doc){
		var ths=this; 
		var id=this.id?this.id:$.queryString("id");
		var currentdoc=doc;
		if(id!==undefined){	
			 $.restfulService(ctx+"/api/visordocument",{
				 async:true,
				 retrieveUrl:ctx+"/api/visordocument/"+id,
				 callback:function(data){
					currentdoc=data;
					if(currentdoc&&currentdoc!="undefined"){
						 ths.name=currentdoc.name;
						 ths.description=currentdoc.description;
						 ths.restorePanel(currentdoc);
						 ths.setActive(0);
					 }
					 if(ths.success && typeof ths.success=="function")
						 ths.success();
					 ths.Scale(ths.scale);
				 }
			 });			
		 }
		else{ 
			if(currentdoc===null){
				var r=localStorage.getItem("visordesigner");
				currentdoc=JSON.parse(r);
			}
			else if(currentdoc===null){
				var r=localStorage.getItem("currentDoc_"+this.type);
				currentdoc=JSON.parse(r);
			}
			 if(currentdoc&&currentdoc!="undefined"){
				 this.name=currentdoc.name;
				 this.description=currentdoc.description;
				 this.restorePanel(currentdoc);
				 this.setActive(0);
			 }
			 if(this.success && typeof this.success==="function")
				 this.success();
			 this.Scale(this.scale);
		}
		return this;
	};
	
	player.prototype.buildGif=function(callback)
	{
		var gif = new GIF({
			  workers: this.panels.length,
			  workerScript:ctx+"/res/js/gif.worker.js",
			  quality: 10
			});
		for(var i=0;i<=this.panels.length-1;i++){
			gif.addFrame(this.panels[i].canvas, {delay: 3000});
		};
		gif.on('finished', function(blob) {
			  if(callback)
				  callback(blob);
			  else
				  window.open(URL.createObjectURL(blob));
			});
		gif.render();
	};
	
	
	player.prototype.playAnimation=function(){
		var ths=this;
		function _playAnimation(){	
			var panel=ths.activePanel;		
			if(TWEEN.getAll().length>0)
		  	   requestAnimFrame(_playAnimation);			
			TWEEN.update();
			panel.paint();
		 };
		 _playAnimation();
	 };
	 
	player.prototype.next=function()
	{
		var ths=this;
		var _next=function(){
			var lastpage=true;
			if(ths.pageindex<ths.size()-1){
				ths.pageindex+=1;
				lastpage=false;
			}
			else if(ths.loops){
				ths.pageindex=0;
				lastpage=false;
			}
			if(!lastpage)
			   ths.setActive(ths.pageindex);
			else{
				if(ths.end)
					ths.end();
			}
		};
		
		if(this.activePanel.totalsteps>0&&this.activePanel.step==this.activePanel.totalsteps||this.palyAnimation==false){
			 _next();
		}				
		else if(this.activePanel.totalsteps>0 &&this.activePanel.step<this.activePanel.totalsteps){
			var _animation=this.activePanel.animations.elements[this.activePanel.step].value;
			_animation.enter();
			this.activePanel.step++;
			while(this.activePanel.step<this.activePanel.totalsteps&&!_animation.paused){
				_animation=this.activePanel.animations.elements[this.activePanel.step].value;
				_animation.enter();
				this.activePanel.step++;
			}					
			this.playAnimation();
		}
		else{
			 _next();
		}
		
	};
	
	player.prototype.prev=function()
	{
		if(this.pageindex>0){
			this.pageindex-=1;
			this.setActive(this.pageindex);
		}
	};
	
	player.prototype.play=function(){
		var ths=this;
		this.playhandler=setInterval(function(){
			ths.next();
		},this.timeout);
		$(".btn-play").html("<i class=\"fa fa-2x fa-pause\"></i>");
	};
	
	player.prototype.Scale=function(a){
		if(arguments.length===1){
			this.scale=a;
			for(var i=0;i<=this.panels.length-1;i++){
				var _scale=a;
				if(this.scaleType==2){
					_scale=this.width/this.panels[i].canvas.width; 	
				}
				else if(this.scaleType==3){
					_scale=this.height/this.panels[i].canvas.height;					
				}
				this.panels[i].Scale(_scale);
				$(this.panels[i].canvas).css("height",this.panels[i].canvas.height*_scale).css("width",this.panels[i].canvas.width*_scale);
			}
		}
		else
			return this.scale;
	};
	
	player.prototype.Zoom=function(a){
		if(arguments.length===1){
			this.scale=a;			
			for(var i=0;i<=this.panels.length-1;i++){
				this.panels[i].rootwidget.scaleX=a;
				this.panels[i].rootwidget.scaleY=a;
			}
		}
		else
			return this.scale;
	};
	
	player.prototype.stop=function(){
		if(this.playhandler){
			window.clearInterval(this.playhandler);
			this.playhandler=null;
			$(".btn-play").html("<i class=\"fa fa-2x fa-play\"></i>");
		}
	};
	
	player.prototype.newPanel=function(option,parent){
		var ths=this;
		panel=$.presenter({
	   	    	name:option.name,
	   	    	name:option.name,
	   	    	width:option.width,
	   	    	height:option.height,
	   	    	type:option.type,
	   	    	dom:parent,
	   	    	pageinStyle:parseInt(option.pageinStyle),
	   	    	pageoutStyle:parseInt(option.pageoutStyle),
	   	    	showgrid:option.showgrid,
	   	    	imageload:function(){
	   	    		setTimeout(function(){ths.activePanel.paint();},100);
	   	    	},
	   	    	scale:option.scale,
		        background:option.background,
		        click:function(e){
		        	if(option.click)
		        		option.click.call(ths,e);
		        	if(ths.click){
		        		ths.click.call(ths,e);
		        	} 
		        },			       
		        mousedown:function(e){
		        	if(ths.mousedown){
		        		ths.mousedown.call(ths,e);
		        	} 
		        },
		        mouseup:function(e){
		        	if(ths.mouseup){
		        		ths.mouseup.call(ths,e);
		        	} 
		        },
		        mousemove:function(e){
		        	if(ths.mousemove){
		        		ths.mousemove.call(ths,e);
		        	}
		        },
	     }); 
		 this.panels.push(panel);
		 this.activePanel=panel;
		 this.setKeypress();
	   	 $(panel.canvas).attr("ondrop","drop(event)").attr("ondragover","allowDrop(event)");
	   	 return panel;
	};
	
	player.prototype.size=function(){
		return this.panels.length;
	};	
	
	player.prototype.findPanel=function(panelName){
		for(var i=0;i<=this.panels.length-1;i++){
			if(this.panels[i].rootwidget.name===panelName)
				return this.panels[i];
		}
		return null;
	};
	
	player.prototype.restorePanel=function(doc){		 
		 var content=JSON.parse(doc.content);
		 var panels;
		 if(content.join)
			 panels=content;
		 else 
			 panels=content.panels;
		 this.id=doc.id;
		 this.name=doc.name;		 
		 var ths=this;
		 $(panels).each(function(i,panel){
			 var parent=$("<div class='section' id='"+panel.name+"' style='position:relative'></div>").appendTo(ths.parent); 
			 var connectors=[];
			 var panelinstance=ths.newPanel(panel,parent);
			 for(var i=0;i<panel.widgets.length;i++){
				 if(panel.widgets[i].begin!=null&&panel.widgets[i].end!=null)
						connectors.push(panel.widgets[i]);
				 else{
					 panel.widgets[i].click=player.widgetClickEvent;
					 var _widget=$.widgets(panel.widgets[i].type,panel.widgets[i]);
					 _widget.editable=ths.editable;
					 _widget.appendPresenter(panelinstance);
				 }
			 }
			 for(var i=0;i<=connectors.length-1;i++){
					var _widget=$.widgets(connectors[i].type,connectors[i]);
					 _widget.editable=ths.editable;
					if(_widget.begin&&_widget.begin.widget){
						 _widget.begin.widget=panelinstance.Widget(_widget.begin.widget);
					}
					if(_widget.end&&_widget.end.widget){
						 _widget.end.widget=panelinstance.Widget(_widget.end.widget);
					}
					_widget.appendPresenter(panelinstance);
			 }
			
			 var animations=new Map();
			 if(panel.animations){
				 $(panel.animations.elements).each(function(i,item){
					  var _widget=item.value.widget;	
					  var widget=panelinstance.Widget(_widget) 
					  if(widget!=null){
						  item.value.widget=widget;
						  var _animation=$.animation(item.value);
						  animations.put(item.key,_animation);
					  }
				 });	 
				 panelinstance.animations=animations;
			 };
			 panelinstance.totalsteps=animations.elements.length;
			 panelinstance.step=0;
			 panelinstance.paint();
		 });
	 };
})(jQuery);