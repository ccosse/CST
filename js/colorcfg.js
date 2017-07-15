var ColorCfg=function(doneCB){
	var me={}
	me.cfg=null;
	me.widget_prefixes=[];
	me.slider_suffs=['_3','_4','_7','_8'];
	me.svg=null;
	me.g=null;//"g"=graphics node in d3/svg terminology
	me.x_axis=null;
	me.r_pts=null;
	me.g_pts=null;
	me.b_pts=null;

	if(doneCB)me.doneCB=doneCB;
	else{
		me.doneCB=function(){
			d3.select("#colorcfg_main").style('display','none');
//			colormyworld.update_styles();
		}
	}

	//load an html template using AJAX to localhost
	//mysteriously quit working on chrome, hence the "else" clause (which relies on #include @index.html)

	var cst_xhttp = new XMLHttpRequest();
	cst_xhttp.onreadystatechange = function() {
		//http://forums.mozillazine.org/viewtopic.php?f=25&t=1134615
		if (cst_xhttp.readyState == 4 && (cst_xhttp.status == 200 || cst_xhttp.status == 0)) {
			console.log("success importing base.html");
			document.body.innerHTML+=cst_xhttp.responseText;//base_html
			console.log("cst appended",cst_xhttp.responseText);
		}
		else{
			console.log("don't load this ... would result in multiple appends");
//			document.body.innerHTML+=base_html;
		}
	};
	//https://stackoverflow.com/questions/7374911/reading-file-with-xmlhttprequest-results-in-error-console-entry
	cst_xhttp.overrideMimeType('text/plain');
	cst_xhttp.open("GET", "/static/CST/js/base.html", true);//test for localhost? ./static won't work on server.
	cst_xhttp.send();

var base_html="\
<div class='animate' id='colorcfg_main' style='position:absolute;top:0px;width:100%;height:100%;z-index:10;display:none;'>\
<div class='row'>\
\
	<div class='column' id='column1'>\
		<div class='card'>\
			<div id='container1' class='container container1'>\
			</div>\
		</div>\
	</div>\
\
	<div class='column' id='column2'>\
		<div class='card'>\
			<div id='container2' class='container container2'>\
				<table id='widget_table' class='cp_table'>\
				</table>\
				<hr/>\
				<button class='ccbutton' onclick='cst.newSequenceCB()'>New Sequence</button>\
				<button class='ccbutton' onclick='cst.resetCB()'>Reset</button>\
			</div>\
		</div>\
	</div>\
\
</div>\
<button class='ccbutton' id='doneB' onclick='cst.doneCB()'>Done</button>\
</div>\
"
/*
document.body.innerHTML+=base_html;
*/
	me.resetCB=function(){
		console.log('resetCB');
		d3.selectAll(".colorcfg")
			.attr('display',function(){console.log(this.id);return 'none';})
			.remove();
		delete(me.cfg);
		window.localStorage.clear();
	}
	me.pad=function(num, size){
		//https://stackoverflow.com/questions/2998784/how-to-output-integers-with-leading-zeros-in-javascript
		var s = num+"";
		while (s.length < size) s = "0" + s;
		return s;
	}
	me.show=function(){
		console.log("colorcfg.show")
		window.clearTimeout(window.lastTimeout);
		d3.select("#colorcfg_main").style("display","block");
		if(me.widget_prefixes.length<1)me.newSequenceCB();
		me.recenter();
	}
	me.newSequenceCB=function(){
		//colorcfg_main .style must= display:block before calling this

		//Initialize localStorage data if not already exist
		if(!window.localStorage['colorcfg']){
			console.log('newSequenceCB initializing localStorage data');
			me.cfg={'prefixes':[],'favorite_colors':[],};
			window.localStorage['colorcfg']=JSON.stringify(me.cfg);
		}
/*
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4 && (xhttp.status == 200 || xhttp.status == 0)) {
				d3.selectAll("#widget_table")
					.append('tr')
					.append('td')
					.append("div")
						.attr('class','colorcfg_new')
						.html(xhttp.responseText);
			}
	//		else document.body.innerHTML+=widget_html;
		};
		//https://stackoverflow.com/questions/7374911/reading-file-with-xmlhttprequest-results-in-error-console-entry
		xhttp.overrideMimeType('text/plain');
		xhttp.open("GET", "/static/CST/static/CST/js/widget.html", true);//test for localhost? ./static won't work on server.
		xhttp.send();
*/
var widget_html="\
<table class='colorcfg_new cp_table'>\
	<tbody>\
		<tr>\
			<td>\
				<svg class='colorcfg_new swatch_svg'></svg>\
			</td>\
			<td class='vslide_cell'>\
				<div class='colorcfg_wrapper rotate'>\
					<input type='range' class='colorcfg_new num_swatch_slider vslide red' min='1' max='100' step='1' value='102'/>\
				</div>\
			</td>\
			<td class='vslide_cell'>\
				<div class='colorcfg_wrapper rotate'>\
					<input type='range' class='colorcfg_new swatch_per_row_slider vslide red' min='1' max='25' step='1'/>\
				</div>\
			</td>\
		</tr>\
\
		<tr>\
			<td>\
				<svg class='colorcfg_new widget_svg'></svg>\
			</td>\
			<td colSpan='2'>\
				<button class='colorcfg_new rgb_cycle ccbutton'>RGB</button>\
			</td>\
			<td></td>\
		</tr>\
\
		<tr>\
			<td>\
				<table width='100%'>\
\
					<input type='range' style='width:100%' class='colorcfg_new mu_slider hslide red' min='1' max='255' step='1'/>\
					</td></tr><tr><td>\
					<input type='range' style='width:100%' class='colorcfg_new sigma_slider hslide red' min='1' max='120' step='1'/>\
					</td></tr>\
				</table>\
			</td>\
			<td></td>\
			<td></td>\
		</tr>\
	</tbody>\
</table>\
"
d3.selectAll("#widget_table")
	.append('tr')
	.append('td')
	.append("div")
		.attr('class','colorcfg_new')
		.html(widget_html);


		d3.timeout(me.assign_ids,100);//This is a one-time call

	}
	me.assign_ids=function(){
		//Trick: select .colorcfg_new, define ids, then remove _new from .className.
	//		w3.includeHTML();//pity this didn't work in Chroome w/d3 ... w3 couldn't find container1

		console.log('assign_ids')
		var count=0;
		var common_id_prefix='configctrl_'+parseInt(Math.random()*1E7);
		me.widget_prefixes.push(common_id_prefix);

		d3.selectAll(".colorcfg_new")
			.attr('id',function(){var rval=common_id_prefix+"_"+count;console.log(d3.select(this).attr('class'),count);count+=1;return rval;})
			.attr('class',function(){return d3.select(this).attr('class').replace('colorcfg_new','colorcfg');});

		d3.select("#"+common_id_prefix+"_6")
			.on('mousedown',function(){me.cycleRGB(common_id_prefix);});

		me.update(common_id_prefix);//now that we've got a common_id_prefix we can update

	}
	me.recenter=function(){
		d3.selectAll("#column2")
			.style('position','absolute')
			.style('left',parseInt(window.innerWidth/2-400)+"px");
	}
	me.update=function(prefix){
		//update rgb curves and palettes
		console.log('update: '+prefix);

		//we only show R|G|B at a time, so data lives in localStorage
		if(!me.cfg[prefix]){
			me.cfg[prefix]={
				'swatch_per_row':'7',
				'num_swatch':'10',
				'red':{'mu':'135','sigma':'11','stroke':'red','path':null},
				'green':{'mu':'135','sigma':'11','stroke':'green','path':null},
				'blue':{'mu':'135','sigma':'11','stroke':'blue','path':null},
				'swatch_pts':d3.select("#"+prefix+"_2").append("g"),
				'seq':[],//this is what gets returned ... sequence of rgba
			}
			me.cfg['prefixes'].push(prefix);
		}

		//This widget's x-axis on svg
		var w_svg=parseInt(d3.select("#"+prefix+"_5").style('width'));
		var h_svg=parseInt(d3.select("#"+prefix+"_5").style('height'));
		console.log("SVG: w,h =",w_svg,h_svg);

		me.x_axis = d3.scaleLinear()
			.range([10,620])
			.domain([0,256]);

		d3.select("#"+prefix+"_5")
			.style('background-color','#CCC')
			.append("g")
				.attr("class", "axis axis--x")
				.attr("transform", "translate(0,"+(h_svg-20)+")")
				.call(d3.axisBottom(me.x_axis)
					.ticks(6)
					.tickSize(0)
					.tickPadding(6));

		me.cfg[prefix]['red']['path']=d3.select("#"+prefix+"_5").append("g");
		me.cfg[prefix]['green']['path']=d3.select("#"+prefix+"_5").append("g");
		me.cfg[prefix]['blue']['path']=d3.select("#"+prefix+"_5").append("g");

		//@cycleRGB we apply r|g|b per slider, from loop.
		//We're loading each slider while we know what channel to load it with. (better/alt way in d3 but this for debugging for now)
		me.load(0,0,prefix);//load red values, slider 0
		me.load(0,1,prefix);//load red values, slider 1
		me.load(0,2,prefix);//load red values, slider 2
		me.load(0,3,prefix);//load red values, slider 3

		me.rgb_curves(prefix);
		me.rgb_swatches(prefix);
	}
	me.rgb_curves=function(prefix){
		//redraw the r|g|b distributions
		//This widget's x-axis on svg
		var line = d3.line()
			.x(function(d) {
				return me.x_axis(d[0]);
			})
			.y(function(d) {
				return d[1];
			})
			.curve(d3.curveCatmullRom.alpha(1.0));


		//we only save to me.cfg when switch rgb channels ... so 2/3 me.cfg values are correct
		//we only want to update red ... need 3x point groups for sure ... so need to maintain structure me.data={keys,key1,key2:{r/g/b/mu/sigma/npts/nswatch}}
//		console.log("prefix=",prefix);

		var gen_data=[[],[],[]];
		for(var xidx=0;xidx<255;xidx+=2){
			gen_data[0].push( [xidx,Math.max(0.1,100*Math.exp( -0.5*( (xidx-me.cfg[prefix]['red']['mu'])/(me.cfg[prefix]['red']['sigma']) *(xidx-me.cfg[prefix]['red']['mu'])/(me.cfg[prefix]['red']['sigma']) )) )] );
			gen_data[1].push( [xidx,Math.max(0.1,100*Math.exp( -0.5*( (xidx-me.cfg[prefix]['green']['mu'])/(me.cfg[prefix]['green']['sigma']) *(xidx-me.cfg[prefix]['green']['mu'])/(me.cfg[prefix]['green']['sigma']) )) )] );
			gen_data[2].push( [xidx,Math.max(0.1,100*Math.exp( -0.5*( (xidx-me.cfg[prefix]['blue']['mu'])/(me.cfg[prefix]['blue']['sigma']) *(xidx-me.cfg[prefix]['blue']['mu'])/(me.cfg[prefix]['blue']['sigma']) )) )] );
		}

		me.cfg[prefix]['red']['path'].selectAll('.path').remove();
		me.cfg[prefix]['green']['path'].selectAll('.path').remove();
		me.cfg[prefix]['blue']['path'].selectAll('.path').remove();

		var colors=['red','green','blue']
		for(var cidx=0;cidx<3;cidx++){
		var color=colors[cidx];
		me.cfg[prefix][color]['path'].append("path")
			.datum(gen_data[cidx])
			.attr("class","path")
			.attr("fill", "none")
			.attr("stroke", me.cfg[prefix][color]['stroke'])
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", 2)
			.attr("d", line);
		}
	}
	me.rgb_swatches=function(prefix){
		//remake this widget's sequence of swatches
		console.log("rgb_swatches");

		me.cfg[prefix]['seq']=[];
		var SEQUENTIAL=false;
		var A_CHANNEL=255;
		if(SEQUENTIAL){
			for(var idx=0;idx<me.cfg[prefix]['num_swatch'];idx++){
				var rval=me.cfg[prefix]['red']['mu']-me.cfg[prefix]['red']['sigma']+idx/me.cfg[prefix]['num_swatch']*2*me.cfg[prefix]['red']['sigma'];///NUM_COLORS
				var gval=me.cfg[prefix]['green']['mu']-me.cfg[prefix]['green']['sigma']+idx/me.cfg[prefix]['num_swatch']*2*me.cfg[prefix]['green']['sigma'];///NUM_COLORS
				var bval=me.cfg[prefix]['blue']['mu']-me.cfg[prefix]['blue']['sigma']+idx/me.cfg[prefix]['num_swatch']*2*me.cfg[prefix]['blue']['sigma'];///NUM_COLORS
				var color_str="RGBA("+parseInt(rval)+","+parseInt(gval)+","+parseInt(bval)+","+A_CHANNEL+")";
				me.cfg[prefix]['seq'].push(color_str);
			}
		}
		else{
			for(var idx=0;idx<me.cfg[prefix]['num_swatch'];idx++){
				var rval=me.cfg[prefix]['red']['mu']-me.cfg[prefix]['red']['sigma']+Math.random()*2*me.cfg[prefix]['red']['sigma'];///NUM_COLORS
				var gval=me.cfg[prefix]['green']['mu']-me.cfg[prefix]['green']['sigma']+Math.random()*2*me.cfg[prefix]['green']['sigma'];///NUM_COLORS
				var bval=me.cfg[prefix]['blue']['mu']-me.cfg[prefix]['blue']['sigma']+Math.random()*2*me.cfg[prefix]['blue']['sigma'];///NUM_COLORS
				var color_str="RGBA("+parseInt(rval)+","+parseInt(gval)+","+parseInt(bval)+","+A_CHANNEL+")";
				me.cfg[prefix]['seq'].push(color_str);
			}
		}

		//swatch_div
		var N=me.cfg[prefix]['num_swatch'];
		var NR=me.cfg[prefix]['swatch_per_row'];
		var dx=parseInt(parseInt(d3.select("#"+prefix+"_2").style('width'))/NR);

		me.cfg[prefix]['swatch_pts'].selectAll('.swatch').remove();

		var swatch=me.cfg[prefix]['swatch_pts'].selectAll(".swatch")
			.data(me.cfg[prefix]['seq']);

		swatch.enter()
			.append("svg:rect")
				.attr("class", function(d){return "new swatch"})
				.attr("id",function(d,i){return prefix+"_"+d})
				.attr("width", dx)
				.attr("height", dx)
				.style("fill",function(d){return d;})
				.attr("x", function(d,i) { return dx*(i-NR*parseInt(i/NR) )})
				.attr("y", function(d,i) { return dx*parseInt(i/NR) });

	}
	me.getColorsList=function(){
		if(!me.cfg || me.cfg['prefixes'].length==0){
			console.log('me.cfg DNE yet');
			return ["RGBA(49,53,99,255)","RGBA(51,76,101,255)","RGBA(54,99,103,255)","RGBA(57,123,105,255)","RGBA(60,146,108,255)","RGBA(63,170,110,255)","RGBA(66,193,112,255)"];
		}
		var prefix;
		var rval=[];
		for(var pidx=0;pidx<me.cfg['prefixes'].length;pidx++){
			prefix=me.cfg['prefixes'][pidx];
			for(var sidx=0;sidx<me.cfg[prefix]['seq'].length;sidx++){
				rval.push(me.cfg[prefix]['seq'][sidx]);
			}
		}
		return rval;
	}
	me.save=function(rgb_idx,sidx,prefix){
		//this rgb stuff could be replaced with global current_rgb
		var keys=['red','green','blue'];
		var key=keys[rgb_idx];
		if(sidx==0)me.cfg[prefix]['num_swatch']=d3.select("#"+prefix+me.slider_suffs[sidx]).property('value');
		else if(sidx==1)me.cfg[prefix]['swatch_per_row']=d3.select("#"+prefix+me.slider_suffs[sidx]).property('value');
		else if(sidx==2)me.cfg[prefix][key]['mu']=d3.select("#"+prefix+me.slider_suffs[sidx]).property('value');
		else if(sidx==3)me.cfg[prefix][key]['sigma']=d3.select("#"+prefix+me.slider_suffs[sidx]).property('value');
		else {;}
		//only need save to window.localStorage at doneCB
	}
	me.load=function(rgb_idx,sidx,prefix){
		//"load" means "load r/g/b slider channel" by save/load from me.cfg
		//showing only one channel at a time makes this 1/2/3 separation useful, i.e.
		var keys=['red','green','blue'];
		var key=keys[rgb_idx];
		if(sidx==0)
			d3.select("#"+prefix+me.slider_suffs[0])
				.property('value',me.cfg[prefix]['num_swatch'].toString())
				.on('input',function(d){d3.select(this).property('value',+this.value);me.cfg[prefix]['num_swatch']=+this.value;me.rgb_swatches(prefix);});
		else if(sidx==1)
			d3.select("#"+prefix+me.slider_suffs[1])
				.property('value',me.cfg[prefix]['swatch_per_row'].toString())
				.on('input',function(d){d3.select(this).property('value',+this.value);me.cfg[prefix]['swatch_per_row']=+this.value;me.rgb_swatches(prefix);});
		else if(sidx==2)
			d3.select("#"+prefix+me.slider_suffs[2])
				.property('value',me.cfg[prefix][key]['mu'].toString())
				.on('input',function(d){d3.select(this).property('value',+this.value);me.cfg[prefix][key]['mu']=+this.value;me.rgb_curves(prefix);me.rgb_swatches(prefix);});
		else if(sidx==3)
			d3.select("#"+prefix+me.slider_suffs[3])
				.property('value',me.cfg[prefix][key]['sigma'].toString())
				.on('input',function(d){d3.select(this).property('value',+this.value);me.cfg[prefix][key]['sigma']=+this.value;me.rgb_curves(prefix);me.rgb_swatches(prefix);});
	}

	me.cycleRGB=function(prefix){
		for(sidx=0;sidx<me.slider_suffs.length;sidx++){//cycling over all 4 sliders
			var idn=prefix+me.slider_suffs[sidx];
			d3.select("#"+idn)//select slider[sidx]
				.attr("class",function(){
					var xclass=d3.select(this).attr('class');
					if(xclass.indexOf("red")>-1){me.save(0,sidx,prefix);me.load(1,sidx,prefix);return xclass.replace("red","green");}
					else if(xclass.indexOf("green")>-1){me.save(1,sidx,prefix);me.load(2,sidx,prefix);return xclass.replace("green","blue");}
					else if(xclass.indexOf("blue")>-1){me.save(2,sidx,prefix);me.load(0,sidx,prefix);return xclass.replace("blue","red");}
					return xclass;
				});
		}
		me.rgb_curves(prefix);
	}

	try{me.cfg=JSON.parse(window.localStorage['colorcfg']);}
	catch(e){console.log('No configuration found in localStorage, will re-create at first newSequenceCB')}

	return me;
}
var colorcfg;
var cst;
