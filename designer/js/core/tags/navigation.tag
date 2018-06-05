<navigation>
<style>
	
</style>
<div class="sidebar-nav"  >
	<widgets></widgets>
</div>
<script>
	var parent=this;
    while(parent.parent!=null)
       parent=parent.parent;
    this.designer=parent.opts;
    this.type=this.designer.document.type;
    this.activepanel=parent.opts.document.activePanel;
    
    newpage(){
    	parent.opts.trigger("newpage");
    }
    
    this.on("mount",function(){
    	parent.opts.trigger("navigation_loaded");
    });
		
</script>
</navigation>