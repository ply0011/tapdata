<widgets>
<style>
 #widgetgroup .nav-header{
   display:block;
   line-height:35px;
 }
 
  #widgetgroup .nav-header i{
   padding:5px;
 }
 #widgetgroup .header{
    background-color: rgb(240, 242, 245);
    color:  rgb(153, 153, 153);
 }
 
 #widgetgroup .list-sm ul li{
   padding-bottom:0px;
   margin-bottom:0px;
   border-bottom: 0px solid #CCC;
 }
 
 
</style>
<div class="sidebar-nav " id="widgetgroup" style="border-top: 5px solid #e5e5e5;">		
	<!--<a class="nav-header collapsed header"  data-toggle="collapse" data-parent="#widgetgroup" href="#er" name="database"  if={widgetgroup.database.visible}>
		<i class="fa fa-caret-down {widgetgroup.database.selected?'fa-caret-down':'fa-caret-right'}" style="margin-top:1px;"></i>Database
	</a>
	<div id="er" class="panel-collapse {widgetgroup.database.selected?'':'collapse'} er" if={widgetgroup.database.visible}>
		<div class="panel-body" style="padding: 2px">
		  <div  class="btn-widgets">		      		      
		      <img class="btn  col-lg-3 col-md-3 col-sm-4 col-xs-4" style="padding:0px;" src="images/table.png" title="table" data="table" ondragstart="drag(event)"/>		      
		      <img class="btn  col-lg-3 col-md-3 col-sm-4 col-xs-4" style="padding:0px;" src="images/jsontree.png" title="connection" data="collection" ondragstart="drag(event)"/>
		  </div>
		</div>
	</div>-->
	<a class="nav-header collapsed header"  data-toggle="collapse" data-parent="#widgetgroup" href="#tables" name="tables">
		<i class="fa fa-caret-down {widgetgroup.tables.selected?'fa-caret-down':'fa-caret-right'}" style="margin-top:1px;"></i>Tables
	</a>
	<div id="tables" class="panel-collapse {widgetgroup.database.selected?'':'collapse'} tables">
		<div class="panel-body" style="padding: 2px;">
			<div class="list list-sm" style="height:{maxheight}px;overflow-y:auto">
				  <ul>
				  	<li>
				  		<input type="text" class="form-control" placeholder="Search" onkeyup="{searchchange}"/>
				  	</li>
				  	<li>
				  		<div class="btn-group btn-group-sm">
				  			<a href="#" class="btn btn-default" onclick="{selectAll}">Select All</a>
				  			<a href="#" class="btn btn-default" onclick="{unselectAll}">Unselect All</a>
				  		</div>
				  	</li>
				  	<li class="item" each={table, i in tables} if={!searching||table.selected}>
				  		<label data="{table.name}" draggable=true ondragstart="dragtable(event)"><input type="checkbox" checked="{isVisible(table)?true:''}"  onchange="{change}"> {table.name}</label>
				  	</li>
				  </ul>
			 </div>
		</div>
	</div>
</div>
<script>
var parent=this;
while(parent.parent!=null)
   parent=parent.parent;
var  designer=parent.opts;
var tables=designer.document.activePanel.listTables().tables;
this.tables=tables;
this.fontawesomes=[];
var ths=this;
this.widgetgroup=parent.opts.widgetgroup||{
		database:{visible:true,selected:false},
		tables:{visible:true,selected:false},
};

changevisible(e){
	var target=e.target||e.currentTarget;
	var name=target.name;
	this.widgetgroup[name].visible=!this.widgetgroup[name].visible;
}

this.searching=false;
searchchange(e){
	var target=e.target;
	var value=target.value;
	if(value)
		this.searching=true;
	else
		this.searching=false;
	if(this.searching){
		$(tables).each(function(i,table){
			if(table.name.toLowerCase().indexOf(value.toLowerCase())>=0)
			    table.selected=true;
			 else
			 	table.selected=false;
		});
	}
}

selectAll(){
	$(tables).each(function(i,table){
		designer.document.activePanel.instance.Widget(table.name).visible=true;
	});
	designer.resize();
	designer.document.activePanel.instance.paint();
}

unselectAll(){
	$(tables).each(function(i,table){
		designer.document.activePanel.instance.Widget(table.name).visible=false;
	});
	designer.resize();
	designer.document.activePanel.instance.paint();
}

isVisible=function(item){
	return  designer.document.activePanel.instance.Widget(item.name).visible;
}

change(e){
	var item=e.item.table;
	var target=e.currentTarget;
	var checked=target.checked;	
	designer.document.activePanel.instance.Widget(item.name).visible=checked;
	designer.resize();
	designer.document.activePanel.instance.paint();
}

	var offset=295;	
	this.maxheight=document.body.clientHeight-offset;
   
this.on("mount",function(){
	
}) 
</script>
</widgets>