import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TabController, CheckTitle } from '../../components';
import { ICONS } from '../../config/constants';
import { UserProfile, UserSecurity, UserSettings } from '../';
import STRINGS from '../../config/localizedStrings';
import { openContactForm } from '../../actions/appActions';
import { requestLimits } from '../../actions/userAction';

const getInitialTab = ({ name, path }) => {
	let activeTab = -1;
	let activeDevelopers = false;
	if (path === 'account') {
		activeTab = 0;
	} else if (path === 'security') {
		activeTab = 1;
	} else if (path === 'developers') {
		activeTab = 1;
		activeDevelopers = true;
	} else if (path === 'settings') {
		activeTab = 2;
		activeDevelopers = true;
	}
	return {
		activeTab,
		activeDevelopers
	};
};

class Account extends Component {
	state = {
		activeTab: -1,
		tabs: []
	};

	componentDidMount() {
		if (this.props.id) {
			this.updateTabs(this.props);
		}
		if (!this.props.limits.fetched && !this.props.limits.fetching) {
			this.props.requestLimits();
		}
	}

	componentWillReceiveProps(nextProps) {
		if (
			nextProps.id !== this.props.id ||
			nextProps.verification_level !== this.props.verification_level ||
			nextProps.otp_enabled !== this.props.otp_enabled ||
			nextProps.activeLanguage !== this.props.activeLanguage
		) {
			this.updateTabs(nextProps, false);
		} else if (nextProps.route.path !== this.props.route.path) {
			this.updateTabs(nextProps, true);
		}
	}

	hasUserVerificationNotifications = (
		verification_level,
		bank_account = {},
		id_data = {}
	) => {
		if (verification_level >= 2 && bank_account.verified && id_data.verified) {
			return false;
		}
		return true;
	};

	updateTabs = (
		{ verification_level, otp_enabled, bank_account, id_data, route },
		updateActiveTab = false
	) => {
		let activeTab = this.state.activeTab > -1 ? this.state.activeTab : 0;
		let activeDevelopers = false;

		if (updateActiveTab || this.state.activeTab === -1) {
			const initialValues = getInitialTab(route);
			activeTab = initialValues.activeTab;
			activeDevelopers = initialValues.activeDevelopers;
		}

		const tabs = [
			{
				title: (
					<CheckTitle
						title={STRINGS.ACCOUNTS.TAB_PROFILE}
						icon={ICONS.VERIFICATION_ID_INACTIVE}
						notifications={
							this.hasUserVerificationNotifications(
								verification_level,
								bank_account,
								id_data
							)
								? '!'
								: ''
						}
					/>
				),
				content: (
					<UserProfile
						goToVerification={this.goToVerification}
						openContactForm={this.openContactForm}
					/>
				)
			},
			{
				title: (
					<CheckTitle
						title={STRINGS.ACCOUNTS.TAB_SECURITY}
						icon={ICONS.SECURITY_GREY}
						notifications={!otp_enabled ? '!' : ''}
					/>
				),
				content: <UserSecurity openApiKey={activeDevelopers} />
			},
			{
				title: (
					<CheckTitle
						title={STRINGS.ACCOUNTS.TAB_SETTINGS}
						icon={ICONS.GEAR_GREY}
					/>
				),
				content: <UserSettings />
			}
		];

		this.setState({ tabs, activeTab });
	};

	setActiveTab = (activeTab) => {
		this.setState({ activeTab });
	};

	renderContent = (tabs, activeTab) => tabs[activeTab].content;

	openContactForm = (data) => {
		// console.log('here');
		this.props.openContactForm(data);
	};
	goToVerification = () => this.props.router.push('/verification');

	render() {
		const { id } = this.props;
		const { activeTab, tabs } = this.state;

		if (!id || activeTab === -1) {
			return <div>Loading</div>;
		}

		return (
			<div className="presentation_container apply_rtl">
				<TabController
					activeTab={activeTab}
					setActiveTab={this.setActiveTab}
					tabs={tabs}
					title={STRINGS.ACCOUNTS.TITLE}
					titleIcon={ICONS.ACCOUNT_LINE}
					className="account-tab"
				/>
				<div className="inner_container">
					{activeTab > -1 && this.renderContent(tabs, activeTab)}
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	verification_level: state.user.verification_level,
	limits: state.user.limits,
	otp_enabled: state.user.otp_enabled || false,
	id: state.user.id,
	bank_account: state.user.userData.bank_account,
	id_data: state.user.userData.id_data,
	activeLanguage: state.app.language
});

const mapDispatchToProps = (dispatch) => ({
	requestLimits: bindActionCreators(requestLimits, dispatch),
	openContactForm: bindActionCreators(openContactForm, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Account);