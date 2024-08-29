import React from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import commonStyles from "../../../styles/commonStyles";
import TouchableItemComponent from "../../../components/TouchableItemComponent";
import { connect } from "react-redux";
import constStyles from "../../../styles/constStyles";
import YIndexComponent from "./YIndexComponent";
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'
import PropTypes from 'prop-types';

const styles = StyleSheet.create( {} );

class CountrySelectListComponent extends React.Component {
    static propTypes = {
        data: PropTypes.array.isRequired,
        isShowYIndex: PropTypes.bool.isRequired,
        onSelect: PropTypes.func.isRequired,
        onScroll: PropTypes.func,
    };

    constructor( props ) {
        super( props );

        const sectionMap = {};
        const dataArray = [];

        for ( let index = 0; index < this.props.data.length; index++ ) {
            const item = this.props.data[ index ];
            const key = '' + item.sort[ 0 ];
            let section = sectionMap[ key ];
            if ( !section ) {
                section = {
                    isSectionHeader: true,
                    title: key,
                    data: [],
                };
                sectionMap[ key ] = section;

                dataArray.push( section );
            }

            section.data.push( { isSectionHeader: false, data: item } );
        }

        this.state = {
            sectionMap: sectionMap,
            dataArray: dataArray,
            isShowYIndex: this.props.isShowYIndex,
        };
    }

    static renderSectionHeader( { section } ) {
        return (
            <View style={[ commonStyles.commonBG, { height: 30, justifyContent: 'center' } ]}>
                <Text style={[ {
                    marginLeft: 15,
                    color: constStyles.THEME_COLOR,
                    fontSize: 14,
                } ]}>{section.title}</Text>
            </View>
        );
    }

    componentWillReceiveProps( nextProps ) {
        if ( this.state.isShowYIndex !== nextProps.isShowYIndex ) {
            this.setState( {
                isShowYIndex: nextProps.isShowYIndex
            } );
        }
    }

    shouldComponentUpdate( nextProps, nextState ) {
        if (
            nextState.sectionMap !== this.state.sectionMap ||
            nextState.dataArray !== this.state.dataArray ||
            nextState.isShowYIndex !== this.state.isShowYIndex

        ) {
            return true;
        }

        return false;
    }

    renderCommonItem( { item } ) {
        return (
            <TouchableItemComponent
                containerStyle={[ { height: 46 } ]}
                style={[ { height: 46, paddingRight: 41 } ]}
                title={item.data.name}
                content={'+' + item.data.MobileCode}
                onPress={() => {
                    if ( this.props.onSelect ) {
                        this.props.onSelect( item.data );
                    }
                }}
                headerInterval={false}
                footerInterval={false}/>
        );
    }

    onChangeKey( key ) {
        let currentSectionIndex = 0;
        for ( let index = 0; index < this.state.dataArray.length; index++ ) {
            if ( this.state.dataArray[ index ].title >= key ) {
                currentSectionIndex = index;
                break;
            }
        }

        if ( currentSectionIndex >= 0 && currentSectionIndex < this.state.dataArray.length ) {
            this._sectionList.scrollToLocation( {
                animated: true,
                itemIndex: 0,
                sectionIndex: currentSectionIndex,
                viewOffset: 0,
                viewPosition: 0.5
            } );
        }
    }


    render() {
        const sectionHeight = 30;
        const viewHeight = 46;
        const separatorHeight = 1;

        this.getItemLayout = sectionListGetItemLayout( {
            getItemHeight: ( rowData, sectionIndex, rowIndex ) => viewHeight,
            getSeparatorHeight: () => separatorHeight,
            getSectionHeaderHeight: () => sectionHeight,
            getSectionFooterHeight: () => 0
        } );

        return (
            <View style={[ commonStyles.wrapper ]}>
                <SectionList
                    ref={( sectionList ) => {
                        this._sectionList = sectionList;
                    }}
                    sections={this.state.dataArray}
                    keyExtractor={( item, index ) => {
                        return index;
                    }}
                    renderItem={this.renderCommonItem.bind( this )}
                    renderSectionHeader={CountrySelectListComponent.renderSectionHeader.bind( this )}
                    ItemSeparatorComponent={() => {
                        return <View style={[ commonStyles.commonIntervalStyle ]}/>
                    }}
                    getItemLayout={this.getItemLayout}
                    onScroll={() => {
                        if ( this.props.onScroll ) {
                            this.props.onScroll();
                        }
                    }}
                />

                <YIndexComponent
                    style={[ { position: 'absolute', right: 0, top: 0, bottom: 0 } ]}
                    isOpen={this.state.isShowYIndex}
                    onSelect={( key ) => {
                        this.onChangeKey( key );
                    }}
                />
            </View>
        )
    }
}


function select( store ) {
    return {}
}

export default connect( select )( CountrySelectListComponent );
