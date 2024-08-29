import React, { Component } from "react";
import {
    InteractionManager,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} from "react-native";
import I18n from "../../../I18n";
import Util from "../../../util/Util";
import Toast from "react-native-root-toast";
import Spinner from "react-native-loading-spinner-overlay";
import LoadingView from "../../../components/LoadingView";
import PasswordInputComponent from "../../../components/PasswordInputComponent";
import Keys from "../../../configs/Keys";
import { NavigationActions, StackActions, SafeAreaView } from "react-navigation";
import { getStore } from "../../../setup";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

class EOSVotePageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        return {
            title: I18n.t( Keys.VotePage_vote )
        };
    };

    constructor( props ) {
        super( props );

        this.state = {
            noticeShow: false,
            ruleShow: false,
            votingList: [],
            isRequesting: false,
            isPswdOpen: false
        };

        this._setDeleteBPC = this._setDeleteBPC.bind( this );

    }

    componentWillReceiveProps( nextProps ) {
        let votingList = nextProps.selectedNodeList;
        this.setState( {
            votingList,
        } );
    }

    componentDidMount() {
        let votingList = this.props.selectedNodeList;

        const accountPrivateKey = this.props.account.accountPrivateKey;
        const accountName = this.props.account.accountName;
        const data = {
            accountPrivateKey,
            accountName,
        };
        this.setState( {
            accountPri: data,
            votingList
        } )
    }


    _setNoticeModalShow() {
        this.setState( {
            noticeShow: true,
        } );
    }

    _submitList() {
        const store = getStore();
        const tempPsw = Util.decryptTempPsw(store.getState().eosStore.tempPsw);
        if (tempPsw) {
            AnalyticsUtil.onEvent('WASNfree');
            this.setState({
                noticeShow: false
            }, () => {
                this._doSubmitList(tempPsw);
            });
        } else {
            this.setState( { noticeShow: false, isPswdOpen: true } );
        }
    }

    _doSubmitList( password ) {
        let votingList = [];
        this.state.votingList.map( ( one ) => {
            votingList.push( one.owner )
        } );
        votingList.sort();


        this.setState( {
            isRequesting: true,
            noticeShow: false,
        } );
        InteractionManager.runAfterInteractions( () => {
            this.props.onDispatchVoteVotingList( this.props.account, votingList, password, ( err, res ) => {
                this.setState( {
                    isRequesting: false,
                } );

                if ( !err ) {
                    Toast.show( I18n.t( Keys.VotePage_vote_success ) + '!', { position: Toast.positions.CENTER } );

                    // 投票成功，重新获取AccountInfo，重置IsSubmitSuccess
                    this.props.onDispatchGetVoteBpsPost( this.props.account );
                    this.props.getAccountInfo( this.props.account );

                    this.props.navigation.dispatch(
                        StackActions.reset(
                            {
                                index: 0,
                                actions: [
                                    NavigationActions.navigate( { routeName: 'mainPage' } ),
                                ]
                            }
                        )
                    );
                } else {
                    Toast.show( err.message, { position: Toast.positions.CENTER } );
                }
            } );
        } );
    }

    _setDeleteBPC( index ) {
        let votingList = [].concat( this.state.votingList );
        votingList.splice( index, 1 );
        this.setState( {
            votingList
        } )
    }

    // 显示/隐藏 modal
    _setRuleModalVisible() {
        let isShow = this.state.ruleShow;
        this.setState( {
            ruleShow: !isShow,
        } );
    }

    // 显示/隐藏 modal
    _setNoticeModalVisible() {
        let isShow = this.state.noticeShow;
        this.setState( {
            noticeShow: !isShow,
        } );
    }


    render() {
        let { account_name, total_resources } = this.props.account;
        total_resources = total_resources || { cpu_weight: '0 EOS', net_weight: '0 EOS' };
        let cpu_weight = total_resources.cpu_weight || '0 EOS';
        let net_weight = total_resources.net_weight || '0 EOS';
        cpu_weight = parseFloat( cpu_weight.replace( ' EOS', '' ) );
        net_weight = parseFloat( net_weight.replace( ' EOS', '' ) );
        let stake = parseFloat( net_weight + cpu_weight ).toFixed( 4 );
        cpu_weight = parseFloat( cpu_weight ).toFixed( 4 );
        net_weight = parseFloat( net_weight ).toFixed( 4 );
        const currencyBalance = parseFloat( this.props.account.currencyBalance ).toFixed( 4 );

        const account = I18n.t( Keys.VotePage_account );
        const balance = I18n.t( Keys.VotePage_balance );
        const stakeN = I18n.t( Keys.VotePage_stake );
        const cancel = I18n.t( Keys.VotePage_cancel );
        const gotIt = I18n.t( Keys.VotePage_gotIt );
        const confirm = I18n.t( Keys.VotePage_confirm );
        const bpList = I18n.t( Keys.VotePage_bpList );
        const submit = I18n.t( Keys.VotePage_submit );
        const delegatebw = I18n.t( Keys.VotePage_delegatebw );
        const notice = I18n.t( Keys.VotePage_notice );
        const noticeC = I18n.t( Keys.VotePage_noticeC );
        const RuleT = I18n.t( Keys.VotePage_RuleT );
        const Rule1 = I18n.t( Keys.VotePage_Rule1 );
        const Rule2 = I18n.t( Keys.VotePage_Rule2 );
        const Rule3 = I18n.t( Keys.VotePage_Rule3 );

        this.account_name = account_name;


        return (
            <SafeAreaView style={[ { flex: 1, backgroundColor: '#e8e8e8' }, ]}>
                <ScrollView>
                    <View style={[ styles.bodyBox, { flex: 1 } ]}>

                        <View style={styles.contentHeader}>
                            <View style={styles.contentHeaderAccountName}>
                                <Text style={styles.contentHeaderAccountNameLabel}>
                                    {account}
                                </Text>
                                <Text style={styles.contentHeaderAccountNameValue}>
                                    {account_name || 'none'}
                                </Text>
                            </View>
                            <View style={styles.contentHeaderBalance}>
                                <Text style={[ styles.contentHeaderAccountNameLabel ]}>
                                    {balance}
                                </Text>
                                <Text style={[ styles.contentHeaderBalanceValueContainer ]}>
                                    {currencyBalance} <Text style={styles.contentHeaderEOSSign}>EOS</Text>
                                </Text>
                            </View>
                            <View style={styles.contentHeaderStake}>
                                <Text style={[ styles.contentHeaderAccountNameLabel ]}>
                                    {stakeN}
                                </Text>
                                <Text style={[ styles.contentHeaderBalanceValueContainer ]}>
                                    {stake} <Text style={styles.contentHeaderEOSSign}>EOS</Text>
                                </Text>
                            </View>
                        </View>

                        <View style={styles.contentBodyStake}>
                            <View style={styles.contentBodyStakeHeader}>
                                <Text style={styles.contentBodyStakeHeaderName}>{delegatebw}</Text>
                                <View style={styles.contentBodyStakeHeaderQuestionContainer}>
                                    <TouchableHighlight onPress={this._setRuleModalVisible.bind( this )}>
                                        <View style={styles.contentBodyStakeHeaderQuestionBox}>
                                            <Text style={styles.contentBodyStakeHeaderQuestion}>
                                                ?
                                            </Text>
                                        </View>
                                    </TouchableHighlight>
                                </View>
                            </View>
                            <View style={styles.contentBodyStakeBody}>
                                <View style={styles.contentBodyStakeCpu}>
                                    <Text style={styles.contentBodyStakeBodyTextLabel}>
                                        CPU
                                    </Text>
                                    <Text style={styles.contentBodyStakeBodyTextValue}>
                                        {cpu_weight}
                                    </Text>
                                </View>
                                <View style={styles.contentBodyStakeNetwork}>
                                    <Text style={styles.contentBodyStakeBodyTextLabel}>
                                        Network
                                    </Text>
                                    <Text style={styles.contentBodyStakeBodyTextValue}>
                                        {net_weight}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={[ styles.contentBodyVotingList, { marginBottom: 50 }, ]}>
                            <View style={styles.contentBodyVotingListHeader}>
                                <Text style={styles.contentBodyVotingListName}>
                                    {bpList}
                                    {/*Each node bellow will get {1234*2**((new Date().getTime() - new Date(2000,0,1).getTime())/1000/(3600*24*365))} votes*/}
                                </Text>
                            </View>
                            <View style={styles.contentBodyBPListContainer}>
                                {
                                    this.state.votingList.map( ( votingC, index ) => {
                                        return <View key={index}
                                                     style={styles.contentBodyBP}>
                                            <Text style={styles.contentBodyBPName}>
                                                {this.props.bpProducerDic[ votingC.owner ] ? this.props.bpProducerDic[ votingC.owner ].organization_name : votingC.owner}
                                            </Text>
                                            {/*<View style={styles.contentBodyBPDeleteContainer}>*/}
                                            {/*<TouchableHighlight id={index}*/}
                                            {/*onPress={()=>this._setDeleteBPC(index)}>*/}
                                            {/*<View style={styles.contentBodyBPDeleteButton}>*/}
                                            {/*<View style={styles.contentBodyBPDeleteButtonInner}></View>*/}
                                            {/*</View>*/}
                                            {/*</TouchableHighlight>*/}
                                            {/*</View>*/}
                                        </View>
                                    } )
                                }
                            </View>
                        </View>

                    </View>
                </ScrollView>

                <View style={[ styles.footerView, ]}>
                    <Text style={styles.footerSubmit}
                          onPress={this._setNoticeModalShow.bind( this )}>
                        {submit}
                    </Text>
                </View>

                <Modal
                    animationType='slide'
                    transparent={true}
                    visible={this.state.ruleShow}
                    onShow={() => {
                    }}
                    onRequestClose={() => {
                    }}>
                    <View style={[ styles.ruleModalStyle ]}>
                        <View style={styles.ruleSubView}>
                            <Text style={styles.ruleContentText}>
                                {RuleT}
                            </Text>
                            <Text style={styles.ruleContentText}>
                                {Rule1}
                            </Text>
                            <Text style={styles.ruleContentText}>
                                {Rule2}
                            </Text>
                            <Text style={styles.ruleContentText}>
                                {Rule3}
                            </Text>
                            {/*<Text style={styles.ruleContentText}>*/}
                            {/*{Rule4}*/}
                            {/*</Text>*/}
                            <View style={styles.buttonView}>
                                <TouchableHighlight underlayColor='transparent'
                                                    style={styles.buttonStyle}
                                                    onPress={this._setRuleModalVisible.bind( this )}>
                                    <Text style={styles.buttonText}>
                                        {gotIt}
                                    </Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal
                    animationType='slide'
                    transparent={true}
                    visible={this.state.noticeShow}
                    onShow={() => {
                    }}
                    onRequestClose={() => {
                    }}>
                    <View style={styles.modalStyle}>
                        <View style={styles.subView}>
                            <Text style={styles.titleText}>
                                {notice}
                            </Text>
                            <Text style={styles.contentText}>
                                {noticeC}
                            </Text>
                            <View style={styles.horizontalLine}/>
                            <View style={styles.buttonView}>
                                <TouchableHighlight underlayColor='transparent'
                                                    style={styles.buttonStyle}
                                                    onPress={this._setNoticeModalVisible.bind( this )}>
                                    <Text style={styles.buttonText}>
                                        {cancel}
                                    </Text>
                                </TouchableHighlight>
                                <View style={styles.verticalLine}/>
                                <TouchableHighlight underlayColor='transparent'
                                                    style={styles.buttonStyle}
                                                    onPress={this._submitList.bind( this )}>
                                    <Text style={styles.buttonText}>
                                        {confirm}
                                    </Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </View>
                </Modal>

                <PasswordInputComponent
                    isOpen={this.state.isPswdOpen}
                    onResult={( password ) => {
                        this._doSubmitList( password )
                    }}
                    onClose={() => {
                        this.setState( {
                            isPswdOpen: false
                        } );
                    }}
                />

                <Spinner visible={this.state.isRequesting} children={<LoadingView/>}/>
            </SafeAreaView>
        );
    }

}

const leftFirstBase = 13;
const deleteButtonRadius = 10;
const voteItemHeight = 45;
const footerHeight = 45;
const spaceTop = 40;

const styles = StyleSheet.create( {
    wrapper: {
        flex: 1
    },
    mgl_normal: {
        marginLeft: 15
    },
    justAlignCenter: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    commonTextColorStyle: {
        color: '#323232'
    },
    commonSubTextColorStyle: {
        color: '#999999'
    },
    commonIntervalStyle: {
        height: Util.getDpFromPx( 1 ),
        backgroundColor: '#e8e8e8'
    },


    bodyBox: {
        position: "relative",
        flexBasis: "100%",
    },

    contentHeader: {
        marginTop: 20,
        paddingLeft: 15,
        paddingRight: 15,
        marginLeft: leftFirstBase,
        marginRight: leftFirstBase,
        borderRadius: 5,
        backgroundColor: "#ffffff",
    },

    contentHeaderAccountName: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },

    contentHeaderBalance: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },

    contentHeaderStake: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },


    contentHeaderAccountNameLabel: {
        fontSize: 16,
        lineHeight: 45,
        color: 'black',
        fontWeight: '200',
    },

    contentHeaderAccountNameValue: {
        textAlign: 'right',
        fontSize: 16,
        lineHeight: 45,
        color: 'black',
        fontWeight: '200',
    },

    contentHeaderBalanceValueContainer: {
        color: "#181818",
        fontSize: 20,
        fontWeight: "600",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-end",
    },

    contentHeaderBalanceValue: {
        fontSize: 21,
        fontWeight: '400',
        lineHeight: 45,
    },

    contentHeaderEOSSignContainer: {
        // paddingTop:2.5,
        paddingLeft: 4,
    },

    contentHeaderEOSSign: {
        fontSize: 14,
        color: "#0c0c0c",
    },

    contentBodyStake: {
        marginTop: 20,
    },

    contentBodyStakeHeader: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: leftFirstBase,
        marginRight: leftFirstBase,
    },

    contentBodyStakeHeaderName: {
        color: 'grey',
        width: '50%',
        fontSize: 16,
        fontWeight: '200',
        lineHeight: 42,
    },

    contentBodyStakeHeaderQuestionContainer: {
        width: '50%',
        alignItems: 'flex-end',
    },

    contentBodyStakeHeaderQuestionBox: {
        backgroundColor: '#dcdcdc',
        width: 24,
        height: 24,
        borderRadius: 12,
        marginTop: 9,
    },

    contentBodyStakeHeaderQuestion: {
        textAlign: 'center',
        color: 'black',
        fontSize: 16,
        lineHeight: 24,
    },

    contentBodyStakeBody: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: "#ffffff",
    },

    contentBodyStakeCpu: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },

    contentBodyStakeBodyTextLabel: {
        width: '50%',
        fontSize: 17,
        lineHeight: 45,
        fontWeight: '200',
        paddingLeft: leftFirstBase,
    },

    contentBodyStakeBodyTextValue: {
        width: '50%',
        textAlign: 'right',
        fontSize: 17,
        lineHeight: 45,
        paddingRight: leftFirstBase,
    },

    contentBodyStakeNetwork: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },

    contentBodyVotingList: {
        marginTop: 20,
    },

    contentBodyVotingListHeader: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: leftFirstBase,
        marginRight: leftFirstBase,
    },

    contentBodyVotingListName: {
        color: 'grey',
        fontSize: 16,
        fontWeight: '200',
        lineHeight: 35,
    },

    contentBodyBPListContainer: {
        backgroundColor: "#ffffff",
    },

    contentBodyBP: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: leftFirstBase,
        marginRight: leftFirstBase,
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },

    contentBodyBPName: {
        width: '50%',
        fontSize: 18,
        fontWeight: '200',
        lineHeight: 45,
    },

    contentBodyBPDeleteContainer: {
        alignItems: 'flex-end',
        width: '50%',
    },

    contentBodyBPDeleteButton: {
        width: deleteButtonRadius * 2,
        height: deleteButtonRadius * 2,
        borderRadius: deleteButtonRadius,
        borderWidth: deleteButtonRadius / 20,
        borderColor: '#000',
        marginTop: voteItemHeight / 2 - deleteButtonRadius,
        marginRight: 0,
    },

    contentBodyBPDeleteButtonInner: {
        marginTop: deleteButtonRadius / 10 * 8.5,
        marginLeft: deleteButtonRadius / 10 * 2,
        width: deleteButtonRadius / 10 * 14,
        borderBottomWidth: deleteButtonRadius / 10,
        borderColor: '#000',
    },

    ruleModalStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },

    ruleSubView: {
        marginLeft: leftFirstBase,
        marginRight: leftFirstBase,
        paddingTop: 23,
        paddingLeft: 15,
        paddingRight: 15,
        paddingBottom: 23,
        backgroundColor: '#fff',
        alignSelf: 'stretch',
        justifyContent: 'center',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#ccc',
    },

    ruleContentText: {
        marginBottom: 5,
    },


    // modal的样式
    modalStyle: {
        // backgroundColor:'#ccc',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    // modal上子View的样式
    subView: {
        marginLeft: 60,
        marginRight: 60,
        backgroundColor: '#fff',
        alignSelf: 'stretch',
        justifyContent: 'center',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#ccc',
    },
    // 标题
    titleText: {
        marginTop: 10,
        marginBottom: 5,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // 内容
    contentText: {
        margin: 10,
        paddingBottom: 20,
        paddingTop: 10,
        fontSize: 14,
        textAlign: 'center',
    },
    // 水平的分割线
    horizontalLine: {
        marginTop: 5,
        height: 1,
        backgroundColor: '#ccc',
    },
    // 按钮
    buttonView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonStyle: {
        flex: 1,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // 竖直的分割线
    verticalLine: {
        width: 1,
        height: 44,
        backgroundColor: '#ccc',
    },
    buttonText: {
        fontSize: 16,
        color: '#3393F2',
        textAlign: 'center',
    },


    footerView: {
        height: footerHeight,
        width: '100%',
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#3D4144',
    },


    footerSubmit: {
        width: '100%',
        color: '#ffffff',
        fontSize: 20,
        lineHeight: 45,
        // paddingTop:4,
        textAlign: 'center',
    },
} );

export default EOSVotePageView;
