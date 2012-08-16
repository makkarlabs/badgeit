var picker;
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
	var eventtemplate = 'event-template';
	$('#template_chooser').html('<input type="file" class="input-file" id="templateChooser" required="required" onchange="readFileAsDataURL(this.files[0], eventtemplate);"></input>');
});
$('#template_gd').on('click',function(e){
	e.preventDefault();
	$('#template_chooser').html('<input readonly="readonly" placeholder="Google Drive Image" id="google_image" />');
	picker.setVisible(true);
	
});

});

function readFileAsDataURL(file, imageName) {
	
    var reader = new FileReader();
    
    reader.onload = function(event) {
	localStorage[imageName] = 
		event.target.result;
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
            setCallback(pickerCallback).
	    setAppId('434888942442.apps.googleusercontent.com').
            build();
       picker.setVisible(false);
}

function pickerCallback(data) {
      var fileid = 'nothing';
      if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
        var doc = data[google.picker.Response.DOCUMENTS][0];
        fileid = doc[google.picker.Document.ID];
      }

      $('#google_image').val(fileid);
      $.ajax({'url':'https://www.googleapis.com/drive/v2/files/'+fileid
	}).done(function(data){
		alert(data);
	});

}


