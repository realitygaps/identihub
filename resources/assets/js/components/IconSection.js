import React, {Component} from 'react';
import PropTypes from 'prop-types';
import SectionWrapper from './SectionWrapper';
import {bindActionCreators} from 'redux';
import {getSectionType} from '../reducers/SectionType/SectionTypeReducer';
import {connect} from 'react-redux';
import IconSectionRow from './IconSectionRow';
import {filterSectionsWithSectionType, sortByOrder} from '../helpers';
import {createIcon} from '../reducers/Bridge/BridgeApiCalls';
import NotificationSystem from 'react-notification-system';
import _ from 'lodash';
import renderSection from '../HOC/renderSectionHOC'


class IconSection extends Component {

    constructor(params) {
        super(params);
        this.emptyStateText = "No Icons found here, start by adding a new icon.";
        this.inputElement = null;
        this.addIcon = this.addIcon.bind(this);
        this.emulateInputOnChange = this.emulateInputOnChange.bind(this);
    }

    addIcon(event) {
        console.log(event);
        let files = [];
        Object.entries(event.target.files).map(
            ([key, value]) => (
                value.type === 'image/svg+xml'
                    ? files = [...files, value]
                    : this.iconNotification.addNotification({
                        message: `File ${_.truncate(value.name, 10)} was not accepted`,
                        level: 'error'
                    })
            )
        );

        const bridge = this.props.bridge;
        const createIcon = this.props.createIcon;
        // const files = event.target.files;

        createIcon(bridge.id, files, function (progressEvent) {
            // console.log(Math.round( (progressEvent.loaded * 100) / progressEvent.total ));
        })
        //this.addIcon(this.props.bridge.id, event.target.files[0]);
    }

    emulateInputOnChange() {
        this.inputElement.click();
    }

    render() {

        const {
            bridge,
            iconsSection
        } = this.props;

        let {
            icons,
            sections
        } = bridge;

        const {
            emulateInputOnChange,
            emptyStateText
        } = this;

        return (
            <SectionWrapper
                title="Logos"
                addResource="Upload SVG"
                onResourceClick={emulateInputOnChange}
                bridge={bridge}
                canCreateSection={true}
                sectionType={iconsSection}>
                <input id="icon"
                       multiple
                       ref={input => this.inputElement = input}
                       onChange={this.addIcon}
                       type="file"
                       name="icon"/>
                {
                    sortByOrder(filterSectionsWithSectionType(sections, iconsSection)).map(section => {
                        return (
                            <IconSectionRow
                                key={section.id}
                                bridge={bridge}
                                section={section}
                                icons={icons}
                                emptyStateText={emptyStateText}/>
                        )
                    })
                }
                <NotificationSystem ref={(div) => this.iconNotification = div}/>
            </SectionWrapper>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        iconsSection: getSectionType(state, "ICONS")
    }
};

IconSection.propTypes = {
    iconsSection: PropTypes.shape({
        id: PropTypes.number
    }).isRequired,
    bridge: PropTypes.shape({
        id: PropTypes.integer
    }).isRequired
};

const dispatchToProps = (dispatch) => {
    return bindActionCreators({
        createIcon
    }, dispatch)
};

export default renderSection('icons')(connect(mapStateToProps, dispatchToProps)(IconSection));
