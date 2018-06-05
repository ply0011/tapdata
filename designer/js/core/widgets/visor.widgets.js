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
			originefieldname:{
				format:"string",
				title:"Original Name",
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
				title:"Array Unique <br>Keys",
				required:false,
				editable:false
			},
			matchcriteria2:{
				format:"list",
				title:"Unique Keys",
				required:false,
				editable:false
			},
			targetpath:{
				format:"string",
				title:"Target Path",
				required:false,
				editable:false
			},
			customsql:{
				format:"text",
				title:"Custom Sql <br>(optional)",
				required:false,
				editable:true
			},
			offset:{
				format:"string",
				title:"Offset <br>(optional)",
				required:false,
				editable:true
			}
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
   
    separator=function(option){
	   var opt={
				name:"ruler",
				width:100,
				height:100,
				corner:null,
				shadow:null,
				text:"",
				minwidth:16,
				minheight:16,
				border:{
					color:"black",
					width:1,
					type:"solid"
				},
				autosize:false,
				ruler:{
					type:"normal",//system,normal,custom
					direction:"vertical",//vertical,horizonal
					width:5
				},
				allowconnectionPoint:false
		};
		$.extend(opt,option);
		$.extend(this,new widget(opt));
		this.allowRotate=false;
		this.persist=function(){
			var r=widget.persistproperty(this);
			if(this.ruler){
				r.ruler={};
				$.extend(r.ruler,this.ruler);
			}
			return r;
		};
		this.text="";
		this.type="separator";
		this.calculateSize=function(ctx){
			if(this.ruler.direction==="vertical"){
				this.y=0;
				this.width=this.ruler.width;
				this.height=this.root.height;
			}
			else{
				this.x=0;
				this.width=this.root.width;
				this.height=this.ruler.width;
			}
			this.setResizers();
		};
		this.drawBorderTo=function(ctx){
			var _widget=this;
			if(this.ruler.direction==="vertical"){
				this.y=0;
			}
			else{
				this.x=0;
			}
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
				this.fillBackgroundTo(ctx);
				this.drawImageTo(ctx);	
				var l=4;
				var h=12;
				ctx.beginPath();
				if(this.ruler.direction==="vertical"){	
					var startY=0;
					ctx.moveTo(this.ruler.width,startY);
					ctx.lineTo(this.ruler.width,this.height);	
				}
				else{
					var startX=0;
					ctx.moveTo(startX,this.ruler.width);
					ctx.lineTo(this.width,this.ruler.width);	
				}
				ctx.stroke();
				ctx.restore();
			}
			else{
				this.fillBackgroundTo(ctx);
				this.drawImageTo(ctx);	
			}
			return this;
		};
     }

//     $.register("searchBox",searchBox);
//     $.register("keyboard",keyboard);
//     $.register("header",header);
//     $.register("footer",footer);
//     $.register("imageButton",imageButton);
//   $.register("button",button);
	 $.register("separator",separator);
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