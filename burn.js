(function() {
  var AddClassBinder, BgImageBinder, Burn, EachBinder, IncludeComponent, RhrefBinder, ViewBinder,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Burn = (function() {
    function Burn() {}

    Burn.version = '1.1.0';

    Burn.adapters = {};

    Burn.controllers = {};

    Burn.models = {};

    Burn.collections = {};

    Burn.views = {};

    Burn.currentController = null;

    Burn.resourceHost = '';

    Burn.resourceAttrTransform = null;


    /*
    Registers a Burn.Controller and sets up the controller's routes
    @param [Burn.Controller] the controller to register
     */

    Burn.registerController = function(name, controller) {
      var funcName, ref, results, route, routePath;
      this.router || (this.router = new Burn.Router());
      controller.name = name;
      this.controllers[name] = controller;
      ref = controller.prototype.routes;
      results = [];
      for (route in ref) {
        funcName = ref[route];
        if (controller.prototype.scope) {
          routePath = controller.prototype.scope + "/" + route + "(/)";
        } else {
          routePath = route + "(/)";
          if (route === '*path') {
            routePath = route;
          }
        }
        results.push(Burn.router.registerRoute(routePath, funcName, controller));
      }
      return results;
    };

    Burn.registerView = function(name, view) {
      view.name = name;
      return this.views[name] = view;
    };

    Burn.registerModel = function(name, model) {
      model.name = name;
      return this.models[name] = model;
    };

    Burn.registerCollection = function(name, collection) {
      collection.name = name;
      return this.collections[name] = collection;
    };

    Burn.registerBinder = function(name, binder) {
      return rivets.binders[name] = binder;
    };

    Burn.registerFormatter = function(name, formatter) {
      return rivets.formatters[name] = formatter;
    };

    Burn.registerComponent = function(name, component) {
      return rivets.components[name] = component;
    };


    /*
    Sets up and renders a Burn.Layout
    @return [Burn.Layout]
    @param [String|Burn.Layout] either template string or an instance of
     Burn.Layout
     */

    Burn.layout = function(layout) {
      if (_.isString(layout)) {
        this.currentLayout = new Burn.Layout();
        this.currentLayout.template = layout;
      } else if (layout instanceof Burn.Layout) {
        this.currentLayout = layout;
      }
      this.currentLayout.render();
      return this.currentLayout;
    };


    /*
    Start application and start listening to route changes
     */

    Burn.start = function(opts) {
      this._initOpts(opts);
      this._initConfig();
      this._initAdapters();
      return Backbone.history.start();
    };

    Burn._initOpts = function(opts) {
      this.opts = opts || {};
      this.resourceHost = this.opts.resourceHost || '';
      return this.resourceAttrTransform = this.opts.resourceAttrTransform || null;
    };

    Burn._initAdapters = function() {
      return rivets.adapters[':'] = Burn.adapters.BackboneRelational();
    };

    Burn._initConfig = function() {
      var config;
      config = {
        prefix: 'brn',
        preloadData: true,
        rootInterface: '.',
        templateDelimiters: ['{', '}'],
        handler: function(target, event, binding) {
          if (binding.model instanceof Burn.Model) {
            return this.call(binding.model);
          } else {
            return this.call(target, event, binding.view.models);
          }
        }
      };
      return rivets.configure(config);
    };

    return Burn;

  })();

  self.Burn = Burn;

  Burn.Cache = (function() {
    Cache.prototype.cache = {};

    Cache.prototype.persist = false;

    Cache.prototype.namespace = '';

    function Cache(namespace, persist) {
      this.persist = persist || false;
      this.namespace = namespace || '';
    }


    /*
    @param [String|Object] val Value to cache, if Persistence is on,
     Value must be a String
     */

    Cache.prototype.set = function(key, val) {
      if (this.persist) {
        return self.localStorage.setItem(this.namespace + ":" + key, val);
      } else {
        return this.cache[key] = val;
      }
    };

    Cache.prototype.get = function(key) {
      if (this.persist) {
        return self.localStorage.getItem(this.namespace + ":" + key);
      } else {
        return this.cache[key];
      }
    };

    Cache.prototype.remove = function(key) {
      if (this.persist) {
        return self.localStorage.removeItem(this.namespace + ":" + key);
      } else {
        return delete this.cache[key];
      }
    };

    Cache.prototype.clear = function() {
      var key, ref, results, val;
      if (this.persist) {
        ref = self.localStorage;
        results = [];
        for (key in ref) {
          val = ref[key];
          if (key.indexOf(this.namespace + ":") === 0) {
            results.push(self.localStorage.removeItem(key));
          } else {
            results.push(void 0);
          }
        }
        return results;
      } else {
        return this.cache = [];
      }
    };

    return Cache;

  })();

  Burn.adapters.BackboneRelational = function() {
    var _factory, _getter, _setter;
    _factory = function(action) {
      return function(model, keypath, callback) {
        var eventName, value;
        if (model instanceof Backbone.RelationalModel) {
          value = model.get(keypath);
          eventName = keypath === '*' ? 'change' : "change:" + keypath;
          model[action](eventName, callback);
          if (value instanceof Backbone.Collection) {
            return value[action]('add remove reset sort change', callback);
          }
        } else if (model instanceof Backbone.Collection && keypath === 'models') {
          return model[action]('add remove reset sort change', callback);
        }
      };
    };
    _getter = function(obj, keypath) {
      var value;
      if (obj instanceof Backbone.RelationalModel) {
        value = keypath === '*' ? obj.attributes : obj.get(keypath);
        if (value instanceof Backbone.Collection) {
          value = value.models;
        }
      } else if (obj instanceof Backbone.Collection) {
        value = obj.models;
      }
      return value;
    };
    _setter = function(obj, keypath, value) {
      if (!(obj instanceof Backbone.RelationalModel || obj instanceof Backbone.Collection)) {
        return;
      }
      if (keypath === '*') {
        return obj.set(value);
      } else {
        return obj.set(keypath, value);
      }
    };
    return {
      observe: _factory('on'),
      unobserve: _factory('off'),
      get: _getter,
      set: _setter
    };
  };

  Burn.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.registerRoute = function(path, name, controller) {
      var callback;
      callback = function() {
        var arg, ctrl, i, len, match, params, re;
        if (Burn.currentController instanceof controller) {
          ctrl = Burn.currentController;
        } else {
          if (Burn.currentController) {
            Burn.currentController.destroy();
          }
          ctrl = Burn.currentController = new controller();
        }
        params = {};
        if (arguments.length > 0) {
          re = /:([a-zA-Z0-9_\-]+)/g;
          for (i = 0, len = arguments.length; i < len; i++) {
            arg = arguments[i];
            if (_.isNull(arg)) {
              continue;
            }
            match = re.exec(path);
            if (match && match[1]) {
              params[match[1]] = arg;
            } else {
              params.query = _.chain(arg.split('&')).map(function(params) {
                var p;
                p = params.split('=');
                return [p[0], decodeURIComponent(p[1])];
              }).object().value();
            }
          }
        }
        return ctrl.runBeforeFilters.apply(ctrl, [params, path, name]).done(function() {
          ctrl[name].apply(ctrl, [params]);
          ctrl.currentRoutePath = path;
          ctrl.currentRouteName = name;
          return ctrl.runAfterFilters.apply(ctrl, [params, path, name]);
        }).fail(function(message) {
          return ctrl.onFilterFail(message, params, path, name);
        });
      };
      return this.route(path, name, callback);
    };

    Router.prototype.parseUrl = function(url) {
      var currentParams, path, query;
      path = url.match(/#([^?]+)/) || '';
      currentParams = url.match(/([^&?]+=[^&?]+)/g);
      query = {};
      if (currentParams && currentParams.length > 0) {
        _.each(currentParams, function(param) {
          var spl;
          spl = param.split('=');
          return query[spl[0]] = spl[1] || null;
        });
      }
      return {
        path: path[1],
        query: query
      };
    };

    Router.prototype.updateQuery = function(params, opts) {
      var parsedUrl, query;
      if (params == null) {
        params = {};
      }
      if (opts == null) {
        opts = {
          clear: false,
          trigger: false
        };
      }
      parsedUrl = this.parseUrl(Backbone.history.location.hash);
      params = _.extendOwn({}, parsedUrl.query, params);
      query = $.param(params);
      return this.navigate("#" + parsedUrl.path + "?" + query, {
        trigger: opts.trigger
      });
    };

    return Router;

  })(Backbone.Router);

  Burn.FilterChain = (function() {
    FilterChain.prototype.filters = [];

    function FilterChain(filters, path, name) {
      this._runFilter = bind(this._runFilter, this);
      this._fail = bind(this._fail, this);
      this._next = bind(this._next, this);
      this._path = path;
      this._name = name;
      this.filters = filters;
    }

    FilterChain.prototype.start = function() {
      this.q = $.Deferred();
      this._next();
      return this.q.promise();
    };

    FilterChain.prototype._next = function() {
      return this._runFilter(this.filters.shift());
    };

    FilterChain.prototype._fail = function(message) {
      return this.q.reject(message);
    };

    FilterChain.prototype._runFilter = function(filter) {
      if (_.isUndefined(filter)) {
        return this.q.resolve();
      } else {
        return filter.apply(this, [this._next, this._fail, this._path, this._name]);
      }
    };

    return FilterChain;

  })();


  /*
  @example Extend Burn.Controller and register the new controller
    class CustomController extends Burn.Controller
  
      routes:
        'alert/:title' : 'alert'
  
      alert: (params) ->
        alert(params.title)
  
    Burn.registerController(CustomController)
   */

  Burn.Controller = (function() {
    function Controller() {}

    Controller.prototype.layout = null;

    Controller.prototype.routes = {};

    Controller.prototype.beforeFilters = {};

    Controller.prototype.afterFilters = {};

    Controller.prototype._events = [];

    Controller.prototype.listenTo = function(obj, event, callback) {
      this._events.push([obj, event, callback]);
      return obj.on(event, callback);
    };

    Controller.prototype.stopListening = function(obj) {
      var evt, i, idx, j, len, len1, ref, ref1, results;
      if (_.isUndefined(obj)) {
        ref = this._events;
        for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
          evt = ref[idx];
          evt[0].off(evt[1], evt[2]);
        }
        return this._events = [];
      } else {
        ref1 = this._events;
        results = [];
        for (idx = j = 0, len1 = ref1.length; j < len1; idx = ++j) {
          evt = ref1[idx];
          if (evt[0] === obj) {
            evt[0].off(evt[1], evt[2]);
            results.push(this._events.splice(idx, 1));
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    };

    Controller.prototype.runBeforeFilters = function(params, path, name) {
      var filters;
      filters = this._buildFilterChain(name, this._getFilters('beforeFilters'));
      return new Burn.FilterChain(filters, path, name).start();
    };

    Controller.prototype.runAfterFilters = function(params, path, name) {
      var filters;
      filters = this._buildFilterChain(name, this._getFilters('afterFilters'));
      return new Burn.FilterChain(filters, path, name).start();
    };

    Controller.prototype.destroy = function() {
      this.beforeDestroy();
      this.stopListening();
      return this.afterDestroy();
    };

    Controller.prototype.beforeDestroy = function() {};

    Controller.prototype.afterDestroy = function() {};

    Controller.prototype.onFilterFail = function() {};

    Controller.prototype._getFilters = function(filterKey) {
      var filters;
      filters = {};
      if (this.constructor.__super__ && this.constructor.__super__[filterKey]) {
        filters = this.constructor.__super__._getFilters(filterKey);
      }
      return _.extend(filters, this[filterKey]);
    };

    Controller.prototype._buildFilterChain = function(name, filters) {
      var action, chain, opts, run;
      chain = [];
      for (action in filters) {
        opts = filters[action];
        run = false;
        if (opts === 'all') {
          run = true;
        } else if (opts.only && opts.only.indexOf(name) !== -1) {
          run = true;
        } else if (opts.except && opts.except.indexOf(name) === -1) {
          run = true;
        }
        if (run) {
          chain.push(this[action]);
        }
      }
      return chain;
    };

    return Controller;

  })();

  Burn.Model = (function(superClass) {
    extend(Model, superClass);

    Model.prototype.fetching = false;

    Model.prototype.destroying = false;

    Model.prototype.updating = false;

    Model.prototype.saving = false;

    function Model() {
      this.validations = new Backbone.RelationalModel();
      this.on('validated:invalid', (function(_this) {
        return function(model, errors) {
          _this.validations.clear();
          return _this.validations.set(errors);
        };
      })(this));
      this.on('validated:valid', (function(_this) {
        return function(model, errors) {
          return _this.validations.clear();
        };
      })(this));
      this.on('request', function() {
        return this.updating = true;
      });
      this.on('sync', function() {
        return this.updating = false;
      });
      this.on('error', function() {
        return this.updating = false;
      });
      Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.url = function() {
      var _url, id, path;
      if (!this.resourcePath) {
        throw new Error(this.constructor.name + " must specify a resourcePath");
      }
      if (_.isFunction(this.resourcePath)) {
        path = this.resourcePath();
      } else {
        path = this.resourcePath;
      }
      id = this.get('id');
      _url = Burn.resourceHost + "/" + path;
      if (id) {
        _url = _url + "/" + id;
      }
      return _url + '/';
    };

    Model.prototype.update = function(opts) {
      opts = opts || {};
      if (this.changedAttributes()) {
        opts.patch = true;
      }
      return this.save(_.pick(this.toJSON(), _.keys(this.changed)), opts);
    };

    Model.prototype.toJSON = function(opts) {
      var attributes;
      attributes = Model.__super__.toJSON.call(this, opts);
      if (this.excludeFromJSON) {
        attributes = _.omit(attributes, this.excludeFromJSON);
      }
      return attributes;
    };

    Model.prototype.validateField = function(field) {
      var val;
      val = this.preValidate(field, this.get(field));
      if (val) {
        return this.validations.set(field, val);
      } else {
        return this.validations.unset(field);
      }
    };

    Model.prototype.fetch = function() {
      this.fetching = true;
      if (this._xhr) {
        if (this._xhr.readyState !== 4) {
          this._xhr.abort();
        }
        this._xhr = null;
      }
      this._xhr = Model.__super__.fetch.apply(this, arguments);
      this._xhr.done((function(_this) {
        return function() {
          return _this.fetching = false;
        };
      })(this));
      this._xhr.fail((function(_this) {
        return function() {
          return _this.fetching = false;
        };
      })(this));
      return this._xhr;
    };

    Model.prototype.save = function() {
      this._xhr = Model.__super__.save.apply(this, arguments);
      if (!this._xhr) {
        return this._xhr;
      }
      this.saving = true;
      this._xhr.done((function(_this) {
        return function() {
          return _this.saving = false;
        };
      })(this));
      this._xhr.fail((function(_this) {
        return function() {
          return _this.saving = false;
        };
      })(this));
      return this._xhr;
    };

    Model.prototype.destroy = function() {
      this._xhr = Model.__super__.destroy.apply(this, arguments);
      if (!this._xhr) {
        return this._xhr;
      }
      this.destroying = true;
      this._xhr.done((function(_this) {
        return function() {
          return _this.destroying = false;
        };
      })(this));
      this._xhr.fail((function(_this) {
        return function() {
          return _this.destroying = false;
        };
      })(this));
      return this._xhr;
    };

    return Model;

  })(Backbone.RelationalModel);

  _.extend(Burn.Model.prototype, Backbone.Validation.mixin);

  Burn.Collection = (function(superClass) {
    extend(Collection, superClass);

    Collection.prototype.updating = false;

    Collection.prototype.fetching = false;

    function Collection() {
      this.on('request', function(collection) {
        if (collection !== this) {
          return;
        }
        return this.updating = true;
      });
      this.on('sync', function(collection) {
        if (collection !== this) {
          return;
        }
        return this.updating = false;
      });
      this.on('error', function(collection) {
        if (collection !== this) {
          return;
        }
        return this.updating = false;
      });
      Collection.__super__.constructor.apply(this, arguments);
    }

    Collection.prototype.url = function() {
      var path;
      if (!this.resourcePath) {
        throw new Error(this.constructor.name + " must specify a resourcePath");
      }
      if (_.isFunction(this.resourcePath)) {
        path = this.resourcePath();
      } else {
        path = this.resourcePath;
      }
      return Burn.resourceHost + "/" + path + "/";
    };

    Collection.prototype.fetch = function() {
      this.fetching = true;
      if (this._xhr) {
        if (this._xhr.readyState !== 4) {
          this._xhr.abort();
        }
        this._xhr = null;
      }
      this._xhr = Collection.__super__.fetch.apply(this, arguments);
      this._xhr.done((function(_this) {
        return function() {
          return _this.fetching = false;
        };
      })(this));
      this._xhr.fail((function(_this) {
        return function() {
          return _this.fetching = false;
        };
      })(this));
      return this._xhr;
    };

    return Collection;

  })(Backbone.Collection);


  /*
  @example Load a template
    var tpl = new Burn.Template('path/to/template.html')
    tpl.load().then(function (templateString) {
      alert(templateString);
    });
   */

  Burn.Template = (function() {
    Template.revision = '';

    Template.caching = true;

    Template.store = {};

    Template.baseUrl = '';

    Template.prototype.templateUrl = '';

    Template.prototype.templateString = '';

    function Template(templateUrl) {
      this.load = bind(this.load, this);
      this.templateUrl = templateUrl + "?rev=" + Burn.Template.revision;
    }

    Template.prototype.load = function(cache) {
      var q;
      if (_.isUndefined(cache)) {
        cache = Burn.Template.caching;
      }
      if (!(cache && Burn.Template.store[this.templateUrl])) {
        q = $.Deferred();
        $.get(this.templateUrl).done((function(_this) {
          return function(tpl) {
            _this.templateString = tpl;
            return q.resolve(_this.templateString);
          };
        })(this)).fail(function() {
          return q.reject();
        });
        Burn.Template.store[this.templateUrl] = q.promise();
      }
      return Burn.Template.store[this.templateUrl];
    };

    return Template;

  })();

  Burn.Attachment = (function() {
    Attachment.prototype.el = null;

    Attachment.prototype.$el = null;

    Attachment.prototype.subviews = [];

    function Attachment(element) {
      this.subviews = [];
      this.el = element;
      this.$el = $(this.el);
    }

    Attachment.prototype.setView = function(view) {
      this.removeViews();
      view.render();
      this.$el.html(view.el);
      return this.subviews.push(view);
    };

    Attachment.prototype.appendView = function(view) {
      view.render();
      this.$el.append(view.el);
      return this.subviews.push(view);
    };

    Attachment.prototype.prependView = function(view) {
      view.render();
      this.$el.append(view.el);
      return this.subviews.push(view);
    };

    Attachment.prototype.removeView = function(view) {
      this.subviews.splice(this.subviews.indexOf(view), 1);
      return view.destroy();
    };

    Attachment.prototype.destroy = function() {
      this.removeViews();
      return this.$el.remove();
    };

    Attachment.prototype.removeViews = function() {
      var i, len, ref, results, view;
      ref = this.subviews;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        view = ref[i];
        results.push(this.removeView(view));
      }
      return results;
    };

    return Attachment;

  })();

  Burn.Layout = (function() {
    Layout.prototype.template = null;

    Layout.prototype.attachments = {};

    Layout.prototype.el = null;

    Layout.prototype.$el = null;

    Layout.prototype.initialize = function(opts) {};

    function Layout(opts) {
      var el;
      opts = opts || {};
      if (opts.template) {
        this.template = new Burn.Template(opts.template);
      }
      el = opts.el || '<div></div>';
      this.$el = $(el);
      this.el = this.$el[0];
      this.initialize(opts);
    }

    Layout.prototype.render = function(data) {
      var q;
      q = $.Deferred();
      this.template.load().done((function(_this) {
        return function(tpl) {
          _this.$el.html(tpl);
          _this._initAttachments();
          _this._binding = rivets.bind(_this.el, data || {});
          return q.resolve(_this);
        };
      })(this)).fail(function() {
        return q.reject();
      });
      return q.promise();
    };

    Layout.prototype.isRendered = function() {
      if (this._binding) {
        return true;
      } else {
        return false;
      }
    };

    Layout.prototype.destroy = function() {
      var container, name, ref;
      if (this._binding) {
        this._binding.unbind();
        delete this._binding;
      }
      ref = this.attachments;
      for (name in ref) {
        container = ref[name];
        container.destroy();
        delete this.attachments[name];
        delete this[name];
      }
      return this.$el.remove();
    };

    Layout.prototype._initAttachments = function() {
      return this.$el.find('[brn-attach]').each((function(_this) {
        return function(idx, ele) {
          var $ele, name;
          $ele = $(ele);
          name = $ele.attr('brn-attach');
          _this.attachments[name] = new Burn.Attachment(ele);
          return _this[name] = _this.attachments[name];
        };
      })(this));
    };

    return Layout;

  })();

  Burn.View = (function(superClass) {
    extend(View, superClass);

    View.prototype._binding = null;

    View.prototype.beforeRender = function() {};

    View.prototype.afterRender = function() {};

    View.prototype.beforeDestroy = function() {};

    View.prototype.afterDestroy = function() {};

    View.prototype.beforeBind = function() {};

    View.prototype.afterBind = function() {};

    View.prototype.beforeTemplateLoad = function() {};

    View.prototype.afterTemplateLoad = function() {};

    View.prototype.transformTemplate = function(tpl) {
      return tpl;
    };

    function View(opts) {
      var key, ref, val;
      this.options = opts;
      if (_.isObject(opts) && opts.properties) {
        ref = opts.properties;
        for (key in ref) {
          val = ref[key];
          this[key] = val;
        }
      }
      View.__super__.constructor.apply(this, arguments);
      this.el.view = this;
    }

    View.prototype.render = function() {
      this.beforeRender();
      if (this.template) {
        new Burn.Template(this.template).load().then((function(_this) {
          return function(tpl) {
            _this.beforeTemplateLoad();
            tpl = _this.transformTemplate(tpl);
            _this.$el.html(tpl);
            _this.afterTemplateLoad();
            _this.$el.addClass(_this.constructor.name);
            _this.beforeBind();
            _this._binding = rivets.bind(_this.el, _this);
            _this.afterBind();
            return _this.afterRender();
          };
        })(this));
      } else {
        this.$el.addClass(this.constructor.name);
        this.beforeBind();
        this._binding = rivets.bind(this.el, this);
        this.afterBind();
        this.afterRender();
      }
      return this.el;
    };

    View.prototype.destroy = function() {
      this.beforeDestroy();
      this.parent = null;
      if (this._binding) {
        this._binding.unbind();
        delete this._binding;
      }
      this.remove();
      return this.afterDestroy();
    };

    View.prototype.navigate = function(route, trigger) {
      var opts;
      if (trigger !== false) {
        opts = {
          trigger: true
        };
      }
      return Burn.router.navigate(route, opts);
    };

    return View;

  })(Backbone.View);

  AddClassBinder = function(el, value) {
    if (!$(el).hasClass(value)) {
      return $(el).addClass(value);
    }
  };

  Burn.registerBinder('add-class', AddClassBinder);

  BgImageBinder = function(el, value) {
    if (value == null) {
      value = '';
    }
    value = value.replace("'", "%27");
    return $(el).css('background-image', "url('" + value + "')");
  };

  Burn.registerBinder('bg-img', BgImageBinder);

  EachBinder = {
    block: true,
    priority: 4000,
    bind: function(el) {
      var attr, i, len, ref, view;
      if (this.marker == null) {
        attr = [this.view.prefix, this.type].join('-').replace('--', '-');
        this.marker = document.createComment(" rivets: " + this.type + " ");
        this.iterated = [];
        el.removeAttribute(attr);
        el.parentNode.insertBefore(this.marker, el);
        el.parentNode.removeChild(el);
      } else {
        ref = this.iterated;
        for (i = 0, len = ref.length; i < len; i++) {
          view = ref[i];
          view.bind();
        }
      }
    },
    unbind: function(el) {
      var i, len, ref, view;
      if (this.iterated != null) {
        ref = this.iterated;
        for (i = 0, len = ref.length; i < len; i++) {
          view = ref[i];
          view.unbind();
        }
      }
    },
    routine: function(el, collection) {
      var binding, data, i, index, j, key, len, len1, model, modelName, nodes, options, previous, ref, ref1, ref2, template, view;
      modelName = this.args[0];
      collection || (collection = []);
      if (this.iterated.length > collection.length) {
        index = 0;
        while (index < this.iterated.length) {
          if (!(collection.indexOf(this.iterated[index].models[modelName]) > -1)) {
            view = this.iterated.splice(index, 1)[0];
            view.unbind();
            $(view.els).remove();
          } else {
            index++;
          }
        }
      } else if (this.iterated.length < collection.length) {
        index = 0;
        while (index < collection.length) {
          model = collection[index];
          if (this.iterated[index] && this.iterated[index].models[modelName] !== model) {
            data = {
              index: index
            };
            data["%" + modelName + "%"] = index;
            if (data[modelName] == null) {
              data[modelName] = model;
            }
            template = el.cloneNode(true);
            options = this.view.options();
            options.preloadData = true;
            ref = this.view.models;
            for (key in ref) {
              model = ref[key];
              data[key] = model;
            }
            view = rivets.bind(template, data, options);
            this.iterated.splice(index, 0, view);
            nodes = $(this.marker).parent().find('> ' + el.nodeName);
            nodes.eq(index).before(template);
          }
          index++;
        }
      }
      for (index = i = 0, len = collection.length; i < len; index = ++i) {
        model = collection[index];
        data = {
          index: index
        };
        data["%" + modelName + "%"] = index;
        if (data[modelName] == null) {
          data[modelName] = model;
        }
        if (this.iterated[index] == null) {
          ref1 = this.view.models;
          for (key in ref1) {
            model = ref1[key];
            data[key] = model;
          }
          previous = this.iterated.length ? this.iterated[this.iterated.length - 1].els[0] : this.marker;
          options = this.view.options();
          options.preloadData = true;
          template = el.cloneNode(true);
          view = rivets.bind(template, data, options);
          this.iterated.push(view);
          this.marker.parentNode.insertBefore(template, previous.nextSibling);
        }
      }
      if (el.nodeName === 'OPTION') {
        ref2 = this.view.bindings;
        for (j = 0, len1 = ref2.length; j < len1; j++) {
          binding = ref2[j];
          if (binding.el === this.marker.parentNode && binding.type === 'value') {
            binding.sync();
          }
        }
      }
    },
    update: function(models) {
      var data, i, key, len, model, ref, view;
      data = {};
      for (key in models) {
        model = models[key];
        if (key !== this.args[0]) {
          data[key] = model;
        }
      }
      ref = this.iterated;
      for (i = 0, len = ref.length; i < len; i++) {
        view = ref[i];
        view.update(data);
      }
    }
  };

  Burn.registerBinder('each-*', EachBinder);

  RhrefBinder = {
    bind: function(ele) {
      return $(ele).on('click', function(event) {
        if (event.target === event.currentTarget) {
          event.preventDefault();
          return Burn.router.navigate($(this).attr('rhref'), {
            trigger: true
          });
        }
      });
    },
    unbind: function(ele) {
      return $(ele).off('click');
    },
    routine: function(ele, value) {
      if (!value) {
        value = this.keypath;
      }
      $(ele).attr('rhref', value.replace(/^\//, ''));
      return $(ele).attr('href', '#' + value.replace(/^\//, ''));
    }
  };

  Burn.registerBinder('rhref', RhrefBinder);

  ViewBinder = {
    block: false,
    priority: 9000,
    bind: function(el) {
      var attr, i, len, model, parseAttr, props, ref, val, view;
      parseAttr = function(model, keypath) {
        var v;
        v = rivets._.sightglass(model, keypath, null, {
          root: rivets.rootInterface,
          adapters: rivets.adapters
        });
        return rivets.adapters[':'].get(v.target, v.key.path);
      };
      props = {};
      el.removeAttribute('brn-view');
      ref = el.attributes;
      for (i = 0, len = ref.length; i < len; i++) {
        attr = ref[i];
        if (attr.value.indexOf(':') > -1 && attr.value.indexOf('!') !== 0) {
          model = parseAttr(this.view.models, attr.value);
        } else if (attr.name !== 'view') {
          if (!(attr.name.indexOf('brn-') > -1)) {
            model = this.view.models[attr.value];
          }
        }
        if (model) {
          props[S(attr.name).camelize().s] = model;
        } else {
          if (attr.value.indexOf('!') === 0) {
            val = attr.value.substr(1);
          } else {
            val = attr.value;
          }
          props[S(attr.name).camelize().s] = val;
        }
      }
      view = $(el).attr('view');
      this._view = new Burn.views[view]({
        el: el,
        properties: props
      });
      return this._view.render();
    },
    unbind: function(el) {
      return this._view.destroy();
    },
    routine: function(el) {}
  };

  Burn.registerBinder('view', ViewBinder);

  Burn.registerFormatter('formatDate', function(target, val) {
    var shortcuts;
    shortcuts = {
      'long': 'MMM Do, YYYY',
      'short': 'MM/DD/YY',
      'datetime-long': 'MMM Do, YYYY @ h:mm a',
      'datetime-short': 'MM/DD/YYYY @ h:mm a'
    };
    if (shortcuts[val]) {
      val = shortcuts[val];
    }
    if (target) {
      return moment(target).format(val);
    } else {
      return target;
    }
  });

  Burn.registerFormatter('numeral', function(target, val) {
    if (_.isNaN(parseFloat(target))) {
      return target;
    } else {
      return numeral(target).format(val);
    }
  });

  Burn.registerFormatter('currency', function(target, val) {
    return rivets.formatters.numeral(target, '$0,0.00');
  });

  Burn.registerFormatter('formatNumber', function(target, val) {
    return rivets.formatters.numeral(target, '0,0.00');
  });

  Burn.registerFormatter('append', function(target, val) {
    if (!_.isUndefinedOrNull(target)) {
      return "" + target + val;
    } else {
      return target;
    }
  });

  Burn.registerFormatter('prepend', function(target, val) {
    if (!_.isUndefinedOrNull(target)) {
      return "" + val + target;
    } else {
      return target;
    }
  });

  Burn.registerFormatter('shorten', function(target, val, ellipsis) {
    var s;
    if (ellipsis == null) {
      ellipsis = false;
    }
    if (_.isUndefinedOrNull(target) || (target && target.length <= val)) {
      return target;
    }
    if (ellipsis) {
      val = val - 3;
    }
    s = target.substring(0, val);
    if (ellipsis) {
      s = s + "...";
    }
    return s;
  });

  Burn.registerFormatter('to-string', function(target) {
    if (_.isUndefinedOrNull(target)) {
      return '';
    } else {
      return target.toString();
    }
  });

  Burn.registerFormatter('eq', function(target, val) {
    return target === val;
  });

  IncludeComponent = {
    "static": ['view', 'tag'],
    template: function() {
      return '';
    },
    initialize: function(el, data) {
      var $el, newEl, opts;
      delete data.view;
      opts = {
        properties: data
      };
      if (this["static"].tag) {
        $el = $(el);
        newEl = $("<" + this["static"].tag + "/>");
        $el.replaceWith(newEl);
        el = newEl[0];
        opts.el = el;
      }
      this._view = new Burn.views[this["static"].view](opts);
      $(el).html(this._view.render());
      return this._view;
    }
  };

  Burn.registerComponent('include', IncludeComponent);

}).call(this);
