/*
 * a sidebar, depending on content
 */
 de.edirom.server.main.Sidebar = Class.create({
    
    SIDEBAR_WIDTH: 285,
    
    activeContent: null,    
    
    initialize: function(contentID) {
        
        this.id = contentID + '_sidebar';
        
        var VerticalScrollbarThickness = 4;
        
        this.SIDEBAR_WIDTH += VerticalScrollbarThickness;
        
        if ($('_sidebar'))
            $('_sidebar').writeAttribute({id: this.id});
        else
            $(contentID).insert({bottom: '<div class="sidebar" id="' + this.id + '"></div>'});
        
        $(this.id).style.width = '0px';
        
        this.contents = new Array();
        
        this.scrollview = new de.edirom.server.Scrollview(this.id, true);
        this.scrollview.setVerticalScrolling(true);
    },
    
    getId: function() {
        return id;
    },
 
    checkVisible: function() {
        return (this.activeContent != null);
    },
    
    getActiveContent: function() {
        return this.activeContent;
    },
 
    getContentContainerId: function() { // due to scrolling, "this.id" doesn't address the location of the content!
        return this.scrollview.vFrameInnerId;
    },
    
    addContent: function(content) {
        this.contents.push(content);
    },
    
    showContent: function(sidebarContent) {
        this.activeContent = sidebarContent;
        this.startSidebarExpandAnimation();
    },
    
    startSidebarExpandAnimation: function() {
        $(this.id).morph('width:' + this.SIDEBAR_WIDTH + 'px;', { duration: 0, queue: 'end', afterFinish: this.sidebarExpandAnimationFinished.bind(this) });
    },
    
    sidebarExpandAnimationFinished: function() {
        this.scrollview.refresh();
        this.activeContent.show();
        this.scrollview.refresh();
    },
    
    hideContent: function(sidebarContent) {
        this.activeContent = sidebarContent;
        this.startSidebarRetractAnimation();
    },
    
    startSidebarRetractAnimation: function() {
        $(this.id).morph('width:0px;', { duration: 0.8, queue: 'end', afterFinish: this.sidebarRetractAnimationFinished.bind(this) });
    },
    
    sidebarRetractAnimationFinished: function() {
        this.activeContent.hide();
        this.activeContent = null;
        
        if (this.showAfterHide != null) {
            this.showContent(this.showAfterHide);
            this.showAfterHide = null;
        }
    },
    
    toggleSidebarContent: function(sidebarContent) {
        if(this.activeContent == null) {
            //if there is no sidebar shown
            sidebarContent.requestShow();
            this.showContent(sidebarContent);
        } else if(this.activeContent == sidebarContent) {
            //if the sidebarContent handed over is already shown
            sidebarContent.requestHide();
            this.hideContent(sidebarContent);
        } else if(this.activeContent != null && sidebarContent == null) {
            //if the sidebarContent handed over is null the sidebar will hide
            this.activeContent.requestHide();
            this.hideContent(this.activeContent);
        } else {
            //if the sidebarContent handed over differs from the shown one
            this.activeContent.requestHide();
            sidebarContent.requestShow();
            this.showAfterHide = sidebarContent;
            this.hideContent(this.activeContent);
        }
    }
});
