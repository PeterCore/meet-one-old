import React, { Component } from "react";
import { StyleSheet, TouchableOpacity, View, Text, Image, Animated, PanResponder } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import NavigationUtil from '../util/NavigationUtil';
import AnalyticsUtil from '../util/AnalyticsUtil';
import PropTypes from "prop-types";

class CPUFloatButton extends Component {
    constructor(props) {
        super(props);
        this.animatedValue = new Animated.ValueXY();
        const {
            longPressTimeout,
            onDragRelease,
            onDragStart,
            onLongPress,
            initial_x,
			initial_y,
			minX,
			maxX,
			minY,
			maxY
        } = props;

        this.state = {
            active: false
        }

        this.dragger_x = initial_x;
        this.dragger_y = initial_y;

        this.panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                onDragStart();
                this.onLongPressTimeout = setTimeout(
                    onLongPress,
                    longPressTimeout
                );
                this.animatedValue.setOffset({
                    x: this.animatedValue.x._value,
                    y: this.animatedValue.y._value
                });
                this.animatedValue.setValue({
                    x: 0,
                    y: 0
                });
            },
            onPanResponderMove: (_, gestureState) => {
                let { dx, dy } = gestureState;
                // 移动时候根据上次位置和 dx dy, 计算中心位置，如果超过限定范围，就限定位置，反算出 dx dy
                let final_x = this.dragger_x + dx;
                let final_y = this.dragger_y + dy;
                if (minX && final_x < minX) {
                    dx = minX - this.dragger_x;
                } else if (maxX && final_x > maxX) {
                    dx = maxX - this.dragger_x;
                }
                if (minY && final_y < minY) {
                    dy = minY - this.dragger_y;
                } else if (maxY && final_y > maxY) {
                    dy = maxY - this.dragger_y;
                }
                this.animatedValue.setValue({
                    x: dx,
                    y: dy
                });
            },
            onPanResponderRelease: (_, gestureState) => {
                let { moveX, moveY, dx, dy } = gestureState;
                clearTimeout(this.onLongPressTimeout);
                onDragRelease(moveX, moveY);

                // 假如移动了微小的距离，就触发点击
                if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
                    this._btnClick()
                }

                this.animatedValue.flattenOffset();

                // 每次移动释放后，记录中心位置
                let final_x = this.dragger_x + dx;
                let final_y = this.dragger_y + dy;
                if (minX && final_x < minX) {
                    final_x = minX;
                } else if (maxX && final_x > maxX) {
                    final_x = maxX;
                }
                if (minY && final_y < minY) {
                    final_y = minY;
                } else if (maxY && final_y > maxY) {
                    final_y = maxY;
                }
                this.dragger_x = final_x;
                this.dragger_y = final_y;
            }
        });
    }

    componentDidMount() {
        this.props.setRef(this.ref);
    }

    _btnClick() {
        if (!this.state.active) {
            this.setState({
                active: true
            }, () => {
                this.timer = setTimeout(() => {
                    this.setState({
                        active: false
                    })
                }, 5000);
            })
        } else {
            AnalyticsUtil.onEvent('DCcputool');
            const useRate = this.props.useRate;
            if (useRate < 100) {
                this.props.navigation.navigate( "EOSResourcesPage" );
            } else {
                if (this.props.floatBtnTarget) {
                    NavigationUtil.openURI({component: this, url: this.props.floatBtnTarget });
                } else {
                    this.props.navigation.navigate( "EOSResourcesPage" );
                }
            }
        }
    }

    componentWillUnmount () {
        this.timer && clearTimeout(this.timer);
        this.onLongPressTimeout && clearTimeout(this.onLongPressTimeout);
    }

    render() {
        const panStyle = {
            transform: this.animatedValue.getTranslateTransform()
        };
        const { containerStyle } = this.props;

        const useRate = this.props.useRate;
        const redColorStop = (useRate - 90) / 10 - 0.1;
        const blackColorStop = (useRate - 90) / 10 + 0.1;
        let colors = [ '#c6123c', 'rgba(0,0,0,0.6)' ]
        if (useRate >= 100) {
            colors = [ '#c6123c', '#c6123c' ]
        }
        if (useRate < 90) {
            colors = [ 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.6)' ]
        }

        return (
            <Animated.View
                {...this.props}
                ref={r => {
                    this.ref = r;
                }}
                {...this.panResponder.panHandlers}
                style={[panStyle, containerStyle, { alignSelf: "flex-start" }]}
            >
                <View>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            this._btnClick();
                        }}
                    >
                        <LinearGradient
                            start={{x: 0, y: 1}} end={{x: 0, y: 0}}
                            colors={colors}
                            locations={[ redColorStop, blackColorStop]}
                            style={[
                                styles.circle,
                                this.state.active ? { opacity: 0.8 } : { opacity: 0.5 }
                            ]}>
                            {
                                useRate >= 100 ?
                                <View style={styles.circleContent}>
                                    <Image
                                        source={require('../imgs/dapp_img_cpubaole.png')}
                                        style={[{ width: 51, height: 40 }]} />
                                </View>
                                :
                                <View style={styles.circleContent}>
                                    <Text style={styles.text}> { useRate }%</Text>
                                    <Text style={styles.subtext}>{ this.props.btnText }</Text>
                                </View>
                            }
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    }
}

CPUFloatButton.propTypes = {
    children: PropTypes.node,
    onDragStart: PropTypes.func,
    onDragRelease: PropTypes.func,
    onLongPress: PropTypes.func,
    longPressTimeout: PropTypes.number,
    containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    setRef: PropTypes.func
};
CPUFloatButton.defaultProps = {
    children: null,
    onDragRelease: () => {},
    onDragStart: () => {},
    onLongPress: () => {},
    longPressTimeout: 500,
    containerStyle: {},
    setRef: () => {}
};


const styles = StyleSheet.create({
    circle: {
        backgroundColor: '#666666',
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center'
    },
    circleContent: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff'
    },
    subtext: {
        fontSize: 8,
        color: '#ffffff'
    }
});

export default CPUFloatButton;
