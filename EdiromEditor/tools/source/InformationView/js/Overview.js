de.edirom.server.source.Overview = Class.create(de.edirom.server.main.Content, {
    
    buttonEnabled: true,
    
    initialize: function ($super, view) {
        $super(view, 'content_source_informationView_overview');
    },
    
    load: function ($super) {
        if (! this.isLoaded()) {
            
            new Ajax.Updater(this.id, '/source/InformationView/xql/overview.xql', {
                method: 'get',
                onComplete: function (transport) {
                    $super();
                    this.init();
                }
                .bind(this)
            });
        }
    },
    
    init: function () {
        
        this.scrollview = new de.edirom.server.Scrollview('structure_container', true);
        this.scrollview.setVerticalScrolling(true);
                
        if ($('sourceId').value == '-1') {
            
            $('saveBox').show();
            
           /* Event.observe($('sourceDatingInput'), 'keyup', function(event) {
                // input validating checks
                var dateInput = Event.element(event).getValue().trim();
                var valF = Event.element(event).next('.inputValidationFeedbackContext');
                if (dateInput != "" && validateXQueryDate(dateInput) == false) {
                    var warning = "Ungültiges Datum. Bitte das Format JJJJ-MM-TT verwenden.";
                    if (!valF)
                        Event.element(event).insert({after: '<span class="inputValidationFeedbackContext">'+warning+'</span>'});
                    else
                        valF.innerHTML = warning;
                    this.buttonEnabled = false;
                } else if (valF) {
                    // input is correct
                    valF.innerHTML = "";
                    this.buttonEnabled = true;
                }
            }
            .bindAsEventListener(this));*/
            Event.observe($('sourceDatingInput'), 'keyup', function(event) { $('inputValidationFeedback').innerHTML = ""; });
            Event.observe($('workInput'), 'keyup', function(event) { $('inputValidationFeedback').innerHTML = ""; });
            Event.observe($('composerInput'), 'keyup', function(event) { $('inputValidationFeedback').innerHTML = ""; });
            Event.observe($('nameInput'), 'keyup', function(event) { $('inputValidationFeedback').innerHTML = ""; });
            Event.observe($('sourceSignatureInput'), 'keyup', function(event) { $('inputValidationFeedback').innerHTML = ""; });
            
            Event.observe($('cancelButton'), 'click', function (event) {
                if (this.buttonEnabled)
                window.status = 'edirom:de.edirom.server:closeWindow';
            }
            .bindAsEventListener(this));
            
            Event.observe($('saveButton'), 'click', function (event) {
                if (this.buttonEnabled) {
                    this.buttonEnabled = false;
                    this.createNewSource();
                }
            }
            .bindAsEventListener(this));
        } else {
            
            var source = this.view.getModule().getSource();
            
            $('workInput').value = source.getWorkName();
            $('composerInput').value = source.getComposer();
            $('nameInput').value = source.getName();
            $('sourceSignatureInput').value = source.getSignature();
            $('sourceDatingInput').value = source.getDating();
            
            for(var i = 0; i < $('sourceTypeInput').length; i++) {
                if($('sourceTypeInput').options[i].value == source.getType())
                    $('sourceTypeInput').selectedIndex = i;
            }
            
            //selectedIndex = der index, dessen value = source.getType();
            //$('sourceTypeInput').selectedIndex.value = source.getType();
            
            this.addListeners();
        }
    },
    
    addListeners: function () {
        var source = this.view.getModule().getSource();
        
        var controller = this.view.getModule().getCommandController();
        
        source.addListener(new de.edirom.server.data.DataListener(function (event) {
            
            if (event.field == 'name')
            $('nameInput').value = event.getValue(); else if (event.field == 'signature')
            $('sourceSignatureInput').value = event.getValue(); else if (event.field == 'composer')
            $('composerInput').value = event.getValue(); else if (event.field == 'workName')
            $('workInput').value = event.getValue(); else if (event.field == 'dating')
            $('sourceDatingInput').value = event.getValue(); else if (event.field == 'type')
            $('sourceTypeInput').selectedIndex.value = event.getValue();
        }));
        
        Event.observe($('sourceSignatureInput'), 'keyup', function (event, controller, source) {
            window.setTimeout(this.inputFieldChanged.bind(this, controller, source, 'signature', $('sourceSignatureInput').value, 'sourceSignatureInput'), 600);
        }
        .bindAsEventListener(this, controller, source));
        
        Event.observe($('nameInput'), 'keyup', function (event, controller, source) {
            window.setTimeout(this.inputFieldChanged.bind(this, controller, source, 'name', $('nameInput').value, 'nameInput'), 600);
        }
        .bindAsEventListener(this, controller, source));
        
        Event.observe($('composerInput'), 'keyup', function (event, controller, source) {
            window.setTimeout(this.inputFieldChanged.bind(this, controller, source, 'composer', $('composerInput').value, 'composerInput'), 600);
        }
        .bindAsEventListener(this, controller, source));
        
        Event.observe($('workInput'), 'keyup', function (event, controller, source) {
            window.setTimeout(this.inputFieldChanged.bind(this, controller, source, 'workname', $('workInput').value, 'workInput'), 600);
        }
        .bindAsEventListener(this, controller, source));
        
        Event.observe($('sourceDatingInput'), 'keyup', function (event, controller, source) {
            window.setTimeout(this.inputFieldChanged.bind(this, controller, source, 'dating', $('sourceDatingInput').value, 'sourceDatingInput'), 600);
        }
        .bindAsEventListener(this, controller, source));
        
        Event.observe($('sourceTypeInput'), 'change', function (event, controller, source) {
            controller.addCommand(new de.edirom.server.main.ChangeFieldCommand(source, "type", $('sourceTypeInput').options[$('sourceTypeInput').selectedIndex].value));
        }
        .bindAsEventListener(this, controller, source));
    },
    
    inputFieldChanged: function (controller, subject, field, value, fieldID) {
        
        if (typeof this.inputFieldChanges == 'undefined')
            this.inputFieldChanges = new Array();
        
        if (typeof this.inputFieldChanges[field] == 'undefined')
            this.inputFieldChanges[field] = 'undefined';
        
        if (this.inputFieldChanges[field] != value && $(fieldID).value == value && subject.getField(field) != value) {
            controller.addCommand(new de.edirom.server.main.ChangeFieldCommand(subject, field, value));
            this.inputFieldChanges[field] = value;        
        }
    },
    
    createNewSource: function () {
        var work = $('workInput').value.trim();
        var composer = $('composerInput').value.trim();
        var name = $('nameInput').value.trim();
        var signature = $('sourceSignatureInput').value.trim();
//        var dating = validateXQueryDate( $('sourceDatingInput').value.trim() );
//        if (dating == false) dating = "";
        var dating = $('sourceDatingInput').value.trim();
        var type = $('sourceTypeInput').options[$('sourceTypeInput').selectedIndex].value;
        
        if (work.blank() && composer.blank() && name.blank() && signature.blank()) {
            $('inputValidationFeedback').innerHTML = "Werk, Komponist, Bezeichnung oder Signatur erforderlich.";
            this.buttonEnabled = true;
            return;
        }
        
        new Ajax.Request('../data/xql/createSource.xql', {
            method: 'get',
            parameters: {
                fields: 'workInput' + '__%__' + 'composerInput' + '__%__' + 'nameInput' + '__%__' + 'sourceSignatureInput' + '__%__' + 'sourceDatingInput' + '__%__' + 'sourceTypeInput',
                values: work + '__%__' + composer + '__%__' + name + '__%__' + signature + '__%__' + dating + '__%__' + type
            },
            onSuccess: function (transport) {
                var id = transport.responseText;
                if (id.indexOf('ERROR') != - 1)
                alert('Quelle konnte nicht angelegt werden: \n\n' + transport.responseText); else
                window.location.href = '/source/index.xql?id=' + id;
            }
            .bind(this),
            onFailure: function (transport) {
                alert('Quelle konnte nicht angelegt werden: \n\n' + transport.responseText);
            }
        });
    },
    
    setVisible: function ($super, visible) {
        
        $super(visible);
        
        if (visible)
        this.view.module.getShortcutController().addShortcutListener('content', 'content.overview', function (event) {
            return false;
        }); else
        this.view.module.getShortcutController().removeShortcutListener('content', 'content.overview');
        
        if (this.scrollview)
        this.scrollview.refresh();
    }
});