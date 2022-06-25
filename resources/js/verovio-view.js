window.vrvToolkit = new verovio.toolkit();
showMovement(movementId);

function showMovement(movementId) {        
    
    showLoader();
    
    window.movementId = movementId;
    
    var initHeight = Math.floor($(document).height() * 100.0 / 33.0) - 35;
    var initWidth = Math.floor($(document).width() * 100.0 / 33.0);

    var options = {
        'scale': 33,
	    'pageHeight': initHeight,
	    'pageWidth': initWidth,
	    'adjustPageHeight': 1,
	    'header': 'none',
	    'svgBoundingBoxes': true,
	    'svgHtml5': true
    };

    /* Load the file using HTTP GET */
    var url = appBasePath + "/data/xql/getMusicInMdiv.xql?uri=" + uri + "&edition=" + edition    + "&movementId=" + movementId;
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
    
    document.querySelectorAll('.annot.editorialComment:not(.bounding-box), .annot.annotRef:not(.bounding-box)').forEach((annot) => {
        const measure = annot.closest('.measure');
        const staff1 = measure.querySelector('.staff path').getBBox();
        const annotId = annot.getAttributeNS(null, 'data-id');
        
        const annotCount = measure.querySelectorAll('.annotIcon').length;

        const xmlns = "http://www.w3.org/2000/svg";
        const annotIcon = document.createElementNS(xmlns, "rect");
        annotIcon.setAttributeNS(null, "data-id", annotId);
        annotIcon.setAttributeNS(null, "class", 'annotIcon ' + annot.getAttributeNS(null, 'class'));
        annotIcon.setAttributeNS(null, "x", staff1.x + 100 + (annotCount * 450));
        annotIcon.setAttributeNS(null, "y", staff1.y - 700);
        annotIcon.setAttributeNS(null, "width", 350);
        annotIcon.setAttributeNS(null, "height", 250);

        measure.append(annotIcon);
        
        annotIcon.addEventListener('click', (e) => {
            parent.loadLink(uri + '#' + annotId);
        });
        
        Tipped.create(annotIcon, {
            ajax: {
                url: '/exist/apps/Edirom-Online/data/xql/getAnnotation.xql',
                type: 'post',
                data: {
                    uri: uri + '#' + annotId,
                    target: 'tip',
                    edition: edition
                }
            },
            target: 'mouse', 
            hideDelay: 1000,
            skin: 'gray',
            containment: {
                  selector: '#output',
                  padding: 0
                }
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