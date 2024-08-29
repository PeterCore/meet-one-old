import React, { Component } from 'react';
import commonStyles from "../../../styles/commonStyles";

import ImageWithPlaceHolder from "../../../components/ImageWithPlaceHolder";
import CustomSwitch from "../../../components/CustomSwitch";
import Icon from "react-native-vector-icons/Ionicons";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import Util from "../../../util/Util";
import IconSet from "../../../components/IconSet";
import { SectionList, StyleSheet, TextInput, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import AnalyticsUtil from "../../../util/AnalyticsUtil";

class EOSTokenSettingPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        return {
            title: I18n.t( Keys.token_list_title ),
            headerStyle: {
                backgroundColor: '#ffffff',
                borderBottomWidth: 0,
                elevation: 0
            }
        };
    };

    constructor( props ) {
        super( props );
        this.state = {
            searchKeywords: '',
            openedToken: JSON.parse(JSON.stringify(this.props.account.supportToken))
        }
    }

    componentWillMount() {
        this.props.updateSupportTokens();
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('WAtokenlist');
    }

    renderItem( { item, index } ) {
        const openedTokens = this.props.account.supportToken;
        const openedTokensNames = openedTokens && Object.keys(openedTokens) || [];
        const { name, publisher } = item;
        const publisher_token = `${publisher}_${name}`;

        const hasBalance = openedTokensNames.includes(publisher_token);
        const isShow = openedTokensNames.includes(publisher_token) && openedTokens[publisher_token].isShow;

        return (
            <View style={[ {
                height: 72,
                backgroundColor: 'white',
                flexDirection: 'row',
                alignItems: 'center'
            } ]}>
                <View style={{
                    flex: 1
                }}>
                    <TouchableOpacity onPress={()=> {
                        this.props.navigation.navigate( "EOSTokenDetailPage", {
                            token: item
                        })
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <View style={{
                                marginLeft: 15
                            }}>
                                <ImageWithPlaceHolder
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 22,
                                        borderWidth: Util.getDpFromPx( 1 ),
                                        borderColor: '#ddd'
                                    }}
                                    source={{ uri: item.icon }}
                                />
                            </View>

                            <View style={{
                                flex: 1,
                                marginLeft: 15
                            }}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'flex-end'
                                }}>
                                    <Text style={[ {
                                        paddingRight: 5,
                                        fontSize: 18,
                                        color: '#323232',
                                        fontWeight: '600'
                                    } ]}>
                                        {item.name}
                                    </Text>
                                    {
                                        hasBalance ?
                                        <Text style={{
                                            flex: 1,
                                            marginRight: 5,
                                            fontSize: 14,
                                            fontWeight: '300',
                                            color: '#999999'
                                        }}
                                        numberOfLines={1}
                                        >
                                            {item.sub_name}
                                        </Text>
                                        :
                                        null
                                    }
                                </View>

                                {
                                    hasBalance ?
                                    <Text style={[ {
                                        fontFamily: 'DIN',
                                        fontSize: 14,
                                        color: '#999999'
                                    } ]}>
                                        { Util.numberStandard(openedTokens[publisher_token].balance, item.precision) }
                                    </Text>
                                    :
                                    <Text style={[ {
                                        fontSize: 14,
                                        color: '#999999',
                                        fontWeight: '300'
                                    } ]}>
                                        {item.sub_name}
                                    </Text>
                                }
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                {
                    item.can_hide ?
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <View style={{ width: Util.getDpFromPx( 1 ), height: 28, backgroundColor: '#e8e8e8' }}></View>
                            <TouchableOpacity onPress={() => {
                                if (isShow) {
                                    this.props.onEOSWalletSupportTokenRemove(this.props.account, item, (error, resBody) => {});
                                } else {
                                    this.props.onEOSWalletSupportTokenAdd(this.props.account, item, (error, resBody) => {});
                                }
                            }}>
                                <View style={{
                                    paddingLeft: 30,
                                    paddingRight: 32,
                                    paddingVertical: 20
                                }}>
                                    {
                                        isShow ?
                                        <IconSet name="icon-wallet_icon_add_on" style={{ fontSize: 24, color: '#4a4a4a' }}/>
                                        :
                                        <IconSet name="icon-wallet_icon_add_off" style={{ fontSize: 24, color: '#4a4a4a' }}/>
                                    }
                                </View>
                            </TouchableOpacity>
                        </View>
                    :
                        null
                }
            </View>
        );
    }

    renderHeader(sectionData) {
        if (sectionData.section.isShow) {
            return null
        } else {
            return (
                <View style={{
                    height: 36,
                    backgroundColor: '#fafafa',
                    justifyContent: 'center'
                }}>
                    <Text style={{
                        marginLeft: 15,
                        fontSize: 14,
                        color: '#999999'
                    }}>更多 Token</Text>
                </View>
            )
        }
    }

    changeDataToSection () {
        const allTokenList = this.props.supportTokens;
        const openedToken = this.state.openedToken;
        const openedTokensNames = openedToken && Object.keys(openedToken) || [];
        let sectionData;

        if (this.state.searchKeywords.length > 0) {
            const keywords = this.state.searchKeywords;
            const Reg = new RegExp(keywords, 'i');
            sectionData= [
                { isShow: true, data: [] }
            ];
            allTokenList.forEach((item, index) => {
                if (
                    (item.name && Reg.test(item.name)) ||
                    (item.publisher && Reg.test(item.publisher)) ||
                    (item.sub_name && Reg.test(item.sub_name))
                ) {
                    sectionData[0].data.push(item)
                }
            })
        } else {
            sectionData= [
                { isShow: true, data: [] },
                { isShow: false, data: [] }
            ];
            allTokenList.forEach((item, index) => {
                const { name, publisher } = item;
                const publisher_token = `${publisher}_${name}`;

                if (!(openedTokensNames.includes(publisher_token) && openedToken[publisher_token].isShow)) {
                    sectionData[1].data.push(item)
                } else {
                    sectionData[0].data.push(item)
                }
            })
        }

        return sectionData;
    }

    render() {
        const viewHeight = 72;
        const separatorHeight = Util.getDpFromPx( 1 );

        return (
            <SafeAreaView style={[commonStyles.wrapper, { backgroundColor: '#fff' }]}>
                <View style={[ this.props.style, commonStyles.wrapper, { backgroundColor: '#fff' } ]}>
                    {/* 搜索 */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        paddingTop: 15,
                        paddingBottom: 15
                    }}>
                        <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            height: 36,
                            marginLeft: 15,
                            marginRight: 15,
                            borderRadius: 18,
                            borderColor: '#e8e8e8',
                            borderWidth: Util.getDpFromPx( 1 ),
                            backgroundColor: '#f5f5f5'
                        }}>
                            <View style={{
                                justifyContent: 'center'
                            }}>
                                <IconSet name="icon-search" style={{ fontSize: 16, marginHorizontal: 10, marginTop: 2 }}/>
                            </View>

                            <TextInput
                                autoFocus={this.props.autoFocus}
                                style={{
                                    flex: 1,
                                    height: 32,
                                    padding: 0
                                }}
                                underlineColorAndroid={'transparent'}
                                autoCapitalize={'none'}
                                placeholder={I18n.t( Keys.tokens_search_placeholder )}
                                placeholderTextColor={'#b5b5b5'}
                                onChangeText={( text ) => this.setState( { searchKeywords: text.trim() } )}
                                value={this.state.searchKeywords}
                            />

                            {
                                this.state.searchKeywords.length > 0
                                ?
                                <TouchableOpacity onPress={() => {
                                    this.setState({
                                        searchKeywords: '',
                                        openedToken: JSON.parse(JSON.stringify(this.props.account.supportToken))
                                    })
                                }}>
                                    <View style={{
                                        marginRight: 15,
                                        marginLeft: 5,
                                        width: 18,
                                        height: 18,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Icon
                                            name={'md-close'}
                                            size={18}
                                            color={'#999999'}>
                                        </Icon>
                                    </View>
                                </TouchableOpacity>
                                :
                                null
                            }
                        </View>
                    </View>

                    <SectionList
                        sections={this.changeDataToSection()}
                        stickySectionHeadersEnabled={false}
                        keyExtractor={( item, index ) => {
                            return `${item.publisher}_${item.name}`;
                        }}
                        renderItem={( { item, index } ) => {
                            return this.renderItem( { item, index } );
                        }}
                        renderSectionHeader={(sectionData) => {
                            return this.renderHeader(sectionData)
                        }}
                        ItemSeparatorComponent={() => {
                            return <View style={[ commonStyles.commonIntervalStyle, {
                                height: separatorHeight,
                                marginLeft: 74,
                            } ]}/>
                        }}
                        getItemLayout={( data, index ) => (
                            { length: viewHeight, offset: (viewHeight + separatorHeight) * index, index }
                        )}
                    />
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create(
    {}
);

export default EOSTokenSettingPageView;
