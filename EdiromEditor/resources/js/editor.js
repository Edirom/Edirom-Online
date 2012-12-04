var uri = $('#editorSourceUri')[0].value;

if(uri == '')
    ee_chooseFile();

else
    ee_loadSource();

function ee_chooseFile() {
    $.jstree._themes = 'resources/jstree/themes/';
    
    $('#selectFileLabel').show();

    $("#editor").jstree({
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
}

function ee_loadSource() {
    $.get("data/getObject.xql", { uri: uri },
        function(data) {
            ee_initEditor(data);
    });
}

function ee_initEditor(data) {

    editor = ace.edit("editor");
    editor.setTheme("ace/theme/ambience");

    var EditSession = require('ace/edit_session').EditSession;
    
    var mode = ee_getEditorMode($('#editorSourceType')[0].value);
    var UndoManager = require("ace/undomanager").UndoManager;
    var sess = new EditSession(data, mode);
    sess.setUndoManager(new UndoManager());
    editor.setSession(sess);
    
/*    editor.getSession().on('change', function(event) {
    });*/
    
    $('#editorTools').show();
    
    /* Toolbar */
    $('#editorToolSave').bind('click', function(event) {
        save(editor);
    });
    $('#editorToolUndo').bind('click', function(event) {
        undo(editor);
    });
    $('#editorToolRedo').bind('click', function(event) {
        redo(editor);
    });
    
    
    /* Additional key bindings */
    editor.commands.addCommand({
        name: 'save',
        bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
        exec: function(editor) {
            save(editor);
        }
    });
}

function ee_getEditorMode(type) {
    
    var Mode = require("ace/mode/text").Mode;
    
    switch(type) {
        case 'xml': 
            Mode = require("ace/mode/xml").Mode;
            break;
        case 'xquery': 
            Mode = require("ace/mode/xquery").Mode;
            break;
        case 'javascript': 
            Mode = require("ace/mode/javascript").Mode;
            break;
        default: 
            break;
    }
    
    return new Mode();
}

function save(editor) {
    
    if(!editor.getSession().getUndoManager().hasUndo()) return;
    
    $.post("data/saveObject.xql", { uri: uri, doc: editor.getValue() },
        function(data) {
            editor.getSession().getUndoManager().reset();
    })
    .error(function(data) { console.log(data); });
}

function undo(editor) {
    
    if(!editor.getSession().getUndoManager().hasUndo()) return;
    
    editor.undo();
}

function redo(editor) {
    
    if(!editor.getSession().getUndoManager().hasRedo()) return;
    
    editor.redo();
}