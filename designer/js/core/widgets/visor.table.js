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
		this.propertyEditors=["common"];
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
		        objectdata:{
					customsql:"",
					offset:""						
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
		this.propertyEditors=["common"];
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
			r.objectdata={};
			$.extend(r.objectdata,this.objectdata);
			r.fields=[];
			for(var i=0;i<=this.fields.length-1;i++)
				r.fields.push(this.fields[i].name);
			r.settings={};
			$.extend(r.settings,this.settings);

			delete r.font;
			delete r.background;
			delete r.shadow;
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
				if(this.background.filltype=="color")
					iconwidth=0;
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
				alert("Foreign key was not able to be deleted, you can delete relatitve connection to remove foreign Key"); //外键不能这样删除,如果要删除外键，请删除连接关联
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