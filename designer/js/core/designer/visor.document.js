(function($) {
	visordocument=function(parent,opt){
		this.id=null;
		this.type="slideshow";		
		this.name="";
		this.description="";
		this.activePanel=null;
		this.width=2500;
		this.height=1900;
		this.pagesize="1900X2500";
		this.pagedirection="horization";
		this.editable=true;
		this.showRelation=true;
		this.dpi=8;
		this.category=null;	
		this.showthumbnail=false;
		this.clusterclone=false;
		this.defaultconnectionType="brokenLineConnector-0322";
		this.defaulttableconnectionType="relationConnector-02120";
		this.defaultentityconnectionType="referenceConnector-012101";
		this.defaultmapconnectionType="mapConnector-0322";
		this.tables=new Map();
		var percent=2/3;
		var _width=document.body.clientWidth;
		if(self!=top)
			var _width=top.document.body.clientWidth-465;
		this.clientWidth=_width;
		this.separator=_width*percent;
		this.defaultfont={
				style:"normal",  //normal, italic
				weight:"normal", //normal,bold
				family:"微软雅黑",
     			size:"11pt",
				color:"black",
				fill:true
		};
		this.accesscontrolsetting={
				type:"public",//public,authorized,accesscode
				securitycode:"",
				enableapi:false
		};
		this.acl={
			editable:true
		};
		$.extend(this,opt);
		riot.observable(this);
		this.parent=parent;
		var ths=this;
		var principal="";
		this.findPanel=function(panelName){
			for(var i=0;i<=this.panels.length-1;i++){
				if(this.panels[i].instance.rootwidget.name===panelName)
					return this.panels[i];
			}
			return null;
		};
		
		this.getName=function(prefix){
			var f="slide";			
			if (arguments.length === 1){				
					f=prefix;
			}
			var index=1;
			while(this.findPanel(f+index)!=null){
				index++;
			}
			return f+index;
		};	
		
		this.newpage=function(){
			var _opt={
				name:ths.getName(this.prefix||'slide'),
				title:ths.getName(this.prefix||'slide'),
				width:ths.width,
				dpi:ths.dpi,
				aligngrid:false,
				height:ths.height,
				background:{
					filltype:"color",
		            image:null,		            
		            color:"#ffffff"
				},
				widgets:[]
			 };
			 var panel=new visorpanel(parent,_opt,this);
			 ths.panels.push(panel);
			 ths.activePanel=panel;
			 panel.on("_triggerEvent",function(event,e,instance){
				 ths.trigger(event,e,instance);
			 });
			 $(panel.instance.canvas).attr("ondrop","drop(event)").attr("ondragover","allowDrop(event)");
			 return panel;
		};
		
		this.restorePanel=function(data){
			var _panels=[];
			if(data){
				var content=JSON.parse(data);
				if(content.join)
					_panels=content;
				else if(content.panels)
					_panels=content.panels;
				this.accesscontrolsetting=content.accesscontrolsetting;
			}
			this.panels=[];
			$(_panels).each(function(i,item){
				 item.editable=ths.editable;
				 var panel=new visorpanel(parent,item,ths);			 
				 ths.panels.push(panel);
				 if(panel.instance.rootwidget.name===ths.activePanel)
					 ths.activePanel=panel;
				 panel.on("_triggerEvent",function(event,e,instance){
					 
					 ths.trigger(event,e,instance);
				 });
				 $(panel.instance.canvas).attr("ondrop","drop(event)").attr("ondragover","allowDrop(event)");
			});
		};
		this.restorePanel(this.content);
		delete this.content;
		if(this.panels.length==0){
			 this.newpage();
			 this.name= this.name||this.getName(this.type);
		}
		
		this.restoreDocument=function(data){
			$.extend(this,data);
			this.restorePanel(this.content);
			delete this.content;
		}
		
		var listSort=function(arraylist,sortby,direction,type){	
		    direction=direction.toUpperCase( );
		    var obj =arraylist.slice(0); 
			obj = obj.sort(function (a,b){
				 var dosort=function(fields,a,b,index){
					 var field=fields;
					 if((typeof fields=="object")&&fields.join){
						 if(!index)
							 index=0;
						 if(index<fields.length)
						 	field=fields[index];
						 else
							 return false;
					 }
					 if(a[field]){
							var codeA=a[field];
							var codeB=b[field];
						}
						else{
							var codeA=a.data.get(field)==null?'':a.data.get(field);
							var codeB=b.data.get(field)==null?'':b.data.get(field);
						}
						typeB=type||typeof codeB;
						typeA=type||typeof codeA;
						if(typeA!=typeB){
							return true;
						}
						var _type=typeB;
						if(typeof codeA=="object"&&codeA.join)					
							codeA=codeA.join(",");
						else if(typeof codeA=="object"&&codeA.text)
							codeA=codeA.text;
						else if(typeof codeA=="object"&&codeA.displayName)
							codeA=codeA.displayName;
						type=type||typeB;
						if(type=="object"&&codeB.join){
							codeB=codeB.join(",");
							_type="string";
						}
						else if(type=="object"&&codeB.text){
							codeB=codeB.text;
							_type="string";
						}
						else if(typeof type=="object"&&codeB.displayName){
							codeB=codeB.displayName;
							_type="string";
						}
						if(direction==="DESC"||direction==="ASC"||direction===" "){
							if(direction==="ASC"){
								t=codeA;codeA=codeB;codeB=t;
							}
							if (_type=="string"){
								try{
									var ret=codeB.localeCompare(codeA);
									if(ret==0&&typeof index=='number'){
										 return dosort(sortby,a,b,++index);
									}
									return ret;
								}
								catch(e){
									return true;
								}
							}
							else if(_type=="number"){
								var ret= codeB-codeA;
								if(ret==0&&typeof index=='number'){
									 return dosort(sortby,a,b,++index);
								}
								return ret;
							}
							else if(_type=="date"){
								var ret= Date.parse(codeB)-Date.parse(codeA);
								if(ret==0&&typeof index=='number'){
									 return dosort(sortby,a,b,++index);
								}
								return ret;
							}
						}
				 }
				 return dosort(sortby,a,b)
		   });
			return obj;
		};
		
		this.createTable=function(tb,panel,x,y){
				var FKs=new Map();
				x=x||100;
				y=y||180;
				var table1=new table({
					x:x,
					y:y,
					name:tb['table_name'],
					text:tb['table_name'],
					editable:true,
					visible:tb.visible,
					mode:ths.mode,
					silence:true,
					mouseup:function(e){
				 		var offset=e.currentTarget.x+e.currentTarget.width-ths.separator;
				 		if(offset>0)
				 			e.currentTarget.x=e.currentTarget.x-offset-10;	
				 	},
				 	beforePaint:function(ctx){
				 		var offset=this.x+this.width-ths.separator;
				 		if(offset>0)
				 			this.x=this.x-offset-10;	
				 	}
				}).appendPresenter(panel.instance);
			//todo
				table1.fieldclickEvent=visordesigner.fieldclickEvent;
				for(var j=0;j<=tb['fields'].length-1;j++){
					var field=tb['fields'][j];
					if(field.key=='PRI'){
						table1.newpk({
						    name:field['field_name'],
						    text:field['field_name'],
						    data:{
							    datatype:getDataType(field['data_type']),
							    isfk:field.foreign_key_table?true:false
						    },
						    silence:true
					    })
					}
					else{
						var  newfield=table1.newfield({
							name:field['field_name'],
							text:field['field_name'],
							data:{
								datatype:getDataType(field['data_type']),
								isfk:field.foreign_key_table?true:false
							},							
							silence:true,
							visible:(table1.mode=="full")||((table1.mode=="simple")&&(field.foreign_key_table?true:false))
						});
					}
					if(field.foreign_key_table){
						var key=field.foreign_key_table+"_"+table1.name;
						var fk=FKs.get(key);
						if(!fk)
						  fk={target:table1.name,source:field.foreign_key_table,source_column:field.foreign_key_column,target_column:field.field_name};
						else
						  fk.source_column=fk.source_column+","+field.foreign_key_column;
						  fk.target_column=fk.target_column+","+field.field_name;
						FKs.update(key,fk);
					}
				}
				ths.tables.update(tb["table_name"],table1);
				return  FKs;
		}
		
		this.restoreSchema=function(data){
			var panel1=this.newpage();
			var x=100,y=100;
			var FKs=[];
			$.widgets("label",{
				name:"label_source",
				x:0,
				y:0,
				text:"source-"+data.database_type,
				font:{
                        style:"normal", // normal,italic,
                        weight:"normal",//normal,lighter,bold  
                        family:"Arial",
                        size:"18pt",
                        color:"black",
                        fill:true
                   },
			}).appendPresenter(ths.activePanel.instance);
			$.widgets("label",{
				name:"label_target",
				x:ths.separator/ths.activePanel.instance.scale-20,
				y:0,
				text:"Target",
				font:{
                        style:"normal", // normal,italic,
                        weight:"normal",//normal,lighter,bold  
                        family:"Arial",
                        size:"18pt",
                        color:"black",
                        fill:true
                   },
			}).appendPresenter(ths.activePanel.instance);
			$.widgets("separator",{
				name:"separator1",
				editable:true,
				x:ths.separator,
				y:0				
			}).appendPresenter(ths.activePanel.instance);
			data.schema.tables=listSort(data.schema.tables,"table_name","ASC");
			for(var i=0;i<=data.schema.tables.length-1;i++){
				var tb=data.schema.tables[i];
				if(i<20){	
					tb.visible=true;
				}
				else{
					tb.visible=false;
				}
				var fks=this.createTable(tb,panel1,x,y).values();
				if(fks.length>0){
					$(fks).each(function(i,fk){
						FKs.push(fk);
					});
				}
				var table1=this.activePanel.instance.Widget(tb.table_name);
				if((table1.x+table1.width)>(this.activePanel.instance.width/3)){
					x=100;
					y+=100;
				}
				else{
					x=x+180;
					y=y+30;
				}
			}
			for(var i=0;i<=FKs.length-1;i++){
				var source=this.activePanel.instance.Widget(FKs[i].source);
				var target=this.activePanel.instance.Widget(FKs[i].target);
				if(target&&source)
					addFk(source,target);
			}
			panel1.instance.paint();
		}
		
		var  addFk=function(source,target){		
        	var myname=ths.activePanel.instance.getName("R");
        	var begin_position="top";        	
        	var	connectionType=ths.defaulttableconnectionType;
        	var type=connectionType.substring(0,connectionType.indexOf("-"));
			var value=connectionType.substring(connectionType.indexOf("-")+1,connectionType.length);
			var shapevalue=value.substring(0,1);
			var beginShape="none";
			if(shapevalue==="1")
				beginShape="dot";
			else if(shapevalue==="2")
				beginShape="arrow";		
			var beginType=parseInt(value.substring(1,2));
			
			shapevalue=value.substring(2,3);
			var endShape="none";
			if(shapevalue==="1")
				endShape="dot";
			else if(shapevalue==="2")
				endShape="arrow";	
			var endType=parseInt(value.substring(3,4));
        	
			var currentconnector=$.connector(type,{
				name:myname,
				text:myname,
				begin:new endpoint({
					x:source.width/2,
					y:source.height/2,
					shape:{
						name:beginShape, //dot,arrow
						type:beginType
					},
					position:begin_position,
					widget:source
				}),
				end:new endpoint({
					x:target.width/2,
					y:target.height/2,
					shape:{
						name:endShape, //dot,arrow
						type:endType,
					},
					widget:target
				}),
				editable:true
			});
			if(value.length>4){
				linetype=value.substring(4,5);
				if(linetype=="0")
					currentconnector.border.type="solid";
				else if(linetype=="1")
					currentconnector.border.type="dotted";
				else if(linetype=="2")
					currentconnector.border.type="dashed";
				if(type==="relationConnector"){
					currentconnector.key.identifying=linetype==="0"?true:false;
				}
				else if(type==="referenceConnector"){
					var referencetype=value.substring(5,6);
					if(referencetype==="1"){
						currentconnector.key.type="one-to-one";
					}
					else if(referencetype==="2"){
						currentconnector.key.type="one-to-many";
					}
					else if(referencetype==="3"){
						currentconnector.key.type="many-to-one";
					}
					else if(referencetype==="4"){
						currentconnector.key.type="many-to-many";								
					}							
				}
			}
			currentconnector.begin.widget.connections.push(currentconnector);
			currentconnector.end.widget.connections.push(currentconnector);
			currentconnector.appendPresenter(ths.activePanel.instance);
			$.command("new",ths.activePanel.instance,currentconnector.persist());
		}
		
		var getDataType=function(datatype){
			datatype=datatype.toLowerCase();
			if(datatype=='int')
				return 'integer';
			else if(datatype=='float'||datatype=='double'||datatype=='decimal')
				return 'number';
			return datatype;
				
		}
		
		
		this.createWidget=function(data){
			var font={
					style:"normal",  //normal, italic
					weight:"normal", //normal,bold
					family:"verdana",//寰蒋闆呴粦
	     			size:"11pt",
					color:"black",
					fill:true
			};
			$.extend(font,this.defaultfont);
			var opt;
			var widgetType;
			data=data.substring(data.indexOf(":")+1,data.length);
			if(data.indexOf("custom:")==0){
				var id=data.substring("7",data.length);
				widgetModel=$.restfulService(ctx+"/api/visorwidget/",{
					async:false,
					retrieveUrl:ctx+"/api/visorwidget/"+id
				});			
				var _a=widgetModel.items()[0];
				opt=JSON.parse(_a.content);
				opt.name=this.activePanel.instance.getName(opt.type);
				if(opt.background.image!=null&&opt.background.filltype==null)
					opt.background.filltype="image";
				opt.text=opt.text;
				opt.focus=true;
				opt.editable=true;
				opt.click=visordesigner.widgetClickEvent;
				widgetType=opt.type;
			}
			else if(data.indexOf("image:")==0){
				var props=data.split(";");
				var url=props[0].split(":")[1];
				var width=200;
				if(props[1])
				  width=props[1].split(":")[1];
				opt={};
				opt.type="box";
				opt.width=parseInt(width);
				opt.height=parseInt(width);
				opt.name=this.activePanel.instance.getName(opt.type);
				opt.text="";
				opt.focus=true;
				opt.background={
						filltype:"image",
						image:url,					
						imageType:"fill",
						color:"none"
				};
				opt.border={
						color:"none"
				};
				opt.editable=true;
//				opt.click=visordesigner.widgetClickEvent;
				widgetType=opt.type;
			}
			else{
				var widgetName;
				var option={};
				if(data.indexOf(":")<0){
					widgetType=data;
				}
				else{
					widgetType=data.substring(0, data.indexOf(":"));
					option=JSON.parse(data.substring(data.indexOf(":")+1,data.length));
				}
				widgetName=this.activePanel.instance.getName("New"+widgetType.slice(0, 1).toUpperCase() + widgetType.slice(1));		
				opt={
					name:widgetName,
					text:widgetName,
					focus:true,
					editable:true,
					font:font
				};
				$.extend(opt,option);
			}
			//todo
			var _widget=$.widgets(widgetType,opt);
			return _widget;
		};
		 
		this.size=function(){
			return this.panels.length;
		};	
	}
	
	visorpanel=function(parent,opt,document){
		var _name=opt.name;
		var _title=opt.title;
		var _width=opt.width;
		var _type=opt.type;
		var _height=opt.height;
		var _showgrid=opt.showgrid||false;
		var _pagesize=opt.pagesize;
		var _pagein=opt.pagein;
		var _pageout=opt.pageout;
		var _pagedirection=opt.pagedirection;
		var _dom=opt.dom;
		var _editable=opt.editable||false;
		var _scale=opt.scale||1;
		var _aligngrid=opt.aligngrid||false;
		var _background={};
		var offsetx=0;
		var offsety=0;
		this.parent=$(parent);
		this.document=document;
		$.extend(_background,opt.background);
		var ths=this;
		var instance;
		if(!_dom){
			_dom=$("<div></div>").addClass("designer")
			 .attr("id",_name).css("left",offsetx).css("top",offsety).css("position","relative").css("width",_width).css("height",_height);
			this.parent.find(".designer").hide();
			if(this.parent)
				 _dom.appendTo(this.parent);
		}
		
		this.copy=function(){
			 if(instance.focuswidget){
	   			 this.document.copyObj=instance.focuswidget.persist();
	   			 //this.document.copyObj.click=instance.focuswidget.click;
	   			 if(instance.focuswidget.fieldclickEvent)
	   				this.document.copyObj.fieldclickEvent=instance.focuswidget.fieldclickEvent;
	   		 }	   	
		};	
		
		this.paste=function(){
			var dist=25;
	   		if(this.document.copyObj!=null){
	   			if(instance.focuswidget){
//		   			if(this.propertyEditor!=null)
//			    		this.propertyEditor.close();
	   				instance.focuswidget.focus=false;	   	
	   			}
	   			this.document.copyObj.x+=dist;
	   			this.document.copyObj.y+=dist;
	   			this.document.copyObj.name=instance.getName(this.document.copyObj.type);
	   			var newObj=$.widgets(this.document.copyObj.type,this.document.copyObj).appendPresenter(instance);
	   		    instance.focuswidget=newObj;	   		    
	   			newObj.focus=true;
	   			newObj.editable=true;
//	   			this.updatePropertyEditor();
	   			ths.trigger("_triggerEvent","updatePropertyEditor",instance);
//	   			$.command("new",instance,newObj);
	   			newObj.paint();
	   		}
		};
		instance=$.presenter({
   	    	name:_name,
   	    	title:_title,
   	    	width:_width,
   	    	type:_type,
   	    	height:_height,
   	    	showgrid:_showgrid,
   	    	aligngrid:_aligngrid,
   	    	pagesize:_pagesize,
   	    	pagein:_pagein,
   	    	pageout:_pageout,
   	    	pagedirection:_pagedirection,
   	    	dom:_dom,
   	    	editable:ths.editable,   	    	
   	    	scale:_scale||1,
	        background:_background,
	        imageload:function(){
	        	ths.trigger("_triggerEvent","imageload",instance);
	        },
	        click:function(e){	
	        	if(instance.focuswidget&&instance.focuswidget.type.indexOf("Connector")>0){
	        		 var _widget=instance.focuswidget;
	        		 if(e.originalEvent.ctrlKey||ths.type==="slideshow"){
		 				if(_widget.resizer===0)
		 				{
		 					_widget.begin.x=_widget.begin.widget.width/2;
		 					_widget.begin.y=_widget.begin.widget.height/2;
		 					_widget.paint();
		 				}
		 				else if(_widget.resizer===_widget.resizers.length-1){
		 					_widget.end.x=_widget.end.widget.width/2;
		 					_widget.end.y=_widget.end.widget.height/2;
		 					_widget.paint();
		 				}
			 		 }
	        	 }
	        	ths.trigger("_triggerEvent","panel_click",e,instance);
	        },
	        keypress:function(e){
	        	 var key=e.keyCode;
	        	 var ctrdown=e.ctrlKey;
	        	 var step=e.ctrlKey?instance.dpi:1;
	        	 var keypressed=true;
	        	 if(ctrdown&&key==67&&instance.focuswidget!=null)  //ctrl+C
	        		 ths.copy();	
	        	 else if(ctrdown&&key==86&&ths.document.copyObj!=null) //ctrl+V
	        		 ths.paste();
	        	 else if(ctrdown&&key==88&&instance.focuswidget!=null){  //ctrl+X
	        		 ths.copy();
					 instance.deleteFocus();
					 ths.document.trigger("cutwidget");
	        	 }	
	        	 else if(key==46&&instance.focuswidget!=null){  //Delete
	        		 //instance.deleteFocus();
	        		 instance.focuswidget.visible=false;
	        		 riot.update();
	        	 }
	        	 else if(instance.selectwidgets.length>0){
					if (key===38){
						for(var i=0;i<=instance.selectwidgets.length-1;i++)
							instance.selectwidgets[i].y-=step;
					}else if (key===40){
						for(var i=0;i<=instance.selectwidgets.length-1;i++)
							instance.selectwidgets[i].y+=step;
					}else if (key===37){
						for(var i=0;i<=instance.selectwidgets.length-1;i++)
							instance.selectwidgets[i].x-=step;
					}else if (key===39){
						for(var i=0;i<=instance.selectwidgets.length-1;i++)
							instance.selectwidgets[i].x+=step;
					}
					else{
						keypressed=false;
					}
				  }
				  else if(instance.focuswidget!=null&&instance.focuswidget.editable){
					if (key===38){
						instance.focuswidget.y-=step;
					}else if (key===40){
						instance.focuswidget.y+=step;
					}else if (key===37){
						instance.focuswidget.x-=step;
					}else if (key===39){
						instance.focuswidget.x+=step;
					}
					else{
						keypressed=false;
					}
				  }
				  else{
						keypressed=false;
				  }
	        	  ths.trigger("_triggerEvent","keypress",e,instance);
	        	  if(keypressed){
	        		 e.preventDefault();
	    	         e.stopPropagation();	
	        		 instance.paint();
	        		 return false;
	        	  }
	        },
	        afterPaint:function(inst){
//	        	var selectionColor="#183f4c";
//	        	ths.trigger("_triggerEvent","afterPaint",null,inst);	
//	        	var ctx=this.canvas.getContext("2d");
//				ctx.save();
//				ctx.beginPath();
//				ctx.globalAlpha = 1;
//				ctx.fillStyle = selectionColor;
//				ctx.strokeStyle= selectionColor;
//				ctx.lineWidth = 1;	
//				ctx.fillRect(this.width*percent/this.scale-20,0,2,this.height/this.scale);
//				ctx.restore();		
	        }
        });
        
		var connectors=[];
		for(var i=0;i<opt.widgets.length;i++){
			 opt.widgets[i].silence=true;
			 if(opt.widgets[i].begin!=null&&opt.widgets[i].end!=null&&opt.widgets[i].type.indexOf("Connector")>0){
					connectors.push(opt.widgets[i]);
			 }
			 else{
			 	if(opt.widgets[i].type=="table"){
				 	opt.widgets[i].mouseup=function(e){
				 		var offset=e.currentTarget.x+e.currentTarget.width-ths.document.separator;
				 		if(offset>0)
				 			e.currentTarget.x=e.currentTarget.x-offset-10;	
				 	}
				 	opt.widgets[i].beforePaint=function(ctx){
				 		var offset=this.x+this.width-ths.document.separator;
				 		if(offset>0)
				 			this.x=this.x-offset-10;	
				 	}
			 	}
			 	if(opt.widgets[i].type=="collection"){
				 	opt.widgets[i].mouseup=function(e){
				 		var offset=e.currentTarget.x-ths.document.separator-10;
				 		if(offset<0)
				 			e.currentTarget.x=ths.document.separator+10;	
				 	}
				 	opt.widgets[i].afterPaint=function(ctx){
				 	
				 	}
			 	}
				 var _widget=$.widgets(opt.widgets[i].type,opt.widgets[i]);
				 _widget.editable=_editable;
				 _widget.appendPresenter(instance);
				 if(_widget.type=="table"||_widget.type=="entity"||_widget.type=="collection"){						
					_widget.fieldclickEvent=function(e,sender){
						ths.trigger("_triggerEvent","fieldclickEvent",e,this);
					}	
				 }
			 }
			
		 }
		 for(var i=0;i<=connectors.length-1;i++){
				var _widget=$.widgets(connectors[i].type,connectors[i]);
				 _widget.editable=_editable;
				if(_widget.begin&&_widget.begin.widget){
					 _widget.begin.widget=instance.Widget(_widget.begin.widget);
					
				}
				if(_widget.end&&_widget.end.widget){
					 _widget.end.widget=instance.Widget(_widget.end.widget);
				}
				if(_widget.begin.widget&&_widget.end.widget){
					_widget.begin.widget.connections.push(_widget);
					_widget.end.widget.connections.push(_widget);
					_widget.appendPresenter(instance);
				}
		 }
		 var animations=new Map();
		 if(opt.animations){
			 $(opt.animations.elements).each(function(i,item){
				  var _widget=item.value.widget;	
				  var widget=instance.Widget(_widget) 
				  if(widget!=null){
					  item.value.widget=widget;
					  var _animation=$.animation(item.value);
					  animations.put(item.key,_animation);
				  }
			 });	 
		 };
		 instance.animations=animations;
		 this.instance=instance;
		 
		 riot.observable(this);
		
		 instance.adddefaultconnection=function(e){
			var targetwidget;
			if(this.targetwidget.type=="connection"&&this.targetwidget.widgets.length>0){
				var targets=this.targetwidget.findtargets(e);				
				if(targets.length>0){
					targetwidget=targets[targets.length-1];
				}
			}
        	var myname=this.getName("R");
        	var begin_position="right";
        	if(this.connectionPoint===1)
        		begin_position="top";
	        else if(this.connectionPoint===3)
	        	begin_position="bottom";
		    else if(this.connectionPoint===4)
		    	begin_position="left";
        	var connectionType=ths.document.defaultconnectionType;
        	if(this.focuswidget.type==="table"&&this.targetwidget.type==="table")
        		connectionType=ths.document.defaulttableconnectionType;
        	else if(this.focuswidget.type==="entity"&&this.targetwidget.type==="entity")
        		connectionType=ths.document.defaultentityconnectionType;
        	if(this.focuswidget.type==="table"&&this.targetwidget.type==="collection")
        		connectionType=ths.document.defaultmapconnectionType;
        	var type=connectionType.substring(0,connectionType.indexOf("-"));
			var value=connectionType.substring(connectionType.indexOf("-")+1,connectionType.length);
			var shapevalue=value.substring(0,1);
			var beginShape="none";
			if(shapevalue==="1")
				beginShape="dot";
			else if(shapevalue==="2")
				beginShape="arrow";		
			var beginType=parseInt(value.substring(1,2));
			
			shapevalue=value.substring(2,3);
			var endShape="none";
			if(shapevalue==="1")
				endShape="dot";
			else if(shapevalue==="2")
				endShape="arrow";	
			var endType=parseInt(value.substring(3,4));
        	
			currentconnector=$.connector(type,{
				name:myname,
				text:myname,
				begin:new endpoint({
					x:this.focuswidget.width/2,
					y:this.focuswidget.height/2,
					shape:{
						name:beginShape, //dot,arrow
						type:beginType
					},
					position:begin_position,
					widget:this.focuswidget
				}),
				end:new endpoint({
					x:this.targetwidget.width/2,
					y:this.targetwidget.height/2,
					shape:{
						name:endShape, //dot,arrow
						type:endType,
					},
					widget:this.targetwidget
				}),
				editable:true
			});
			if(value.length>4){
				linetype=value.substring(4,5);
				if(linetype=="0")
					currentconnector.border.type="solid";
				else if(linetype=="1")
					currentconnector.border.type="dotted";
				else if(linetype=="2")
					currentconnector.border.type="dashed";
				if(type==="relationConnector"){
					currentconnector.key.identifying=linetype==="0"?true:false;
				}
				else if(type==="referenceConnector"){
					var referencetype=value.substring(5,6);
					if(referencetype==="1"){
						currentconnector.key.type="one-to-one";
					}
					else if(referencetype==="2"){
						currentconnector.key.type="one-to-many";
					}
					else if(referencetype==="3"){
						currentconnector.key.type="many-to-one";
					}
					else if(referencetype==="4"){
						currentconnector.key.type="many-to-many";								
					}							
				}
			}
			currentconnector.begin.widget.connections.push(currentconnector);
			currentconnector.end.widget.connections.push(currentconnector);
			currentconnector.appendPresenter(this);
			$.command("new",this,currentconnector.persist());
			if(currentconnector.onconnected!=null){
				currentconnector.onconnected(targetwidget);
				if(currentconnector.key)
				  currentconnector.key.name=currentconnector.name;
			}
       };
       
       var setKeypress=function(){
			instance.canvas.addEventListener('keydown', function(e){
				ths.instance._triggerEvent("keypress", e);
			},true);
		}
        setKeypress();
        
        var setcontextmenu=function(){
        	 var x,y;
			 $(instance.canvas).contextmenu({
				 'target':'#context-menu',
				  onItem: function(context,e) {
					  var _widget=instance.focuswidget;
					  var command=$(e.target).attr("alt");
					  if(command==="save"){
						 ths.document.trigger("savedocument");
					  }
					  else if(command==="newcollection"){
					  		 var  data="widget:collection";
						 	 var _widget=visordesigner.createWidget(data);
				    		_widget.x=x;
				    		_widget.y=y;
				    		_widget.Scale(instance.scale);
				    		_widget.appendPresenter(instance);
				    			_widget.fieldclickEvent=visordesigner.fieldclickEvent;
				    		_widget.mouseup=function(e){
							 		var offset=e.currentTarget.x-ths.document.separator-10;
							 		if(offset<0)
							 			e.currentTarget.x=ths.document.separator+10;	
							 	}
						 	_widget.afterPaint=function(ctx){
						 		var offset=this.x-ths.document.separator-10;
						 		if(offset<0){
						 			this.x=ths.document.separator+10;
						 		}
						 	}	
					  }	
					  else if(command==="deletecollection"){
					  		instance.deleteFocus();
					  }
				  },
				  before: function (e, element, target) {
				      e.preventDefault();
				      $("#context-menu").find("a").css("color","");
				      $("#context-menu").find("a[alt='deletecollection']").hide();
				      $("#context-menu").find("a[alt='newcollection']").hide();
				      var _widget=instance.focuswidget;				   
				      x=e.offsetX;
				      y=e.offsetY;
				      if(x>instance.width/(2*instance.scale)){
				      	 if(!_widget)
				      	 	$("#context-menu").find("a[alt='newcollection']").show();
				      }
				      if(_widget&&_widget.type=="collection"){
				      		$("#context-menu").find("a[alt='deletecollection']").show();
				      }
				      
				      	
				      return true;
				  }
			  });
		};
		setcontextmenu();
	}
	
	visorpanel.prototype.Scale=function(a){
		var ths=this;
		if(arguments.length==1){
			if(!this.width){
				var width=$(this.instance.canvas).prop("width");
				var height=$(this.instance.canvas).prop("height");
				this.width=width;
				this.height=height;
			}
			else{
				var width=this.width;
				var height=this.height;
			}
			var newwidth=width/a;
			var newheight=height/a;
		 	var target=ths.instance.rootwidget;
		 	ths.instance.scale=a;
		 	target.scale=a;
			target.Height(newheight);
			target.Width(newwidth);	
			for(var i=0;i<this.instance.widgets.length;i++){
				if(this.instance.widgets[i].type=="collection"){
					this.instance.widgets[i].x=this.instance.widgets[i].x*this.instance.widgets[i].scale/a;
					this.instance.widgets[i].scale=a;
				}
			}
		}
		else
			return this.instance.scale;
	}
	
	visorpanel.prototype.listTables=function(){
    	var tables=[];
    	var connections=[];
    	var widgets=[];
    	widgets=this.instance.selectwidgets;
    	if(widgets.length===0)
	   		widgets=this.instance.widgets;
    	    	
    	for(var i=0;i<=widgets.length-1;i++){
    		if(widgets[i].type=="table"){
    			var table=widgets[i];
    			tables.push(table.getdata());
    			for(var j=0;j<=table.connections.length-1;j++){
    				var connection=table.connections[j];
    				console.info(connection.type);
    				if(connection.type==="relationConnector"&&table==connection.begin.widget){
    					var k=connection.key;
    					k.source_owner=connection.begin.widget.settings.owner;	
    					k.source_prefix=connection.begin.widget.settings.prefix;
    					k.source=connection.begin.widget.name;
    					k.target_owner=connection.end.widget.settings.owner;
    					k.target_prefix=connection.end.widget.settings.prefix;
    					k.target=connection.end.widget.name;
    					k.elements=connection.fieldmaps.elements;	    						    					
    					connections.push(k);
    				}
    					
    			}
    		}
    	}
    	var r={};
    	r.tables=tables;
    	r.connections=connections;
    	r.option={};
    	r.option.datetime=new Date();
    	return r;
    };
    
    visorpanel.prototype.listEntities=function(){
    	var entities=[];
    	var widgets=[];
    	widgets=this.instance.selectwidgets;
    	if(widgets.length===0)
	    	widgets=this.instance.widgets;
    	for(var i=0;i<=widgets.length-1;i++){
    		if(widgets[i].type=="entity"){
    			var entity=widgets[i];
    			entities.push(entity.getdata());		    			
    		}
    	}
    	var r={};
    	r.entities=entities;
    	r.option={};
    	r.option.datetime=new Date();
    	return r;
    };
    
    visorpanel.prototype.listMapping=function(){
    	var widgets=this.instance.widgets;
    	var mappings=[]
    	for(var i=0;i<=widgets.length-1;i++){
    		if(widgets[i].type=="mapConnector"){
    			var connector=widgets[i];
    			var mapping={
    				from_table:connector.begin.widget.name,
    				custom_sql:connector.begin.widget.objectdata.customsql,
    				offset:connector.begin.widget.objectdata.offset,
    				to_table:connector.objectdata.targetpath,
    				join_condition:connector.objectdata.matchcriteria2.values,	 
    				relationship:(connector.objectdata.mappingtype=='Array'?'ManyOne':'OneOne'),
    				target_path:''
    			};
    			if(connector.objectdata.targetpath)
    				var paths=connector.objectdata.targetpath.split(".");
    			else
    				var paths=connector.persist().objectdata.targetpath.split(".");
    			mapping.target_path=connector.objectdata.targetpath;	
    			mapping.to_table=paths[paths.length-1];
    			if(paths.length>1)
    				mapping.to_table=paths[paths.length-2];
    			else
    				mapping.to_table=connector.end.widget.name;
    			if(connector.objectdata.mappingtype=="Array")
    			    mapping.match_condition=connector.objectdata.matchcriteria.values;
    			mappings.push(mapping);
    		}
    	}
    	return mappings;
    };
    
    visorpanel.prototype.listwidgets=function(){
    	var entities=[];
    	var widgets=[];
    	widgets=this.selectwidgets;
    	if(widgets.length===0)
	    		widgets=this.instance.widgets;	    	    	
    	for(var i=0;i<=widgets.length-1;i++){
    		if(widgets[i].type=="note"){
    			var entity=widgets[i];
    			entities.push(entity.persist());		    			
    		}
    	}
    	entities.sort();
    	var r={};
    	r.widgets=entities;
    	r.name=this.activePanel.instance.name;
    	r.option={};
    	r.option.datetime=new Date();
    	return r;
    };
	
	visordocument.prototype.persist=function(){
			var r={};
			r.id=this.id;
			r.version=this.version;
			r.type=this.type;
			r.description=this.description;
			r.createdBy=this.createdBy;
			r.createdDate=this.createdDate;
			r.lastModifiedBy=this.lastModifiedBy;
			r.lastModifiedDate=this.lastModifiedDate;
			r.fileCategoryId=this.fileCategoryId;
			r.name=this.name?this.name:this.getName(this.type);
			r.activePanel=this.activePanel.instance.rootwidget.name;	
			r.category=this.category;
			r.status=this.status;
			r.publishId=this.publishId;
			r.template=this.template;
			r.showRelation=this.showRelation;
			
			r.clusterclone=this.clusterclone;
			var _rootwidget=this.activePanel.instance.rootwidget;
			var _width=Math.min(300,_rootwidget.width);
			var _height=Math.min(300,_rootwidget.height);
//			if(this.cover&&this.cover.indexOf("data:image")<0)
//				r.cover=this.cover;
//			else
//				r.cover=this.activePanel.instance.rootwidget.getImageData(0,0,null,null,_width,_height);
			var _panels=[];
			var mappings=[];
			for(var i=0;i<this.panels.length;i++){
				var panel=this.panels[i];
				var _panel=panel.instance.persist();
				_panel.scale=1;
				_panel.width=panel.width||_panel.width;
				_panel.height=panel.height||_panel.height;
				if(panel.instance.animations!=null){		
					var animations=new Map();
					$(panel.instance.animations.elements).each(function(i,item){						
						var _animation=item.value.persist();						
						animations.put(item.key,_animation);						
					});
					_panel.animations=animations;
				}
				_panels.push(_panel);
				var _mappings=panel.listMapping();
				$(_mappings).each(function(i,mapping){
					mappings.push(mapping);
				});
			}
			var content={};
			content.panels=_panels;
			if(this.accesscontrolsetting){
				content.accesscontrolsetting={};
				$.extend(content.accesscontrolsetting,this.accesscontrolsetting);
			}
			r.content=JSON.stringify(content);
			r.data=JSON.stringify(mappings);
			return r;
	};
		
})(jQuery);