(function($) {
	visordesigner=function(parent,opt){
		this.parent=$(parent);
		this.thumbnail=null;
		this.interval=20000;
		var ths=this;
		var offsetX=335,offsetY=80;
		/*opt.width=document.body.clientWidth-offsetX;
		opt.height=document.body.clientHeight-offsetY;*/
		$.extend(this,opt);		
		this.createdocument=function(parent,opt){
	    	 this.document=new visordocument(parent,opt);
	    	 var offset="0px";
	    	 ths.parent.find(".designer").each(function(i,item){
	    		 $(item).
	    		  css("left",offset)
				 .css("top",offset)			
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
	    	
	    	this.document.on("savedocument",function(){
				ths.trigger("savedocument");
				ths.resize();
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
					else if(focuswidget){
						 if(focuswidget.type=="table")
						  	focuswidget.visible=false;
						else							  	 
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
	 			setTimeout(function(){
	 				ths.resize();
	 			},500);
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
//				 $("#workspace").css("width",parseInt(target.width)+400);
//				 $("#workspace").css("height",parseInt(target.height)+400);
//				 $("#editor").scrollTop(200-20);
//				 $("#editor").scrollLeft(200-20);
 				 $("#workspace").css("width",parseInt(target.width));
				 $("#workspace").css("height",parseInt(target.height));
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
		
		this.init=function(schema,opts){
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
		
		this.resize=function(){
	    		var  width=document.body.clientWidth-offsetX-10,
					height=document.body.clientHeight-offsetY;
				for(var i=0;i<ths.document.activePanel.instance.widgets.length;i++){
					var _widget=ths.document.activePanel.instance.widgets[i];
					if(_widget.visible&&(_widget.y+_widget.height>height))
					    height=_widget.y+_widget.height+20;
				}
				ths.document.activePanel.instance.Height(height);
				ths.document.activePanel.instance.Width(width);
				$("#workspace,.designer").css("width",width);
				$("#workspace,.designer").css("height",height);
				ths.document.activePanel.instance.paint();
	    };	
	    	
		
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
		   mode:opt.mode,
		   width:opt.width,
		   height:opt.height
		});
		
		var _target="background";
		
		
		this.saveDocument=function(callback){
			 var ths=this;
			 var r={};			 
			 $.extend(r,this.document.persist());
			 this.trigger("save",r);
			 try{
				 localStorage.setItem("visordesigner",JSON.stringify(r));
				 console.info(r.data);
			 }
			 catch(e){
			 	console.error(e);
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
	    		/*if(this.document.activePanel.instance.focuswidget.type!="table"&&this.document.activePanel.instance.focuswidget.type!="field")
	    			ths.trigger("openpropertypanel",0);
	    		else
	    			ths.trigger("openpropertypanel",1);*/
	    		ths.trigger("openpropertypanel",0);
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
	    			
	    		if(_widget.type=="collection"){
	    			_widget.mouseup=function(e){
				 		var offset=e.currentTarget.x-currentPanel.width/(currentPanel.scale*2)-40;
				 		if(offset<0)
				 			e.currentTarget.x=currentPanel.width/(currentPanel.scale*2)+100;	
				 	}
				 	_widget.afterPaint=function(ctx){
				 		var offset=this.x-currentPanel.width/(currentPanel.scale*2)-40;
				 		if(offset<0){
				 			this.x=currentPanel.width/(currentPanel.scale*2)+100;
				 		}
				 	}
	    		}
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