window.vrvToolkit = new verovio.toolkit();
showMovement(movementId);

/* add event as constant */
const vrvToolkitDataInitialized = new Event("vrvToolkitDataInitialized");

/* add event listener to window */
window.addEventListener('vrvToolkitDataInitialized', (e) => {on_vrvToolkitDataInitialized()}, false);

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
    //dispatch vrvToolkitDataInitialized event
    window.dispatchEvent(vrvToolkitDataInitialized);
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

/**
 * Switch to page as defined by global page variable.
 */
function showPage() {
    if(page == 0) return;
    var svg = vrvToolkit.renderToSVG(page);
    $("#output").html(svg);
    updatePageData();
}

function showLoader() {
    $("#output").empty();
    $(".lds-roller").clone().appendTo("#output");
}

/**
 * Show a measure in verovio if the goto measure function is called from the GUI.
 * Calls showMovement() if call to measure doesn't match current movement.
 * @param {string} movementId - The XML-ID of the selected movement.
 * @param {string} measureId - The XML-ID of the selected measure.
 */
function showMeasure(movementId, measureId) {
    
    if (measureId == undefined) return;
    window.measureId = measureId;
    
    if(vrvToolkit.getPageWithElement(measureId) == 0) {
        showMovement(movementId);
    } else if(window.movementId == movementId) {
        if (page == vrvToolkit.getPageWithElement(measureId)) return;
        page = vrvToolkit.getPageWithElement(measureId);
        showPage();
    }
}

/**
 * Callback function on dispatch of vrvToolkitDataInitialized event
 */
function on_vrvToolkitDataInitialized(){
    console.log("event fired and catched");
    if (window.measureId == undefined ) return; 
    showMeasure(window.movementId, window.measureId); //? set window.measureId to undefined ?
}
