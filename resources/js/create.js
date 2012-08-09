	//Filesystem settings
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

	//Image Dimensions
	var dimensions = localStorage['dimensions'].split(",");
	for(var j=0; j<dimensions.length; j++) { dimensions[j] = +dimensions[j]; }
	
	//Fabric js initialisations
        var canvas; 
	var labellayer = new Array();
	var alignment = new Array();
	var actualleft = new Array();
	var actualright = new Array();	
	var boundRect = new Array();
	var maxwidth = new Array();
	var isqrcode = localStorage['qrcode'], qrlayer, qrdataurl, qrdata='';

	//CSV file related
	var indexes = localStorage['selected-cols'].split(",");
	for(var j=0; j<indexes.length; j++) { indexes[j] = +indexes[j]; } 
	var csv_file = localStorage['event-csv'];
	var data = $.csv2Array(csv_file);
	localStorage['numentries']=data.length;

	//Infographics
	if(isqrcode==='true')
	{
	var qr_indexes = localStorage['qr-cols'].split(",");
	for(var k=0; k<qr_indexes.length; k++) {qr_indexes[k] = +qr_indexes[k]; }
	}
	
	//Stop Badge gen
	var isStopSave = false;
$(document).ready(function () {

	canvas = new fabric.Canvas('canvas', {backgroundImage:localStorage['event-template']});
	/*var wtoh = dimensions[1]/dimensions[0]*1.0;
	var htow = dimensions[0]/dimensions[1]*1.0;
	var h,w;
	h = dimensions[1]; w = dimensions[0]; 
	if (dimensions[0] > 600 ) { w = 600; canvas.setWidth(w); h = w*wtoh; canvas.setHeight(h); }
	else if (dimensions[1] > 800 ) { h = 600; canvas.setHeight(h); w = h*htow; canvas.setWidth(w);}
	else { canvas.setHeight(h); canvas.setHeight(w); }*/
	canvas.setHeight(dimensions[1]);
	canvas.setWidth(dimensions[0]);
	
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
		$("#comp-select").append("<option value='"+i+"'>"+current_label+"</option>");
		$("#customize").append("<div class='component' id='label"+i+"div'> <input id='label"+i+"' type='text' style='float:left';/> <select style='float:left;' class='font-dropdown' id='label"+i+"family'><option value='Arial'>Arial</option></select> <div class='btn-group' style='float:left;'> <a class='btn dropdown-toggle' data-toggle='dropdown' href='#'><i class='icon-text-height'></i> <span class='caret'></span></a><ul class='dropdown-menu'><li> <input id='label"+i+"size' type='range'/></li></ul></div>  <a href='#' class='btn' title='unselect' id='label"+i+"bold'><i class='icon-bold'></i></a> <a href='#' class='btn' id='label"+i+"italic' title='unselect'><i class='icon-italic'></i></a> <input class='colorbox' id='label"+i+"color' type='color' value='#cc3333'/> <a class='btn' id='label"+i+"left' title='unselect'><i class='icon-align-left'></i></a> <a class='btn btn-warning' id='label"+i+"center' title='select'><i class='icon-align-center'></i></a> <a class='btn' id='label"+i+"right' title='unselect'><i class='icon-align-right'></i></a>      <input class='positionbox' id='label"+i+"pos' value='center: "+xpos+" , top: "+ypos+"' type='text' readonly='readonly'/><button style='color:#555;' id='label"+i+"bounds'>Set Bounds</button><button id='label"+i+"boundsave' hidden='true'>Save</button><button id='label"+i+"boundcancel' hidden='true'>Cancel</button> <div class='clr'></div></div>");
		
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

		addAttributes(alignDetails, current_label, '#label'+i, '#label'+i+'size', '#label'+i+'family', '#label'+i+'bold', '#label'+i+'italic', '#label'+i+'color', '#label'+i+'left', '#label'+i+'center', '#label'+i+'right', '#label'+i+'pos', '#label'+i+'bounds', '#label'+i+'boundsave', '#label'+i+'boundcancel', labellayer[i], fontsize);
		ypos += 40;
	}
	
	function addAttributes(alignobj, label, labelid, labelsize, labelfamily, labelbold, labelitalic, labelcolor, labelleft, labelcenter, labelright, labelpos, labelbounds, labelboundsave, labelboundcancel, labellayer, fontsize)
	{
		canvas.observe('object:selected',function(e){
			if(canvas.getActiveGroup()===null && canvas.getActiveObject()!=null)
			{
				if(canvas.getActiveObject()===labellayer)
				{
					$(".component").hide();
					$("#label"+alignobj.index+"div").show();
					$("#comp-select").val(alignobj.index);
				}
			}
		});
		canvas.observe('object:modified', function(e) {
  			var activeObject = e.target;
			if(typeof activeObject.get === 'function'){
  				if(activeObject.get('left') === labellayer.get('left'))
				{
					alignobj.actualleft = labellayer.left - labellayer.getWidth()/2;
					alignobj.actualright = labellayer.left + labellayer.getWidth()/2;
					actualleft[alignobj.index] = alignobj.actualleft;
					actualright[alignobj.index] = alignobj.actualright;
					setpos();
				}
			}
		});
		$(labelid).attr({
			placeholder: label,
		});
		$(labelid).on('keyup', function() {
  			labellayer.setText($(labelid).val());
			canvas.renderAll(true);
		});
		$(labelsize).attr({
			min: '0',
			max: '200',
			value: fontsize,
		});
		$(labelsize).on('change', function() {
			labellayer.setFontsize($(labelsize).val());
			setleft();
		});
		
		for(k=1;k<fonts.length;k++)
		{
			displayfont = fonts[k].split(",")[0];
			$(labelfamily).append("<option value='"+fonts[k]+"'>"+displayfont+"</option>");
		}
		$(labelfamily).change(function(){ 
			labellayer.set('fontFamily',$(labelfamily).val());
			canvas.renderAll(true);
		});
		$(labelbold).click(function(event){
			event.preventDefault();
			if($(labelbold).attr('title') === 'unselect')
			{
				labellayer.set('fontWeight', 'bold');
				$(labelbold).attr({'title':'select', 'class':'btn btn-warning'});	
			}
			else
			{
                                labellayer.set('fontWeight', 'normal');
                                $(labelbold).attr({'title':'unselect', 'class':'btn'});
			}
			canvas.renderAll(true);
		});
		$(labelitalic).click(function(event){
                        event.preventDefault();
                        if($(labelitalic).attr('title') === 'unselect')
                        {
                                labellayer.set('fontStyle', 'italic');
                                $(labelitalic).attr({'title':'select', 'class':'btn btn-warning'});
                        }
                        else
                        {
                                labellayer.set('fontStyle', 'normal');
                                $(labelitalic).attr({'title':'unselect', 'class':'btn'});
                        }
			canvas.renderAll(true);
                });
		$(labelcolor).change(function(){ 
			labellayer.setColor($(labelcolor).val());
			canvas.renderAll(true);
		});
		$(labelleft).on('click',function(event){
			if($(labelleft).attr('title') === 'unselect')
			{
				align('left');
				$(labelleft).attr({'title':'select', 'class':'btn btn-warning'});
				$(labelcenter).attr({'title':'unselect', 'class':'btn'});
				$(labelright).attr({'title':'unselect', 'class':'btn'});
			}
			else
			{
				align('center');
				$(labelcenter).attr({'title':'select', 'class':'btn btn-warning'});
                                $(labelleft).attr({'title':'unselect', 'class':'btn'});

			}	
		});
		$(labelright).on('click',function(event){
                        if($(labelright).attr('title') === 'unselect')
                        {
                                align('right');
                                $(labelright).attr({'title':'select', 'class':'btn btn-warning'});
                                $(labelcenter).attr({'title':'unselect', 'class':'btn'});
                                $(labelleft).attr({'title':'unselect', 'class':'btn'});
                        }
                        else
                        {
                                align('center');
                                $(labelcenter).attr({'title':'select', 'class':'btn btn-warning'});
                                $(labelright).attr({'title':'unselect', 'class':'btn'});
                        }
                });
		$(labelcenter).on('click', function(event){
			if($(labelcenter).attr('title')==='unselect')
			{
				align('center');
                                $(labelcenter).attr({'title':'select', 'class':'btn btn-warning'});
                                $(labelright).attr({'title':'unselect', 'class':'btn'});
                                $(labelleft).attr({'title':'unselect', 'class':'btn'});
			}
		});
		function align(alignval){
			
			alignobj.actualleft = labellayer.left - labellayer.getWidth()/2;
			alignobj.actualright = labellayer.left + labellayer.getWidth()/2;	
			alignobj.alignment = alignval;	
			actualleft[alignobj.index] = alignobj.actualleft;
			actualright[alignobj.index] = alignobj.actualright;
			alignment[alignobj.index] = alignobj.alignment;	
			setpos();
		}
		function setpos(){
			var x,y;
			
			if(alignobj.alignment==='left')
			{	
				x = labellayer.left - labellayer.getWidth()/2;
			}
			else if(alignobj.alignment==='right')
			{	
				x = labellayer.left + labellayer.getWidth()/2;
			}
			else
			{
				x = labellayer.left;
			}
			y = labellayer.top;
			$(labelpos).val(alignobj.alignment+":"+x+' , top:'+y);
		}
		
		function setleft(){
			
			if(alignobj.alignment==='left')
				labellayer.set('left',alignobj.actualleft+labellayer.getWidth()/2);
			else if(alignobj.alignment==='right')
				labellayer.set('left',alignobj.actualright-labellayer.getWidth()/2);
			canvas.renderAll(true);
		}

		$(labelbounds).on('click',function(){
			$(labelboundsave).show();
			$(labelboundcancel).show();
			$(labelbounds).attr('disabled', true);
			labellayer.lockMovementX = true;
			labellayer.lockMovementY = true;			
			labellayer.hasControls = false;
			alignobj.boundingRect = new fabric.Rect({ left: labellayer.left-10, top: labellayer.top-10, width: labellayer.getWidth()+10, height: labellayer.getHeight()+10, opacity:0.3 });
			
			canvas.add(alignobj.boundingRect);
		});
		$(labelboundsave).on('click', function(){
			$(labelbounds).attr('disabled', false);
			$(labelboundsave).hide();
			$(labelboundcancel).hide();
			labellayer.hasControls = true;
			labellayer.lockMovementX = false;
			labellayer.lockMovementY = false;
			boundRect[alignobj.index] = alignobj.boundingRect;
			maxwidth[alignobj.index] = alignobj.boundingRect.getWidth();
			canvas.remove(alignobj.boundingRect);
		});
		$(labelboundcancel).on('click', function(){
			$(labelbounds).attr('disabled', false);
			$(labelboundcancel).hide();
			$(labelboundsave).hide();
			labellayer.hasControls = true;
			labellayer.lockMovementX = false;
			labellayer.lockMovementY = false;
			canvas.remove(alignobj.boundingRect);
		});
		labellayer.lockRotation = true;

	};
	
	//handler to generate badges/stop generation
	$("span#genimages > button#save").on('click',function(){
		if($("span#genimages > button#save").html()=='Next')
		{
			save();
			$("span#genimages > button#save").html('Stop');
			$("span#genimages > button#save").attr('title','Click to stop badge creation');
		}
		else
		{
			isStopSave = true;
		}
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
			$("div#ziplink > a").attr({'download': localStorage['projectname']+'.zip','href':blobURL});
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
		$("span#genimages > button#save").attr('title','Click to create all badges');
		$("#genimages").show();
		$("#ziplink").hide();
		$("#zipprogress").hide();
		zipthis.getBlobURL(function(blobURL, revokeBlobURL) {
			console.log('Zip revoked');
		});
		$("#finish").attr('margin-top','-30px');
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
});

	var index_i=1;
	var current_dataurl;
	var img = new Array();
	var testfileentry=new Array();

	function save()
	{
		canvas.deactivateAll();
		canvas.renderAll(true);	
		index_i=1;
		$("span#genimages > progress#gen").attr('max',data.length);
		$("span#genimages > progress#gen").show();
		window.requestFileSystem(window.TEMPORARY, 1024*1024, function(fs) {
  			fs.root.getDirectory('badges', {create: true}, function(dirEntry) {
    				
  			}, errorHandler);
		}, errorHandler);
  
		window.requestFileSystem(window.TEMPORARY, 10*1024*1024, saveImages, errorHandler);
		
	};
	
	function saveImages(fs)
	{
		if(data[index_i].length == 0) {
			 console.log("Empty row in the CSV file"); }
		else {
		
		$.each(indexes,function(index_j,value_j)
		{		
				labellayer[index_j].scaleX = 1;
				labellayer[index_j].scaleY = 1;			
				labellayer[index_j].set('text', data[index_i][value_j]);
				canvas.renderAll(true);
				if(isqrcode==='true')
				{
					var qrdata="";
					for(var k = 0; k < qr_indexes.length; k++)
					{
						qrdata+=data[index_i][qr_indexes[k]]+"\n";
					}
					$('#qrcode > canvas').remove();
					$('#qrcode').qrcode({width: qrlayer.getWidth(),height: qrlayer.getHeight(),text: qrdata});
					qrdataurl = $('#qrcode > canvas')[0].toDataURL('image/png');
					qrlayer.getElement().src = qrdataurl;				
					canvas.renderAll(true);	
				}
				if( typeof boundRect[index_j] === 'object')
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
		writefile(fs);
	};

	function writefile(fs)
	{
		var current_dataurl = canvas.toDataURL('png');
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
		fs.root.getFile('/badges/badge'+index_i+'.png', {create: true}, function(fileEntry) {

			testfileentry[index_i] = fileEntry;
  			fileEntry.createWriter(function(fileWriter) {
				fileWriter.write(current_blob);
				if(isStopSave === true)
				{
					$("span#genimages > button#save").html('Next');
					$("span#genimages > button#save").attr('title','Click to create all badges');
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
					_gaq.push(['_trackEvent', 'Badge', 'Created', localStorage["projectname"], data.length]);
					$("#comp-select").hide();
					$("#customize").hide();
					$("#genimages").hide();
					$("#zip").show();
					$("#print").show();
					$("#back").show();
					$("#finish").attr('margin-top','10px');
				}						
			});
		});
	};

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


	var zipthis = (function(obj) {
		var zipFileEntry, zipWriter, writer, creationMethod, URL = obj.webkitURL || obj.URL;

		return {
			
			addFiles : function addFiles(oninit, onadd, onprogress, onend) {
				var addIndex = 1;

				function nextFile() {

					//window.webkitResolveLocalFileSystemURL(url, function(fileEntry) {
						var filename = 'badge'+addIndex+'.png';
						testfileentry[addIndex].file(function(file){
							onadd(file);
							zipWriter.add(filename, new zip.BlobReader(file), function() {
								
								if (++addIndex < localStorage['numentries'])
									nextFile();
								else
									onend();
							}, onprogress);
						});
					//});
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
