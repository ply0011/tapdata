<propertyEditorWidget>
<style scoped="scoped">
	.colorpick{
		width:50px;height:30px;border:solid 2px lightgray
	}
	
	.number{
		width:30px;height:30px;border:solid 1px lightgray
	}
	.table-nobordered{
	  font-size:9pt;
	  border:none;
	}
	
	.table-nobordered tbody tr td{
	   border:none;
	}
	
	.table-nobordered input[type='text']{
	   width:100%;
	  
	}
	
	.table-propertyEditor input[type='text']{
	 	padding:5px;
	}
	
	.property-panel{
	   margin-bottom:0px;
	}
</style>
<div class="common"  style="margin-bottom:0px;border-width:0px"  if={widget}>
	<table class="table table-propertyEditor" style="width:100%;">
   		<tr class="common property-panel"  if={enableEdit("common")}>
	   		<td style="border-top:none">  
		    <table class="table table-nobordered" style="width:100%">
		    <tr>	
		    	<td class="tag" style="border-top:none">Name</td>
		    	<td class="tag-control" style="border-top:none"><input id="name" name="name"  type="text" value="{widget.name}"  onchange="{change}"/></td>
		    </tr>
		    <tr>
		    	<td class="tag">Description</td>
		    	<td class="tag-control"><textarea style="resize: none;width:100%" rows=3   name="text"  onchange="{change}">{widget.text}</textarea></td>
		    </tr>
		    </table>
		    </td>
	    </tr>
	    <tr if={widget.objectdata}>
	    	<td colspan=2>
	    		<propertyEditorObjectData></propertyEditorObjectData>
	    	</td>
	    </tr>
	  	<tr class="tail property-panel"  if={widget.tail}>
			<td>
	   		<div class="property-header">提示框</div>
			<div id="tail" class="panel-collapse in collapse" style="padding:6px">	
			    	<label for="tail-position">位置</label>
			    	<select id="tail-position" style="width:60px">
			    		<option value="top" selected="{widget.tail.position=='top'}">上</option>
			    		<option value="bottom" selected="{widget.tail.position=='bottom'}">下</option>
			    		<option value="left" selected="{widget.tail.position=='left'}">左</option>
			    		<option value="right" selected="{widget.tail.position=='right'}">右</option>		    		
			    	</select>
			    	<div class="btn-group">
			    		<label for="tail-margin">边距</label>
				    	<input type="text" id="tail-margin" value="{widget.tail.margin}" class="number"  title="边距"/>
			    	</div>
			    	<div class="btn-group">
				    	<label for="tail-size">尺寸</label>
				    	<input type="text" id="tail-size" value="{widget.tail.size}" class="number"  title="尺寸"/>
			    	</div>
		    </div>
		</td>
		</tr>
		<tr class="arrow property-panel"  style="margin-bottom:0px;float:none"  if={widget.begin&&enableEdit("arrow")}>
			<td >
	   		<div class="property-header">箭头</div>
			<div id="arrow" class="panel-collapse in collapse" style="padding:6px">
			    <div class="">
			    	<div class="btn-group" style="margin-bottom:5px">
				    	<label for="arrow-name1">前</label>
				    	<select style="width:70px" title="begin" name="name"  onchange="{shapechange}">
				    		<option value="none"  selected="{widget.begin.shape.name=='none'}">无</option>
					    	<option value="dot"   selected="{widget.begin.shape.name=='dot'}">圆点</option>
					    	<option value="arrow" selected="{widget.begin.shape.name=='arrow'}">箭头</option>
					    	<option value="diamond" selected="{widget.begin.shape.name=='diamond'}">菱形</option>
				    	</select>
				    	<select  style="width:70px" title="begin" name="type"  onchange="{shapechange}">
				    		<option value="1" selected="{widget.begin.shape.type==1}">类一</option>
			    			<option value="2" selected="{widget.begin.shape.type==2}">类二</option>
			    			<option value="3" selected="{widget.begin.shape.type==3}">类三</option>		
			    			<option value="4" selected="{widget.begin.shape.type==4}">类四</option>
				    		<option value="5" selected="{widget.begin.shape.type==5}">类五</option>
				    		<option value="6" selected="{widget.begin.shape.type==6}">类六</option>	    		
				    	</select>
			    	</div>
			    	<div class="btn-group">
				    	<label for="arrow-radius1" id="arrow-radius-label1">尺寸</label>
				    	<input type="text" alt="begin" name="radius" onchange="{shapechange}" value="{widget.begin.shape.radius}" class="number"  title="圆点半径"/>
				    	<input type="text" alt="begin" name="size" onchange="{shapechange}" value="{widget.begin.shape.size}" class="number"  title="箭头尺寸"/>
				    	<input type="text" alt="begin" name="sharp" onchange="{shapechange}" value="{widget.begin.shape.sharp}" class="number"  title="箭头锋利"/>
			    	</div>
		    	</div>
		    	<div class=""  style="margin-top:5px">
			    	<div class="btn-group">
				    	<label for="arrow-name2">后</label>
				    	<select title="end" name="name"  onchange="{shapechange}" style="width:70px">
				    		<option value="none" selected="{widget.end.shape.name=='none'}">无</option>
					    	<option value="dot"  selected="{widget.end.shape.name=='dot'}">圆点</option>
					    	<option value="arrow" selected="{widget.end.shape.name=='arrow'}">箭头</option>
					    	<option value="diamond" selected="{widget.end.shape.name=='diamond'}">菱形</option>
				    	</select>
				    	<select title="end" name="type"  onchange="{shapechange}" style="width:70px">
				    		<option value="1" selected="{widget.end.shape.type==1}">类一</option>
			    			<option value="2" selected="{widget.end.shape.type==1}">类二</option>
			    			<option value="3" selected="{widget.end.shape.type==1}">类三</option>	
			    			<option value="4" selected="{widget.end.shape.type==1}">类四</option>
			    			<option value="5" selected="{widget.end.shape.type==1}">类五</option>
			    			<option value="6" selected="{widget.end.shape.type==1}">类六</option>
				    	</select>
				    </div>
				    <div class="btn-group" style="margin-top:3px">
				    	<label for="arrow-radius2" id="arrow-radius-label2">尺寸</label>
				    	<input type="text" alt="end" name="radius" onchange="{shapechange}"  value="{widget.end.shape.radius}" class="number"  title="圆点半径"/>
				    	<input type="text" alt="end" name="size" onchange="{shapechange}"  value="{widget.end.shape.size}" class="number"  title="箭头尺寸"/>
				    	<input type="text" alt="end" name="sharp" onchange="{shapechange}"  value="{widget.end.shape.sharp}" class="number"  title="箭头锋利"/>
				    </div>
		    	</div>
	    	</div>
	    </td>
	   </tr>
		<tr class="ruler property-panel" if={widget.ruler}>
			<td >
    		<div class="property-header">标尺</div>
				<div id="ruler" class="panel-collapse in collapse" style="padding:6px;">
					<table class="table table-nobordered" style="width:100%">
				    <tr>
				    	<td class="tag">类型</td>
				    	<td class="tag-control" colspan="3">
				    		<select  id="ruler-type">
				    			<option value="system">全局</option>
				    			<option value="normal">普通</option>		    		
				    			<option value="custom">定制</option>
				    		</select>
				    	</td>
				    </tr>
				    <tr>	
				    	<td class="tag">方向</td>
				    	<td class="tag-control">
				    		<select  id="ruler-direction">
				    			<option value="horizonal">水平</option>
				    			<option value="vertical">垂直</option>		    		
				    		</select>
				    	</td>
				    	<td class="tag">宽度/边距</td>
				    	<td class="tag-control">
				    		<input type="text" id="ruler-width" class="number" />
				    	</td>
				    </tr>
				    </table>
				</div>
			</td>
	    </tr>
 		<tr class="property-panel icon"   if={widget.icon}>
 				<td >
  			<div class="property-header">图标</div>
		    <div id="icon" class="panel-collapse in collapse" style="padding:6px">
		    	<input type="text" id="icon-color" class="colorpick"  value="{widget.icon.color}" title="颜色"></input>
		    	<div class="sp-replacer sp-light" style="margin-top:5px;margin-bottom:5px">
		    		<input type="hidden" id="icon-text" name="icon-text"/> 
		    		<input type="button" id="btn-icon" name="btn-icon" style="width:40px;height:40px;line-height:0.8;"/>
		    	</div>
		    	<div class="btn-group">
			    	<label style="margin-right:5px" for="icon-size">大小</label><input type="text" id="icon-size" name="icon-size" value="{widget.icon.size}" class="number" style="width:60px;height:25px;"/>
			    	<input type="checkbox" id="icon-fill"  checked="{widget.icon.fill?true:''}"/><label for="icon-fill" style="margin-left:5px">填充</label>
		    	</div>
	    	</div>
	    	</td>
  		</tr> 
	    <tr class="hint property-panel" if="{widget.hint}">
 			<td >
	    	<div class="property-header">提示框</div>
			<div id="hint" class="panel-collapse in collapse" style="padding:6px;">
				<div class="btn-group">
					<label for="hint-show">显示提示框</label>
					<input id="hint-show"  type="checkbox"  checked="{widget.hint.show}">
				</div>
				<div class="btn-group">
	    			<label for="hint-has-mask">显示遮罩</label>
	    			<input id="hint-has-mask"  type="checkbox" checked="{widget.hint.mask}">
	    		</div>
	    		<div class="">
	    			<label for="hint-mask-color">背景色</label>
	    			<input  id="hint-mask-color" type="text" class="colorpick" value="{widget.hint.color}"></input>
	    			<label for="hint-mask-alpha">透明度</label>
		    		<input  id="hint-mask-alpha" type="text" class="number"  value="{widget.hint.alpha}"  min="0" max="10"></input>
	    		</div>
 				</div>
 			</td>
 		 </tr>	
 		 <tr class="polygon property-panel"  if="{widget.polygon}">
 			<td >
	    		<div class="property-header">多边形</div>
				<div id="polygon" class="panel-collapse in collapse" style="padding:6px;">
				    <table class="table table-nobordered" style="width:100%;margin-bottom:0px">
				    <tr>	
				    	<td class="tag">边数</td>
				    	<td class="tag-control"><input  min="3" name="sides" alt="polygon" onchange="{change}" class="number" type="text" value="{widget.polygon.sides}"/></td>
				    	<td class="tag">起始角度</td>
				    	<td class="tag-control"><input  min="0" name="startAngle" alt="polygon" onchange="{change}" max="360"  class="number" value="{widget.polygon.startAngle}"></input></td>
				    </tr>
				    </table>
 				</div>
 			</td>
 		</tr>
 		<tr class="hyperlink property-panel" if={enableEdit("hyperlink")}>
	   	 <td >
	   		<div class="property-header">操作</div>
		    <div id="hyperlink" class="panel-collapse in collapse" style="padding:6px">
		    	<input type="radio" id="hyperlink-type1" checked={widget.hyperlink.type=='url'} name="type"  value="url"/><label for="hyperlink-type1" style="margin-right:5px">打开网址</label>
		    	<input type="radio" id="hyperlink-type2" checked={widget.hyperlink.type=='window'} name="type" value="window"/><label for="hyperlink-type2" style="margin-right:5px">切换窗口</label>
		    	<input type="radio" id="hyperlink-type3" checked={widget.hyperlink.type=='command'}  name="type" value="command"/><label for="hyperlink-type3" style="margin-right:5px">执行命令</label>
		    	<input style="width:98%" type="text" name="url"  alt="hyperlink" value="{widget.hyperlink.url}"/>
		    	<div style="margin-top:0px;margin-bottom:4px; display:none">
			    	<select style="width:98%;"  name="window"  title="hyperlink">
			    	   <option value={panel.name} each={panel,i in panels}  selected="{widget.hyperlink.window==panel.name}" if={panel.instance.name!=activepanel.name}>{panel.instance.title}</option>
			    	</select> 
		    	</div>
		    	<div style="margin-top:0px;margin-bottom:4px; display:none">
			    	<select id="hyperlink-command" title="command" style="width:98%;">
			    	</select> 
		    	</div>
		    	<div style="margin-top:5px">
			   		<label for="hyperlink-target" style="margin-right:5px">目标</label>
			    	<select name="target"  title="hyperlink">
				    	<option value="_blank" selected="{widget.hyperlink.target=='_blank'}">新窗口</option>
				    	<option value="_self"  selected="{widget.hyperlink.target=='_self'}">原窗口</option>
			    	</select> 
	   			 </div>	
	   		 </div>
	   		</td>
 		</tr> 
  		<tr class="other property-panel" if={enableEdit("position")}>
	   		<td >
	    		<div class="property-header">位置</div>
				<div id="other" class="panel-collapse in collapse" style="padding:6px">
				    	<div class="btn-group"><label for="margin" style="margin-right:5px">边距</label><input id="margin" class="number" title="margin" style="width:40px;height:25px;" type="text" value="{widget.x}"/></div>
				    	<div class="btn-group"><label for="alpha" style="margin-right:5px">透明度</label><input id="alpha" class="number" title="alpha" style="width:40px;height:25px;" type="text" value="{widget.y}" /></div>
			   		 	<div class="btn-group"><label for="rotate" style="margin-right:5px">旋转</label><input id="rotate" class="number" title="rotate" style="width:40px;height:25px;" type="text" value="{widget.rotate}"/></div>
			   		 	<div class="btn-group" style="margin-top:5px">
				   		 	<div class="btn-group"><label for="y" style="margin-right:5px;">上   <input id="y" title="top" class="number" style="width:40px;height:25px;" type="text" value="{widget.x}"/></label></div>
					    	<div class="btn-group"><label for="x" style="margin-right:5px">左   <input id="x" title="left" class="number" style="width:40px;height:25px;" type="text" value="{widget.y}" /></label></div>
					    	<div class="btn-group"><label for="width" style="margin-right:5px">宽   <input id="width" title="width" class="number" style="width:40px;height:25px;" type="text" value="{widget.width}" /></label></div>
					    	<div class="btn-group"><label for="height" style="margin-right:5px">高   <input id="height" title="height" class="number" style="width:40px;height:25px;" type="text" value="{widget.height}" /></label></div>
				    	</div>
				</div>
			</td>
	     </tr>
	     <!-- <tr class="animation property-panel">
			<td>
				<div class="property-header">动画</div>
				<div class="btn-group" style="padding:6px">
					<div class="btn-group" style="margin-bottom:5px;margin-right:5px;">
						<label for="animation-enterstyle" class="control-label">进入</label>
						<input type="hidden" id="animation-enterstyle" />
						<select id="animation-enterstyle" style="width:110px">
							<option value="0">无</option>
							<option value="-1">随机</option>
							<option value="1">从左进入</option>
							<option value="2">从右进入</option>
							<option value="3">从下进入</option>
							<option value="4">从上进入</option>
							<option value="5">从左上进入</option>
							<option value="6">从左下进入</option>
							<option value="7">从右上进入</option>
							<option value="8">从右下进入</option>
							<option value="9">渐进</option>
						</select>
					</div>
					<div class="btn-group">
						<label for="animation-leavestyle" class="control-label">退出</label>
						<input type="hidden" id="animation-leavestyle" />
						<select id="animation-leavestyle" style="width:110px">
							<option value="0">无</option>
							<option value="-1">随机</option>								
							<option value="2">从右退出</option>
							<option value="1">从左退出</option>
							<option value="4">从上退出</option>
							<option value="3">从下退出</option>
							<option value="5">从右上退出</option>
							<option value="7">从右下退出</option>
							<option value="6">从左上退出</option>										
							<option value="8">从左下退出</option>
							<option value="9">渐隐</option>
						</select>
					</div>
				</div>
			</td>
		</tr> -->
	</table>
</div>
<div class="panel" style="margin-bottom:0px;border-width:0px;" if={widget}>
	    <table class="table table-propertyEditor" style="width:100%">
		    <tr class="font property-panel" if={enableEdit("font")}>
		    	<td>
		    		<div class="property-header" style="border-top-width:0px;">字体</div>
		    		<div style="padding:6px">
				    	<input type="hidden" class="fontsize"  id="font-size" name="size" alt="font"  onchange="{change}" title="字体大小" value="{widget.font.size}"  style="width:80px"/>
			    		<div class="btn-group" style="margin-top:5px;">
				    		<input type="hidden" id="font-name" class="fontname" name="family" alt="font"  onchange="{change}" value="{widget.font.family}" style="width:120px;padding-bottom:5px" title="字体名称"/>
			    		</div>
			    		<div class="btn-group" style="margin-top:5px;">
				    		<input type="text" id="font-color" class="colorpick" name="color" alt="font"  onchange="{change}"  value="{widget.font.color}"  title="颜色"/>	
				    	</div>
				    	<div style="margin-left:0px;margin-top:5px">
				    		<div class="btn-group" data-toggle="buttons">
								  <label class="btn btn-default {active:widget.font&&widget.font.weight=='bold'}"   onclick="{change}"  style="height:30px;width:35px;">
								    <input type="checkbox"  id="font-weight" name="weight" alt="font"/><span class="fa fa-bold"></span>
								  </label>
								  <label class="btn btn-default {active:widget.font&&widget.font.style=='italic'}" onclick="{change}" style="height:30px;width:35px;">
								    <input type="checkbox"  id="font-style" name="style" alt="font"><span class="fa fa-italic"></span>
								  </label>
							</div>			    	
					    	<label for="font-fill" style="margin-left:5px;margin-top:5px;line-height:17px;vertical-align: middle">
					    		<input type="checkbox" id="font-fill" name="fill" alt="font"  onchange="{change}" checked="{widget.font.fill}"/>填充
					    	</label>
			   		 	</div>
	   		 		</div>
	    		</td>
	    	</tr>
	    	<tr class="background property-panel"  if={enableEdit("background")}>
		    	<td>
		    		<div class="property-header">背景</div>
			    	<div id="background" class="btn-group" style="padding:2px 0px 2px 6px">
		    		    <label for="background-filltype">类型</label>				    	
			    	   	<select id="background-filltype" style="width:80px" name="filltype" title="background"  onchange="{change}">
				    		<option value="none" selected="{widget.background.filltype=='none'}">无</option>
					    	<option value="color"  selected="{widget.background.filltype=='color'}">颜色</option>
					    	<option value="gradient" selected="{widget.background.filltype=='gradient'}">渐变</option>
					    	<option value="image" selected="{widget.background.filltype=='image'}">图片</option>
					    	<option value="images" disabled  selected="{widget.background.filltype=='images'}">图片组</option>
				    	</select>
				    </div>
				    <div class="btn-group background-color" style="padding:2px 0px 2px 6px"  show={widget.background.filltype=='color'}>
				    		<input type="text" id="background-color" class="colorpick" name="color" alt="background" onchange="{change}" value="{widget.background.color}"  title="背景色"/>
				    </div> 
				    
				    <div class="btn-group background-gradient" style="padding:2px 0px 2px 6px" show={widget.background.filltype=='gradient'}>
						<input type="text" id="gradient-begin-color" class="colorpick"  name="begincolor" alt="gradient" onchange="{change}" value="{widget.gradient.begincolor}"  title="背景色"/>
						<a  href="#" onclick={exchangecolor}><span class="fa fa-exchange"></span></a>		    	
						<input type="text" id="gradient-end-color" class="colorpick" name="endcolor" alt="gradient" onchange="{change}" value="{widget.gradient.endcolor}"  title="背景色"/>
					</div>
					
					<select id="background-imagetype" style="width:80px;padding:2px 0px 2px 6px" class="background-image"  name="imageType" title="background" onchange="{change}" if={widget.background.filltype=='image'}>
					    	<option value="fit" selected="{widget.background.imageType=='fit'}">自适应</option>
					    	<option value="fill" selected="{widget.background.imageType=='fill'}">填充</option>
					    	<option value="repeat" selected="{widget.background.imageType=='repeat'}">重复</option>
					    	<option value="center"  selected="{widget.background.imageType=='center'}">居中</option>
			    	</select>
			    	
			    	<div class="btn-group" style="padding:6px" if={widget.background.filltype=='gradient'}>
						<div class="btn-group">
							<div class="btn-group" style="margin-top:2px;margin-right:5px">
								<label for="gradient-type">类型</label>
								<select id="gradient-type" style="width:90px"   name="type" title="gradient" onchange="{change}">
									<option value="none"  selected="{widget.gradient.type=='none'}">无</option>
							    	<option value="liner" selected="{widget.gradient.type=='liner'}">线性</option>
							    	<option value="radial" selected="{widget.gradient.type=='radial'}">放射性</option>
						    	</select>							    	
					    	</div>
					    	<div class="btn-group" style="margin-top:2px;">
					    	<div class="btn-group gradient-angle">
					    		<label for="gradient-angle">渐变角度</label>
						    	<input type="text"  value="{widget.gradient.angle}"  name="angle" alt="gradient" onchange="{change}" class="number" 	min=0 max=360   title="角度 (0~360)"/>
						    </div>
						    <div class="btn-group gradient-radius">
						    	<label for="gradient-radius">渐变半径</label>
						    	<input type="text"  value="{widget.gradient.radius}"  name="radius" alt="gradient" onchange="{change}" class="number" min=5 max=100   title="半径 (5~100)"/>
						    </div>
						    </div>
				    	</div>
			    	</div>
			    	
			    	<!-- todo -->
			    	<div class="btn-group spirit-images" style="padding:6px"  checked="{widget.spirit.autoplay}" if={widget.background.filltype=='images'}>
						<input type="checkbox" id="spirit-autoplay"	title="自动切换" name="autoplay" alt="spirit" onchange="{change}"/>
						<label for="spirit-autoplay"> 
							自动切换
						</label>
						<input type="text" class="number" id="spirit-interval" name="interval" alt="spirit" onchange="{change}" style="width:40px" min=1 max=100	title="速度"  value="{widget.spirit.interval}" />
					</div>
					
					<div class="background" if={enableEdit("background")&&widget.background.filltype=='image'}>
						<div class="btn-group" style="padding:6px 6px 6px 32px">
		   					<a href='#'  onclick="{changebackgroundimage}">
		   					 <img id="background-image" src="{widget.background.image.src}" width="60px" height="60px" style="border:solid 1px lightgray" title="背景图片" class="img-rounded"></img>
		   					 </a> 
		   					 <a href="#" id="btn_remove_background_image" onclick="{removebackgroundimage}">清除</a>
				    	</div>
				    	<div> <input type="file" style="display:none" id="background-file"  accept="image/*"/> </div>
					</div>
			    </td>
	   		</tr>
	   		<!-- todo -->
	   		<tr class="background property-panel spirit-images" if={enableEdit("background")&&widget.background.filltype=='images'}>
	   			<td style="border-width:0px">
	   				<div class="btn-group" style="padding:6px 6px 6px 32px">
	   					 <a href="#" id="spirit-images"  onclick="{addspiritimages}">添加图片</a>
	   					 <a href="#" id="btn_remove_spirit_image"  onclick="{removespiritimages}">清除</a>
			    	</div>
			    	<div style="display:none1"> <input type="file" multiple="" style="display:none" id="spirit-files"  accept="image/*"/> </div>
			    	<div class="spirit-list" style="padding:6px 6px 6px 6px;max-height:126px;overflow:auto" id="spirit-images-preview">
			    		
			    	</div>
	   			</td>
	   		</tr>
   			<tr class="stroke property-panel" if={enableEdit("border")}>
	   			<td>
			   		<div class="property-header">线框</div>
				    <div id="stroke" class="panel-collapse in collapse" style="padding:6px">
				    	<input type="text" id="stroke-color" name="color" alt="border" onchange="{change}" class="colorpick" value="{widget.border.color}"  title="颜色"></input> 
				    	<select id="stroke-width"  style="width:80px" name="width" title="border" onchange="{change}">
					    	<option value="1" selected="{widget.border.width==1}">超细</option>
					    	<option value="2" selected="{widget.border.width==2}">较细</option>
					    	<option value="3" selected="{widget.border.width==3}">细</option>
					    	<option value="4" selected="{widget.border.width==4}">中等</option>
					    	<option value="5" selected="{widget.border.width==5}">粗</option>
					    	<option value="6" selected="{widget.border.width==6}">较粗</option>
					    	<option value=7 selected="{widget.border.width==7}">最粗</option>
				    	</select> 
				    	<select id="stroke-type"  style="width:80px"   name="type" title="border" onchange="{change}">
					    	<option value="solid"  selected="{widget.border.type=='solid'}">实线</option>
					    	<option value="dotted" selected="{widget.border.type=='dotted'}">虚线</option>
					    	<option value="dashed" selected="{widget.border.type=='dashed'}">短划线</option>				    	
				    	</select> 
			   		 </div>
	   			 </td>
 		 	</tr>
    
	  	  <tr class="shadow property-panel" if={enableEdit("shadow")}>
		    <td>
		   		<div class="property-header">阴影</div>
			    <div id="shadow" class="panel-collapse in collapse" style="padding:6px">
			    	<input type="text" id="shadow-color"  class="colorpick"  title="颜色"  value="{widget.shadow.color}" onchange="{change}" name="color" alt="shadow"></input> 
			    	<input id="shadow-offsetx" class="number" value="{widget.shadow.offsetX}" onchange="{change}" name="offsetX" alt="shadow"  type="text"  title="水平偏移"/>
			    	<input id="shadow-offsety" class="number" type="text" value="{widget.shadow.offsetY}" onchange="{change}" name="offsetY" alt="shadow"  title="垂直偏移"/>
			    	<input id="shadow-blur"    class="number" type="text" value="{widget.shadow.blur}" onchange="{change}" name="blur" alt="shadow" title="模糊"/>
		   		 </div>
	   		</td>
	   	  </tr>
   	
	     <tr class="corner property-panel" if={enableEdit("corner")}>
	   	 <td>
	   		<div class="property-header">角</div>
			<div id="corner" class="panel-collapse in collapse" style="padding:6px">
		    	<label for="corner-radius">类型</label>
		    	<select id="corner-type" style="width:70px" onchange="{change}" name="type" title="corner">
			    	<option value="rect"  selected="{widget.corner.type=='rect'}">直角</option>
			    	<option value="round" selected="{widget.corner.type=='round'}">圆角</option>
		    	</select>
		    	<label for="corner-radius" id="corner-radius-label" if="{widget.corner.type=='round'}">半径 <input type="text" id="corner-radius" class="number"  onchange="{change}" name="radius" alt="corner" value="{widget.corner.radius}"  title="圆角半径"/></label>
		    	
	    	</div>
	    </td>
	   	</tr>
	   	<tr class="paragraph property-panel" if={enableEdit("paragraph")}>
	  		<td>
	   			<div class="property-header">段落</div>
				<div id="paragraph" class="panel-collapse in collapse" style="padding:6px">
			    	<div class="btn-toolbar">
			    		<div class="btn-group">
					    	<label for="line-space" style="margin-right:5px">行间距</label>
					    	<input id="line-space"  name="linespace"  alt="paragraph"  title="line space" class="number" type="text"  onchange="{change}" value="{widget.paragraph.linespace}"/>
					    </div>
						<!-- 					
					    <div class="btn-group">
					    	<label for="paragraph-space" style="margin-right:5px">段间距</label><input id="paragraph-space" title="paragraph space" class="number" style="width:30px;height:25px;" type="text" value="1.5" />
				    	</div> 
				    	-->	
				</div>	
					<div style="margin-top:5px">
						<label for="paragraph-align" style="margin-right:5px">水平
						  	 <select id="paragraph-align" name="textalign" title="paragraph" onchange="{change}">
						    	<option value="left"  selected="{widget.paragraph.textalign=='left'}">左对齐</option>
						    	<option value="center" selected="{widget.paragraph.textalign=='center'}">中对齐</option>
						    	<option value="right"  selected="{widget.paragraph.textalign=='right'}">右对齐</option>
					    	  </select>
						</label>
				  	
				    	<label for="paragraph-valign" style="margin-right:5px">垂直
				    	  	 <select id="paragraph-valign" onchange="{change}" name="textvalign" title="paragraph">
						    	<option value="top" selected="{widget.paragraph.textvalign=='top'}">上对齐</option>
						    	<option value="middle" selected="{widget.paragraph.textvalign=='middle'}">中对齐</option>
						    	<option value="bottom" selected="{widget.paragraph.textvalign=='bottom'}">下对齐</option>
					    	  </select> 
				    	</label>
					</div>					
		   		</div>
		 	</td>
	  	</tr>
	</table>
	<!--<propertyEditorExtension></propertyEditorExtension> -->
</div> 
<div class="property_message" if={!widget}>
	<label>Please select an object to display the properties.</label>
</div>
<script>
	var parent=this;
	while(parent.parent!=null)
		parent=parent.parent;
	this.designer=parent.opts;
	this.panels=this.designer.document.panels;
	this.activepanel=this.designer.document.activePanel.instance;
	this.widget=this.activepanel.focuswidget;
	/* if(this.widget)
		sh(this.widget.persist()); */
	
	var ths=this;
		
	this.enableEdit=function(prop){
		if(ths.widget&&ths.widget.propertyEditors.indexOf(prop)>=0)
			return true;
		else
			return false;
	};	
	
	change(e){
		var target=e.currentTarget||e.target;
		target=target.control||target;
		var prop=target.alt||target.title;
		var name=target.name;
		var value=target.value;
		if(prop=="font"&&name=="weight"){
			if(this.widget[prop][name]!="bold")
				this.widget[prop][name]="bold";
			else
				this.widget[prop][name]="normal";
		}
		else if(prop=="font"&&name=="style"){
			if(this.widget[prop][name]!="italic")
				this.widget[prop][name]="italic";
			else
				this.widget[prop][name]="normal";
		}
		else if(prop=="border"&&name=="width"){
			value=parseInt(value);
			this.widget[prop][name]=value;
		}
		else if(target.type=="checkbox"){
			if(prop)
				this.widget[prop][name]=target.checked;
			else
				this.widget[name]=target.checked;
		}
		else{
			if(prop)
				this.widget[prop][name]=value;
			else
				this.widget[name]=value;
		}
		this.activepanel.paint();
		opts.trigger("propertychange",this.widget,prop,name);
	}	
	changebackgroundimage(){
		opts.trigger("selectbackgroundimage","widget");
	};
	
	removebackgroundimage(){
		this.widget.background.image.src="";
		this.widget.paint();
	}
	
	addspiritimages(e){
		 if(!$(e.target).attr("disabled"))
			 $("#spirit-files").click();
	}
	
	removespiritimages(e){
		 $("#spirit-files").val("").trigger("change");		  
		 return false;
	}
	
	exchangecolor(e){
		 var endcolor=$("#gradient-end-color").val();
		 $("#gradient-end-color").spectrum("set", $("#gradient-begin-color").val());
		 $("#gradient-begin-color").spectrum("set",endcolor);
		 $("#gradient-begin-color").trigger("change");
		 $("#gradient-end-color").trigger("change");
	}
	
	this.on("mount",function(){
		$(this.root).find(".number").number();
		$(this.root).find("select").select2();
		
		
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
	    
		$(this.root).find(".colorpick").spectrum({
	   	    showInput: true,
	   	    allowEmpty:true,
	   	    cancelText: "取消",
	   	    chooseText: "选择",
	   	    showInitial: true,
	   	 	localStorageKey:"colorpick",
	   	    showPalette: true,
	   	 	showAlpha:true,
	   	    showSelectionPalette:true,
	   	    palette: [ ],
	   	    preferredFormat: "hex"
	    });
	})
</script>
</propertyEditorWidget>