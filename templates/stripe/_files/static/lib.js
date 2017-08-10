var lib = (function (window) {

  function formatBlobAsync(blob, callback) {
    return blob instanceof Blob ?
      (function (blob) {
        var reader = new FileReader();
        reader.addEventListener('error', function (err) {
          return callback(err);
        });
        reader.addEventListener('load', function() {
          return callback(null, {_base64: reader.result.split(',')[1]});
        });
        reader.readAsDataURL(blob);
      })(blob) :
      callback(null, blob);
  }

  function formatParamsObjectAsync(params, callback) {
    params = Object.keys(params || {}).reduce(function (obj, key) {
      obj[key] = params[key];
      return obj;
    }, {});
    var formattedParams = {};
    if (!Object.keys(params).length) {
      return callback(null, formattedParams);
    }
    var error = null;
    var complete = function (key) {
      return function(err, result) {
        if (error || !Object.keys(params).length) {
          return;
        }
        if (err) {
          error = err;
          return callback(err);
        }
        delete params[key];
        formattedParams[key] = result;
        return Object.keys(params).length || callback(null, formattedParams);
      };
    };
    Object.keys(params).forEach(function(key, i) { formatBlobAsync(params[key], complete(key)); });
  };

  function formatParamsArrayAsync(params, callback) {
    params = params || [];
    var formattedParams = new Array(params.length);
    if (!params.length) {
      return callback(null, formattedParams);
    }
    var error = null;
    var complete = function (i) {
      return function(err, result) {
        if (error || !params.length) {
          return;
        }
        if (err) {
          error = err;
          return callback(err);
        }
        params.pop();
        formattedParams[i] = result;
        return params.length || callback(null, formattedParams);
      };
    };
    params.slice(0).forEach(function(param, i) { formatBlobAsync(param, complete(i)); });
  };

  function containsKeywords(params) {
    return params.length &&
    typeof params[0] === 'object' &&
    !Array.isArray(params[0]) &&
    !(params[0] instanceof Blob);
  }

  function formatParams(params) {
    if (containsKeywords(params)) {
      if (params.length > 1) {
        throw new Error('Can not send additional arguments with parameters as keywords');
      } else {
        return params[0];
      }
    } else {
      return params;
    }
  }

  function parseParameters(names, params) {

    var callback;

    if (typeof params[params.length - 1] === 'function') {
      callback = params.pop();
    }

    return {
      params: formatParams(params),
      callback: callback
    };

  };

  function appendVersion(names, str) {
    if (!str.match(/^@[A-Z0-9\.]+$/gi)) {
      throw new Error(`${names.join('.')} invalid version: ${str}`);
    }
    return names.concat(str);
  }

  function appendPath(names, str) {
    if (!str.match(/^[A-Z0-9\-\_]+$/gi)) {
      if (str.indexOf('@') !== -1) {
        throw new Error(`${names.join('.')} invalid name: ${str}, please specify versions and environments with [@version]`);
      }
      throw new Error(`${names.join('.')} invalid name: ${str}`);
    }
    return names.concat(str);
  }

  function appendLibPath(names, str) {

    names = names ? names.slice() : [];
    var defaultVersion = '@release';

    if (names.length === 0 && str === '') {

      return names.concat(str);

    } else if (names.length === 0 && str.indexOf('.') !== -1) {

      var versionMatch = str.match(/^[^\.]+?\.[^\.]*?(\[@[^\[\]]*?\])(\.|$)/);
      var arr;

      if (versionMatch) {
        version = versionMatch[1];
        version = version.replace(/^\[?(.*?)\]?$/, '$1');
        str = str.replace(versionMatch[1], '');
        arr = str.split('.');
        arr = arr.slice(0, 2).concat(version, arr.slice(2));
      } else {
        arr = str === '.' ? [''] : str.split('.');
      }

      while (arr.length && (names = appendLibPath(names, arr.shift())));
      return names;

    } else if (names.length === 2 && names[0] !== '') {

      return str[0] === '@' ?
        appendVersion(names, str) :
        appendPath(appendVersion(names, defaultVersion), str);

    } else {

      return appendPath(names, str);

    }

  }

  var HOST = 'functions.lib.id';
  var PORT = 443;
  var PATH = '/';

  var LOCALENV = 'local';
  var LOCALPORT = window.STDLIB_LOCAL_PORT || 8170;

  function executeRemote(cfg, names, params, callback) {

    var formatParamsAsync = Array.isArray(params) ?
      formatParamsArrayAsync : formatParamsObjectAsync;

    formatParamsAsync(params, function (err, params) {

      if (err) {
        return callback(err, null, {});
      }

      cfg = cfg || {};
      cfg = Object.keys(cfg).reduce(function (ncfg, key) {
        ncfg[key] = cfg[key];
        return ncfg
      }, {});
      cfg.host = cfg.host || HOST;
      cfg.port = parseInt(cfg.port || PORT) || 80;
      cfg.path = cfg.path || PATH;
      cfg.debug = !!cfg.debug;

      cfg.token = cfg.token || null;
      cfg.keys = cfg.keys || null;
      cfg.convert = !!cfg.convert;

      if (names[2] === `@${LOCALENV}`) {
        cfg.host = 'localhost';
        cfg.port = LOCALPORT;
        names[2] = '';
      }

      var pathname = names.slice(0, 2).join('/') + names.slice(2).join('/');
      pathname = pathname + '/';
      var headers = {};
      var body;

      headers['Content-Type'] = 'application/json';
      headers['X-Faaslang'] = 'true';
      body = new Blob([JSON.stringify(params)]);

      cfg.token && (headers['Authorization'] = `Bearer ${cfg.token}`);
      cfg.keys && (headers['X-Authorization-Keys'] = JSON.stringify(cfg.keys));
      cfg.convert && (headers['X-Convert-Strings'] = 'true');
      cfg.bg && (pathname += `:bg${typeof cfg.bg === 'string' ? '=' + encodeURIComponent(cfg.bg) : ''}`);

      var xhr = new XMLHttpRequest();
      xhr.open(
        'POST',
        (cfg.port === 443 ? 'https' : 'http') +
        '://' + cfg.host +
        ((cfg.port === 80 || cfg.port === 443) ? '' : ':' + cfg.port) +
        cfg.path + pathname
      );
      xhr.responseType = 'blob';
      Object.keys(headers).forEach(function (header) {
        xhr.setRequestHeader(header, headers[header]);
      });
      xhr.addEventListener('readystatechange', function() {

        if (xhr.readyState === 0) {
          return callback(new Error('Request aborted.'), null, {});
        }

        if (xhr.readyState === 4) {

          if (xhr.status === 0) {
            return callback(new Error('Could not run function.'), null, {});
          }

          var response = xhr.response;
          var contentType = response.type;
          var resheaders = xhr.getAllResponseHeaders();

          if (
            contentType === 'application/json' ||
            contentType === 'text/plain'
          ) {
            var reader = new FileReader();
            reader.addEventListener('error', function() {
              return callback(new Error('Could not read response'), response, resheaders);
            });
            reader.addEventListener('load', function() {
              var response = reader.result;
              if (contentType === 'application/json') {
                try {
                  response = JSON.parse(response);
                } catch(e) {
                  return callback(new Error('Invalid Response JSON'));
                }
              }
              if (((xhr.status / 100) | 0) !== 2) {
                var message = typeof response === 'object' ?
                  (response && response.error && response.error.message) || 'Unspecified Error' :
                  response;
                var error = new Error(message);
                if (response.error && typeof response.error === 'object') {
                  Object.keys(response.error).forEach(function (key) {
                    error[key] = response.error[key];
                  });
                }
                return callback(error, response, resheaders);
              } else
              return callback(null, response, resheaders);
            });
            reader.readAsText(response);
          } else {
            return callback(null, response, resheaders);
          }

        }

      });

      xhr.send(body);

    });

  };


  var LibGen = function (rootCfg, cfg, names) {
    rootCfg = Object.assign(cfg || {}, rootCfg || {});
    names = names || [];
    var __call__ = function __call__ (s) {
      var args = [].slice.call(arguments);
      if (names.length === 0) {
        if (typeof args[0] === 'string') {
          return LibGen(rootCfg, {}, appendLibPath(names, args[0]));
        } else {
          return LibGen(rootCfg, (typeof args[0] === 'object' ? args[0] : null) || {}, names);
        }
      } else if (names.length === 1) {
        return LibGen(rootCfg, {keys: (typeof args[0] === 'object' ? args[0] : {})}, names);
      } else {
        var p = parseParameters(names, args);
        var execute = executeRemote.bind(null, cfg, names, p.params);
        if (p.callback) {
          return execute(p.callback);
        } else {
          return new Promise(function (resolve, reject) {
            return execute(function (err, result) {
              return err ? reject(err) : resolve(result);
            });
          });
        }
      }
    };
    var Proxy = window.Proxy;
    if (!Proxy) {
      return __call__;
    } else {
      return new Proxy(
        __call__,
        {
          get: function (target, name) {
            return LibGen(rootCfg, {}, appendLibPath(names, name));
          }
        }
      );
    }
  };

  return LibGen();

})(window);
