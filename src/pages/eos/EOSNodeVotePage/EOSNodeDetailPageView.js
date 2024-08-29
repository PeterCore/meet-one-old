import React, { Component } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform, StatusBar, ScrollView } from "react-native";
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import Icon from "react-native-vector-icons/Ionicons";

import commonStyles from "../../../styles/commonStyles";
import Util from "../../../util/Util";
import LoadingView from "../../../components/LoadingView";
import IconSet from "../../../components/IconSet";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

import { getNodeDetail } from "../../../net/DiscoveryNet";

import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";

import Toast from "react-native-root-toast";
import PopupDialog, { SlideAnimation } from 'react-native-popup-dialog';

const slideFromBottom = new SlideAnimation({
    slideFrom: 'bottom',
});

const STATE_BAR_HEIGHT = Platform.OS === 'ios' ? (Util.isiPhoneFullDisplay() ? 44 : 20) : StatusBar.currentHeight;
const BOTTOM_BAR_HEIGHT = Platform.OS === 'ios' ? (Util.isiPhoneFullDisplay() ? 34 : 0) : 0;
const NAVI_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const ANDROID_BOTTOM_MENU_HEIGHT = Platform.OS === 'ios' ? 0 : 50;

const modalMargin = STATE_BAR_HEIGHT + BOTTOM_BAR_HEIGHT + NAVI_BAR_HEIGHT + 50 - ANDROID_BOTTOM_MENU_HEIGHT;

class EOSNodeDetailPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;

        return {
            title: navigation.state.params.currentNode.name,
            headerLeft:
                <Button
                    style={{
                        width: 44,
                        height: 44
                    }}
                    onPress={() => {
                        navigation.state.params.backWithParams()
                    }}
                >
                    <Image
                        source={ Platform.OS === 'ios' ? require( '../../../imgs/back-icon-ios.png' ) : require( '../../../imgs/back-icon-ios.png' ) }
                        style={[ { width: 44, height: 44 } ]}
                    />
                </Button>
        };
    };

    constructor( props ) {
        super( props );

        this.state = {
            selectedNodes: this.props.selectedNodes,
            selectedBPs: this.props.selectedBPs,
            currentNode: this.props.currentNode,

            nodeData: {},

            isRequesting: false,
        };
    }

    _backWithParams() {
        this.props.navigation.navigate('EOSNodeListPage', {
            selectedBPs: this.state.selectedBPs
        })
    }

    componentWillMount() {
        this._backWithParams = this._backWithParams.bind( this );
        this.props.navigation.setParams( { backWithParams: this._backWithParams } );
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('CTvotebpdetail');

        if (this.state.currentNode.hasInfo) {
            // 请求节点数据
            getNodeDetail(this.state.currentNode.id, (err, res) => {
                try {
                    const resData = JSON.parse(res);
                    if (resData.code === 0) {
                        this.setState({
                            nodeData: resData.data[0]
                        })
                    }
                } catch (error) {
                    Toast.show(I18n.t(Keys.request_failed), { position: Toast.positions.CENTER } );
                }
            });
        } else {

        }
    }

    renderSelected( {item, index} ) {
        return (
            <View style={{
                height: 65,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 15,
            }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <View style={{
                        width: 36,
                        height: 36,
                        borderWidth: Util.getDpFromPx( 1 ),
                        borderColor: '#ddd',
                        borderRadius: 25,
                        overflow: 'hidden',
                    }}>
                        <Image
                            source={{
                                uri: item.icon ? item.icon : "https://static.ethte.com/bpicon_default.png"
                            }}
                            style={[ { width: 36, height: 36 } ]}
                        />
                    </View>

                    <Text style={{
                        marginLeft: 15,
                        fontSize: 16,
                        color: '#323232'
                    }}>
                        { item.name ? item.name : item.owner }
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => {
                        const votedArray = JSON.parse(JSON.stringify(this.state.selectedBPs));
                        const index = votedArray.indexOf(item.owner);

                        votedArray.splice(index, 1);
                        this.setState({
                            selectedBPs: votedArray
                        });
                    }}
                >
                    <Icon
                        style={[ {
                            marginLeft: 10,
                        } ]}
                        name={'ios-remove-circle-outline'}
                        size={26}
                        color={'#4a4a4a'}>
                    </Icon>
                </TouchableOpacity>
            </View>
        )
    }

    selectedFilter() {
        const nodeArray = this.state.selectedNodes;
        const selectedBPs = this.state.selectedBPs;
        const mapedSelected = [];

        for (let i = 0; i < nodeArray.length; i++) {
            if (selectedBPs.includes(nodeArray[i].owner)) {
                mapedSelected.push(nodeArray[i])
            }
        }

        return mapedSelected;
    }

    render() {
        const separatorHeight = Util.getDpFromPx(1);
        const selectedData = this.selectedFilter();
        const nodeData = this.state.nodeData;
        const currentNode = this.state.currentNode;
        // 联系方式数组
        const contactArray = [];
        const tempArray = [
            { name: 'GitHub', value: nodeData.github_link && nodeData.github_link },
            { name: 'Twitter', value: nodeData.twitter_link && nodeData.twitter_link },
            { name: 'Facebook', value: nodeData.facebook_link && nodeData.facebook_link },
            { name: 'Telegram', value: nodeData.telegram_link && nodeData.telegram_link },
            { name: 'WeChat Public Account', value: nodeData.wechat_link && nodeData.wechat_link },
            { name: 'Medium', value: nodeData.medium_link && nodeData.medium_link },
            { name: 'Steemit', value: nodeData.steemit_link && nodeData.steemit_link },
            { name: 'Reddit', value: nodeData.reddit_link && nodeData.reddit_link }
        ];
        tempArray.forEach(function(item){
            if (item.value && item.value !== '' && item.value !== null) {
                contactArray.push(item);
            }
        });

        const node_banner = nodeData.banner_link ? nodeData.banner_link : 'https://static.ethte.com/bpbanner_default.png' + '?imageView2/0/w/750/h/240'
        const node_name = currentNode.name ? currentNode.name : currentNode.owner;
        const node_slogan = currentNode.desc ? currentNode.desc : 'No Information.';
        const node_icon = currentNode.icon ? currentNode.icon : 'https://static.ethte.com/bpicon_default.png' + '?imageView2/0/w/128/h/128';
        const node_location = nodeData.location_team ? nodeData.location_team : 'No Information.';
        const node_website = nodeData.website ? nodeData.website : 'No Information.';
        const node_server_location = nodeData.location_server ? nodeData.location_server : 'No Information.';
        const node_server_desc = nodeData.introduction_deploy ? nodeData.introduction_deploy.replace(/\\n/g,'\n') : 'No Information.';
        const node_team_desc = nodeData.introduction_team ? nodeData.introduction_team.replace(/\\n/g,'\n') : 'No Information.';

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <ScrollView style={commonStyles.wrapper} bounces={false}>
                        {/* Banner */}
                        <Image
                            style={{height: 140}}
                            source={{ uri: node_banner }} />
                        {/* 顶部 */}
                        <View style={[styles.card, { paddingTop: 0 }]}>
                            {
                                Platform.OS === 'ios' ?
                                <View>
                                    {/* Title */}
                                    <View style={[{ paddingTop: 40 }]}>
                                        <Text selectable={true} style={[ styles.name ]}>{ node_name }</Text>
                                        <Text selectable={true} style={[ styles.slogan ]}>{ node_slogan }</Text>
                                    </View>

                                    {/* Logo */}
                                    <Image
                                        style={[styles.logo, { position: 'absolute', top: -34 }]}
                                        source={{uri: node_icon }}
                                    ></Image>
                                </View>
                                :
                                <View>
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingTop: 20
                                    }}>
                                        {/* Logo */}
                                        <Image
                                            style={[styles.logo]}
                                            source={{uri: node_icon }}
                                        ></Image>
                                        {/* Title */}
                                        <View style={[{ flexShrink: 1, marginLeft: 20 }]}>
                                            <Text selectable={true} style={[ styles.name ]}>{ node_name }</Text>
                                            <Text selectable={true} style={[ styles.slogan ]}>{ node_slogan }</Text>
                                        </View>
                                    </View>
                                </View>
                            }

                            <View style={{
                                position: 'absolute',
                                right: 15,
                                top: 10,
                                zIndex: 2,
                            }}>
                                <TouchableOpacity onPress={() => {
                                    const votedArray = JSON.parse(JSON.stringify(this.state.selectedBPs));
                                    const index = votedArray.indexOf(this.state.currentNode.owner);
                                    if (index === -1) {
                                        if (votedArray.length >= 30) {
                                            Toast.show(I18n.t( Keys.thirty_node_tip ), { position: Toast.positions.CENTER } );
                                            return
                                        }
                                        votedArray.push(this.state.currentNode.owner);
                                        this.setState({
                                            selectedBPs: votedArray
                                        });
                                    } else {
                                        votedArray.splice(index, 1);
                                        this.setState({
                                            selectedBPs: votedArray
                                        });
                                    }
                                }}>
                                    <View style={{
                                        width: 96,
                                        height: 32,
                                        borderColor: '#1bce9a',
                                        borderRadius: 2,
                                        borderWidth: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Icon
                                            style={{ marginRight: 10 }}
                                            name={ this.state.selectedBPs.includes(this.state.currentNode.owner)  ? 'ios-remove-circle-outline' : 'md-add-circle'}
                                            size={20}
                                            color={'#1bce9a'}>
                                        </Icon>
                                        <Text style={{
                                            fontSize: 16,
                                            color: '#1bce9a'
                                        }}>
                                            { this.state.selectedBPs.includes(this.state.currentNode.owner)  ? I18n.t( Keys.VotePage_cancel ) : I18n.t( Keys.vote_confirm_title )}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={[ commonStyles.commonIntervalStyle, { marginTop: 15, marginBottom: 5 } ]}/>

                            <View style={[ styles.icon_container ]}>
                                <IconSet name="icon-location" style={[ styles.icon]}/>
                                <Text selectable={true} style={[ styles.icon_text]}>{ node_location }</Text>
                            </View>

                            <View style={[ styles.icon_container ]}>
                                <IconSet name="icon-link" style={[ styles.icon]}/>
                                <Text selectable={true} style={[ styles.icon_text]}>{ node_website }</Text>
                            </View>
                        </View>
                        {/* 服务配置 */}
                        <View style={[styles.card]}>
                            <View style={[styles.card_title_container]}>
                                <View style={[styles.card_title_before]}></View>
                                <Text style={[styles.card_title]}>{ I18n.t( Keys.node_server_title ) }</Text>
                            </View>
                            <Text style={[styles.card_subtitle]}>
                                { I18n.t( Keys.node_server_location ) }
                            </Text>
                            <Text selectable={true} style={[styles.card_text]}>
                                { node_server_location }
                            </Text>
                            <View style={[ commonStyles.commonIntervalStyle, { marginVertical: 10 } ]}/>
                            <Text style={[styles.card_subtitle]}>
                                { I18n.t( Keys.node_server_desc ) }
                            </Text>
                            <Text selectable={true} style={[styles.card_text]}>
                                { node_server_desc }
                            </Text>
                        </View>
                        {/* 团队介绍 */}
                        <View style={[styles.card]}>
                            <View style={[styles.card_title_container]}>
                                <View style={[styles.card_title_before]}></View>
                                <Text style={[styles.card_title]}>{ I18n.t( Keys.node_team_desc ) }</Text>
                            </View>
                            <Text selectable={true} style={[styles.card_text]}>
                                { node_team_desc }
                            </Text>
                        </View>
                        {/* 联系方式 */}

                        {
                            contactArray.length > 0 ?
                            <View style={[styles.card]}>
                                <View style={[styles.card_title_container]}>
                                    <View style={[styles.card_title_before]}></View>
                                    <Text style={[styles.card_title]}>{ I18n.t( Keys.node_contact_method ) }</Text>
                                </View>
                                {
                                    contactArray.map((item, index)=>{
                                        return (
                                            <View>
                                                <Text selectable={true} style={[styles.card_subtitle, { marginBottom: 5 } ]}>{item.name}</Text>
                                                <Text selectable={true} style={styles.card_text}>{item.value}</Text>
                                                {
                                                    index < contactArray.length - 1 ?
                                                    <View style={[ commonStyles.commonIntervalStyle, { marginVertical: 10 } ]}/>
                                                    :
                                                    null
                                                }
                                            </View>
                                        )
                                    })
                                }
                            </View>
                            :
                            null
                        }
                    </ScrollView>

                    {/* 底部已选节点 */}
                    <View style={{
                        height: 50,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTopWidth: Util.getDpFromPx( 1 ),
                        borderTopColor: '#e8e8e8',
                        backgroundColor: '#fafafa',
                        zIndex: 3
                    }}>
                        <TouchableOpacity onPress={() => {
                            this.nodeDialog.show();
                        }}>
                            <View style={{
                                flexDirection: 'row',
                                marginLeft: 15,
                                alignItems: 'center'
                            }}>
                                <Text style={{
                                    fontSize: 16,
                                    color: '#323232'
                                }}>
                                    { I18n.t( Keys.has_selected_node ) }
                                </Text>
                                <Text style={{
                                    fontSize: 16,
                                    color: '#999999',
                                    marginLeft: 10
                                }}>
                                    {this.state.selectedBPs.length} / 30
                                </Text>
                                <Icon
                                    style={[ {
                                        marginLeft: 10,
                                    } ]}
                                    name={'ios-arrow-up'}
                                    size={14}
                                    color={'#999999'}>
                                </Icon>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate('EOSNodeVoteComfirmPage', {
                                selectedNodes: selectedData
                            })
                        }}>
                            <View style={{
                                width: 117,
                                height: 50,
                                backgroundColor: '#4a4a4a',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Text style={{
                                    color: '#ffffff',
                                    fontSize: 17
                                }}>
                                    { I18n.t( Keys.HomePage_Submit ) }
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* 已选节点 */}
                    <PopupDialog
                        ref={(dialog) => { this.nodeDialog = dialog; }}
                        dialogAnimation={slideFromBottom}
                        dialogStyle={{
                            position: 'absolute',
                            height: 284,
                            bottom: 0,
                            borderRadius: 0,
                        }}
                        containerStyle={{
                            marginTop: - modalMargin,
                            zIndex: 2
                        }}
                    >
                        <View style={{
                            flexDirection: 'row',
                            height: 44,
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <Text style={{
                                marginLeft: 15,
                                fontSize: 16,
                                color: '#323232'
                            }}>{ I18n.t( Keys.has_selected_node ) }</Text>

                            <TouchableOpacity onPress={() => {
                                this.nodeDialog.dismiss()
                            }}>
                                <View style={{
                                    width: 44,
                                    height: 44,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon
                                        name={'md-close'}
                                        size={24}
                                        color={'#323232'}>
                                    </Icon>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={[ commonStyles.commonIntervalStyle ]}/>

                        <FlatList
                            data={selectedData}
                            keyExtractor={( item, index ) => {
                                return index + '';
                            }}
                            renderItem={( { item, index } ) => {
                                return this.renderSelected( { item, index } );
                            }}
                            ListFooterComponent={() => {
                                return <View style={{ height: ANDROID_BOTTOM_MENU_HEIGHT }}></View>
                            }}
                            ItemSeparatorComponent={() => {
                                return <View style={[ {
                                    height: Util.getDpFromPx( 1 ),
                                    backgroundColor: '#e8e8e8',
                                    marginLeft: 15,
                                } ]}/>
                            }}
                            getItemLayout={( data, index ) => (
                                { length: 65, offset: (65 + separatorHeight) * index, index }
                            )}
                        />

                    </PopupDialog>
                </View>

                {
                    this.state.isRequesting ?
                    <LoadingView/>
                    :
                    null
                }

            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create( {
    card: {
        position: 'relative',
        marginBottom: 10,
        paddingTop: 10,
        paddingLeft: 15,
        paddingBottom: 20,
        paddingRight: 15,
        backgroundColor: '#fff',
        borderColor: '#e8e8e8',
        borderTopWidth: Util.getDpFromPx( 1 ),
        borderBottomWidth: Util.getDpFromPx( 1 ),
    },
    card_title_container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 30,
        marginBottom: 10
    },
    card_title_before: {
        width: 3,
        height: 12,
        backgroundColor: '#1BCE9A'
    },
    card_title: {
        marginLeft: 8,
        fontSize: 18,
        fontWeight: '600',
        color: '#323232'
    },
    card_subtitle: {
        fontSize: 14,
        color: '#999999',
        marginBottom: 10
    },
    card_text: {
        fontSize: 16,
        color: '#323232',
        lineHeight: 24
    },

    logo: {
        width: 64,
        height: 64,
        overflow: 'hidden',
        // 圆形带边框的样式
        backgroundColor: '#fff',
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#fff'
    },
    name: {
        fontSize: 22,
        color: '#323232',
        fontWeight: '600'
    },
    slogan: {
        marginTop: 5,
        fontSize: 16,
        color: '#999999',
        fontWeight: '300',
        lineHeight: 20
    },

    icon_container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10
    },
    icon: {
        color: '#999999',
        fontSize: 14,
    },
    icon_text: {
        fontSize: 16,
        color: '#323232',
        marginLeft: 5
    }
} );

export default EOSNodeDetailPageView;
