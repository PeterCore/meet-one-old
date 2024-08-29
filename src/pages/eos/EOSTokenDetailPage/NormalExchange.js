import React, { Component } from "react";
import {
    Text,
    TouchableOpacity,
    View,
    Image,
} from "react-native";
import { getTokenPrice } from "../../../net/DiscoveryNet";

import Util from "../../../util/Util";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

class NormalExchange extends Component {
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
        const exchangeName = this.props.exchange.name;

        const { name, publisher } = this.props.token;
        const target = this.props.exchange.ex_target.replace(/{{name}}/g, name).replace(/{{publisher}}/g, publisher);

        return (
            <TouchableOpacity
                style={[{
                    width: '50%',
                    height: 16,
                    marginVertical: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                },
                (this.props.index % 2 === 0) ?
                    {
                        borderRightWidth: Util.getDpFromPx(1),
                        borderRightColor: '#e8e8e8'
                    }
                :
                {}]}
                onPress={() => {
                    AnalyticsUtil.onEventWithMap('WAonesteptrading', { 'normal': `exchangeId_${exchangeId}`, 'all': `exchangeId_${exchangeId}` });
                    this.props.navigation.navigate( 'WebViewPage', {
                        url: target
                    } )
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}
                >
                    <Image
                        style={{
                            marginLeft: 10,
                            marginRight: 5,
                            width: 14,
                            height: 14,
                            borderRadius: 4
                        }}
                        source={{ uri: exchangeIcon }}
                    />
                    <Text
                        style={{
                            fontSize: 14,
                            color: '#888888'
                        }}
                    >
                        { exchangeName }
                    </Text>
                </View>
                <Text style={{
                    marginRight: 10,
                    fontFamily: 'DIN',
                    fontWeight: '500',
                    fontSize: 14,
                    color: '#323232'
                }}>
                    { this.state.price }
                </Text>
            </TouchableOpacity>
        )
    }
}

export default NormalExchange;






