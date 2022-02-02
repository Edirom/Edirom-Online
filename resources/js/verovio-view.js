window.vrvToolkit = new verovio.toolkit();
showMovement();

function showMovement(movementId) {        
    
    showLoader();
    
    var initHeight = Math.floor($(document).height() * 100.0 / 33.0) - 35;
    var initWidth = Math.floor($(document).width() * 100.0 / 33.0);

    var options = {
        'scale': 33,
	    'pageHeight': initHeight,
	    'pageWidth': initWidth,
	    'adjustPageHeight': 1
    };

    /* Load the file using HTTP GET */
    var url = "/data/xql/getMusicInMdiv.xql?uri=" + uri + "&edition=" + edition;
    if(typeof movementId !== 'undefined') {
        url += "&movementId=" + movementId;
    }
    
    $.get(url, function( data ) {
        var svg = vrvToolkit.renderData(data, options);
        $("#output").html(svg);
        initData();
    }, 'text');
}

function initData() {
    page = 1;
    pageCount = vrvToolkit.getPageCount();
    
    updatePageData();
}

function updatePageData() {
    $("#page").html(page);
    $("#pageCount").html(pageCount);
    
    var url = "/data/xql/getAnnotationsInRendering.xql?uri=" + uri + "&edition=" + edition;
    url += "&measureIds=" + getMeasureIds();
    
    $.getJSON(url, function( data ) {
        $.each( data, function( key, val ) {
            
            var rect = $('#' + val.measureId)[0].getBBox();
            
            var xmlns = "http://www.w3.org/2000/svg";
            var svgRect = document.createElementNS(xmlns, "rect");
            svgRect.setAttributeNS(null, "id", val.measureId + "_" + val.id);
            svgRect.setAttributeNS(null, "x", rect.x);
            svgRect.setAttributeNS(null, "y", rect.y);
            svgRect.setAttributeNS(null, "width", rect.width);
            svgRect.setAttributeNS(null, "height", rect.height);
            svgRect.setAttributeNS(null, "fill", "#ff0000");
            svgRect.setAttributeNS(null, "fill-opacity", "0.3");
            svgRect.setAttributeNS(null, "stroke", "#ff0000");
            svgRect.setAttributeNS(null, "stroke-width", "20px");
            
            $('#' + val.measureId)[0].append(svgRect);
            
            Tipped.create('#' + val.measureId + "_" + val.id, {
                ajax: {
                    url: '/data/xql/getAnnotation.xql',
                    type: 'post',
                    data: {
                        uri: val.uri,
                        target: 'tip',
                        edition: edition
                    }
                },
                hideDelay: 1000,
                skin: 'gray'
            });
        });
    });
}

function getMeasureIds() {
    var measureIds = "";
    $("#output svg .measure").each(function(n, measure) { measureIds += measure.id + ","; } );
    return measureIds;
}

function prevPage() {
    if(page == 1) return;
    page--;
    var svg = vrvToolkit.renderToSVG(page);
    $("#output").html(svg);
    updatePageData();
}

function nextPage() {
    if(page == pageCount) return;
    page++;
    var svg = vrvToolkit.renderToSVG(page);
    $("#output").html(svg);
    updatePageData();
}

function showLoader() {
    $("#output").empty();
    $(".lds-roller").clone().appendTo("#output");
}