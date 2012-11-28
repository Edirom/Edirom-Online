var uri = $('#editorSourceUri')[0].value;

if(uri == '') {

    $.jstree._themes = 'resources/jstree/themes/';
    
    $('#selectFileLabel').show();

    $("#xml-editor").jstree({
        'core' : {
            'animation': 300
        }, 
        "plugins" : [ "themes", "xml_data" ],
        "xml_data" : {
            "ajax" : {
                "url" : "data/getObjects.xql",
                "data": { mode: "tree" }
            },
            "xsl" : "nest"
        },
        "themes" : {
            "theme" : "classic",
            "dots" : false,
            "icons" : true
        }
    });
}else {
    $.get("data/getObject.xql", { uri: uri },
        function(data) {
            editor = ace.edit("xml-editor");
            editor.setTheme("ace/theme/ambience");
        
            var XmlMode = require("ace/mode/xml").Mode;
            editor.getSession().setMode(new XmlMode());
            editor.setValue(data, -1);
    });
}
