var dimensions, canvas, labellayer = new Array(), alignment = new Array(), actualleft = new Array(), actualright = new Array(), 
boundRect = new Array(),maxwidth = new Array(), remove = new Array(), isqrcode, qrlayer, qrdataurl, qrdata='', index_i=1, 
current_dataurl, img = new Array(), testfileentry = new Array(),xfactor = new Array(), yfactor = new Array();

//Dot Templating
var labellayer_tempfn = doT.template("<div class='component' id='{{=it.ldiv}}'><input id='{{=it.label}}' type='text' style='float:left';/><select style='float:left;' class='font-dropdown' id='{{=it.lfamily}}'><option value='Arial'>Arial</option></select><div class='btn-group' style='float:left;'><a class='btn dropdown-toggle' data-toggle='dropdown' href='#'><i class='icon-text-height'></i><span class='caret'></span></a><ul class='dropdown-menu'><li><input id='{{=it.lsize}}' type='range'/></li></ul></div><a href='#' class='btn' toggle='unselect' id='{{=it.lbold}}'><i class='icon-bold'></i></a><a href='#' class='btn' id='{{=it.litalic}}' toggle='unselect'><i class='icon-italic'></i></a><input class='colorbox' id='{{=it.lcolor}}' type='color' value='#cc3333'/><a class='btn' id='{{=it.lleft}}' toggle='unselect'><i class='icon-align-left'></i></a><a class='btn btn-warning' id='{{=it.lcenter}}' toggle='select'><i class='icon-align-center'></i></a><a class='btn' id='{{=it.lright}}' toggle='unselect'><i class='icon-align-right'></i></a><input class='positionbox' id='{{=it.lpos}}' value='center: {{=it.xpos}} , top: {{=it.ypos}}' type='text' readonly='readonly'/><button style='color:#555;' id='{{=it.lbounds}}' class='btn'>Set Bounds</button><div class='clr'></div></div>");
var bounds_tempfn = doT.template("<span id='{{=it.bspan}}' hidden='true'><span class='badge badge-warning'><a id='{{=it.bsave}}' class='icon-ok' style='cursor:pointer;'></a></span><span class='badge badge-warning'><a id='{{=it.bcancel}}' class='icon-remove' style='cursor:pointer;'></a></span></span>");

fabric.Canvas.prototype.getAbsoluteCoords = function(object) {
	return {
		left: object.left + this._offset.left,
		top: object.top + this._offset.top
	};
}

//CSV file related
var indexes, csv_file, data;
//Stop Badge gen
var isStopSave = false;

//Filesystem settings
window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

//Local Storage
var settings = new Store("settings");

$(document).ready(function () {

	if(settings.get('event-csv') === undefined || settings.get('event-template') === undefined)
	{	
		
		$('body').css('background-color','whitesmoke');
		$('body').html('<p style="font-size:20px; text-align:center; margin-top:100px">Redirecting you to <a href="./home.html">Home Page</a></p>');
		location.href='./home.html';
	}

	dimensions = settings.get('dimensions');
	
	isqrcode = settings.get('qrcode');

	//CSV file related
	var indexes = settings.get('selected-cols');
	for(var j=0; j<indexes.length; j++) { indexes[j] = +indexes[j]; } 
	var csv_file = settings.get('event-csv');
	var data = $.csv2Array(csv_file);  
	$.each(data, function(index,ar) { 
		if(ar.length == 0) { 
		remove.push(index);
		} 
	});
	$.each(remove, function(no, value) { 
		remove[no] = value-no;  
		data.splice(remove[no],1);
	});

	settings.set('numentries',data.length);

	//Infographics
	if(isqrcode==='true')
	{
		var qr_indexes = settings.get('qr-cols');
		for(var k=0; k<qr_indexes.length; k++) {qr_indexes[k] = +qr_indexes[k]; }
	}
	
	canvas = new fabric.Canvas('canvas', {backgroundImage:settings.get('event-template')});
	canvas.setHeight(+dimensions.pixelheight);
	canvas.setWidth(+dimensions.pixelwidth);
	scale = 1;
	if(+dimensions.pixelwidth/+dimensions.inchwidth>96)
		scale=(+dimensions.pixelwidth/+dimensions.inchwidth)/96;

	canvas.renderAll(true);
	canvas.HOVER_CURSOR = 'pointer';
	if(isqrcode === 'true')
	{
		for(var k = 0; k < qr_indexes.length; k++)
		{
			qrdata+=data[0][qr_indexes[k]]+"\n";
		}
		$('#qrcode').qrcode({width: 64,height: 64,text: qrdata});
		qrdataurl = $('#qrcode > canvas')[0].toDataURL('image/png'); 
		fabric.Image.fromURL(qrdataurl, function(qr) {
        		qr.set({
        			left: canvas.getWidth()-90,
            		top: canvas.getHeight()-70,
            	});
          	canvas.add(qr);
	  	qrlayer = qr;
        	});
	}
   	var fontsize = 25, xpos = canvas.getWidth()/2, ypos = canvas.getHeight()/4;
	for(i=0; i<indexes.length; i++)
	{
		index = indexes[i];
		current_label = data[0][index];
        customize_json = { labelname: current_label,
                               ldiv: '#label'+i+'div',
                               label: '#label'+i,
                               lfamily: '#label'+i+'family',
                               lsize: '#label'+i+'size',
                               lbold: '#label'+i+'bold',
                               litalic: '#label'+i+'italic',
                               lcolor: '#label'+i+'color',
                               lleft: '#label'+i+'left',
                               lcenter: '#label'+i+'center',
                               lright: '#label'+i+'right',
                               lpos: '#label'+i+'pos',
                               xpos: xpos,
                               ypos: ypos,
                               lbounds: '#label'+i+'bounds',
                               bspan: '#boundspan'+i,
                               bsave: '#label'+i+'boundsave',
                               bcancel: '#label'+i+'boundcancel'
                              };
        var result_labellayer = labellayer_tempfn({ 
                               ldiv: 'label'+i+'div',
                               label: 'label'+i,
                               lfamily: 'label'+i+'family',
                               lsize: 'label'+i+'size',
                               lbold: 'label'+i+'bold',
                               litalic: 'label'+i+'italic',
                               lcolor: 'label'+i+'color',
                               lleft: 'label'+i+'left',
                               lcenter: 'label'+i+'center',
                               lright: 'label'+i+'right',
                               lpos: 'label'+i+'pos',
                               xpos: xpos,
                               ypos: ypos,
                               lbounds: 'label'+i+'bounds',
                              });
        var result_setbounds = bounds_tempfn({bspan: 'boundspan'+i,
                                              bsave: 'label'+i+'boundsave',
                                              bcancel: 'label'+i+'boundcancel'
                                            });
		$("#comp-select").append("<option value='"+i+"'>"+current_label+"</option>");
		$("#customize").append(result_labellayer);
        $("body").append(result_setbounds);
		
		labellayer[i] = new fabric.Text(current_label, {
          		left: xpos,
          		top: ypos,
          		fontSize: fontsize,
          		fontFamily: "Arial",
          		fill: "black",
			textAlign: "center",
			useNative: true,
		  });
		
		canvas.add(labellayer[i]);
		canvas.setActiveObject(labellayer[0]);
		alignDetails = new Object();
		alignDetails.index = i;
		alignDetails.layer = labellayer[i];
		alignDetails.actualleft = labellayer[i].left - labellayer[i].getWidth()/2;
		alignDetails.actualright = labellayer[i].left + labellayer[i].getWidth()/2;
		alignDetails.alignment = 'center';
        customize_json.alignDetails = alignDetails;
	
		addAttributes(customize_json, labellayer[i]);
        ypos += 40;
	}
	function addAttributes(custom, labellayer)
    	{
		console.log(custom);
		canvas.observe('object:selected',function(e){
	
			if(canvas.getActiveGroup()===null && canvas.getActiveObject()!=null)
			{
				if(canvas.getActiveObject()===labellayer)
				{
					$(".component").hide();
					$("#label"+custom.alignDetails.index+"div").show();
					$("#comp-select").val(custom.alignDetails.index);
				}
				
			}
		});
		canvas.observe('object:modified', function(e) {
  			var activeObject = e.target;
			if(typeof activeObject.get === 'function'){
  				if(activeObject === labellayer)
				{
					custom.alignDetails.actualleft = labellayer.left - labellayer.getWidth()/2;
					custom.alignDetails.actualright = labellayer.left + labellayer.getWidth()/2;
					actualleft[custom.alignDetails.index] = custom.alignDetails.actualleft;
					actualright[custom.alignDetails.index] = custom.alignDetails.actualright;
					setpos();
				}
				if(activeObject ===custom.alignDetails.boundingRect)
				{
					positionBoundSpan(custom.alignDetails.boundingRect,custom.bspan);
				}
			}
		});
		$(custom.label).attr({
			placeholder: 'Try something here',
		});
		$(custom.label).on('keyup', function() {
  			labellayer.setText($(custom.label).val());
			canvas.renderAll(true);
		});
		$(custom.lsize).attr({
			min: '0',
			max: '200',
			value: fontsize,
			
		});
		$(custom.lsize).on('change', function() {
			labellayer.setFontsize($(custom.lsize).val());
			setleft();
		});
		
		for(k=1;k<fonts.length;k++)
		{
			displayfont = fonts[k].split(",")[0];
			$(custom.lfamily).append("<option value='"+fonts[k]+"'>"+displayfont+"</option>");
		}
		$(custom.lfamily).change(function(){ 
			labellayer.set('fontFamily',$(custom.lfamily).val());
			canvas.renderAll(true);
		});
		$(custom.lbold).attr({
			rel: 'tooltip',
			title: 'Set Font weight Bold'
		});
		$(custom.litalic).attr({
			rel: 'tooltip',
			title: 'Set Font style as Italic'
		});
		$(custom.lcolor).attr({
			rel: 'tooltip',
			title: 'Set Font Color'
		});
		$(custom.lleft).attr({
			rel: 'tooltip',
			title: 'Left align: Ensures that text for all badges have left position fixed.'
		});
		$(custom.lcenter).attr({
			rel: 'tooltip',
			title: 'Center align: Ensures that text for all badges have center position fixed.'
		});
		$(custom.lright).attr({
			rel: 'tooltip',
			title: 'Right align: Ensures that text for all badges have right position fixed.'
		});
		$(custom.lbounds).attr({
			rel: 'tooltip',
			title: 'Avoid long text exceeding the canvas by setting bounds. Ensures all text is scaled to the specified bound region.'
		});
		
		$(custom.lbold).click(function(event){
			event.preventDefault();
			if($(custom.lbold).attr('toggle') === 'unselect')
			{
				labellayer.set('fontWeight', 'bold');
				$(custom.lbold).attr({'toggle':'select', 'class':'btn btn-warning'});	
			}
			else
			{
                                labellayer.set('fontWeight', 'normal');
                                $(custom.lbold).attr({'toggle':'unselect', 'class':'btn'});
			}
			canvas.renderAll(true);
		});
		$(custom.litalic).click(function(event){
                        event.preventDefault();
                        if($(custom.litalic).attr('toggle') === 'unselect')
                        {
                                labellayer.set('fontStyle', 'italic');
                                $(custom.litalic).attr({'toggle':'select', 'class':'btn btn-warning'});
                        }
                        else
                        {
                                labellayer.set('fontStyle', 'normal');
                                $(custom.litalic).attr({'toggle':'unselect', 'class':'btn'});
                        }
			canvas.renderAll(true);
                });
		$(custom.lcolor).change(function(){ 
			labellayer.setColor($(custom.lcolor).val());
			canvas.renderAll(true);
		});
		$(custom.lleft).on('click',function(event){
			if($(custom.lleft).attr('toggle') === 'unselect')
			{
				align('left');
				$(custom.lleft).attr({'toggle':'select', 'class':'btn btn-warning'});
				$(custom.lcenter).attr({'toggle':'unselect', 'class':'btn'});
				$(custom.lright).attr({'toggle':'unselect', 'class':'btn'});
			}
			else
			{
				align('center');
				$(custom.lcenter).attr({'toggle':'select', 'class':'btn btn-warning'});
                                $(custom.lleft).attr({'toggle':'unselect', 'class':'btn'});

			}	
		});
		$(custom.lright).on('click',function(event){
            if($(custom.lright).attr('toggle') === 'unselect')
            {
                    align('right');
                    $(custom.lright).attr({'toggle':'select', 'class':'btn btn-warning'});
                    $(custom.lcenter).attr({'toggle':'unselect', 'class':'btn'});
                    $(custom.lleft).attr({'toggle':'unselect', 'class':'btn'});
            }
            else
            {
                    align('center');
                    $(custom.lcenter).attr({'toggle':'select', 'class':'btn btn-warning'});
                    $(custom.lright).attr({'toggle':'unselect', 'class':'btn'});
            }
        });
        $(custom.lcenter).on('click', function(event){
			if($(custom.lcenter).attr('toggle')==='unselect')
			{
				align('center');
                $(custom.lcenter).attr({'toggle':'select', 'class':'btn btn-warning'});
                $(custom.lright).attr({'toggle':'unselect', 'class':'btn'});
                $(custom.lleft).attr({'toggle':'unselect', 'class':'btn'});
			}
		});
		function align(alignval){
			
			custom.alignDetails.actualleft = labellayer.left - labellayer.getWidth()/2;
			custom.alignDetails.actualright = labellayer.left + labellayer.getWidth()/2;	
			custom.alignDetails.alignment = alignval;	
			actualleft[custom.alignDetails.index] = custom.alignDetails.actualleft;
			actualright[custom.alignDetails.index] = custom.alignDetails.actualright;
			alignment[custom.alignDetails.index] = custom.alignDetails.alignment;	
			setpos();
		}
		function setpos(){
			var x,y;
			
			if(custom.alignDetails.alignment==='left')
			{	
				x = labellayer.left - labellayer.getWidth()/2;
			}
			else if(custom.alignDetails.alignment==='right')
			{	
				x = labellayer.left + labellayer.getWidth()/2;
			}
			else
			{
				x = labellayer.left;
			}
			y = labellayer.top;
			$(custom.lpos).val(custom.alignDetails.alignment+":"+x+' , top:'+y);
		}
		
		function setleft(){
			
			if(custom.alignDetails.alignment==='left')
				labellayer.set('left',custom.alignDetails.actualleft+labellayer.getWidth()/2);
			else if(custom.alignDetails.alignment==='right')
				labellayer.set('left',custom.alignDetails.actualright-labellayer.getWidth()/2);
			canvas.renderAll(true);
		}

		$(custom.lbounds).on('click',function(){
			
			$(custom.lbounds).attr('disabled', true);
			labellayer.lockMovementX = true;
			labellayer.lockMovementY = true;			
			labellayer.hasControls = false;
			custom.alignDetails.boundingRect = new fabric.Rect({ left: labellayer.left-10, top: labellayer.top-10, width: labellayer.getWidth()+10, height: labellayer.getHeight()+10, opacity:0.3 });
			canvas.add(custom.alignDetails.boundingRect);
			positionBoundSpan(custom.alignDetails.boundingRect,custom.bspan);
			$(custom.bspan).show();
		});
		function positionBoundSpan(rect,boundspan)
		{
			var absCoords = canvas.getAbsoluteCoords(rect);
			$(custom.bspan).css('position','absolute');
			$(custom.bspan).css('left',(absCoords.left + rect.width) + 'px');
			$(custom.bspan).css('top',(absCoords.top) + 'px');
			
		}
		$(custom.bsave).on('click', function(){
			$(custom.lbounds).attr('disabled', false);
			$(custom.bspan).hide();
			labellayer.hasControls = true;
			labellayer.lockMovementX = false;
			labellayer.lockMovementY = false;
			boundRect[custom.alignDetails.index] = custom.alignDetails.boundingRect;
			maxwidth[custom.alignDetails.index] = custom.alignDetails.boundingRect.getWidth();
			canvas.remove(custom.alignDetails.boundingRect);
		});
		$(custom.bcancel).on('click', function(){
			$(custom.lbounds).attr('disabled', false);
			$(custom.bspan).hide();
			labellayer.hasControls = true;
			labellayer.lockMovementX = false;
			labellayer.lockMovementY = false;
			canvas.remove(custom.alignDetails.boundingRect);
			boundRect[custom.alignDetails.index] = null;
			maxwidth[custom.alignDetails.index] = null;
		});
		labellayer.lockRotation = true;

	};
	
	//handler to generate badges/stop generation
	$("span#genimages > button#save").on('click',function(){
		if($("span#genimages > button#save").html()=='Next')
		{
			save();
			$("span#genimages > button#save").html('Stop');
			$("span#genimages > button#save").attr({'title':'Click to stop badge creation', 'class':'btn btn-danger savebutton'});	
		}
		else
		{
			isStopSave = true;
		}
	});
	
	$("#minimizetoolbox").on("click",function(event) {
		event.preventDefault();
		$("#toolbox").hide();
		$("#minimizedtoolbox").show();
	});
	
	$("#maximizetoolbox").on("click",function(event) {
		event.preventDefault();
		$("#minimizedtoolbox").hide();
		$("#toolbox").show();
		
	});
	
	$(".component").hide();
	$("#label0div").show();
	
	$('#comp-select').on('change',function() {
		$(".component").hide();
		$("#label"+this.value+"div").show();
		canvas.setActiveObject(labellayer[this.value])
	});
	
	$("div#ziplink").hide();
	$("#zip").on('click', function(){
		zipthis.addFiles(function(){},function(file){$("#zipprogress").value = 0;
				$("#zipprogress").max = 0; $("#zipprogress").show(); },function(current, total){$("#zipprogress").value = current;
				},function(){$("#zipprogress").hide(); $("div#ziplink").show();});
	});
	$("div#ziplink > a").on('click', function(){
		zipthis.getBlobURL(function(blobURL, revokeBlobURL) {
			$("div#ziplink > a").attr({'download': settings.get('projectName')+'.zip','href':blobURL});
		});
	});
	
	$("#back").on('click', function(){
		for(var i=0;i<indexes.length;i++)
                {
                        labellayer[i].set('text',data[0][indexes[i]]);
                }
                canvas.renderAll(true);

		$("#comp-select").show();
                
		$("#customize").show();
        $("#zip").hide();
        $("#print").hide();
        $("#back").hide();
		$("span#genimages > button#save").html('Next');
		$("span#genimages > button#save").attr({'title':'Click to create all badges','class':'btn btn-primary savebutton'});
		$("#genimages").show();
		$("#ziplink").hide();
		$("#zipprogress").hide();
		zipthis.getBlobURL(function(blobURL, revokeBlobURL) {
			console.log('Zip revoked');
		});
		$("#finish").hide();
		$("#finish").css('margin-top','-30px');
		boundRect = [];
		maxwidth = [];
	});

	$('#triggerprint').on('click',function(){
		$('#downloadpdf').hide();
		$('#triggerprint').button('loading');
		printToPdf($('#orient').val(),$('#papersize').val());
		
	});
	//cleanup filesystem on window close
	$("#finish").on('click',function() {
	  localStorage.clear();
	  $("#canvasnbox").hide();
	  $("#thanks").show();
	  window.requestFileSystem(window.TEMPORARY, 1024*1024, function(fs) {
  		fs.root.getDirectory('/badges', {}, function(dirEntry) {
			dirEntry.removeRecursively(function() {
    			}, errorHandler);
		  }, errorHandler);
	   }, errorHandler);
	});
	
	$('#printModal').on('hidden', function () {
		$('#downloadpdf').hide();
	})
	 //Activating Bootstrap tooltips
	 $("[rel=tooltip]").tooltip();
	 
    

	
	function save()
	{
		canvas.deactivateAll();
		canvas.renderAll(true);
					
		$.each(indexes,function(index_j,value_j) {
			xfactor[index_j] = labellayer[index_j].scaleX;
			yfactor[index_j] = labellayer[index_j].scaleY;
		});
		index_i=1;
		$("span#genimages > progress#gen").attr('max',data.length);
		$("span#genimages > progress#gen").show();
		window.requestFileSystem(window.TEMPORARY, 1024*1024*10, function(fs) {
  			fs.root.getDirectory('badges', {create: true}, function(dirEntry) {
    				
  			}, errorHandler);
		}, errorHandler);
  		window.requestFileSystem(window.TEMPORARY, 10*1024*1024, saveImages, errorHandler);
		
	};
	
	function saveImages(fs)
	{
		var x,y;
		if(data[index_i].length == 0) {
			 console.log("Empty row in the CSV file"); 
		}
		else {	
			$.each(indexes,function(index_j,value_j)
			{		
				labellayer[index_j].scaleX = xfactor[index_j];
				labellayer[index_j].scaleY = yfactor[index_j];		
				labellayer[index_j].set('text', data[index_i][value_j]);
				canvas.renderAll(true);
				if( typeof boundRect[index_j] === 'object' && boundRect[index_j] != null)
				{
					if(labellayer[index_j].getWidth() > boundRect[index_j].getWidth())			
					{
						
						labellayer[index_j].scaleToWidth(maxwidth[index_j]);
						canvas.renderAll(true);	
					}
				}		
				if(alignment[index_j]==='left')
				{
					labellayer[index_j].set('left',actualleft[index_j]+labellayer[index_j].getWidth()/2);
					
				}
				else if(alignment[index_j]==='right')
				{
					labellayer[index_j].set('left', actualright[index_j]-labellayer[index_j].getWidth()/2);
				
				}
				canvas.renderAll(true);
				
			});
		}
		if(isqrcode==='true')
		{
			var qrdata="";
			for(var k = 0; k < qr_indexes.length; k++)
			{
				qrdata+=data[index_i][qr_indexes[k]]+"\n";
			}
			$('#qrcode > canvas').remove();
			$.when(
				$('#qrcode').qrcode({width: qrlayer.getWidth(),height: qrlayer.getHeight(),text: qrdata})
			).then(function()
			{	
				if($('#qrcode > canvas')[0]!=null)
				{
				qrdataurl = $('#qrcode > canvas')[0].toDataURL('image/png');
				qrlayer.getElement().src = qrdataurl;	
				canvas.renderAll(true);
				writefile(fs);}
			});
		}
		else
			writefile(fs);
		
		
	};

	function writefile(fs)
	{
		var current_dataurl = canvas.toDataURLWithMultiplier('jpeg',scale);
		var byteString = atob(current_dataurl.split(',')[1]);
	    	var mimeString = current_dataurl.split(',')[0].split(':')[1].split(';')[0];
	    	var ab = new ArrayBuffer(byteString.length);
    		var ia = new Uint8Array(ab);
    		for (var i = 0; i < byteString.length; i++) {
        		ia[i] = byteString.charCodeAt(i);
    		}
		var bb = new window.WebKitBlobBuilder(); // or just BlobBuilder() if not using Chrome
    		bb.append(ab);
    		current_blob = bb.getBlob(mimeString);
		fs.root.getFile('/badges/badge'+index_i+'.jpeg', {create: true}, function(fileEntry) {

			testfileentry[index_i] = fileEntry;
  			fileEntry.createWriter(function(fileWriter) {
				fileWriter.write(current_blob);
				if(isStopSave === true)
				{
					$("span#genimages > button#save").html('Next');
					$("span#genimages > button#save").attr({'title':'Click to create all badges','class':'btn btn-primary'});
					$("span#genimages > progress#gen").hide();
					index_i = 1;
					isStopSave = false;
					return;
				}	
				if(++index_i<data.length)
				{
					$("span#genimages > progress#gen").attr('value',index_i);
						saveImages(fs);	
				}
				else{
					$("span#genimages > progress#gen").attr('value',data.length);
					$("span#genimages > progress#gen").hide();
					_gaq.push(['_trackEvent', 'Badge', 'Created', settings.get("projectName"), data.length]);
					$("#comp-select").hide();
					$("#customize").hide();
					$("#genimages").hide();
					$("#zip").show();
					$("#print").css('display','inline-block');
					$("#back").show();
					$("#finish").show();
					$("#finish").css('margin-top','10px');
					
				}						
			});
		});
	};

	

	
});


var zipthis = (function(obj) {
		var zipFileEntry, zipWriter, writer, creationMethod, URL = obj.webkitURL || obj.URL;

		return {
			
			addFiles : function addFiles(oninit, onadd, onprogress, onend) {
				var addIndex = 1;

				function nextFile() {

						var filename = 'badge'+addIndex+'.jpeg';
						testfileentry[addIndex].file(function(file){
							onadd(file);
							zipWriter.add(filename, new zip.BlobReader(file), function() {
								
								if (++addIndex < settings.get('numentries'))
									nextFile();
								else
									onend();
							}, onprogress);
						});
				}				
				function createZipWriter() {
				
					zip.createWriter(writer, function(writer) {
						zipWriter = writer;
						oninit();
						nextFile();
					}, errorHandler);
				}

				if (zipWriter)
					nextFile();
				else {
					writer = new zip.BlobWriter();
					createZipWriter();
				} 
			},
			getBlobURL : function(callback) {
				if(zipWriter!=null)
				{
					zipWriter.close(function(blob) {
						var blobURL = URL.createObjectURL(blob);
						callback(blobURL, function() {
							URL.revokeObjectURL(blobURL);
						});
					zipWriter = null;
					});
				}
			}
		};
	})(this);

	


function errorHandler(err){
  		var msg = 'An error occured: ';
 
  		switch (err.code) { 
   	 	case FileError.NOT_FOUND_ERR: 
      			msg += 'File or directory not found'; 
      			break;
 
    		case FileError.NOT_READABLE_ERR: 
      			msg += 'File or directory not readable'; 
      			break;
 
    		case FileError.PATH_EXISTS_ERR: 
      			msg += 'File or directory already exists'; 
      			break;
 
    		case FileError.TYPE_MISMATCH_ERR: 
      			msg += 'Invalid filetype'; 
      			break;
 
    		default:
      			msg += 'Unknown Error'; 
      			break;
  		};
 
 		console.log(msg);
};
