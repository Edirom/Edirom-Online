de.edirom.server.source.Pages = Class.create(de.edirom.server.main.Content, {
    initialize: function($super, view) {
        $super(view, 'content_source_informationView_pages');
        
        this.toolbarGroup = view.toolbarGroup;
        this.renamePagesAction = new de.edirom.server.source.RenamePagesAction(this.toolbarGroup, this);
        
        this.pagesToolbarItem = new de.edirom.server.source.RenamePagesToolbarItem(this.toolbarGroup, this.renamePagesAction);
        this.pagesToolbarItem.setVisible(false);
    },
    
    load: function($super) {
        if(!this.isLoaded()) {
		    
			new Ajax.Updater(this.id, '/source/InformationView/xql/pages.xql', {
        		method:'get',
        		onComplete: function(transport){
        			$super();
        			
        			this.init();
        		}.bind(this)
    		});
		}
    },
    
    init: function() {
        var source = this.view.getModule().getSource();
        var pages = source.getPages();

        for(var i = 0; i < pages.length; ++i)
            this.addPage(pages[i]);

        this.scrolltable = new de.edirom.server.Scrolltable('pages_list_container', 'pages_list', true);
        this.scrolltable.setVerticalScrolling(true);

        for(var i = 0; i < pages.length; ++i)
            this.addPageListeners(pages[i]);

        this.addListeners();
        this.buildSortableList();
    },
    
    addPage: function(page) {

        var tbody = $('pages_listBody');
        var template = $('row_page_template');

        var row = template.cloneNode(true);
        row.setAttribute('id', 'row_' + page.id);
        
        row.getElementsByClassName('openButton')[0].setAttribute('id', 'open_' + page.id);
        row.getElementsByClassName('openXMLButton')[0].setAttribute('id', 'openXML_' + page.id);
        row.getElementsByClassName('deleteButton')[0].setAttribute('id', 'delete_' + page.id);
        row.getElementsByClassName('pages_name_input')[0].setAttribute('id', page.id);
        row.getElementsByClassName('pages_name_input')[0].setAttribute('value', page.getName());

        row.getElementsByClassName('imageScale')[0].innerHTML = page.getWidth() + ' x ' + page.getHeight();
        row.getElementsByClassName('imageFileName')[0].innerHTML = page.getFileName();
        row.getElementsByClassName('imageDate')[0].innerHTML = page.getDate();
        
        row.getElementsByClassName('imageUri')[0].setAttribute('value', page.getPath());
        row.getElementsByClassName('imageUri')[0].setAttribute('id', 'imageUri_' + page.id);

        tbody.appendChild(row);
       
        if (this.scrolltable)
            this.scrolltable.refresh(0, 1000000);
    },

    addPageListeners: function(page) {

        var controller = this.view.getModule().getCommandController();

        Event.observe($(page.id), 'keyup', function(event, controller) {
            window.setTimeout(this.inputFieldChanged.bind(this, controller, page, 'name', $(page.id).value, page.id), 600);
        }.bindAsEventListener(this, controller, page.id));

        Event.observe($('open_' + page.id), 'click', function(event, pageID){
            module.showPage(pageID);
        }.bindAsEventListener(this, page.id));

        Event.observe($('openXML_' + page.id), 'click', function(event, pageID){
            module.showXMLPage(pageID);
        }.bindAsEventListener(this, page.id));

        Event.observe($('delete_' + page.id), 'click', this.deletePage.bindAsEventListener(this, source, page, controller));

        page.addListener(new de.edirom.server.data.DataListener(function(event) {

            var page = event.getSource();
            var row = $('row_' + page.id);

            if(event.field == 'name')
                $(page.id).value = event.getValue();

            else if(event.field == 'width' || event.field == 'height')
                row.getElementsByClassName('imageScale')[0].innerHTML = page.getWidth() + ' x ' + page.getHeight();

            else if(event.field == 'fileName')
                row.getElementsByClassName('imageFileName')[0].innerHTML = page.getFileName();

            else if(event.field == 'imageDate')
                row.getElementsByClassName('imageDate')[0].innerHTML = page.getDate();
        }));
    },
    
    inputFieldChanged: function(controller, subject, field, value, fieldID) {
    
        if(typeof this.inputFieldChanges == 'undefined')
            this.inputFieldChanges = new Array();
        
        if(typeof this.inputFieldChanges[fieldID + "_" + field] == 'undefined')
            this.inputFieldChanges[fieldID + "_" + field] = 'undefined';

        if(this.inputFieldChanges[fieldID + "_" + field] != value && $(fieldID).value == value && subject.getField(field) != value) {
            controller.addCommand(new de.edirom.server.main.ChangeFieldCommand(subject, field, value));
            this.inputFieldChanges[fieldID + "_" + field] = value;
        }
    },
     
    addListeners: function() {
    
        var source = this.view.getModule().getSource();
        source.addListener(new de.edirom.server.data.DataListener(function(event) {
                
            if(event.type == de.edirom.server.data.DataEvent.TYPE_REMOVED && event.field == 'page') {
                $('pages_listBody').removeChild($('row_' + event.getValue()));
                this.buildSortableList();
            
            }else if(event.type == de.edirom.server.data.DataEvent.TYPE_ADDED && event.field == 'page') {
                var page = event.getSource().getPage(event.getValue());
                this.addPage(page);
                this.addPageListeners(page)
                this.buildSortableList();
            
            }else if(event.type == de.edirom.server.data.DataEvent.TYPE_MODIFIED && event.field == 'page') {
                var page = $('row_' + event.getValue());
                
                $('pages_listBody').removeChild(page);
                
                var node = event.getSource().getPageAfter(event.getValue()) == null?null:$('row_' + event.getSource().getPageAfter(event.getValue()).id);
                $('pages_listBody').insertBefore(page, node);
                
                this.buildSortableList();
            
            }
        }.bind(this)));
        
        Event.observe($('import_pages'), 'click', this.importPages.bind(this));
    },
    
    buildSortableList: function() {
		Sortable.create('pages_listBody',
		        {elements:$$('#pages_listBody tr'),
		        handle:'moveButton',
		        ghosting:true,
                tag:'tr',
                treetag:'tbody',
                format:/^row_(.*)$/,
                onUpdate:this.sortOrderUpdated.bind(this)
        });
        
        this.sortOrder = Sortable.sequence('pages_listBody');
    },
    
    sortOrderUpdated: function() {
        var actSortOrder = Sortable.sequence('pages_listBody');
        
        if(de.edirom.areArraysEqual(actSortOrder, this.sortOrder))
            return;
        
        var pageId = '';
        var movedAfter = '';
        
        for(var i = 0; i < this.sortOrder.length; i++) {
            
            var j = actSortOrder.indexOf(this.sortOrder[i]);
        
            if(i != j && i != j + 1 && i != j - 1) {
                pageId = this.sortOrder[i];
                movedAfter = (j == 0)?null:actSortOrder[j - 1];
                
                break;
            }
        }

        if(pageId == '') {
            for(var i = 0; i < this.sortOrder.length; i++) {
                
                var j = actSortOrder.indexOf(this.sortOrder[i]);
            
                if(i != j) {
                    pageId = this.sortOrder[i];
                    movedAfter = (j == 0)?null:actSortOrder[j - 1];
                
                    break;
                }
            }
        }
        
        this.sortOrder = actSortOrder;
        
        var source = this.view.getModule().getSource();
        var controller = this.view.getModule().getCommandController();
        
        controller.addCommand(new de.edirom.server.main.MoveObjectCommand(source, 'pages', pageId, movedAfter));
    },
    
    importPages: function() {
        window.status = 'edirom:de.edirom.server.source:openFilePicker?type=file&amp;filter=images,archives';
    },
    
    deletePage: function(event, source, page, controller) {
        
        var barIDs = page.getBarIDs();
        if(barIDs.length > 0) {
            var groupCommand = new de.edirom.server.main.GroupCommand();
            var bars = source.getBarsSorted(barIDs);        
            
            for(var i = bars.length - 1; i >= 0; i--) {
                var movement = source.getMovement(bars[i].getPartId());
                groupCommand.addGroupCommand(new de.edirom.server.main.RemoveObjectCommand(movement, 'bars', bars[i]));
            }
            
            groupCommand.addGroupCommand(new de.edirom.server.main.RemoveObjectCommand(source, 'pages', page));
            
            
            var func = function() {
                controller.addCommand(groupCommand);
                
                new Ajax.Request('../source/xql/deletePageReferencesInWorks.xql', {
                    method: 'post',
                    parameters: {
                        sourceID: source.id,
                        pageID: page.id
                    }
                });       
                
            }.bind(this);

            var title = 'Seite löschen';
            //var details = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum ';
            var message = 'Wenn Sie Seite "' + page.getName() + '" löschen, werden gleichzeitig ' + barIDs.length + ' darauf enthaltene Takte gelöscht.';
            var options = {firstButton: 'Abbrechen',
                            secondButton: 'Seite löschen',
                            secondFunc: func};
        
            (new de.edirom.server.main.Popup(message, options, title)).showPopup();
        } else 
            controller.addCommand(new de.edirom.server.main.RemoveObjectCommand(source, 'pages', page));
    },
    
    setVisible: function($super, visible) {
    
        $super(visible);
        
        this.pagesToolbarItem.setVisible(visible);
        
        if(visible)
            this.view.module.getShortcutController().addShortcutListener('content', 'content.pages', function(event){ return false; });
        else
            this.view.module.getShortcutController().removeShortcutListener('content', 'content.pages');        
        
        if (this.scrolltable)
            this.scrolltable.refresh();
    },
    
    renamePages: function() {
    	
    	var source = this.view.getModule().getSource();        
        var pages = source.getPages();
    	
        var controller = this.view.getModule().getCommandController();
        
        var groupCommand = new de.edirom.server.main.GroupCommand();

    	for(var i = 0; i < pages.length; i++) {
    		var newName = $$('#pages_listBody tr').indexOf($("row_" + pages[i].id)) + 1;
    		
    		if(pages[i].getName() != newName) {
    			groupCommand.addGroupCommand(new de.edirom.server.main.ChangeFieldCommand(pages[i], "name", newName));    			
    			
    			if(typeof this.inputFieldChanges == 'undefined')
    	            this.inputFieldChanges = new Array();
    	        
    	        if(typeof this.inputFieldChanges[pages[i].id + "_name"] == 'undefined')
    	            this.inputFieldChanges[pages[i].id + "_name"] = 'undefined';
    	        
    	        this.inputFieldChanges[pages[i].id + "_name"] = newName;
    		}
    	}

    	if(groupCommand.getLength() > 0)
    		controller.addCommand(groupCommand);
    }
    
});

/**
 * Imports an Image
 * 
 * @param {String} pathOrig The original filename
 * @param {String} path The unique filename in the system
 * @param {String} width The width of the image
 * @param {String} height The height of the image
 */
de.edirom.server.source.importImage = function(pathOrig, path, width, height) {

    var imageId = 'edirom_image_' + Math.uuid().toLowerCase();

    new Ajax.Request('../data/xql/createImage.xql', {
        method: 'get',
        parameters: {
            id: imageId,
            path: path,
            pathOrig: pathOrig,
            width: width,
            height: height
        },
        onSuccess: function(transport) {
        
        }.bind(this),
        onFailure: function(transport) {
            console.log('Bilddaten konnten nicht abgelegt werden: \n\n' + transport.responseText);
        }
    });

    var pageNo = de.edirom.server.source.generatePageNo();
    
    var id = 'edirom_surface_' + Math.uuid().toLowerCase();
    
    var object = new de.edirom.server.data.Page(id, pageNo, width, height, pathOrig, '', path, 'xmldb:exist:///db/contents/images/' + imageId + '.xml');
    var controller = window.module.getCommandController();
    var source = window.module.getSource();
    
    controller.addCommand(new de.edirom.server.main.AddObjectCommand(source, 'pages', object));
}

/**
 * Starts the import job
 */
de.edirom.server.source.startImageImportJob = function() {
    window.module.getIndicator().addJob('importImagesJob', 'Importiere Bilder…');
}

/**
 * Updates the import job description
 * 
 * @param {String} desc The new description
 */
de.edirom.server.source.updateImageImportJob = function(desc) {
    window.module.getIndicator().setJobDescription('importImagesJob', desc);
}

/**
 * Finishes the import job
 */
de.edirom.server.source.finishImageImportJob = function() {
    window.module.getIndicator().jobFinished('importImagesJob');
}

de.edirom.server.source.generatePageNo = function() {
    
    var inputs = $$('input.pages_name_input');
    var max = 0;
    
    for(var i = 0; i < inputs.length; i++) {
        if(!isNaN($(inputs[i]).value) && parseInt($(inputs[i]).value) > max)
            max = parseInt($(inputs[i]).value);
    }
    
    return (max + 1);
}
