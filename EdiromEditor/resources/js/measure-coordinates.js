var uri = $('#measureCoordUri')[0].value;

var path = window.location.pathname;
var basePath = window.location.protocol + '//' + window.location.host + path.substring(0, path.lastIndexOf('/'));

$('#measureCoordIframe')[0].src = basePath + "/tools/source/index.xql?uri=" + uri;

