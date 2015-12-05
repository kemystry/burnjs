(function() {
  var Burn,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

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
          return this.call(target, event, binding.view.models);
        }
      };
      return rivets.configure(config);
    };

    return Burn;

  })();

  self.Burn = Burn;

  Burn.adapters.BackboneRelational = function() {
    var factory, getter, setter;
    factory = function(action) {
      return function(model, keypath, callback) {
        var eventName, value;
        if (!(model instanceof Burn.Model)) {
          return;
        }
        value = model.get(keypath);
        eventName = keypath === '*' ? 'change' : "change:" + keypath;
        model[action](eventName, callback);
        if (value instanceof Burn.Collection) {
          return value[action]('add remove reset sort', callback);
        }
      };
    };
    getter = function(obj, keypath) {
      var value;
      if (!(obj instanceof Burn.Model || obj instanceof Burn.Collection)) {
        return;
      }
      value = keypath === '*' ? obj.attributes : obj.get(keypath);
      if (value instanceof Burn.Collection) {
        return value.models;
      }
    };
    return setter = function(obj, keypath, value) {
      if (!(obj instanceof Burn.Model || obj instanceof Burn.Collection)) {
        return;
      }
      if (keypath === '*') {
        obj.set(value);
      } else {
        obj.set(keypath, value);
      }
      return {
        observe: factory('on'),
        unobserve: factory('off'),
        get: getter,
        set: setter
      };
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
        ctrl.runBeforeFilters.apply(ctrl, [params, path, name]);
        ctrl[name].apply(ctrl, [params]);
        return ctrl.runAfterFilters.apply(ctrl, [params, path, name]);
      };
      return this.route(path, name, callback);
    };

    return Router;

  })(Backbone.Router);


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
      return this.runFilters(name, this.beforeFilters);
    };

    Controller.prototype.runAfterFilters = function(params, path, name) {
      return this.runFilters(name, this.afterFilters);
    };

    Controller.prototype.runFilters = function(name, filters) {
      var action, opts, results, run;
      run = false;
      results = [];
      for (action in filters) {
        opts = filters[action];
        if (opts === 'all') {
          run = true;
        } else if (opts.only && opts.only.indexOf(name) !== -1) {
          run = true;
        } else if (opts.except && opts.except.indexOf(name) === -1) {
          run = true;
        }
        if (run) {
          results.push(this[action].apply(this, [name]));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    return Controller;

  })();

  Burn.Model = (function(superClass) {
    extend(Model, superClass);

    function Model() {
      return Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.url = function() {
      var path;
      if (!this.resourcePath) {
        throw new Error(this.constructor.name + " must specify a resourcePath");
      }
      path = _.isFunction(this.resourcePath) ? this.resourcePath() : this.resourcePath;
      return Burn.resourceHost + "/" + path;
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

  Burn.Layout = (function() {
    function Layout() {}

    Layout.prototype.template = null;

    Layout.prototype.containers = {};

    Layout.prototype.render = function() {
      var mainContainer;
      mainContainer = $('[brn-app]').first();
      return mainContainer.text(this.template);
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

    View.prototype.loadTemplate = function() {
      var q;
      q = $.Deferred();
      return q;
    };

    View.prototype.render = function() {
      this.$el.addClass(this.constructor.name);
      this.beforeRender();
      this.loadTemplate().then((function(_this) {
        return function(tpl) {
          if (_this.template) {
            _this.$el.html();
          }
          _this.__rivets__ = rivets.bind(_this.el, _this);
          return _this.afterRender();
        };
      })(this));
      return this;
    };

    View.prototype.destroy = function() {
      if (this._beforeDestroy) {
        this._beforeDestroy();
      }
      this.parent = null;
      this.__rivets__.unbind();
      delete this.__rivets__;
      this.remove();
      return this.afterDestroy();
    };

    return View;

  })(Backbone.View);

}).call(this);
