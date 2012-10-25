var doc;
var xpos,ypos;
var remainingHeight, remainingWidth;
var imgWidth, imgHeight;
var orient, papersize;
var counter;
var URL = this.webkitURL || this.URL;
window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;
var settings = new Store("settings");
function printToPdf(orientval,papersizeval)
{	
	counter = 1;
	orient = orientval;
	papersize = papersizeval;
	doc = new jsPDF(orient,'pt',papersize);
	xpos = 0;
	ypos = 0;
	var dimensions = settings.get('badgeProps').dimensions;
	imgWidth = +dimensions.inchwidth*72;
	imgHeight = +dimensions.inchheight*72;
	setRemainingHeight();
	setRemainingWidth();	
	getImageFromUrl('filesystem:http://makkarlabs.in/temporary/badges/badge'+1+'.jpeg', createPDF);
}
var getImageFromUrl = function(url, callback) {
	var data;	
	window.resolveLocalFileSystemURL(url, function(fileEntry) {
 		fileEntry.file(function(file) {
			var reader = new FileReader();
			reader.onloadend = function(e) {
				data = this.result;
				if (typeof callback === 'function') {
					callback(data);
				}
			};
			reader.readAsBinaryString(file);
		}, errorHandler);
	});
}

var createPDF = function(imgData) {
	doc.addImage(imgData, 'JPEG', xpos, ypos, imgWidth, imgHeight);
	remainingWidth-=imgWidth;
	if(remainingWidth > imgWidth)
	{
		xpos+=imgWidth;
	} 
	else
	{
		if(remainingHeight > imgHeight)
		{
			xpos=0;
			ypos+=imgHeight;
			remainingHeight-=imgHeight;
			setRemainingWidth();
		}
		else
		{
			xpos = ypos = 0;
			setRemainingHeight();
			setRemainingWidth();
			if(counter+1 < settings.get('numentries'))
				doc.addPage();
		}
	}
	if(++counter < settings.get('numentries'))
		getImageFromUrl('filesystem:http://makkarlabs.in/temporary/badges/badge'+counter+'.jpeg', createPDF);
	else
	{
		blob = dataURItoBlob(doc.output('datauristring'));
		var blobURL = URL.createObjectURL(blob);
		$('#downloadpdf').attr({'download': settings.get('badgeProps').projectName+'.pdf','href':blobURL});
		$('#downloadpdf').show();
		$('#triggerprint').button('reset');
	}
}

function setRemainingWidth()
{
	if(orient == 'p')
	{
		if(papersize == 'a4')
		{
			remainingWidth = 595.28;
		}
		else
		{
			remainingWidth = 841.89;
		}
	}
	else
	{
		if(papersize == 'a4')
		{
			remainingWidth = 841.89
		}
		else
		{
			remainingWidth = 1190.55;
		}
	}
}

function setRemainingHeight()
{
	if(orient == 'p')
	{
		if(papersize == 'a4')
		{
			remainingHeight = 841.89-imgHeight;
		}
		else
		{
			remainingHeight = 1190.55-imgHeight;
		}
	}
	else
	{
		if(papersize == 'a4')
		{
			remainingHeight = 595.28-imgHeight;
		}
		else
		{
			remainingHeight = 841.89-imgHeight;
		}
	}
}
function dataURItoBlob(dataURI) {
	var byteString = atob(dataURI.split(',')[1]);
    var mimeString = {type: dataURI.split(',')[0].split(':')[1].split(';')[0]};
    var ab = new ArrayBuffer(byteString.length);
	var ia = new Uint8Array(ab);
   	for (var i = 0; i < byteString.length; i++) {
    		ia[i] = byteString.charCodeAt(i);
    }
	var bb = new window.WebKitBlobBuilder();
	bb.append(ab);
	return bb.getBlob(mimeString);
}