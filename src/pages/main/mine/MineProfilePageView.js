import React, { Component } from 'react';
import { InteractionManager, StatusBar, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import TouchableItemComponent from "../../../components/TouchableItemComponent";
import commonStyles from "../../../styles/commonStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from "react-native-root-toast";
import LoadingView from "../../../components/LoadingView";
import { SafeAreaView } from 'react-navigation';

export default class MineProfilePageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.profile ),
        };
    };


    constructor( props ) {
        super( props );

        this.state = {
            isRequesting: false
        }
    }


    componentWillMount() {
        console.log( 'componentWillMount' );
    }


    componentDidMount() {
        console.log( 'componentDidMount' );
        InteractionManager.runAfterInteractions( () => {
            this.props.updateProfile()
        } )

    }

    componentWillUnmount() {
    }

    _logout() {
        this.setState( {
            isRequesting: true
        } )
        InteractionManager.runAfterInteractions( () => {
            this.props.onTapLogout( ( err, resBody ) => {
                this.setState( {
                    isRequesting: false
                } )

                if ( err ) {
                    if ( err.message ) {
                        Toast.show( err.message, { position: Toast.positions.CENTER } )
                    } else {
                        Toast.show( I18n.t( Keys.operate_failed ), { position: Toast.positions.CENTER } )
                    }
                }
            } )
        } )

    }

    render() {
        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <StatusBar backgroundColor={'#3e9ce9'}/>

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        style={[ styles.itemHeight ]}
                        title={I18n.t( Keys.account )}
                        onPress={() => {
                        }}
                        disabled={true}
                        headerInterval={false}
                        footerIntervalStyle={[ styles.marginL ]}
                        footerInterval={true}
                        hideRightNav={true}
                        content={this.props.account.mobile}
                    />

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        style={[ styles.itemHeight ]}
                        title={I18n.t( Keys.email )}
                        onPress={() => {
                            this.props.onTapEmail();
                        }}
                        headerInterval={false}
                        footerIntervalStyle={[ styles.marginL ]}
                        footerInterval={true}
                        content={
                            this.props.account.emailVerified ? this.props.account.email
                                :
                                (this.props.account.email ? I18n.t( Keys.unverified ) : I18n.t( Keys.no_binding ))
                        }
                    />

                    <TouchableItemComponent
                        containerStyle={[ {} ]}
                        style={[ styles.itemHeight ]}
                        title={I18n.t( Keys.user_name )}
                        onPress={() => {
                            this.props.onTapUserName();
                        }}
                        headerInterval={false}
                        footerIntervalStyle={[ styles.marginL ]}
                        footerInterval={true}
                        content={this.props.account.username ? this.props.account.username : this.props.account.mobile}
                    />

                    <TouchableItemComponent
                        containerStyle={[ { backgroundColor: '#FAFAFA', paddingBottom: 10 } ]}
                        style={[ styles.itemHeight ]}
                        title={I18n.t( Keys.change_pwd )}
                        onPress={() => {
                            this.props.onTapChangePassword();
                        }}
                        headerInterval={false}
                        footerInterval={true}
                    />

                    <View
                        style={[ commonStyles.commonBorderTop,
                            commonStyles.commonBorderBottom ]}
                    >
                        <TouchableHighlight
                            style={[
                                {
                                    backgroundColor: "white",
                                    minHeight: 44,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                },
                                this.props.style
                            ]}
                            underlayColor='#ddd'
                            onPress={() => {
                                this._logout();
                            }}>

                            <Text
                                style={[
                                    {
                                        color: "#F65858",
                                        fontSize: 16,
                                    },
                                ]}>
                                {I18n.t( Keys.logout )}
                            </Text>
                        </TouchableHighlight>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            backgroundColor: '#FAFAFA'
                        }}
                    />

                    <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create( {
    itemHeight: {
        height: 44
    },
    marginL: {
        marginLeft: 15,
    },
    marginR: {
        marginRight: 15,
    }
} )