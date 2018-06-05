(function($){
	$.connector = function(type,option) {		
		if (type==="lineConnector")
			return new lineConnector(option? option: {});
		else if (type==="brokenLineConnector")
			return new brokenLineConnector(option? option: {});
		else if (type==="quadraticCurveConnector")
			return new quadraticCurveConnector(option? option: {});
		else if(type==="relationConnector")
			return new relationConnector(option? option: {});
		else if(type==="referenceConnector")
			return new referenceConnector(option? option: {});
		else if(type==="mapConnector")
			return new mapConnector(option? option: {});
		else 
			return new widget(option?option:{});
	};
	
	_connector=function(option){
		var opt={
				border:{
					width:1,
					type:"solid",
					color:"black"
				},
				offsetX:35,
				offsetY:35,
				minOffset:20,
				dashOffset:0,
				dashColor:"green",
				corner:null,
				selectable:false,
				linefixed:false,
				linecap:"round"//butt,square
			};
		$.extend(opt,option);	
		$.extend(this,new widget(opt));
		this.allowconnectionPoint=false;		
		this.appendPresenter = function(presenter) {
			this.parent=presenter.rootwidget;
			this.root=presenter.rootwidget;
			presenter.widgets.push(this);
			this.depth = presenter.widgets.length;			
			this.presenters.push(presenter);
			if(this.begin&&this.begin.widget&&this.end&&this.end.widget){
				this.paint();
			}
			return this;
		};
		
	
		this.persist=function(){
			var r=widget.persistproperty(this);
			r.offsetX=this.offsetX;
			r.offsetY=this.offsetY;
			r.linecap=this.linecap;
			r.minOffset=this.minOffset;
			r.dashOffset=this.dashOffset;
			r.begin=this.begin.persist();
			r.end=this.end.persist();			
			return r;
		};
		this.appendPresenter = function(presenter) {
			this.parent=presenter.rootwidget;
			this.root=presenter.rootwidget;
			presenter.widgets.push(this);
			this.depth = presenter.widgets.length;
			this.presenters.push(presenter);
			if(!presenter.globalAnimations)
				presenter.globalAnimations=[];				
			presenter.globalAnimations.push(this);
			return this;
		};
		this.run=function(frameSpeed){
				var ths=this;
		    	var startValues={dashOffset:0};
		    	var endValues={dashOffset:20};
		    	var tweenA=new TWEEN.Tween(startValues).to(endValues, 1000).delay(0).repeat(Infinity).easing(TWEEN.Easing.Linear.None).onUpdate(function(){	    	  
				      for(var s in startValues){
				      		ths[s]=parseInt(this[s]);
				      }
			     	}).onComplete(function(){
			      	 	      	 
			     	});
		    	tweenA.start();
		};		
		return this;
	};
	
	brokenLineConnector=function(option){
		var opt={
				name:"brokenLineConnector",
				width:150,
				height:50,
				linefixed:false,
				text:"brokenLineConnector"
					
		};
		
		$.extend(opt,option);	
		$.extend(this,new _connector(opt));
		this.propertyEditors=["common","border","arrow"];
		this.begin=new endpoint(option.begin);
		this.end=new endpoint(option.end);
		this.type="brokenLineConnector";
		
		
         this.checkPointIn =function(x, y,scale) {
     		if(this.root!=null)
     			scale=scale||this.root.scale;
     		if(!scale)
     			scale=1;
     		var _xc = this.relativePoint(x, y,scale);
     		var x2 = _xc.x;
     		var y2 = _xc.y;
     		var result=false;
     		for(var i=0;i<this.resizers.length-1;i++){     			
     			result=math.isPointOnLine(x2,y2,this.resizers[i].x*scale,this.resizers[i].y*scale,this.resizers[i+1].x*scale,this.resizers[i+1].y*scale);
     			if(result==true){
     				return true;
     			}
			}
     		return false;
         };
		
		this.persist=function(){
			var r=widget.persistproperty(this);
			r.offsetX=this.offsetX;
			r.offsetY=this.offsetY;
			r.linecap=this.linecap;
			r.minOffset=this.minOffset;
			r.begin=this.begin.persist();
			r.end=this.end.persist();
			r.begin.position=this.begin.position;
			r.end.position=this.end.position;
			//r.resizers=this.resizers;
			return r;
		};
		
		this.setResizers=function(){
			var l=16;
			var sp={
					x:this.begin.x+this.begin.widget.x,
					y:this.begin.y+this.begin.widget.y,
			},
			ep={
					x:this.end.x+this.end.widget.x,
					y:this.end.y+this.end.widget.y
			};
			if(this.begin.widget.x+this.begin.widget.width<this.end.widget.x+this.end.x){ //1,2	
				if(!this.end.position)
					this.end.position="left";
				if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y+this.end.y)//1
				{
					if(this.begin.position==="top"){
						sp.y=this.begin.widget.y;
						this.end.position="top";
						ep.y=this.end.widget.y+this.end.offsety;
					}
					else if(this.begin.position==="left"){
						this.end.position="left";
						sp.x=this.begin.widget.x;
						ep.x=this.end.widget.x+this.end.offsetx;
					}					
					else if(this.begin.position==="right"){
						sp.x=this.begin.widget.x+this.begin.widget.width;
						if(this.begin.widget.x+this.begin.widget.width>this.end.widget.x-l){
							this.end.position="top";
							ep.y=this.end.widget.y+this.end.offsety;
						}
						else if(this.begin.widget.y+this.begin.y>this.end.widget.y-l){
							this.end.position="left";
							ep.x=this.end.widget.x+this.end.offsetx;
						}
					}
					else{//bottom
						sp.y=this.begin.widget.y+this.begin.widget.height;
						if(this.begin.widget.y+this.begin.widget.height>this.end.widget.y-l){
							this.end.position="left";
							ep.x=this.end.widget.x+this.end.offsetx;
						}
						else if(this.begin.widget.x+this.begin.x>this.end.widget.x-l){
							this.end.position="top";
							ep.y=this.end.widget.y+this.end.offsety;
						}						
					}
					if(this.end.position=="left"){
						ep.x=this.end.widget.x+this.end.offsetx;
					}
					else if(this.end.position==="right"){
				    	this.end.position="left";
				    	ep.x=this.end.widget.x+this.end.offsetx;
				    }
				    else if(this.end.position=="top"){
				    	ep.y=this.end.widget.y+this.end.offsety;
				    }
				    else if(this.end.position=="bottom"){
				    	this.end.position="top";
				    	ep.y=this.end.widget.y+this.end.offsety;
				    }
				    
				}
				else if(this.begin.widget.y>this.end.widget.y+this.end.y)//2
				{
					if(this.begin.position==="bottom"){
						sp.y=this.begin.widget.y+this.begin.widget.height;
						this.end.position="bottom";
						ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
					}
					else if(this.begin.position==="left"){
						this.end.position="left";
						sp.x=this.begin.widget.x;
						ep.x=this.end.widget.x+this.end.offsetx;
					}					
					else if(this.begin.position==="right"){
						sp.x=this.begin.widget.x+this.begin.widget.width;
						if(this.begin.widget.x+this.begin.widget.width>this.end.widget.x-l){
							this.end.position="bottom";
							ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
						}
						else if(this.begin.widget.y+this.begin.y<this.end.widget.y+this.end.widget.height-l){
							this.end.position="left";
							ep.x=this.end.widget.x+this.end.offsetx;
							
						}
					}
					else{//top
						sp.y=this.begin.widget.y;
						if(this.begin.widget.y<this.end.widget.y+this.end.widget.height+l){
							this.end.position="left";
							ep.x=this.end.widget.x+this.end.offsetx;
						}
						else if(this.begin.widget.x+this.begin.x>this.end.widget.x-l){
							this.end.position="bottom";
							ep.y=this.end.widget.y-this.end.offsety;
						}
						
					}
					if(this.end.position=="left"){
						ep.x=this.end.widget.x+this.end.offsetx;
					}
					else if(this.end.position=="right"){
						this.end.position="left";
						ep.x=this.end.widget.x+this.end.offsetx;
					}
				    else if(this.end.position=="bottom") {
				    	ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
				    }
				    else if(this.end.position=="top") {
				    	this.end.position="bottom";
				    	ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
				    }
				}
				else{ //左右机构
					if(this.begin.position==="top"){	
						this.end.position="top";
						ep.y=this.end.widget.y+this.end.offsety;
						sp.y=this.begin.widget.y;
					}
					else if(this.begin.position==="bottom"){							
						this.end.position="bottom";	
						ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
						sp.y=this.begin.widget.y+this.begin.widget.height;
					}
					else{
						sp.x=this.begin.widget.x+this.begin.widget.width;
						this.begin.position="right";
						ep.x=this.end.widget.x+this.end.offsetx;
						this.end.position="left";
					}						
				}
			}
			else if(this.end.widget.x+this.end.widget.width<this.begin.widget.x+this.begin.x){//3,4
				//console.info("right-left");
				if(!this.end.position)
					this.end.position="right";
				if(this.begin.widget.y>this.end.widget.y+this.end.y){//4
					//console.info("4");
					if(this.begin.position==="bottom"){
						sp.y=this.begin.widget.y+this.begin.widget.height;
						this.end.position="bottom";
						ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
					}
					else if(this.begin.position==="right"){
						this.end.position="right";
						sp.x=this.begin.widget.x+this.begin.widget.width;
						ep.x=this.end.widget.x+this.end.widget.width;
					}					
					else if(this.begin.position==="left"){
						sp.x=this.begin.widget.x;
						if(this.begin.widget.x-l<this.end.widget.x+this.end.widget.width){
							this.end.position="bottom";
							ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
						}
						else if(this.begin.widget.y+this.begin.y<this.end.widget.y+this.end.widget.height-l){
							this.end.position="right";
							ep.x=this.end.widget.x+this.end.widget.width;
						}
					}
					else{//top
						sp.y=this.begin.widget.y;
						if(this.begin.widget.y<this.end.widget.y+this.end.widget.height-l){
							this.end.position="right";
							ep.x=this.end.widget.x+this.end.widget.width;
						}
						else if(this.begin.widget.x+this.begin.x<this.end.widget.x+this.end.widget.width+l){
							this.end.position="bottom";
							ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
						}
					}
					if(this.end.position=="right"){
						ep.x=this.end.widget.x+this.end.widget.width;
					}
					else if(this.end.position=="left"){
						this.end.position="right";
						ep.x=this.end.widget.x+this.end.widget.width;
					}
				    else if(this.end.position=="bottom") {
				    	ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
				    }
				    else if(this.end.position=="top") {
				    	this.end.position="bottom";
				    	ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
				    }
				}
				else if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y+this.end.y)//3
				{
					if(this.begin.position==="top"){
						sp.y=this.begin.widget.y;
						this.end.position="top";
						ep.y=this.end.widget.y+this.end.offsety;
					}
					else if(this.begin.position==="right"){
						this.end.position="right";
						sp.x=this.begin.widget.x+this.begin.widget.width;
						ep.x=this.end.widget.x+this.end.widget.width;
					}					
					else if(this.begin.position==="left"){
						sp.x=this.begin.widget.x;
						if(this.begin.widget.x<this.end.widget.x+this.end.widget.width+l){
							this.end.position="top";
							ep.y=this.end.widget.y+this.end.offsety;
						}
						else if(this.begin.widget.y+this.begin.y>this.end.widget.y){
							this.end.position="right";
							ep.x=this.end.widget.x+this.end.widget.width;
						}
					}
					else{//bottom
						if(this.end.position!=="bottom"){
							sp.y=this.begin.widget.y+this.begin.widget.height;
							if(this.begin.widget.y+this.begin.widget.height>this.end.widget.y){
								this.end.position="right";
								ep.x=this.end.widget.x+this.end.widget.width;
							}
							else if(this.begin.widget.x+this.begin.x<this.end.widget.x+this.end.widget.width+l){
								this.end.position="top";
								ep.y=this.end.widget.y+this.end.offsety;
							}
						}
						else{
							sp.y=this.begin.widget.y+this.begin.widget.height;
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
						}
						
					}
					if(this.end.position==="right"){
						ep.x=this.end.widget.x+this.end.widget.width;
					}
					else if(this.end.position==="left"){
						this.end.position="right";
						ep.x=this.end.widget.x+this.end.widget.width;
					}
				    else if(this.end.position=="top") {
				    	ep.y=this.end.widget.y+this.end.offsety;
				    }
				    else if(this.end.position=="bottom") {
				    	this.end.position="top";
				    	ep.y=this.end.widget.y+this.end.offsety;
				    }
				}
				else{//左右机构
					if(this.begin.position==="top"){	
							this.end.position="top";
							ep.y=this.end.widget.y+this.end.offsety;
							sp.y=this.begin.widget.y;
					}
					else if(this.begin.position==="bottom"){
							this.end.position="bottom";
							ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
							sp.y=this.begin.widget.y+this.begin.widget.height;
					}
					else{
						sp.x=this.begin.widget.x;
						this.begin.position="left";
						ep.x=this.end.widget.x+this.end.widget.width;
						this.end.position="right";
					}
				}
			}
			else{//上下结构
				//console.info("top-bottom");
				if(this.begin.position==="left"){
						this.end.position="left";
						ep.x=this.end.widget.x+this.end.offsetx;
						sp.x=this.begin.widget.x;
				}
				else if(this.begin.position==="right"){
						this.end.position="right";
						ep.x=this.end.widget.x+this.end.widget.width;
						sp.x=this.begin.widget.x+this.begin.widget.width;
				}				
				else if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
					this.begin.position="bottom";
					sp.y=this.begin.widget.y+this.begin.widget.height;
					this.end.position="top";
					ep.y=this.end.widget.y+this.end.offsety;
				}
				else{
					sp.y=this.begin.widget.y;
					this.begin.position="top";
					ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
					this.end.position="bottom";
				}
			}
			var MIN_OFFSET=30;
			this.x=Math.min(sp.x,ep.x);
			this.y=Math.min(sp.y,ep.y);
			this.width=Math.abs(ep.x-sp.x);
			this.height=Math.abs(ep.y-sp.y);
			var point1={
					x:sp.x-this.x,
					y:sp.y-this.y,
					cursor:"move",
					visible:true
			},
			point2={
					x:ep.x-this.x,
					y:ep.y-this.y,
					cursor:"move",
					visible:true
			};
			if((this.begin.position==this.end.position)&&this.begin.position==="right"){
				this.width=this.width+this.offsetX;
			}
			if((this.begin.position==this.end.position)&&this.begin.position==="left"){
				this.width=this.width+this.offsetX;
//				this.x=this.x-this.offsetX;
			}
			
			if((this.begin.position==this.end.position)&&this.begin.position==="top"){
				this.height=this.height+this.offsetY;
//				this.y=this.y-this.offsetY;
			}
			if((this.begin.position==this.end.position)&&this.begin.position==="bottom"){
				this.height=this.height+this.offsetY;
			}
			this.sp=point1;
			this.ep=point2;
			if(((point1.x===point2.x)||(point1.y===point2.y))&&(this.begin.position!=this.end.position)){
				this.resizers=[point1,point2];
			}
			else{
				if(this.begin.position==="top"||this.begin.position==="bottom"){
					if((this.end.position==="top"||this.end.position==="bottom")&&(this.end.position!=this.begin.position)){
						var point3={
								x:point1.x,
								y:this.offsetY,
								visible:true
						};
						var point4={
								x:point2.x,
								y:this.offsetY,
								visible:true
						};
						if(this.linefixed){
							if(this.begin.position=="bottom"){
								point3={
										x:point1.x,
										y:Math.max(this.height/3,MIN_OFFSET),
										visible:true
								};
								point4={
										x:point2.x,
										y:this.height-Math.max(this.height/3,MIN_OFFSET),
										visible:true
								};
							}
							else{
								point3={
										x:point1.x,
										y:this.height-Math.max(this.height/3,MIN_OFFSET),
										visible:true
								};
								point4={
										x:point2.x,
										y:Math.max(this.height/3,MIN_OFFSET),
										visible:true
								};
							}
						}
						this.resizers=[point1,point3,point4,point2];
					}
					else if(this.end.position==="top"&&this.end.position===this.begin.position){
						var point3={
								x:point1.x,
								y:Math.min(point1.y,point2.y)-Math.max(this.offsetY,MIN_OFFSET),								
								visible:true
						};
						var point4={
								x:point2.x,
								y:Math.min(point1.y,point2.y)-Math.max(this.offsetY,MIN_OFFSET),
								visible:true
						};
						this.resizers=[point1,point3,point4,point2];
						
					}
					else if(this.end.position==="bottom"&&this.end.position===this.begin.position){
						var point3={
								x:point1.x,
								y:Math.max(this.height,MIN_OFFSET),								
								visible:true
						};
						var point4={
								x:point2.x,
								y:Math.max(this.height,MIN_OFFSET),								
								visible:true
						};
						this.resizers=[point1,point3,point4,point2];
					}
					else{
						var point3={
								x:point1.x,
								y:point2.y,
								visible:true
						};	
						this.resizers=[point1,point3,point2];
					}
				}
				else if(this.begin.position==="right"||this.begin.position==="left"){
					if((this.end.position==="right"||this.end.position==="left")&&(this.end.position!=this.begin.position)){
						var point3={
								x:this.offsetX,
								y:point1.y,
								visible:true
						};
						var point4={
								x:this.offsetX,
								y:point2.y,
								visible:true
						};
						if(this.linefixed){
							if(this.begin.position==="right"){
								point3={
										x:Math.max(this.width/3,MIN_OFFSET),
										y:point1.y,
										visible:true
								};
								point4={
										x:this.width-Math.max(this.width/3,MIN_OFFSET),
										y:point2.y,
										visible:true
								};
							}
							else{
								point4={
										x:Math.max(this.width/3,MIN_OFFSET),
										y:point2.y,
										visible:true
								};
								point3={
										x:this.width-Math.max(this.width/3,MIN_OFFSET),
										y:point1.y,
										visible:true
								};
							}
						}
						this.resizers=[point1,point3,point4,point2];
					}
					else if((this.end.position==="left")&&(this.end.position===this.begin.position)){
						var point3={
								x:Math.min(point1.x,point2.x)-Math.max(this.offsetX,MIN_OFFSET),
								y:point1.y,
								visible:true
						};
						var point4={
								x:Math.min(point1.x,point2.x)-Math.max(this.offsetX,MIN_OFFSET),
								y:point2.y,
								visible:true
						};
						//this.x=Math.min(point3.x,point4.x);
						this.resizers=[point1,point3,point4,point2];
					}
					else if((this.end.position==="right")&&(this.end.position===this.begin.position)){
						var point3={
								x:Math.max(this.width,MIN_OFFSET),
								y:point1.y,
								visible:true
						};
						var point4={
								x:Math.max(this.width,MIN_OFFSET),
								y:point2.y,
								visible:true
						};
						this.resizers=[point1,point3,point4,point2];
					}
					else{
						var point3={
								x:point2.x,
								y:point1.y,
								visible:true
						};	
						this.resizers=[point1,point3,point2];
					}
				}
			}
		};
	
		this.resize=function(e){
			var offsetX=e.offset.x;
			var offsetY=e.offset.y;
			this.resizer=e.resizer-1;
			if(this.resizer==0){
				this.begin.x+=offsetX;
				this.begin.y+=offsetY;
				if(this.begin.widget.x+this.begin.widget.width<this.end.widget.x+this.end.x){
					//console.info("resize left-right");
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y+this.end.y){//1
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.position="right";
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
						}
						if(this.begin.y<0)
							this.begin.y=this.begin.widget.margin;
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.position="bottom";
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
						}
					}
					else if(this.end.widget.y+this.end.y<this.begin.widget.y){
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.position="right";							
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
						}
						if(this.begin.y<0){
							this.begin.position="top";
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
					else{ //左右结构
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.position="right";
							this.begin.x=this.begin.widget.width/2;
							this.end.position="left";
							this.end.y=this.end.widget.height/2;
						}
						if(this.begin.y<0){
							this.begin.position="top";
							this.end.position="top";							
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;						
							this.end.x=this.end.widget.width/2;
							this.end.y=this.end.widget.height/2;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.position="bottom";
							this.end.position="bottom";	
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;						
							this.end.x=this.end.widget.width/2;
							this.end.y=this.end.widget.height/2;
						}
						
					}
				}
				else if(this.end.widget.x+this.end.x<this.begin.widget.x){
					//console.info("resize-right--left");
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y+this.end.y){//3
						if(this.begin.x<0){
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
						    this.begin.position="left";
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0)
							this.begin.y=this.begin.widget.margin;
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.position="bottom";
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
						}
						
					}
					else if(this.end.widget.y+this.end.y<this.begin.widget.y){//4
						if(this.begin.x<0){
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
						    this.begin.position="left";
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
							this.begin.position="top";
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
					else{//左右结构 2
						if(this.begin.x<0){
							this.begin.position="left";
							this.begin.x=0;
							this.end.position="right";
							this.end.y=this.end.widget.height/2;
						  		
						}
						else if(this.begin.x>this.begin.widget.width){
							  this.begin.x=this.begin.widget.width;			
						}
						if(this.begin.y<0){
							this.begin.position="top";
							this.end.position="top";							
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;						
							this.end.x=this.end.widget.width/2;
							this.end.y=this.end.widget.height/2;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.position="bottom";
							this.end.position="bottom";	
							this.begin.x=this.begin.widget.width/2;
							this.begin.y=this.begin.widget.height/2;						
							this.end.x=this.end.widget.width/2;
							this.end.y=this.end.widget.height/2;
						}
					}
				}
				else{
					//console.info("resize-top--bottom");
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){  //0-上下结构
						if(this.begin.position!="bottom"){
							if(this.begin.y>this.begin.widget.height){
								this.begin.y=this.begin.widget.height/2;
								this.begin.x=this.begin.widget.width/2;
								this.end.x=this.end.widget.width/2;
								this.begin.position="bottom";
								this.end.position="top";
							}	
							else if(this.begin.y<0)
								this.begin.y=this.begin.widget.margin;
						}
						else{
							if(this.begin.x<0){
							    this.begin.x=0;	
							    this.begin.position="left";
							    this.end.position="left";
								this.begin.y=this.begin.widget.height/2;
								this.end.y=this.end.widget.height/2;
							}
							else if(this.begin.x>this.begin.widget.width){
								this.begin.x=this.begin.widget.width/2;
								this.begin.position="right";
								this.end.position="right";
								this.begin.y=this.begin.widget.height/2;
								this.end.y=this.end.widget.height/2;
							}
						}
					}					
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y)
					{
						if(this.begin.position!="top"){
							if(this.begin.y<0){
								this.begin.position="top";
								this.end.position="bottom";
								this.end.y=this.end.widget.height/2;
								this.end.x=this.end.widget.width/2;
								this.begin.x=this.begin.widget.width/2;							
								this.begin.y=this.begin.widget.height/2;
							}
						}
						else{
							if(this.begin.x<0){
								this.begin.x=this.begin.widget.width/2;
							    this.end.position="left";
							    this.begin.position="left";
							    this.begin.y=this.begin.widget.height/2;
							    this.end.y=this.end.widget.height/2;
							   
							}
							else if(this.begin.x>this.begin.widget.width){
								this.begin.x=this.begin.widget.width/2;
								this.begin.position="right";
								this.end.position="right";
								this.begin.y=this.begin.widget.height/2;
								this.end.y=this.end.widget.height/2;
							}
							else if(this.begin.y>this.begin.widget.height)
								this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
				}
			}
			else if(this.resizer==this.resizers.length-1){
				this.end.x+=offsetX;
				this.end.y+=offsetY;
				if(this.begin.widget.x+this.begin.x<this.end.widget.x){//1,2
					//console.info("resize left-right");
					if(this.begin.widget.y+this.begin.y<this.end.widget.y){//1
						if(this.end.x<0){
							this.end.position="left";
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
						}
						else if(this.end.x>this.end.widget.width)
							this.end.x=this.end.widget.width-this.end.widget.margin;
						if(this.end.y<0){
							this.end.position="top";
							this.end.x=this.end.widget.width/2;
							this.end.y=this.end.widget.height/2;
						}
						else if(this.end.y>this.end.widget.height)
							this.end.y=this.end.widget.height-this.end.widget.margin;
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y+this.begin.y){//2
						if(this.end.x<0){
							this.end.position="left";
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
						}
						else if(this.end.x>this.end.widget.width)
							this.end.x=this.end.widget.width-this.end.widget.margin;							
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
						}
						else if(this.end.y>this.end.widget.height){
							this.end.position="bottom";
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
						}
					}
					else{//左右结构1
						if(this.end.x<0){
							this.end.position="left";
							this.begin.position="right";
							this.begin.y=this.begin.widget.height/2;
						  		
						}
						else if(this.end.x>this.end.widget.width){
							  this.end.x=this.end.widget.width;			
						}
						if(this.end.y<0){
							this.begin.position="top";
							this.end.position="top";							
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
							this.begin.x=this.begin.widget.width/2;
						}
						else if(this.end.y>this.end.widget.height)
						{
							this.begin.position="bottom";
							this.end.position="bottom";	
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
							this.begin.x=this.begin.widget.width/2;
						}
						
					}
				}
				else if(this.end.widget.x+this.end.widget.width<this.begin.widget.x+this.begin.x){//3,4
					//console.info("resize right-left");
					if(this.begin.widget.y+this.begin.y<this.end.widget.y){//3
						if(this.end.x<0){
							this.end.x=this.end.widget.margin;
						}
						else if(this.end.x>this.end.widget.width){
							this.end.position="right";
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
						}
						if(this.end.y<0){
							this.end.position="top";							
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
						}
						else if(this.end.y>this.end.widget.height){
							this.begin.position="bottom";
							this.end.position="bottom";	
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
							this.begin.x=this.begin.widget.width/2;
						}
					}
					else if(this.begin.widget.y+this.begin.y>this.end.widget.y+this.end.widget.height){//4
						//console.info("4");
						if(this.end.x<0){
							this.end.x=this.end.widget.margin;
						}
						else if(this.end.x>this.end.widget.width){
							this.end.position="right";
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
						}
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
						}
						else if(this.end.y>this.end.widget.height){
							this.end.y=this.end.widget.height/2;
							this.end.position="bottom";
						}
					}
					else{
						if(this.end.x<0){
						    this.end.x=this.end.widget.margin;					
						}
						else if(this.end.x>this.end.widget.width){
							this.end.position="right";
							this.end.x=this.end.widget.width/2;
							this.begin.position="left";
							this.begin.y=this.begin.widget.height/2;
						}
						if(this.end.y<0){
							this.end.position="top";
							this.begin.position="top";							
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
							this.begin.x=this.begin.widget.width/2;
						}
						else if(this.end.y>this.end.widget.height)
						{
							this.begin.position="bottom";
							this.end.position="bottom";	
							this.end.y=this.end.widget.height/2;
							this.end.x=this.end.widget.width/2;
							this.begin.y=this.begin.widget.height/2;
							this.begin.x=this.begin.widget.width/2;
						}
					}
				}
				else{//end-上下结构
					//console.info("resize-top--bottom");
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y) 
					{
						if(this.end.position!="top"){
							if(this.end.y<0){
								this.end.y=this.end.widget.height/2;
								this.end.x=this.end.widget.width/2;
								this.begin.x=this.begin.widget.width/2;
								this.begin.y=this.begin.widget.height/2;
								this.end.position="top";
								this.begin.position="bottom";
							}							
							else if(this.end.y>this.end.widget.height){
								this.end.y=this.end.widget.height;
							}
						}
						else{
							if(this.end.x<0){
								this.begin.position="left";
								this.end.position="left";
								this.end.x=this.end.widget.width/2;
								this.end.y=this.end.widget.height/2;
								this.begin.y=this.begin.widget.height/2;								
							}							
							else if(this.end.x>this.end.widget.width){
								this.end.x=this.end.widget.width;
								this.end.y=this.end.widget.margin;
								this.begin.y=this.begin.widget.height/2;
								this.begin.position="right";
								this.end.position="right";
							}
						}
					}
					if(this.end.widget.y+this.end.widget.height<this.begin.widget.y) 
					{
						if(this.end.position!="bottom"){
							if(this.end.y>this.end.widget.height){
								this.end.x=this.end.widget.width/2;
								this.end.y=this.end.widget.height/2;
								this.begin.y=this.begin.widget.height/2;								
								this.begin.x=this.begin.widget.width/2;
								this.end.position="bottom";
								this.begin.position="top";								
							}	
							else if(this.end.y<0){
								this.end.y=0;
							}
						}
						else{
							if(this.end.x<0){
							    this.begin.position="left";
							    this.end.position="left";
							    this.end.x=this.end.widget.width/2;
								this.end.y=this.end.widget.height/2;
								this.begin.y=this.begin.widget.height/2;								
								this.begin.x=this.begin.widget.width/2;	
							}
							else if(this.end.x>this.end.widget.width){
								this.begin.position="right";
								this.end.position="right";
								this.end.x=this.end.widget.width/2;
								this.end.y=this.end.widget.height/2;
								this.begin.y=this.begin.widget.height/2;								
								this.begin.x=this.begin.widget.width/2;
							}
						}
					}
				}
			}
			else{
				if(this.resizer==1){
					if(this.begin.position==="top"||this.begin.position==="bottom"){
						if(this.begin.position!=this.end.position){
							this.begin.x+=offsetX;
							this.offsetY+=offsetY;
							if(this.begin.x<this.begin.widget.margin)
								this.begin.x=this.begin.widget.margin;
							else if(this.begin.x>this.begin.widget.width)
								this.begin.x=this.begin.widget.width-this.begin.widget.margin;
							if(this.offsetY<this.minOffset)
								this.offsetY=this.minOffset;
							else if(this.offsetY>this.height-this.minOffset)
								this.offsetY=this.height-this.minOffset;	
						}
						else if(this.begin.position===this.end.position && this.begin.position==="top"){
							this.begin.x+=offsetX;
							this.offsetY-=offsetY;
							if(this.offsetY<this.minOffset)
								this.offsetY=this.minOffset;
							if(this.begin.x<this.begin.widget.margin)
								this.begin.x=this.begin.widget.margin;
							else if(this.begin.x>this.begin.widget.width-this.begin.widget.margin)
								this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						else if(this.begin.position===this.end.position && this.begin.position==="bottom"){
							this.begin.x+=offsetX;							
							this.offsetY+=offsetY;
							if(this.offsetY<this.minOffset)
								this.offsetY=this.minOffset;
							if(this.begin.x<this.begin.widget.margin)
								this.begin.x=this.begin.widget.margin;
							else if(this.begin.x>this.begin.widget.width-this.begin.widget.margin)
								this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
					}
					else if(this.begin.position==="right"||this.begin.position==="left"){
						if(this.begin.position!=this.end.position){
							this.begin.y+=offsetY;
							this.offsetX+=offsetX;
							if(this.begin.y<this.begin.widget.margin)
								this.begin.y=this.begin.widget.margin;
							else if(this.begin.y>this.begin.widget.height-this.begin.widget.margin)
								this.begin.y=this.begin.widget.height-this.begin.widget.margin;
							if(this.offsetX<this.minOffset)
								this.offsetX=this.minOffset;
							else if(this.offsetX>this.width-this.minOffset)
								this.offsetX=this.width-this.minOffset;
						}
						else if (this.begin.position===this.end.position && this.begin.position==="right"){
							this.offsetX+=offsetX;
							this.begin.y+=offsetY;
							if(this.offsetX<this.minOffset)
								this.offsetX=this.minOffset;
							if(this.begin.y<this.begin.widget.margin)
								this.begin.y=this.begin.widget.margin;
							else if(this.begin.y>this.begin.widget.height-this.begin.widget.margin)
								this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
						else if (this.begin.position===this.end.position && this.begin.position==="left"){
							this.offsetX-=offsetX;	
							this.begin.y+=offsetY;
							if(this.offsetX<this.minOffset)
								this.offsetX=this.minOffset;
							if(this.begin.y<this.begin.widget.margin)
								this.begin.y=this.begin.widget.margin;
							else if(this.begin.y>this.begin.widget.height-this.begin.widget.margin)
								this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
				}
				else if(this.resizer==2){
					if(this.end.position==="top"||this.end.position==="bottom"){
						if(this.begin.position!=this.end.position){
							this.end.x+=offsetX;
							this.offsetY+=offsetY;
							if(this.end.x<this.end.widget.margin)
								this.end.x=this.end.widget.margin;
							else if(this.end.x>this.end.widget.width-this.end.widget.margin)
								this.end.x=this.end.widget.width-this.end.widget.margin;
							if(this.offsetY<this.minOffset)
								this.offsetY=this.minOffset;
							else if(this.offsetY>this.height-this.minOffset)
								this.offsetY=this.height-this.minOffset;	
						}
						else if(this.begin.position===this.end.position && this.begin.position==="top"){
							this.end.x+=offsetX;
							this.offsetY-=offsetY;
							if(this.offsetY<this.minOffset)
								this.offsetY=this.minOffset;
							if(this.end.x<this.end.widget.margin)
								this.end.x=this.end.widget.margin;
							else if(this.end.x>this.end.widget.width-this.end.widget.margin)
								this.end.x=this.end.widget.width-this.end.widget.margin;
						}
						else if(this.begin.position===this.end.position && this.begin.position==="bottom"){
							this.end.x+=offsetX;							
							this.offsetY+=offsetY;
							if(this.offsetY<this.minOffset)
								this.offsetY=this.minOffset;
							if(this.end.x<this.end.widget.margin)
								this.end.x=this.end.widget.margin;
							else if(this.end.x>this.end.widget.width-this.end.widget.margin)
								this.end.x=this.end.widget.width-this.end.widget.margin;
						}
					}
					else if(this.end.position==="right"||this.end.position==="left"){
						if(this.begin.position!=this.end.position){
							this.end.y+=offsetY;
							this.offsetX+=offsetX;
							if(this.end.y<this.end.widget.margin)
								this.end.y=this.end.widget.margin;
							else if(this.end.y>this.end.widget.height-this.end.widget.margin)
								this.end.y=this.end.widget.height-this.end.widget.margin;
							if(this.offsetX<this.minOffset)
								this.offsetX=this.minOffset;
							else if(this.offsetX>this.width-this.minOffset)
								this.offsetX=this.width-this.minOffset;		
						}
						else if (this.begin.position===this.end.position && this.begin.position==="right"){
							this.offsetX+=offsetX;	
							this.end.y+=offsetY;
							if(this.offsetX<this.minOffset)
								this.offsetX=this.minOffset;
							if(this.end.y<this.end.widget.margin)
								this.end.y=this.end.widget.margin;
							else if(this.end.y>this.end.widget.height-this.end.widget.margin)
								this.end.y=this.end.widget.height-this.end.widget.margin;
						}
						else if (this.begin.position===this.end.position && this.begin.position==="left"){
							this.offsetX-=offsetX;	
							this.end.y+=offsetY;
							if(this.offsetX<this.minOffset)
								this.offsetX=this.minOffset;
							if(this.end.y<this.end.widget.margin)
								this.end.y=this.end.widget.margin;
							else if(this.end.y>this.end.widget.height-this.end.widget.margin)
								this.end.y=this.end.widget.height-this.end.widget.margin;
						}
					}
				}
			}
		};
	
		this.paintTo=function(canvas){
			var ctx=canvas.getContext("2d");
			ctx.save();
			ctx.scale(this.scaleX,this.scaleY);
			ctx.globalAlpha = this.alpha;		
			this.setResizers();
			ctx.translate(this.x, this.y);
			ctx.globalCompositeOperation="source-over";
			ctx.rotate(this.rotate / 180 * Math.PI);
			ctx.lineJoin="round";
			ctx.lineCap="round";
		
			if(this.beforePaint)
				this.beforePaint(ctx);
			
			if(this.begin.widget.focus||this.end.widget.focus){
				this.drawImageTo(ctx,true);	
			}
			else
				this.drawImageTo(ctx);	
			if(this.focus){				
				if(this.editable&&!this.autosize)
				  this.drawResizerTo(ctx);
			}
			ctx.restore();
		};
		
		this.drawImageTo = function(ctx,focus){
			focus=focus||false;
			ctx.save();
			ctx.beginPath();
			var dx=0.5;
			if(this.begin.position==="bottom"){
				this.resizers[0].y=	this.resizers[0].y+this.border.width/2;
			}
			else if(this.begin.position==="top"){
				this.resizers[0].y=this.resizers[0].y-this.border.width/2;
			}
			else if(this.begin.position==="left"){
				this.resizers[0].x=this.resizers[0].x-this.border.width/2;
			}
			else if(this.begin.position==="right"){
				this.resizers[0].x=this.resizers[0].x+this.border.width/2;				
			}
			
			var _length=this.resizers.length-1;
			if(this.end.position==="bottom")			
				this.resizers[_length].y=this.resizers[_length].y+this.border.width/2;
			else if(this.end.position==="top")
				this.resizers[_length].y=this.resizers[_length].y-this.border.width/2;
			else if(this.end.position==="left")
				this.resizers[_length].x=this.resizers[_length].x-this.border.width/2;
			else if(this.end.position==="right")
				this.resizers[_length].x=this.resizers[_length].x+this.border.width/2;
			if(!focus){
				ctx.strokeStyle=this.border.color;
				ctx.fillStyle=this.border.color;
				ctx.lineWidth=this.border.width;			
				ctx.lineCap=this.linecap;
				if(this.border.type!="solid"){
					var dashList =this.border.type==="dashed"?[this.border.width+5, this.border.width+2]:[this.border.width+2,this.border.width+2]; 
					ctx.setLineDash(dashList);
				};
			}
			else{
				ctx.strokeStyle=this.dashColor;
				ctx.fillStyle=this.dashColor;
				ctx.lineWidth=this.border.width;
				ctx.lineCap=this.linecap;
				if(!this.editable){
					var dashList =[this.border.width+4, this.border.width+7]; 
					ctx.setLineDash(dashList);
					ctx.lineDashOffset = -this.dashOffset;					
				}
				else
					ctx.lineWidth=this.border.width+1;
				
			}
			ctx.moveTo(parseInt(this.resizers[0].x)+dx,parseInt(this.resizers[0].y)+dx);		
			
			for(var i=1;i<this.resizers.length;i++){
				ctx.lineTo(parseInt(this.resizers[i].x)+dx,parseInt(this.resizers[i].y)+dx);
			}				
			ctx.stroke();
			
			if(this.begin.shape.name==="arrow"){
				$.drawArrow(ctx,this.resizers[1],this.resizers[0],this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});				
			}	
			else if(this.begin.shape.name==="diamond"){
				$.drawDiamond(ctx,this.resizers[1],this.resizers[0],this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});				
			}	
			else if(this.begin.shape.name==="dot")
			{
				ctx.beginPath();
				ctx.arc(this.resizers[0].x,this.resizers[0].y,this.begin.shape.radius,0,2*Math.PI);
				ctx.stroke();
				if(this.begin.shape.type===2)
				  ctx.fill();
				else if(this.begin.shape.type===3){
					ctx.fillStyle="white";
					ctx.fill();
					ctx.fillStyle=this.border.color;
				}
			}
			
			//ctx.fillStyle=this.border.color;
			if(this.end.shape.name==="arrow"){
				if(this.resizers.length===2)
					$.drawArrow(ctx,this.resizers[0],this.resizers[1],this.end.shape.type,{size:this.end.shape.size,shape:this.end.shape.sharp});
				else if(this.resizers.length===3)
					$.drawArrow(ctx,this.resizers[1],this.resizers[2],this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
				else if(this.resizers.length===4)
					$.drawArrow(ctx,this.resizers[2],this.resizers[3],this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
				
			}
			else if(this.end.shape.name==="diamond"){
				if(this.resizers.length===2)
					$.drawDiamond(ctx,this.resizers[0],this.resizers[1],this.end.shape.type,{size:this.end.shape.size,shape:this.end.shape.sharp});
				else if(this.resizers.length===3)
					$.drawDiamond(ctx,this.resizers[1],this.resizers[2],this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
				else if(this.resizers.length===4)
					$.drawDiamond(ctx,this.resizers[2],this.resizers[3],this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
			}	
			else if(this.end.shape.name==="dot")
			{
				ctx.beginPath();
				ctx.arc(this.ep.x,this.ep.y,this.end.shape.radius,0,2*Math.PI);
				ctx.stroke();
				if(this.end.shape.type===2)
				  ctx.fill();
				else if(this.end.shape.type===3){
					ctx.fillStyle="white";
					ctx.fill();
				}
			}
			ctx.restore();
			return this;
		};
	
		return this;
	};
	
	lineConnector=function(option){
		var opt={
				name:"lineConnector",
				width:150,
				height:30,
				text:"lineConnector",
				linecap:"square"
					
		};
		$.extend(opt,option);		
		$.extend(this,new _connector(opt));
		this.propertyEditors=["common","border","arrow"];
		this.begin=new endpoint(option.begin);
		this.end=new endpoint(option.end);
		this.type="lineConnector";		
         
        this.checkPointIn =function(x, y,scale) {
     		if(this.root!=null)
     			scale=scale||this.root.scale;
     		if(!scale)
     			scale=1;
     		var _xc = this.relativePoint(x, y,scale);
     		var x2 = _xc.x;
     		var y2 = _xc.y;
     		var result=math.isPointOnLine(x2,y2,this.sp.x*scale,this.sp.y*scale,this.ep.x*scale,this.ep.y*scale);
     		return result;
         };
         
		this.setResizers=function(){
			var sp={
					x:this.begin.x+this.begin.widget.x,
					y:this.begin.y+this.begin.widget.y,
			},
			ep={
					x:this.end.x+this.end.widget.x,
					y:this.end.y+this.end.widget.y
			};
			if(this.begin.position=="top"){
				sp.y=this.begin.widget.y;
			}
			else if(this.begin.position=="bottom"){
				sp.y=this.begin.widget.y+this.begin.widget.height;
			}
			else if(this.begin.position=="left"){
				sp.x=this.begin.widget.x;
			}
			else if(this.begin.position=="right"){
				sp.x=this.begin.widget.x+this.begin.widget.width;
			}
			if(this.begin.widget.x+this.begin.widget.width<this.end.widget.x){			
				if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y)
				{
//					if(this.begin.position!="right"){
//						sp.y=this.begin.widget.y+this.begin.widget.height;
////						this.begin.position="bottom";
//					}
//					else{
//						sp.x=this.begin.widget.x+this.begin.widget.width;
//					}
					if(this.end.position!="top"){
						ep.x=this.end.widget.x+this.end.offsetx;
						this.end.position="left";
					}
					else{
						ep.y=this.end.widget.y+this.end.offsety;
					}
				}
				else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
//					if(this.begin.position!="right"){
//						sp.y=this.begin.widget.y;
////						this.begin.position="top";
//					}
//					else{
//						sp.x=this.begin.widget.x+this.begin.widget.width;
//					}
					if(this.end.position!="left"){
						ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
						this.end.position="bottom";
					}
					else{
						ep.x=this.end.widget.x+this.end.offsetx;
					}
				}
				else{
					sp.x=this.begin.widget.x+this.begin.widget.width;
//					this.begin.position="right";
					ep.x=this.end.widget.x+this.end.offsetx;
					this.end.position="left";
				}
			}
			else if(this.end.widget.x+this.end.widget.width<this.begin.widget.x){
				if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y)
				{
//					if(this.begin.position!="left"){
//						sp.y=this.begin.widget.y+this.begin.widget.height;
////						this.begin.position="bottom";
//					}
//					else{
//						sp.x=this.begin.widget.x;
//					}
					if(this.end.position!="top"){
						ep.x=this.end.widget.x+this.end.widget.width;
						this.end.position="right";
					}
					else{
						ep.y=this.end.widget.y+this.end.offsety;
					}
				}
				else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
//					if(this.begin.position!="left"){
//						sp.y=this.begin.widget.y;
////						this.begin.position="top";
//					}
//					else{
//						sp.x=this.begin.widget.x;
//					}
					if(this.end.position!="right"){
						ep.y=this.end.widget.y+this.end.widget.height-this.end.offsety;
						this.end.position="bottom";
					}
					else{
						ep.x=this.end.widget.x+this.end.widget.width;
					}
				}
//				else{
//					sp.x=this.begin.widget.x;
////					this.begin.position="left";
//					ep.x=this.end.widget.x+this.end.widget.width;
//					this.end.position="right";
//				}
			}
			else{
				if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
//					sp.y=this.begin.widget.y+this.begin.widget.height;
//					this.begin.position="bottom";
					ep.y=this.end.widget.y+this.end.offsety;
					this.end.position="top";			
				}
				else{
//					sp.y=this.begin.widget.y;
//					this.begin.position="top";
					ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
					this.end.position="bottom";
				}
			}
			var point1={
					x:sp.x-this.x,
					y:sp.y-this.y,
					cursor:"move",
					visible:true
			},
			point2={
					x:ep.x-this.x,
					y:ep.y-this.y,
					cursor:"move",
					visible:true
			};
			this.x=Math.min(sp.x,ep.x);
			this.y=Math.min(sp.y,ep.y);
			this.width=Math.abs(ep.x-sp.x);
			this.height=Math.abs(ep.y-sp.y);
			this.sp=point1;
			this.ep=point2;
			this.resizers=[point1,point2];
		};
		this.resize=function(e){
			var offsetX=e.offset.x;
			var offsetY=e.offset.y;
			this.resizer=e.resizer-1;
			if(this.resizer==0){
				this.begin.x+=offsetX;
				this.begin.y+=offsetY;
				if(this.begin.widget.x+this.begin.widget.width<this.end.widget.x){
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
						
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.position="right";
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0)
							this.begin.y=this.begin.widget.margin;
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.position="bottom";
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.position="right";
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.position="top";
							this.begin.y=this.begin.widget.margin;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
					else{
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.y=this.begin.widget.margin;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
						
					}
				}
				
				else if(this.end.widget.x+this.end.widget.width<this.begin.widget.x){
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;	
						    this.begin.position="left";
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0)
							this.begin.y=this.begin.widget.margin;
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.position="bottom";
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
						
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;	
						    this.begin.position="left";
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.y=this.begin.widget.margin;
							this.begin.position="top";
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
					else{
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.y=this.begin.widget.margin;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
				}
				else{
					if(this.begin.x<0){
					    this.begin.x=this.begin.widget.margin;					
					}
					else if(this.begin.x>this.begin.widget.width){
						this.begin.x=this.begin.widget.width-this.begin.widget.margin;
					}
					if(this.begin.y<0){
						this.begin.y=this.begin.widget.margin;
					}
					else if(this.begin.y>this.begin.widget.height)
					{
						this.begin.y=this.begin.widget.height-this.begin.widget.margin;
					}
				}
//				if(this.begin.x<0){
//					    this.begin.x=this.begin.widget.margin;					
//				}
//				else if(this.begin.x>this.begin.widget.width)
//					this.begin.x=this.begin.widget.width-this.begin.widget.margin;
//				if(this.begin.y<0)
//					this.begin.y=this.begin.widget.margin;
//				else if(this.begin.y>this.begin.widget.height)
//					this.begin.y=this.begin.widget.height-this.begin.widget.margin;
			}
			else if(this.resizer==this.resizers.length-1){
				this.end.x+=offsetX;
				this.end.y+=offsetY;
				if(this.begin.widget.x+this.begin.widget.width<this.end.widget.x){
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
						if(this.end.x<this.end.widget.margin){
							this.end.x=this.end.widget.margin;
							this.end.position="left";
						}
						else if(this.end.x>this.end.widget.width-this.end.widget.margin)
							this.end.x=this.end.widget.width-this.end.widget.margin;
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
							this.end.position="top";
						}
						else if(this.end.y>this.end.widget.height)
							this.end.y=this.end.widget.height-this.end.widget.margin;
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
						if(this.end.x<this.end.widget.margin){
							this.end.x=this.end.widget.margin;
							this.end.position="left";
						}
						else if(this.end.x>this.end.widget.width-this.end.widget.margin)
							this.end.x=this.end.widget.width-this.end.widget.margin;							
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
						}
						else if(this.end.y>this.end.widget.height){
							this.end.y=this.end.widget.height-this.end.widget.margin;
							this.end.position="bottom";
						}
					}
					else{
						if(this.end.x<this.end.widget.margin)
							this.end.x=this.end.widget.margin;
						else if(this.end.x>this.end.widget.width-this.end.widget.margin)
							this.end.x=this.end.widget.width-this.end.widget.margin;
						if(this.end.y<0)
							this.end.y=this.end.widget.margin;
						else if(this.end.y>this.end.widget.height)
							this.end.y=this.end.widget.height-this.end.widget.margin;
						
					}
				}
				
				else if(this.end.widget.x+this.end.widget.width<this.begin.widget.x){
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
						if(this.end.x<this.end.widget.margin){
							this.end.x=this.end.widget.margin;
						}
						else if(this.end.x>this.end.widget.width-this.end.widget.margin){
							this.end.x=this.end.widget.width-this.end.widget.margin;
							this.end.position="right";
						}
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
							this.end.position="top";
						}
						else if(this.end.y>this.end.widget.height){
							this.end.y=this.end.widget.height-this.end.widget.margin;
						}
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
						if(this.end.x<this.end.widget.margin){
							this.end.x=this.end.widget.margin;
						}
						else if(this.end.x>this.end.widget.width-this.end.widget.margin){
							this.end.x=this.end.widget.width-this.end.widget.margin;
							this.end.position="right";
						}
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
						}
						else if(this.end.y>this.end.widget.height){
							this.end.y=this.end.widget.height-this.end.widget.margin;
							this.end.position="bottom";
						}
					}
					else{
						if(this.end.x<this.end.widget.margin)
							this.end.x=this.end.widget.margin;
						else if(this.end.x>this.end.widget.width-this.end.widget.margin)
							this.end.x=this.end.widget.width-this.end.widget.margin;
						if(this.end.y<0)
							this.end.y=this.end.widget.margin;
						else if(this.end.y>this.end.widget.height)
							this.end.y=this.end.widget.height-this.end.widget.margin;
						
					}
				}
				else{
					if(this.end.x<this.end.widget.margin)
						this.end.x=this.end.widget.margin;
					else if(this.end.x>this.end.widget.width-this.end.widget.margin)
						this.end.x=this.end.widget.width-this.end.widget.margin;
					if(this.end.y<0)
						this.end.y=this.end.widget.margin;
					else if(this.end.y>this.end.widget.height)
						this.end.y=this.end.widget.height-this.end.widget.margin;
				}
			}			
		};
		this.paintTo=function(canvas){
			var ctx=canvas.getContext("2d");
			ctx.save();
			ctx.scale(this.scaleX,this.scaleY);
			ctx.globalAlpha = this.alpha;			
			ctx.translate(this.x, this.y);
			ctx.rotate(this.rotate / 180 * Math.PI);
			this.setResizers();
			this.drawImageTo(ctx);	
			
			if(this.begin.widget.focus||this.end.widget.focus){
				this.drawImageTo(ctx,true);	
			}
			if(this.focus){
				if(this.editable&&!this.autosize)
				  this.drawResizerTo(ctx);
			}
			ctx.restore();
		};
		this.drawImageTo = function(ctx,focus){
			var sp=this.sp;
			var ep=this.ep;
			ctx.save();
			var dx=0.5;
			ctx.beginPath(); 
			if(!focus){
				ctx.strokeStyle=this.border.color;
				ctx.fillStyle=this.border.color;
				ctx.lineWidth=this.border.width;
				ctx.lineCap=this.linecap;
				if(this.border.type!="solid"){
					var dashList =this.border.type==="dashed"?[this.border.width+5, this.border.width+2]:[this.border.width+2,this.border.width+2]; 
					ctx.setLineDash(dashList);
				}
			}
			else{
				ctx.strokeStyle=this.dashColor;
				ctx.fillStyle=this.dashColor;
				ctx.lineWidth=this.border.width+1;
				ctx.lineCap=this.linecap;
				var dashList =[this.border.width+4, this.border.width+7]; 
				ctx.setLineDash(dashList);
				ctx.lineDashOffset = -this.dashOffset;				
			}
			ctx.moveTo(this.resizers[0].x+dx,this.resizers[0].y+dx);
			for(var i=1;i<this.resizers.length;i++)
				ctx.lineTo(this.resizers[i].x+dx,this.resizers[i].y+dx);
			ctx.lineTo(ep.x+dx,ep.y+dx);				
			ctx.stroke();
			
//			if(this.begin.border.color!="none"){
//				ctx.strokeStyle=this.begin.border.color;
//			}
//			if(this.begin.background.color!="none"){
//				ctx.fillStyle=this.begin.background.color;
//			}
			if(this.begin.shape.name==="arrow")
		    	$.drawArrow(ctx,ep,sp,this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});
			else if(this.begin.shape.name==="diamond"){
				$.drawDiamond(ctx,ep,sp,this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});				
			}
			else if(this.begin.shape.name==="dot")
			{
				ctx.beginPath();
				ctx.arc(sp.x,sp.y,this.begin.shape.radius,0,2*Math.PI);
				ctx.stroke();
				if(this.begin.shape.type===2)
				  ctx.fill();
				else if(this.begin.shape.type===3){
					ctx.fillStyle="white";
					ctx.fill();
					ctx.fillStyle=this.border.color;
				}
			}
			
//			if(this.end.border.color!="none"){
//				ctx.strokeStyle=this.end.border.color;
//			}
//			if(this.end.background.color!="none"){
//				ctx.fillStyle=this.end.background.color;
//			}
			
			if(this.end.shape.name==="arrow")
		    	$.drawArrow(ctx,sp,ep,this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
			else if(this.end.shape.name==="diamond")
		    	$.drawDiamond(ctx,sp,ep,this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
			else if(this.end.shape.name==="dot")
			{
				ctx.beginPath();
				ctx.arc(ep.x,ep.y,this.end.shape.radius,0,2*Math.PI);
				ctx.stroke();
				if(this.end.shape.type===2)
				  ctx.fill();
				else if(this.end.shape.type===3){
					ctx.fillStyle="white";
					ctx.fill();
				}
			}
			ctx.restore();
			return this;
		};
		return this;
	};
	
	quadraticCurveConnector=function(option){
		var opt={
				name:"quadraticCurveConnector",
				width:150,
				height:30,
				text:"quadraticCurveConnector"				
		};
		$.extend(opt,option);		
		$.extend(this,new _connector(opt));
		this.propertyEditors=["common","border","arrow"];
		this.begin=new endpoint(option.begin);
		this.end=new endpoint(option.end);
		this.offsetX=0;
		this.offsetY=0;
		var _offsetX=this.offsetX;
		var _offsetY=this.offsetY;
		this.type="quadraticCurveConnector";	
		this.persist=function(){
			var r=widget.persistproperty(this);
			r.offsetX=this.offsetX;
			r.offsetY=this.offsetY;
			r.linecap=this.linecap;
			r.minOffset=this.minOffset;
			r.begin=this.begin.persist();
			r.end=this.end.persist();
			r.begin.position=this.begin.position;
			r.end.position=this.end.position;
			return r;
		};
		
		 this.checkPointIn =function(x, y,scale) {
	     		if(this.root!=null)
	     			scale=scale||this.root.scale;
	     		if(!scale)
	     			scale=1;
	     		var _xc = this.relativePoint(x, y,scale);
	     		var x2 = _xc.x;
	     		var y2 = _xc.y;
	     		var result=false;
	     		for(var i=0;i<this.resizers.length-1;i++){
	     			result=math.isPointOnLine(x2,y2,this.resizers[i].x*scale,this.resizers[i].y*scale,this.resizers[i+1].x*scale,this.resizers[i+1].y*scale);
	     			if(result==true)
	     				return true;
				}
	     		return false;
	         };
	         
		this.setResizers=function(){
			var sp={
					x:this.begin.x+this.begin.widget.x,
					y:this.begin.y+this.begin.widget.y,
			},
			ep={
					x:this.end.x+this.end.widget.x,
					y:this.end.y+this.end.widget.y
			};
			
			if(this.begin.position=="top"){
				sp.y=this.begin.widget.y;
			}
			else if(this.begin.position=="bottom"){
				sp.y=this.begin.widget.y+this.begin.widget.height;
			}
			else if(this.begin.position=="left"){
				sp.x=this.begin.widget.x;
			}
			else if(this.begin.position=="right"){
				sp.x=this.begin.widget.x+this.begin.widget.width;
			}
			
			if(this.begin.widget.x+this.begin.widget.width<this.end.widget.x){	
				var dx=(this.end.widget.x-this.begin.widget.x+this.begin.widget.width)/2;
				if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y)
				{					
					var dy=(this.end.widget.y-this.begin.widget.y+this.begin.widget.height)/2;
					if(this.begin.position=="right"){
						_offsetX=this.begin.widget.x+this.offsetX-this.x+dx;
						_offsetY=this.begin.widget.y-this.y+this.begin.widget.height/2+this.offsetY;
						if(this.end.position!="left"){
							ep.y=this.end.widget.y+this.end.offsety;
							this.end.position="top";
						}
						else						
							ep.x=this.end.widget.x+this.end.offsetx;
					}
					else if(this.begin.position=="bottom"){
						_offsetX=this.begin.widget.x+this.offsetX+this.begin.widget.width/2-this.x;
						_offsetY=this.begin.widget.y-this.y+dy+this.offsetY;
						if(this.end.position!="top"){
							ep.x=this.end.widget.x+this.end.offsetx;
							this.end.position="left";
						}
						else
							ep.y=this.end.widget.y+this.end.offsety;
							
					}
					else if(this.begin.position=="top"){
						_offsetX=this.begin.widget.x+this.offsetX+dx-this.x;
						_offsetY=this.begin.widget.y-this.y-dy+this.offsetY;
						if(this.end.position!="left"){
							ep.y=this.end.widget.y+this.end.offsety;
							this.end.position="top";
						}
						else
							ep.x=this.end.widget.x+this.end.offsetx;
						
					}
					else if(this.begin.position=="left"){
						_offsetX=this.begin.widget.x+this.offsetX-dx-this.x;
						_offsetY=this.begin.widget.y+dy+this.offsetY-this.y;
						if(this.end.position!="top"){
							ep.x=this.end.widget.x+this.end.offsetx;
							this.end.position="left";
						}
						else
							ep.y=this.end.widget.y+this.end.offsety;
					}
				}
				else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
					var dy=(this.begin.widget.y-this.end.widget.y-this.end.widget.height)/2;
					if(this.begin.position=="right"){
						_offsetX=this.begin.widget.x+this.offsetX-this.x+dx;
						_offsetY=this.begin.widget.y-this.y+this.begin.widget.height/2+this.offsetY;
						if(this.end.position!="left"){
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
							this.end.position="bottom";
						}
						else
							ep.x=this.end.widget.x+this.end.offsetx;
					}
					else if(this.begin.position=="top"){//top
						_offsetX=this.begin.widget.x+this.offsetX-this.x+this.begin.widget.width/2;
						_offsetY=this.begin.widget.y-this.y+this.offsetY-dy;
						if(this.end.position!="bottom"){
							ep.x=this.end.widget.x+this.end.offsetx;
							this.end.position="left";
						}
						else
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
					}
					else if(this.begin.position=="left"){//top
						_offsetX=this.begin.widget.x-dx+this.offsetX-this.x;
						_offsetY=this.begin.widget.y-dy+this.offsetY-this.y;
						if(this.end.position!="bottom"){
							ep.x=this.end.widget.x+this.end.offsetx;
							this.end.position="left";
						}
						else
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
					}
					else if(this.begin.position=="bottom"){//top
						_offsetX=this.begin.widget.x+dx+this.offsetX-this.x;
						_offsetY=this.begin.widget.y+this.begin.widget.height+dy+this.offsetY-this.y;
						if(this.end.position!="left"){
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
							this.end.position="bottom";
						}
						else
							ep.x=this.end.widget.x+this.end.offsetx;
					}
				}
				else{
					_offsetX=this.begin.widget.x-this.x+dx+this.offsetX;
					if(this.begin.position=="right"){
						sp.x=this.begin.widget.x+this.begin.widget.width;					
						ep.x=this.end.widget.x+this.end.offsetx;
						this.end.position="left";
						_offsetY=this.begin.widget.y-this.y-dx/4+this.offsetY;
					}
					else{
						this.end.position=this.begin.position;
						if(this.begin.position=="top"){
							_offsetY=this.begin.widget.y-this.y-dx/4+this.offsetY;
							ep.y=this.end.widget.y+this.end.offsety;
						}
						else if(this.begin.position=="bottom"){
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
							_offsetY=this.begin.widget.y+this.begin.widget.height-this.y+dx/4+this.offsetY;
						}
					}
				}
			}
			else if(this.end.widget.x+this.end.widget.width<this.begin.widget.x){
				var dx=(this.begin.widget.x-this.end.widget.x+this.end.widget.width)/2;
				if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
					var dy=(this.end.widget.y-this.begin.widget.y+this.begin.widget.height)/2;
					if(this.begin.position=="bottom"){
						_offsetX=this.begin.widget.x+(this.begin.widget.width)/2+this.offsetX-this.x;
						_offsetY=this.begin.widget.y+dy+this.offsetY-this.y;
						if(this.end.position!="top"){
							ep.x=this.end.widget.x+this.end.widget.width;
							this.end.position="right";
						}
						else
							ep.y=this.end.widget.y+this.end.offsety;
					}
					else if(this.begin.position=="left"){
						_offsetX=this.begin.widget.x-dx+this.offsetX-this.x;
						_offsetY=this.begin.widget.y+this.begin.widget.height/2+this.offsetY-this.y;
						if(this.end.position!="right"){
							ep.y=this.end.widget.y+this.end.offsety;
							this.end.position="top";
						}
						else
							ep.x=this.end.widget.x+this.end.widget.width;
					}
					else if(this.begin.position=="top"){
						_offsetX=this.begin.widget.x-dx+this.offsetX-this.x;
						_offsetY=this.begin.widget.y-dy+this.offsetY-this.y;
						if(this.end.position!="right"){
							ep.y=this.end.widget.y+this.end.offsety;
							this.end.position="top";
						}
						else
							ep.x=this.end.widget.x+this.end.widget.width;
					}
					else if(this.begin.position=="right"){
						_offsetX=this.begin.widget.x+dx+this.offsetX-this.x;
						_offsetY=this.begin.widget.y+dy+this.offsetY-this.y;
						if(this.end.position!="top"){
							ep.x=this.end.widget.x+this.end.widget.width;
							this.end.position="right";
						}
						else
							ep.y=this.end.widget.y+this.end.offsety;
					}
										
				}
				else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
					var dy=(this.begin.widget.y-this.end.widget.y+this.end.widget.height)/2;
					if(this.begin.position=="top"){
						_offsetX=this.begin.widget.x+this.begin.widget.width/2+this.offsetX-this.x;
						_offsetY=this.end.widget.y+dy+this.offsetY-this.y;
						if(this.end.position!="bottom"){
							ep.x=this.end.widget.x+this.end.widget.width;
							this.end.position="right";
						}
						else
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
					}
					else if(this.begin.position=="left"){//left
						_offsetX=this.begin.widget.x-dx+this.offsetX-this.x;
						_offsetY=this.begin.widget.y+this.offsetY-this.y;
						if(this.end.position!="right"){
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
							this.end.position="bottom";
						}
						else
							ep.x=this.end.widget.x+this.end.widget.width;
					}
					else if(this.begin.position=="bottom"){
						_offsetX=this.begin.widget.x-dx+this.offsetX-this.x;
						_offsetY=this.begin.widget.y+dy+this.offsetY-this.y;
						if(this.end.position!="right"){
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
							this.end.position="bottom";
						}
						else
							ep.x=this.end.widget.x+this.end.widget.width;
					}
					else if(this.begin.position=="right"){
						_offsetX=this.begin.widget.x+this.begin.widget.width+dx+this.offsetX-this.x;
						_offsetY=this.begin.widget.y-dy+this.offsetY-this.y;
						if(this.end.position!="bottom"){
							ep.x=this.end.widget.x+this.end.widget.width;
							this.end.position="right";
						}
						else
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
							
					}
				}
				else{
					_offsetX=this.begin.widget.x-(this.begin.widget.x-this.end.widget.x+this.end.widget.width)/2+this.offsetY-this.y;
					if(this.begin.position=="left"){
						ep.x=this.end.widget.x+this.end.widget.width;
						this.end.position="right";
						_offsetY=this.end.widget.y+this.offsetY-this.y;
					}
					else{
						this.end.position=this.begin.position;
						if(this.end.position=="top"){
							ep.y=this.end.widget.y+this.end.offsety;							
							_offsetY=this.end.widget.y-this.end.widget.height+this.offsetY-this.y;
						}
						else{
							ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
							_offsetY=this.end.widget.y+2*this.end.widget.height+this.offsetY-this.y;
						}
					}
					
				}
			}
			else{
				if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
					var dy=(this.end.widget.y-this.begin.widget.y+this.begin.widget.height)/2;
					if(this.begin.position=="bottom"){
						this.end.position="top";
						ep.y=this.end.widget.y+this.end.offsety;
						_offsetX=this.begin.widget.x+this.offsetX-this.x;
						_offsetY=this.end.widget.y-dy+this.offsetY-this.y;
					}
					else{
						this.end.position=this.begin.position;
						if(this.begin.position=="left"){
							ep.x=this.end.widget.x+this.end.offsetx;
							_offsetX=this.begin.widget.x-dy/3+this.offsetX-this.x;
							_offsetY=this.end.widget.y-dy+this.offsetY-this.y;
						}
						else if(this.begin.position=="right"){
							ep.x=this.end.widget.x+this.end.widget.width;
							_offsetX=this.begin.widget.x+this.begin.widget.width+dy/3+this.offsetX-this.x;
							_offsetY=this.end.widget.y-dy+this.offsetY-this.y;
						}
					}
				}
				else{	
					var dy=(this.begin.widget.y-this.end.widget.y+this.end.widget.height)/2;
					if(this.begin.position=="top"){
						this.end.position="bottom";
						ep.y=this.end.widget.y+this.end.widget.height+this.end.offsety;
						_offsetX=this.begin.widget.x+this.offsetX-this.x;
						_offsetY=this.end.widget.y+dy+this.offsetY-this.y;
					}
					else{
						this.end.position=this.begin.position;
						if(this.end.position=="left"){
							ep.x=this.end.widget.x+this.end.offsetx;
							_offsetX=this.begin.widget.x-dy/3+this.offsetX-this.x;
							_offsetY=this.begin.widget.y-this.y-dy+this.offsetY;
						}
						else if(this.end.position=="right"){
							ep.x=this.end.widget.x+this.end.widget.width;
							_offsetX=this.begin.widget.x+this.begin.widget.width+dy/3+this.offsetX-this.x;
							_offsetY=this.begin.widget.y-dy+this.offsetY-this.y;
						}
					}					
				}
			}
			var point1={
					x:sp.x-this.x,
					y:sp.y-this.y,
					cursor:"move",
					visible:true
			},
			point2={
					x:ep.x-this.x,
					y:ep.y-this.y,
					cursor:"move",
					visible:true
			};
			this.x=Math.min(sp.x,ep.x);
			this.y=Math.min(sp.y,ep.y);
			this.width=Math.abs(ep.x-sp.x);
			this.height=Math.abs(ep.y-sp.y);
			this.sp=point1;
			this.ep=point2;
			var point3={
					x:_offsetX,
					y:_offsetY,
					visible:true
			};
			this.resizers=[point1,point3,point2];
		};
		this.resize=function(e){
			var offsetX=e.offset.x;
			var offsetY=e.offset.y;
			this.resizer=e.resizer-1;
			if(this.resizer==0){
				this.begin.x+=offsetX;
				this.begin.y+=offsetY;
				if(this.begin.widget.x+this.begin.widget.width<this.end.widget.x){
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
						
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.position="right";
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0)
							this.begin.y=this.begin.widget.margin;
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.position="bottom";
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.position="right";
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.position="top";
							this.begin.y=this.begin.widget.margin;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
					else{
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.y=this.begin.widget.margin;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
						
					}
				}
				
				else if(this.end.widget.x+this.end.widget.width<this.begin.widget.x){
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;	
						    this.begin.position="left";
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0)
							this.begin.y=this.begin.widget.margin;
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.position="bottom";
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
						
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;	
						    this.begin.position="left";
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.y=this.begin.widget.margin;
							this.begin.position="top";
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
					else{
						if(this.begin.x<0){
						    this.begin.x=this.begin.widget.margin;					
						}
						else if(this.begin.x>this.begin.widget.width){
							this.begin.x=this.begin.widget.width-this.begin.widget.margin;
						}
						if(this.begin.y<0){
							this.begin.y=this.begin.widget.margin;
						}
						else if(this.begin.y>this.begin.widget.height)
						{
							this.begin.y=this.begin.widget.height-this.begin.widget.margin;
						}
					}
				}
				else{
					if(this.begin.x<0){
					    this.begin.x=this.begin.widget.margin;					
					}
					else if(this.begin.x>this.begin.widget.width){
						this.begin.x=this.begin.widget.width-this.begin.widget.margin;
					}
					if(this.begin.y<0){
						this.begin.y=this.begin.widget.margin;
					}
					else if(this.begin.y>this.begin.widget.height)
					{
						this.begin.y=this.begin.widget.height-this.begin.widget.margin;
					}
				}
			}
			else if(this.resizer==this.resizers.length-1){
				this.end.x+=offsetX;
				this.end.y+=offsetY;
				if(this.begin.widget.x+this.begin.widget.width<this.end.widget.x){
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
						if(this.end.x<this.end.widget.margin){
							this.end.x=this.end.widget.margin;
							this.end.position="left";
						}
						else if(this.end.x>this.end.widget.width-this.end.widget.margin)
							this.end.x=this.end.widget.width-this.end.widget.margin;
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
							this.end.position="top";
						}
						else if(this.end.y>this.end.widget.height)
							this.end.y=this.end.widget.height-this.end.widget.margin;
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
						if(this.end.x<this.end.widget.margin){
							this.end.x=this.end.widget.margin;
							this.end.position="left";
						}
						else if(this.end.x>this.end.widget.width-this.end.widget.margin)
							this.end.x=this.end.widget.width-this.end.widget.margin;							
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
						}
						else if(this.end.y>this.end.widget.height){
							this.end.y=this.end.widget.height-this.end.widget.margin;
							this.end.position="bottom";
						}
					}
					else{
						if(this.end.x<this.end.widget.margin)
							this.end.x=this.end.widget.margin;
						else if(this.end.x>this.end.widget.width-this.end.widget.margin)
							this.end.x=this.end.widget.width-this.end.widget.margin;
						if(this.end.y<0)
							this.end.y=this.end.widget.margin;
						else if(this.end.y>this.end.widget.height)
							this.end.y=this.end.widget.height-this.end.widget.margin;
						
					}
				}
				
				else if(this.end.widget.x+this.end.widget.width<this.begin.widget.x){
					if(this.begin.widget.y+this.begin.widget.height<this.end.widget.y){
						if(this.end.x<this.end.widget.margin){
							this.end.x=this.end.widget.margin;
						}
						else if(this.end.x>this.end.widget.width-this.end.widget.margin){
							this.end.x=this.end.widget.width-this.end.widget.margin;
							this.end.position="right";
						}
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
							this.end.position="top";
						}
						else if(this.end.y>this.end.widget.height){
							this.end.y=this.end.widget.height-this.end.widget.margin;
						}
					}
					else if(this.end.widget.y+this.end.widget.height<this.begin.widget.y){
						if(this.end.x<this.end.widget.margin){
							this.end.x=this.end.widget.margin;
						}
						else if(this.end.x>this.end.widget.width-this.end.widget.margin){
							this.end.x=this.end.widget.width-this.end.widget.margin;
							this.end.position="right";
						}
						if(this.end.y<0){
							this.end.y=this.end.widget.margin;
						}
						else if(this.end.y>this.end.widget.height){
							this.end.y=this.end.widget.height-this.end.widget.margin;
							this.end.position="bottom";
						}
					}
					else{
						if(this.end.x<this.end.widget.margin)
							this.end.x=this.end.widget.margin;
						else if(this.end.x>this.end.widget.width-this.end.widget.margin)
							this.end.x=this.end.widget.width-this.end.widget.margin;
						if(this.end.y<0)
							this.end.y=this.end.widget.margin;
						else if(this.end.y>this.end.widget.height)
							this.end.y=this.end.widget.height-this.end.widget.margin;
						
					}
				}
				else{
					if(this.end.x<this.end.widget.margin)
						this.end.x=this.end.widget.margin;
					else if(this.end.x>this.end.widget.width-this.end.widget.margin)
						this.end.x=this.end.widget.width-this.end.widget.margin;
					if(this.end.y<0)
						this.end.y=this.end.widget.margin;
					else if(this.end.y>this.end.widget.height)
						this.end.y=this.end.widget.height-this.end.widget.margin;
				}
			}
			else{
				if(this.resizer==1){
						this.offsetX+=offsetX;
						this.offsetY+=offsetY;		
				}
			}
		};
		
		this.paintTo=function(canvas){
			var ctx=canvas.getContext("2d");
			ctx.save();
			ctx.scale(this.scaleX,this.scaleY);
			ctx.globalAlpha = this.alpha;			
			ctx.translate(this.x, this.y);
			ctx.rotate(this.rotate / 180 * Math.PI);
			this.setResizers();
			this.drawImageTo(ctx);	
			if(this.begin.widget.focus||this.end.widget.focus){
				this.drawImageTo(ctx,true);	
			}
			if(this.focus){
				if(this.editable&&!this.autosize)
				  this.drawResizerTo(ctx);
			}
			ctx.restore();
		};
		this.drawImageTo = function(ctx,focus){
			var sp=this.sp;
			var ep=this.ep;
			ctx.save();
			var dx=0.5;
			ctx.beginPath(); 
			if(!focus){
				ctx.strokeStyle=this.border.color;
				ctx.lineWidth=this.border.width;
				ctx.fillStyle=this.border.color;
				ctx.lineCap=this.linecap;
				if(this.border.type!="solid"){
					var dashList =this.border.type==="dashed"?[this.border.width+5, this.border.width+2]:[this.border.width+2,this.border.width+2]; 
					ctx.setLineDash(dashList);
				}
			}
			else{
				ctx.strokeStyle=this.dashColor;
				ctx.fillStyle=this.dashColor;
				ctx.lineWidth=this.border.width+1;
				ctx.lineCap=this.linecap;
				var dashList =[this.border.width+4, this.border.width+7]; 
				ctx.setLineDash(dashList);
				ctx.lineDashOffset = -this.dashOffset;				
			}
			ctx.moveTo(this.resizers[0].x+dx,this.resizers[0].y+dx);
			if(this.resizers.length===2){
				ctx.lineTo(ep.x+dx+dx,ep.y+dx+dx);	
			}
			else{
				ctx.quadraticCurveTo(this.resizers[1].x+dx,this.resizers[1].y+dx,this.resizers[2].x+dx,this.resizers[2].y+dx);
			}
			ctx.stroke();
			
			if(this.begin.shape.name==="arrow")
		    	$.drawArrow(ctx,this.resizers[1],this.resizers[0],this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});
			else if(this.begin.shape.name==="diamond")
		    	$.drawDiamond(ctx,this.resizers[1],this.resizers[0],this.begin.shape.type,{size:this.begin.shape.size,sharp:this.begin.shape.sharp});
			else if(this.begin.shape.name==="dot")
			{
				ctx.beginPath();
				ctx.arc(sp.x,sp.y,this.begin.shape.radius,0,2*Math.PI);
				ctx.stroke();
				if(this.begin.shape.type===2)
				  ctx.fill();
				else if(this.begin.shape.type===3){
					ctx.fillStyle="white";
					ctx.fill();
					ctx.fillStyle=this.border.color;
				}
			}
			
			if(this.end.shape.name==="arrow")
		    	$.drawArrow(ctx,this.resizers[1],this.resizers[2],this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
			else if(this.end.shape.name==="diamond")
		    	$.drawDiamond(ctx,this.resizers[1],this.resizers[2],this.end.shape.type,{size:this.end.shape.size,sharp:this.end.shape.sharp});
			else if(this.end.shape.name==="dot")
			{
				ctx.beginPath();
				ctx.arc(ep.x,ep.y,this.end.shape.radius,0,2*Math.PI);
				ctx.stroke();
				if(this.end.shape.type===2)
				  ctx.fill();
				else if(this.end.shape.type===3){
					ctx.fillStyle="white";
					ctx.fill();
				}
			}
			ctx.restore();
			return this;
		};
		return this;
	};
	 $.register("lineConnector",lineConnector);
	 $.register("brokenLineConnector",brokenLineConnector);
	 $.register("quadraticCurveConnector",quadraticCurveConnector);
	
})(jQuery);