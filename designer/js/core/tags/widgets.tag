<widgets>
<style>
 #widgetgroup .nav-header{
   display:block;
   line-height:35px;
 }
 
  #widgetgroup .nav-header i{
   padding:5px;
 }
</style>
<div class="sidebar-nav " id="widgetgroup" >		
	<a class="nav-header collapsed er"  data-toggle="collapse" data-parent="#widgetgroup" href="#er" name="database"  if={widgetgroup.database.visible}>
		<i class="fa {widgetgroup.database.selected?'fa-caret-down':'fa-caret-right'}" style="margin-top:1px;"></i>Database
	</a>
	<div id="er" class="panel-collapse {widgetgroup.database.selected?'':'collapse'} er" if={widgetgroup.database.visible}>
		<div class="panel-body" style="padding: 2px">
		  <div  class="btn-widgets">		      		      
		      <img class="btn btn-default col-lg-3 col-md-3 col-sm-4 col-xs-4" style="padding:0px;" src="images/table.png" title="table" data="table" ondragstart="drag(event)"/>		      
		      <img class="btn btn-default col-lg-3 col-md-3 col-sm-4 col-xs-4" style="padding:0px;" src="images/jsontree.png" title="connection" data="collection" ondragstart="drag(event)"/>
		  </div>
		</div>
	</div>
</div>
<script>
var parent=this;
while(parent.parent!=null)
   parent=parent.parent;
  
this.fontawesomes=[];
var ths=this;
this.widgetgroup=parent.opts.widgetgroup||{
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

changevisible(e){
	var target=e.target||e.currentTarget;
	var name=target.name;
	this.widgetgroup[name].visible=!this.widgetgroup[name].visible;
}
   
this.on("mount",function(){
	
}) 
</script>
</widgets>