import React, { Component } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Image, Dimensions } from 'react-native';
import ImageWithPlaceHolder from "../../../../../components/ImageWithPlaceHolder";
import Util from "../../../../../util/Util";
import AnalyticsUtil from "../../../../../util/AnalyticsUtil";

// 更多生命周期见 https://github.com/jshanson7/react-native-swipeable/blob/master/src/index.js
import Swipeable from 'react-native-swipeable';

class TokenListComponent extends Component {
    constructor( props ) {
        super( props );

        this.state = {
            active: false,
            activating: false
        };
        this.onComplete = this.onComplete.bind(this);
    }

    onComplete(event, gestureState, swipeable) {
        const { name, publisher, exchange_id } = this.props.token;
        const exchangeList = this.props.exchangeList;
        const first_id = exchange_id.split(',')[0];
        const index = Number(first_id) - 1;
        const firstExhange = exchangeList[index];
        const target = firstExhange.ex_target.replace(/{{name}}/g, name).replace(/{{publisher}}/g, publisher);


        AnalyticsUtil.onEventWithMap('WAonesteptrading', { 'mainPage': `exchangeId_${first_id}`, 'all': `exchangeId_${first_id}` });

        setTimeout(() => {
            this.props.navigation.navigate( 'WebViewPage', {
                url: target
            } )
        }, 100);

        setTimeout(() => {
            swipeable.recenter();
            this.setState({
                active: false,
                activating: false
            })
        }, 500);
    }

    render() {
        const tokenObj = this.props.token;
        const { icon, name, publisher, precision, exchange_id } = tokenObj;
        const publisher_token = `${publisher}_${name}`;

        const hideAssets = this.props.hideAssets;
        const price = this.props.price;
        const supportToken = this.props.supportToken;
        const netType = this.props.netType;
        const systemToken = this.props.systemToken;

        const exchangeList = this.props.exchangeList;

        let rightButtons= null;
        if (exchange_id && exchange_id.split(',')[0] && netType === 'EOS' && this.props.oneStepTrade) {
            const first_id = exchange_id.split(',')[0];
            const index = Number(first_id) - 1;
            const firstExhange = exchangeList[index];

            rightButtons = [
                <View style={[styles.rightSwipeItem, this.state.active ? { backgroundColor: firstExhange.color } : { backgroundColor: '#f2f2f2' } ]}>
                    <Image
                        source={{ uri: this.state.active ? firstExhange.icon_active : firstExhange.icon_inactive }}
                        style={[{ width: 87, height: 22, marginLeft: 20 }, this.state.activating ? { alignSelf: 'center' } : {}]} />
                </View>
            ]
        }

        return (
            <Swipeable
                rightButtonWidth={ Dimensions.get( "window" ).width }
                rightButtonsActivationDistance={100}      // 触发激活距离
                onRightButtonsActivate={() => { this.setState({ active: true }) }}         // 激活，滑动到激活距离即触发，触发失效后，再往前移，会再次触发
                onRightButtonsOpenRelease={() => { this.setState({ activating: true}) }}      // 激活释放瞬间
                onRightButtonsOpenComplete={ this.onComplete } // 激活完成
                onRightButtonsDeactivate={() => { this.setState({ active: false }) }}       // 失效，往回移动就触发
                onRightButtonsCloseRelease={() => {}}     // 失效释放瞬间
                onRightButtonsCloseComplete={() => {}}    // 失效完成
                rightButtons={rightButtons}
            >
                <TouchableOpacity
                    onPress={() => {
                        this.props.navigation.navigate( "EOSTokenDetailPage", {
                            token: tokenObj
                        })
                    }}
                    style={{
                        paddingHorizontal: 20
                    }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: 60,
                        borderBottomWidth: Util.getDpFromPx(1),
                        borderBottomColor: '#e5e5e5'
                    }}>
                        {/* ICON */}
                        <ImageWithPlaceHolder
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 36/2,
                                borderColor: '#ddd',
                                borderWidth: Util.getDpFromPx(1)
                            }}
                            placeholderForIcon={'md-image'}
                            source={{ uri: icon }} />
                        <View style={{
                            flex: 1,
                            height: 60,
                            marginLeft: 15,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            {/* Token的名称 */}
                            <Text style={{ fontSize: 16, color: '#323232'}}>{name}</Text>

                            {/* 显示余额，精度会根据Token的配置信息来设置 */}
                            <View style={{
                                alignItems: 'flex-end'
                            }}>
                                <Text style={{fontSize: 18, color: '#4a4a4a', fontFamily: 'DIN'}}>
                                    {
                                        supportToken && supportToken[publisher_token] &&
                                        (hideAssets ? '****' : Util.numberStandard(supportToken[publisher_token].balance, precision) )
                                    }
                                </Text>
                                {/* 有兑EOS价格的，显示兑成EOS的总值 */}
                                {
                                    !hideAssets && price && netType === 'EOS' ?
                                    <Text style={{
                                        fontSize: 12,
                                        color: '#888888',
                                        fontFamily: 'DIN'
                                    }}>
                                        ≈ { Util.numberStandard(price * supportToken[publisher_token].balance, 4 ) } {systemToken}
                                    </Text>
                                    :
                                    null
                                }
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Swipeable>
        )
    }
}

const styles = StyleSheet.create({
    rightSwipeItem: {
        flex: 1,
        justifyContent: 'center'
    }
});

export default TokenListComponent;
