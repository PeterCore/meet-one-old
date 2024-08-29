import React from "react";

import { InteractionManager, SectionList, StyleSheet, Text, View } from "react-native";
import commonStyles from "../../../../styles/commonStyles";
import Toast from "react-native-root-toast";
import moment from "moment/moment";
import LoadingMoreItem from "../../../../components/LoadingMoreItem";
import LoadingView from "../../../../components/LoadingView";

const PropTypes = require( 'prop-types' );

class DataListView extends React.Component {
    static propTypes = {
        renderItem: PropTypes.func.isRequired,
        loadData: PropTypes.func.isRequired,
        ItemSeparatorComponent: PropTypes.element,
        hasSectionTitle: PropTypes.bool,
    };


    constructor( props ) {
        super( props );
        this.offsetY = 0
        this.state = {
            isRequesting: false,
            refreshing: false,
            waitingMore: false,
            hasMoreData: false,
            currentPageNum: 0,
            data: [],
        };
    }

    componentDidMount() {
        this.loadData( 0, true );
    }

    componentWillUnmount() {

    }

    componentWillReceiveProps( nextProps ) {

    }

    shouldComponentUpdate( nextProps, nextState ) {
        return true;
    }

    loadData( pageNum, isInit ) {
        const pageSize = 20;

        if ( this.props.renderItem === null || this.props.renderItem === undefined ) {
            return;
        }

        if ( isInit ) {
            this.setState( {
                isRequesting: true,
                refreshing: false,
            } );
        } else {
            if ( pageNum === 0 ) {
                if ( this.state.refreshing ) {
                    return;
                }

                this.setState( {
                    refreshing: true,
                    waitingMore: false
                } );
            } else {
                if ( pageNum > 0 && !this.state.hasMoreData ) {
                    return;
                }

                if ( this.state.waitingMore || this.state.refreshing ) {
                    return;
                }

                this.setState( {
                    waitingMore: true
                } );
            }
        }

        InteractionManager.runAfterInteractions( () => {
            this.props.loadData( pageNum, pageSize, ( error, resBody ) => {
                if ( pageNum > 0 && this.state.refreshing ) {
                    return;
                }

                let data = this.state.data.slice();
                let isRequesting = false;
                let refreshing = false;
                let waitingMore = false;
                let hasMoreData = this.state.hasMoreData;
                let currentPageNum = this.state.currentPageNum;


                if ( error ) {
                    Toast.show( error.message, { position: Toast.positions.CENTER } );
                } else {
                    hasMoreData = resBody.data.length >= pageSize;
                    if ( pageNum === 0 ) {
                        data = resBody.data;
                        currentPageNum = 0;
                    } else {
                        for ( let index = 0; index < resBody.data.length; index++ ) {
                            data.push( resBody.data[ index ] );
                        }

                        currentPageNum = pageNum;
                    }
                }

                this.setState( {
                    data: data,
                    isRequesting: isRequesting,
                    refreshing: refreshing,
                    waitingMore: waitingMore,
                    hasMoreData: hasMoreData,
                    currentPageNum: currentPageNum
                } );
            } );
        } );
    }

    _onRefresh() {
        this.loadData( 0, false );
    }

    onEndReached() {
        this.loadData( this.state.currentPageNum + 1, false );
    }

    scrollTopOrRefresh() {
        // if ( this.offsetY > 1 ) {
        //     this._sectionList.scrollToLocation( {
        //         itemIndex: 0,
        //         sectionIndex: 0,
        //         viewOffset: this.props.hasSectionTitle ? 30 : 0
        //     } );
        // } else {
        this._onRefresh();
        // }
    }

    changeDataToSection( hasSectionTitle ) {
        const sectionData = [];

        if ( hasSectionTitle ) {
            this.state.data.sort( function ( a, b ) {
                return b.time - a.time
            } );
            for ( let index = 0; index < this.state.data.length; index++ ) {
                this.state.data[ index ].uiIndex = index;
            }

            let oldDayMoment = null;
            let childArray = [];
            for ( let index = 0; index < this.state.data.length; index++ ) {
                const currentMoment = moment( this.state.data[ index ].time )

                if ( oldDayMoment === null ) {
                    oldDayMoment = currentMoment;
                    childArray.push( this.state.data[ index ] );
                } else if ( currentMoment.isSame( oldDayMoment, 'day' ) ) {
                    childArray.push( this.state.data[ index ] );
                } else {
                    if ( childArray.length > 0 ) {
                        sectionData.push( {
                            data: childArray,
                            title: oldDayMoment.format( 'YYYY-M-D' ) + ' ' + oldDayMoment.format( 'dddd' )
                        } );
                    }

                    oldDayMoment = currentMoment;
                    childArray = [];
                    childArray.push( this.state.data[ index ] );

                }
            }

            if ( childArray.length > 0 ) {
                sectionData.push( {
                    data: childArray,
                    title: oldDayMoment.format( 'YYYY-M-D' ) + ' ' + oldDayMoment.format( 'dddd' )
                } );
            }
        } else {
            sectionData.push( {
                data: this.state.data,
                title: ""
            } );
        }


        return sectionData;
    }

    render() {
        return (
            <View style={[ this.props.style, commonStyles.wrapper ]}>

                <SectionList
                    ref={( sectionList ) => {
                        this._sectionList = sectionList;
                    }}

                    onRefresh={() => {
                        this._onRefresh()
                    }}
                    refreshing={this.state.refreshing}
                    sections={this.changeDataToSection( this.props.hasSectionTitle )}
                    initialNumToRender={5}
                    keyExtractor={( item, index ) => {
                        return index;
                    }}
                    renderItem={( { item } ) => {
                        return (
                            this.props.renderItem( item )
                        );
                    }}
                    renderSectionHeader={( { section } ) => {
                        return (
                            this.props.hasSectionTitle ?
                                <Text style={[ {
                                    height: 30,
                                    backgroundColor: '#F5F5F5',
                                    fontSize: 12,
                                    paddingTop: 9,
                                    paddingLeft: 15,
                                    paddingRight: 15,
                                }, commonStyles.commonTextColorStyle ]}>{section.title}</Text>
                                :
                                null
                        );
                    }}
                    ListFooterComponent={() => {
                        return (<LoadingMoreItem {...this.props} waiting={this.state.waitingMore}/>)
                    }}
                    onEndReached={this.onEndReached.bind( this )}
                    ItemSeparatorComponent={() => {
                        return this.props.ItemSeparatorComponent
                    }}
                    SectionSeparatorComponent={() => {
                        return null
                    }}
                    onScroll={( e ) => {
                        this.offsetY = e.nativeEvent.contentOffset.y
                        // console.log("list scroll offsetY=" + this.offsetY)
                        if ( this.props.onScroll ) {
                            this.props.onScroll( e );
                        }
                    }}
                    stickySectionHeadersEnabled={this.props.hasSectionTitle}
                />

                {
                    this.state.isRequesting ?
                        <LoadingView/>
                        :
                        null
                }
            </View>
        );
    }
}

const styles = StyleSheet.create( {} );

export default DataListView;
