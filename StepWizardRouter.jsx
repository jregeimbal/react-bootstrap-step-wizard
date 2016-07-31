"use strict";

var React                     = require('react');
import {RouterMixin, RouteRenderingMixin} from 'react-router-component';
var assign                    = Object.assign || require('object-assign');
var omit                      = require('object.omit');

// These are keys to omit - useful for preventing 15.2.0 warning regarding unknown props on DOM els
var PROP_KEYS = ['component']
  .concat(Object.keys(RouterMixin.propTypes))
  .concat(Object.keys(RouteRenderingMixin.propTypes));

/**
 * Create a new router class
 *
 * @param {String} name
 * @param {ReactComponent} component
 */
var Router = React.createClass({

    mixins: [RouterMixin, RouteRenderingMixin],

    displayName: 'StepWizardRouter',

    propTypes: {
      component: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.element
      ])
    },

    getRoutes: function(props) {
      return props.children;
    },

    getDefaultProps: function() {
      return {
        component: 'component'
      };
    },

    renderRouteHandler2: function() {
      if (!this.state.match.route) {
        throw new Error("React-router-component: No route matched! Did you define a NotFound route?");
      }
      var handler = this.state.handler;
      var isDOMElement = typeof handler.type === 'string';

      // If this is a DOM element, don't send these props. This won't prevent all
      // warnings in 15.2.0, but it will catch a lot of them.
      var matchProps = isDOMElement ? null : this.state.matchProps;

      var outProps = assign({ref: this.state.match.route.ref}, this.getChildProps(), matchProps);

      // If we were passed an element, we need to clone it before passing it along.
      if (React.isValidElement(handler)) {
        // Be sure to keep the props that were already set on the handler.
        // Otherwise, a handler like <div className="foo">bar</div> would have its className lost.
        return React.cloneElement(handler, assign(outProps, handler.props));
      }
      return React.createElement(handler, outProps);
    },

    render: function() {
      // Render the Route's handler.
      var handler = this.renderRouteHandler2();

      if (!this.props.component) {
        return handler;
      } else {
        // Pass all props except this component to the Router (containing div/body) and the children,
        // which are swapped out by the route handler.
        var props = assign({}, this.props);
        props = omit(props, PROP_KEYS);
        return React.createElement('div', props, handler);
      }
    }
});


module.exports = Router;
