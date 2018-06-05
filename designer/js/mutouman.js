(function() {
	
	ACL={
			OWNER:511,
			SETTING:256,
			DELETE:128,
			SHARE:64,				
			NEW:32,
			EDIT:16,
			UPLOAD:8,
			DOWNLOAD:4,
			COMMENT:2,
			VIEW:1,
			equals:function(acl,value){
				return ((acl&value)==value);
			}
	};
	
	function addCSSRule(sheet, selector, rules, index) {  
        if("insertRule" in sheet) {  
            sheet.insertRule(selector + "{" + rules + "}", index);  
        }  
        else if("addRule" in sheet) {  
            sheet.addRule(selector, rules, index);  
        }  
    }  
	

	
	 function ConfirmClose(event) {
		     event.returnValue="确定离开当前页面吗？";
		 	 return true;
	 };
	 
	ShowConfirmClose=function(blnValue) {
		 if(blnValue) {
			 window.onbeforeunload = function(){
				 var clientlanguage = getCookie("clientlanguage");	
				 var message="";
				 if(clientlanguage == "zh_CN")
					 message= "你的修改还没有保存";	
				 else
					 message= "Your changes on form was not saved yet";
				 if(typeof event=="object")
				   event.returnValue = message;
				 return message;
							 
			 };
		 }
		 else {
			 document.body.onbeforeunload = null;
		 }
	};
	
	/**
	 * js实现list
	 *
	 */
	List=function() {
	    this.value = [];
	    /* 添加 */
	    this.add = function(obj) {
	        return this.value.push(obj);
	    };
	    /* 大小 */
	    this.size = function() {
	        return this.value.length;
	    };
	    /* 返回指定索引的值 */
	    this.get = function(index) {
	        return this.value[index];
	    };
	    /* 删除指定索引的值 */
	    this.remove = function(index) {
	        this.value.splice(index,1);
	        return this.value;
	    };
	    /* 删除全部值 */
	    this.removeAll = function() {
	        return this.value = [];
	    };
	    /* 是否包含某个对象 */
	    this.constains = function(obj) {
	        for ( var i in this.value) {
	            if (obj == this.value[i]) {
	                return true;
	            } else {
	                continue;
	            }
	        }
	        return false;
	    };

	    /* 是否包含某个对象 */
	    this.getAll = function() {
	        var allInfos = '';
	        for ( var i in this.value) {
	            if(i != (value.length-1)){
	                allInfos += this.value[i]+",";
	            }else{
	                allInfos += this.value[i];
	            }
	        }
	        alert(allInfos);
	        return allInfos += this.value[i]+",";;
	    };

	};
	
	Map=function() {
	    this.elements = new Array();
	    //获取MAP元素个数
	    this.size = function() {
	        return this.elements.length;
	    };
	    //判断MAP是否为空
	    this.isEmpty = function() {
	        return (this.elements.length < 1);
	    };
	    //删除MAP所有元素
	    this.clear = function() {
	        this.elements = new Array();
	    };
	    //向MAP中增加元素（key, value)
	    this.put = function(_key, _value) {
	        this.elements.push( {
	            key : _key,
	            value : _value
	        });
	    };
	    this.update = function(_key, _value) {
			for (var i = 0; i < this.elements.length; i++) {
				if (this.elements[i].key == _key) {
					this.elements[i].value = _value;
					return true;
				}
			}
			this.put(_key, _value);
		};
	    //删除指定KEY的元素，成功返回True，失败返回False
	    this.remove = function(_key) {
	        var bln = false;
	        try {
	            for (var i = 0; i < this.elements.length; i++) {
	                if (this.elements[i].key == _key) {
	                    this.elements.splice(i, 1);
	                    return true;
	                }
	            }
	        } catch (e) {
	            bln = false;
	        }
	        return bln;
	    };
	    //获取指定KEY的元素值VALUE，失败返回NULL
	    this.get = function(_key) {
	        try {
	            for (var i = 0; i < this.elements.length; i++) {
	                if (this.elements[i].key == _key) {
	                    return this.elements[i].value;
	                }
	            }
	        } catch (e) {
	            return null;
	        }
	    };
	    //获取指定索引的元素（使用element.key，element.value获取KEY和VALUE），失败返回NULL
	    this.element = function(_index) {
	        if (_index < 0 || _index >= this.elements.length) {
	            return null;
	        }
	        return this.elements[_index];
	    };
	    //判断MAP中是否含有指定KEY的元素
	    this.containsKey = function(_key) {
	        var bln = false;
	        try {
	            for (var i = 0; i < this.elements.length; i++) {
	                if (this.elements[i].key == _key) {
	                    bln = true;
	                }
	            }
	        } catch (e) {
	            bln = false;
	        }
	        return bln;
	    };
	    //判断MAP中是否含有指定VALUE的元素
	    this.containsValue = function(_value) {
	        var bln = false;
	        try {
	            for (var i = 0; i < this.elements.length; i++) {
	                if (this.elements[i].value == _value) {
	                    bln = true;
	                }
	            }
	        } catch (e) {
	            bln = false;
	        }
	        return bln;
	    };
	    //获取MAP中所有VALUE的数组（ARRAY）
	    this.values = function() {
	        var arr = new Array();
	        for (var i = 0; i < this.elements.length; i++) {
	            arr.push(this.elements[i].value);
	        }
	        return arr;
	    };
	    //获取MAP中所有KEY的数组（ARRAY）
	    this.keys = function() {
	        var arr = new Array();
	        for (var i = 0; i < this.elements.length; i++) {
	            arr.push(this.elements[i].key);
	        }
	        return arr;
	    };
	};
	
	Downloader = {
		    click : function(node) {
		        var ev = document.createEvent("MouseEvents");
		        ev.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		        return node.dispatchEvent(ev);
		    },
		    encode : function(data,type) {
		    		type=type||"application/octet-stream";
		    		if(data.indexOf("data:")===0)
		    			return data ;
		    		else
		    			return 'data:application/octet-stream;base64,' + btoa(unescape(encodeURIComponent(data))) ;
//		            return 'data:application/octet-stream;base64,' + btoa( data );
		    		
		    		
		    },
		    link : function(data, name){
		        var a = document.createElement('a');
		        a.download = name || self.location.pathname.slice(self.location.pathname.lastIndexOf('/')+1);
		        a.href = data || self.location.href;
		        return a;
		    }
	};
	Downloader.save = function(data, name,type){
		    this.click(
		        this.link(
		            this.encode( data,type),
		            name
		        )
		    );
	};
	
	HtmlUtil = {
		    /*1.用浏览器内部转换器实现html转码*/
		    htmlEncode:function (html){
		    	if(html.length==0) return "";
		        //1.首先动态创建一个容器标签元素，如DIV
		        var temp = document.createElement ("div");
		        //2.然后将要转换的字符串设置为这个元素的innerText(ie支持)或者textContent(火狐，google支持)
		        (temp.textContent != undefined ) ? (temp.textContent = html) : (temp.innerText = html);
		        //3.最后返回这个元素的innerHTML，即得到经过HTML编码转换的字符串了
		        var output = temp.innerHTML;
		        temp = null;
		        return output;
		    },
		    /*2.用浏览器内部转换器实现html解码*/
		    htmlDecode:function (text){
		    	if(text.length==0) return "";
		        //1.首先动态创建一个容器标签元素，如DIV
		        var temp = document.createElement("div");
		        //2.然后将要转换的字符串设置为这个元素的innerHTML(ie，火狐，google都支持)
		        temp.innerHTML = text;
		        //3.最后返回这个元素的innerText(ie支持)或者textContent(火狐，google支持)，即得到经过HTML解码的字符串了。
		        var output = temp.innerText || temp.textContent;
		        temp = null;
		        return output;
		    },
		    htmlEncodeByRegExp:function (str){  
		         var s = "";
		         if(str.length == 0) return "";
		         s = str.replace(/&/g,"&amp;");
		         s = s.replace(/</g,"&lt;");
		         s = s.replace(/>/g,"&gt;");
		         s = s.replace(/ /g,"&nbsp;");
		         s = s.replace(/\'/g,"&#39;");
		         s = s.replace(/\"/g,"&quot;");
		         return s;  
		    },
		    htmlDecodeByRegExp:function (str){  
		         var s = "";
		         if(str.length == 0) return "";
		         s = str.replace(/&amp;/g,"&");
		         s = s.replace(/&lt;/g,"<");
		         s = s.replace(/&gt;/g,">");
		         s = s.replace(/&nbsp;/g," ");
		         s = s.replace(/&#39;/g,"\'");
		         s = s.replace(/&quot;/g,"\"");
		         return s;  
		   }
	};


	function getCookie(name) {
		var arr = document.cookie.match(new RegExp("(^| )" + name
				+ "=([^;]*)(;|$)"));
		if (arr != null) {
			return unescape(arr[2]);
		} else {
			return null;
		}
	};
	
	urls=[]; 

	function redirect(url){
		if(url==undefined)
			return goBack;
		if(typeof urls[url]=="function")
			return urls[url];
		if(urls[url]==undefined){
			urls.push(url);
			urls[url]=function(){
				location.href = url;
			};
			return urls[url];
		}
	}
	
	function goBack(url,url2) {
		var referrer=getReferrer();
		if (referrer != ""&&referrer!=location.href){
			if(url2){
				var re = new RegExp(url2);
				if(!re.test(referrer))
				   location.href = referrer;
				else
					location.href = url;
			}
			else
				location.href = getReferrer();
		}
		else if(url)
			location.href = url;
		else
			history.back();
	}

	showmessage=function(target,message){
		if(message&&(message!="")){
			var element=$(target);
			placement=$(element).attr("data-placement")||"bottom";
			if(element.is("#selected")){
					target=$("#columns_table");
					placement=$(element).attr("data-placement")||"top";
			}			
			else if(element.is("input:hidden")){
					target=element.prev("div");
			}
			else
				 target=element;
			
			target.tooltip({
		    	container:"body",
		    	selector:element,
		    	title:message,
		    	trigger:"hover",
		    	placement:placement
		    }).tooltip('show');
			setTimeout(function(){target.tooltip('destroy');},2000);
		}
	};
	
	errorPlacement=function(error,element){
		var message=error.text();
		if(message&&(message!="")){
			var target=element;
			placement=$(element).attr("data-placement")||"bottom";
			if(element.is("#selected")){
					target=$("#columns_table");
					placement=$(element).attr("data-placement")||"top";
			}			
			else if(element.is("input:hidden")){
					target=element.prev("div");
			}
			target.tooltip({
		    	container:"body",
		    	selector:element,
		    	title:message,
		    	trigger:"hover",
		    	placement:placement
		    }).tooltip('show');
			setTimeout(function(){target.tooltip('destroy');},1000);
		}
	};
	
	success=function(error){
		name=error.attr('for');
		element=$("[name='"+name+"']");
		message=error.text();
		if(element.is("input:hidden"))
			target=element.prev("div");
		else if(element.is("#selected"))
			target=$("#columns_table");			
		else
			target=element;
		target.tooltip('destroy');
	};

	function getReferrer(){
		var referrer = '';
		try {
			referrer = window.top.document.referrer;
		} catch (e) {
			if (window.parent) {
				try {
					referrer = window.parent.document.referrer;
				} catch (e2) {
					referrer = '';
				}
			}
		}
		if (referrer === '') {
			referrer = document.referrer;
		}
		return referrer;
	};
	
	function sh(object){
		try{
			alert(JSON.stringify(object, null, 2));
		}
		catch(e){
			
		}
	}
	
	function log(object){
		try{
			console.info(JSON.stringify(object, null, 2));
		}
		catch(e){
			
		}
	}
	
	hide=function(element) {
		if ($(element).data("active") != "active")
			$(element).popover('hide');
	};
	
	show=function(element) {
		if ($(element).data("active") == "active")
			$(element).popover('show');
	};
	
	setupPopover=function(opt){
		var element=opt.element,
			content=opt.content,
			width=opt.width||"100%",
			placement=opt.placement||"right";
		
		$(element).popover({
			animation : true,
			html : true,
			placement : placement,
			trigger : 'manual',
			content : function() {	
				$(content).find("div:first").css("width",width);
				return $(content).html();
			}
		}).hover(function() {
			$(element).data("active", "active");
			setTimeout("show('"+element+"')", 500);
		}, function() {
			$(element).data("active", "");	
			setTimeout("hide('"+element+"')", 500);
		}).on('shown.bs.popover', function() {
			$(".data-close").click(function() {
				$(element).data("active", "");
				hide(element);
			});
			$(".popover-content").hover(function() {
				$(element).data("active", "active");			
			}, function() {
				$(element).data("active", "");			
				setTimeout("hide('"+element+"')", 500);
			});
		});
	};
	
	this.initPopover=function(element,content,position){
		$(element).popover({
			animation : true,
			html : true,
			container:"body",
			placement : position?position:'right',
			trigger : 'manual',
			content : function() {	
				return $(content).html();
			}
		}).hover(function() {
			$(element).data("active", "active");
			setTimeout("show('"+element+"')", 50);
		}, function() {
			$(element).data("active", "");	
			setTimeout("hide('"+element+"')", 50);
		}).on('shown.bs.popover', function() {
			$(".data-close").click(function() {
				$(element).data("active", "");
				hide(element);
			});
			$(".popover-content").hover(function() {
				$(element).data("active", "active");			
			}, function() {
					$(element).data("active", "");			
					setTimeout("hide('"+element+"')", 50);
			});
		});
	};
	this.attachPopover=function(element,content,position,shownCallback){
		$(element).data("active", "");
		$(element).popover({
			animation : true,
			html : true,
			container:"body",
			placement : position?position:'right',
			trigger : 'manual',
			content : function() {	
				 return $(content).html().trim();
			}
		}).click(function() {
			if($(element).data("active")!=""){				
				setTimeout("hide('"+element+"')", 50);
				$(element).data("active", "").removeClass("btn-info");
			}
			else{ 
				setTimeout("show('"+element+"')", 50);
				$(element).data("active", "active").addClass("btn-info");
			}
		}).on('shown.bs.popover', function() {
			$(".data-close").click(function() {
				$(element).data("active", "").removeClass("btn-info");
				hide(element);
			});
			if(shownCallback&& typeof shownCallback==="function")
				shownCallback(element);
		});
	};
	
	this.getDPI=function() {
	    var arrDPI = new Array();
	    if (window.screen.deviceXDPI != undefined) {
	        arrDPI[0] = window.screen.deviceXDPI;
	        arrDPI[1] = window.screen.deviceYDPI;
	    }
	    else {
	        var tmpNode = document.createElement("DIV");
	        tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
	        document.body.appendChild(tmpNode);
	        arrDPI[0] = parseInt(tmpNode.offsetWidth);
	        arrDPI[1] = parseInt(tmpNode.offsetHeight);
	        tmpNode.parentNode.removeChild(tmpNode);   
	    }
	    return arrDPI;
	};
	this.htmlTrim=function(data){
		data = data.replace(/<script[^>]*>(.|\n)*?(?=<\/script>)<\/script>/gi,"");
		data = data.replace(/<noscript[^>]*>(.|\n)*?(?=<\/noscript>)<\/noscript>/gi,"");
		data = data.replace(/id=\"(.|\n)*?\"/gi,"");
		data = data.replace(/<link(.|\n)*?>/gi,"");
		data = data.replace(/<iframe(.|\n)*?>(.|\n)*?<\/iframe>/gi,"");
		data = data.replace(/white-space:(.|\n)*?;/gi,"");
//		data = data.replace(/position:(.|\n)*?fixed(.|\n)*?;/gi,"");
//		data = data.replace(/<style[^>]*>(.|\n)*?(?=<\/style>)<\/style>/gi,"");
//		data = data.replace(/style=\"(.|\n)*?\"/gi,"");
//		data = data.replace(/class=\"(.|\n)*?\"/gi,"");
		return data;
	};
	
	this.redirect=redirect;
	this.getCookie = getCookie;
	this.goBack = goBack;
	this.getReferrer=getReferrer;
	this.errorPlacement=errorPlacement;
	this.success=success;
	this.sh=sh;
	this.log=log;
	$(document).ready(function() {
		$(".pagination>li").each(function(i, item) {
			item.innerHTML = item.innerHTML.replace(/,/g, "");
		});
		
		if(typeof toastr=="object"){
			toastr.options = {
				  "closeButton": true,
				  "debug": false,
				  "newestOnTop": false,
				  "progressBar": false,
				  "positionClass": "toast-middle-center",
				  "preventDuplicates": false,
				  "onclick": null,
				  "showDuration": "300",
				  "hideDuration": "1000",
				  "timeOut": "2000",
				  "extendedTimeOut": "1000",
				  "showEasing": "swing",
				  "hideEasing": "linear",
				  "showMethod": "fadeIn",
				  "hideMethod": "fadeOut"
				};
			window.alert=function(msg){
				toastr["info"](msg);
			};
		}
	});

})();

$.extend({  
	queryStrings: function(){  
      var vars = [], hash;  
      var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');  
      for(var i = 0; i < hashes.length; i++)  
      {  
        hash = hashes[i].split('=');  
        vars.push(hash[0]);  
        vars[hash[0]] = hash[1];  
      }
      return vars;  
    },  
    queryString: function(name){  
      return $.queryStrings()[name];  
    }  
  });  

//+---------------------------------------------------  
//| 日期计算  
//+---------------------------------------------------  
Date.prototype.DateAdd = function(strInterval, Number) {   
  var dtTmp = this;  
  switch (strInterval) {   
      case 's' :return new Date(Date.parse(dtTmp) + (1000 * Number));  
      case 'm' :return new Date(Date.parse(dtTmp) + (60000 * Number));  
      case 'h' :return new Date(Date.parse(dtTmp) + (3600000 * Number));  
      case 'd' :return new Date(Date.parse(dtTmp) + (86400000 * Number));  
      case 'w' :return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number));  
      case 'q' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number*3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());  
      case 'M' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());  
      case 'y' :return new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());  
  }  
};

Date.prototype.format = function(format) {
	var o = {
		"M+" : this.getMonth() + 1, // month
		"d+" : this.getDate(), // day
		"h+" : this.getHours(), // hour
		"m+" : this.getMinutes(), // minute
		"s+" : this.getSeconds(), // second
		"q+" : Math.floor((this.getMonth() + 3) / 3), // quarter
		"S" : this.getMilliseconds()
	// millisecond
	};
	if (/(y+)/.test(format))
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for ( var k in o)
		if (new RegExp("(" + k + ")").test(format))
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]	: ("00" + o[k]).substr(("" + o[k]).length));
	return format;
};


Date.prototype.timeSpan=function(){
	var clientlanguage = getCookie("clientlanguage");		
	var date1=this;
	now=new Date();
	var diff=now.getTime()-date1.getTime();
	if(clientlanguage == "zh_CN"){
		if(diff>0){
			var seconds=diff/1000;
			if(seconds<60)
				return "小于1分钟";
			var mins=seconds/60;
			if(mins<60)
				return parseInt(mins)+"分钟前";
			var hours=mins/60;
			if(hours<24)
				return parseInt(hours)+"小时前";
			var days=hours/24;
				return parseInt(days)+"天前";
		}
		else{
			diff=-diff;
			var seconds=diff/1000;
			var mins=seconds/60;
			var hours=mins/60;
			var days=hours/24;
			if(mins<60)
				return "一小时";
			else if(days<1)
				return "今天";
			else if(days<2)
				return "明天";
			else
				return parseInt(days)+"天后";
			
		}
	}else{
		if(diff>0){
			var seconds=diff/1000;
			if(seconds<60)
				return "Less than 1 minute";
			var mins=seconds/60;
			if(mins<60)
				return "before "+parseInt(mins)+" minute";
			var hours=mins/60;
			if(hours<24)
				return "before "+parseInt(hours)+" hour";
			var days=hours/24;
				return "before "+parseInt(days)+" day";
		}
		else{
			diff=-diff;
			var seconds=diff/1000;
			var mins=seconds/60;
			var hours=mins/60;
			var days=hours/24;
			if(mins<60)
				return "one hour";
			else if(days<1)
				return "today";
			else if(days<2)
				return "tomorrow";
			else
				return "after "+parseInt(days)+" day";
			
		}
	}
	
};

Array.prototype.listSort=function (sortby,direction){
    var objt=this;
    direction=direction.toUpperCase( );
    var obj =objt.slice(0); 
	 obj = obj.sort(function (a,b){
	 if(sortby.indexOf(".")<0){
		 var codeA=a[sortby]==null?0:a[sortby];
		 var codeB=b[sortby]==null?0:b[sortby];
	 }
	 else{
		 var codeA=eval("a."+sortby)==null?0:eval("a."+sortby);
		 var codeB=eval("b."+sortby)==null?0:eval("b."+sortby);
	 }
		if(direction==="DESC"||direction==="ASC"||direction===" "){
			if(direction==="DESC"){
				t=codeA;codeA=codeB;codeB=t;
			}
			if (typeof codeB=="string"){
				return (codeA+'').localeCompare(codeB );
			}
			else if(typeof codeB=="number"){
				return codeB-codeA;
			}
			
		}
   });
	return obj;
};




$.date = function(dateObject,format) {
    var d = new Date(dateObject);
    if(format==undefined||format==""||format==null)
    	format="yy-MM-dd hh:mm:ss";
    var str = format;   
    var Week = ['日','一','二','三','四','五','六'];  
  
    str=str.replace(/yy|YY/,d.getFullYear());   
    var month=d.getMonth()+1;
    str=str.replace(/MM/,month>9?month.toString():'0' + month);   
    str=str.replace(/M/g,month);   
  
    str=str.replace(/w|W/g,Week[d.getDay()]);   
  
    str=str.replace(/dd|DD/,d.getDate()>9?d.getDate().toString():'0' + d.getDate());   
    str=str.replace(/d|D/g,d.getDate());   
  
    str=str.replace(/hh|HH/,d.getHours()>9?d.getHours().toString():'0' + d.getHours());   
    str=str.replace(/h|H/g,d.getHours());   
    str=str.replace(/mm/,d.getMinutes()>9?d.getMinutes().toString():'0' + d.getMinutes());   
    str=str.replace(/m/g,d.getMinutes());   
  
    str=str.replace(/ss|SS/,d.getSeconds()>9?d.getSeconds().toString():'0' + d.getSeconds());   
    str=str.replace(/s|S/g,d.getSeconds());   
  
    return str;   
};


if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}

(function($){
	
	restfulStore=function(baseUrl,retrieveUrl,async) {
		riot.observable(this);
		this.async=async||false;
		this.baseUrl=baseUrl;
		this.retrieveUrl=retrieveUrl;	
	};
	
	restfulStore.prototype.Async=function(async){
		if(arguments.length==0)
			return this.async;
		else
			this.async=async;
	};

	restfulStore.prototype.BaseUrl=function(url){
		if(arguments.length==0)
			return this.baseUrl;
		else
			this.baseUrl=url;
	};

	restfulStore.prototype.RetrieveUrl=function(url){
		if(arguments.length==0)
			return this.retrieveUrl;
		else
			this.retrieveUrl=url;
	};

	restfulStore.prototype.get=function(key,callback,error){
		if(this.retrieveUrl==undefined){
			return [];
		}
		var url=this.retrieveUrl;
		if(key&&key!="")
			url=this.baseUrl+"/"+key;
		if(this.async==false){
			try{
				responseText=$.ajax({
					type:"get",
					url:url,
					async:false,									
				}).responseText;
				resp=JSON.parse(responseText);
				if($.isArray(resp)){
				   return resp;
				}
				else if(resp.content&&$.isArray(resp.content)){
					return resp.content;
				}
				else{
					wrap=[];
					wrap.push(resp);
					return wrap;
				}
			}
			catch(e){
				return [];
			}
		} else {
			$.ajax({
				type : "get",
				url : url,
				success : function(data) {
					if(callback&&typeof callback=="function")
						callback(data);
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					if(typeof error=="function")
						error(XMLHttpRequest, textStatus, errorThrown);
				}
			});
		}
		return [];
	};

	restfulStore.prototype.del=function(item,callback,error){
		$.ajax({
			type : "delete",
			url : this.baseUrl + "/" + item.id,
			success : function() {
				if(typeof callback=="function")
					callback(item);
			},
			error : function(XMLHttpRequest, textStatus, errorThrown) {
				if(typeof error=="function")
					error(XMLHttpRequest, textStatus, errorThrown);
			}
		});
	};
	restfulStore.prototype.save=function(item,callback,error){
		var url = this.baseUrl;
		if (item&&(item.id != "")&&(item.id!=null)) {
			url = this.baseUrl + "/" + item.id;
			action = "put";
		} else {
			action = "post";
		}
		$.ajax({
			type : action,
			url : url,
			contentType:"application/json",
			data : JSON.stringify(item),
			success : function(data) {
				if(typeof callback=="function")
					callback(data);
			},
			error : function(XMLHttpRequest, textStatus, errorThrown) {
				if(typeof error=="function")
					error(XMLHttpRequest, textStatus, errorThrown);
			}
		});
	};
	
	service=function(store,opt) {
		var self = riot.observable(this);
		self._items=[];
		self.retrieveData=false;
		self.store=store;
		if(this.store.async){			
			if(opt&&opt.callback&&typeof opt.callback=="function")
				self.store.get(null,function(data){					
					self.retrieveData=true;
					if(data instanceof Array)						
						self._items=data;
					else if(data.content&&data.content instanceof Array)
						self._items=data.content;
					else
						self._items.push(data);
					if(opt&&opt.callback&&typeof opt.callback=="function")
						opt.callback(data);
					else
						alert("callback is not defined for async get function");
				},function(XMLHttpRequest, textStatus, errorThrown){
					self.error({
						textStatus:textStatus,
						status:XMLHttpRequest.status,
						message:XMLHttpRequest.responseText||textStatus
					});
				});
		}
		
		self.error=function(exception){
			var url=window.location.href;
			if(exception.message=="{\"exception\":{\"message\":\"login required\",\"type\":\"login\"}}"||exception.message=="login required"){
				riot.mount("logon",{"login_required":true,"closeable":true});
				//window.location.href=url.substring(0, url.length-1);
			}
			else{
				if(exception.message!="")
					alert(exception.message);
				self.trigger("error", exception);
			}
		};
		
		self.add = function(item,callback) {
			self.store.save(item,function(data){
				self._items.push(data);
				if(callback&&typeof callback==="function"){
					callback(data);
				}
				self.trigger("add", data);
			},function(XMLHttpRequest, textStatus, errorThrown){
				self.error({
					textStatus:textStatus,
					status:XMLHttpRequest.status,
					message:XMLHttpRequest.responseJSON.exception.message
				});
			});
			
		};
		
		self.edit = function(item,callback) {
			self.items(item.id)[0] = item;
			self.store.save(item,function(data){
				if(callback&&typeof callback==="function"){
					callback(data);
				}
				self.trigger("edit", data);
			},function(XMLHttpRequest, textStatus, errorThrown){
				self.error({
					textStatus:textStatus,
					status:XMLHttpRequest.status,
					message:XMLHttpRequest.responseJSON?XMLHttpRequest.responseJSON.exception.message:XMLHttpRequest.responseText
				});
			});
			
		};	
		
		self.remove = function(filter,callback) {
			var _remove=function(item){
				self.store.del(item,function(data){
					var index=self._items.indexOf(item);
					if(index>=0)
						self._items.splice(index, 1);
					if(callback&&typeof callback==="function"){
						callback(data);
					}
					self.trigger("remove", item);
				},function(XMLHttpRequest, textStatus, errorThrown){
					self.error({
						textStatus:textStatus,
						status:XMLHttpRequest.status,
						message:XMLHttpRequest.responseJSON.exception.message
					});
				});
			}
			var els = self.items(filter);
			if(els.join&&els.length==0&&typeof filter=='object'){
				_remove(filter);
			}
			else
			$.each(els, function(i,item) {
				_remove(item);
			});
		};
		
		self.items = function(filter) {
			if(!self.retrieveData&&!self.store.async){
				self._items=self.store.get();		
				self.retrieveData=true;
			}
			var ret = [];
			$.each(self._items, function(index, item) {
				if(typeof filter=="function"){
					if (filter(item)===true||filter(item) == item.id)
						ret.push(item);
				}
				else if(typeof filter=="object"){
					if (filter.id!=null&&filter.id == item.id)
						ret.push(item);
				}
				else{
					if (filter==undefined||filter===true||filter == item.id)
						ret.push(item);
				}
			});		   
			return ret;
		};
	};
	
	$.restfulService=function(url,opt){
		var store=new restfulStore(url);
		if(typeof opt==="string")
			store.RetrieveUrl(opt);
		else if(typeof opt==="object"){
			if(opt.retrieveUrl)
				store.RetrieveUrl(opt.retrieveUrl);
			var async=opt.async||false;
			store.Async(async);			
		}
		var _service=new service(store,opt);
		_service.setRetrieveUrl=function(url,opt){
			store.RetrieveUrl(url);
			if(opt&&opt.async!=null)
				store.Async(opt.async);
			if(!store.async){
				_service._items=store.get();
				_service.retrieveData=true;
			}
			else{
				store.get(null,function(data){					
					_service.retrieveData=true;
					if(data instanceof Array)						
						_service._items=data;
					else if(data.content&&data.content instanceof Array)
						_service._items=data.content;
					else
						_service._items.push(data);
					if(opt&&opt.callback&&typeof opt.callback=="function")
						opt.callback(data);
					else
						alert("callback is not defined for async get function");
				},function(XMLHttpRequest, textStatus, errorThrown){
					_service.error({
						textStatus:textStatus,
						status:XMLHttpRequest.status,
						message:XMLHttpRequest.responseText||textStatus
					});
				});
			}
		};
		return _service;
	};
	
})(jQuery);