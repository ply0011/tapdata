riot.tag2('propertyeditorwidget', '<div class="common" style="margin-bottom:0px;border-width:0px" if="{widget}"> <table class="table table-propertyEditor" style="width:100%;"> <tr> <td colspan="2">Attribute</td> </tr> <tr class="common property-panel" if="{enableEdit(⁗common⁗)}"> <td style="border-top:none"> <table class="table table-nobordered" style="width:100%"> <tr> <td class="tag" style="border-top:none">Name</td> <td class="tag-control" style="border-top:none"><input id="name" name="name" type="text" value="{widget.name}" onchange="{change}"></td> </tr> <tr> <td class="tag">Description</td> <td class="tag-control"><textarea style="resize: none;width:100%" rows="3" name="text" onchange="{change}">{widget.text}</textarea></td> </tr> </table> </td> </tr> <tr if="{widget.objectdata}"> <td colspan="2"> <propertyeditorobjectdata></propertyEditorObjectData> </td> </tr> <tr class="tail property-panel" if="{widget.tail}"> <td> <div class="property-header">提示框</div> <div id="tail" class="panel-collapse in collapse" style="padding:6px"> <label for="tail-position">位置</label> <select id="tail-position" style="width:60px"> <option value="top" __selected="{widget.tail.position==\'top\'}">上</option> <option value="bottom" __selected="{widget.tail.position==\'bottom\'}">下</option> <option value="left" __selected="{widget.tail.position==\'left\'}">左</option> <option value="right" __selected="{widget.tail.position==\'right\'}">右</option> </select> <div class="btn-group"> <label for="tail-margin">边距</label> <input type="text" id="tail-margin" value="{widget.tail.margin}" class="number" title="边距"> </div> <div class="btn-group"> <label for="tail-size">尺寸</label> <input type="text" id="tail-size" value="{widget.tail.size}" class="number" title="尺寸"> </div> </div> </td> </tr> <tr class="arrow property-panel" style="margin-bottom:0px;float:none" if="{widget.begin&&enableEdit(⁗arrow⁗)}"> <td> <div class="property-header">箭头</div> <div id="arrow" class="panel-collapse in collapse" style="padding:6px"> <div class=""> <div class="btn-group" style="margin-bottom:5px"> <label for="arrow-name1">前</label> <select style="width:70px" title="begin" name="name" onchange="{shapechange}"> <option value="none" __selected="{widget.begin.shape.name==\'none\'}">无</option> <option value="dot" __selected="{widget.begin.shape.name==\'dot\'}">圆点</option> <option value="arrow" __selected="{widget.begin.shape.name==\'arrow\'}">箭头</option> <option value="diamond" __selected="{widget.begin.shape.name==\'diamond\'}">菱形</option> </select> <select style="width:70px" title="begin" name="type" onchange="{shapechange}"> <option value="1" __selected="{widget.begin.shape.type==1}">类一</option> <option value="2" __selected="{widget.begin.shape.type==2}">类二</option> <option value="3" __selected="{widget.begin.shape.type==3}">类三</option> <option value="4" __selected="{widget.begin.shape.type==4}">类四</option> <option value="5" __selected="{widget.begin.shape.type==5}">类五</option> <option value="6" __selected="{widget.begin.shape.type==6}">类六</option> </select> </div> <div class="btn-group"> <label for="arrow-radius1" id="arrow-radius-label1">尺寸</label> <input type="text" alt="begin" name="radius" onchange="{shapechange}" value="{widget.begin.shape.radius}" class="number" title="圆点半径"> <input type="text" alt="begin" name="size" onchange="{shapechange}" value="{widget.begin.shape.size}" class="number" title="箭头尺寸"> <input type="text" alt="begin" name="sharp" onchange="{shapechange}" value="{widget.begin.shape.sharp}" class="number" title="箭头锋利"> </div> </div> <div class="" style="margin-top:5px"> <div class="btn-group"> <label for="arrow-name2">后</label> <select title="end" name="name" onchange="{shapechange}" style="width:70px"> <option value="none" __selected="{widget.end.shape.name==\'none\'}">无</option> <option value="dot" __selected="{widget.end.shape.name==\'dot\'}">圆点</option> <option value="arrow" __selected="{widget.end.shape.name==\'arrow\'}">箭头</option> <option value="diamond" __selected="{widget.end.shape.name==\'diamond\'}">菱形</option> </select> <select title="end" name="type" onchange="{shapechange}" style="width:70px"> <option value="1" __selected="{widget.end.shape.type==1}">类一</option> <option value="2" __selected="{widget.end.shape.type==1}">类二</option> <option value="3" __selected="{widget.end.shape.type==1}">类三</option> <option value="4" __selected="{widget.end.shape.type==1}">类四</option> <option value="5" __selected="{widget.end.shape.type==1}">类五</option> <option value="6" __selected="{widget.end.shape.type==1}">类六</option> </select> </div> <div class="btn-group" style="margin-top:3px"> <label for="arrow-radius2" id="arrow-radius-label2">尺寸</label> <input type="text" alt="end" name="radius" onchange="{shapechange}" value="{widget.end.shape.radius}" class="number" title="圆点半径"> <input type="text" alt="end" name="size" onchange="{shapechange}" value="{widget.end.shape.size}" class="number" title="箭头尺寸"> <input type="text" alt="end" name="sharp" onchange="{shapechange}" value="{widget.end.shape.sharp}" class="number" title="箭头锋利"> </div> </div> </div> </td> </tr> <tr class="ruler property-panel" if="{widget.ruler}"> <td> <div class="property-header">标尺</div> <div id="ruler" class="panel-collapse in collapse" style="padding:6px;"> <table class="table table-nobordered" style="width:100%"> <tr> <td class="tag">类型</td> <td class="tag-control" colspan="3"> <select id="ruler-type"> <option value="system">全局</option> <option value="normal">普通</option> <option value="custom">定制</option> </select> </td> </tr> <tr> <td class="tag">方向</td> <td class="tag-control"> <select id="ruler-direction"> <option value="horizonal">水平</option> <option value="vertical">垂直</option> </select> </td> <td class="tag">宽度/边距</td> <td class="tag-control"> <input type="text" id="ruler-width" class="number"> </td> </tr> </table> </div> </td> </tr> <tr class="property-panel icon" if="{widget.icon}"> <td> <div class="property-header">图标</div> <div id="icon" class="panel-collapse in collapse" style="padding:6px"> <input type="text" id="icon-color" class="colorpick" value="{widget.icon.color}" title="颜色"></input> <div class="sp-replacer sp-light" style="margin-top:5px;margin-bottom:5px"> <input type="hidden" id="icon-text" name="icon-text"> <input type="button" id="btn-icon" name="btn-icon" style="width:40px;height:40px;line-height:0.8;"> </div> <div class="btn-group"> <label style="margin-right:5px" for="icon-size">大小</label><input type="text" id="icon-size" name="icon-size" value="{widget.icon.size}" class="number" style="width:60px;height:25px;"> <input type="checkbox" id="icon-fill" __checked="{widget.icon.fill?true:\'\'}"><label for="icon-fill" style="margin-left:5px">填充</label> </div> </div> </td> </tr> <tr class="hint property-panel" if="{widget.hint}"> <td> <div class="property-header">提示框</div> <div id="hint" class="panel-collapse in collapse" style="padding:6px;"> <div class="btn-group"> <label for="hint-show">显示提示框</label> <input id="hint-show" type="checkbox" __checked="{widget.hint.show}"> </div> <div class="btn-group"> <label for="hint-has-mask">显示遮罩</label> <input id="hint-has-mask" type="checkbox" __checked="{widget.hint.mask}"> </div> <div class=""> <label for="hint-mask-color">背景色</label> <input id="hint-mask-color" type="text" class="colorpick" value="{widget.hint.color}"></input> <label for="hint-mask-alpha">透明度</label> <input id="hint-mask-alpha" type="text" class="number" value="{widget.hint.alpha}" min="0" max="10"></input> </div> </div> </td> </tr> <tr class="polygon property-panel" if="{widget.polygon}"> <td> <div class="property-header">多边形</div> <div id="polygon" class="panel-collapse in collapse" style="padding:6px;"> <table class="table table-nobordered" style="width:100%;margin-bottom:0px"> <tr> <td class="tag">边数</td> <td class="tag-control"><input min="3" name="sides" alt="polygon" onchange="{change}" class="number" type="text" value="{widget.polygon.sides}"></td> <td class="tag">起始角度</td> <td class="tag-control"><input min="0" name="startAngle" alt="polygon" onchange="{change}" max="360" class="number" value="{widget.polygon.startAngle}"></input></td> </tr> </table> </div> </td> </tr> <tr class="hyperlink property-panel" if="{enableEdit(⁗hyperlink⁗)}"> <td> <div class="property-header">操作</div> <div id="hyperlink" class="panel-collapse in collapse" style="padding:6px"> <input type="radio" id="hyperlink-type1" __checked="{widget.hyperlink.type==\'url\'}" name="type" value="url"><label for="hyperlink-type1" style="margin-right:5px">打开网址</label> <input type="radio" id="hyperlink-type2" __checked="{widget.hyperlink.type==\'window\'}" name="type" value="window"><label for="hyperlink-type2" style="margin-right:5px">切换窗口</label> <input type="radio" id="hyperlink-type3" __checked="{widget.hyperlink.type==\'command\'}" name="type" value="command"><label for="hyperlink-type3" style="margin-right:5px">执行命令</label> <input style="width:98%" type="text" name="url" alt="hyperlink" value="{widget.hyperlink.url}"> <div style="margin-top:0px;margin-bottom:4px; display:none"> <select style="width:98%;" name="window" title="hyperlink"> <option value="{panel.name}" each="{panel,i in panels}" __selected="{widget.hyperlink.window==panel.name}" if="{panel.instance.name!=activepanel.name}">{panel.instance.title}</option> </select> </div> <div style="margin-top:0px;margin-bottom:4px; display:none"> <select id="hyperlink-command" title="command" style="width:98%;"> </select> </div> <div style="margin-top:5px"> <label for="hyperlink-target" style="margin-right:5px">目标</label> <select name="target" title="hyperlink"> <option value="_blank" __selected="{widget.hyperlink.target==\'_blank\'}">新窗口</option> <option value="_self" __selected="{widget.hyperlink.target==\'_self\'}">原窗口</option> </select> </div> </div> </td> </tr> <tr class="other property-panel" if="{enableEdit(⁗position⁗)}"> <td> <div class="property-header">位置</div> <div id="other" class="panel-collapse in collapse" style="padding:6px"> <div class="btn-group"><label for="margin" style="margin-right:5px">边距</label><input id="margin" class="number" title="margin" style="width:40px;height:25px;" type="text" value="{widget.x}"></div> <div class="btn-group"><label for="alpha" style="margin-right:5px">透明度</label><input id="alpha" class="number" title="alpha" style="width:40px;height:25px;" type="text" value="{widget.y}"></div> <div class="btn-group"><label for="rotate" style="margin-right:5px">旋转</label><input id="rotate" class="number" title="rotate" style="width:40px;height:25px;" type="text" value="{widget.rotate}"></div> <div class="btn-group" style="margin-top:5px"> <div class="btn-group"><label for="y" style="margin-right:5px;">上 <input id="y" title="top" class="number" style="width:40px;height:25px;" type="text" value="{widget.x}"></label></div> <div class="btn-group"><label for="x" style="margin-right:5px">左 <input id="x" title="left" class="number" style="width:40px;height:25px;" type="text" value="{widget.y}"></label></div> <div class="btn-group"><label for="width" style="margin-right:5px">宽 <input id="width" title="width" class="number" style="width:40px;height:25px;" type="text" value="{widget.width}"></label></div> <div class="btn-group"><label for="height" style="margin-right:5px">高 <input id="height" title="height" class="number" style="width:40px;height:25px;" type="text" value="{widget.height}"></label></div> </div> </div> </td> </tr> </table> </div> <div class="panel" style="margin-bottom:0px;border-width:0px;" if="{widget}"> <table class="table table-propertyEditor" style="width:100%"> <tr class="font property-panel" if="{enableEdit(⁗font⁗)}"> <td> <div class="property-header" style="border-top-width:0px;">字体</div> <div style="padding:6px"> <input type="hidden" class="fontsize" id="font-size" name="size" alt="font" onchange="{change}" title="字体大小" value="{widget.font.size}" style="width:80px"> <div class="btn-group" style="margin-top:5px;"> <input type="hidden" id="font-name" class="fontname" name="family" alt="font" onchange="{change}" value="{widget.font.family}" style="width:120px;padding-bottom:5px" title="字体名称"> </div> <div class="btn-group" style="margin-top:5px;"> <input type="text" id="font-color" class="colorpick" name="color" alt="font" onchange="{change}" value="{widget.font.color}" title="颜色"> </div> <div style="margin-left:0px;margin-top:5px"> <div class="btn-group" data-toggle="buttons"> <label class="btn btn-default {active:widget.font&&widget.font.weight==\'bold\'}" onclick="{change}" style="height:30px;width:35px;"> <input type="checkbox" id="font-weight" name="weight" alt="font"><span class="fa fa-bold"></span> </label> <label class="btn btn-default {active:widget.font&&widget.font.style==\'italic\'}" onclick="{change}" style="height:30px;width:35px;"> <input type="checkbox" id="font-style" name="style" alt="font"><span class="fa fa-italic"></span> </label> </div> <label for="font-fill" style="margin-left:5px;margin-top:5px;line-height:17px;vertical-align: middle"> <input type="checkbox" id="font-fill" name="fill" alt="font" onchange="{change}" __checked="{widget.font.fill}">填充 </label> </div> </div> </td> </tr> <tr class="background property-panel" if="{enableEdit(⁗background⁗)}"> <td> <div class="property-header">背景</div> <div id="background" class="btn-group" style="padding:2px 0px 2px 6px"> <label for="background-filltype">类型</label> <select id="background-filltype" style="width:80px" name="filltype" title="background" onchange="{change}"> <option value="none" __selected="{widget.background.filltype==\'none\'}">无</option> <option value="color" __selected="{widget.background.filltype==\'color\'}">颜色</option> <option value="gradient" __selected="{widget.background.filltype==\'gradient\'}">渐变</option> <option value="image" __selected="{widget.background.filltype==\'image\'}">图片</option> <option value="images" disabled __selected="{widget.background.filltype==\'images\'}">图片组</option> </select> </div> <div class="btn-group background-color" style="padding:2px 0px 2px 6px" show="{widget.background.filltype==\'color\'}"> <input type="text" id="background-color" class="colorpick" name="color" alt="background" onchange="{change}" value="{widget.background.color}" title="背景色"> </div> <div class="btn-group background-gradient" style="padding:2px 0px 2px 6px" show="{widget.background.filltype==\'gradient\'}"> <input type="text" id="gradient-begin-color" class="colorpick" name="begincolor" alt="gradient" onchange="{change}" value="{widget.gradient.begincolor}" title="背景色"> <a href="#" onclick="{exchangecolor}"><span class="fa fa-exchange"></span></a> <input type="text" id="gradient-end-color" class="colorpick" name="endcolor" alt="gradient" onchange="{change}" value="{widget.gradient.endcolor}" title="背景色"> </div> <select id="background-imagetype" style="width:80px;padding:2px 0px 2px 6px" class="background-image" name="imageType" title="background" onchange="{change}" if="{widget.background.filltype==\'image\'}"> <option value="fit" __selected="{widget.background.imageType==\'fit\'}">自适应</option> <option value="fill" __selected="{widget.background.imageType==\'fill\'}">填充</option> <option value="repeat" __selected="{widget.background.imageType==\'repeat\'}">重复</option> <option value="center" __selected="{widget.background.imageType==\'center\'}">居中</option> </select> <div class="btn-group" style="padding:6px" if="{widget.background.filltype==\'gradient\'}"> <div class="btn-group"> <div class="btn-group" style="margin-top:2px;margin-right:5px"> <label for="gradient-type">类型</label> <select id="gradient-type" style="width:90px" name="type" title="gradient" onchange="{change}"> <option value="none" __selected="{widget.gradient.type==\'none\'}">无</option> <option value="liner" __selected="{widget.gradient.type==\'liner\'}">线性</option> <option value="radial" __selected="{widget.gradient.type==\'radial\'}">放射性</option> </select> </div> <div class="btn-group" style="margin-top:2px;"> <div class="btn-group gradient-angle"> <label for="gradient-angle">渐变角度</label> <input type="text" value="{widget.gradient.angle}" name="angle" alt="gradient" onchange="{change}" class="number" min="0" max="360" title="角度 (0~360)"> </div> <div class="btn-group gradient-radius"> <label for="gradient-radius">渐变半径</label> <input type="text" value="{widget.gradient.radius}" name="radius" alt="gradient" onchange="{change}" class="number" min="5" max="100" title="半径 (5~100)"> </div> </div> </div> </div> <div class="btn-group spirit-images" style="padding:6px" __checked="{widget.spirit.autoplay}" if="{widget.background.filltype==\'images\'}"> <input type="checkbox" id="spirit-autoplay" title="自动切换" name="autoplay" alt="spirit" onchange="{change}"> <label for="spirit-autoplay"> 自动切换 </label> <input type="text" class="number" id="spirit-interval" name="interval" alt="spirit" onchange="{change}" style="width:40px" min="1" max="100" title="速度" value="{widget.spirit.interval}"> </div> <div class="background" if="{enableEdit(⁗background⁗)&&widget.background.filltype==\'image\'}"> <div class="btn-group" style="padding:6px 6px 6px 32px"> <a href="#" onclick="{changebackgroundimage}"> <img id="background-image" riot-src="{widget.background.image.src}" width="60px" height="60px" style="border:solid 1px lightgray" title="背景图片" class="img-rounded"></img> </a> <a href="#" id="btn_remove_background_image" onclick="{removebackgroundimage}">清除</a> </div> <div> <input type="file" style="display:none" id="background-file" accept="image/*"> </div> </div> </td> </tr> <tr class="background property-panel spirit-images" if="{enableEdit(⁗background⁗)&&widget.background.filltype==\'images\'}"> <td style="border-width:0px"> <div class="btn-group" style="padding:6px 6px 6px 32px"> <a href="#" id="spirit-images" onclick="{addspiritimages}">添加图片</a> <a href="#" id="btn_remove_spirit_image" onclick="{removespiritimages}">清除</a> </div> <div style="display:none1"> <input type="file" multiple="" style="display:none" id="spirit-files" accept="image/*"> </div> <div class="spirit-list" style="padding:6px 6px 6px 6px;max-height:126px;overflow:auto" id="spirit-images-preview"> </div> </td> </tr> <tr class="stroke property-panel" if="{enableEdit(⁗border⁗)}"> <td> <div class="property-header">线框</div> <div id="stroke" class="panel-collapse in collapse" style="padding:6px"> <input type="text" id="stroke-color" name="color" alt="border" onchange="{change}" class="colorpick" value="{widget.border.color}" title="颜色"></input> <select id="stroke-width" style="width:80px" name="width" title="border" onchange="{change}"> <option value="1" __selected="{widget.border.width==1}">超细</option> <option value="2" __selected="{widget.border.width==2}">较细</option> <option value="3" __selected="{widget.border.width==3}">细</option> <option value="4" __selected="{widget.border.width==4}">中等</option> <option value="5" __selected="{widget.border.width==5}">粗</option> <option value="6" __selected="{widget.border.width==6}">较粗</option> <option value="7" __selected="{widget.border.width==7}">最粗</option> </select> <select id="stroke-type" style="width:80px" name="type" title="border" onchange="{change}"> <option value="solid" __selected="{widget.border.type==\'solid\'}">实线</option> <option value="dotted" __selected="{widget.border.type==\'dotted\'}">虚线</option> <option value="dashed" __selected="{widget.border.type==\'dashed\'}">短划线</option> </select> </div> </td> </tr> <tr class="shadow property-panel" if="{enableEdit(⁗shadow⁗)}"> <td> <div class="property-header">阴影</div> <div id="shadow" class="panel-collapse in collapse" style="padding:6px"> <input type="text" id="shadow-color" class="colorpick" title="颜色" value="{widget.shadow.color}" onchange="{change}" name="color" alt="shadow"></input> <input id="shadow-offsetx" class="number" value="{widget.shadow.offsetX}" onchange="{change}" name="offsetX" alt="shadow" type="text" title="水平偏移"> <input id="shadow-offsety" class="number" type="text" value="{widget.shadow.offsetY}" onchange="{change}" name="offsetY" alt="shadow" title="垂直偏移"> <input id="shadow-blur" class="number" type="text" value="{widget.shadow.blur}" onchange="{change}" name="blur" alt="shadow" title="模糊"> </div> </td> </tr> <tr class="corner property-panel" if="{enableEdit(⁗corner⁗)}"> <td> <div class="property-header">角</div> <div id="corner" class="panel-collapse in collapse" style="padding:6px"> <label for="corner-radius">类型</label> <select id="corner-type" style="width:70px" onchange="{change}" name="type" title="corner"> <option value="rect" __selected="{widget.corner.type==\'rect\'}">直角</option> <option value="round" __selected="{widget.corner.type==\'round\'}">圆角</option> </select> <label for="corner-radius" id="corner-radius-label" if="{widget.corner.type==\'round\'}">半径 <input type="text" id="corner-radius" class="number" onchange="{change}" name="radius" alt="corner" value="{widget.corner.radius}" title="圆角半径"></label> </div> </td> </tr> <tr class="paragraph property-panel" if="{enableEdit(⁗paragraph⁗)}"> <td> <div class="property-header">段落</div> <div id="paragraph" class="panel-collapse in collapse" style="padding:6px"> <div class="btn-toolbar"> <div class="btn-group"> <label for="line-space" style="margin-right:5px">行间距</label> <input id="line-space" name="linespace" alt="paragraph" title="line space" class="number" type="text" onchange="{change}" value="{widget.paragraph.linespace}"> </div> </div> <div style="margin-top:5px"> <label for="paragraph-align" style="margin-right:5px">水平 <select id="paragraph-align" name="textalign" title="paragraph" onchange="{change}"> <option value="left" __selected="{widget.paragraph.textalign==\'left\'}">左对齐</option> <option value="center" __selected="{widget.paragraph.textalign==\'center\'}">中对齐</option> <option value="right" __selected="{widget.paragraph.textalign==\'right\'}">右对齐</option> </select> </label> <label for="paragraph-valign" style="margin-right:5px">垂直 <select id="paragraph-valign" onchange="{change}" name="textvalign" title="paragraph"> <option value="top" __selected="{widget.paragraph.textvalign==\'top\'}">上对齐</option> <option value="middle" __selected="{widget.paragraph.textvalign==\'middle\'}">中对齐</option> <option value="bottom" __selected="{widget.paragraph.textvalign==\'bottom\'}">下对齐</option> </select> </label> </div> </div> </td> </tr> </table> </div> <div class="property_message" if="{!widget}"> <label>Please select widget first</label> </div>', 'propertyeditorwidget .colorpick,[riot-tag="propertyeditorwidget"] .colorpick,[data-is="propertyeditorwidget"] .colorpick{ width:50px;height:30px;border:solid 2px lightgray } propertyeditorwidget .number,[riot-tag="propertyeditorwidget"] .number,[data-is="propertyeditorwidget"] .number{ width:30px;height:30px;border:solid 1px lightgray } propertyeditorwidget .table-nobordered,[riot-tag="propertyeditorwidget"] .table-nobordered,[data-is="propertyeditorwidget"] .table-nobordered{ font-size:9pt; border:none; } propertyeditorwidget .table-nobordered tbody tr td,[riot-tag="propertyeditorwidget"] .table-nobordered tbody tr td,[data-is="propertyeditorwidget"] .table-nobordered tbody tr td{ border:none; } propertyeditorwidget .table-nobordered input[type=\'text\'],[riot-tag="propertyeditorwidget"] .table-nobordered input[type=\'text\'],[data-is="propertyeditorwidget"] .table-nobordered input[type=\'text\']{ width:100%; } propertyeditorwidget .table-propertyEditor input[type=\'text\'],[riot-tag="propertyeditorwidget"] .table-propertyEditor input[type=\'text\'],[data-is="propertyeditorwidget"] .table-propertyEditor input[type=\'text\']{ padding:5px; } propertyeditorwidget .property-panel,[riot-tag="propertyeditorwidget"] .property-panel,[data-is="propertyeditorwidget"] .property-panel{ margin-bottom:0px; }', '', function(opts) {
	var parent=this;
	while(parent.parent!=null)
		parent=parent.parent;
	this.designer=parent.opts;
	this.panels=this.designer.document.panels;
	this.activepanel=this.designer.document.activePanel.instance;
	this.widget=this.activepanel.focuswidget;

	var ths=this;

	this.enableEdit=function(prop){
		if(ths.widget&&ths.widget.propertyEditors.indexOf(prop)>=0)
			return true;
		else
			return false;
	};

	this.change = function(e){
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
	}.bind(this)
	this.changebackgroundimage = function(){
		opts.trigger("selectbackgroundimage","widget");
	}.bind(this);

	this.removebackgroundimage = function(){
		this.widget.background.image.src="";
		this.widget.paint();
	}.bind(this)

	this.addspiritimages = function(e){
		 if(!$(e.target).attr("disabled"))
			 $("#spirit-files").click();
	}.bind(this)

	this.removespiritimages = function(e){
		 $("#spirit-files").val("").trigger("change");
		 return false;
	}.bind(this)

	this.exchangecolor = function(e){
		 var endcolor=$("#gradient-end-color").val();
		 $("#gradient-end-color").spectrum("set", $("#gradient-begin-color").val());
		 $("#gradient-begin-color").spectrum("set",endcolor);
		 $("#gradient-begin-color").trigger("change");
		 $("#gradient-end-color").trigger("change");
	}.bind(this)

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
});
riot.tag2('propertyeditorextension', '<table class="table table-nobordered table-extension"> <tr class="settings property-panel" style="margin-bottom:0px;" if="{widget.settings}"> <td> <div class="property-header" style="border-top-width:0px;">Data</div> <div id="settings" class="panel-collapse in collapse" style="padding: 2px"> <table class="table table-bordered tighten"> <tr class="settings-prefix"> <td class="tag">Prefix</td> <td class="tag-control"><input type="text" value="{widget.settings.prefix}" name="prefix" alt="settings" onchange="{change}"></td> </tr> <tr class="settings-owner"> <td class="tag">Owner</td> <td class="tag-control"><input type="text" value="{widget.settings.owner}" name="owner" alt="settings" onchange="{change}"></td> </tr> </table> </div> </td> </tr> <tr class="key property-panel" if="{widget.key}"> <td> <a class="nav-header">关联属性</a> <div id="key" class="panel-collapse in collapse" style="padding: 2px"> <table class="table table-bordered tighten"> <tr class="key-name"> <td class="tag">名称</td> <td class="tag-control"><input type="text" value="{widget.key.name}" name="name" alt="key" onchange="{change}"></td> </tr> <tr class="key-identifying"> <td class="tag">Allow Empty</td> <td class="tag-control"><input type="checkbox" value="{widget.key.identifying}" name="identifying" alt="key" onchange="{change}"></td> </tr> <tr class="key-nullable"> <td class="tag">Allow Null</td> <td class="tag-control"><input type="checkbox" value="{widget.key.nullable}" name="nullable" alt="key" onchange="{change}"></td> </tr> <tr class="key-source"> <td class="tag">Primary Table</td> <td class="tag-control"><input type="text" value="{widget.key.source}" name="source" alt="key" onchange="{change}" disabled></td> </tr> <tr class="key-target"> <td class="tag">Relation Table</td> <td class="tag-control"><input type="text" value="{widget.key.target}" name="target" alt="key" onchange="{change}" disabled></td> </tr> <tr class="key-fieldmaps"> <td class="tag">Field Mapping</td> <td class="tag-control"><textarea value="{widget.key.fieldmaps}" name="fieldmaps" alt="key" onchange="{change}" disabled></textarea></td> </tr> </table> </div> </td> </tr> <tr class="data property-panel" if="{widget.data}"> <td> <div class="property-header" style="border-top-width:0px;">Data</div> <div id="data" class="panel-collapse in collapse" style="padding: 2px"> <table class="table table-bordered tighten"> <tr class="data-datatype"> <td class="tag">Data Type</td> <td class="tag-control"> <select id="data-datatype" style="width:100%" name="datatype" title="data" onchange="{change}"> <option value="varchar" __selected="{widget.data.datatype==\'varchar\'}">VARCHAR</option> <option value="char" __selected="{widget.data.datatype==\'char\'}">CHAR</option> <option value="number" __selected="{widget.data.datatype==\'number\'}">NUMBER</option> <option value="integer" __selected="{widget.data.datatype==\'integer\'}">INTEGER</option> <option value="datetime" __selected="{widget.data.datatype==\'datetime\'}">DATETIME</option> <option value="boolean" __selected="{widget.data.datatype==\'boolean\'}">BOOLEAN</option> <option value="clob" __selected="{widget.data.datatype==\'clob\'}">CLOB</option> <option value="blob" __selected="{widget.data.datatype==\'blob\'}">BLOB</option> </select> </td> </tr> <tr class="data-integer" if="{widget.data.datatype==\'number\'}"> <td class="tag">Integer</td> <td class="tag-control"><input type="text" class="number" value="{widget.data.integer}" name="integer" alt="data" onchange="{change}"></td> </tr> <tr class="data-decimal" if="{widget.data.datatype==\'number\'}"> <td class="tag">Decimal</td> <td class="tag-control"><input type="text" class="number" value="{widget.data.decimal}" name="decimal" alt="data" onchange="{change}"></td> </tr> <tr class="data-length" if="{widget.data.datatype==\'varchar\'}"> <td class="tag">Length</td> <td class="tag-control"><input type="text" class="number" value="{widget.data.length}" name="length" alt="data" onchange="{change}"></td> </tr> <tr class="data-ispk"> <td class="tag">isPk</td> <td class="tag-control"><input type="checkbox" __checked="{widget.data.ispk?true:\'\'}" name="ispk" alt="data" onchange="{change}"></td> </tr> <tr class="data-isfk"> <td class="tag">isFk</td> <td class="tag-control"><input type="checkbox" value="{widget.data.isfk}" name="isfk" alt="data" onchange="{change}" disabled="disabled"></td> </tr> <tr class="data-reftable" if="{widget.data.isfk}"> <td class="tag">Ref Table</td> <td class="tag-control"><input type="text" value="{widget.data.reftable}" name="reftable" alt="data" onchange="{change}" disabled="disabled"></td> </tr> <tr class="data-refield" if="{widget.data.isfk}"> <td class="tag">Ref Field</td> <td class="tag-control"><input type="text" value="{widget.data.refield}" name="refield" alt="data" onchange="{change}" disabled="disabled"></td> </tr> <tr class="data-nullable"> <td class="tag">Allow Null</td> <td class="tag-control"><input type="checkbox" value="{widget.data.nullable}" name="nullable" alt="data" onchange="{change}"></td> </tr> <tr class="data-unique"> <td class="tag">Unique</td> <td class="tag-control"><input type="checkbox" value="{widget.data.unique}" name="unique" alt="data" onchange="{change}"></td> </tr> </table> </div> </td> </tr> <tr class="property property-panel" if="{widget.property}"> <td> <div class="property-header" style="border-top-width:0px;">属性设置</div> <div id="property" class="panel-collapse in collapse" style="padding: 2px"> <table class="table table-bordered tighten"> <tr class="data-name"> <td class="tag" style="width:90px">名称</td> <td class="tag-control"><input type="text" value="{widget.property.name}" name="name" alt="property" onchange="{change}"></td> </tr> <tr class="data-text"> <td class="tag" style="width:90px">描述</td> <td class="tag-control"><input type="text" value="{widget.property.text}" name="text" alt="property" onchange="{change}"></td> </tr> <tr class="property-abbreviation"> <td class="tag">列映射</td> <td class="tag-control"><input type="text" value="{widget.property.abbreviation}" name="abbreviation" alt="property" onchange="{change}"></td> </tr> <tr class="property-annotation"> <td class="tag">注释</td> <td class="tag-control"><input type="text" value="{widget.property.annotation}" name="annotation" alt="property" onchange="{change}"></td> </tr> <tr class="property-datatype"> <td class="tag">数据类型</td> <td class="tag-control"> <select name="datatype" title="property" onchange="{change}" style="width:100%"> <option value="String" __selected="{widget.property.datatype==\'String\'}">String</option> <option value="Number" __selected="{widget.property.datatype==\'Number\'}">Number</option> <option value="Long" __selected="{widget.property.datatype==\'Long\'}">Long</option> <option value="Integer" __selected="{widget.property.datatype==\'Integer\'}">Integer</option> <option value="DateTime" __selected="{widget.property.datatype==\'DateTime\'}">DateTime</option> <option value="Boolean" __selected="{widget.property.datatype==\'Boolean\'}">Boolean</option> <option value="Clob" __selected="{widget.property.datatype==\'Clob\'}">Clob</option> <option value="Blob" __selected="{widget.property.datatype==\'Blob\'}">Blob</option> <option value="reference" __selected="{widget.property.datatype==\'reference\'}" disabled>Reference</option> </select> </td> </tr> <tr class="property-format"> <td class="tag">格式</td> <td class="tag-control"><input type="text" value="{widget.property.format}" name="format" alt="property" onchange="{change}"></td> </tr> <tr class="property-integer"> <td class="tag">整数位</td> <td class="tag-control"><input type="text" class="number" value="{widget.property.integer}" name="integer" alt="property" onchange="{change}"></td> </tr> <tr class="property-decimal"> <td class="tag">小数位</td> <td class="tag-control"><input type="text" class="number" value="{widget.property.decimal}" name="decimal" alt="property" onchange="{change}"></td> </tr> <tr class="property-maxlength"> <td class="tag">字符长度</td> <td class="tag-control"><input type="text" class="number" value="{widget.property.length}" name="length" alt="property" onchange="{change}"></td> </tr> <tr class="property-collectionType"> <td class="tag">集合类型</td> <td class="tag-control"><input type="text" value="{widget.property.collectionType}" name="collectionType" alt="property" onchange="{change}" readonly></td> </tr> <tr class="property-referenceTypeName"> <td class="tag">关联对象</td> <td class="tag-control"><input type="text" value="{widget.property.referenceTypeName}" name="referenceTypeName" alt="property" onchange="{change}" readonly></td> </tr> <tr class="property-relationship"> <td class="tag">关联关系</td> <td class="tag-control"><input type="text" value="{widget.property.relationship}" name="relationship" alt="property" onchange="{change}" readonly></td> </tr> <tr class="property-joinTableName"> <td class="tag">关联关系表</td> <td class="tag-control"><input type="text" value="{widget.property.joinTableName}" name="joinTableName" alt="property" onchange="{change}"></td> </tr> <tr class="property-joinColumnName"> <td class="tag">关联字段</td> <td class="tag-control"><input type="text" value="{widget.property.joinColumnName}" name="joinColumnName" alt="property" onchange="{change}"></td> </tr> <tr class="property-inverseJoinColumnName"> <td class="tag">反相关联字段</td> <td class="tag-control"><input type="text" value="{widget.property.inverseJoinColumnName}" name="inverseJoinColumnName" alt="property" onchange="{change}"></td> </tr> <tr class="property-nullable"> <td class="tag">允许为空</td> <td class="tag-control"><input type="checkbox" value="{widget.property.nullable}" name="nullable" alt="property" onchange="{change}"></td> </tr> <tr class="property-defaultvalue"> <td class="tag">缺省值</td> <td class="tag-control"><input type="text" value="{widget.property.defaultvalue}" name="defaultvalue" alt="property" onchange="{change}"></td> </tr> <tr class="property-unique"> <td class="tag">是否唯一</td> <td class="tag-control"><input type="checkbox" value="{widget.property.unique}" name="unique" alt="property" onchange="{change}"></td> </tr> <tr class="property-cachable"> <td class="tag">缓存</td> <td class="tag-control"><input type="checkbox" value="{widget.property.cachable}" name="cachable" alt="property" onchange="{change}"></td> </tr> <tr class="property-orphanremoval"> <td class="tag">orphanRemoval</td> <td class="tag-control"><input type="checkbox" value="{widget.property.orphanremoval}" name="orphanremoval" alt="property" onchange="{change}"></td> </tr> <tr class="property-fetch"> <td class="tag">提取方式</td> <td class="tag-control"> <select name="fetch" title="property" onchange="{change}" style="width:100%"> <option value="FetchType.LAZY" __selected="{widget.property.fetch==\'FetchType.LAZY\'}">LAZY</option> <option value="FetchType.EAGER" __selected="{widget.property.fetch==\'FetchType.EAGER\'}">EAGER</option> </select> </td> </tr> <tr class="property-mappedby"> <td class="tag">映射对象</td> <td class="tag-control"><input type="text" value="{widget.property.mappedby}" name="mappedby" alt="property" onchange="{change}"></td> </tr> <tr class="property-cascade"> <td class="tag">级联方法</td> <td class="tag-control"> <input type="hidden" id="property-cascade"> </td> </tr> </table> </div> </td> </tr> <tr class="key2 property-panel" if="{widget.key2}"> <td> <a class="nav-header">引用属性</a> <div id="key2" class="panel-collapse in collapse" style="padding: 2px"> <table class="table table-bordered tighten"> <tr class="key2-name"> <td class="tag">名称</td> <td class="tag-control"><input type="text" value="{widget.property.name}" name="name" alt="key2" onchange="{change}"></td> </tr> <tr class="key2-type"> <td class="tag">应用类型</td> <td class="tag-control"><input type="text" value="{widget.property.type}" name="type" alt="key2" onchange="{change}" readonly></td> </tr> <tr class="key2-collectionType"> <td class="tag">集合类型</td> <td class="tag-control"> <select name="collectionType" alt="key2" onchange="{change}"> <option value="Set" __selected="{widget.key2.collectionType==\'Set\'}">Set</option> <option value="List" __selected="{widget.key2.collectionType==\'List\'}">List</option> </select> </td> </tr> <tr class="key2-duplexing"> <td class="tag">双向关联</td> <td class="tag-control"><input type="checkbox" value="{widget.property.duplexing}" name="duplexing" alt="key2" onchange="{change}"></td> </tr> </table> </div> </td> </tr> </table>', '.table-bordered,.table-nobordered{ font-size:9pt; width:100%; margin-bottom:5px; } .table-nobordered{ font-size:9pt; } .table-bordered input[type=\'text\']{ width:100%; padding:5px; } .table-bordered>tbody>tr>td{ padding:5px; } .table-extension select{ width:100%; }', '', function(opts) {
	var parent=this;
	while(parent.parent!=null)
		parent=parent.parent;
	this.designer=parent.opts;
	this.activepanel=this.designer.document.activePanel.instance;
	this.widget=this.activepanel.focuswidget;
	var ths=this;
	this.change = function(e){
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

	}.bind(this)

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
});
riot.tag2('propertyeditorobjectdata', '<div class="container-fluid" style="background-color:white"> <form class="form-horizontal" if="{widget}"> <div class="form-group form-group-sm row" each="{props.elements}" style="margin-bottom:0px" if="{editor[key].visible!=false&&showProperty(key)}"> <label class="pull-left control-label" style="padding:10px;text-align: left;"> <raw content="{editor[key].title}"></raw> <span if="{!editor[key].required}">&nbsp;</span><span style="color:red" if="{editor[key].required}">*</span></label> <div style="margin-left:125px;"> <div style="padding:5px;"> <input type="text" class="form-control" id="{key}" value="{widget[\'objectdata\'][key]}" __required="{editor[key].required}" __readonly="{!editor[key].editable}" onchange="{change}" if="{editor[key].format==\'string\'&&showProperty(key)}"> <input type="hidden" class="colorpick" style="width:30px;height:30px;padding:0px" id="{key}" value="{widget[\'objectdata\'][key]}" __required="{editor[key].required}" __readonly="{!editor[key].editable}" onchange="{change}" if="{editor[key].format==\'color\'}"> <input type="checkbox" style="margin-top:8px;" onclick="{change}" id="{key}" __checked="{widget[\'objectdata\'][key]}" if="{editor[key].format==\'boolean\'}"> <select id="{key}" onchange="{change}" style="width:100%" if="{editor[key].format==⁗single⁗}"> <option each="{option, i in editor[key].options}" value="{option.id||option}" __selected="{getValue(option,key)}">{option.text||option}</option> </select> <textarea rows="5" id="values" class="form-control" style="resize:vertical;" onchange="{change}" onblur="{leave}" if="{editor[key].format==\'text\'}">{widget[\'objectdata\'][key]}</textarea> <input type="text" class="form-control number" id="{key}" value="{widget[\'objectdata\'][key]}" __required="{editor[key].required}" __readonly="{!editor[key].editable}" onchange="{change}" if="{editor[key].format==\'int\'}"> <div if="{editor[key].format==⁗list⁗ && widget[\'objectdata\'][key].type.toLowerCase()==⁗object⁗}"> <div style="margin-bottom:5px" class="table-grid"> <div class="table-cell"> <input type="text" class="form-control" style="border:none" value="Source Field"> </div> <div class="table-cell"> <input type="text" class="form-control" style="border:none" value="Target Field"> </div> </div> <div each="{obj,i in widget[\'objectdata\'][key].values}" name="{key}" style="margin-bottom:5px" class="table-grid"> <div each="{field,k in widget[\'objectdata\'][key].fields}" class="table-cell"> <input type="text" class="form-control" name="{key}" alt="{i}" onchange="{listitemchange}" value="{obj[field.id]}"> </div> <a href="#" name="{key}" onclick="{listremove}"><i class="fa fa-times" style="width:10px;"></i></a> </div> <div class="input-group" style="margin-top:5px" name="{key}"> <a href="#" name="{key}" onclick="{listadd}">Add new</a> </div> </div> </div> </div> </form> </div>', '.table-bordered,.table-nobordered{ font-size:9pt; width:100%; margin-bottom:5px; } .table-nobordered{ font-size:9pt; } .table-bordered input[type=\'text\']{ width:100%; padding:5px; } .table-bordered>tbody>tr>td{ padding:5px; } .table-extension select{ width:100%; } .spinner-input.input-group .input-group-addon{ padding:4px 6px 3px 2px; background-color:white; color:black; } .spinner-input.input-group .input-group-addon .spin-up, .spinner-input.input-group .input-group-addon .spin-down { height: 10px; width: 12px; overflow: hidden; display: block; text-align: right; color: #999; } .spinner-input.input-group .input-group-addon .spin-up:hover, .spinner-input.input-group .input-group-addon .spin-down:hover { color: #555; } .spinner-input.input-group .input-group-addon .spin-up .fa, .spinner-input.input-group .input-group-addon .spin-down .fa { margin-top: -3px; padding:0px; margin:0px; vertical-align: middle; } .spinner-input.input-group .input-group-addon .spin-up .glyphicon, .spinner-input.input-group .input-group-addon .spin-down .glyphicon { font-size: 10px; top: -2px; } .spinner-input.input-group .input-group-addon a.spin-up, .spinner-input.input-group .input-group-addon a.spin-down { text-decoration: none; } .spinner-input.input-group .input-group-addon button.spin-up, .spinner-input.input-group .input-group-addon button.spin-down { background: none; border: none; padding: 0; } .table-grid{ display:flex; align-items:center; } .table-cell{ margin-right:5px; }', '', function(opts) {
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

	this.listadd = function(e){
		var target=e.target;
		var name=target.name;
		var obj={};
		for(var i=0;i<=this.widget['objectdata'][name].fields.length-1;i++){
			obj[this.widget['objectdata'][name].fields[i].id]="";
		}
		this.widget['objectdata'][name].values.push(obj);
	}.bind(this)

	this.getValue = function(option,key){
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

	}.bind(this)

	this.listremove = function(e){
		var item=e.item.obj;
		var target=e.currentTarget;
		var name=target.name;
		var index=this.widget['objectdata'][name].values.indexOf(item);
		this.widget['objectdata'][name].values.splice(index,1);
	}.bind(this)

	this.listitemchange = function(e){
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

	}.bind(this)

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

	this.change = function(e){
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
	}.bind(this)
	this.on("mount",function(){
	})
});
riot.tag2('raw', '<span></span>', '', '', function(opts) {
    	var parent=this;
	    while(parent.parent!=null)
	       parent=parent.parent;
	    this.root.innerHTML =parent.opts.content||opts.content;
	    this.on("update",function(){
	    	 this.root.innerHTML =opts.content;
	    })
});
riot.tag2('widgets', '<div class="sidebar-nav " id="widgetgroup" style="border-top: 5px solid #e5e5e5;"> <a class="nav-header collapsed header" data-toggle="collapse" data-parent="#widgetgroup" href="#er" name="database" if="{widgetgroup.database.visible}"> <i class="fa fa-caret-down {widgetgroup.database.selected?\'fa-caret-down\':\'fa-caret-right\'}" style="margin-top:1px;"></i>Database </a> <div id="er" class="panel-collapse {widgetgroup.database.selected?\'\':\'collapse\'} er" if="{widgetgroup.database.visible}"> <div class="panel-body" style="padding: 2px"> <div class="btn-widgets"> <img class="btn col-lg-3 col-md-3 col-sm-4 col-xs-4" style="padding:0px;" src="images/table.png" title="table" data="table" ondragstart="drag(event)"> <img class="btn col-lg-3 col-md-3 col-sm-4 col-xs-4" style="padding:0px;" src="images/jsontree.png" title="connection" data="collection" ondragstart="drag(event)"> </div> </div> </div> <a class="nav-header collapsed header" data-toggle="collapse" data-parent="#widgetgroup" href="#tables" name="tables"> <i class="fa fa-caret-down {widgetgroup.tables.selected?\'fa-caret-down\':\'fa-caret-right\'}" style="margin-top:1px;"></i>Tables </a> <div id="tables" class="panel-collapse {widgetgroup.database.selected?\'\':\'collapse\'} tables"> <div class="panel-body" style="padding: 2px;"> <div class="list list-sm" riot-style="height:{maxheight}px;overflow-y:auto"> <ul> <li> <input type="text" class="form-control" placeholder="Search" onkeyup="{searchchange}"> </li> <li> <div class="btn-group btn-group-sm"> <a href="#" class="btn btn-default" onclick="{selectAll}">Select All</a> <a href="#" class="btn btn-default" onclick="{unselectAll}">Unselect All</a> </div> </li> <li class="item" each="{table, i in tables}" if="{!searching||table.selected}"> <label data="{table.name}" draggable="true" ondragstart="dragtable(event)"><input type="checkbox" __checked="{isVisible(table)?true:\'\'}" onchange="{change}"> {table.name}</label> </li> </ul> </div> </div> </div> </div>', '#widgetgroup .nav-header{ display:block; line-height:35px; } #widgetgroup .nav-header i{ padding:5px; } #widgetgroup .header{ background-color: rgb(240, 242, 245); color: rgb(153, 153, 153); } #widgetgroup .list-sm ul li{ padding-bottom:0px; margin-bottom:0px; border-bottom: 0px solid #CCC; }', '', function(opts) {
var parent=this;
while(parent.parent!=null)
   parent=parent.parent;
var  designer=parent.opts;
var tables=designer.document.activePanel.listTables().tables;
this.tables=tables;
this.instance=designer.document.activePanel.instance;
this.fontawesomes=[];
var ths=this;
this.widgetgroup=parent.opts.widgetgroup||{
		database:{visible:true,selected:false},
		tables:{visible:true,selected:false},
};

this.changevisible = function(e){
	var target=e.target||e.currentTarget;
	var name=target.name;
	this.widgetgroup[name].visible=!this.widgetgroup[name].visible;
}.bind(this)

this.searching=false;
this.searchchange = function(e){
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
}.bind(this)

this.selectAll = function(){
	$(tables).each(function(i,table){
		ths.instance.Widget(table.name).visible=true;
	});
	designer.document.activePanel.instance.paint();
}.bind(this)

this.unselectAll = function(){
	$(tables).each(function(i,table){
		ths.instance.Widget(table.name).visible=false;
	});
	designer.document.activePanel.instance.paint();
}.bind(this)

isVisible=function(item){
	return  ths.instance.Widget(item.name).visible;
}

this.change = function(e){
	var item=e.item.table;
	var target=e.currentTarget;
	var checked=target.checked;
	this.instance.Widget(item.name).visible=checked;
	designer.document.activePanel.instance.paint();
}.bind(this)

	var offset=255;
	this.maxheight=document.body.clientHeight-offset;

this.on("mount",function(){

})
});
riot.tag2('navigation', '<div class="box" style="margin:0px;"> <div role="tabpanel"> <ul class="nav nav-tabs box-header" role="tablist"> <li role="presentation" class="{active:showproperty}"><a href="#page-tab" aria-controls="page" role="tab" data-toggle="tab">Property</a></li> <li role="presentation" class="{active:!showproperty}"><a href="#widget-tab" aria-controls="widget" role="tab" data-toggle="tab">Control</a></li> </ul> <div class="tab-content" style="margin-bottom:0px;padding:0px"> <div role="tabpanel" class="tab-pane {active:showproperty}" id="page-tab"> <div class="propertyEditForm sidebar-nav" style="margin:0px;border-top:solid 5px #e5e5e5;" id="propertyEditorForm"> <propertyeditorwidget></propertyEditorWidget> </div> </div> <div role="tabpanel" class="tab-pane {active:!showproperty}" id="widget-tab"> <div class="sidebar-nav"> <widgets></widgets> </div> </div> </div> </div> </div>', '', '', function(opts) {
	var parent=this;
    while(parent.parent!=null)
       parent=parent.parent;
    this.designer=parent.opts;
    this.type=this.designer.document.type;
    this.activepanel=parent.opts.document.activePanel;
    this.showproperty=false;
    var ths=this;
    this.newpage = function(){
    	parent.opts.trigger("newpage");
    }.bind(this)

    this.designer.off("showproperty").on("showproperty",function(val){
       ths.showproperty=val;
       ths.update();
    });

    this.on("mount",function(){
    	parent.opts.trigger("navigation_loaded");
    });

});