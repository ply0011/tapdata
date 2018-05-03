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
		 widgetgroup:widgetgroup
	});

	 
	var source = {"name":"ttt2","connection_type":"source","database_type":"oracle","database_host":"192.168.0.161","database_username":"TAPDATA","database_port":2521,"database_uri":"","database_name":"XE","database_owner":"TAPDATA","database_password":"TAPDATA","id":"5acf360fa87aa0002fe66346","user_id":"5acc280781ae950034b9d07a","ssl":false,"schema":{"tables":[{"_class":"com.tapdata.entity.RelateDataBaseTable","table_name":"BMSQL_NEW_ORDER","fields":[{"field_name":"NO_W_ID","table_name":"BMSQL_NEW_ORDER","data_type":"NUMBER","primary_key_position":1,"foreign_key_table":"BMSQL_OORDER","foreign_key_column":"O_ID","key":"PRI","precision":0,"scale":0},{"field_name":"NO_D_ID","table_name":"BMSQL_NEW_ORDER","data_type":"NUMBER","primary_key_position":2,"foreign_key_table":"BMSQL_OORDER","foreign_key_column":"O_ID","key":"PRI","precision":0,"scale":0},{"field_name":"NO_O_ID","table_name":"BMSQL_NEW_ORDER","data_type":"NUMBER","primary_key_position":3,"foreign_key_table":"BMSQL_OORDER","foreign_key_column":"O_ID","key":"PRI","precision":0,"scale":0}]},{"_class":"com.tapdata.entity.RelateDataBaseTable","table_name":"BMSQL_STOCK","fields":[{"field_name":"S_DIST_05","table_name":"BMSQL_STOCK","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"S_DIST_06","table_name":"BMSQL_STOCK","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"S_I_ID","table_name":"BMSQL_STOCK","data_type":"NUMBER","primary_key_position":2,"foreign_key_table":"BMSQL_ITEM","foreign_key_column":"I_ID","key":"PRI","precision":0,"scale":0},{"field_name":"S_DIST_03","table_name":"BMSQL_STOCK","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"S_YTD","table_name":"BMSQL_STOCK","data_type":"NUMBER","primary_key_position":0,"precision":0,"scale":0},{"field_name":"S_DIST_04","table_name":"BMSQL_STOCK","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"S_DIST_09","table_name":"BMSQL_STOCK","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"S_DIST_07","table_name":"BMSQL_STOCK","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"S_DIST_08","table_name":"BMSQL_STOCK","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"S_W_ID","table_name":"BMSQL_STOCK","data_type":"NUMBER","primary_key_position":1,"foreign_key_table":"BMSQL_WAREHOUSE","foreign_key_column":"W_ID","key":"PRI","precision":0,"scale":0},{"field_name":"S_DATA","table_name":"BMSQL_STOCK","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"S_QUANTITY","table_name":"BMSQL_STOCK","data_type":"NUMBER","primary_key_position":0,"precision":0,"scale":0},{"field_name":"S_ORDER_CNT","table_name":"BMSQL_STOCK","data_type":"NUMBER","primary_key_position":0,"precision":0,"scale":0},{"field_name":"S_REMOTE_CNT","table_name":"BMSQL_STOCK","data_type":"NUMBER","primary_key_position":0,"precision":0,"scale":0},{"field_name":"S_DIST_01","table_name":"BMSQL_STOCK","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"S_DIST_02","table_name":"BMSQL_STOCK","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"S_DIST_10","table_name":"BMSQL_STOCK","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0}]},{"_class":"com.tapdata.entity.RelateDataBaseTable","table_name":"BMSQL_WAREHOUSE","fields":[{"field_name":"W_TAX","table_name":"BMSQL_WAREHOUSE","data_type":"NUMBER","primary_key_position":0,"precision":4,"scale":4},{"field_name":"W_YTD","table_name":"BMSQL_WAREHOUSE","data_type":"NUMBER","primary_key_position":0,"precision":12,"scale":2},{"field_name":"W_NAME","table_name":"BMSQL_WAREHOUSE","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"W_STATE","table_name":"BMSQL_WAREHOUSE","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"W_ID","table_name":"BMSQL_WAREHOUSE","data_type":"NUMBER","primary_key_position":1,"key":"PRI","precision":0,"scale":0},{"field_name":"W_STREET_1","table_name":"BMSQL_WAREHOUSE","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"W_CITY","table_name":"BMSQL_WAREHOUSE","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"W_STREET_2","table_name":"BMSQL_WAREHOUSE","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"W_ZIP","table_name":"BMSQL_WAREHOUSE","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0}]},{"_class":"com.tapdata.entity.RelateDataBaseTable","table_name":"BMSQL_ORDER_LINE","fields":[{"field_name":"OL_O_ID","table_name":"BMSQL_ORDER_LINE","data_type":"NUMBER","primary_key_position":3,"foreign_key_table":"BMSQL_OORDER","foreign_key_column":"O_ID","key":"PRI","precision":0,"scale":0},{"field_name":"OL_DIST_INFO","table_name":"BMSQL_ORDER_LINE","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"OL_W_ID","table_name":"BMSQL_ORDER_LINE","data_type":"NUMBER","primary_key_position":1,"foreign_key_table":"BMSQL_OORDER","foreign_key_column":"O_ID","key":"PRI","precision":0,"scale":0},{"field_name":"OL_NUMBER","table_name":"BMSQL_ORDER_LINE","data_type":"NUMBER","primary_key_position":4,"key":"PRI","precision":0,"scale":0},{"field_name":"OL_SUPPLY_W_ID","table_name":"BMSQL_ORDER_LINE","data_type":"NUMBER","primary_key_position":0,"foreign_key_table":"BMSQL_STOCK","foreign_key_column":"S_I_ID","precision":0,"scale":0},{"field_name":"OL_DELIVERY_D","table_name":"BMSQL_ORDER_LINE","data_type":"TIMESTAMP(6)","primary_key_position":0,"precision":0,"scale":6},{"field_name":"OL_QUANTITY","table_name":"BMSQL_ORDER_LINE","data_type":"NUMBER","primary_key_position":0,"precision":0,"scale":0},{"field_name":"OL_I_ID","table_name":"BMSQL_ORDER_LINE","data_type":"NUMBER","primary_key_position":0,"foreign_key_table":"BMSQL_STOCK","foreign_key_column":"S_I_ID","precision":0,"scale":0},{"field_name":"OL_AMOUNT","table_name":"BMSQL_ORDER_LINE","data_type":"NUMBER","primary_key_position":0,"precision":6,"scale":2},{"field_name":"OL_D_ID","table_name":"BMSQL_ORDER_LINE","data_type":"NUMBER","primary_key_position":2,"foreign_key_table":"BMSQL_OORDER","foreign_key_column":"O_ID","key":"PRI","precision":0,"scale":0}]},{"_class":"com.tapdata.entity.RelateDataBaseTable","table_name":"BMSQL_ITEM","fields":[{"field_name":"I_NAME","table_name":"BMSQL_ITEM","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"I_PRICE","table_name":"BMSQL_ITEM","data_type":"NUMBER","primary_key_position":0,"precision":5,"scale":2},{"field_name":"I_ID","table_name":"BMSQL_ITEM","data_type":"NUMBER","primary_key_position":1,"key":"PRI","precision":0,"scale":0},{"field_name":"I_DATA","table_name":"BMSQL_ITEM","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"I_IM_ID","table_name":"BMSQL_ITEM","data_type":"NUMBER","primary_key_position":0,"precision":0,"scale":0}]},{"_class":"com.tapdata.entity.RelateDataBaseTable","table_name":"BMSQL_DISTRICT","fields":[{"field_name":"D_W_ID","table_name":"BMSQL_DISTRICT","data_type":"NUMBER","primary_key_position":1,"foreign_key_table":"BMSQL_WAREHOUSE","foreign_key_column":"W_ID","key":"PRI","precision":0,"scale":0},{"field_name":"D_YTD","table_name":"BMSQL_DISTRICT","data_type":"NUMBER","primary_key_position":0,"precision":12,"scale":2},{"field_name":"D_CITY","table_name":"BMSQL_DISTRICT","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"D_ID","table_name":"BMSQL_DISTRICT","data_type":"NUMBER","primary_key_position":2,"key":"PRI","precision":0,"scale":0},{"field_name":"D_TAX","table_name":"BMSQL_DISTRICT","data_type":"NUMBER","primary_key_position":0,"precision":4,"scale":4},{"field_name":"D_NEXT_O_ID","table_name":"BMSQL_DISTRICT","data_type":"NUMBER","primary_key_position":0,"precision":0,"scale":0},{"field_name":"D_STATE","table_name":"BMSQL_DISTRICT","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"D_ZIP","table_name":"BMSQL_DISTRICT","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"D_NAME","table_name":"BMSQL_DISTRICT","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"D_STREET_1","table_name":"BMSQL_DISTRICT","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"D_STREET_2","table_name":"BMSQL_DISTRICT","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0}]},{"_class":"com.tapdata.entity.RelateDataBaseTable","table_name":"BMSQL_CONFIG","fields":[{"field_name":"CFG_VALUE","table_name":"BMSQL_CONFIG","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"CFG_NAME","table_name":"BMSQL_CONFIG","data_type":"VARCHAR2","primary_key_position":1,"key":"PRI","precision":0,"scale":0}]},{"_class":"com.tapdata.entity.RelateDataBaseTable","table_name":"BMSQL_CUSTOMER","fields":[{"field_name":"C_LAST","table_name":"BMSQL_CUSTOMER","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"C_CREDIT","table_name":"BMSQL_CUSTOMER","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"C_YTD_PAYMENT","table_name":"BMSQL_CUSTOMER","data_type":"NUMBER","primary_key_position":0,"precision":12,"scale":2},{"field_name":"C_STATE","table_name":"BMSQL_CUSTOMER","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"C_W_ID","table_name":"BMSQL_CUSTOMER","data_type":"NUMBER","primary_key_position":1,"foreign_key_table":"BMSQL_DISTRICT","foreign_key_column":"D_ID","key":"PRI","precision":0,"scale":0},{"field_name":"C_ID","table_name":"BMSQL_CUSTOMER","data_type":"NUMBER","primary_key_position":3,"key":"PRI","precision":0,"scale":0},{"field_name":"C_CITY","table_name":"BMSQL_CUSTOMER","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"C_DATA","table_name":"BMSQL_CUSTOMER","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"C_BALANCE","table_name":"BMSQL_CUSTOMER","data_type":"NUMBER","primary_key_position":0,"precision":12,"scale":2},{"field_name":"C_FIRST","table_name":"BMSQL_CUSTOMER","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"C_SINCE","table_name":"BMSQL_CUSTOMER","data_type":"TIMESTAMP(6)","primary_key_position":0,"precision":0,"scale":6},{"field_name":"C_DISCOUNT","table_name":"BMSQL_CUSTOMER","data_type":"NUMBER","primary_key_position":0,"precision":4,"scale":4},{"field_name":"C_CREDIT_LIM","table_name":"BMSQL_CUSTOMER","data_type":"NUMBER","primary_key_position":0,"precision":12,"scale":2},{"field_name":"C_STREET_1","table_name":"BMSQL_CUSTOMER","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"C_PHONE","table_name":"BMSQL_CUSTOMER","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"C_STREET_2","table_name":"BMSQL_CUSTOMER","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"C_PAYMENT_CNT","table_name":"BMSQL_CUSTOMER","data_type":"NUMBER","primary_key_position":0,"precision":0,"scale":0},{"field_name":"C_DELIVERY_CNT","table_name":"BMSQL_CUSTOMER","data_type":"NUMBER","primary_key_position":0,"precision":0,"scale":0},{"field_name":"C_ZIP","table_name":"BMSQL_CUSTOMER","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"C_MIDDLE","table_name":"BMSQL_CUSTOMER","data_type":"CHAR","primary_key_position":0,"precision":0,"scale":0},{"field_name":"C_D_ID","table_name":"BMSQL_CUSTOMER","data_type":"NUMBER","primary_key_position":2,"foreign_key_table":"BMSQL_DISTRICT","foreign_key_column":"D_ID","key":"PRI","precision":0,"scale":0}]},{"_class":"com.tapdata.entity.RelateDataBaseTable","table_name":"BMSQL_HISTORY","fields":[{"field_name":"H_DATE","table_name":"BMSQL_HISTORY","data_type":"TIMESTAMP(6)","primary_key_position":0,"precision":0,"scale":6},{"field_name":"HIST_ID","table_name":"BMSQL_HISTORY","data_type":"NUMBER","primary_key_position":1,"key":"PRI","precision":0,"scale":0},{"field_name":"H_DATA","table_name":"BMSQL_HISTORY","data_type":"VARCHAR2","primary_key_position":0,"precision":0,"scale":0},{"field_name":"H_C_ID","table_name":"BMSQL_HISTORY","data_type":"NUMBER","primary_key_position":0,"foreign_key_table":"BMSQL_CUSTOMER","foreign_key_column":"C_ID","precision":0,"scale":0},{"field_name":"H_D_ID","table_name":"BMSQL_HISTORY","data_type":"NUMBER","primary_key_position":0,"foreign_key_table":"BMSQL_DISTRICT","foreign_key_column":"D_ID","precision":0,"scale":0},{"field_name":"H_W_ID","table_name":"BMSQL_HISTORY","data_type":"NUMBER","primary_key_position":0,"foreign_key_table":"BMSQL_DISTRICT","foreign_key_column":"D_ID","precision":0,"scale":0},{"field_name":"H_C_W_ID","table_name":"BMSQL_HISTORY","data_type":"NUMBER","primary_key_position":0,"foreign_key_table":"BMSQL_CUSTOMER","foreign_key_column":"C_ID","precision":0,"scale":0},{"field_name":"H_C_D_ID","table_name":"BMSQL_HISTORY","data_type":"NUMBER","primary_key_position":0,"foreign_key_table":"BMSQL_CUSTOMER","foreign_key_column":"C_ID","precision":0,"scale":0},{"field_name":"H_AMOUNT","table_name":"BMSQL_HISTORY","data_type":"NUMBER","primary_key_position":0,"precision":6,"scale":2}]},{"_class":"com.tapdata.entity.RelateDataBaseTable","table_name":"BMSQL_OORDER","fields":[{"field_name":"O_W_ID","table_name":"BMSQL_OORDER","data_type":"NUMBER","primary_key_position":1,"foreign_key_table":"BMSQL_CUSTOMER","foreign_key_column":"C_ID","key":"PRI","precision":0,"scale":0},{"field_name":"O_OL_CNT","table_name":"BMSQL_OORDER","data_type":"NUMBER","primary_key_position":0,"precision":0,"scale":0},{"field_name":"O_ALL_LOCAL","table_name":"BMSQL_OORDER","data_type":"NUMBER","primary_key_position":0,"precision":0,"scale":0},{"field_name":"O_ENTRY_D","table_name":"BMSQL_OORDER","data_type":"TIMESTAMP(6)","primary_key_position":0,"precision":0,"scale":6},{"field_name":"O_ID","table_name":"BMSQL_OORDER","data_type":"NUMBER","primary_key_position":3,"key":"PRI","precision":0,"scale":0},{"field_name":"O_C_ID","table_name":"BMSQL_OORDER","data_type":"NUMBER","primary_key_position":0,"foreign_key_table":"BMSQL_CUSTOMER","foreign_key_column":"C_ID","precision":0,"scale":0},{"field_name":"O_D_ID","table_name":"BMSQL_OORDER","data_type":"NUMBER","primary_key_position":2,"foreign_key_table":"BMSQL_CUSTOMER","foreign_key_column":"C_ID","key":"PRI","precision":0,"scale":0},{"field_name":"O_CARRIER_ID","table_name":"BMSQL_OORDER","data_type":"NUMBER","primary_key_position":0,"precision":0,"scale":0}]}]}}


	const schemaList = [];
	const regex = /^BMSQL_O/;
	source.schema.tables.forEach((t)=>{
		if(t.table_name.match(regex)){
			schemaList.push(t);
		}
	})
	source.schema.tables = schemaList;
 
	mydesigner.init(source)


	mydesigner.on('save', r => {
		window.dd2=r;
		 console.log(r)
	  })

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
	