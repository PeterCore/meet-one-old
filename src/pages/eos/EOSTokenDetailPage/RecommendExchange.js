import React, { Component } from "react";
import {
    Text,
    TouchableOpacity,
    View,
    Image,
} from "react-native";
import { getTokenPrice } from "../../../net/DiscoveryNet";

import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

class RecommendExchange extends Component {
    constructor(props) {
        super(props);
        this.state = {
            percent: '--',
            price: '--'
        }
    }

    componentDidMount() {
        this.ongetTokenPrice();

        this.timer = setInterval(() => {
            this.ongetTokenPrice();
        }, 10000);
    }

    ongetTokenPrice() {
        const id = this.props.exchange.id;
        const contract = this.props.token.publisher;
        const symbol = this.props.token.name;

        getTokenPrice({
            id,
            contract,
            symbol
        }, ( err, resBody ) => {
            if (!err) {
                const resData = JSON.parse(resBody);
                if ( resData.percent && resData.last_price ) {
                    this.setState({
                        percent: resData.percent,
                        price: resData.last_price
                    })
                }
            }
        })
    }

    componentWillUnmount() {
        this.timer && clearInterval( this.timer );
    }

    render() {

        const exchangeId = this.props.exchange.id;
        const exchangeIcon = this.props.exchange.icon;
        const { name, publisher } = this.props.token;
        const target = this.props.exchange.ex_target.replace(/{{name}}/g, name).replace(/{{publisher}}/g, publisher);

        let percentColor;
        if (parseFloat(this.state.percent) >= 0) {
            percentColor = '#1ace9a'
        } else {
            percentColor = '#d0021b'
        }

        return (
            <TouchableOpacity
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: 64,
                    paddingHorizontal: 15
                }}
                onPress={() => {
                    AnalyticsUtil.onEventWithMap('WAonesteptrading', { 'recommend': `exchangeId_${exchangeId}`, 'all': `exchangeId_${exchangeId}` });
                    this.props.navigation.navigate( 'WebViewPage', {
                        url: target
                    } )
                }}
            >
                <View>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: 'center'
                        }}
                    >
                        <Image
                            style={{
                                width: 14,
                                height: 14,
                                borderRadius: 4
                            }}
                            source={{ uri: exchangeIcon }}
                        />

                        <Text
                            style={{
                                marginLeft: 5,
                                fontSize: 14,
                                color: "#323232"
                            }}
                        >
                            {name}/EOS
                        </Text>
                    </View>

                    <Text style={{ marginTop: 4 }}>
                        <Text
                            style={{
                                fontFamily: "DIN",
                                fontWeight: "500",
                                fontSize: 20
                            }}
                        >
                            { this.state.price }
                        </Text>
                        {"   "}
                        <Text
                            style={{
                                fontFamily: "DIN",
                                fontWeight: "500",
                                fontSize: 16,
                                marginLeft: 10,
                                color: percentColor
                            }}
                        >
                            { this.state.percent }
                        </Text>
                    </Text>
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center"
                    }}
                >
                    <Text
                        style={{
                            fontSize: 14,
                            color: "#888888"
                        }}
                    >
                        { I18n.t(Keys.one_step_trade_trade) }
                    </Text>
                    <Image
                        style={{
                            width: 14,
                            height: 14,
                            marginLeft: 5
                        }}
                        source={require("../../../imgs/arrow-right-account.png")}
                    />
                </View>
            </TouchableOpacity>
        )
    }
}

export default RecommendExchange;

