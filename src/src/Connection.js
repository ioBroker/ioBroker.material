/**
 * Copyright 2018-2019 bluefox <dogafox@gmail.com>
 *
 * The MIT License (MIT)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 **/

////// ----------------------- Connection "class" ---------------------- ////////////
/* jshint browser: true */
/* global document */
/* global console */
/* global window */
/* global location */
/* global setTimeout */
/* global clearTimeout */
/* jshint -W097 */
/* jshint strict: true */

// The idea of servConn is to use this class later in every addon.
// The addon just must say, what must be loaded (values, objects, indexes) and
// the class loads it for addon. Authentication will be done automatically, so addon does not care about it.
// It will be .js file with localData and servConn

class ServerConnection {
    // Expected options: {
    //   namespace: //default 'vis.0'
    //   connOptions: {
    //       connLink: 'http://blabla:5000' // default
    //       socketForceWebSockets: false
    //       socketSession: ''
    //   }
    //   connCallbacks: {
    //       onConnChange: null,
    //       onUpdate: null,
    //       onRefresh: null,
    //       onAuth: null,
    //       onCommand: null,
    //       onError: null
    //   },
    //   objectsRequired: false
    //   autoSubscribe: true

    constructor(options) {
        if (typeof options === 'string') {
            options = {namespace: options};
        }
        options = options || {};

        this._socket = null;
        this._isConnected = false;
        this._disconnectedSince = null;
        this._connCallbacks = {
            onConnChange: null,
            onUpdate: null,
            onRefresh: null,
            onAuth: null,
            onCommand: null,
            onError: null
        };
        this._authInfo = null;
        this._isAuthDone = false;
        this._isAuthRequired = false;
        this._authRunning = false;
        this._cmdQueue = [];
        this._type = options.type || 'socket.io'; // [socket.io | local]
        this._timeout = options.timeout || 0;           // 0 - use transport default timeout to detect disconnect
        this._reconnectInterval = options.reconnectInterval || 10000;       // reconnect interval
        this._reloadInterval = options.reloadInterval || 30;          // if connection was absent longer than 30 seconds
        this._cmdData = null;
        this._cmdInstance = null;
        this._isSecure = false;
        this._defaultMode = options.defaultMode || 0x644;
        this._useStorage = options.useStorage || false;
        this._objects = null;        // used if _useStorage === true
        this._enums = null;        // used if _useStorage === true
        this._autoSubscribe = options.autoSubscribe === undefined ? true : options.autoSubscribe;

        this.namespace = options.namespace || 'vis.0';
        this.$ = (typeof window.$ !== 'undefined') ? window.$ : null;
        this.storage = (typeof window.storage !== 'undefined') ? window.storage : null;

        this._init(options.connOptions, options.connCallbacks, options.objectsRequired, options.autoSubscribe);
    }

    getType() {
        return this._type;
    }

    getIsConnected() {
        return this._isConnected;
    }

    getIsLoginRequired() {
        return this._isSecure;
    }

    getUser() {
        return this._user;
    }

    setReloadTimeout(timeout) {
        this._reloadInterval = parseInt(timeout, 10);
    }

    setReconnectInterval(interval) {
        this._reconnectInterval = parseInt(interval, 10);
    }

    _checkConnection(func, _arguments) {
        if (!this._isConnected) {
            console.log('No connection!');
            return false;
        }

        if (this._queueCmdIfRequired(func, _arguments)) {
            return false;
        }

        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return false;
        }
        return true;
    }

    _monitor() {
        if (this._timer) {
            return;
        }
        const ts = Date.now();
        if (this._reloadInterval && ts - this._lastTimer > this._reloadInterval * 1000) {
            // It seems, that PC was in a sleep => Reload page to request authentication anew
            this.reload();
        } else {
            this._lastTimer = ts;
        }
        this._timer = setTimeout(() => {
            this._timer = null;
            this._monitor();
        }, 10000);
    }

    _onAuth(objectsRequired, isSecure) {
        this._isSecure = isSecure;

        if (this._isSecure) {
            this._lastTimer = Date.now();
            this._monitor();
        }

        this._autoSubscribe && this._socket.emit('subscribe', '*');
        objectsRequired && this._socket.emit('subscribeObjects', '*');

        if (this._isConnected === true) {
            // This seems to be a reconnect because we're already connected!
            // -> prevent firing onConnChange twice
            return;
        }

        this._isConnected = true;

        if (this._connCallbacks.onConnChange) {
            setTimeout(() =>
                this._socket.emit('authEnabled', (auth, user) => {
                    this._user = user;
                    this._connCallbacks.onConnChange(this._isConnected);
                    if (typeof window.app !== 'undefined') {
                        window.app.onConnChange(this._isConnected);
                    }
                }), 0);
        }
    }

    reconnect(connOptions) {
        // reconnect
        if ((!connOptions.mayReconnect || connOptions.mayReconnect()) && !this._connectInterval) {
            this._connectInterval = setInterval(() => {
                console.log('Trying connect...');
                this._socket.connect();
                this._countDown = Math.floor(this._reconnectInterval / 1000);

                // Custom load indicator
                this.$ && this.$('.splash-screen-text').html(this._countDown + '...').css('color', 'red');
            }, this._reconnectInterval);

            this._countDown = Math.floor(this._reconnectInterval / 1000);

            // Custom load indicator
            if (this.$) {
                this.$('.splash-screen-text').html(this._countDown + '...');

                // Custom load indicator
                this._countInterval = setInterval(() => {
                    this._countDown--;
                    this.$('.splash-screen-text').html(this._countDown + '...');
                }, 1000);
            }
        }
    }

    reload() {
        if (window.location.host === 'iobroker.pro' ||
            window.location.host === 'iobroker.net' ||
            window.location.host === 'iobroker.biz') {
            window.location = '/';
        } else {
            window.location.reload();
        }
    }

    _init(connOptions, connCallbacks, objectsRequired, autoSubscribe) {
        // init namespace
        if (typeof window.socketNamespace !== 'undefined') {
            this.namespace = window.socketNamespace;
        }

        connOptions = connOptions || {};
        connOptions.name = connOptions.name || this.namespace;

        if (autoSubscribe !== undefined) {
            this._autoSubscribe = autoSubscribe;
        }

        // To start vis as local use one of:
        // - start vis from directory with name local, e.g. c:/blbla/local/ioBroker.vis/www/index.html
        // - do not create "_socket/info.js" file in "www" directory
        // - create "_socket/info.js" file with
        //   const socketUrl = "local"; const socketSession = ""; sysLang="en";
        //   in this case you can overwrite browser language settings
        if (window.document.URL.split('/local/')[1] ||
            (typeof window.socketUrl === 'undefined' && !connOptions.connLink) ||
            (typeof window.socketUrl !== 'undefined' && window.socketUrl === 'local')) {
            this._type = 'local';
        }

        if (typeof window.session !== 'undefined') {
            const user = window.session.get('user');
            if (user) {
                this._authInfo = {
                    user: user,
                    hash: window.session.get('hash'),
                    salt: window.session.get('salt')
                };
            }
        }

        this._connCallbacks = connCallbacks;

        let connLink = connOptions.connLink || window.localStorage.getItem('connLink');

        // Connection data from "/_socket/info.js"
        if (!connLink && typeof window.socketUrl !== 'undefined') {
            connLink = window.socketUrl;
        }
        if (!connOptions.socketSession && typeof window.socketSession !== 'undefined') {
            connOptions.socketSession = window.socketSession;
        }
        if (connOptions.socketForceWebSockets === undefined && typeof socketForceWebSockets !== 'undefined') {
            connOptions.socketForceWebSockets = window.socketForceWebSockets;
        }

        // if no remote data
        if (this._type === 'local') {
            // report connected state
            this._isConnected = true;
            if (this._connCallbacks.onConnChange) {
                this._connCallbacks.onConnChange(this._isConnected);
            }
            if (typeof window.app !== 'undefined') {
                window.app.onConnChange(this._isConnected);
            }
        } else if (typeof window.io !== 'undefined') {
            connOptions.socketSession = connOptions.socketSession || 'nokey';

            let url;
            if (connLink) {
                url = connLink;
                /*if (typeof connLink !== 'undefined' && connLink[0] === ':') {
                    connLink = window.location.protocol + '//' + window.location.hostname + connLink;
                }*/
            } else {
                url = window.location.protocol + '//' + window.location.host;
            }

            if (this._socket) {
                try {
                    this._socket.close();
                    this._socket = null;
                } catch (e) {
                    console.log('Cannot close connection: ' + e);
                }
            }
            this._socket = window.io.connect(url, {
                query: 'key=' + connOptions.socketSession,
                'reconnection limit': 10000,
                'max reconnection attempts': Infinity,
                reconnection: false,
                upgrade: !connOptions.socketForceWebSockets,
                rememberUpgrade: connOptions.socketForceWebSockets,
                transports: connOptions.socketForceWebSockets ? ['websocket'] : undefined
            });

            this._socket.on('connect', () => {
                if (this._disconnectedSince) {
                    const offlineTime = Date.now() - this._disconnectedSince;
                    console.log('was offline for ' + (offlineTime / 1000) + 's');

                    // reload whole page if no connection longer than some period
                    if (this._reloadInterval && offlineTime > this._reloadInterval * 1000 && !this.authError) {
                        this.reload();
                    }

                    this._disconnectedSince = null;
                }

                if (this._connectInterval) {
                    clearInterval(this._connectInterval);
                    this._connectInterval = null;
                }
                if (this._countInterval) {
                    clearInterval(this._countInterval);
                    this._countInterval = null;
                }

                // trim custom load-indicator
                const elem = document.getElementById('server-disconnect');
                if (elem) {
                    elem.style.display = 'none';
                }

                this._socket.emit('name', connOptions.name);
                console.log(new Date().toISOString() + ' Connected => authenticate');
                setTimeout(() => {
                    this.waitConnect = setTimeout(() => {
                        console.error('No answer from server');
                        !this.authError && this.reload();
                    }, 6000);

                    this._socket.emit('authenticate', (isOk, isSecure) => {
                        if (this.waitConnect) {
                            clearTimeout(this.waitConnect);
                            this.waitConnect = null;
                        }

                        console.log(new Date().toISOString() + ' Authenticated: ' + isOk);
                        if (isOk) {
                            this._onAuth(objectsRequired, isSecure);
                        } else {
                            console.log('permissionError');
                        }
                    });
                }, 50);
            });

            this._socket.on('reauthenticate', err => {
                if (this._connCallbacks.onConnChange) {
                    this._connCallbacks.onConnChange(false);
                    if (typeof window.app !== 'undefined' && !this.authError) {
                        window.app.onConnChange(false);
                    }
                }
                console.warn('reauthenticate');
                if (this.waitConnect) {
                    clearTimeout(this.waitConnect);
                    this.waitConnect = null;
                }

                if (connCallbacks.onAuthError) {
                    if (!this.authError) {
                        this.authError = true;
                        connCallbacks.onAuthError(err);
                    }
                } else {
                    this.reload();
                }
            });

            this._socket.on('connect_error', () => {
                // Custom load indicator
                this.$ && this.$('.splash-screen-text').css('color', '#002951');

                this.reconnect(connOptions);
            });

            this._socket.on('disconnect', () => {
                this._disconnectedSince = Date.now();

                // called only once when connection lost (and it was here before)
                this._isConnected = false;
                if (this._connCallbacks.onConnChange) {
                    setTimeout(() => {
                        // Custom load indicator
                        const elem = document.getElementById('server-disconnect');
                        if (elem) {
                            elem.style.display = '';
                        }
                        this._connCallbacks.onConnChange(this._isConnected);

                        if (typeof window.app !== 'undefined') {
                            window.app.onConnChange(this._isConnected);
                        }
                    }, 5000);
                } else {
                    // Custom load indicator
                    const elem = document.getElementById('server-disconnect');
                    if (elem) {
                        elem.style.display = '';
                    }
                }

                // reconnect
                this.reconnect(connOptions);
            });

            // after reconnect the "connect" event will be called
            this._socket.on('reconnect', () => {
                const offlineTime = Date.now() - this._disconnectedSince;
                console.log('was offline for ' + (offlineTime / 1000) + 's');

                // reload whole page if no connection longer than one minute
                if (this._reloadInterval && offlineTime > this._reloadInterval * 1000) {
                    this.reload();
                }
                // anyway "on connect" is called
            });

            this._socket.on('objectChange', (id, obj) => {
                // If cache used
                if (this._useStorage && this.storage) {
                    const objects = this._objects || this.storage.get('objects');
                    if (objects) {
                        if (obj) {
                            objects[id] = obj;
                        } else {
                            if (objects[id]) delete objects[id];
                        }
                        this.storage.set('objects', objects);
                    }
                }

                this._connCallbacks.onObjectChange && this._connCallbacks.onObjectChange(id, obj);
            });

            this._socket.on('stateChange', (id, state) => {
                if (!id || state === null || typeof state !== 'object') return;

                if (this._connCallbacks.onCommand && id === this.namespace + '.control.command') {
                    if (state.ack) return;

                    if (state.val &&
                        typeof state.val === 'string' &&
                        state.val[0] === '{' &&
                        state.val[state.val.length - 1] === '}') {
                        try {
                            state.val = JSON.parse(state.val);
                        } catch (e) {
                            console.log('Command seems to be an object, but cannot parse it: ' + state.val);
                        }
                    }

                    // if command is an object {instance: 'iii', command: 'cmd', data: 'ddd'}
                    if (state.val && state.val.instance) {
                        if (this._connCallbacks.onCommand(state.val.instance, state.val.command, state.val.data)) {
                            // clear state
                            this.setState(id, {val: '', ack: true});
                        }
                    } else {
                        if (this._connCallbacks.onCommand(this._cmdInstance, state.val, this._cmdData)) {
                            // clear state
                            this.setState(id, {val: '', ack: true});
                        }
                    }
                } else if (id === this.namespace + '.control.data') {
                    this._cmdData = state.val;
                } else if (id === this.namespace + '.control.instance') {
                    this._cmdInstance = state.val;
                } else if (this._connCallbacks.onUpdate) {
                    this._connCallbacks.onUpdate(id, state);
                }
            });

            this._socket.on('permissionError', err => {
                if (this._connCallbacks.onError) {
                    /* {
                     command:
                     type:
                     operation:
                     arg:
                     }*/
                    this._connCallbacks.onError(err);
                } else {
                    console.log('permissionError');
                }
            });

            this._socket.on('error', err => {
                if (err === 'Invalid password or user name') {
                    console.warn('reauthenticate');
                    if (this.waitConnect) {
                        clearTimeout(this.waitConnect);
                        this.waitConnect = null;
                    }

                    if (connCallbacks.onAuthError) {
                        if (!this.authError) {
                            this.authError = true;
                            connCallbacks.onAuthError(err);
                        }
                    } else {
                        this.reload();
                    }
                } else {
                    console.error('Socket error: ' + err);
                    // Custom load indicator
                    this.$ && this.$('.splash-screen-text').css('color', '#002951');

                    this.reconnect(connOptions);
                }
            });
        }
    }

    logout(callback) {
        if (!this._isConnected) {
            console.log('No connection!');
            return;
        }

        this._socket.emit('logout', callback);
    }

    getVersion(callback) {
        if (!this._checkConnection('getVersion', arguments)) return;

        this._socket.emit('getVersion', version => callback && callback(version));
    }

    subscribe(idOrArray, callback) {
        if (!this._checkConnection('subscribe', arguments)) {
            return;
        }

        this._socket.emit('subscribe', idOrArray, callback);
    }

    unsubscribe(idOrArray, callback) {
        if (!this._checkConnection('unsubscribe', arguments)) {
            return;
        }

        this._socket.emit('unsubscribe', idOrArray, callback);
    }

    _checkAuth(callback) {
        if (!this._isConnected) {
            console.log('No connection!');
            return;
        }
        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('getVersion', version => callback && callback(version));
    }

    readFile(filename, callback, isRemote) {
        if (!callback) {
            throw new Error('No callback set');
        }

        if (this._type === 'local' && this.storage) {
            try {
                const data = this.storage.get(filename);
                callback(null, data ? JSON.parse(data) : null);
            } catch (err) {
                callback(err, null);
            }
        } else {
            if (!this._checkConnection('readFile', arguments)) {
                return;
            }

            if (!isRemote && typeof window.app !== 'undefined') {
                window.app.readLocalFile(filename.replace(/^\/vis\.0\//, ''), callback);
            } else {
                let adapter = this.namespace;
                if (filename[0] === '/') {
                    const p = filename.split('/');
                    adapter = p[1];
                    p.splice(0, 2);
                    filename = p.join('/');
                }

                this._socket.emit('readFile', adapter, filename, (err, data, mimeType) =>
                    setTimeout(() => callback(err, data, filename, mimeType), 0));
            }
        }
    }

    getMimeType(ext) {
        if (ext.indexOf('.') !== -1) ext = ext.toLowerCase().match(/\.[^.]+$/);
        let _mimeType;
        if (ext === '.css') {
            _mimeType = 'text/css';
        } else if (ext === '.bmp') {
            _mimeType = 'image/bmp';
        } else if (ext === '.png') {
            _mimeType = 'image/png';
        } else if (ext === '.jpg') {
            _mimeType = 'image/jpeg';
        } else if (ext === '.jpeg') {
            _mimeType = 'image/jpeg';
        } else if (ext === '.gif') {
            _mimeType = 'image/gif';
        } else if (ext === '.tif') {
            _mimeType = 'image/tiff';
        } else if (ext === '.js') {
            _mimeType = 'application/javascript';
        } else if (ext === '.html') {
            _mimeType = 'text/html';
        } else if (ext === '.htm') {
            _mimeType = 'text/html';
        } else if (ext === '.json') {
            _mimeType = 'application/json';
        } else if (ext === '.xml') {
            _mimeType = 'text/xml';
        } else if (ext === '.svg') {
            _mimeType = 'image/svg+xml';
        } else if (ext === '.eot') {
            _mimeType = 'application/vnd.ms-fontobject';
        } else if (ext === '.ttf') {
            _mimeType = 'application/font-sfnt';
        } else if (ext === '.woff') {
            _mimeType = 'application/font-woff';
        } else if (ext === '.wav') {
            _mimeType = 'audio/wav';
        } else if (ext === '.mp3') {
            _mimeType = 'audio/mpeg3';
        } else {
            _mimeType = 'text/javascript';
        }
        return _mimeType;
    }

    readFile64(filename, callback, isRemote) {
        if (!callback) {
            throw new Error('No callback set');
        }

        if (!this._checkConnection('readFile', arguments)) return;

        if (!isRemote && typeof window.app !== 'undefined') {
            window.app.readLocalFile(filename.replace(/^\/vis\.0\//, ''), (err, data, mimeType) =>
                setTimeout(() => {
                    if (data) {
                        callback(err, {mime: mimeType || this.getMimeType(filename), data: btoa(data)}, filename);
                    } else {
                        callback(err, filename);
                    }
                }, 0));
        } else {
            let adapter = this.namespace;
            if (filename[0] === '/') {
                const p = filename.split('/');
                adapter = p[1];
                p.splice(0, 2);
                filename = p.join('/');
            }

            this._socket.emit('readFile64', adapter, filename, (err, data, mimeType) =>
                setTimeout(() => {
                    if (data) {
                        callback(err, {mime: mimeType || this.getMimeType(filename), data: data}, filename);
                    } else {
                        callback(err, {mime: mimeType || this.getMimeType(filename)}, filename);
                    }
                }, 0));
        }
    }

    writeFile(filename, data, mode, callback) {
        if (typeof mode === 'function') {
            callback = mode;
            mode = null;
        }
        if (this._type === 'local') {
            this.storage.set(filename, JSON.stringify(data));
            if (callback) callback();
        } else {
            if (!this._checkConnection('writeFile', arguments)) return;

            if (typeof data === 'object') data = JSON.stringify(data, null, 2);

            const parts = filename.split('/');
            const adapter = parts[1];
            parts.splice(0, 2);
            if (adapter === 'vis') {
                this._socket.emit('writeFile', adapter, parts.join('/'), data, mode ? {mode: this._defaultMode} : {}, callback);
            } else {
                this._socket.emit('writeFile', this.namespace, filename, data, mode ? {mode: this._defaultMode} : {}, callback);
            }
        }
    }

    // Write file base 64
    writeFile64(filename, data, callback) {
        if (!this._checkConnection('writeFile64', arguments)) return;

        const parts = filename.split('/');
        const adapter = parts[1];
        parts.splice(0, 2);

        this._socket.emit('writeFile', adapter, parts.join('/'), atob(data), {mode: this._defaultMode}, callback);
    }

    readDir(dirname, callback) {
        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return;
        }
        if (!dirname) dirname = '/';
        const parts = dirname.split('/');
        const adapter = parts[1];
        parts.splice(0, 2);

        this._socket.emit('readDir', adapter, parts.join('/'), {filter: true}, (err, data) => {
            if (callback) callback(err, data);
        });
    }

    mkdir(dirname, callback) {
        const parts = dirname.split('/');
        const adapter = parts[1];
        parts.splice(0, 2);

        this._socket.emit('mkdir', adapter, parts.join('/'), err => callback && callback(err));
    }

    unlink(name, callback) {
        const parts = name.split('/');
        const adapter = parts[1];
        parts.splice(0, 2);

        this._socket.emit('unlink', adapter, parts.join('/'), err => callback && callback(err));
    }

    renameFile(oldname, newname, callback) {
        const parts1 = oldname.split('/');
        const adapter = parts1[1];
        parts1.splice(0, 2);
        const parts2 = newname.split('/');
        parts2.splice(0, 2);
        this._socket.emit('rename', adapter, parts1.join('/'), parts2.join('/'), err => callback && callback(err));
    }

    setState(pointId, value, callback) {
        //socket.io
        if (this._socket === null) {
            //console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('setState', pointId, value, callback);
    }

    // callback(err, data)
    getStates(IDs, callback) {
        if (typeof IDs === 'function') {
            callback = IDs;
            IDs = null;
        }

        if (this._type === 'local') {
            return callback(null, []);
        } else {
            if (!this._checkConnection('getStates', arguments)) return;

            this.gettingStates = this.gettingStates || 0;
            this.gettingStates++;
            if (this.gettingStates > 1) {
                // fix for slow devices
                console.log('Trying to get empty list, because the whole list could not be loaded');
                IDs = [];
            }
            this._socket.emit('getStates', IDs, (err, data) => {
                this.gettingStates--;
                if (err || !data) {
                    if (callback) {
                        callback(err || 'Authentication required');
                    }
                } else if (callback) {
                    callback(null, data);
                }
            });
        }
    }

    _fillChildren(objects) {
        const items = [];

        for (const id in objects) {
            if (!objects.hasOwnProperty(id)) continue;
            items.push(id);
        }
        items.sort();

        for (let i = 0; i < items.length; i++) {
            if (objects[items[i]].common) {
                let j = i + 1;
                const children = [];
                const len = items[i].length + 1;
                const name = items[i] + '.';
                while (j < items.length && items[j].substring(0, len) === name) {
                    children.push(items[j++]);
                }

                objects[items[i]].children = children;
            }
        }
    }

    // callback(err, data)
    getObjects(useCache, callback) {
        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }
        // If cache used
        if (this._useStorage && useCache) {
            if (this.storage) {
                const objects = this._objects || this.storage.get('objects');
                if (objects) return callback(null, objects);
            } else if (this._objects) {
                return callback(null, this._objects);
            }
        }

        if (!this._checkConnection('getObjects', arguments)) return;
        this._socket.emit('getObjects', (err, data) => {
            // Read all enums
            this._socket.emit('getObjectView', 'system', 'enum', {
                startkey: 'enum.',
                endkey: 'enum.\u9999'
            }, (err, res) => {
                if (err) {
                    callback(err);
                    return;
                }
                const enums = {};
                for (let i = 0; i < res.rows.length; i++) {
                    data[res.rows[i].id] = res.rows[i].value;
                    enums[res.rows[i].id] = res.rows[i].value;
                }

                // Read all adapters for images
                this._socket.emit('getObjectView', 'system', 'instance', {
                    startkey: 'system.adapter.',
                    endkey: 'system.adapter.\u9999'
                }, (err, res) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    for (let i = 0; i < res.rows.length; i++) {
                        data[res.rows[i].id] = res.rows[i].value;
                    }
                    // find out default file mode
                    if (data['system.adapter.' + this.namespace] &&
                        data['system.adapter.' + this.namespace].native &&
                        data['system.adapter.' + this.namespace].native.defaultFileMode) {
                        this._defaultMode = data['system.adapter.' + this.namespace].native.defaultFileMode;
                    }

                    // Read all channels for images
                    this._socket.emit('getObjectView', 'system', 'channel', {
                        startkey: '',
                        endkey: '\u9999'
                    }, (err, res) => {
                        if (err) {
                            callback(err);
                            return;
                        }
                        for (let i = 0; i < res.rows.length; i++) {
                            data[res.rows[i].id] = res.rows[i].value;
                        }

                        // Read all devices for images
                        this._socket.emit('getObjectView', 'system', 'device', {
                            startkey: '',
                            endkey: '\u9999'
                        }, (err, res) => {
                            if (err) {
                                callback(err);
                                return;
                            }
                            for (let i = 0; i < res.rows.length; i++) {
                                data[res.rows[i].id] = res.rows[i].value;
                            }

                            if (this._useStorage) {
                                this._fillChildren(data);
                                this._objects = data;
                                this._enums = enums;

                                if (this.storage) {
                                    this.storage.set('objects', data);
                                    this.storage.set('enums', enums);
                                    this.storage.set('timeSync', Date.now());
                                }
                            }

                            if (callback) callback(err, data);
                        });
                    });
                });
            });
        });
    }

    getChildren(id, useCache, callback) {
        if (!this._checkConnection('getChildren', arguments)) return;

        if (typeof id === 'function') {
            callback = id;
            id = null;
            useCache = false;
        }
        if (typeof id === 'boolean') {
            callback = useCache;
            useCache = id;
            id = null;
        }
        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }

        if (!id) return callback('getChildren: no id given');

        const data = [];

        if (this._useStorage && useCache) {
            if (this.storage) {
                const objects = this.storage.get('objects');
                if (objects && objects[id] && objects[id].children) {
                    return callback(null, objects[id].children);
                }
            } else if (this._objects && this._objects[id] && this._objects[id].children) {
                return callback(null, this._objects[id].children);
            }
        }

        // Read all devices
        this._socket.emit('getObjectView', 'system', 'device', {
            startkey: id + '.',
            endkey: id + '.\u9999'
        }, (err, res) => {
            if (err) {
                callback(err);
                return;
            }
            res.rows.forEach(row => data[row.id] = row.value);

            this._socket.emit('getObjectView', 'system', 'channel', {
                startkey: id + '.',
                endkey: id + '.\u9999'
            }, (err, res) => {
                if (err) {
                    callback(err);
                    return;
                }
                res.rows.forEach(row => data[row.id] = row.value);

                // Read all adapters for images
                this._socket.emit('getObjectView', 'system', 'state', {
                    startkey: id + '.',
                    endkey: id + '.\u9999'
                }, (err, res) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    res.rows.forEach(row => data[row.id] = row.value);

                    const list = [];

                    const count = id.split('.').length;

                    // find direct children
                    for (const _id in data) {
                        const parts = _id.split('.');
                        if (count + 1 === parts.length) {
                            list.push(_id);
                        }
                    }
                    list.sort();

                    if (this._useStorage && this.storage) {
                        const objects = this.storage.get('objects') || {};

                        for (const id_ in data) {
                            if (data.hasOwnProperty(id_)) {
                                objects[id_] = data[id_];
                            }
                        }
                        if (objects[id] && objects[id].common) {
                            objects[id].children = list;
                        }
                        // Store for every element theirs children
                        const items = [];
                        for (const __id in data) {
                            if (data.hasOwnProperty(__id)) {
                                items.push(__id);
                            }
                        }
                        items.sort();

                        for (let k = 0; k < items.length; k++) {
                            if (objects[items[k]].common) {
                                let j = k + 1;
                                const children = [];
                                const len = items[k].length + 1;
                                const name = items[k] + '.';
                                while (j < items.length && items[j].substring(0, len) === name) {
                                    children.push(items[j++]);
                                }

                                objects[items[k]].children = children;
                            }
                        }

                        window.storage.set('objects', objects);
                    }

                    callback && callback(err, list);
                });
            });
        });
    }

    getObject(id, useCache, callback) {
        if (typeof id === 'function') {
            callback = id;
            id = null;
            useCache = false;
        }
        if (typeof id === 'boolean') {
            callback = useCache;
            useCache = id;
            id = null;
        }
        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }
        if (!id) {
            return callback('no id given');
        }

        // If cache used
        if (this._useStorage && useCache) {
            if (this.storage) {
                const objects = this._objects || this.storage.get('objects');
                if (objects && objects[id]) {
                    return callback(null, objects[id]);
                }
            } else if (this._enums) {
                return callback(null, this._enums);
            }
        }

        this._socket.emit('getObject', id, (err, obj) => {
            if (err) {
                callback(err);
                return;
            }
            if (this._useStorage && this.storage) {
                const objects = this.storage.get('objects') || {};
                objects[id] = obj;
                this.storage.set('objects', objects);
            }
            return callback(null, obj);
        });
    }

    getGroups(groupName, useCache, callback) {
        if (typeof groupName === 'function') {
            callback = groupName;
            groupName = null;
            useCache = false;
        }
        if (typeof groupName === 'boolean') {
            callback = useCache;
            useCache = groupName;
            groupName = null;
        }
        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }
        groupName = groupName || '';

        // If cache used
        if (this._useStorage && useCache) {
            if (this.storage) {
                const groups = this._groups || this.storage.get('groups');
                if (groups) {
                    return callback(null, groups);
                }
            } else if (this._groups) {
                return callback(null, this._groups);
            }
        }
        if (this._type === 'local') {
            return callback(null, []);
        } else {
            // Read all enums
            this._socket.emit('getObjectView', 'system', 'group', {
                startkey: 'system.group.' + groupName,
                endkey: 'system.group.' + groupName + '\u9999'
            }, (err, res) => {
                if (err) {
                    callback(err);
                    return;
                }
                const groups = {};
                for (let i = 0; i < res.rows.length; i++) {
                    const obj = res.rows[i].value;
                    groups[obj._id] = obj;
                }
                if (this._useStorage) {
                    this._groups = groups;

                    this.storage && this.storage.set('groups', groups);
                }

                callback(null, groups);
            });
        }
    }

    getEnums(enumName, useCache, callback) {
        if (typeof enumName === 'function') {
            callback = enumName;
            enumName = null;
            useCache = false;
        }
        if (typeof enumName === 'boolean') {
            callback = useCache;
            useCache = enumName;
            enumName = null;
        }
        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }

        // If cache used
        if (this._useStorage && useCache) {
            if (this.storage) {
                const enums = this._enums || this.storage.get('enums');
                if (enums) {
                    return callback(null, enums);
                }
            } else if (this._enums) {
                return callback(null, this._enums);
            }
        }

        if (this._type === 'local') {
            return callback(null, []);
        } else {

            enumName = enumName ? enumName + '.' : '';
            // Read all enums
            this._socket.emit('getObjectView', 'system', 'enum', {
                startkey: 'enum.' + enumName,
                endkey: 'enum.' + enumName + '\u9999'
            }, (err, res) => {
                if (err) {
                    callback(err);
                    return;
                }
                const enums = {};
                for (let i = 0; i < res.rows.length; i++) {
                    const obj = res.rows[i].value;
                    enums[obj._id] = obj;
                }
                if (this._useStorage && typeof this.storage !== 'undefined') {
                    this.storage.set('enums', enums);
                }
                callback(null, enums);
            });
        }
    }

    // return time when the objects were synchronized
    getSyncTime() {
        if (this._useStorage && this.storage) {
            const timeSync = this.storage.get('timeSync');
            if (timeSync) {
                return new Date(timeSync);
            }
        }
        return null;
    }

    addObject(objId, obj, callback) {
        if (!this._isConnected) {
            console.log('No connection!');
        } else
        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
        }
    }

    delObject(objId) {
        if (!this._checkConnection('delObject', arguments)) return;

        this._socket.emit('delObject', objId);
    }

    httpGet(url, callback) {
        if (!this._isConnected) {
            console.log('No connection!');
            return;
        }
        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('httpGet', url, data => callback && callback(data));
    }

    logError(errorText) {
        console.log("Error: " + errorText);
        if (!this._isConnected) {
            //console.log('No connection!');
            return;
        }
        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('log', 'error', 'Addon DashUI  ' + errorText);
    }

    _queueCmdIfRequired(func, args) {
        if (!this._isAuthDone) {
            // Queue command
            this._cmdQueue.push({func: func, args: args});

            if (!this._authRunning) {
                this._authRunning = true;
                // Try to read version
                this._checkAuth(version => {
                    // If we have got version string, so there is no authentication, or we are authenticated
                    this._authRunning = false;
                    if (version) {
                        this._isAuthDone = true;
                        // Repeat all stored requests
                        const __cmdQueue = this._cmdQueue;
                        // Trigger GC
                        this._cmdQueue = null;
                        this._cmdQueue = [];
                        for (let t = 0, len = __cmdQueue.length; t < len; t++) {
                            this[__cmdQueue[t].func].apply(this, __cmdQueue[t].args);
                        }
                    } else {
                        // Auth required
                        this._isAuthRequired = true;
                        // What for AuthRequest from server
                    }
                });
            }

            return true;
        } else {
            return false;
        }
    }

    authenticate(user, password, salt) {
        this._authRunning = true;

        if (user !== undefined) {
            this._authInfo = {
                user: user,
                hash: password + salt,
                salt: salt
            };
        }

        if (!this._isConnected) {
            console.log('No connection!');
            return;
        }

        if (!this._authInfo) {
            console.log("No credentials!");
        }
    }

    getConfig(useCache, callback) {
        if (!this._checkConnection('getConfig', arguments)) return;

        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }
        if (this._useStorage && useCache) {
            if (this.storage) {
                const objects = this.storage.get('objects');
                if (objects && objects['system.config']) {
                    return callback(null, objects['system.config'].common);
                }
            } else if (this._objects && this._objects['system.config']) {
                return callback(null, this._objects['system.config'].common);
            }
        }
        this._socket.emit('getObject', 'system.config', (err, obj) => {
            if (callback && obj && obj.common) {

                if (this._useStorage && this.storage) {
                    const objects = this.storage.get('objects') || {};
                    objects['system.config'] = obj;
                    this.storage.set('objects', objects);
                }

                callback(null, obj.common);
            } else {
                callback('Cannot read language');
            }
        });
    }

    sendCommand(instance, command, data, ack) {
        this.setState(this.namespace + '.control.instance', {val: instance || 'notdefined', ack: true});
        this.setState(this.namespace + '.control.data',     {val: data,                     ack: true});
        this.setState(this.namespace + '.control.command',  {val: command,                  ack: ack === undefined ? true : ack});
    }

    _detectViews(projectDir, callback) {
        this.readDir('/' + this.namespace + '/' + projectDir, (err, dirs) => {
            // find vis-views.json
            for (let f = 0; f < dirs.length; f++) {
                if (dirs[f].file === 'vis-views.json' && (!dirs[f].acl || dirs[f].acl.read)) {
                    return callback(err, {
                        name: projectDir,
                        readOnly: (dirs[f].acl && !dirs[f].acl.write),
                        mode: dirs[f].acl ? dirs[f].acl.permissions : 0
                    });
                }
            }
            callback(err);
        });
    }

    _readProjects(dirs, callback, err, result) {
        result = result || [];

        if (!dirs || !dirs.length) {
            callback && callback(err, result);
        } else {
            const dir = dirs.shift();
            this._detectViews(dir.file, (subErr, project) => {
                project && result.push(project);
                err = err || subErr;
                setTimeout(() => this._readProjects(dirs, callback, err, result), 0);
            });
        }
    }

    readProjects(callback) {
        this.readDir('/' + this.namespace, (err, dirs) => this._readProjects(dirs, callback));
    }

    chmodProject(projectDir, mode, callback) {
        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return;
        }

        this._socket.emit('chmodFile', this.namespace, projectDir + '*', {mode: mode}, (err, data) =>
            callback && callback(err, data));
    }

    clearCache() {
        this.storage && this.storage.empty();
    }

    getHistory(id, options, callback) {
        if (!this._checkConnection('getHistory', arguments)) return;

        if (!options) options = {};
        if (!options.timeout) options.timeout = 2000;

        let timeout = setTimeout(() => {
            timeout = null;
            callback('timeout');
        }, options.timeout);

        this._socket.emit('getHistory', id, options, (err, result) => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            callback(err, result);
        });
    }

    getLiveHost(cb) {
        this._socket.emit('getObjectView', 'system', 'host', {
            startkey: 'system.host.',
            endkey: 'system.host.\u9999'
        }, (err, res) => {
            const _hosts = [];
            for (let h = 0; h < res.rows.length; h++) {
                _hosts.push(res.rows[h].id + '.alive');
            }
            if (!_hosts.length) {
                cb('');
                return;
            }
            this.getStates(_hosts, (err, states) => {
                for (const h in states) {
                    if (states.hasOwnProperty(h) && (states[h].val === 'true' || states[h].val === true)) {
                        cb(h.substring(0, h.length - '.alive'.length));
                        return;
                    }
                }
                cb('');
            });
        });
    }

    readDirAsZip(project, useConvert, callback) {
        if (!callback) {
            callback = useConvert;
            useConvert = undefined;
        }
        if (!this._isConnected) {
            console.log('No connection!');
            return;
        }
        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return;
        }
        if (project.match(/\/$/)) {
            project = project.substring(0, project.length - 1);
        }
        this.getLiveHost(host => {
            if (!host) {
                window.alert('No active host found');
                return;
            }
            // to do find active host
            this._socket.emit('sendToHost', host, 'readDirAsZip', {
                id: this.namespace,
                name: project || 'main',
                options: {
                    settings: useConvert
                }
            }, data => {
                if (data.error) console.error(data.error);
                if (callback) callback(data.error, data.data);
            });

        });
    }

    writeDirAsZip(project, base64, callback) {
        if (!this._isConnected) {
            console.log('No connection!');
            return;
        }
        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return;
        }
        if (project.match(/\/$/)) {
            project = project.substring(0, project.length - 1);
        }
        this.getLiveHost(host => {
            if (!host) {
                window.alert('No active host found');
                return;
            }
            this._socket.emit('sendToHost', host, 'writeDirAsZip', {
                id: this.namespace,
                name: project || 'main',
                data: base64
            }, data => {
                data.error && console.error(data.error);
                callback && callback(data.error);
            });
        });
    }
}

export default ServerConnection;