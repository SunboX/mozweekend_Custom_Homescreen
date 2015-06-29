var appMgr = navigator.mozApps.mgmt;

var HIDDEN_ROLES = ['system', 'input', 'homescreen', 'theme'];

// Default icon size.
var DEFAULT_ICON_SIZE = Math.floor(window.innerWidth / 4);


// Checks whether or not the input has a scheme like http://
function hasScheme(input) {
  var rscheme = /^(?:[a-z\u00a1-\uffff0-9-+]+)(?::|:\/\/)/i;
  return !!(rscheme.exec(input) || [])[0];
}

function populate() {
  appMgr.getAll().onsuccess = function(event) {
    var apps = event.target.result;
    
    // Sort apps by name (ignores entry points for simplicity)
    apps.sort(function(a, b){
      if(a.manifest.name < b.manifest.name) {
        return -1;
      }
      if(a.manifest.name > b.manifest.name) {
        return 1;
      }
      return 0;
    })
    
    var fragment = document.createDocumentFragment();
    for (var app of apps) {
      if (HIDDEN_ROLES.indexOf(app.manifest.role) === -1) {
        // ignores entry points for simplicity
        fragment.appendChild(createIcon(app));
      }
    }
    document.body.innerHTML = '';
    document.body.appendChild(fragment);
  }
}

function createIcon(app) {
  var appEl = document.createElement('div');
  appEl.className = 'tile';
  appEl.setAttribute('manifest-url', app.manifestURL);

  var name, icons, icon;

  // ignores entry points for simplicity
  name = app.manifest.name;
  icons = app.manifest.icons;

  if (icons) {
    // Create a list with the sizes and order it by descending size.
    iconSizes = Object.keys(icons).map(function (size) {
      return size;
    }).sort(function (a, b) {
      return b - a;
    });

    // Get best fitting icons size
    var accurateSize = iconSizes[0]; // The biggest icon available
    for (var i = 0; i < iconSizes.length; i++) {
      var iconSize = iconSizes[i];
      if (iconSize < DEFAULT_ICON_SIZE) {
        break;
      }
      accurateSize = iconSize;
    }

    icon = icons[accurateSize];

    // Handle relative URLs
    if (!hasScheme(icon)) {
      var a = document.createElement('a');
      a.href = app.origin;
      icon = a.protocol + '//' + a.host + icon;
    }
  }

  var appIconEl = document.createElement('span');
  appIconEl.className = 'icon';
  appIconEl.style.backgroundImage = 'url(' + icon + ')';

  var appNameEl = document.createElement('span');
  appNameEl.className = 'name';
  appNameEl.textContent = name;

  appEl.appendChild(appIconEl);
  appEl.appendChild(appNameEl);

  appEl.onclick = function() {
    app.launch();
  }

  return appEl;
}

appMgr.oninstall = populate;
appMgr.onuninstall = populate;

window.addEventListener('DOMContentLoaded', function () {
  populate();
}, true);
