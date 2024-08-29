import React, { Component } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform, StatusBar, TextInput } from "react-native";
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import Icon from "react-native-vector-icons/Ionicons";
import I18n from "../../../I18n";
import commonStyles from "../../../styles/commonStyles";
import Util from "../../../util/Util";
import LoadingView from "../../../components/LoadingView";
import IconSet from "../../../components/IconSet";
import Keys from "../../../configs/Keys";
import AnalyticsUtil from '../../../util/AnalyticsUtil';
import { getNodeList } from "../../../net/DiscoveryNet";

import Toast from "react-native-root-toast";
import PopupDialog, { SlideAnimation } from 'react-native-popup-dialog';

const slideFromTop = new SlideAnimation({
    slideFrom: 'top',
});
const slideFromBottom = new SlideAnimation({
    slideFrom: 'bottom',
});

const WIDTH = Dimensions.get( 'window' ).width;
const areaWidth = (WIDTH - 35) / 4;
const areaHeight = areaWidth * 40 / 85;


const STATE_BAR_HEIGHT = Platform.OS === 'ios' ? (Util.isiPhoneFullDisplay() ? 44 : 20) : StatusBar.currentHeight;
const BOTTOM_BAR_HEIGHT = Platform.OS === 'ios' ? (Util.isiPhoneFullDisplay() ? 34 : 0) : 0;
const NAVI_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const ANDROID_BOTTOM_MENU_HEIGHT = Platform.OS === 'ios' ? 0 : 50;

const modalMargin = STATE_BAR_HEIGHT + BOTTOM_BAR_HEIGHT + NAVI_BAR_HEIGHT + 50 - ANDROID_BOTTOM_MENU_HEIGHT;

// Mock data
// const nodes = [{
//     "id": 11,
//     "account": "eoscannonchn",
//     "name": "EOS CANNON",
//     "icon": "http://static.ethte.com/helper/images/bp/logo/EOSCannon.png",
//     "desc": "受到法律快速大幅减少了的开发建设的开发记录上看到肌肤了受到法律快速大幅减少了的开发建设的开发记录上看到肌肤了受到法律快速大幅减少了的开发建设的开发记录上看到肌肤了",
//     "loc": "Singapore, Japan, Hong Kong",
//     "recommend": 100,
//     "area": 1
// }];

class EOSNodeListPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.Producers_List_Title ),
            headerRight:
                <Button
                    style={commonStyles.top_info_right_btn}
                    title=''
                    onPress={() => {
                        navigation.navigate('EOSNodeVoteProxyPage')
                    }}
                >
                    { I18n.t( Keys.node_list_topright_text ) }
                </Button>
        };
    };

    constructor( props ) {
        super( props );
        this.state = {
            selectedBPs: [].concat(this.props.selectedBPs),

            isRequesting: true,
            hasInfoNodes: [],
            noInfoNodes: [],

            sortType: 0,  // 0 推荐排序  1 票数排序
            area: [],     // 1亚洲 2美洲 3欧洲 4大洋洲 5非洲
            areaSelect: [],
            searchKeywords: '', // 搜索
            searching: false
        };
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('CTvote');

        this.props.navigation.setParams({
            netType: this.props.netType,
        });

        // 不放到 state 里面，避免重新渲染卡顿
        this.areaDialogShow = false;
        // this.sortDialogShow = false;
        this.selectedDialogShow = false;

        let BPResponse, BPInfo;
        // 获取主网的节点列表
        this.props.getProducerList( (err, res) => {
            if (!err) {
                BPResponse = res;
                // 两个请求并行、后一个返回数据的,执行回调
                if (BPInfo) {
                    this.mapNodeInfo(BPResponse, BPInfo);
                }
            } else {

            }
        });
        // 请求自己的节点信息列表

        if (this.props.netType === 'EOS') {
            getNodeList((err, res) => {
                try {
                    const resData = JSON.parse(res);
                    if (resData.code === 0) {
                        BPInfo = resData.data;
                        // 两个请求并行、后一个返回数据的,执行回调
                        if (BPResponse) {
                            this.mapNodeInfo(BPResponse, BPInfo);
                        }
                    }
                } catch (error) {
                    Toast.show(I18n.t(Keys.request_failed), { position: Toast.positions.CENTER } );
                }
            });
        } else {
            BPInfo = [];
        }
    }

    componentWillReceiveProps( nextProps ) {
        this.setState( {
            selectedBPs: [].concat(nextProps.selectedBPs)
        } );
    }

    mapNodeInfo(BPResponse, BPInfo) {
        const hasInfoNodes = [];
        const noInfoNodes = [];

        const BPList = BPResponse.rows;
        const totalVoteWeight = BPResponse.total_producer_vote_weight;

        for (let i = 0; i < BPList.length; i++) {

            BPList[i].voteRate = (BPList[i].total_votes / totalVoteWeight * 100).toFixed(2) + '%';

            let hasInfo = false;
            for (let j = 0; j < BPInfo.length; j++) {
                if (BPList[i].is_active && (BPList[i].owner === BPInfo[j].account)) {
                    hasInfoNodes.push( Object.assign({ hasInfo: 1, rank: i }, BPList[i], BPInfo[j]) );
                    hasInfo = true;
                    break;
                }
            }
            if (!hasInfo && BPList[i].is_active) {
                noInfoNodes.push( Object.assign({ hasInfo: 0, rank: i }, BPList[i]) );
            }
        }

        this.setState({
            isRequesting: false,
            hasInfoNodes,
            noInfoNodes
        })
    }

    // 增加搜索筛选
    searchFilter() {
        let hasInfoNodes = JSON.parse(JSON.stringify(this.state.hasInfoNodes));
        let nodeListDate =  hasInfoNodes.concat(this.state.noInfoNodes);

        const keywords = this.state.searchKeywords;
        const Reg = new RegExp(keywords, 'i');

        nodeListDate = nodeListDate.filter((item) => {
            if (
                (item.owner && Reg.test(item.owner)) ||
                (item.name && Reg.test(item.name)) ||
                (item.account && Reg.test(item.account)) ||
                (item.desc && Reg.test(item.desc)) ||
                (item.loc && Reg.test(item.loc))
            ) {
                return true
            }
        })

        return nodeListDate;
    }

    dataFilter() {
        let hasInfoNodes = JSON.parse(JSON.stringify(this.state.hasInfoNodes));

        hasInfoNodes = this.sortByArea(hasInfoNodes);
        hasInfoNodes = this.sortByRecommend(hasInfoNodes);

        let nodeListDate =  hasInfoNodes.concat(this.state.noInfoNodes);

        return nodeListDate;
    }

    sortByArea(hasInfoNodes) {
        const selectedArea = this.state.area;
        const sortedData = [];

        if (selectedArea.length > 0) {
            for (let i = 0; i < hasInfoNodes.length; i++) {
                if (selectedArea.includes(hasInfoNodes[i].area)) {
                    sortedData.push(hasInfoNodes[i])
                }
            }
            return sortedData;
        } else {
            return hasInfoNodes;
        }
    }

    sortByRecommend(hasInfoNodes) {
        // 1 票数排序,因为之前是根据节点返回列表遍历，所以实际已经是票数排序了。
        if (this.state.sortType) {
            return hasInfoNodes;
        } else {
        // 0 根据推荐数值排序，使用快速排序算法
            return this.quickSort(hasInfoNodes)
        }
    }

    quickSort(hasInfoNodes) {
        const l = hasInfoNodes.length;
        if (l < 2) {
            return hasInfoNodes;
        }

        const basic = hasInfoNodes[0].recommend;
        const left = [];
        const right = [];

        for(let i = 1; i < l; i++) {
            const iv = hasInfoNodes[i].recommend;

            iv <= basic && right.push(hasInfoNodes[i]);
            iv > basic && left.push(hasInfoNodes[i]);
        }
        return this.quickSort(left).concat(hasInfoNodes[0], this.quickSort(right))
    }

    renderItem( { item, index } ) {

        const selectedNodes = this.selectedFilter();

        return (
            <TouchableOpacity
                onPress={() => {
                    if (item.hasInfo) {
                        this.props.navigation.navigate('EOSNodeDetailPage', {
                            selectedNodes: selectedNodes,
                            currentNode: item
                        })
                    }
                }}
            >
                <View style={{
                    flexDirection: 'row',
                    backgroundColor: '#ffffff',
                    height: 140
                }}>
                    <View style={{
                        marginTop: 15,
                        marginLeft: 15,
                        marginRight: 15,
                        width: 50,
                        height: 50,
                    }}>
                        <View style={{
                            width: 50,
                            height: 50,
                            borderWidth: Util.getDpFromPx( 1 ),
                            borderColor: '#ddd',
                            borderRadius: 25,
                            overflow: 'hidden',
                        }}>
                            <Image
                                source={{
                                    uri: item.icon ? item.icon : "https://static.ethte.com/bpicon_default.png"
                                }}
                                style={[ { width: 50, height: 50 } ]}
                            />
                        </View>

                        {
                            this.state.sortType === 1 && !this.state.searching ?
                            <View style={{
                                position: 'absolute',
                                paddingHorizontal: 2,
                                minWidth: 16,
                                height: 16,
                                borderRadius: 4,
                                backgroundColor: '#1BCE9A',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Text style={{
                                    fontSize: 12,
                                    color: '#ffffff'
                                }}>{item.rank + 1}</Text>
                            </View>
                            :
                            null
                        }
                    </View>

                    <View style={{
                        flex: 1,
                        marginTop: 15
                    }}>
                        <Text style={{
                            fontSize: 16,
                            lineHeight: 20,
                            fontWeight: '600',
                            color: '#323232'
                        }}>
                            { item.name ? item.name : item.owner }
                        </Text>

                        {
                            item.name ?
                            <Text style={{
                                fontSize: 14,
                                color: '#999999',
                                fontWeight: '300'
                            }}>
                                { item.owner}
                            </Text>
                            :
                            null
                        }

                        <Text style={{
                                fontSize: 14,
                                color: '#323232',
                                lineHeight: 20,
                                marginTop: 5,
                                marginRight: 15,
                                height: 40,
                                includeFontPadding: false,
                                textAlignVertical: 'center'
                            }}
                            numberOfLines={2}
                        >
                            { item.desc ? item.desc : 'No Information.'}
                        </Text>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                                <IconSet name="icon-locationcopy" style={{
                                    color: '#999999',
                                    fontSize: 14,
                                }}/>
                                <Text style={{
                                    marginLeft: 5,
                                    fontSize: 12,
                                    color: '#999999'
                                }}>
                                    { item.voteRate }
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1, width: 100 }}>
                                <IconSet name="icon-location" style={{
                                    color: '#999999',
                                    fontSize: 14,
                                }}/>
                                <Text style={{
                                    marginLeft: 5,
                                    fontSize: 12,
                                    color: '#999999'
                                    }}
                                    numberOfLines={1}
                                >
                                    { item.loc ? item.loc : 'No information' }
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => {
                                    const votedArray = JSON.parse(JSON.stringify(this.state.selectedBPs));
                                    const index = votedArray.indexOf(item.owner);
                                    if (index === -1) {
                                        if (votedArray.length >= 30) {
                                            Toast.show( I18n.t( Keys.thirty_node_tip ), { position: Toast.positions.CENTER } );
                                            return
                                        }
                                        votedArray.push(item.owner);
                                        this.setState({
                                            selectedBPs: votedArray
                                        });
                                    } else {
                                        votedArray.splice(index, 1);
                                        this.setState({
                                            selectedBPs: votedArray
                                        });
                                    }
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    height: 44,
                                    paddingRight: 15,
                                }}
                                >

                                <Text style={{
                                    fontSize: 14,
                                    color: '#323232',
                                    lineHeight: 20,
                                    opacity: (this.state.selectedBPs.includes(item.owner) ? 1 : 0)
                                }}>
                                    { I18n.t( Keys.node_selected ) }
                                </Text>

                                <Icon
                                    style={[ {
                                        marginLeft: 10,
                                    } ]}
                                    name={ this.state.selectedBPs.includes(item.owner)  ? 'ios-remove-circle-outline' : 'md-add-circle'}
                                    size={26}
                                    color={'#4a4a4a'}>
                                </Icon>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    areaBtnClick(areaCode) {
        if (areaCode) {
            const areaSelect = JSON.parse(JSON.stringify(this.state.areaSelect))
            const index = areaSelect.indexOf(areaCode);
            if (index === -1) {
                areaSelect.push(areaCode);
            } else {
                areaSelect.splice(index, 1);
            }
            this.setState({
                areaSelect: areaSelect
            })
        } else {
            this.setState({
                areaSelect: []
            })
        }
    }

    selectedFilter() {
        const noInfoNodes = JSON.parse(JSON.stringify(this.state.noInfoNodes));
        let hasInfoNodes = JSON.parse(JSON.stringify(this.state.hasInfoNodes));
        hasInfoNodes = this.sortByRecommend(hasInfoNodes);

        const nodeArray = [].concat(hasInfoNodes, noInfoNodes);
        const selectedBPs = this.state.selectedBPs;
        const mapedSelected = [];

        for (let i = 0; i < nodeArray.length; i++) {
            if (selectedBPs.includes(nodeArray[i].owner)) {
                mapedSelected.push(nodeArray[i])
            }
        }

        return mapedSelected;
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

    render() {
        let nodeListData;
        if (this.state.searching) {
            nodeListData = this.searchFilter();
        } else {
            nodeListData = this.dataFilter();
        }

        const selectedData = this.selectedFilter();

        const viewHeight = 140;
        const separatorHeight = Util.getDpFromPx( 1 );

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                <View style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <View style={commonStyles.wrapper}>
                        {/* 搜索 */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#fafafa',
                            paddingTop: 6,
                            paddingBottom: 12
                        }}>
                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                height: 32,
                                marginLeft: 15,
                                borderRadius: 16,
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
                                    style={{
                                        flex: 1,
                                        height: 32,
                                        padding: 0
                                    }}
                                    underlineColorAndroid={'transparent'}
                                    autoCapitalize={'none'}
                                    onChangeText={( text ) => this.setState( { searchKeywords: text } )}
                                    value={this.state.searchKeywords}
                                />
                            </View>
                            {
                                this.state.searching ?
                                <TouchableOpacity onPress={() => {
                                    this.setState({
                                        searching: false,
                                        searchKeywords: ''
                                    })
                                }}>
                                    <View style={styles.searchBtn}>
                                        <Text style={styles.searchBtnText}>{ I18n.t( Keys.cancel ) }</Text>
                                    </View>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity onPress={() => {
                                    if (this.state.searchKeywords.length > 0) {
                                        this.setState({
                                            searching: true
                                        })
                                    }
                                }}>
                                    <View style={styles.searchBtn}>
                                        <Text style={styles.searchBtnText}>{ I18n.t( Keys.search ) }</Text>
                                    </View>
                                </TouchableOpacity>
                            }
                        </View>
                        {/* 顶部下拉 */}
                        <View style={[{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 44,
                            backgroundColor: '#fafafa'
                        }, this.state.searching ? { display: 'none' } : {} ]}>
                            <TouchableOpacity onPress={() => {
                                this.setState({
                                    sortType: 0
                                })
                            }}>
                                <View style={styles.filterBtn}>
                                    <Text style={[ styles.filterBtnText, (this.state.sortType === 0) ? styles.filterSelected : {} ]}>{ I18n.t( Keys.sort_by_recommend ) }</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={{ width: Util.getDpFromPx( 1 ), height: 14, backgroundColor: '#000000' }}></View>

                            <TouchableOpacity onPress={() => {
                                this.setState({
                                    sortType: 1
                                })
                            }}>
                                <View style={styles.filterBtn}>
                                    <Text style={[ styles.filterBtnText, (this.state.sortType === 1) ? styles.filterSelected : {} ]}>{ I18n.t( Keys.sort_by_voterate ) }</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={{ width: Util.getDpFromPx( 1 ), height: 14, backgroundColor: '#000000' }}></View>

                            <TouchableOpacity onPress={() => {
                                // this.sortDialog.dismiss();
                                if (this.areaDialogShow) {
                                    this.areaDialog.dismiss();
                                } else {
                                    this.areaDialog.show();
                                }
                            }}>
                                <View style={styles.filterBtn}>
                                    <Text style={[ styles.filterBtnText, (this.state.area.length > 0) ? styles.filterSelected : {} ]}>{ I18n.t( Keys.area_filter_text ) }</Text>
                                    <IconSet name="icon-arrow3" style={[ styles.filterBtnIcon, (this.state.area.length > 0) ? styles.filterSelected : {} ]}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                        {/* 节点列表 */}
                        <FlatList
                            style={{ backgroundColor: '#fff' }}
                            data={nodeListData}
                            keyExtractor={( item, index ) => {
                                return index + '';
                            }}
                            renderItem={( { item, index } ) => {
                                return this.renderItem( { item, index } );
                            }}
                            ItemSeparatorComponent={() => {
                                return <View style={[ {
                                    height: Util.getDpFromPx( 1 ),
                                    backgroundColor: '#e8e8e8',
                                    marginLeft: 80,
                                } ]}/>
                            }}
                            getItemLayout={( data, index ) => (
                                { length: viewHeight, offset: (viewHeight + separatorHeight) * index, index }
                            )}
                        />
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
                                if (this.selectedDialogShow) {
                                    this.nodeDialog.dismiss();
                                } else {
                                    this.nodeDialog.show();
                                }
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

                        {/* 排序 */}
                        {/* <PopupDialog
                            ref={(dialog) => { this.sortDialog = dialog; }}
                            onDismissed={() => {
                                this.sortDialogShow = false;
                            }}
                            onShown={() => {
                                this.sortDialogShow = true;
                            }}
                            dialogAnimation={slideFromTop}
                            dialogStyle={[ styles.popUpDialogStyle, { height: 88 } ]}
                            containerStyle={[ styles.dialogContainerStyle ]}
                        >
                            <TouchableOpacity onPress={() => {
                                this.sortDialog.dismiss();
                                this.setState({
                                    sortType: 0
                                })
                            }}>
                                <View style={styles.sortList}>
                                    <Text style={styles.sortListText}>{ I18n.t( Keys.sort_by_recommend ) }</Text>

                                    {
                                        this.state.sortType === 0 ?
                                        <Image
                                            source={require( '../../../imgs/all_icon_selected.png' )}
                                            style={[ { width: 22, height: 22, } ]}
                                        />
                                        :
                                        null
                                    }

                                </View>
                            </TouchableOpacity>

                            <View style={[ commonStyles.commonIntervalStyle, { marginLeft: 15 } ]}/>

                            <TouchableOpacity onPress={() => {
                                this.sortDialog.dismiss();
                                this.setState({
                                    sortType: 1
                                })
                            }}>
                                <View style={styles.sortList}>
                                    <Text style={styles.sortListText}>{ I18n.t( Keys.sort_by_voterate ) }</Text>

                                    {
                                        this.state.sortType === 1 ?
                                        <Image
                                            source={require( '../../../imgs/all_icon_selected.png' )}
                                            style={[ { width: 22, height: 22, } ]}
                                        />
                                        :
                                        null
                                    }
                                </View>
                            </TouchableOpacity>
                        </PopupDialog> */}

                        {/* 地域筛选 */}
                        <PopupDialog
                            onDismissed={() => {
                                this.areaDialogShow = false;

                                setTimeout(() => {
                                    this.setState({
                                        areaSelect: JSON.parse(JSON.stringify(this.state.area))
                                    })
                                }, 500);
                            }}
                            onShown={() => {
                                this.areaDialogShow = true;
                            }}
                            ref={(dialog) => { this.areaDialog = dialog; }}
                            dialogAnimation={slideFromTop}
                            dialogStyle={[ styles.popUpDialogStyle, { height: areaHeight * 2 + 80 } ]}
                            containerStyle={[ styles.dialogContainerStyle ]}
                        >
                            <View style={{
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                paddingLeft: 10,
                                paddingRight: 5,
                                paddingTop: 15
                            }}>
                                <TouchableOpacity onPress={() => {
                                    this.areaBtnClick()
                                }}>
                                    <View style={[ styles.areaLabel ]}>
                                        <View style={[ styles.areaLabelTextWrap,
                                            this.state.areaSelect.length <= 0 ?
                                            styles.areaLabelSelected
                                            :
                                            null
                                        ]}>
                                            <Text style={[ styles.areaLabelText,
                                                this.state.areaSelect.length <= 0 ?
                                                styles.areaLabelSelectedText
                                                :
                                                null
                                            ]}>{ I18n.t( Keys.area_filter_all ) }</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => {
                                    this.areaBtnClick(1)
                                }}>
                                    <View style={styles.areaLabel}>
                                        <View style={[ styles.areaLabelTextWrap,
                                            this.state.areaSelect.includes(1) ?
                                            styles.areaLabelSelected
                                            :
                                            null
                                        ]}>
                                            <Text style={[ styles.areaLabelText,
                                                this.state.areaSelect.includes(1) ?
                                                styles.areaLabelSelectedText
                                                :
                                                null
                                            ]}>{ I18n.t( Keys.area_filter_assia ) }</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => {
                                    this.areaBtnClick(2)
                                }}>
                                    <View style={styles.areaLabel}>
                                        <View style={[ styles.areaLabelTextWrap,
                                            this.state.areaSelect.includes(2) ?
                                            styles.areaLabelSelected
                                            :
                                            null
                                        ]}>
                                            <Text style={[ styles.areaLabelText,
                                                this.state.areaSelect.includes(2) ?
                                                styles.areaLabelSelectedText
                                                :
                                                null
                                            ]}>{ I18n.t( Keys.area_filter_america ) }</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => {
                                    this.areaBtnClick(3)
                                }}>
                                    <View style={styles.areaLabel}>
                                        <View style={[ styles.areaLabelTextWrap,
                                            this.state.areaSelect.includes(3) ?
                                            styles.areaLabelSelected
                                            :
                                            null
                                        ]}>
                                            <Text style={[ styles.areaLabelText,
                                                this.state.areaSelect.includes(3) ?
                                                styles.areaLabelSelectedText
                                                :
                                                null
                                            ]}>{ I18n.t( Keys.area_filter_europe ) }</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => {
                                    this.areaBtnClick(4)
                                }}>
                                    <View style={styles.areaLabel}>
                                        <View style={[ styles.areaLabelTextWrap,
                                            this.state.areaSelect.includes(4) ?
                                            styles.areaLabelSelected
                                            :
                                            null
                                        ]}>
                                            <Text style={[ styles.areaLabelText,
                                                this.state.areaSelect.includes(4) ?
                                                styles.areaLabelSelectedText
                                                :
                                                null
                                            ]}>{ I18n.t( Keys.area_filter_pecific ) }</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => {
                                    this.areaBtnClick(5)
                                }}>
                                    <View style={styles.areaLabel}>
                                        <View style={[ styles.areaLabelTextWrap,
                                            this.state.areaSelect.includes(5) ?
                                            styles.areaLabelSelected
                                            :
                                            null
                                        ]}>
                                            <Text style={[ styles.areaLabelText,
                                                this.state.areaSelect.includes(5) ?
                                                styles.areaLabelSelectedText
                                                :
                                                null
                                            ]}>{ I18n.t( Keys.area_filter_africa ) }</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={[ commonStyles.commonIntervalStyle, { marginTop: 10 } ]}/>

                            <TouchableOpacity onPress={() => {
                                this.setState({
                                    area: JSON.parse(JSON.stringify(this.state.areaSelect))
                                }, () => {
                                    this.areaDialog.dismiss()
                                })
                            }}>
                                <View style={{
                                    height: 44,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Text style={{
                                        fontSize: 16,
                                        color: '#1BCE9A'
                                    }}>
                                    { I18n.t( Keys.HomePage_Submit ) }
                                    </Text>
                                </View>
                            </TouchableOpacity>

                        </PopupDialog>

                        {/* 已选节点 */}
                        <PopupDialog
                            ref={(dialog) => { this.nodeDialog = dialog; }}
                            onDismissed={() => {
                                this.selectedDialogShow = false
                            }}
                            onShown={() => {
                                this.selectedDialogShow = true
                            }}
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
    searchBtn: {
        height: 32,
        paddingHorizontal: 15,
        justifyContent: 'center'
    },
    searchBtnText: {
        fontSize: 14,
        color: '#323232'
    },
    filterBtn: {
        flexDirection: 'row',
        width: 105,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBtnText: {
        fontSize: 14,
        color: '#323232',
    },
    filterSelected: {
        color: '#1BCE9A'
    },
    filterBtnIcon: {
        marginLeft: 5,
        color: '#323232',
        fontSize: 10,
    },
    popUpDialogStyle: {
        position: 'absolute',
        top: 0,
        borderRadius: 0,
        marginTop: -2
    },
    dialogContainerStyle: {
        marginTop: 94,
        zIndex: 10
    },
    sortList: {
        flexDirection: 'row',
        height: 44,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15
    },
    sortListText: {
        fontSize: 16,
        color: '#323232'
    },
    areaLabel: {
        width: areaWidth,
        height: areaHeight,
        borderRadius: 2,
        marginRight: 5,
        marginBottom: 5
    },
    areaLabelTextWrap: {
        width: '100%',
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 2,
    },
    areaLabelText: {
        fontSize: 14,
        color: '#323232'
    },

    areaLabelSelected: {
        borderWidth: 1,
        borderColor: '#1BCE9A',
        backgroundColor: '#1BCE9A',
        backgroundColor: '#ffffff'
    },

    areaLabelSelectedText: {
        color: '#1BCE9A'
    }

} );

export default EOSNodeListPageView;
