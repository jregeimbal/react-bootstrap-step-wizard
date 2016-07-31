import React from 'react';
import {NavigatableMixin, environment as Environment} from 'react-router-component';
import classnames from 'classnames';

const RoutableNavItem = React.createClass({
  mixins: [NavigatableMixin],

  propTypes: {
  	eventKey: React.PropTypes.number
  },

  getInitialState: function() {
    console.log('getInitialState');
    return {
      visited: null
    }
  },

  getDefaultProps: function() {
    return {
      clickProp: 'onClick'
    };
  },

  onClick: function(e) {
    console.log('onClick');
    if (this.props.onClick) {
      this.props.onClick(e);
    }

    // return if the link target is external
    //if (this.props.href.match(/^([a-z-]+:|\/\/)/)) return;

    // return if the user did a middle-click, right-click, or used a modifier
    // key (like ctrl-click, meta-click, shift-click, etc.)
    if (e && (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)) return;

    if (!e || !e.defaultPrevented) {
      console.log(this.props.href);
      if (e) e.preventDefault();
      this._navigate(this.props.href, function(err) {
        if (err) {
          throw err;
        }
      });
    }
  },

  _navigationParams: function() {
    var params = {};
    for (var k in this.props) {
      if (!this.constructor.propTypes[k]) {
        params[k] = this.props[k];
      }
    }
    return params;
  },

  _navigate: function(path, cb) {
    if (this.props.globalHash) {
      return Environment.hashEnvironment.navigate(path, this._navigationParams(), cb);
    }

    if (this.props.global) {
      return Environment.defaultEnvironment.navigate(path, this._navigationParams(), cb);
    }

    return this.navigate(path, this._navigationParams(), cb);
  },

  componentWillReceiveProps: function(nextProps) {
    // Mark visited if current route matches
    if (nextProps.activeHref === nextProps.href){
      this.setState({
        visited: true
      })
    }
  },

  render() {
    // Only supports single child
    if (Array.isArray(this.props.children)) return '';

    // add classes for done (visited) and active
    var classes = [];
    if (this.state.visited) classes.push("done")
    if (this.props.activeHref === this.props.href) classes.push("active")
    if (this.props.hasError) classes.push("error")

    var props = {className: classnames(classes)}

    props[this.props.clickProp] = this.onClick;

    return React.cloneElement(this.props.children, props);
  }

})

export default RoutableNavItem;



