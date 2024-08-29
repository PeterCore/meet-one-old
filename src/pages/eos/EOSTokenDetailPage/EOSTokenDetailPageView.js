import React, { Component } from "react";
import {
    StyleSheet,
    FlatList,
    InteractionManager,
    RefreshControl,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View,
    Image,
} from "react-native";
import { SafeAreaView } from "react-navigation";
import Toast from "react-native-root-toast";

import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";

import commonStyles from "../../../styles/commonStyles";
import constStyles from "../../../styles/constStyles";
import LoadingMoreItem from "../../../components/LoadingMoreItem";
import LoadingView from "../../../components/LoadingView";
import ImageWithPlaceHolder from "../../../components/ImageWithPlaceHolder";
import Util from "../../../util/Util";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

import { getAccountActions } from "../../../net/3thNet";
import RecommendExchange from "./RecommendExchange";
import NormalExchange from "./NormalExchange";

const moment = require("moment-timezone");
const DeviceInfo = require("react-native-device-info");
const timezone = DeviceInfo.getTimezone();

class EOSTokenDetailPageView extends Component {
    static navigationOptions = props => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: params.token.name, // I18n.t(Keys.token_detail_title)
            headerStyle: {
                backgroundColor: "#ffffff",
                borderBottomWidth: 0,
                elevation: 0
            }
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            account: props.account,
            currentToken: props.currentToken,

            useNode: props.netType !== 'EOS',
            historyType: "total",
            totalTransData: [],
            transOutData: [],
            transInData: [],
            // 从节点查询用的参数
            pos: -1,
            offset: -100,
            // 从服务器查询用的参数
            page: 0,
            limit: 50,
            filterSpam: true,

            isRequesting: true,

            resquestingMore: false,
            hasMoreData: true
        };
    }

    componentWillMount() {
        this.props.UpdateTokenBalance(
            this.props.account,
            this.props.currentToken,
            null
        );
        this.loadData();
    }

    componentDidMount() {
        AnalyticsUtil.onEvent("WAtokendetail");
    }

    loadData() {
        if (this.state.hasMoreData && !this.state.resquestingMore) {
            this.setState(
                {
                    resquestingMore: true
                },
                () => {
                    InteractionManager.runAfterInteractions(() => {
                        this.getTransHistory();
                    });
                }
            );
        }
    }

    getTransHistory() {
        if (this.state.useNode) {
            this.getHistoryFromNode();
        } else {
            this.getHistoryFromServer();
        }
    }

    getHistoryFromServer() {
        getAccountActions(
            {
                account: this.state.account.accountName,
                contract_account: this.state.currentToken.publisher,
                contract_name: "transfer",
                page: this.state.page,
                limit: this.state.limit,
                filterSpam: this.state.filterSpam
            },
            (err, res) => {
                if (err) {
                    Toast.show(err.message, {
                        position: Toast.positions.CENTER
                    });
                } else {
                    const resData = res.body;

                    if (resData.use_node) {
                        this.setState(
                            {
                                useNode: true
                            },
                            () => {
                                this.getHistoryFromNode();
                            }
                        );
                        return;
                    }

                    let transferData = [];
                    let hasMoreData = false;

                    const transOutData = [];
                    const transInData = [];

                    if (resData.err_code === 0) {
                        // 过滤出 Transfer 类型
                        transferData = resData.actions.filter(item => {
                            if (
                                item.name === "transfer" &&
                                item.account ===
                                    this.state.currentToken.publisher &&
                                item.data.from &&
                                item.data.to &&
                                item.data.quantity &&
                                item.data.quantity.split(" ")[1] ===
                                    this.state.currentToken.name
                            ) {
                                return true;
                            } else {
                                return false;
                            }
                        });

                        for (let i = 0; i < transferData.length; i++) {
                            if (
                                transferData[i].data.from ===
                                this.state.account.accountName
                            ) {
                                transOutData.push(transferData[i]);
                            }
                            if (
                                transferData[i].data.to ===
                                this.state.account.accountName
                            ) {
                                transInData.push(transferData[i]);
                            }
                        }

                        // 判断是否还有数据
                        if (resData.actions.length === this.state.limit) {
                            hasMoreData = true;
                        }
                    } else {
                        Toast.show(resData.err_msg, {
                            position: Toast.positions.CENTER
                        });
                    }

                    this.setState(
                        (prevState, props) => ({
                            totalTransData: prevState.totalTransData.concat(
                                transferData
                            ),
                            transOutData: prevState.transOutData.concat(
                                transOutData
                            ),
                            transInData: prevState.transInData.concat(
                                transInData
                            ),

                            hasMoreData: hasMoreData,
                            page: prevState.page + 1,
                            isRequesting: false,
                            resquestingMore: false
                        }),
                        () => {
                            if (this.state.totalTransData.length < 8) {
                                this.loadData();
                            }
                        }
                    );
                }
            }
        );
    }

    getHistoryFromNode() {
        this.props.onGetEOSTransactions(
            this.state.account,
            { pos: this.state.pos, offset: this.state.offset },
            (error, resBody) => {
                if (error) {
                    Toast.show(error.message, {
                        position: Toast.positions.CENTER
                    });
                } else {
                    const rawData = resBody.actions;
                    const totalTransData = [];
                    const transOutData = [];
                    const transInData = [];

                    let hasMoreData = true;
                    let pos = this.state.pos;

                    let prev;
                    let current;
                    const prevLast = this.state.prevLast;

                    for (let i = 0; i < rawData.length; i++) {
                        current = rawData[i];

                        // 判断与上一个请求的最后一个记录是否重复
                        if (
                            prevLast &&
                            prevLast.action_trace.trx_id ===
                                current.action_trace.trx_id &&
                            prevLast.action_trace.act.name ===
                                current.action_trace.act.name &&
                            prevLast.action_trace.act.data.from ===
                                current.action_trace.act.data.from &&
                            prevLast.action_trace.act.data.to ===
                                current.action_trace.act.data.to &&
                            prevLast.action_trace.act.data.quantity ===
                                current.action_trace.act.data.quantity &&
                            prevLast.action_trace.act.data.memo ===
                                current.action_trace.act.data.memo
                        ) {
                            continue;
                        }

                        // 只有当前 token 的 transfer 型才显示
                        if (
                            current.action_trace.act.name === "transfer" &&
                            current.action_trace.act.account ===
                                this.state.currentToken.publisher &&
                            current.action_trace.act.data.quantity.split(
                                " "
                            )[1] === this.state.currentToken.name
                        ) {
                            // 重复就跳过 (现在节点返回的记录有重复的，做个过滤)
                            if (
                                prev &&
                                prev.action_trace.trx_id ===
                                    current.action_trace.trx_id &&
                                prev.action_trace.act.name ===
                                    current.action_trace.act.name &&
                                prev.action_trace.act.data.from ===
                                    current.action_trace.act.data.from &&
                                prev.action_trace.act.data.to ===
                                    current.action_trace.act.data.to &&
                                prev.action_trace.act.data.quantity ===
                                    current.action_trace.act.data.quantity &&
                                prev.action_trace.act.data.memo ===
                                    current.action_trace.act.data.memo
                            ) {
                                continue;
                            } else {
                                if (
                                    current.action_trace.act.data.from ===
                                    this.state.account.accountName
                                ) {
                                    transOutData.push(current);
                                }
                                if (
                                    current.action_trace.act.data.to ===
                                    this.state.account.accountName
                                ) {
                                    transInData.push(current);
                                }
                                totalTransData.push(current);
                                prev = rawData[i];
                            }
                        }
                    }
                    // 判断不再有更多记录
                    if (rawData.length > 0) {
                        pos = rawData[0].account_action_seq - 1;
                        if (rawData[0].account_action_seq === 0) {
                            hasMoreData = false;
                        }
                    } else {
                        hasMoreData = false;
                    }

                    totalTransData.reverse();
                    transOutData.reverse();
                    transInData.reverse();

                    this.setState(
                        (prevState, props) => ({
                            totalTransData: prevState.totalTransData.concat(
                                totalTransData
                            ),
                            transOutData: prevState.transOutData.concat(
                                transOutData
                            ),
                            transInData: prevState.transInData.concat(
                                transInData
                            ),

                            hasMoreData: hasMoreData,
                            pos: pos,
                            isRequesting: false,
                            resquestingMore: false,
                            prevLast: totalTransData[totalTransData.length - 1]
                        }),
                        () => {
                            if (this.state.totalTransData.length < 8) {
                                this.loadData();
                            }
                        }
                    );
                }
            }
        );
    }

    renderItem(item) {
        const blockNum = item.block_num;
        const blockTime = item.block_time;
        const actionTrace = item.action_trace;
        const transactionId = actionTrace ? actionTrace.trx_id : item.trx_id;
        const transData = actionTrace ? actionTrace.act.data : item.data;
        const publisher = actionTrace ? actionTrace.act.account : item.account;

        return (
            <TouchableOpacity
                onPress={() => {
                    this.props.navigation.navigate("EOSTransactionDetailPage", {
                        account: this.state.account,
                        blockNum,
                        blockTime,
                        transactionId,
                        transData,
                        publisher
                    });
                }}
            >
                <View
                    style={{
                        flex: 1,
                        height: 64,
                        backgroundColor: "#ffffff"
                    }}
                >
                    <View
                        style={{
                            paddingLeft: 15,
                            paddingRight: 15,
                            paddingBottom: 10,
                            paddingTop: 10
                        }}
                    >
                        <View>
                            <View
                                style={[
                                    { flexDirection: "row" },
                                    commonStyles.justAlignCenter
                                ]}
                            >
                                <View style={[{}, commonStyles.wrapper]}>
                                    <Text
                                        style={[
                                            {
                                                fontSize: 18,
                                                fontFamily: "Menlo"
                                            },
                                            commonStyles.commonTextColorStyle
                                        ]}
                                        numberOfLines={1}
                                        ellipsizeMode={"middle"}
                                    >
                                        {transData.to ===
                                        this.state.account.accountName
                                            ? transData.from
                                            : transData.to}
                                    </Text>
                                    <View
                                        style={[
                                            {
                                                flexDirection: "row",
                                                marginTop: 6
                                            }
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                {
                                                    fontSize: 12
                                                },
                                                commonStyles.commonSubTextColorStyle
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {moment
                                                .utc(blockTime)
                                                .tz(timezone)
                                                .format("YYYY-MM-DD") +
                                                " " +
                                                moment
                                                    .utc(blockTime)
                                                    .tz(timezone)
                                                    .format("HH:mm:ss")}
                                        </Text>
                                    </View>
                                </View>
                                <Text
                                    style={[
                                        {
                                            fontSize: 20,
                                            marginLeft: 10,
                                            color: "#323232",
                                            fontFamily: "DIN",
                                            fontWeight: "500"
                                        },
                                        transData.from ===
                                        this.state.account.accountName
                                            ? { color: "#ff4249" }
                                            : {}
                                    ]}
                                >
                                    {(transData.from ===
                                    this.state.account.accountName
                                        ? "-"
                                        : "+") +
                                        Number(
                                            transData.quantity.split(" ")[0]
                                        ).toFixed(
                                            this.state.currentToken.precision
                                        )}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    startTransfer() {
        if (this.props.recentAccount.length > 0) {
            this.props.navigation.navigate("EOSTransferSelectPage", {
                currentToken: this.state.currentToken
            });
        } else {
            this.props.navigation.navigate("EOSTransferPage", {
                currentToken: this.state.currentToken
            });
        }
    }

    showQRCode() {
        this.props.navigation.navigate("EOSQRCodePage", {
            primaryKey: this.props.account.primaryKey
        });
    }

    renderExchange() {
        const currentToken = this.state.currentToken;
        const exchangeList = this.props.exchangeList;
        const exchangeIDs = currentToken.exchange_id && currentToken.exchange_id.split(',');

        if (exchangeIDs && exchangeIDs.length > 0) {
            const firstId = exchangeIDs.shift();
            if (firstId) {
                return (
                    <View>
                        <View style={[commonStyles.commonIntervalStyle, {}]} />
                        <View
                            style={{
                                backgroundColor: "#ffffff"
                            }}
                        >
                            <RecommendExchange
                                token={currentToken}
                                exchange={exchangeList[firstId - 1]}
                                navigation={this.props.navigation}
                            />
                            {
                                exchangeIDs.length > 0 ?
                                <View style={[commonStyles.commonIntervalStyle, { marginHorizontal: 15 }]} />
                                :
                                null
                            }
                            <View
                                style={{
                                    flexWrap: 'wrap',
                                    flexDirection: "row",
                                    paddingHorizontal: 5
                                }}
                            >
                                {
                                    exchangeIDs.map((item, index) => {
                                        if (item) {
                                            return (
                                                <NormalExchange
                                                    index={index}
                                                    token={currentToken}
                                                    exchange={exchangeList[item - 1]}
                                                    navigation={this.props.navigation}
                                                />
                                            )
                                        } else {
                                            return null
                                        }
                                    })
                                }
                            </View>
                        </View>
                        <View style={[commonStyles.commonIntervalStyle, {}]} />
                    </View>
                );
            } else {
                return null
            }
        } else {
            return null
        }
    }

    render() {
        let listData;

        switch (this.state.historyType) {
            case "total":
                listData = this.state.totalTransData;
                break;
            case "out":
                listData = this.state.transOutData;
                break;
            case "in":
                listData = this.state.transInData;
                break;
            default:
                listData = this.state.totalTransData;
                break;
        }

        const {
            publisher,
            name,
            precision,
            icon,
            sub_name
        } = this.state.currentToken;
        const supportToken = this.state.account.supportToken;
        const tokenCurrency = supportToken[`${publisher}_${name}`]
            ? supportToken[`${publisher}_${name}`].balance
            : 0;
        const tokenBalance = Number(tokenCurrency).toFixed(precision);

        return (
            <SafeAreaView
                style={[commonStyles.wrapper, { backgroundColor: "#ffffff" }]}
            >
                <View
                    style={[commonStyles.wrapper, commonStyles.commonBG]}
                >
                    {/* 顶部 Token 信息 */}
                    <View style={{ marginBottom: 10 }}>
                        <View
                            style={[
                                {
                                    backgroundColor: "white",
                                    flexDirection: "row",
                                    height: 70
                                },
                                commonStyles.justAlignCenter,
                                styles.padding_both
                            ]}
                        >
                            <ImageWithPlaceHolder
                                style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 25,
                                    borderWidth: Util.getDpFromPx(1),
                                    borderStyle: "solid",
                                    borderColor: "#ddd"
                                }}
                                source={{ uri: icon }}
                            />

                            <View style={{ marginLeft: 15 }}>
                                <Text
                                    style={{
                                        fontSize: 20,
                                        color: "#323232"
                                    }}
                                >
                                    {name}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 14,
                                        color: "#888888"
                                    }}
                                >
                                    {sub_name}
                                </Text>
                            </View>

                            <View
                                style={[
                                    commonStyles.wrapper,
                                    {
                                        flexDirection: "row",
                                        justifyContent: "flex-end",
                                        alignItems: "flex-end"
                                    }
                                ]}
                            >
                                <TouchableOpacity
                                    style={[
                                        commonStyles.wrapper,
                                        {
                                            flexDirection: "row",
                                            justifyContent: "flex-end",
                                            alignItems: "flex-end"
                                        }
                                    ]}
                                    onPress={() => {
                                        if (this.state.currentToken.isCustom) {
                                            return;
                                        } else {
                                            this.props.navigation.navigate(
                                                "EOSTokenInfoPage",
                                                {
                                                    token: this.state.currentToken
                                                }
                                            );
                                        }
                                    }}
                                >
                                    <Text
                                        style={{ fontSize: 14, color: "#888888" }}
                                    >
                                        {I18n.t(Keys.token_detail_tokenDetail)}
                                    </Text>
                                    <Image
                                        source={require("../../../imgs/arrow-right-account.png")}
                                        style={{
                                            width: 14,
                                            height: 14,
                                            marginLeft: 5
                                        }}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={[ commonStyles.commonIntervalStyle, { marginHorizontal: 15 } ]} />
                        <View
                            style={[
                                {
                                    backgroundColor: "white",
                                    flexDirection: "row",
                                    height: 50,
                                    alignItems: "center",
                                    justifyContent: "space-between"
                                },
                                styles.padding_both
                            ]}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: "#888888"
                                }}
                            >
                                {I18n.t(Keys.token_detail_balance)}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 18,
                                    color: "#323232",
                                    fontFamily: "DIN",
                                    fontWeight: "500"
                                }}
                            >
                                {tokenBalance}
                            </Text>
                        </View>
                        <View style={[ commonStyles.commonIntervalStyle, { marginBottom: 10 }]} />

                        {/* 交易所信息 */}
                        {
                            this.props.netType === 'EOS' && this.props.oneStepTrade
                            ?
                            this.renderExchange()
                            :
                            null
                        }
                    </View>

                    {/* 交易记录 */}
                    {/* 头部 Tab */}
                    <View>
                        <View style={[ commonStyles.commonIntervalStyle ]} />
                        <View
                            style={[
                                {
                                    backgroundColor: "white",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-around"
                                }
                            ]}
                        >
                            <View style={styles.tab}>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ historyType: "total" });
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.tabText,
                                            this.state.historyType === "total"
                                                ? styles.activeTabColor
                                                : {}
                                        ]}
                                    >
                                        {I18n.t(Keys.token_detail_all)}
                                    </Text>
                                    <View
                                        style={
                                            this.state.historyType === "total"
                                                ? styles.activeTabBottom
                                                : {}
                                        }
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.tab}>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ historyType: "out" });
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.tabText,
                                            this.state.historyType === "out"
                                                ? styles.activeTabColor
                                                : {}
                                        ]}
                                    >
                                        {I18n.t(Keys.token_detail_out)}
                                    </Text>
                                    <View
                                        style={
                                            this.state.historyType === "out"
                                                ? styles.activeTabBottom
                                                : {}
                                        }
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.tab}>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ historyType: "in" });
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.tabText,
                                            this.state.historyType === "in"
                                                ? styles.activeTabColor
                                                : {}
                                        ]}
                                    >
                                        {I18n.t(Keys.token_detail_in)}
                                    </Text>
                                    <View
                                        style={
                                            this.state.historyType === "in"
                                                ? styles.activeTabBottom
                                                : {}
                                        }
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={[commonStyles.commonIntervalStyle, {}]} />
                    </View>
                    {/* 该 Token 交易记录列表 */}
                    <FlatList
                        style={{ backgroundColor: "white", flex: 1}}
                        data={listData}
                        renderItem={({ item }) => {
                            return this.renderItem(item);
                        }}
                        onEndReachedThreshold={0.95}
                        onEndReached={() => {
                            this.loadData();
                        }}
                        ItemSeparatorComponent={() => {
                            return (
                                <View
                                    style={[
                                        commonStyles.commonIntervalStyle,
                                        { marginLeft: 15 }
                                    ]}
                                />
                            );
                        }}
                        ListEmptyComponent={() => {
                            return this.state.isRequesting ? null : (
                                <Text
                                    style={[
                                        {
                                            fontSize: 18,
                                            textAlign: "center",
                                            marginTop: 100
                                        },
                                        commonStyles.wrapper,
                                        commonStyles.commonSubTextColorStyle
                                    ]}
                                >
                                    {I18n.t(Keys.empty_data)}
                                </Text>
                            );
                        }}
                        ListFooterComponent={() => {
                            if (this.state.resquestingMore) {
                                return (
                                    <LoadingMoreItem
                                        waiting={this.state.resquestingMore}
                                    />
                                );
                            }

                            if (
                                this.state.totalTransData.length === 0 ||
                                (this.state.historyType === "in" &&
                                    this.state.transInData.length === 0) ||
                                (this.state.historyType === "out" &&
                                    this.state.transOutData.length === 0)
                            ) {
                                return null;
                            }

                            if (!this.state.hasMoreData) {
                                return (
                                    <Text
                                        style={{
                                            color: "#888888",
                                            textAlign: "center",
                                            lineHeight: 24,
                                            marginBottom: 20
                                        }}
                                    >
                                        {I18n.t(Keys.token_detail_noMoreData)}
                                    </Text>
                                );
                            }

                            return null;
                        }}
                    />

                    <View style={[commonStyles.commonIntervalStyle, {}]} />
                    <View
                        style={[
                            {
                                height: 50,
                                backgroundColor: "white",
                                flexDirection: "row"
                            }
                        ]}
                    >
                        <TouchableHighlight
                            underlayColor="#f7f7f7"
                            onPress={() => {
                                this.startTransfer();
                            }}
                            style={[{}, commonStyles.wrapper]}
                        >
                            <View
                                style={[
                                    {
                                        flexDirection: "row",
                                        height: 50
                                    },
                                    commonStyles.justAlignCenter
                                ]}
                            >
                                <Image
                                    source={require("../../../imgs/menu_icon_transfer.png")}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        marginRight: 10
                                    }}
                                />
                                <Text
                                    style={[{ fontSize: 18, color: "#323232" }]}
                                >
                                    {I18n.t(Keys.transfer)}
                                </Text>
                            </View>
                        </TouchableHighlight>

                        <View
                            style={[
                                commonStyles.commonIntervalStyle,
                                {
                                    width: Util.getDpFromPx(1),
                                    height: 14,
                                    marginTop: 18
                                }
                            ]}
                        />

                        <TouchableHighlight
                            underlayColor="#f7f7f7"
                            onPress={() => {
                                this.showQRCode();
                            }}
                            style={[{}, commonStyles.wrapper]}
                        >
                            <View
                                style={[
                                    {
                                        flexDirection: "row",
                                        height: 50
                                    },
                                    commonStyles.justAlignCenter
                                ]}
                            >
                                <Image
                                    source={require("../../../imgs/menu_icon_collection.png")}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        marginRight: 10
                                    }}
                                />
                                <Text
                                    style={[{ fontSize: 18, color: "#323232" }]}
                                >
                                    {I18n.t(Keys.receive)}
                                </Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    padding_both: {
        paddingHorizontal: 15
    },
    tab: {
        position: "relative",
        height: 44
    },
    tabText: {
        width: 36,
        lineHeight: 44,
        fontSize: 16,
        textAlign: "center",
        color: "#323232"
    },
    activeTabColor: {
        color: "#1ace9a"
    },
    activeTabBottom: {
        position: "absolute",
        width: 36,
        height: 3,
        bottom: 0,
        backgroundColor: "#1ace9a"
    }
});

export default EOSTokenDetailPageView;
