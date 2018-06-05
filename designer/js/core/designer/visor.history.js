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