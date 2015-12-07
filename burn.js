(function() {
  var Burn,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Burn = (function() {
    function Burn() {}

    Burn.adapters = {};

    Burn.controllers = {};

    Burn.models = {};

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
        ctrl = Burn.currentController = new controller();
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
      this.runFilter = bind(this.runFilter, this);
      this.fail = bind(this.fail, this);
      this.next = bind(this.next, this);
      this.filters = filters;
    }

    FilterChain.prototype.next = function() {
      return this.runFilter(this.filters.shift());
    };

    FilterChain.prototype.fail = function(message) {
      return this.q.reject(message);
    };

    FilterChain.prototype.start = function() {
      this.q = $.Deferred();
      this.next();
      return this.q.promise();
    };

    FilterChain.prototype.runFilter = function(filter) {
      if (_.isUndefined(filter)) {
        return this.q.resolve();
      } else {
        return filter.apply(this, [this.next, this.fail]);
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
      filters = this.buildFilterChain(name, this.beforeFilters);
      return new Burn.FilterChain(filters).start();
    };

    Controller.prototype.runAfterFilters = function(params, path, name) {
      var filters;
      filters = this.buildFilterChain(name, this.afterFilters);
      return new Burn.FilterChain(filters).start();
    };

    Controller.prototype.buildFilterChain = function(name, filters) {
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
    Template.baseUrl = '';

    Template.prototype.templateUrl = '';

    Template.prototype.templateString = '';

    function Template(templateUrl) {
      this.templateUrl = templateUrl;
    }

    Template.prototype.load = function() {
      var q;
      q = $.Deferred();
      $.get(this.templateUrl).done((function(_this) {
        return function(tpl) {
          _this.templateString = tpl;
          return q.resolve(_this.templateString);
        };
      })(this)).fail(function() {
        return q.reject();
      });
      return q.promise();
    };

    return Template;

  })();

  Burn.Container = (function() {
    Container.prototype.el = null;

    Container.prototype.$el = null;

    Container.prototype.subviews = [];

    function Container(element) {
      this.el = element;
      this.$el = $(this.el);
    }

    Container.prototype.appendView = function(view) {
      view.render();
      this.$el.html(view.el);
      return this.subviews.push(view);
    };

    Container.prototype.destroy = function() {
      var i, len, ref, view;
      ref = this.subviews;
      for (i = 0, len = ref.length; i < len; i++) {
        view = ref[i];
        view.destroy();
      }
      return this.$el.remove();
    };

    return Container;

  })();

  Burn.Layout = (function() {
    Layout.prototype.template = null;

    Layout.prototype.containers = {};

    function Layout(templateUrl) {
      this.template = templateUrl;
    }

    Layout.prototype.render = function() {
      var q;
      this.appContainer = $('[brn-app]').first();
      q = $.Deferred();
      new Burn.Template(this.template).load().done((function(_this) {
        return function(tpl) {
          _this.appContainer.html(tpl);
          _this.initContainers();
          return q.resolve(_this);
        };
      })(this)).fail(function() {
        return q.reject();
      });
      return q.promise();
    };

    Layout.prototype.initContainers = function() {
      return this.appContainer.find('[brn-container]').each((function(_this) {
        return function(idx, ele) {
          var $ele, name;
          $ele = $(ele);
          name = $ele.attr('brn-container');
          return _this.containers[name] = new Burn.Container(ele);
        };
      })(this));
    };

    Layout.prototype.destroy = function() {
      var container, name, ref;
      ref = this.containers;
      for (name in ref) {
        container = ref[name];
        container.destroy();
        delete this.containers[name];
      }
      return this.appContainer.remove();
    };

    return Layout;

  })();

  Burn.View = (function(superClass) {
    extend(View, superClass);

    function View() {
      return View.__super__.constructor.apply(this, arguments);
    }

    View.prototype.beforeRender = function() {};

    View.prototype.afterRender = function() {};

    View.prototype.beforeDestroy = function() {};

    View.prototype.afterDestroy = function() {};

    View.prototype.render = function() {
      this.$el.addClass(this.constructor.name);
      this.beforeRender();
      new Burn.Template(this.template).load().then((function(_this) {
        return function(tpl) {
          _this.$el.html(tpl);
          _this.__rivets__ = rivets.bind(_this.el, _this);
          return _this.afterRender();
        };
      })(this));
      return this.el;
    };

    View.prototype.destroy = function() {
      this._beforeDestroy();
      this.parent = null;
      this.__rivets__.unbind();
      delete this.__rivets__;
      this.remove();
      return this.afterDestroy();
    };

    return View;

  })(Backbone.View);

}).call(this);
