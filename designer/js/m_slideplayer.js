$(document).ready(function(){
	 var type=$.queryString("type")?$.queryString("type"):"workflow";
	
	 debugger;
	 var theme=$.queryString("theme");
	 
	 if(theme!=null)
			$(".theme-background").css("background-color",theme);
	 
	 var frameElement=function(){
		 if(top!=this){
			 if(self.frameElement.tagName=="IFRAME"){
				 return self.frameElement;				
			 }
		 }
		 return null;
	 };
	 
	 slidePlayer=function(id,container,type,scale){		 
		var player1=new player({			 
			 parent:$(container),
			 type:type,
			 scale:scale,
			 id:id,
			 active:false,			 
			 updateInfo:function(){				 
				 $(".guide").text((this.pageindex+1)+"/"+this.size());
				 var scale=this.activePanel.scale;
				 $(".scale").text(scale.toFixed(1));			
				 $(".toolbar").css("left",document.body.clientWidth-60); 
				 var iframe=frameElement();
				 if(iframe){
					 var scalex=null;
					 $(iframe).attr("frameborder","no");					  
					 $(iframe).attr("border","0");
					 $(iframe).attr("scrolling","no");
					 $(iframe).attr("scrolling","no");
					 $(iframe).attr("allowtransparency","yes");
					 width=$(iframe).css("width");					 
					 width=Math.min(width.substring(0,width.length-2),this.activePanel.width);
					 scalex=width/this.activePanel.width;
					 iframe.height=this.activePanel.height*scalex;
					 					 
				 }
			 },
			 success:function(){
				 var ths=this;
				 var scale=(document.documentElement.clientHeight)/this.activePanel.height;
				 this.scale=scale;
				 var index=Math.round(Math.random()*10);
				 
			 },
			 end:function(){
				 this.setActive(0);
			 },
			 click:function(e){
//				 if(this.activePanel.targetwidget==null){
//					 this.next();
//				 }				 				
			 },
			 prepareEnter:function(){
				var requiredPaint=false;
				console.info(this.activePanel.totalsteps);
				if(this.activePanel.totalsteps>0){
					for(var i=0;i<this.activePanel.totalsteps;i++){
						var _animation=this.activePanel.animations.elements[i].value;
						if(_animation.enterstyle!=0){
							_animation.reset();										
							requiredPaint=true;
						}
					}
					this.activePanel.step=0;
					if(requiredPaint)
						this.activePanel.paint();
				}
			 }
		 });	 
		
		
		 
		 window.onresize=function(){
			 if(player1.activePanel){
				 var clientWidth=document.body.clientWidth;
				 var canvasWidth=player1.activePanel.width;
				 if(canvasWidth>clientWidth){
					 var scale=clientWidth/canvasWidth;
					 console.info("Scale="+scale);
					 player1.Scale(scale);
				 }
				 else
					 player1.Scale(1);
			 }
		 };
		 
		 var ismobileDevice = function(){
			var info = navigator.userAgent;
			if (info.indexOf("iPod") != -1|| info.indexOf("iPad") != -1	|| info.indexOf("iPhone") != -1	|| info.indexOf("Android") != -1) {
				return true;
			}
			else {			
				return false;
			}
		};
		
		function requestFullScreen(element) {
		    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
		    if (requestMethod) {  
		        requestMethod.call(element);
		    } else if (typeof window.ActiveXObject !== "undefined") {  
		        var wscript = new ActiveXObject("WScript.Shell");
		        if (wscript !== null) {
		            wscript.SendKeys("{F11}");
		        }
		    }
		}
		
		function cancelFullScreen(el) {
	            var requestMethod = el.cancelFullScreen||el.webkitCancelFullScreen||el.mozCancelFullScreen||el.exitFullscreen;
	            if (requestMethod) { // cancel full screen.
	                requestMethod.call(el);
	            } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
	                var wscript = new ActiveXObject("WScript.Shell");
	                if (wscript !== null) {
	                    wscript.SendKeys("{F11}");
	                }
	            }
	      }

		 
		 $(window).bind("keydown",function(e){
			var keyCode=e.keyCode;	
			var ctrdown=e.ctrlKey;
			if(keyCode==34|keyCode==40){
				e.preventDefault();
				player1.next();				
			}
			else if(keyCode==33||keyCode==38){
				e.preventDefault();
				player1.prev();
			}
			else if(keyCode===13){
				if(player1.playhandler!=null)
					player1.stop();
				else
					player1.play();
			}
			else if(keyCode===27){
				if(player1.playhandler!=null)
					player1.stop();				
			}		
			else if(keyCode===90){
				if(ctrdown){
					var scale=player1.scale||1;
					if(scale-0.1>0.1)
						scale-=0.1;
					player1.Scale(scale);
					$(player1.parent).find("canvas").each(function(index,item){
						$(item).css("height",item.height*scale);
					}); 
					if(player1.updateInfo)
						player1.updateInfo();
				}
				else{					
					var scale=player1.scale||1;
					if(scale+0.1<2.1)
						scale+=0.1;
					player1.Scale(scale);
					setTimeout(player1.activePanel.canvas.focus(),200);
					$(player1.parent).find("canvas").each(function(index,item){
						$(item).css("height",item.height*scale);
					}); 	
					if(player1.updateInfo)
						player1.updateInfo();
				}
			}
			console.info(keyCode);
		 });
	 };	 
	 var  id="";
	 slidePlayer(id,"#workspace",type,1);
});