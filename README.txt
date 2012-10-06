Aim of this project is to help people organising events to generate Badges with a template and a csv file.

COMPONENTS
1. We have used fabric.js for canvas and text rendering.
2. Bootstrap for the UI components.
3. zip.js for Zipping the images.
4. HTML5 Filesystem API for saving files locally.

FILES
home.html   - Homepage with a slideshow - How to badgeit.
start.html  - Contains the Form which gets the template and CSV + required attributes.
create.html - Contains the canvas layout (Heart of the application).
about.html  - Basic about page
faq.html    - Answers for basic questions about the app.

FONT RENDERING
Apart from the basic CSS font, we have also used Google Webfonts served from our own server
"bootstrap/css/fonts" directory has the necessary .ttf files and "bootstrap/css/fonts.css" has the css which includes the fonts.

.box {margin-bottom:100px;}
.holder{width:1050px;margin-left:auto;margin-right:auto}
.tagline{text-align:center;font-family:Rancho;font-size:40px;color:gray;}
#authnstart{margin-left: 360px;}
.badges{margin-top:50px;padding-bottom:30px;}
.screenshot{margin-right:20px; margin-left:20px;}
.lmargin{margin-left:20px;}