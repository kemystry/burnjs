(function() {
  var Burn, IncludeComponent,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Burn = (function() {
    function Burn() {}

    Burn.adapters = {};

    Burn.controllers = {};

    Burn.models = {};

    Burn.collections = {};

    Burn.views = {};

    Burn.currentController = null;

    Burn.resourceHost = '';


    /*
    Registers a Burn.Controller and sets up the controller's routes
    @param [Burn.Controller] the controller to register
     */

    Burn.registerController = function(controller) {
      var name, ref, results, route, routePath;
      this.router = this.router || new Burn.Router();
      this.controllers[controller.name] = controller;
      ref = controller.prototype.routes;
      results = [];
      for (route in ref) {
        name = ref[route];
        routePath = route + "(/)";
        results.push(Burn.router.registerRoute(routePath, name, controller));
      }
      return results;
    };

    Burn.registerView = function(view) {
      return this.views[view.name] = view;
    };

    Burn.registerModel = function(model) {
      return this.models[model.name] = model;
    };

    Burn.registerCollection = function(collection) {
      return this.collections[collection.name] = collection;
    };

    Burn.registerBinder = function(name, binder) {
      return rivets.binders[name] = binder;
    };

    Burn.registerFilter = function(name, filter) {
      return rivets.filters[name] = filter;
    };

    Burn.registerComponent = function(name, component) {
      return rivets.components[name] = component;
    };


    /*
    Sets up and renders a Burn.Layout
    @return [Burn.Layout]
    @param [String|Burn.Layout] either template string or an instance of Burn.Layout
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

    Burn.start = function() {
      this._initConfig();
      this._initAdapters();
      return Backbone.history.start();
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
        if (model instanceof Burn.Model) {
          value = model.get(keypath);
          eventName = keypath === '*' ? 'change' : "change:" + keypath;
          model[action](eventName, callback);
          if (value instanceof Burn.Collection) {
            return value[action]('add remove reset sort', callback);
          }
        } else if (model instanceof Burn.Collection && keypath === 'models') {
          return model[action]('add remove reset sort', callback);
        }
      };
    };
    _getter = function(obj, keypath) {
      var value;
      if (obj instanceof Burn.Model) {
        value = keypath === '*' ? obj.attributes : obj.get(keypath);
        if (value instanceof Burn.Collection) {
          value = value.models;
        }
      } else if (obj instanceof Burn.Collection) {
        value = obj.models;
      }
      return value;
    };
    _setter = function(obj, keypath, value) {
      if (!(obj instanceof Burn.Model || obj instanceof Burn.Collection)) {
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
            params[match[1]] = arg;
          }
        }
        return ctrl.runBeforeFilters.apply(ctrl, [params, path, name]).done(function() {
          ctrl[name].apply(ctrl, [params]);
          return ctrl.runAfterFilters.apply(ctrl, [params, path, name]);
        }).fail(function(message) {
          return alert(message);
        });
      };
      return this.route(path, name, callback);
    };

    return Router;

  })(Backbone.Router);

  Burn.FilterChain = (function() {
    FilterChain.prototype.filters = [];

    function FilterChain(filters) {
      this._runFilter = bind(this._runFilter, this);
      this._fail = bind(this._fail, this);
      this._next = bind(this._next, this);
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
        return filter.apply(this, [this._next, this._fail]);
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

    Controller.prototype.routes = {};

    Controller.prototype.beforeFilters = {};

    Controller.prototype.afterFilters = {};

    Controller.prototype.runBeforeFilters = function(params, path, name) {
      var filters;
      filters = this._buildFilterChain(name, this.beforeFilters);
      return new Burn.FilterChain(filters).start();
    };

    Controller.prototype.runAfterFilters = function(params, path, name) {
      var filters;
      filters = this._buildFilterChain(name, this.afterFilters);
      return new Burn.FilterChain(filters).start();
    };

    Controller.prototype.destroy = function() {
      this.beforeDestroy();
      return this.afterDestroy();
    };

    Controller.prototype.beforeDestroy = function() {};

    Controller.prototype.afterDestroy = function() {};

    Controller.prototype._buildFilterChain = function(name, filters) {
      var action, chain, opts, run;
      chain = [];
      console.log('TODO: Change from object to Array to make sure they run in order');
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

    function Model() {
      return Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.url = function() {
      var _url, id, path;
      if (!this.resourcePath) {
        throw new Error(this.constructor.name + " must specify a resourcePath");
      }
      path = _.isFunction(this.resourcePath) ? this.resourcePath() : this.resourcePath;
      id = this.get('id');
      _url = Burn.resourceHost + "/" + path;
      if (id) {
        _url = _url + "/" + id;
      }
      return _url;
    };

    return Model;

  })(Backbone.RelationalModel);

  Burn.Collection = (function(superClass) {
    extend(Collection, superClass);

    function Collection() {
      return Collection.__super__.constructor.apply(this, arguments);
    }

    Collection.prototype.url = function() {
      var path;
      if (!this.resourcePath) {
        throw new Error(this.constructor.name + " must specify a resourcePath");
      }
      path = _.isFunction(this.resourcePath) ? this.resourcePath() : this.resourcePath;
      return Burn.resourceHost + "/" + path;
    };

    return Collection;

  })(Backbone.Collection);

  Burn.Template = (function() {
    Template.caching = true;

    Template.qCache = new Burn.Cache('templates-q', false);

    Template.tplCache = new Burn.Cache('templates', true);

    Template.baseUrl = '';

    Template.prototype.templateUrl = '';

    Template.prototype.templateString = '';

    function Template(templateUrl) {
      this.templateUrl = templateUrl;
    }

    Template.prototype.load = function(cache) {
      var q;
      if (_.isUndefined(cache)) {
        cache = true;
      }
      if (cache && Burn.Template.qCache.get(this.templateUrl)) {
        return Burn.Template.qCache.get(this.templateUrl);
      } else {
        q = $.Deferred();
        Burn.Template.qCache.set(this.templateUrl, q);
        if (Burn.Template.tplCache.get(this.templateUrl)) {
          q.resolve(Burn.Template.tplCache.get(this.templateUrl));
        } else {
          $.get(this.templateUrl).done((function(_this) {
            return function(tpl) {
              _this.templateString = tpl;
              Burn.Template.tplCache.set(_this.templateUrl, _this.templateString);
              return q.resolve(_this.templateString);
            };
          })(this)).fail(function() {
            return q.reject();
          });
        }
        return q.promise();
      }
    };

    return Template;

  })();

  Burn.Attachment = (function() {
    Attachment.prototype.el = null;

    Attachment.prototype.$el = null;

    Attachment.prototype.subviews = [];

    function Attachment(element) {
      this.el = element;
      this.$el = $(this.el);
    }

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
      var i, len, ref, view;
      ref = this.subviews;
      for (i = 0, len = ref.length; i < len; i++) {
        view = ref[i];
        view.destroy();
      }
      return this.$el.remove();
    };

    return Attachment;

  })();

  Burn.Layout = (function() {
    Layout.prototype.template = null;

    Layout.prototype.attachments = {};

    Layout.prototype.el = null;

    function Layout(templateUrl) {
      this.template = templateUrl;
    }

    Layout.prototype.render = function(selector) {
      var q;
      selector = selector || '[brn-app]';
      this.el = $(selector).first();
      q = $.Deferred();
      new Burn.Template(this.template).load().done((function(_this) {
        return function(tpl) {
          _this.el.html(tpl);
          _this._initAttachments();
          return q.resolve(_this);
        };
      })(this)).fail(function() {
        return q.reject();
      });
      return q.promise();
    };

    Layout.prototype.destroy = function() {
      var container, name, ref;
      ref = this.attachments;
      for (name in ref) {
        container = ref[name];
        container.destroy();
        delete this.attachments[name];
        delete this[name];
      }
      return this.el.remove();
    };

    Layout.prototype._initAttachments = function() {
      return this.el.find('[brn-attach]').each((function(_this) {
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

    function View(opts) {
      var key, ref, val;
      if (opts.properties) {
        ref = opts.properties;
        for (key in ref) {
          val = ref[key];
          this[key] = val;
        }
      }
      View.__super__.constructor.apply(this, arguments);
    }

    View.prototype.render = function() {
      this.$el.addClass(this.constructor.name);
      this.beforeRender();
      new Burn.Template(this.template).load().then((function(_this) {
        return function(tpl) {
          _this.$el.html(tpl);
          _this._binding = rivets.bind(_this.el, _this);
          return _this.afterRender();
        };
      })(this));
      return this.el;
    };

    View.prototype.destroy = function() {
      this._beforeDestroy();
      this.parent = null;
      this._binding.unbind();
      delete this._binding;
      this.remove();
      return this.afterDestroy();
    };

    return View;

  })(Backbone.View);

  IncludeComponent = {
    "static": ['view'],
    template: function() {
      return '';
    },
    initialize: function(el, data) {
      delete data.view;
      this._view = new Burn.views[this["static"].view]({
        properties: data
      });
      $(el).html(this._view.render());
      return this._view;
    }
  };

  Burn.registerComponent('include', IncludeComponent);

}).call(this);
