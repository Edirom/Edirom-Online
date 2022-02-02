var frameDictionary = {
};

window.addEventListener("message", function (event) {
    var data = event.data;
    if (data[ "action"] == "push") {
        if (frameDictionary[data[ "id"]] === undefined) {
            frameDictionary[data[ "id"]] =[];
        }
        var stack = frameDictionary[data[ "id"]];
        stack.push(data[ "url"]);
    }
    
    if (data[ "action"] == "back") {
        var stack = frameDictionary[data[ "id"]];
        if (stack.length > 1) {
            stack.pop();
            var newURL = stack[stack.length -1];
            stack.pop();
            document.getElementById(data[ "id"]).src = newURL;
        }
    }
},
false);