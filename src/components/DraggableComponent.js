// https://github.com/ShizukuIchi/react-native-drag/blob/master/Draggable.js
// https://mindthecode.com/getting-started-with-the-panresponder-in-react-native/
// https://stackoverflow.com/questions/47291415/draggable-view-within-parent-boundaries

import React, { Component } from "react";
import { Animated, PanResponder, TouchableOpacity, View } from "react-native";
import PropTypes from "prop-types";

class Draggable extends Component {
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

        this.dragger_x = initial_x;
        this.dragger_y = initial_y;

        // this.enableDrag = true;

        this.panResponder = PanResponder.create({
            // onStartShouldSetPanResponder: () => this.enableDrag,
            // onMoveShouldSetPanResponder: () => this.enableDrag,
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

                // // 释放后固定到右边的逻辑
                // this.enableDrag = false;
                // dx = maxX - this.dragger_x;
                // // 纵向还是判定一下范围，以免有偏差
                // let final_y = this.dragger_y + dy;
                // if (minY && final_y < minY) {
                //     dy = minY - this.dragger_y;
                // } else if (maxY && final_y > maxY) {
                //     dy = maxY - this.dragger_y;
                // }

                // Animated.spring( this.animatedValue, {
                //     toValue: {
                //         x: dx,
                //         y: dy
                //     },
                //     friction: 4
                // }).start( () => {
                //     this.enableDrag = true;
                //     this.animatedValue.flattenOffset();
                //     // 每次移动释放后，记录中心位置
                //     let final_x = this.dragger_x + dx;
                //     let final_y = this.dragger_y + dy;
                //     if (minX && final_x < minX) {
                //         final_x = minX;
                //     } else if (maxX && final_x > maxX) {
                //         final_x = maxX;
                //     }
                //     if (minY && final_y < minY) {
                //         final_y = minY;
                //     } else if (maxY && final_y > maxY) {
                //         final_y = maxY;
                //     }
                //     this.dragger_x = final_x;
                //     this.dragger_y = final_y;
                // });
            }
        });
    }
    componentDidMount() {
        this.props.setRef(this.ref);
    }
    componentWillUnmount() {
        clearTimeout(this.onLongPressTimeout);
    }
    render() {
        const panStyle = {
            transform: this.animatedValue.getTranslateTransform()
        };
        const { containerStyle } = this.props;
        return (
            <Animated.View
                {...this.props}
                ref={r => {
                    this.ref = r;
                }}
                {...this.panResponder.panHandlers}
                style={[panStyle, containerStyle, { alignSelf: "flex-start" }]}
            >
                {this.props.children}
            </Animated.View>
        );
    }
}

Draggable.propTypes = {
    children: PropTypes.node,
    onDragStart: PropTypes.func,
    onDragRelease: PropTypes.func,
    onLongPress: PropTypes.func,
    longPressTimeout: PropTypes.number,
    containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    setRef: PropTypes.func
};
Draggable.defaultProps = {
    children: null,
    onDragRelease: () => {},
    onDragStart: () => {},
    onLongPress: () => {},
    longPressTimeout: 500,
    containerStyle: {},
    setRef: () => {}
};

export default Draggable;
