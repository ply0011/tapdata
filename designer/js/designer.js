var offsetX,offsetY=0;
//var mydesigner;
var activeType="";
var connectionType="";
var currentconnector=null;

function allowDrop(ev){	
  ev.preventDefault();
}


function drag(ev){
	ev.dataTransfer.effectAllowed = "drag";
 	ev.dataTransfer.setData("text","widget:"+ev.target.attributes["data"].value);
}

function dragtable(ev){
	ev.dataTransfer.effectAllowed = "drag";
 	ev.dataTransfer.setData("text","move:"+ev.target.attributes["data"].value);
}



function drop(ev){
	visordesigner.drop(ev);
}

$(document).ready(function(){
	
	var showscale=localStorage.getItem("showscale")||true;
	var documentType="er";
	

	var prefix="slide";
	
	var widgetgroup={
			basic:{visible:true,selected:true},
			workflow:{visible:true,selected:false},
			vectorgraph:{visible:true,selected:false},
			myfile:{visible:true,selected:false},
			bwf:{visible:true,selected:false},
			icon:{visible:true,selected:false},
			database:{visible:true,selected:false},
			entity:{visible:true,selected:false},
			shared:{visible:true,selected:false},
			published:{visible:true,selected:false},
			ui:{visible:true,selected:false}
	};

	if(documentType=="workflow"){
		$("#entity-relationship,#table-relationship").hide();
		widgetgroup.vectorgraph.visible=false;
		widgetgroup.myfile.visible=false;
		widgetgroup.icon.visible=false;
		widgetgroup.database.visible=false;
		widgetgroup.entity.visible=false;
		widgetgroup.shared.visible=false;
		widgetgroup.published.visible=false;
		widgetgroup.ui.visible=false;
		prefix="flow";
	}
	else if(documentType=="er"){
		widgetgroup.basic.visible=false;
		widgetgroup.workflow.visible=false;
		widgetgroup.bwf.visible=false;
		widgetgroup.vectorgraph.visible=false;
		widgetgroup.myfile.visible=false;
		widgetgroup.icon.visible=false;
		widgetgroup.entity.visible=false;
		widgetgroup.shared.visible=false;
		widgetgroup.published.visible=false;
		widgetgroup.ui.visible=false;
		widgetgroup.database.selected=true;
		prefix="Page";
	}
	else if(documentType=="entity"){		
		widgetgroup.workflow.visible=false;
		widgetgroup.bwf.visible=false;
		widgetgroup.vectorgraph.visible=false;
		widgetgroup.myfile.visible=false;
		widgetgroup.icon.visible=false;
		widgetgroup.database.visible=false;
		widgetgroup.shared.visible=false;
		widgetgroup.published.visible=false;
		widgetgroup.ui.visible=false;
		widgetgroup.entity.selected=true;
		prefix="Panel";
	}
	else{
		documentType="slideshow";
	}
	
	mydesigner=new visordesigner("#workspace",{			 
		 type: documentType,
		 prefix:prefix,		
		 widgetgroup:widgetgroup,
		 mode:"simple"
	});
 window.parent.postMessage("loaded",'*');
//var schema={"schema":{"tables":[{"table_name":"animal","fields":[{"field_name":"id","table_name":"animal","data_type":"int","primary_key_position":1,"foreign_key_table":null,"foreign_key_column":null,"key":"PRI"},{"field_name":"name","table_name":"animal","data_type":"char","primary_key_position":0,"foreign_key_table":null,"foreign_key_column":null,"key":""}]},{"table_name":"person","fields":[{"field_name":"id","table_name":"person","data_type":"int","primary_key_position":1,"foreign_key_table":null,"foreign_key_column":null,"key":"PRI"},{"field_name":"name","table_name":"person","data_type":"char","primary_key_position":0,"foreign_key_table":null,"foreign_key_column":null,"key":""}]}]}};
//mydesigner.init(schema); //--init with schema
//mydesigner.init();  --init with empty 
//mydesigner.on("save",function(r){   //--save 
//		sh(r);
//})

//var mappingresult=mydesigner.getJsonResult(); -save current design mapping result
//mydesigner.init(schema)  retore ER with provided schema 
//var data=mydesigner.getDesignResult();  -save current design data
//mydesigner.resotre(data);  --resotre design UI with saved data


	 function stop(){
		 return false;
	 }
	 document.oncontextmenu=stop;
	
	
 }); 
	