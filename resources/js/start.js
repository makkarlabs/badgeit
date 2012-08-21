var picker, picker1i,feed;
google.setOnLoadCallback(createPicker);
google.load('picker',1);

$(function() {
var holder = document.getElementById('holder');

localStorage["qrcode"] = "false";
if (typeof window.FileReader === 'undefined') {
  console.log('File reader API failed');
} else {
  console.log('success File API & FileReader available');
}

$('#qrcode').click(function() {
	
	if($(this).is(':checked')){
		$('#qrCodeSelect').show();
		localStorage["qrcode"] = "true";
		$('#qrCodeSelect').find('select').attr("required","required");
		} 
	else {
		$('#qrCodeSelect').hide();
		localStorage["qrcode"] = "false";
		$('#qrCodeSelect').find('select').removeAttr("required");
	}
});

 
holder.ondragover = function () { this.className = 'hover'; return false; };
holder.ondragend = function () { this.className = ''; return false; };
holder.ondrop = function (e) {
  this.className = '';
  e.preventDefault();

  var file = e.dataTransfer.files[0],
      reader = new FileReader();
  reader.onload = function (event) {
    console.log(event.target);
    localStorage["event-template"] = event.target.result;
	
	$('#badgepreview').attr('src', event.target.result);
			
	var img = $("#badgepreview"); 
	$("<img/>") // Make in memory copy of image to avoid css issues
		.attr("src", $(img).attr("src"))
		.load(function() {
	$("#pixelwidth").val(this.width);   // Note: $(this).width() will not
	$("#pixelheight").val(this.height); // work for in memory images.
	});
	$("#holderCaption").hide();
	$('#holder').css('border','0px');
	$('#holder').css('background-color','white');
	$('#templateChooser').removeAttr("required");
  };
  console.log(file);
  reader.readAsDataURL(file);
 
  return false;
};
$('#template_fs').on('click',function(e){
	e.preventDefault();
	$('#template_fs').hide();
	$('#template_gd').hide();
	$('#fs_input').show();
});
$('#template_gd').on('click',function(e){
	e.preventDefault();
	$('#template_fs').hide();
	$('#template_gd').hide();
	$('#gd_input').show();
	picker.setVisible(true);
	
});
$('#list_fs').on('click',function(e){
	e.preventDefault();
	$('#list_fs').hide();
	$('#list_gd').hide();
	$('#fs_list').show();
});
$('#list_gd').on('click',function(e){
	e.preventDefault();
	$('#list_fs').hide();
	$('#list_gd').hide();
	$('#gd_list').show();
	picker1.setVisible(true);
	
});
});
function change()
{
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
		});
	$("#holderCaption").hide();
	$('#holder').css('border','0px');
	$('#holder').css('background-color','white');
}
function readFileAsDataURL(file, imageName) {
	
    var reader = new FileReader();
    
    reader.onload = function(event) {
	localStorage[imageName] = 
		event.target.result;
	loadPreview(event.target.result);	
    		
    	};
	reader.readAsDataURL(file);
}

function getAsText(fileToRead, localName)
{
       var reader = new FileReader();
       reader.readAsText(fileToRead);
       reader.onload = function(event){                        
            localStorage[localName] = event.target.result;
			
	     createMultipleSelect(event.target.result, 'csvColumnsSelect', 'colselect', 'selected-cols');
		 
		 createMultipleSelect(event.target.result, 'qrCodeSelect', 'qrselect', 'qr-cols');
		 $('#qrCodeSelect').hide();
       };
       reader.onerror = function(event){
            console.log("The Error is"+event.target.error.name);
       };
}

function createMultipleSelect(fileString, placeid, colselectid, localStorageName)
{
	
	csv_text = $.csv2Array(fileString);
	$("#"+placeid).html("<select id="+ colselectid +" multiple='multiple'></select>");
	var i = 0;
	while(i<csv_text[0].length)
	{
		$("#"+colselectid).append('<option value='+i+'>'+csv_text[0][i++]+'</option>');
	}
	$("#"+colselectid).change(function(){        
		localStorage[localStorageName]=$("#"+colselectid).val() || [];;
		});
}


function clear() {
	$("#badgepreview").val("");
	$("#form1").find(':input').each(function() {
        switch(this.type) {
            case 'password':
            case 'select-multiple':
            case 'select-one':
            case 'text':
            case 'textarea':
                $(this).val('');
                break;
            case 'checkbox':
            case 'radio':
                this.checked = false;
        }
    });
};

function move() {
	
	_gaq.push(['_trackEvent', 'Template', 'Submit', 'Project', localStorage["projectname"]]);
	localStorage["dimensions"] = $('#pixelwidth').val()+','+$('#pixelheight').val()+','+$('#inchwidth').val()+','+$('#inchheight').val();
	
}


function createPicker() {
       picker = new google.picker.PickerBuilder().
            addView(google.picker.ViewId.DOCS_IMAGES).
            setCallback(pickerCallbackImage).
	    setAppId('434888942442.apps.googleusercontent.com').
            build();
       picker.setVisible(false);

	picker1 = new google.picker.PickerBuilder().
            addView(google.picker.ViewId.SPREADSHEETS).
            setCallback(pickerCallbackSheet).
	    setAppId('434888942442.apps.googleusercontent.com').
            build();
       picker1.setVisible(false);
}

function pickerCallbackImage(data) {
      var fileid = 'nothing';
      if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) 
      {
        var doc = data[google.picker.Response.DOCUMENTS][0];
        fileid = doc[google.picker.Document.ID];
	$('#google_image').val(doc[google.picker.Document.NAME]);

       	gapi.client.request({'path':'/drive/v2/files/'+fileid,'params':{'access_token':localStorage['accesstoken']},'callback':handleDriveImage});
    }
}
function pickerCallbackSheet(data) {
      var fileid = 'nothing';
      if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) 
      {
        var doc = data[google.picker.Response.DOCUMENTS][0];	
        fileid = doc[google.picker.Document.ID];
	$('#csvGoogle').val(doc[google.picker.Document.NAME]);
       	gapi.client.request({'path':'/drive/v2/files/'+fileid,'params':{'access_token':localStorage['accesstoken']},'callback':handleDriveSheet});	
    }
}


function handleDriveImage(response) {
		
	console.log(response);
	var BlobBuilder = window.WebKitBlobBuilder || window.BlobBuilder;
	var oReq = new XMLHttpRequest();
	oReq.open("GET", response.downloadUrl+'&access_token=' + encodeURIComponent(localStorage['accesstoken']), true);
	oReq.responseType = "arraybuffer";
 
	oReq.onload = function(oEvent) {
	  var blobBuilder = new BlobBuilder();
	  blobBuilder.append(oReq.response);
	  var blob = blobBuilder.getBlob(response.mimeType);
	  var rdr = new FileReader();
	  rdr.onload = function(event){localStorage['event-template'] = event.target.result;
					loadPreview(event.target.result);};
	  rdr.readAsDataURL(blob);
	};
 
	oReq.send();
}
function handleDriveSheet(response) {
	var url = response.exportLinks['application/pdf'].substring(0,response.exportLinks['application/pdf'].length-3)+'csv&access_token='+localStorage['accesstoken'];
	console.log(url);
	$.ajax({'url':'http://badgeitrelay.appspot.com/badgeitrelay?link='+ encodeURIComponent(url), 'crossDomain':true}).
		done(function(data){
			localStorage['event-csv']=data;
			 createMultipleSelect(data, 'csvColumnsSelect', 'colselect', 'selected-cols');
			 createMultipleSelect(data, 'qrCodeSelect', 'qrselect', 'qr-cols');
			 $('#qrCodeSelect').hide();
		});

}