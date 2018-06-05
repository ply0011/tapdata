<navigation>
<style>
	
</style>
<div class="box" style="margin:0px;">
	<div role="tabpanel">
		<ul class="nav nav-tabs box-header" role="tablist">
		    <li role="presentation" class="{active:showproperty}"><a href="#page-tab" name="property" aria-controls="page" role="tab" data-toggle="tab">Property</a></li>
		    <li role="presentation" class="{active:!showproperty}"><a href="#widget-tab"  name="widgets" aria-controls="widget" role="tab" data-toggle="tab">Control</a></li>
		</ul>
	
		<div class="tab-content"  style="margin-bottom:0px;padding:0px">
			<div role="tabpanel" class="tab-pane {active:showproperty}" id="page-tab">
		    	<div class="propertyEditForm1 sidebar-nav" style="margin:0px;border-top:solid 5px #e5e5e5;" id="propertyEditorForm1">
					<propertyEditorWidget></propertyEditorWidget>
				</div> 
		    </div>
		    <div role="tabpanel" class="tab-pane {active:!showproperty}" id="widget-tab">
		    	<div class="sidebar-nav"  >
					<widgets></widgets>
				</div>
		    </div>
		</div>
	</div>
</div>



<script>
	var parent=this;
    while(parent.parent!=null)
       parent=parent.parent;
    this.designer=parent.opts;
    this.type=this.designer.document.type;
    this.activepanel=parent.opts.document.activePanel;
    this.showproperty=false;
    var ths=this;
    newpage(){
    	parent.opts.trigger("newpage");
    }
    
    this.designer.off("showproperty").on("showproperty",function(val){
       ths.showproperty=val;
       ths.update();
    });
    
    this.on("mount",function(){
    	parent.opts.trigger("navigation_loaded");
    	 
	    $(this.root).find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		  	var target=e.target;
		  	var name=target.name;
		  	ths.showproperty=(name=="property");
		})
    });
		
</script>
</navigation>