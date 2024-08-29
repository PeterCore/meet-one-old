import React from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import commonStyles from "../../../styles/commonStyles";
import { connect } from "react-redux";
// import countryDataMap from "../../../../data/countryDataMap";
import CountrySelectListComponent from "./CountrySelectListComponent";
import SearchBar from "../../../components/SearchBar";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import constStyles from "../../../styles/constStyles";
import countryDataJson from "../../../../data/country_data";
import CountrySearchListComponent from "./CountrySearchListComponent";
import { SafeAreaView } from 'react-navigation';


const styles = StyleSheet.create( {} );

class CountrySelectPage extends React.Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.choose_country )
            // header: null
        };
    };

    constructor( props ) {
        super( props );

        let navState = this.props.navigation.state;

        const countryDataMapTmp = {};

        for ( let index = 0; index < countryDataJson.length; index++ ) {
            countryDataJson[ index ].name = I18n.t( 'country.' + countryDataJson[ index ].CountryISOCode + '.value' );
            countryDataJson[ index ].currency_name = I18n.t( 'country.' + countryDataJson[ index ].CountryISOCode + '.currency_name' );

            const sort = I18n.t( 'country.' + countryDataJson[ index ].CountryISOCode + '.sort' );
            countryDataJson[ index ].sort = sort ? sort.toUpperCase() : countryDataJson[ index ].name.toUpperCase();

            countryDataMapTmp[ countryDataJson[ index ].CountryISOCode ] = countryDataJson[ index ];
        }
        // const countryDataMapTmp = countryDataMap;

        const keys = Object.keys( countryDataMapTmp );

        let values = keys.map( function ( v ) {
            return countryDataMapTmp[ v ];
        } );

        values = values.sort( function ( a, b ) {
            if ( a.sort === b.sort ) {
                return 0;
            } else if ( a.sort > b.sort ) {
                return 1;
            } else {
                return -1;
            }
        } );

        this.state = {
            countryDataMap: countryDataMapTmp,
            dataKeys: keys,
            showData: values,
            isOpenSearchPage: false,
            keyword: '',
            callback: navState.params ? navState.params.callback : null,
        };

        this._renderSearchHeader = this.renderSearchHeader();
    }

    componentWillUnmount() {
    }

    componentDidMount() {

    }

    shouldComponentUpdate( nextProps, nextState ) {
        if (
            nextState.countryDataMap !== this.state.countryDataMap ||
            nextState.dataKeys !== this.state.dataKeys ||
            nextState.showData !== this.state.showData ||
            nextState.isOpenSearchPage !== this.state.isOpenSearchPage ||
            nextState.keyword !== this.state.keyword ||
            nextState.callback !== this.state.callback
        ) {
            return true;
        }

        return false;
    }

    renderSearchHeader() {
        return (
            <View style={[
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingBottom: 7,
                    paddingTop: 7,
                    paddingLeft: 15,
                    paddingRight: 15,
                    backgroundColor: 'white',
                },
            ]}>
                <SearchBar
                    style={[ {
                        flex: 1,
                    } ]}
                    ref={( searchBar ) => {
                        this._searchBar = searchBar;
                    }}
                    onlyShow={false}
                    autoFocus={false}
                    placeholder={I18n.t( Keys.search )}
                    onSearchChange={( text ) => {
                        this.setState( {
                            keyword: text
                        } );
                    }}
                    onEndEditing={( text ) => {
                        console.log( "onEndEditing text = " + text );
                    }}
                    onSubmitEditing={( text ) => {

                    }}
                    onClose={() => {
                        if ( this.state.isOpenSearchPage ) {
                            this.setState( {
                                isOpenSearchPage: false
                            } );

                            this._searchBar.blur();

                            this._searchBar.setTextWithSubmit( '' );
                        } else {
                            this.props.navigation.goBack();
                        }
                    }}
                    onStartSearch={() => {
                        console.log( "onStartSearch" );
                    }}
                    onFocus={() => {
                        this.setState( {
                            isOpenSearchPage: true
                        } );
                    }}
                    onBlur={() => {
                        // this.setState( {
                        //     isOpenSearchPage: false
                        // } );

                        // this._searchBar.setTextWithSubmit( '' );
                    }}
                />
            </View>
        )
            ;
    }

    onCallback( item ) {
        if ( this.state.callback && this.state.callback instanceof Function ) {
            this.state.callback( item );
        }

        this.props.navigation.goBack();
    };

    render() {
        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, {
                    backgroundColor: 'white',
                }, ]}>
                    {Platform.OS === 'ios' ?
                        <StatusBar
                            animated={false}
                            barStyle={constStyles.STATUS_BAR_CONTENT_STYLE_DARK}
                            translucent={false}
                            backgroundColor={constStyles.STATUS_BAR_COLOR}
                        />
                        :
                        null
                    }

                    {
                        this._renderSearchHeader
                    }

                    <View style={[ commonStyles.wrapper ]}>
                        <CountrySelectListComponent
                            data={this.state.showData}
                            isShowYIndex={!this.state.isOpenSearchPage}
                            onSelect={( item ) => {
                                this.onCallback( item )
                            }}
                            onScroll={() => {

                            }}
                        />


                        <CountrySearchListComponent
                            style={[ {
                                flex: 1,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0
                            } ]}
                            data={this.state.showData}
                            keyword={this.state.keyword}
                            onSelect={( item ) => {
                                this.onCallback( item )
                            }}
                            onScroll={() => {

                            }}
                            isOpen={this.state.isOpenSearchPage}
                            onClose={
                                () => {
                                    this._searchBar.blur();
                                }
                            }
                        />
                    </View>
                </View>
            </SafeAreaView>
        )
    }
}


function select( store ) {
    return {}
}

export default connect( select )( CountrySelectPage );
