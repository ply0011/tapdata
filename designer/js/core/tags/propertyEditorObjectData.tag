<propertyEditorObjectData>
	<style>
		.table-bordered,.table-nobordered{
		  font-size:9pt;
		  width:100%;
		  margin-bottom:5px;
		}
		.table-nobordered{
		  font-size:9pt;
		}
		.table-bordered input[type='text']{
		   width:100%;
		   padding:5px;
		}
		
		.table-bordered>tbody>tr>td{
		 	padding:5px;
		}
		
		.table-extension select{
		  width:100%;
		}
		
		.spinner-input.input-group .input-group-addon{
		  padding:4px 6px 3px 2px;
		  background-color:white;
		  color:black;
		} 
		.spinner-input.input-group .input-group-addon .spin-up,
		.spinner-input.input-group .input-group-addon .spin-down {
		  height: 10px;
		  width: 12px;
		  overflow: hidden;
		  display: block;
		  text-align: right;
		  color: #999;
		}
		.spinner-input.input-group .input-group-addon .spin-up:hover,
		.spinner-input.input-group .input-group-addon .spin-down:hover {
		  color: #555;
		}
		.spinner-input.input-group .input-group-addon .spin-up .fa,
		.spinner-input.input-group .input-group-addon .spin-down .fa {
		  margin-top: -3px;
		  padding:0px;
		  margin:0px;
		  vertical-align: middle;
		}
		.spinner-input.input-group .input-group-addon .spin-up .glyphicon,
		.spinner-input.input-group .input-group-addon .spin-down .glyphicon {
		  font-size: 10px;
		  top: -2px;
		}
		.spinner-input.input-group .input-group-addon a.spin-up,
		.spinner-input.input-group .input-group-addon a.spin-down {
		  text-decoration: none;
		}
		.spinner-input.input-group .input-group-addon button.spin-up,
		.spinner-input.input-group .input-group-addon button.spin-down {
		  background: none;
		  border: none;
		  padding: 0;
		}
		
		.table-grid{
		    display:flex;
		    align-items:center;
		}
		.table-cell{
		  margin-right:5px;
		}
		
	</style>
	<div class="container-fluid"  style="background-color:white">
		<form class="form-horizontal"  if={widget}>
			<div  class="form-group form-group-sm row" each={props.elements} style="margin-bottom:0px" if={editor[key].visible!=false&&showProperty(key)}> 
				<label class="pull-left control-label" style="padding:10px 0 10px 10px;text-align: left;"> <raw content="{editor[key].title}"/> <span  if={!editor[key].required}>&nbsp;</span><span style="color:red" if={editor[key].required}>*</span></label>
				<div style="margin-left:110px;"> 
					<div style="padding:5px;"> 
						<input type="text" class="form-control" id="{key}" value={widget['objectdata'][key]} required={editor[key].required} readonly={!editor[key].editable}  onchange="{change}"  if="{editor[key].format=='string'&&showProperty(key)}"/>
						
						<input type="hidden" class="colorpick"  style="width:30px;height:30px;padding:0px" id="{key}" value={widget['objectdata'][key]} required={editor[key].required} readonly={!editor[key].editable}  onchange="{change}"  if={editor[key].format=='color' }/>
						
						<input type="checkbox" style="margin-top:8px;" onclick="{change}" id="{key}" checked="{widget['objectdata'][key]}" if={editor[key].format=='boolean' }>
						
						<select id="{key}" onchange={change} style="width:100%" if={editor[key].format=="single" } >
							<option each={option, i in editor[key].options}  value={option.id||option} selected={getValue(option,key)}>{option.text||option}</option>
						</select>
						
						<textarea  id="values" rows=5  style="resize:vertical;width:100%"   onchange="{change}" if={editor[key].format=='text' }>{widget['objectdata'][key]}</textarea>							
	
						<input type="text" class="form-control number" id="{key}" value={widget['objectdata'][key]} required={editor[key].required} readonly={!editor[key].editable}  onchange="{change}"  if={editor[key].format=='int' }/>
						
						<div  if={editor[key].format=="list" && widget['objectdata'][key].type.toLowerCase()=="object"}>
							<div style="margin-bottom:5px"  class="table-grid">
								<div class="table-cell">
									<input  type="text" class="form-control" style="border:none" value="Source Field" />
								</div>
								<div class="table-cell">
									<input  type="text" class="form-control" style="border:none"  value="Target Field" />
								</div>
							</div>
							<div  each={obj,i in widget['objectdata'][key].values} name={key} style="margin-bottom:5px"  class="table-grid">
								<a href="#" name="{key}" onclick={goup} if={i>0}><i class="fa fa-long-arrow-up" style="width:10px;"></i></a>
								<a href="#" name="{key}" onclick={godown} if={i<widget['objectdata'][key].values.length-1}><i class="fa fa-long-arrow-down" style="width:10px;"></i></a>
								<div each={field,k in widget['objectdata'][key].fields} class="table-cell">
									<input  type="text" class="form-control" name="{key}" alt="{i}" onchange="{listitemchange}"  value="{obj[field.id]}" />
								</div>
								<a href="#" name="{key}" onclick={listremove}><i class="fa fa-times" style="width:10px;"></i></a>
							</div>
							
							<div class="input-group" style="margin-top:5px" name={key}>
								<a href="#" name="{key}" onclick={listadd}>Add new</a>
							</div>
						</div>
					</div>
				</div>
		</form>
	</div>
	<script>
	var parent=this;
	while(parent.parent!=null)
		parent=parent.parent;
	this.designer=parent.opts;
	this.activepanel=this.designer.document.activePanel.instance;
	this.widget=this.activepanel.focuswidget;
	this.setting="objectdata";
	var ths=this;
	var updateEditor=function(){
		if(ths.widget&&ths.widget.objectdata){	
			ths.editor = $.propertyObject(ths.widget.type);
			ths.props=new Map();
			for(var prop in ths.widget.objectdata){
				if(prop&&ths.editor[prop]!=undefined)
					ths.props.put(prop,ths.widget.objectdata[prop]);
					
			}
		}
	}
	updateEditor();
	
	goup(e){
		var target=e.currentTarget;
		var name=target.name;
		var item=e.item.obj;
		var index=this.widget["objectdata"][name].values.indexOf(item);
		if(index>0){
			this.widget["objectdata"][name].values[index]=this.widget["objectdata"][name].values.splice(index-1,1,item)[0];
		}
	}
	
	godown(e){
		var target=e.currentTarget;
		var name=target.name;
		var item=e.item.obj;
		var index=this.widget["objectdata"][name].values.indexOf(item);
		if(index>0){
			this.widget["objectdata"][name].values[index]=this.widget["objectdata"][name].values.splice(index+1,1,item)[0];
		}
	}
	
	listadd(e){
		var target=e.target;
		var name=target.name;
		var obj={};
		for(var i=0;i<=this.widget['objectdata'][name].fields.length-1;i++){
			obj[this.widget['objectdata'][name].fields[i].id]="";
		}
		this.widget['objectdata'][name].values.push(obj);
	}
	
	getValue(option,key){
		if(option.id=="String"){
			switch(ths.widget.objectdata[key]){
				case "String":
				case "varchar2":
				case "char":
				case "varchar":
					return true;
				default:
				    return false;
			
			}
		}
		else if(option.id=="Integer"){
			switch(ths.widget.objectdata[key]){
				case "Integer":
				case "number":
				case "int":
					return true;
				default:
				    return false;
			
			}
		}
		else if(option.id=="Date"){
			switch(ths.widget.objectdata[key]){
				case "Date":
				case "timestamp(6)":
				case "time":
					return true;
				default:
				    return false;
			
			}
		}
		else{
		  if(option.id==ths.widget.objectdata[key])
		     return true;
		  else 
		  	return false;
		}
		
	}
	
	listremove(e){
		var item=e.item.obj;
		var target=e.currentTarget;
		var name=target.name;
		var index=this.widget['objectdata'][name].values.indexOf(item);
		this.widget['objectdata'][name].values.splice(index,1);
	}
	
	listitemchange(e){
		var item=e.item.field;
		var target=e.target;
		var key=target.name;
		var index=target.alt;
		var obj=this.widget['objectdata'][key].values[index];
		var value=target.value;
		obj[item.id]=value;
		var prop="objectdata";
		var name=target.name;
		parent.opts.trigger("propertychange",this.widget,prop,name);
		
	}
	
	this.getkey=function(target,keyvalue,key){
		if(target=="keyvalues"){				
			if(key)
				return keyvalue.key;
			else
				return keyvalue.value;
		}
	};
	
	this.showProperty=function(item){
		if(this.widget.objectdata[item].visible==false)
			return false;
		else if(this.widget.objectdata.visible==false)
			return false;
		if(item=="targetpath"){
			if(this.widget.type=="treeNode"&&!this.widget.objectdata.targetpath)
				return false;
		}
		return true;
	};
	
	change(e){
		var item=e.item;
		var target=e.currentTarget||e.target;
		target=target.control||target;
		var prop="objectdata";
		var name=target.name||item.key;
		var value=target.value;
		if(target.type=="checkbox"){
			if(prop)
				this.widget[prop][name]=target.checked;
			else
				this.widget[name]=target.checked;
			if(prop=="data"&&name=="ispk"&&target.checked){
				this.widget.data.nullable=false;
				this.widget.parent.removefield(this.widget);
				this.widget.parent.addpk(this.widget);
			}
		}
		else{
			if(prop)
				this.widget[prop][name]=value;
			else
				this.widget[name]=value;
		}
		this.activepanel.paint();
		parent.opts.trigger("propertychange",this.widget,prop,name);
	}	
	this.on("mount",function(){
	})
	</script>
</propertyEditorObjectData>
<raw>
    <span></span>
    <script>
    	var parent=this;
	    while(parent.parent!=null)
	       parent=parent.parent;
	    this.root.innerHTML =parent.opts.content||opts.content;
	    this.on("update",function(){
	    	 this.root.innerHTML =opts.content;
	    })
    </script>
</raw>