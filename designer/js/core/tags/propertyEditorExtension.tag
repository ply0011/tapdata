<propertyEditorExtension>
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
		
	</style>
	<table class="table table-nobordered table-extension">
	<tr class="settings property-panel" style="margin-bottom:0px;" if={widget.settings}>
		<td >
			<div class="property-header" style="border-top-width:0px;">Data</div>
			<div id="settings" class="panel-collapse in collapse" style="padding: 2px">
			<table class="table table-bordered tighten">
				<tr class="settings-prefix">
					<td class="tag">Prefix</td>
					<td class="tag-control"><input type="text" value="{widget.settings.prefix}" name="prefix" alt="settings"  onchange="{change}"/></td>
				</tr>
				<tr class="settings-owner">
					<td class="tag">Owner</td>
					<td class="tag-control"><input type="text"  value="{widget.settings.owner}" name="owner" alt="settings"  onchange="{change}"/></td>
				</tr>
			</table>
			</div>
		</td>
	</tr>
	
	<tr class="key property-panel" if={widget.key}>
		<td >
			<a class="nav-header">关联属性</a>
			<div id="key" class="panel-collapse in collapse" style="padding: 2px">
			<table class="table table-bordered tighten">
				<tr class="key-name">
					<td class="tag">名称</td>
					<td class="tag-control"><input type="text"  value="{widget.key.name}" name="name" alt="key"  onchange="{change}"/></td>
				</tr>
				<tr class="key-identifying">
					<td class="tag">Allow Empty</td>
					<td class="tag-control"><input type="checkbox"  value="{widget.key.identifying}" name="identifying" alt="key"  onchange="{change}"/></td>
				</tr>
				<tr class="key-nullable">
					<td class="tag">Allow Null</td>
					<td class="tag-control"><input type="checkbox" value="{widget.key.nullable}" name="nullable" alt="key"  onchange="{change}"/></td>
				</tr>
				<tr class="key-source">
					<td class="tag">Primary Table</td>
					<td class="tag-control"><input type="text" value="{widget.key.source}" name="source" alt="key"  onchange="{change}"  disabled/></td>
				</tr>
				<tr class="key-target">
					<td class="tag">Relation Table</td>
					<td class="tag-control"><input type="text" value="{widget.key.target}" name="target" alt="key"  onchange="{change}" disabled/></td>
				</tr>
				<tr class="key-fieldmaps">
					<td class="tag">Field Mapping</td>
					<td class="tag-control"><textarea  value="{widget.key.fieldmaps}" name="fieldmaps" alt="key"  onchange="{change}" disabled></textarea></td>
				</tr>						
			</table>
			</div>
		</td>
	</tr>
	
	<tr class="data property-panel" if={widget.data}>
		<td >
			<div class="property-header" style="border-top-width:0px;">Data</div>
			<div id="data" class="panel-collapse in collapse" style="padding: 2px">
			<table class="table table-bordered tighten">
				<tr class="data-datatype">
					<td class="tag">Data Type</td>
					<td class="tag-control">
					 	<select id="data-datatype" style="width:100%" name="datatype" title="data" onchange="{change}">
					 		<option value="varchar"  selected="{widget.data.datatype=='varchar'}">VARCHAR</option>
					 		<option value="char"  selected="{widget.data.datatype=='char'}">CHAR</option>
					 		<option value="number"  selected="{widget.data.datatype=='number'}">NUMBER</option>
					 		<option value="integer"  selected="{widget.data.datatype=='integer'}">INTEGER</option>
					 		<option value="datetime"  selected="{widget.data.datatype=='datetime'}">DATETIME</option>
					 		<option value="boolean"   selected="{widget.data.datatype=='boolean'}">BOOLEAN</option>
					 		<option value="clob"  selected="{widget.data.datatype=='clob'}">CLOB</option>
					 		<option value="blob"  selected="{widget.data.datatype=='blob'}">BLOB</option>
					 	</select>
					</td>
				</tr>
				<tr class="data-integer" if="{widget.data.datatype=='number'}">
					<td class="tag">Integer</td>
					<td class="tag-control"><input type="text" class="number" value="{widget.data.integer}" name="integer" alt="data"  onchange="{change}" /></td>
				</tr>
				<tr class="data-decimal" if="{widget.data.datatype=='number'}">
					<td class="tag">Decimal</td>
					<td class="tag-control"><input type="text" class="number" value="{widget.data.decimal}" name="decimal" alt="data"  onchange="{change}"/></td>
				</tr>
				<tr class="data-length" if="{widget.data.datatype=='varchar'}">
					<td class="tag">Length</td>
					<td class="tag-control"><input type="text" class="number" value="{widget.data.length}" name="length" alt="data"  onchange="{change}"/></td>
				</tr>
				<tr class="data-ispk">
					<td class="tag">isPk</td>
					<td class="tag-control"><input type="checkbox"  checked="{widget.data.ispk?true:''}" name="ispk" alt="data"  onchange="{change}"/></td>
				</tr>
				<tr class="data-isfk">
					<td class="tag">isFk</td>
					<td class="tag-control"><input type="checkbox" value="{widget.data.isfk}" name="isfk" alt="data"  onchange="{change}" disabled="disabled"/></td>
				</tr>
				<tr class="data-reftable" if="{widget.data.isfk}">
					<td class="tag">Ref Table</td>
					<td class="tag-control"><input type="text" value="{widget.data.reftable}" name="reftable" alt="data"  onchange="{change}" disabled="disabled"/></td>
				</tr>
				<tr class="data-refield"  if="{widget.data.isfk}">
					<td class="tag">Ref Field</td>
					<td class="tag-control"><input type="text" value="{widget.data.refield}" name="refield" alt="data"  onchange="{change}"  disabled="disabled"/></td>
				</tr>
				<tr class="data-nullable">
					<td class="tag">Allow Null</td>
					<td class="tag-control"><input type="checkbox" value="{widget.data.nullable}" name="nullable" alt="data"  onchange="{change}"/></td>
				</tr>
				<tr class="data-unique">
					<td class="tag">Unique</td>
					<td class="tag-control"><input type="checkbox" value="{widget.data.unique}" name="unique" alt="data"  onchange="{change}"/></td>
				</tr>
			</table>
		</div>
		</td>
	</tr>
	
	<tr class="property property-panel" if={widget.property}>
		<td >
			<div class="property-header" style="border-top-width:0px;">属性设置</div>
			<div id="property" class="panel-collapse in collapse" style="padding: 2px">
			<table class="table table-bordered tighten">
				<tr class="data-name">
					<td class="tag" style="width:90px">名称</td>
					<td class="tag-control"><input type="text" value="{widget.property.name}" name="name" alt="property"  onchange="{change}"/></td>
				</tr>
				<tr class="data-text">
					<td class="tag" style="width:90px">描述</td>
					<td class="tag-control"><input type="text" value="{widget.property.text}" name="text" alt="property"  onchange="{change}"/></td>
				</tr>
				<tr class="property-abbreviation">
					<td class="tag">列映射</td>
					<td class="tag-control"><input type="text" value="{widget.property.abbreviation}" name="abbreviation" alt="property"  onchange="{change}"/></td>
				</tr>
				<tr class="property-annotation">
					<td class="tag">注释</td>
					<td class="tag-control"><input type="text" value="{widget.property.annotation}" name="annotation" alt="property"  onchange="{change}"/></td>
				</tr>
				<tr class="property-datatype">
					<td class="tag">数据类型</td>
					<td class="tag-control">
					 	<select name="datatype" title="property"  onchange="{change}" style="width:100%">
					 		<option value="String" selected="{widget.property.datatype=='String'}">String</option>
					 		<option value="Number" selected="{widget.property.datatype=='Number'}">Number</option>
					 		<option value="Long" selected="{widget.property.datatype=='Long'}">Long</option>
					 		<option value="Integer" selected="{widget.property.datatype=='Integer'}">Integer</option>
					 		<option value="DateTime" selected="{widget.property.datatype=='DateTime'}">DateTime</option>
					 		<option value="Boolean" selected="{widget.property.datatype=='Boolean'}">Boolean</option>
					 		<option value="Clob" selected="{widget.property.datatype=='Clob'}">Clob</option>
					 		<option value="Blob" selected="{widget.property.datatype=='Blob'}">Blob</option>
					 		<option value="reference"  selected="{widget.property.datatype=='reference'}" disabled>Reference</option>
					 	</select>
					</td>
				</tr>
				<tr class="property-format">
					<td class="tag">格式</td>
					<td class="tag-control"><input type="text" value="{widget.property.format}" name="format" alt="property"  onchange="{change}"/></td>
				</tr>
				<tr class="property-integer">
					<td class="tag">整数位</td>
					<td class="tag-control"><input type="text" class="number" value="{widget.property.integer}" name="integer" alt="property"  onchange="{change}"/></td>
				</tr>
				<tr class="property-decimal">
					<td class="tag">小数位</td>
					<td class="tag-control"><input type="text" class="number" value="{widget.property.decimal}" name="decimal" alt="property"  onchange="{change}"/></td>
				</tr>
				<tr class="property-maxlength">
					<td class="tag">字符长度</td>
					<td class="tag-control"><input type="text" class="number" value="{widget.property.length}" name="length" alt="property"  onchange="{change}" /></td>
				</tr>
				<tr class="property-collectionType">
					<td class="tag">集合类型</td>
					<td class="tag-control"><input type="text" value="{widget.property.collectionType}" name="collectionType" alt="property"  onchange="{change}" readonly/></td>
				</tr>
				<tr class="property-referenceTypeName">
					<td class="tag">关联对象</td>
					<td class="tag-control"><input type="text" value="{widget.property.referenceTypeName}" name="referenceTypeName" alt="property"  onchange="{change}"  readonly/></td>
				</tr>
				<tr class="property-relationship">
					<td class="tag">关联关系</td>
					<td class="tag-control"><input type="text" value="{widget.property.relationship}" name="relationship" alt="property"  onchange="{change}"  readonly/></td>
				</tr>
				<tr class="property-joinTableName">
					<td class="tag">关联关系表</td>
					<td class="tag-control"><input type="text" value="{widget.property.joinTableName}" name="joinTableName" alt="property"  onchange="{change}" /></td>
				</tr>
				<tr class="property-joinColumnName">
					<td class="tag">关联字段</td>
					<td class="tag-control"><input type="text" value="{widget.property.joinColumnName}" name="joinColumnName" alt="property"  onchange="{change}"/></td>
				</tr>
				<tr class="property-inverseJoinColumnName">
					<td class="tag">反相关联字段</td>
					<td class="tag-control"><input type="text" value="{widget.property.inverseJoinColumnName}" name="inverseJoinColumnName" alt="property"  onchange="{change}"/></td>
				</tr>
				<tr class="property-nullable">
					<td class="tag">允许为空</td>
					<td class="tag-control"><input type="checkbox" value="{widget.property.nullable}" name="nullable" alt="property"  onchange="{change}"/></td>
				</tr>
				<tr class="property-defaultvalue">
					<td class="tag">缺省值</td>
					<td class="tag-control"><input type="text" value="{widget.property.defaultvalue}" name="defaultvalue" alt="property"  onchange="{change}"/></td>
				</tr>
				<tr class="property-unique">
					<td class="tag">是否唯一</td>
					<td class="tag-control"><input type="checkbox" value="{widget.property.unique}" name="unique" alt="property"  onchange="{change}"/></td>
				</tr>
				<tr class="property-cachable">
					<td class="tag">缓存</td>
					<td class="tag-control"><input type="checkbox" value="{widget.property.cachable}" name="cachable" alt="property"  onchange="{change}"/></td>
				</tr>
				<tr class="property-orphanremoval">
					<td class="tag">orphanRemoval</td>
					<td class="tag-control"><input type="checkbox" value="{widget.property.orphanremoval}" name="orphanremoval" alt="property"  onchange="{change}"/></td>
					
				</tr>
				<tr class="property-fetch">
					<td class="tag">提取方式</td>
					<td class="tag-control">
						<select name="fetch" title="property"  onchange="{change}" style="width:100%">
							<option value="FetchType.LAZY" selected="{widget.property.fetch=='FetchType.LAZY'}">LAZY</option>					 		
					 		<option value="FetchType.EAGER"  selected="{widget.property.fetch=='FetchType.EAGER'}">EAGER</option>
					 	</select>
					</td>
				</tr>
				<tr class="property-mappedby">
					<td class="tag">映射对象</td>
					<td class="tag-control"><input type="text" value="{widget.property.mappedby}" name="mappedby" alt="property"  onchange="{change}"/></td>
				</tr>
				<tr class="property-cascade">
					<td class="tag">级联方法</td>
					<td class="tag-control">
						<input type="hidden" id="property-cascade"/>
					</td>
				</tr>
			</table>
		</div>
		</td>
	</tr>
	
	<tr class="key2 property-panel" if={widget.key2}>
		<td >
			<a class="nav-header">引用属性</a>
			<div id="key2" class="panel-collapse in collapse" style="padding: 2px">
			<table class="table table-bordered tighten">
				<tr class="key2-name">
					<td class="tag">名称</td>
					<td class="tag-control"><input type="text" value="{widget.property.name}" name="name" alt="key2"  onchange="{change}"/></td>
				</tr>
				<tr class="key2-type">
					<td class="tag">应用类型</td>
					<td class="tag-control"><input type="text"  value="{widget.property.type}" name="type" alt="key2"  onchange="{change}" readonly/></td>
				</tr>
				<tr class="key2-collectionType">
					<td class="tag">集合类型</td>
					<td class="tag-control">
						<select  name="collectionType" alt="key2"  onchange="{change}">
					 		<option value="Set" selected="{widget.key2.collectionType=='Set'}">Set</option>
					 		<option value="List" selected="{widget.key2.collectionType=='List'}">List</option>
					 	</select>
					</td>
				</tr>
				<tr class="key2-duplexing">
					<td class="tag">双向关联</td>
					<td class="tag-control"><input type="checkbox"  value="{widget.property.duplexing}" name="duplexing" alt="key2"  onchange="{change}"/></td>
				</tr>
			</table>
		</div>
		</td>
	</tr>
	</table>
	<script>
	var parent=this;
	while(parent.parent!=null)
		parent=parent.parent;
	this.designer=parent.opts;
	this.activepanel=this.designer.document.activePanel.instance;
	this.widget=this.activepanel.focuswidget;
	var ths=this;
	change(e){
		var target=e.currentTarget||e.target;
		target=target.control||target;
		var prop=target.alt||target.title;
		var name=target.name;
		var value=target.value;
		if(target.type=="checkbox"){
			if(prop)
				this.widget[prop][name]=target.checked;
			else
				this.widget[name]=target.checked;
			if(prop=="data"&&name=="ispk"){
				if(target.checked){
					this.widget.data.nullable=false;
					this.widget.parent.removefield(this.widget);
					this.widget.parent.addpk(this.widget);
				}
				else{
					this.widget.parent.removefield(this.widget);
					this.widget.parent.addfield(this.widget);
				}
			}
		}
		else{
			if(prop)
				this.widget[prop][name]=value;
			else
				this.widget[name]=value;
		}
		this.activepanel.paint();
		//opts.trigger("propertychange",this.widget,prop,name);
	}	
	
	this.on("mount",function(){
		var CascadeType=[
		             {id:"CascadeType.ALL",text:"ALL"},
		             {id:"CascadeType.PERSIST",text:"PERSIST"},
		             {id:"CascadeType.MERGE",text:"MERGE"},
		             {id:"CascadeType.REMOVE",text:"REMOVE"},
		             {id:"CascadeType.REFRESH",text:"REFRESH"},
		             {id:"CascadeType.DETACH",text:"DETACH"}
		             ];
		
		$("#property-cascade").select2({
			multiple:true,
			data:CascadeType
		});
	})
	</script>
</propertyEditorExtension>