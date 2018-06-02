(function($) {
	visordesigner=function(parent,opt){
		this.parent=$(parent);
		this.thumbnail=null;
		this.interval=20000;
		var ths=this;
		$.extend(this,opt);
		this.createdocument=function(parent,opt){
	    	 this.document=new visordocument(parent,opt);
	    	 ths.parent.find(".designer").each(function(i,item){
	    		 $(item).css("left","200px")
				 .css("top","200px")			
				 .css("position","relative");
	    	 });
	    	 riot.observable(this);
	    	 this.attachEvent();
	    	 this.on("navigation_loaded",function(){
	    		 ths.trigger("openpropertypanel",1);
	    		 window.onresize=function(){
	 				var height=70;
	 				var clientHeight=document.documentElement.clientHeight;
	 				var clientWidth=document.documentElement.clientWidth;
	 				var panelHeight=$("#panel_workspace .panel-heading").css("height");
	 				var height2=height+parseInt(panelHeight.substring(0,panelHeight.length-2));
	 				$("#editor").css("height",(clientHeight-height)+"px");
	 				$("#navigation").css("height",(clientHeight-height)+"px");
	 				$("#panel_propertyEditor").css("height",(clientHeight-height)+"px");
	 				$("#panel_login").css("left",(clientWidth-270)+"px");
	 				var panel_width=$("#panel_workspace").css("width");
	 				panel_width=parseInt(panel_width.substring(0,panel_width.length-2));
	 				$("#workspace-background").css("width",panel_width-30);
	 			};
	 			window.onresize(); 
	 		 	$("widgets img").attr("draggable",true);
			   	$("widgets img").attr("ondragstart","drag(event)");	  
			   	$("widgets img").attr("ondragstart","drag(event)");	  
			   	$("#widgets button").attr("draggable",true);
			   	$("#widgets button").attr("ondragstart","drag(event)");
				
				
				 $("#modalbackgroundFile").on('hide.bs.modal', function (e) {
					 ths.document.activePanel.instance.paint();
				 });
				 
				 $("#background_image_remove").bind("click",function(){
					 $("#backgroundFile").val("");
					 $("#backgroundFile").trigger("change"); 
					 ths.document.activePanel.instance.paint();
					 return false;
				 });
				 this.setActive(this.document.activePanel.instance.name);
	    	 });
	    	 riot.mount("diagrammenu,navigation,propertyEditorPage,propertyEditorWidget,diagramsetup,animation,diagramPublish",ths);
		};
		
		this.attachEvent=function(){
	    	var  panelClickEvent=function(e){
				 $("#pageName").trigger("blur"); 
				 $(".dropdown-menu").parent().removeClass("open");
				 $("#result").hide();
				 currentconnector=null;
				 ths.document.activePanel.instance.Cursor("default");
				 $(ths.document.activePanel.instance.canvas).contextmenu('closemenu',e);
				 $("#customwidgets img").contextmenu('closemenu',e);
				 ths.document.activePanel.instance.canvas.focus();	
			};
			
			this.document.on("fieldclickEvent",function(e,widget){
				ths.document.activePanel.instance.focuswidget=widget;
				visordesigner.fieldclickEvent.call(widget,e);
	    	});
			
			this.document.on("keypress",function(e,panel){
	    		var ctrdown=e.ctrlKey;
	    		var key=e.keyCode;
	    		if(ctrdown&&key==83){ //ctrl+S
	    			   ths.trigger("savedocument");
	        	}
	        	else if(key===112){ //F1
	        		 $('#modalShortcut').modal('show');
	        	}
	        	else if(key===113){ //F2
	        		 ths.trigger("openpropertypanel");
	        	}
	        	else if(key===114){ //F3
	        		 ths.trigger("openwidgetpanel");
	        	}
	        	else if(key===46){ //DELETE
	        	    var focuswidget=panel.focuswidget;
					if(focuswidget&&focuswidget.parent.deletefield){
						focuswidget.parent.deletefield(focuswidget);
					}				 
					else{
						panel.deleteFocus();	
					}
	        	}
	        	else if(key==90&&ctrdown){
	        		ths.trigger("undo");
	        	 }
	        	else if(key==89&&ctrdown){
	        		ths.trigger("redo");
	        	}
	    	});
			
	    	this.document.on("panel_click",function(e,panel){
	    		ths.trigger("updatepanel",panel);
	        	panelClickEvent(e);
	        	if(panel.focuswidget&&panel.focuswidget.type.indexOf("Connector")>0){
	        		 var _widget=ths.document.activePanel.instance.focuswidget;
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
	        	ths.updatePropertyEditor();
	        	ths.drawthumbnail();
	        	if(!ths.document.activePanel.instance.focuswidget){
	        		ths.trigger("openpropertypanel",1);
	        	}
	    	});
	    	
	    	this.on("selectbackgroundimage",function(target){
	 			 _target=target;	   
	 			 riot.mount("div[self='background_file']","modaldialog",this);
	 			 $("#backgroundfile").modal("show");
	 		});
	    	
	    	this.on("restore",function(schema){	    		
	    			var exportDoc=JSON.parse(schema);
			    	if(typeof exportDoc=='object'&&exportDoc.schema){
			    		 ths.reset();
			    		 exportDoc.id=null;	
			    		 ths.document.restoreSchema(exportDoc);
			    		 this.trigger("restoredocument");
			    	}	
	    	})
	    	
	    	
	    	this.on("display",function(id){
	    		ShowConfirmClose(false);
				ths.autoSave(false);
				//window.location.href=ctx+"/diagram/display?id="+id;	
	    	});
	    	
	    	this.on("dialogsubmit",function(name){	   
	    		if(name=="diagramsave")
	    			ths.saveDocument(function(data){	    				
	    				ShowConfirmClose(false);
	    				ths.autoSave(false);
	    				//alert(MESSAGE.SAVE_SUCCESSFULL);
	    				showmessage("#btn-save",MESSAGE.SAVE_SUCCESSFULL);
	    			});
	    	});
	    	
	 		this.on("savedocument",function(){
				if(!ths.document.name&& principal!=""){
					ths.trigger('documentsetup');
				}
				else
					 ths.trigger("dialogsubmit","diagramsave");
	 		});
	 		
	 		this.on("restoredocument",function(){
	 			$("#document-name").val(ths.title);
	 			$("#document-description").val(ths.description);
	 			ths.setActive(ths.document.activePanel.instance.name);
	 		});
	 		
	 		this.on("uploadFile",function(file){
	 			ths.uploadFile(file);
	 		});
	 		
	 		this.on("propertychange",function(widget,prop,name){
	 			var ths=this;
	 			var value;
	 			if(prop)
 					value=widget[prop][name];
 				else
 					value=widget[name];
	 			if(widget.type=="treeNode"){
	 				if(name=="name"){
		 				var targetpath=widget.objectdata.targetpath;
		 				var connector=ths.document.activePanel.instance.Widget(targetpath);
		 				if(connector){
		 					connector.objectdata.targetpath=value;
		 				}
	 				}
	 				else if(name=="datatype"){
						var  src='images/tree/40-1-1.png';
						if(value=="Array")
							src='images/tree/40-1.png';
						else if(value=="Object")
							src='images/tree/json-40-1.png';
						else if(value=="MergedObject")
							src="images/tree/lable.png";
						else if(value=="Date")
							src='images/tree/date-40-1.png';
						else if(value=="Integer")
							src='images/tree/number-40-1.png';	
	 					widget.Background({filltype:'image',image:src},function(){
	 						ths.document.activePanel.instance.paint();
	 					});
	 				}
	 			}
	 			else if(widget.type=="mapConnector"){	 				
	 				if(name=="mappingtype"){	
	 					if(widget.objectdata.target){
	 						widget.objectdata.target.objectdata.datatype=value;
	 					}
	 					else if(widget.objectdata.targetpath){
	 						var paths=widget.targetpath.split(".");
	 						if(paths.length>0){
	 							widget.end.widget.includeChildren=true;
	 							var tree=widget.presenters[0].Widget(widget.end.widget.name);
	 							widget.objectdata.target=widget.end.widget;
	 							for(var i=1;i<=paths.length-1;i++){
	 								widget.objectdata.target=widget.objectdata.target.Widget(paths[i]);
	 							}
	 							widget.objectdata.target.objectdata.datatype=value;
	 						}
	 					}
	 					widget.objectdata.targetpath=widget.gettargetpath(widget.objectdata.target,1,1);
						if(value=="Array"){
							src='images/tree/40-1.png';
						}
						else if(value=="Object")
							src='images/tree/json-40-1.png';
						else if(value=="MergedObject")
							src="images/tree/lable.png"
							
	 					widget.objectdata.target.Background({filltype:'image',image:src},function(){
	 						ths.document.activePanel.instance.paint();
	 					});	 					
	 					widget.objectdata.matchcriteria.values.splice(0,widget.objectdata.matchcriteria.values.length);
	 					widget.objectdata.matchcriteria2.values.splice(0,widget.objectdata.matchcriteria2.values.length);
	 					if(value=="Array")
		 					widget.objectdata.matchcriteria.visible=true;
						else
							widget.objectdata.matchcriteria.visible=false;
						
	 					widget.objectdata.fieldmaps.values.splice(0,widget.objectdata.fieldmaps.values.length);
	 					
	 					for(var i=0;i<=widget.begin.widget.pk.length-1;i++){				
							var name=widget.begin.widget.pk[i].name;	
							if(widget.begin.widget.pk[i].data.isfk){
								widget.objectdata.matchcriteria2.values.push({source:name,target:name});
							}
							if((value=="Array"||value=="Object")){
								widget.objectdata.matchcriteria.values.push({source:name,target:widget.objectdata.target.name+"."+name});
								riot.update();
							}
							else
								widget.objectdata.matchcriteria.values.push({source:name,target:name});
							widget.objectdata.fieldmaps.values.push({source:name,target:name});
						}
	 					return;
	 				}
	 			}
	 			else if(widget.type=="collection"&&prop==""){
	 				if(name=="name"){
	 					for(var i=0;i<widget.widgets.length;i++){
	 						if(widget.widgets[i].objectdata.targetpath){
	 							var targetpath=widget.widgets[i].objectdata.targetpath;
				 				var connector=ths.document.activePanel.instance.Widget(targetpath);
				 				if(connector){
				 					var paths=connector.objectdata.targetpath.split(".");				 					
				 					connector.objectdata.targetpath=paths.join(".");
				 				}
	 						}
	 					}
	 				}
	 			}
	 			this.document.activePanel.instance.paint();
	 		});
	 		
	 		this.off("publish").on("publish",function(){
	 			this.document.publishId=1;
	 			ths.saveDocument(function(data){	    				
	 				ths.document.publishId=data.publishId;
	 				riot.mount("diagramPublish",ths);
    			});
	 		})
	 		
	 		this.off("removepublish").on("removepublish",function(document){
	 			this.document.publishId=null;
	 			ths.saveDocument(function(data){	    				
	 				this.document.publishId=data.publishId;
	 				riot.mount("diagramPublish",ths);
    			});
	 		});
	 		
	 		
	 		this.on("activepage",function(item){
	 			if(item.name!=this.document.activePanel.instance.rootwidget.name){
		 			ths.setActive(item.name);
	 			}
	 		});
	 		
	 		this.on("removepage",function(panel){
	 			if(window.confirm(MESSAGE.REMOVE_PAGE_CONFIRM)){
	 				if(ths.document.panels.length==1){
	 					alert("至少要保留一个页面,不能再删除当前页面了");
	 					return;
	 				}
	 				ths.removepage(panel.name);
	 				riot.update();
	 			}
	 		});
	 		
	 		
	 		this.on("newpage",function(){
	 			var panel=this.document.newpage(); 
	 			ths.setActive(panel.instance.name);
	 		});
	 		
	 		ths.on("updatepanel",function(panel){
				riot.update();				
			});
			
			this.document.on("cutwidget",function(){
				 ths.updatePropertyEditor();
			});
			
			this.document.on("deletewidget",function(){
				 ths.updatePropertyEditor();
				 riot.mount("navigation",ths);
			});
	    }
		
		this.removepage=function(name)
		{				
			for(var i=0;i<this.document.panels.length;i++){				
				if(this.document.panels[i].instance.rootwidget.name===name){
					if(i>0)
						this.setActive(this.document.panels[i-1].instance.name)
					else
						this.setActive(this.document.panels[i+1].instance.name)
					this.document.panels.splice(i,1);
					i--;
				}
			}
			return this;
		};
		
		this.reset=function(){ 
	    	var ths=this;
	    	this.id=null;
	    	this.name=null;
	    	ths.document.panels.splice(0,ths.document.panels.length);
	    	$(".designer").remove();
	    };
	    
	    this.getActiveRect=function(){
			 var offsetY=$("#editor").scrollTop()-200;
			 var offsetX=$("#editor").scrollLeft()-200;
			 var x=Math.max(offsetX,0);
			 var y=Math.max(offsetY,0);
			 var w=$("#editor").css("width");
			 var h=$("#editor").css("height");
			 w=parseInt(w.substring(0,w.length-2))+offsetX;
			 h=parseInt(h.substring(0,h.length-2))+offsetY;					 				 
			 var width=Math.min(w,this.document.activePanel.instance.width)-x;
			 var height=Math.min(h,this.document.activePanel.instance.height)-y;
			 return {
				 x:x,
				 y:y,
				 width:width,
				 height:height
			 };
		};
		
		this.drawthumbnail=function(){
			if(this.thumbnail){
				this.thumbnail.owner=this.document.activePanel.instance;
				this.thumbnail.updateBoxSize(this.getActiveRect());
				this.thumbnail.refresh();
			}
		};
	    
	    this.createThumbnail=function(){
			var ths=this;
			var _thumbnail=$.thumbnails({
			 	height:200,
			 	width:400,
				dom:$("#thumbnail"),
				owner:this.document.activePanel.instance,
				activeRect:this.getActiveRect(),
				onboxchange:function(box,e){
					$("#editor").scrollLeft(box.x/ths.thumbnail.scale+200);
					$("#editor").scrollTop(box.y/ths.thumbnail.scale+200);
				}
			});
			this.thumbnail=_thumbnail;
			ths.drawthumbnail();
			return _thumbnail;
		};
		
		this.setActive=function(panel){
			var ths=this;		
			this.showthumbnail=localStorage.getItem("showthumbnail")=="true"||false;
			if(this.showthumbnail){
				$("#thumbnail-box").show();
			}
			else
				$("#thumbnail-box").hide();
			
			/* if(!ths.thumbnail&&ths.showthumbnail){
				 ths.createThumbnail();
			 }	*/
			this.updateDesktop=function(){
				var filltype=$("#backgroundfilltype").select2("val");
				var target=this.document.activePanel.instance.rootwidget;
				for(s in this.document.activePanel.instance.background){
					if(s!="image")
						target.background[s]=this.document.activePanel.instance.background[s];
				}
				for(s in this.document.activePanel.instance.gradient){
					if(s=="gradient")
						target.gradient[s]=this.document.activePanel.instance.gradient[s];
				}
				$(ths.document.activePanel.instance.canvas).css("height",ths.document.activePanel.instance.canvas.height*target.scale);
				
				this.document.activePanel.instance.paint();
				
			};
			
			var setdesktop=function(){
				 var target=ths.document.activePanel.instance.rootwidget;
				 $("#workspace").css("width",parseInt(target.width)+400);
				 $("#workspace").css("height",parseInt(target.height)+400);
				 $("#editor").scrollTop(200-20);
				 $("#editor").scrollLeft(200-20);
				 $("#editor").scroll(function(){
					 if(ths.showthumbnail)
						 ths.drawthumbnail();					
				 });
				 if(ths.thumbnail && ths.showthumbnail){
					ths.thumbnail.refresh();
				 }
				 else if(!ths.thumbnail&&ths.showthumbnail){
					 ths.drawthumbnail();
				 }
				 $(ths.document.activePanel.instance.canvas).css("height",ths.document.activePanel.instance.canvas.height*target.scale);
				 ths.updateDesktop();
			 }; 
			 this.parent.find(".designer:visible").hide();
			 if(typeof panel==="number"){
				 panel=this.document.panels[panel].instance.rootwidget.name;
			 }
			 $("#"+panel).show();
			 for(var i=0;i<this.document.panels.length;i++){
				if(this.document.panels[i].instance.rootwidget.name===panel){
					this.document.activePanel=this.document.panels[i];
					this.document.activePanel.active=true;
					this.pageindex=i;
				}
				else{
					this.document.panels[i].active=false;	
				}
			 }
			 setdesktop();			 
			// riot.mount("diagrammenu,navigation,propertyEditor,propertyEditorPage,propertyEditorWidget,diagramsetup,animation,diagramPublish",ths);
			 riot.update()
			 
			 $(".activePage").appendTo($("a[document='"+panel+"']").parent());
			 $(ths.parent).unbind();
			 $(ths.parent).bind("mousemove",function(e){
				 var layerX=e.clientX-$(this).offset().left+$(this).scrollLeft();
				 var layerY=e.clientY-$(this).offset().top+$(this).scrollTop();
				 var relativeX=layerX-200;
				 var relativeY=layerY-200;
				 e.layerX=layerX;
				 e.layerY=layerY;
				 e.offsetX=relativeX;
				 e.offsetY=relativeY;
				 var width=ths.document.activePanel.instance.width*ths.document.activePanel.instance.scale;
				 var height=ths.document.activePanel.instance.height*ths.document.activePanel.instance.scale;
				 if(relativeX<0||relativeY<0||relativeX>width||relativeY>height)
					 ths.document.activePanel.instance._triggerEvent("mousemove",e);
			 }).bind("mouseup",function(e){
				 var layerX=e.clientX-$(this).offset().left+$(this).scrollLeft();
				 var layerY=e.clientY-$(this).offset().top+$(this).scrollTop();
				 var relativeX=layerX-200;
				 var relativeY=layerY-200;
				 e.layerX=layerX;
				 e.layerY=layerY;
				 e.offsetX=relativeX;
				 e.offsetY=relativeY;
				 var width=ths.document.activePanel.instance.width*ths.document.activePanel.instance.scale;
				 var height=ths.document.activePanel.instance.height*ths.document.activePanel.instance.scale;
				 if(relativeX<0||relativeY<0||relativeX>width||relativeY>height)
					 ths.document.activePanel.instance._triggerEvent("mouseup",e);
			 });
			 if(this.updateInfo)
				this.updateInfo();
		};
		
		this.init=function(schema){
			 ths.reset();   
    		 ths.document.restoreSchema(schema||{});
    		 riot.mount("navigation",ths);
    		 ths.trigger("restoredocument");
		}
		
		this.restore=function(data){
			 ths.reset();   
    		 ths.document.restoreDocument(data||{});
    		 ths.trigger("restoredocument");
		}
		
		this.getJsonResult=function(){
			 var ths=this;
			 var r={};			 
			 $.extend(r,this.document.persist());
			 return r.data;
		}
		
		this.getDesignResult=function(){
			 var ths=this;
			 var r={};			 
			 $.extend(r,this.document.persist());
			 return r;
		}
		
//		var locafile=localStorage.getItem("visordesigner");
//		if(locafile){
//			ths.createdocument(parent,JSON.parse(locafile));
//			ths.setActive(ths.document.activePanel.instance.name);
//		 }
//		 else{
//			   ths.createdocument(parent,{
//				   name: opt.type+"_"+new Date().format("yyyyMMddhhmm"),
//				   category:opt.category
//			   });
//		 }

		ths.createdocument(parent,{
		   name: opt.type+"_"+new Date().format("yyyyMMddhhmm"),
		   category:opt.category,
		   mode:opt.mode
		});
		
		var _target="background";
		
		
		this.saveDocument=function(callback){
			 var ths=this;
			 var r={};			 
			 $.extend(r,this.document.persist());
			 this.trigger("save",r);
			 var content=JSON.stringify(r);
			 console.info(content.length);
			 try{
				 localStorage.setItem("visordesigner",JSON.stringify(r));
				 console.info(r.data);
			 }
			 catch(e){
			 	
			 }
			 ShowConfirmClose(false);
		 };
		
		 this.uploadFile=function(file){
			 var fileSocket = new fileUploadSocket({
					index: 0,
					sequence: 0,
					file: file,
					folder: this.category.id,
					user: principal,								
					onstarted: function() {
						uploading=true;			
						ShowConfirmClose(true);
					},
					oncompleted: function(data) {									
						uploading=false;									
						ShowConfirmClose(false);
						params.items.push(data);
						riot.update();
				}
			 });
		};
		
	};
	    
		visordesigner.widgetClickEvent=function(e){	
			if(e.target)
				console.info("widget "+e.target.name+" was clicked");
		};
		
		visordesigner.fieldclickEvent=function(e){
			  mydesigner.updatePropertyEditor();
			  e.y=this.y+this.height/2;
			  visordesigner.widgetClickEvent.call(this.parent,e);
		 };
		 
	    
	    visordesigner.prototype.autoSave=function(enabled){
	    	var ths=this;
	    	var interval=this.interval;
	    	if(enabled){
	    		if(this.playhandler!=null)
	    			window.clearInterval(this.playhandler);
	    		if(ths.document.id!=null)
			    	this.playhandler=setInterval(function(){		    		
			    		 ths.trigger("dialogsubmit","diagramsave")
			    	}, interval);
	    	}
	    	else if(!enabled&&this.playhandler!=null){
	    		window.clearInterval(this.playhandler);
	    		this.playhandler=null;
	    	}
	    	
	    };
	    
	    visordesigner.prototype.updatePropertyEditor=function(){
			var ths=this;
			var _widget=this.document.activePanel.instance.focuswidget;
			var widget1=null;
			if(_widget!=null)
				widget1=_widget.persist();
	    	if(this.document.activePanel&&this.document.activePanel.instance.focuswidget)
	    	{
	    		if(this.document.activePanel.instance.focuswidget.type!="table"&&this.document.activePanel.instance.focuswidget.type!="field")
	    			ths.trigger("openpropertypanel",0);
	    		else
	    			ths.trigger("openpropertypanel",1);
	    		ShowConfirmClose(true);
	    	}
	    	riot.mount("propertyEditorWidget",ths);
		};
	    
		visordesigner.createWidget=function(data){
			return mydesigner.document.createWidget(data);
		};
		
		
		visordesigner.drop=function(ev){
			var offsetX=40;
		 	var offsetY=40;
		 	ev.stopPropagation();
	    	ev.preventDefault();
	    	var data=ev.dataTransfer.getData("text");
	    	var files=ev.dataTransfer.files;
	    	var currentPanel=mydesigner.document.activePanel.instance;
	    	if(data.indexOf("move")==0){
	    		var table=data.split(":")[1];
	    		var point={};
	    		if(ev.offsetX){
	    			point.x=ev.offsetX-offsetX;
	    			point.y=ev.offsetY-offsetY;
	    		}
	    		else{
	    			point.x=ev.layerX-offsetX;
	    			point.y=ev.layerY-offsetY;
	    		}	
	    		var _widget=currentPanel.Widget(table);
	    		_widget.visible=true;
	    		_widget.x=point.x/currentPanel.scale;
	    		_widget.y=point.y/currentPanel.scale;
	    		riot.update();
	    		currentPanel.paint();
	    	}
	    	else if(data.indexOf("widget")>=0){
	    		var point={};
	    		if(ev.offsetX){
	    			point.x=ev.offsetX-offsetX;
	    			point.y=ev.offsetY-offsetY;
	    		}
	    		else{
	    			point.x=ev.layerX-offsetX;
	    			point.y=ev.layerY-offsetY;
	    		}	    		
	    		var _widget=visordesigner.createWidget(data);
	    		_widget.x=point.x/currentPanel.scale;
	    		_widget.y=point.y/currentPanel.scale;
	    		_widget.Scale(currentPanel.scale);
	    		_widget.appendPresenter(currentPanel);
	    		if(_widget.type==="table"||_widget.type==="entity"||_widget.type==="collection")
	    			_widget.fieldclickEvent=visordesigner.fieldclickEvent;
	    		if(currentPanel.focuswidget!=null){
	    			currentPanel.focuswidget.focus=false;
	    		}
	    		currentPanel.focuswidget=_widget;
	    		$.command("new",currentPanel,_widget.persist());
	    		currentPanel.paint();
	    	}
	    	else if(files!=null&&files.length>0){
	    		var currentPanel=mydesigner.activePanel.instance;
	    		var createimagewidget=function(result){
		    		opt={};
	    			opt.type="box";
	    			opt.width=450;
	    			opt.height=400;
	    			opt.name=currentPanel.getName("New"+opt.type);
	    			opt.text="";
	    			opt.focus=true;
	    			opt.background={
	    					filltype:"image",
	    					image:result,					
	    					imageType:"fill",
	    					color:"none"
	    			};
	    			opt.border={
	    					color:"none"
	    			};
	    			opt.editable=true;
	    			var _widget=$.widgets(opt.type,opt);
	    			return _widget;
		    	};
	    		for(var i=0;i<=files.length-1;i++){
	    			if(files[i].type.indexOf("image")>=0){	
	    				var point={};
	    				offsetX=450/2+i*20;
	    				offsetY=400/2+i*20;
	    	    		if(ev.offsetX){
	    	    			point.x=ev.offsetX-offsetX;
	    	    			point.y=ev.offsetY-offsetY;
	    	    		}
	    	    		else{
	    	    			point.x=ev.layerX-offsetX;
	    	    			point.y=ev.layerY-offsetY;
	    	    		}
	    	    		
	    	    		var reader = new FileReader();  
	    			    reader.onload=function(e){
	    			    	var result=this.result;	 
	    			    	if(currentPanel.targetwidget){
	    			    		if(currentPanel.targetwidget.background&&currentPanel.targetwidget.background.filltype=="image"){
		    			    		if(currentPanel.targetwidget.background.image==null||typeof currentPanel.targetwidget.background.image=="string"){
		    			    			var _a = document.createElement("img");
								    	_a.src=result;	
								    	currentPanel.targetwidget.background.image=_a;
		    			    		}
		    			    		else{
		    			    			currentPanel.targetwidget.background.image.src=result;
		    			    		}
	    			    		}
	    			    		else{
	    			    			var _widget=createimagewidget(result);
	    			    			_widget.x=point.x/currentPanel.scale;
				    	    		_widget.y=point.y/currentPanel.scale;
				    	    		_widget.Scale(currentPanel.scale);
				    	    		_widget.appendPresenter(currentPanel);
				    	    		if(currentPanel.focuswidget!=null){
				    	    			currentPanel.focuswidget.focus=false;
				    	    		}
				    	    		currentPanel.focuswidget=_widget;
				    	    		$.command("new",currentPanel,_widget.persist());
	    			    		}
	    			    	}
	    			    	else if(currentPanel.rootwidget.background.filltype=="image"){
	    			    		$("#backgroundImage").attr("src",result);
	    			    		if(currentPanel.rootwidget.background.image==null||typeof currentPanel.rootwidget.background.image=="string"){
		    			    		var _a = document.createElement("img");
							    	_a.src=result;
							    	currentPanel.rootwidget.background.image=_a;
	    			    		}
	    			    		else{
	    			    			currentPanel.rootwidget.background.image.src=result;
	    			    		}
	    			    	}
	    			    	else{
		    	    			var _widget=createimagewidget(result);
		    	    			_widget.x=point.x/currentPanel.scale;
			    	    		_widget.y=point.y/currentPanel.scale;
			    	    		_widget.Scale(currentPanel.scale);
			    	    		_widget.appendPresenter(currentPanel);
			    	    		if(currentPanel.focuswidget!=null){
			    	    			currentPanel.focuswidget.focus=false;
			    	    		}
			    	    		currentPanel.focuswidget=_widget;
			    	    		$.command("new",currentPanel,_widget.persist());
	    			    	}
	    			    	currentPanel.paint();
	    			    }; 
	    			    reader.readAsDataURL(files[i]);  
	    			}	    				
	    		}
	    	}
	    	mydesigner.updatePropertyEditor();
	    };
})(jQuery);
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
		this.defaultconnectionType="brokenLineConnector-0322";
		this.defaulttableconnectionType="relationConnector-02120";
		this.defaultentityconnectionType="referenceConnector-012101";
		this.defaultmapconnectionType="mapConnector-0322";
		this.tables=new Map();
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
				var FKs=[];
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
					silence:true
				}).appendPresenter(panel.instance);
			
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
						var fk={target:table1.name,source:field.foreign_key_table,source_column:field.foreign_key_column,target_column:field.field_name};
						FKs.push(fk);
					}
				}
				ths.tables.update(tb["table_name"],table1);
				return  FKs;
		}
		
		this.restoreSchema=function(data){
			var panel1=this.newpage();
			var x=100,y=100;
			var FKs=[];
			data.schema.tables=listSort(data.schema.tables,"table_name","ASC");
			for(var i=0;i<=data.schema.tables.length-1;i++){
				var tb=data.schema.tables[i];
				if(i<20){	
					tb.visible=true;
				}
				else{
					tb.visible=false;
//					ths.tables.update(tb["table_name"],tb);
				}
				x=x+180;
				y=y+30;
				if(x>=this.activePanel.instance.width/2){
						x=100;
						y+=100;
				}
				var fks=this.createTable(tb,panel1,x,y);
				if(fks.length>0)
				$(fks).each(function(i,fk){
					FKs.push(fk);
				});
					
			}
			for(var i=0;i<=FKs.length-1;i++){
				var source=this.activePanel.instance.Widget(FKs[i].source);
				var target=this.activePanel.instance.Widget(FKs[i].target);
				if(target&&source)
					addFk(source,target);
			}
			console.info(FKs);
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
		var offsetx=200;
		var offsety=200;
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
	        		 instance.deleteFocus(); 
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
	        	ths.trigger("_triggerEvent","afterPaint",null,inst);	
	        }
        });
		var connectors=[];
		for(var i=0;i<opt.widgets.length;i++){
			 opt.widgets[i].silence=true;
			 if(opt.widgets[i].begin!=null&&opt.widgets[i].end!=null&&opt.widgets[i].type.indexOf("Connector")>0){
					connectors.push(opt.widgets[i]);
			 }
			 else{
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
		 
//		 for(var i=0;i<=this.instance.widgets.length-1;i++){
//				var _widget=this.instance.widgets[i];
//				console.info(_widget.name+"-"+_widget.height);
//				 for(var ii=0;ii<=_widget.widgets.length-1;ii++){
//						console.info(_widget.widgets[ii].name+"-"+_widget.widgets[ii].height);
//				 }
//		 }
//		 
		 
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
//			$(window).unbind("keyup");
//			$(window).bind("keyup",function(e){
//				 var key=e.keyCode;
//	        	 var ctrdown=e.ctrlKey;
//	        	 e.preventDefault();
//	        	 e.stopPropagation();	        	 
//	        	 ths.document.activePanel.instance._triggerEvent("keyup", e);
//			});
		}
        setKeypress();
        
        var setcontextmenu=function(){
        	var principal="";
			 $(instance.canvas).contextmenu({
				 'target':'#context-menu',
				  onItem: function(context,e) {
					  var _widget=instance.focuswidget;
					  var command=$(e.target).attr("alt");
					  if(command==="paste"&&ths.document.copyObj){
						  ths.paste();
					  }
					  else if(command==="savepicture"){
						  if(_widget){
							  var imageData=_widget.getImageData(0,0);
							  Downloader.save(imageData,_widget.name+".png");
						  }
						  else{
							  var strData=instance.rootwidget.getImageData(0,0);
							  Downloader.save(strData,instance.title+".png");
						  }
					  }
					  if(_widget){
						  if(command==="copy"){
							  ths.copy();
						  }
						  if(command==="newitem"){
							  _widget.newfield();
						  }
						  if(command==="cut"){
							  ths.copy();
							  instance.deleteFocus();
							  ths.document.trigger("cutwidget");
						  }
						  else if(command==="duplicate"){
							  ths.copy();
							  ths.paste();
						  }
						  else if(command==="save"){
							  instance.paint();
							  ths.document.saveaswidget();
						  }
						  else if(command==="edit"){
							  ths._triggerEvent("dblclick",e);
							  this.closemenu();
						  }
						  else if(command==="delete"){		
							  var focuswidget=instance.focuswidget;
							  if(focuswidget&&focuswidget.type=="treeNode"){
							  	focuswidget.deletefield();
							  }
							  else if(focuswidget&&focuswidget.parent.deletefield){
								focuswidget.parent.deletefield(focuswidget);
							  }				 
							  else{
								instance.deleteFocus();	
							  }
							  ths.document.trigger("deletewidget");
						  }
						  else if(command==="bring to front"){
							  instance.focuswidget.topDepth();
							  instance.paint();
						  }
						  else if(command==="send to back"){
							  instance.focuswidget.downDepth();
							  instance.paint();
						  }
						  else if(command==="goup one step"){
							  instance.focuswidget.topStep();
							  instance.paint();
						  }
						  else if(command==="godown one step"){
							  instance.focuswidget.downStep();
							  instance.paint();
						  }
					  }
					  else if(instance.selectwidgets.length>0){
						  if(command==="delete"){	
							  instance.deleteFocus();	
							  ths.trigger("deletewidget");
						  }
					  }
						  
				  },
				  before: function (e, element, target) {
				      e.preventDefault();
				      $("#context-menu").find("a").css("color","");
				      var _widget=instance.focuswidget;
				      if(_widget==null||((_widget!=null)&&_widget.type!=="entity"&&_widget.type!=="table"&&_widget.type!=="collection"&&_widget.type!=="treeNode")){
				    	  $("#context-menu").find("a[alt='newitem']").hide();
				    	  $("#context-menu").find("a[alt='edit']").show();
				      }
				      else{
				    	  $("#context-menu").find("a[alt='newitem']").show();
				    	  $("#context-menu").find("a[alt='edit']").hide();
				      }
				    	  
				      
				      if (_widget== null) {
				          e.preventDefault();
				          $("#context-menu").find("a").css("color","gray");					        
				      }
				      else{
				    	  if(principal!="")
					    	  $("#context-menu").find("a[alt='save']").css("color","");
					      else
					    	  $("#context-menu").find("a[alt='save']").css("color","gray");
				      }
				      $("#context-menu").find("a[alt='savepicture']").css("color","");
				      if(instance.selectwidgets.length>0)
				    	  $("#context-menu").find("a[alt='delete']").css("color","");
				      
				      if(ths.document.copyObj)
				    	  $("#context-menu").find("a[alt='paste']").css("color","");
				      else
				    	  $("#context-menu").find("a[alt='paste']").css("color","gray");				      
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
(function($) {
	
	$.command=function(type,option){
	   	if(type==="new")
	   		return new newcommand(arguments[1],arguments[2]);
	   	else if(type==="delete")
	   		return new deletecommand(arguments[1],arguments[2]);
	   	else if(type==="move")
	   		return new movecommand(arguments[1],arguments[2],arguments[3],arguments[4]);
	   	else if(type==="change")
	   		return new propertychangecommand(arguments[1],arguments[2],arguments[3]);
	};
	
	var command=function(opt){
		var option={
			name:"command",
			target:null,
			presenter:null,
		};
		$.extend(option,opt);
		$.extend(this,option);
		this.type="command";
		this.undo=function(){};
		this.redo=function(){};
		return this;
	};
	
	newcommand=function(panel,widget){
		var option={
				name:panel.getName("newCommand"),
				presenter:panel,
				target:widget				
		};
		$.extend(this,new command(option));
		this.undo=function(){
			var _widget=this.presenter.Widget(this.target.name);
			if(_widget)
				this.presenter.removeWidget(_widget).paint();
		};
		this.redo=function(){
			$.widgets(this.target.type,this.target).appendPresenter(this.presenter).paint();
		};
		panel.history.push(this);
		return this;
	};
	
	deletecommand=function(panel,widget){
		var option={
				name:panel.getName("deletecommand"),
				target:widget,
				presenter:panel
		};
		$.extend(this,new command(option));
		this.redo=function(){
			if(typeof this.target==="object"&&!this.target.length){
				var _widget=this.presenter.Widget(this.target.name);
				if(_widget)
					this.presenter.removeWidget(_widget,true).paint();	
			}
			else if(typeof this.target==="object" && this.target.length && this.target.length>1){
				var ths=this;
				$(this.target).each(function(i,item){
					if(item.type.indexOf("connector")<0){
						var _widget=ths.presenter.Widget(item.name);
						if(_widget)
							ths.presenter.removeWidget(_widget,true);	
					}
				});
				this.presenter.paint();
			}
			
			
		};
		this.undo=function(){
			if(typeof this.target==="object"&&!this.target.length){
				this.target.editable=true;
				$.widgets(this.target.type,this.target).appendPresenter(this.presenter).paint();
			}
			else if(typeof this.target==="object" && this.target.length && this.target.length>0){
				var ths=this;
				var connectors=[];
				for(var i=0;i<this.target.length;i++){
					 if(this.target[i].begin!=null&&this.target[i].end!=null&&this.target[i].type.indexOf("Connector")>0){
							connectors.push(this.target[i]);
					 }
					 else{
						 var _widget=$.widgets(this.target[i].type,this.target[i]);
						 _widget.editable=true;
						 _widget.appendPresenter(ths.presenter);
//						 if(this.target[i].type=="table"||this.target[i].type=="entity"){						
//								_widget.fieldclickEvent=designer.fieldclickEvent;						
//						 }
					 }
					
				 }
				 for(var i=0;i<=connectors.length-1;i++){
						var _widget=$.widgets(connectors[i].type,connectors[i]);
						 _widget.editable=ths.editable;
						if(_widget.begin&&_widget.begin.widget){
							 _widget.begin.widget=ths.presenter.Widget(_widget.begin.widget);
							
						}
						if(_widget.end&&_widget.end.widget){
							 _widget.end.widget=ths.presenter.Widget(_widget.end.widget);
						}
						if(_widget.begin.widget&&_widget.end.widget){
							_widget.begin.widget.connections.push(_widget);
							_widget.end.widget.connections.push(_widget);
							_widget.appendPresenter(ths.presenter);
						}
				 }
				this.presenter.paint();
			}
			
			
		};
		panel.history.push(this);
		return this;
	};
	
	movecommand=function(panel,widget,position1,position2){
		var option={
				name:panel.getName("movecommand"),
				target:widget,//string 
				presenter:panel
		};
		$.extend(this,new command(option));
		this.undo=function(){
			var _widget=panel.Widget(this.target);
			_widget.x=position1.x;
			_widget.y=position1.y;
			_widget.width=position1.width;
			_widget.height=position1.height;
			_widget.paint();
		};
		this.redo=function(){
			var _widget=panel.Widget(this.target);
			_widget.x=position2.x;
			_widget.y=position2.y;
			_widget.width=position2.width;
			_widget.height=position2.height;
			_widget.paint();
		};
		panel.history.push(this);
		return this;
	};
	
	propertychangecommand=function(panel,widget1,widget2){
		var option={
				name:panel.getName("propertychangecommand"),
				target:widget1,//string 
				presenter:panel
		};
		$.extend(this,new command(option));
		this.undo=function(){
			var _widget=this.presenter.Widget(widget2.name);
			if(widget1.background)
			  $.extend(_widget.background,widget1.background);
			if(widget1.border)
				  $.extend(_widget.border,widget1.border);
			if(widget1.tail)
				  $.extend(_widget.tail,widget1.tail);
			if(widget1.shadow)
				  $.extend(_widget.shadow,widget1.shadow);
			if(widget1.font)
				  $.extend(_widget.font,widget1.font);
			if(widget1.functionPoints.length>0)
				  $.extend(_widget.functionPoints,widget1.functionPoints);
			panel.paint();
		
		};
		this.redo=function(){
			var _widget=this.presenter.Widget(widget1.name);
			if(widget2.background)
				  $.extend(_widget.background,widget2.background);
				if(widget2.border)
					  $.extend(_widget.border,widget2.border);
				if(widget2.tail)
					  $.extend(_widget.tail,widget2.tail);
				if(widget2.shadow)
					  $.extend(_widget.shadow,widget2.shadow);
				if(widget2.font)
					  $.extend(_widget.font,widget2.font);
				if(widget2.font.functionPoints.length>0)
					  $.extend(_widget.functionPoints,widget2.functionPoints);
			panel.paint();
		};
		panel.history.push(this);
		return this;
	};
	
})(jQuery);
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