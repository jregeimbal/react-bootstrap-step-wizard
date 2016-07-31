import React from 'react';
import {Location, NotFound} from 'react-router-component';

import Nav from 'react-bootstrap/lib/Nav';
import Pager from 'react-bootstrap/lib/Pager';
import PageItem from 'react-bootstrap/lib/PageItem';
import NavItem from 'react-bootstrap/lib/NavItem';

import StepWizardRouter from './StepWizardRouter';
import RoutableNavItem from './RoutableNavItem';

class NotFoundPage extends React.Component {
	render() {
		return <h1>Page Not Found</h1>
	}
}

class StepWizard extends React.Component {

	constructor(props){
		super(props);

		if (!this.props.steps.length) return;

		var initialPath = this.props.initialPath// || window.location.hash.substring(1);
		if (!(this.findStepIndex(initialPath) > -1)) initialPath = this.props.steps[0].path;

		this.state = {
			path: initialPath,
			stepsWithErrors: {}
		}
	}

	// Find the index base on prived searchPath
	findStepIndex(searchPath){
		if (!searchPath) return -1;
		for (var i = 0, len = this.props.steps.length; i < len; i++) {
		    if (this.props.steps[i].path === searchPath) return i;
		}

		return -1;
	}

	// Get the index of the currently shown path
	getStepIndex(){
		var currentPath = this.state.path;

		return this.findStepIndex(currentPath);
	}

	onProposeNavigation(path, navigate, match, nextPath) {
		console.log(path, navigate, match, nextPath);
		// Allow movement to previous step
		var desiredIndex = this.findStepIndex(nextPath || navigate.href);
		if (desiredIndex > -1 && desiredIndex < this.getStepIndex()) return true;

		if (this.refs.locations && this.refs.locations.refs.visibleStep && this.refs.locations.refs.visibleStep.isValid){
			if (this.refs.locations.refs.visibleStep.isValid()){
				if (desiredIndex == this.getStepIndex() + 1 )
					return this.refs.locations.refs.visibleStep.isValid();
			} else {
				this.refs.locations.refs.visibleStep.submit()
			}
		}

		return false;
	}

	onBeforeNavigation(path, navigate, match) {
		if (this.refs.locations.refs.visibleStep.getData)
			this.props.onNavigate(path, navigate, match, this.refs.locations.refs.visibleStep.getData())
	}

	onNavigation(path, navigate, match, four){
		//debugger;
		console.log('onNavigation', path, navigate, match, four);
		if (navigate && navigate.href)
		this.setState({
			path: navigate.href
		});
	}

	_handleNext(){
		var nextPath = this.props.steps[this.getStepIndex()+1]
		if (nextPath && nextPath.path){
			this.refs.locations.navigate(nextPath.path, {href: nextPath.path});
		} else {
			throw Error('Path not defined for next');
		}
	}

	_handleError(path){
		var stepsWithErrors = Object.assign({}, this.state.stepsWithErrors);
		stepsWithErrors[path] = true;
		this.setState({
			stepsWithErrors: stepsWithErrors
		})
	}

	_handleClearError(path){
		var stepsWithErrors = Object.assign({}, this.state.stepsWithErrors);
		delete stepsWithErrors[path]
		this.setState({
			stepsWithErrors: stepsWithErrors
		})
	}

	componentWillReceiveProps(nextProps) {
		console.log(nextProps);
	  this.setState({
	    data: nextProps.data
	  });
	}

	render(){
		const stepIndex = this.getStepIndex();
		const stepCount = this.props.steps.length;
		const lastPage = (stepIndex + 1 >= stepCount);
		const nextPath = this.props.steps[this.getStepIndex()+1]
		const prevPath = this.props.steps[this.getStepIndex()-1]

		const NavItems = this.props.steps.map((step) => {
			const hasError = (this.state.stepsWithErrors[step.path])
			return (
				<RoutableNavItem globalHash href={step.path} title={step.title} key={step.path} hasError={hasError}>
					<NavItem href={'#' + step.path} activeHref={this.state.path} className="error">{step.title}</NavItem>
				</RoutableNavItem>
			)
		})

		const LocationItems = this.props.steps.map((step) => {
			return (
				<Location 
					path={step.path} 
					handler={step.handler} 
					key={step.path} 
					ref={"visibleStep"} 
					data={this.props.data} 
					next={this._handleNext.bind(this)}
					error={this._handleError.bind(this, step.path)}
					clearError={this._handleClearError.bind(this, step.path)}
				 />
			)
		}).concat(<NotFound handler={NotFoundPage} />)

		var nextButton;

		if (lastPage) {
			nextButton = (
				<RoutableNavItem globalHash href={"/finish"} clickProp="onSelect">
					<PageItem next>Finish &rarr;</PageItem>
				</RoutableNavItem>
			)
		} else {
			nextButton = (
				<RoutableNavItem globalHash href={nextPath.path} clickProp="onSelect">
					<PageItem next>Next &rarr;</PageItem>
				</RoutableNavItem>
			)
		}
        var previousButtonDisabled = (stepIndex <= 0) ? "disabled" : null
        var previousButton = (
        	<RoutableNavItem globalHash href={previousButtonDisabled ? null : prevPath.path} clickProp="onSelect">
        		<PageItem previous disabled={previousButtonDisabled}>&larr; Previous</PageItem>
        	</RoutableNavItem>
        )
		return (
			<div className="wizard">
				<div className="steps">
					<Nav bsStyle="tabs" activeKey={1} className="tablist" activeHref={this.state.path}>
						{NavItems}
					</Nav>
				</div>
				<StepWizardRouter
					hash
					path={this.state.path}
					ref="locations"
					onProposeNavigation={this.onProposeNavigation.bind(this)}
					onBeforeNavigation={this.onBeforeNavigation.bind(this)}
					onNavigation={this.onNavigation.bind(this)}
					className="content">
					{LocationItems}
				</StepWizardRouter>
				<div className="actions">
					<Pager>
					    {previousButton}
					    {nextButton}
					</Pager>
				</div>
			</div>
		)
	}
}

StepWizard.defaultProps = {
	data: {}
};

export default StepWizard;