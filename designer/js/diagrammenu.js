riot.tag2('diagrammenu', '<div> <div> <div class="diagrammenu-panel diagrammenu"> <div class="row"> <div class="component widget text-center"> <a href="#" onclick="{zoomout}"> <div data-type="textinput"> <div class="title" style="margin-bottom:10px;"><i class="fa fa-search-minus fa-2x"></i>Zoom In</div> </div> </a> </div> <div class="component widget text-center"> <a href="#" onclick="{zoomin}"> <div data-type="textinput"> <div class="title" style="margin-bottom:10px;"><i class="fa fa-search-plus fa-2x"></i>Zoom Out</div> </div> </a> </div> <div class="component widget text-center"> <a href="#" onclick="{savedocument}"> <div data-type="textinput"> <div class="title" style="margin-bottom:10px;"><img src="images/save.png">Save</div> </div> </a> </div> <div class="component widget text-center"> <a href="#" onclick="{cancel}"> <div data-type="textinput"> <div class="title" style="margin-bottom:10px;"><img src="images/cancel.png">Cancel</div> </div> </a> </div> <div class="component widget text-center"> <a href="#" onclick="{display}"> <div data-type="textinput"> <div class="title" style="margin-bottom:10px;"><img src="images/preview.png">Preview</div> </div> </a> </div> <div class="btn-group text-center"> <label><input type="checkbox" name="showRelation" __checked="{document.showRelation?true:false}" onclick="{showRelationchange}">Show ER Relationship</label> </div> <div class="component widget text-center"> <label><input type="checkbox" name="showSimple" __checked="{document.mode==\'simple\'?true:false}" onclick="{showSimplechange}">Simple Mode</label> </div> </div> </div> </div> <input type="file" style="display: none" id="documentFile" accept="text/plain">', '#menu li{ margin-bottom:0px; } .menu_title{ margin-bottom:-5px; font-size:9pt; } #menu.nav.nav-tabs li a{ padding-top:5px; padding-bottom:5px; } .diagrammenu .select2-container .select2-choice, .diagrammenu .select2-container-multi .select2-choices { padding-top:0px; height:30px; margin-top:0px; border-top:0px solid #dbdbdb; border-left:0px solid #dbdbdb; border-right:0px solid #dbdbdb; border-bottom:0px solid #dbdbdb; border-image-width:0px; -webkit-border-radius: 0px; -moz-border-radius: 0px; border-radius: 0px; background:white; filter: none; -webkit-box-shadow: inset 0 0px 0px rgba(0, 0, 0, 0.075); -moz-box-shadow: inset 0 0px 0px rgba(0, 0, 0, 0.075); box-shadow: inset 0 0px 0px rgba(0, 0, 0, 0.075); } .diagrammenu .sp-replacer { margin:0; overflow:hidden; cursor:pointer; height:32px; padding: 5px 4px 4px 3px; margin-top:0px; display:inline-block; *zoom: 1; *display: inline; border-top-width:0px; border-bottom:0px solid black; border:0px solid black; vertical-align: middle; } .diagrammenu .sp-replacer:hover, .diagrammenu .sp-replacer.sp-active { border-color: #aaa; border-bottom-width:0px; border-top-width:0px; } .btn-toolbaritem{ min-width:44px; height:32px; } .diagrammenu .btn-default{ backgroud:#d7dee3; border:none; } ul.dropdown-menu>li>a{ padding:5px 20px !important; } .diagrammenu .component{ padding: 10px 10px; width:140px; display:inline-block; }', '', function(opts) {
	this.designer=opts;
	this.document=opts.document;
	this.activePanel=opts.document.activePanel.instance;
	this.height=this.activePanel.canvas.height;
	this.width=this.activePanel.canvas.width;

	this.focuswidget=function(){
		return ths.activePanel.focuswidget;
	}
	this.defaultfont=this.document.defaultfont;
	this.defaultconnectionType=function(){
		return this.document.defaultconnectionType;
	}
	this.defaulttableconnectionType=this.document.defaulttableconnectionType;
	this.defaultentityconnectionType=this.document.defaultentityconnectionType;
	var ths=this;

	var windows=localStorage.getItem("visor_windows");
	if(windows===null){
		    windows={
		    		property:1,
		    		navigation:1,
		    		templatelist:1
		    };
	 }
    else{
    	windows=JSON.parse(windows);
    }

	var showPanels=function(windows){
    	for(s in windows){
			var key=s;
			var value=windows[key];
			if(value===1){
				$("#view-options").find("a[alt="+key+"]").find("i").removeClass("fa-square-o").addClass("fa-check-square-o");
			}
			else{
				 $("#view-options").find("a[alt="+key+"]").find("i").removeClass("fa-check-square-o").addClass("fa-square-o");
			}
		}
		if(windows.property===1){
			$(".propertyEditForm").show();
		}
		else{
			$(".propertyEditForm").hide();
		}

		if(windows.navigation===1){
			$("#navigation").show();
		}
		else{
			$("#navigation").hide();
		}

		if(windows.property===1){
			$("#panel_propertyEditor").show();
		}
		else{
			$("#panel_propertyEditor").hide();
		}
		$("#panel_workspace").removeClass("col-lg-8").removeClass("col-lg-12").addClass("col-lg-10");
		opts.trigger("showproperty",(windows.property===1));

	};

	this.designer.on("openpropertypanel",function(state){
		if(state!=null)
			windows["property"]=state;
		ths.openproperty();
	});

	this.designer.on("openwidgetpanel",function(){
		ths.openwidget();
	});

	this.openproperty = function(){
		var target="property"
    	if(windows[target]===1){
    		windows[target]=0;
			 $("#view-options").find("a[alt="+target+"]").find("i").removeClass("fa-check-square-o").addClass("fa-square-o");
		 }
		 else{
			 windows[target]=1;
			 $("#view-options").find("a[alt="+target+"]").find("i").removeClass("fa-square-o").addClass("fa-check-square-o");

		 }
		 localStorage.setItem("visor_windows", JSON.stringify(windows));
		 showPanels(windows);
	}.bind(this)
	this.openwidget = function(){
		var target="navigation"
	    	if(windows[target]===1){
	    		windows[target]=0;
				 $("#view-options").find("a[alt="+target+"]").find("i").removeClass("fa-check-square-o").addClass("fa-square-o");
			 }
			 else{
				 windows[target]=1;
				 $("#view-options").find("a[alt="+target+"]").find("i").removeClass("fa-square-o").addClass("fa-check-square-o");

			 }
			 localStorage.setItem("visor_windows", JSON.stringify(windows));
			 showPanels(windows);
	}.bind(this)

	this.lock = function(){
	 	if(ths.focuswidget()){
   			ths.focuswidget().editable=!ths.focuswidget().editable;
   		}
	 	ths.activePanel.paint();
	}.bind(this)

	this.duplicate = function(){
		ths.document.activePanel.copy();
		ths.document.activePanel.paste();
	}.bind(this)

	this.paste = function(){
		ths.document.activePanel.paste();
	}.bind(this)

	this.removewidget = function(){
		ths.activePanel.deleteFocus();
	}.bind(this)

	this.bringfont = function(){
		ths.activePanel.focuswidget.topDepth();
		ths.activePanel.paint();
	}.bind(this)

	this.setback = function(){
		 ths.activePanel.focuswidget.downDepth();
		 ths.activePanel.paint();
	}.bind(this)

	this.savedocument = function(e){
		e.preventDefault();
		e.stopPropagation();
		opts.trigger("savedocument");
	}.bind(this)

	this.cancel = function(){
		opts.trigger("cancel");
	}.bind(this)

	var  win=null;
	this.display = function(e){
		var r={};
		$.extend(r,this.document.persist());
		e.preventDefault();
		e.stopPropagation();
		opts.trigger("preview",r);

	}.bind(this)

	this.alignleft = function(){
		var panel1=ths.activePanel;
   		var x=0;
   		for(var i=0;i<panel1.selectwidgets.length;i++){
   			if(panel1.selectwidgets[i].type.indexOf("Connector")<0){
   				if(x==0)
   					x=panel1.selectwidgets[i].x;
   				else
   					x=Math.min(x,panel1.selectwidgets[i].x);
   			}
   		}
   		for(var i=0;i<panel1.selectwidgets.length;i++){
   			if(panel1.selectwidgets[i].type.indexOf("Connector")<0)
   				panel1.selectwidgets[i].x=x;
   		}
   		panel1.paint();
	}.bind(this)
	this.alignright = function(){
		var panel1=ths.activePanel;
   		var x=0;
   		for(var i=0;i<panel1.selectwidgets.length;i++){
   			if(panel1.selectwidgets[i].type.indexOf("Connector")<0){
   				if(x==0)
   					x=panel1.selectwidgets[i].x+panel1.selectwidgets[i].width;
   				else
   					x=Math.max(x,panel1.selectwidgets[i].x+panel1.selectwidgets[i].width);
   			}
   		}
   		for(var i=0;i<panel1.selectwidgets.length;i++){
   			if(panel1.selectwidgets[i].type.indexOf("Connector")<0)
   				panel1.selectwidgets[i].x=x-panel1.selectwidgets[i].width;
   		}
   		panel1.paint();
	}.bind(this)
	this.alignequalwidth = function(){
		var panel1=ths.activePanel;
   		var _widgets=[];
   		for(var i=0;i<panel1.selectwidgets.length;i++){
   			if(panel1.selectwidgets[i].type.indexOf("Connector")<0){
   				_widgets.push(panel1.selectwidgets[i]);
   			}
   		}
   		var space=Math.round(panel1.selectRect.width/_widgets.length);
   		for(var i=0;i<_widgets.length;i++){
   			_widgets[i].x=panel1.selectRect.x+i*space;
   		}
   		panel1.paint();
	}.bind(this)
	this.aligncenterhorizontal = function(){
		var panel1=ths.activePanel;
  		 var y=panel1.selectRect.y+panel1.selectRect.height/2;
  		 for(var i=0;i<panel1.selectwidgets.length;i++){
  			if(panel1.selectwidgets[i].type.indexOf("Connector")<0){
  				panel1.selectwidgets[i].y=y-panel1.selectwidgets[i].height/2;
  			}
  		 }
  		panel1.paint();
	}.bind(this)
	this.aligntop = function(){
		var panel1=ths.activePanel;
   		var y=0;
   		for(var i=0;i<panel1.selectwidgets.length;i++){
   			if(panel1.selectwidgets[i].type.indexOf("Connector")<0){
   				if(y==0)
   					y=panel1.selectwidgets[i].y;
   				else
   					y=Math.min(y,panel1.selectwidgets[i].y);
   			}
   		}

   		for(var i=0;i<panel1.selectwidgets.length;i++){
   			if(panel1.selectwidgets[i].type.indexOf("Connector")<0)
   				panel1.selectwidgets[i].y=y;
   		}
   		panel1.paint();
	}.bind(this)
	this.alignbottom = function(){
		var panel1=ths.activePanel;
   		var y=0;
   		for(var i=0;i<panel1.selectwidgets.length;i++){
   			if(panel1.selectwidgets[i].type.indexOf("Connector")<0){
   				if(y==0)
   					y=panel1.selectwidgets[i].y+panel1.selectwidgets[i].height;
   				else
   					y=Math.max(y,panel1.selectwidgets[i].y+panel1.selectwidgets[i].height);
   			}
   		}
   		for(var i=0;i<panel1.selectwidgets.length;i++){
   			if(panel1.selectwidgets[i].type.indexOf("Connector")<0)
   				panel1.selectwidgets[i].y=y-panel1.selectwidgets[i].height;
   		}
   		panel1.paint();
	}.bind(this)
	this.alignequalheight = function(){
		var panel1=ths.activePanel;
   		var _widgets=[];
   		for(var i=0;i<panel1.selectwidgets.length;i++){
   			if(panel1.selectwidgets[i].type.indexOf("Connector")<0){
   				_widgets.push(panel1.selectwidgets[i]);
   			}
   		}
   		var space=Math.round(panel1.selectRect.height/_widgets.length);
   		for(var i=0;i<_widgets.length;i++){
   			_widgets[i].y=panel1.selectRect.y+i*space;
   		}
   		panel1.paint();
	}.bind(this)
	this.aligncentervertical = function(){
		 var panel1=ths.activePanel;
   		 var x=panel1.selectRect.x+panel1.selectRect.width/2;
   		 for(var i=0;i<panel1.selectwidgets.length;i++){
   			if(panel1.selectwidgets[i].type.indexOf("Connector")<0){
   				panel1.selectwidgets[i].x=x-panel1.selectwidgets[i].width/2;
   			}
   		 }
   		panel1.paint();
	}.bind(this)

	this.showRelationchange = function(e){
	  var target=e.currentTarget;
	  var checked=target.checked;
	  name=target.name;
	  ths.document[name]=checked;
	  var panel1=ths.document.activePanel.instance;
	  for(var i=0;i<=panel1.widgets.length-1;i++){
	     if(panel1.widgets[i].type=="relationConnector")
  	        panel1.widgets[i].visible=checked;
	  }
	  panel1.paint();
	}.bind(this)

	this.showSimplechange = function(e){
	  var target=e.currentTarget;
	  var checked=target.checked;
	  name=target.name;
	  ths.document[name]=checked;
	  var panel1=ths.document.activePanel.instance;
	  for(var i=0;i<=panel1.widgets.length-1;i++){
	     if(panel1.widgets[i].type=="table")
  	        panel1.widgets[i].mode=checked?"simple":"full";
	  }
	  panel1.paint();
	}.bind(this)

	this.zoomout = function(){
		var panel=ths.activePanel;
		var scale=ths.activePanel.scale||1;
		if(scale-0.1>0.3)
			scale-=0.1;
		ths.activePanel.Scale(scale);
		ths.document.activePanel.Scale(scale);
		ths.document.activePanel.instance.paint();

	}.bind(this)

	this.zoomin = function(){
		var panel=ths.activePanel;
		var scale=panel.scale||1;
		if(scale+0.1<2.1)
			scale+=0.1;
		panel.Scale(scale);
		ths.document.activePanel.Scale(scale);
		ths.document.activePanel.instance.paint();

	}.bind(this)

	this.designer.on("undo",function(){
		ths.undo();
	});

	this.designer.on("redo",function(){
		ths.redo();
	});

	this.redo = function(){
		 if(ths.activePanel.redohistory.length>0){
			 var command=ths.activePanel.redohistory[ths.activePanel.redohistory.length-1];
			 command.redo();
			 ths.activePanel.history.push(command);
			 ths.activePanel.redohistory.splice(ths.activePanel.redohistory.length-1,1);
		 }
	}.bind(this)

	this.undo = function(){
		 if(ths.activePanel.history.length>0){
			 var command=ths.activePanel.history[ths.activePanel.history.length-1];
			 command.undo();
			 ths.activePanel.redohistory.push(command);
			 ths.activePanel.history.splice(ths.activePanel.history.length-1,1);
		 }
	}.bind(this)

	this.filter = function(){
		 $("#modalFilters").modal("show");
	}.bind(this)

	this.fontnamechange = function(){
		var family=$("#fontname").select2("val");
		if(ths.focuswidget()&&ths.focuswidget().font){
			ths.focuswidget().font.family=family
			ths.activePanel.paint();
		}
		else
			ths.defaultfont.family=family;
	}.bind(this)

	this.fontcolorchange = function(){
		var color=$("#fontcolor").val();
		if(ths.focuswidget()&&ths.focuswidget().font){
			ths.focuswidget().font.color=(color==="")?"none":color;
			ths.activePanel.paint();
		}
		else
			ths.defaultfont.color=color;
	}.bind(this)

	this.fontsizechange = function(){
		var size=$("#fontsize").select2("val");
		if(ths.focuswidget()&&ths.focuswidget().font){
			ths.focuswidget().font.size=size;
			ths.activePanel.paint();
		}
		else
			ths.defaultfont.size=size;
	}.bind(this)

	this.on("update",function(){
		if(this.focuswidget()&&this.focuswidget().font){
			$(".fontname").select2("val",this.focuswidget().font.family||"宋体");
	    	$(".fontsize").select2("val",this.focuswidget().font.size);
	    	$("#fontcolor").spectrum("set",this.focuswidget().font.color);
		}
	    else{
	    	$(".fontname").select2("val",this.defaultfont.family);
	    	$(".fontsize").select2("val",this.defaultfont.size);
	    	$("#fontcolor").spectrum("set",this.defaultfont.color);
	    }
	})

	this.on("mount",function(){

	    var fontsizes=[{id:'6pt',text:'6pt'},{id:'7pt',text:'7pt'},{id:'8pt',text:'8pt'},{id:'9pt',text:'9pt'},{id:'10pt',text:'10pt'},{id:'11pt',text:'11pt'},
	                   {id:'12pt',text:'12pt'},{id:'13pt',text:'13pt'},{id:'14pt',text:'14pt'},{id:'15pt',text:'15pt'},{id:'16pt',text:'16pt'},{id:'18pt',text:'18pt'},
	                   {id:'20pt',text:'20pt'},{id:'22pt',text:'22pt'},{id:'24pt',text:'24pt'},{id:'26pt',text:'26pt'},{id:'28pt',text:'28pt'},{id:'30pt',text:'30pt'},
	                   {id:'36pt',text:'36pt'},{id:'40pt',text:'40pt'},{id:'48pt',text:'48pt'},{id:'72pt',text:'72pt'}];

	    var newType;
	    function isPositiveNum(s){
	    	var re = /^[0-9]*[1-9][0-9]*$/ ;
	    	return re.test(s)
	    };
	    $(".fontsize").select2({
	    	data:fontsizes,
	    	formatSelection:function(data){
	    		return data.text;
	    	},
	    	formatResult:function(data){
				return data.text;
			},
	    	formatNoMatches : function(inputText) {
				return "输入数字";
			},
			createSearchChoice:function(term){
				if(isPositiveNum(term)){
					newType= {"id":term+"pt","text":term+"pt"};
					return newType;
				}
			},
	    });

	    $(".colorpick").spectrum({
	   	    showInput: true,
	   	    allowEmpty:true,
	   	    cancelText: "取消",
	   	    chooseText: "选择",
	   	    showInitial: true,
	   	    showPalette: true,
	   	    showSelectionPalette:true,
	   	    palette: [ ],
	   	    preferredFormat: "hex"
	   });

	    if(this.focuswidget()){
			$(".fontname").select2("val",this.focuswidget().font.family);
	    	$(".fontsize").select2("val",this.focuswidget().font.size);
	    	$("#fontcolor").spectrum("set",this.focuswidget().font.color);
		}
	    else{
	    	$(".fontname").select2("val",this.defaultfont.family);
	    	$(".fontsize").select2("val",this.defaultfont.size);
	    	$("#fontcolor").spectrum("set",this.defaultfont.color);
	    }

	    $(this.root).find(".btn-zoom").on("click",function(){
	    	var scale=parseInt($(this).attr("value"))/100;
	    	if(ths.activePanel){
		    	ths.activePanel.Scale(scale);
				$(ths.activePanel.canvas).css("height",ths.activePanel.canvas.height*scale);
				ths.update();
	    	}
	    });

	});

});