var isDriveAuth = false;
var config = {
          'client_id': '434888942442.apps.googleusercontent.com',
          'scope': 'https://www.googleapis.com/auth/drive',
	      'immediate':false
        };
        
function hideDriveButtons() {
	$("#template_gd").hide();
	$("#list_gd").hide();
}

function setFileChooseHandlers() {
	$('#template_fs').on('click',function(e){
		e.preventDefault();
		$('#template_fs').hide();
		$('#template_gd').hide();
		$('#fs_input').show();
	});

	$('#template_gd').on('click',function(e){
		e.preventDefault();
		if(!isDriveAuth)
		{ 
			gapi.auth.authorize(config, function(authresult) {
				if(authresult && !authresult.error)
				{	isDriveAuth = true;
					$('#template_fs').hide();
					$('#template_gd').hide();
					$('#gd_input').show();
					if(source==='create')
					{
						$('#editImage').hide();
					}
					imagePicker.setVisible(true);
				}
			});
		}
		else
		{
			$('#template_fs').hide();
			$('#template_gd').hide();
			$('#gd_input').show();
			imagePicker.setVisible(true);
		}
	});

	$('#list_fs').on('click',function(e){
		e.preventDefault();
		$('#list_fs').hide();
		$('#list_gd').hide();
		$('#fs_list').show();
	});

	$('#list_gd').on('click',function(e){
		e.preventDefault();
		if(!isDriveAuth) { 
			gapi.auth.authorize(config, function(authresult) {
				if(authresult && !authresult.error)
				{	isDriveAuth = true;
					$('#list_fs').hide();
					$('#list_gd').hide();
					$('#gd_list').show();
					if(source==='create')
					{
						$('#editData').hide();
					}
					sheetPicker.setVisible(true);
				}
			});
		}
		else {
			$('#list_fs').hide();
			$('#list_gd').hide();
			$('#gd_list').show();
			sheetPicker.setVisible(true);
		}

	});

}

function change()
{
	$('#template_chooser').attr('required','required');
	$('#fs_input').hide();
	$('#gd_input').hide();		
	$('#template_fs').show();
	$('#template_gd').show();
}
function changeCsv()
{
	$('#fs_list').hide();
	$('#gd_list').hide();		
	$('#list_fs').show();
	$('#list_gd').show();
}

function loadPreview(image)
{
	$('#badgepreview').attr('src', image);
	var img = $("#badgepreview"); 
	$("<img/>") // Make in memory copy of image to avoid css issues
		.attr("src", $(img).attr("src"))
		.load(function() {
			$("#pixelwidth").val(this.width);   // Note: $(this).width() will not
			$("#pixelheight").val(this.height); // work for in memory images.
			aspectRatio = $('#pixelwidth').val() / $('#pixelheight').val();
			if(($('#dpi').val() != "") && !isNaN($('#dpi').val())) {
				$('#inchheight').val(($("#pixelheight").val() / $("#dpi").val()).toFixed(2));
				$('#inchwidth').val(($("#pixelwidth").val() / $("#dpi").val()).toFixed(2));
			}
		});
	$("#holderCaption").hide();
	$('#holder').css('border','0px');
	$('#holder').css('background-color','white');
}

function readFileAsDataURL(file) {
	if(source === 'create')
	{
		$('#newDataOk').button('loading');
		$('#newDataOk').removeClass('btn-success').addClass('btn-primary');
	}
    var reader = new FileReader();
    reader.onload = function(event) {
    	badgeProps.eventTemplate = event.target.result;
    	if(source === 'create')
		{
			$('#newDataOk').button('reset');
			$('#newDataOk').addClass('btn-success').removeClass('btn-primary');
		}
		loadPreview(event.target.result);		
    };
	reader.readAsDataURL(file);
}

function getAsText(fileToRead)
{
	if(source === 'create')
	{
		$('#newImageOk').button('loading');
		$('#newImageOk').removeClass('btn-success').addClass('btn-primary');
	}

   var reader = new FileReader();
   reader.readAsText(fileToRead);
   reader.onload = function(event){       

   	if(source === 'create')
	{
		if(!isCsvOk(event.target.result))
		{
			$('#editData').append("<h5 id='dataError'>Cannot set datasource due to column mismatch</h5>");
			$('#newImageOk').button('reset');
			$('#newImageOk').addClass('btn-warning').removeClass('btn-primary');
			return;
		}
		$('#newImageOk').button('reset');
		$('#newImageOk').addClass('btn-success').removeClass('btn-primary');
	}
   badgeProps.eventCSV = event.target.result;
   if(source === "start") {
		           
	   $('#csvColumnsSelect').empty();	
	     createMultipleSelect(event.target.result, 'csvColumnsSelect', 'colselect');
	   $('#qrCodeSelect').empty();
		 createMultipleSelect(event.target.result, 'qrCodeSelect', 'qrselect');
		 $('#qrCodeSelect').hide();
       };
		}
   reader.onerror = function(event){
        console.log("The Error is"+event.target.error.name);
   };
}

function createPicker() {

	$("#template_gd").show();
	$("#list_gd").show();
    imagePicker = new google.picker.PickerBuilder().
    	addView(google.picker.ViewId.DOCS_IMAGES).
    	setCallback(pickerCallbackImage).
		setAppId('434888942442.apps.googleusercontent.com').
		build();
	imagePicker.setVisible(false);

	sheetPicker = new google.picker.PickerBuilder().
        addView(google.picker.ViewId.SPREADSHEETS).
        setCallback(pickerCallbackSheet).
	    setAppId('434888942442.apps.googleusercontent.com').
        build();
	sheetPicker.setVisible(false);

	projectPicker = new google.picker.PickerBuilder().
        addView(google.picker.ViewId.DOCS).
        setCallback(pickerCallbackProject).
	    setAppId('434888942442.apps.googleusercontent.com').
        build();
	projectPicker.setVisible(false);
}

function pickerCallbackImage(data) {
    var fileid = 'nothing';
    if(source === 'create')
    {
    	$('#editImage').show();
    }
    if(data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
    	if(source === 'create')
		{
			$('#newImageOk').button('loading');
			$('#newImageOk').removeClass('btn-success').addClass('btn-primary');
		}
        var doc = data[google.picker.Response.DOCUMENTS][0];
        fileid = doc[google.picker.Document.ID];
		$('#google_image').val(doc[google.picker.Document.NAME]);
       	gapi.client.request({'path':'/drive/v2/files/'+fileid,'params':{'access_token':gapi.auth.getToken().access_token},'callback':handleDriveImage});
    }
}
function pickerCallbackSheet(data) {
	var fileid = 'nothing';
	if(source === 'create')
    {
    	$('#editData').show();
    }
    if(data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
    	if(source === 'create')
		{
			$('#newDataOk').button('loading');
			$('#newDataOk').removeClass('btn-success').addClass('btn-primary');
		}
        var doc = data[google.picker.Response.DOCUMENTS][0];	
        fileid = doc[google.picker.Document.ID];
		$('#csvGoogle').val(doc[google.picker.Document.NAME]);
       	gapi.client.request({'path':'/drive/v2/files/'+fileid,'params':{'access_token':gapi.auth.getToken().access_token},'callback':handleDriveSheet});	
    }
}

function pickerCallbackProject(data) {
	var fileid = 'nothing';
    if(data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
    	$("#triggerWait").click();
        var doc = data[google.picker.Response.DOCUMENTS][0];	
        fileid = doc[google.picker.Document.ID];
       	gapi.client.request({'path':'/drive/v2/files/'+fileid,'params':{'access_token':gapi.auth.getToken().access_token},'callback':handleDriveProject});	
    }
}

function handleDriveImage(response) {
	$('#holder>img').attr({'src':'bootstrap/img/loadingbig.gif','width':'100', 'height':'84'});
	$('#template_chooser').removeAttr('required');
	console.log(response);
	var BlobBuilder = window.WebKitBlobBuilder || window.BlobBuilder;
	var oReq = new XMLHttpRequest();
	oReq.open("GET", response.downloadUrl+'&access_token=' + encodeURIComponent(gapi.auth.getToken().access_token), true);
	oReq.responseType = "arraybuffer";
	oReq.onload = function(oEvent) {
		var blobBuilder = new BlobBuilder();
		blobBuilder.append(oReq.response);
		var blob = blobBuilder.getBlob(response.mimeType);
		var rdr = new FileReader();
		rdr.onload = function(event){
		    badgeProps.eventTemplate = event.target.result;
		    if(source === 'create')
			{
				$('#newImageOk').button('reset');
				$('#newImageOk').addClass('btn-success').removeClass('btn-primary');
			}
		    loadPreview(event.target.result);};
		rdr.readAsDataURL(blob);
	};
 
	oReq.send();
}

// This function should behave differently when included in the create screen. As in, just download and dont create any multiple selects
function handleDriveSheet(response) {
	$('#csvColumnsSelect').html("<img src='bootstrap/img/loading.gif' />");
	var url = response.exportLinks['application/pdf'].substring(0,response.exportLinks['application/pdf'].length-3)+'csv&access_token='+gapi.auth.getToken().access_token;
	$.ajax({'url':'https://badgeitrelay.appspot.com/badgeitrelay?link='+ encodeURIComponent(url), 'crossDomain':true}).
		done(function(data){
			if(source === 'create')
			{	
				if(!isCsvOk(data))
				{
					$('#editData').append("<h5 id='dataError'>Cannot set datasource due to column mismatch</h5>");
					$('#newDataOk').button('reset');
					$('#newDataOk').addClass('btn-warning').removeClass('btn-primary');
					return;
				}
				$('#newDataOk').button('reset');
				$('#newDataOk').addClass('btn-success').removeClass('btn-primary');
			}
			$('#csvColumnsSelect').html("");
		    badgeProps.eventCSV = data;
		    if(source === "start") {
				createMultipleSelect(data, 'csvColumnsSelect', 'colselect');
				createMultipleSelect(data, 'qrCodeSelect', 'qrselect');
				$('#qrCodeSelect').hide();
			}
			
		});

}

function handleDriveProject(response) {
	var url = response.downloadUrl;

	console.log(url);
	$.ajax({url:url+"&access_token="+gapi.auth.getToken().access_token, dataType: "text"})
		.done(function(data) {
			
			console.log("Saving response text");
			responseJSON = JSON.parse(data);
			console.log("Parsing the JSON");
			settings.set("canvas",responseJSON.canvas);
			settings.set("badgeProps",responseJSON.settings);
			settings.set("openFromDrive", true);
			$("#badgeinput")[0].submit();		
			
		})
		.fail(function(e){
			console.log("failed");
			console.log(e);
		});
	
}

function isCsvOk(data)
{
	var settings = new Store("settings");
	var maxSelection = settings.get("badgeProps").selectedCols.pop()+1;
	var arraydata = $.csv2Array(data);
	if(arraydata[0].length < maxSelection)
		return false;
	else
		return true;
}