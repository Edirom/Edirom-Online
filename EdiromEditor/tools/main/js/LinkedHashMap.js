/*
 *    a two-way linked hashmap, combining the benefits of associative arrays and arrays
 */
 
de.edirom.server.main.LinkedHashMap = Class.create();
Object.extend(de.edirom.server.main.LinkedHashMap.prototype, Enumerable);
Object.extend(de.edirom.server.main.LinkedHashMap.prototype, {
     initialize: function(array) {
         
         this.hash = new Hash();
         this.length = 0;
         
         this.startID;
         this.endID;
         
         
         if(typeof(array) != 'undefined') {
             $A(array).each(function(item) {
                 this.pushElement(item.id, item);
             }.bind(this));
         }
     },
     
     _each: function(iterator) {
                     
         var object = this.startID;
         
         for(var i = this.length; i > 0; i--) {
             iterator(this.get(object));             
             object = this.hash.get(object)._next;
         }
         
     },
     
     //adds an element to the end of the linked HashMap
     pushElement: function(ID,elem) {
         
         var previousID;
         var nextID = null;
         
         if(this.length == 0) {
             previousID = null;
             this.startID = ID;
         } else {
             previousID = this.endID;
             this.hash.get(this.endID)._next = ID;
         }
                  
         this.endID = ID;
         
         var object = new Object();
         object._previous = previousID;       
         object.value = elem;
         object._next = nextID;  
         
         this.hash.set(ID, object);
         this.length++;
         
     },
     
     //adds an element to the beginning of the linked Hashmap
     unshiftElement: function(ID,elem) {
         
         var previousID = null;
         var nextID;
         
         if(this.length == 0) {
             nextID = null;
             this.endID = ID;
         } else {
             nextID = this.startID;
             this.hash.get(this.startID)._previous = ID;
         }
         this.startID = ID;
         
         var object = new Object();
         object._previous = previousID;
         object.value = elem;
         object._next = nextID;
         
         this.hash.set(ID, object);
         this.length++;
         
     },
     
     //inserts an element after a given element
     insert: function(precedingID, ID, elem) {
         
         if(precedingID == this.endID)
             this.pushElement(ID,elem);
         else if(precedingID == null)
             this.unshiftElement(ID, elem);
         else {
             
             var forward = this.hash.get(precedingID)._next;
                          
             this.hash.get(precedingID)._next = ID;
             this.hash.get(forward)._previous = ID;
             
             
             var object = new Object();
             object._previous = precedingID;
             object.value = elem;
             object._next = forward;
             
             this.hash.set(ID, object);
             
             this.length++;
         }
                  
     },
     
     //removes the last element
     popElement: function() {
         
         if(this.length <= 0)
             return false;
         
         var temp = this.endID
         
         if(this.length > 1) 
             this.endID = this.hash.get(this.endID)._previous;
         else if(this.length == 1) {
             this.endID = null;
             this.startID = null;
         }
         
         this.hash.unset(temp);
         this.length--;
         
     },
     
     //removes the first element
     shiftElement: function() {
         
         if(this.length <= 0)
             return false;
         
         var temp = this.startID
     
         if(this.length > 1)
             this.startID = this.hash.get(this.startID)._next;
         else if(this.length == 1) {
             this.startID = null;
             this.endID = null;
         }
         
         this.hash.unset(temp);         
         this.length--;
     },
     
     //removes a given element
     remove: function(ID) {
         
         if(!this.containsKey(ID))
             return false;
         
         if(ID == this.startID)
             this.shiftElement();
         else if(ID == this.endID)
             this.popElement();
         else {
             
             var forward = this.hash.get(ID)._next;
             var backward = this.hash.get(ID)._previous;
             
             this.hash.get(forward)._previous = backward;
             this.hash.get(backward)._next = forward;
             
             this.hash.unset(ID);
             this.length--;
             
         }
         
     },
     
     containsKey: function(ID) {
         return (this.hash.keys().indexOf(ID) != -1);             
     },
     
     get: function(ID) {
         if(this.containsKey(ID))
             return this.hash.get(ID).value;
         else
             return false;
     },
     
     getNext: function(ID) {
         if(!this.containsKey(ID))
             return false;
         else if(ID == this.endID)
             return null;
         else    
             return this.hash.get(this.hash.get(ID)._next).value;
     },
     
     getPrevious: function(ID) {
         if(!this.containsKey(ID))
             return false;
         else if(ID == this.startID)
             return null;
         else 
             return this.hash.get(this.hash.get(ID)._previous).value;
     },
     
     getFirst: function() {
         if(this.length == 0) return null;
         
         return this.get(this.startID);
     },
     
     getLast: function() {
         if(this.length == 0) return null;
         
         return this.get(this.endID);
     },
     
     values: function() {
     
         var values = new Array();
         var value = this.get(this.startID);
         while(value != null && value != false) {
             values.push(value);
             value = this.getNext(value.id);
         }
         
         return values;
     },
     
     keys: function() {
         return this.hash.keys();
     },
     
     reverse: function() {
     
         var num = this.size();
         if(num < 2) return;
         
         var firstId = this.getFirst().id;
     
         for(var i = num - 1; i > 0; i--) {
             var elem = this.getLast();
             this.popElement();
             
             var insertAfter = this.getPrevious(firstId);
             if(insertAfter == null)
                 this.insert(null, elem.id, elem);
             else
                 this.insert(insertAfter.id, elem.id, elem);
         }
         
         this.hash.get(this.startID)._previous = null;
         this.hash.get(this.endID)._next = null;
     },
     
     setValue: function(ID, value) {
         if(this.containsKey(ID))
             this.hash.get(ID).value = value;
     }
});