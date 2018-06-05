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
					originefieldname:"",
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
				includeChildren:false
			}
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
			delete r.background;
			return r;
		};
		
		
		this.newfield=function(option){
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
			delete r.background;
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
			if(this.font!=null&&text){
				if(typeof this.font==="String")
					ctx.font=this.font;
				else{
					ctx.font=this.font.style+" "+this.font.weight+" "+this.font.size+" "+this.font.family;
				}
				ctx.strokeStyle=this.font.color||"black";
					ctx.fillStyle=this.font.color||"black";
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
			if(target){
				if(target.objectdata.datatype=="Object"){
					newNode=target.newfield({
						name:this.begin.widget.name,
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
					objectdata:{
						originefieldname:field.name,
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
						originefieldname:field.name
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
				}
				this.end.widget.addfield(field1);
			}
		};
	};
	
	
		
	 $.register("collection",collection);
	 $.register("treeNode",treeNode);
	 $.register("mapConnector",mapConnector);
})(jQuery);