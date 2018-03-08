HTMLElement.prototype.insertAdjacentElement = function(where, parsedNode) {
  switch (where) {
    case "beforeBegin":
      this.parentNode.insertBefore(parsedNode, this);
      break;
    case "afterBegin":
      this.insertBefore(parsedNode, this.firstChild);
      break;
    case "beforeEnd":
      this.appendChild(parsedNode);
      break;
    case "afterEnd":
      if (this.nextSibling)
        this.parentNode.insertBefore(parsedNode, this.nextSibling);
      else
        this.parentNode.appendChild(parsedNode);
      break;
  }
}

function init() {
  var prettify = false;
  var plantuml = false;
  var blocks = document.querySelectorAll('pre code');
  for (var i = 0; i < blocks.length; i += 1) {
    var code = blocks[i];
    //code.className += ' prettyprint';
    var pre = code.parentNode;
    pre.className += ' prettyprint';
    
    // no wrapper, use pre directly.
    var above = pre; //pre.parentNode;
    do {
      above = above.previousSibling;
    } while (above && above.nodeType == Node.TEXT_NODE)
    
    if (above && above.nodeType == Node.COMMENT_NODE) {
      var comment = above.data;
      // example: language:scala run
      var pattern = /^\s*language:\s*([\w\-]+)\s*(\w+)?\s*$/i;
      var match = pattern.exec(comment);
      if (match != null) {
        var lang = match[1];
        var cmd = match[2];

        if (lang && lang == "uml") {
          var container = document.createElement("div");          
          var img = document.createElement("img");
          img.setAttribute("uml", code.innerText || code.textContent);

          container.appendChild(img);
          container.className = "text-center";

          pre.insertAdjacentElement('afterEnd', container);
          pre.style.display = "none";
          plantuml = true;
        } else {        
          // could do validation here
          code.className += (" " + lang);
          // add 'run' btn
          if (cmd && cmd == 'run') {
            var btn = document.createElement("button");
            btn.className = "btn btn-mini btn-info run";
            btn.innerHTML = "Run";
            btn.onclick = runScript(code);
            pre.insertAdjacentElement('afterEnd', btn);
          }
        }
      }
    }

    prettify = true;
  }
  if (prettify) {
    prettyPrint();
  }

  if (plantuml) {
    plantuml_runonce();
  }
}

function runScript(code) {
  return function(event) {
    var codeElem;

    if (typeof this.ownOutput === "undefined") {      
      var preElem = document.createElement("pre");
      preElem.className += " output";
      codeElem = document.createElement("code");
      preElem.appendChild(codeElem);

      this.insertAdjacentElement('afterEnd', preElem);
      // custom property to prevent duplicate output elements.
      this.ownOutput = preElem;
    }

    run(code, codeElem);
  }
}

function run(codeElem, outputElem) {  

  // wsUri is a global variable
  var WS = window['MozWebSocket'] ? MozWebSocket : WebSocket
  var websocket = new WS(wsUri); 

  websocket.onopen = function(evt) { 
    var code;
    if (codeElem.tagName.toLowerCase() == "textarea") {
      code = codeElem.value;
    } else {
      code = codeElem.innerText || codeElem.textContent;
    }

    websocket.send(code);
  }; 
  websocket.onmessage = function(evt) { 
    outputElem.innerHTML = evt.data; 
    websocket.close();
  }; 

  websocket.onerror = function(evt) { 
    outputElem.innerHTML = evt.data;
  };
}
