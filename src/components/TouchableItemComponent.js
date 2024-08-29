import React from "react";

import { Image, StyleSheet, Text, TouchableOpacity, View, ViewPropTypes } from "react-native";
import commonStyles from "../styles/commonStyles";
import PropTypes from 'prop-types';

class TouchableItemComponent extends React.Component {

    static propTypes = {
        onPress: PropTypes.func,
        title: PropTypes.string,
        content: PropTypes.string,
        headerInterval: PropTypes.bool,
        footerInterval: PropTypes.bool,
        headerIntervalStyle: ViewPropTypes.style,
        footerIntervalStyle: ViewPropTypes.style,
        containerStyle: ViewPropTypes.style,
        style: ViewPropTypes.style,
        titleStyle: Text.propTypes.style,
        contentStyle: ViewPropTypes.style,
        leftElement: PropTypes.element,
        children: PropTypes.element,
        hideRightNav: PropTypes.bool,
    };

    constructor( props ) {
        super( props );
    }

//
//     this.props.headerInterval ? commonStyles.commonBorderTop : null, this.props.footerInterval ? commonStyles.commonBorderBottom : null, {
//     paddingTop: this.props.headerInterval ? Util.getDpFromPx( 1 ) : 0,
//     paddingBottom: this.props.footerInterval ? Util.getDpFromPx( 1 ) : 0
// }

    render() {
        //noinspection JSCheckFunctionSignatures
        return (
            <View
                style={[ styles.container, this.props.containerStyle ]}>
                {
                    this.props.headerInterval ?
                        <View
                            style={[ commonStyles.commonBorderTop,
                                this.props.headerIntervalStyle ]}
                        >
                        </View>
                        :
                        null
                }
                <TouchableOpacity
                    style={[
                        {
                            backgroundColor: "white",
                            minHeight: 46,
                            paddingRight: 15,
                            paddingLeft: 15,
                            paddingTop: 14,
                            paddingBottom: 14
                        },
                        this.props.style
                    ]}
                    // underlayColor='#ddd'
                    activeOpacity={0.8}
                    onPress={() => {
                        this
                            .props
                            .onPress();
                    }}>
                    <View
                        style={[
                            {
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'space-between'
                            },
                            commonStyles.justAlignCenter
                        ]}>
                        {

                            <View style={[ {
                                flexDirection: 'row',
                                marginRight: 10
                            }, commonStyles.justAlignCenter ]}>
                                {this.props.leftElement ? this.props.leftElement : null}
                                {
                                    this.props.title ?
                                        <Text
                                            style={[
                                                commonStyles.commonTextColorStyle,
                                                {
                                                    fontSize: 16,
                                                },
                                                this.props.titleStyle
                                            ]}>
                                            {this.props.title}
                                        </Text>
                                        :
                                        null
                                }
                            </View>
                        }


                        {
                            <View style={[
                                {
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end'
                                } ]
                            }>
                                {
                                    this.props.content && this.props.content.length > 0 ?
                                        <Text
                                            style={[
                                                {
                                                    flex: 1,
                                                    fontSize: 14,
                                                    textAlign: 'right',
                                                    color: '#717789',
                                                },
                                                this.props.contentStyle
                                            ]}>
                                            {this.props.content}
                                        </Text>
                                        :
                                        null
                                }
                                {this.props.children !== null ? this.props.children : null}
                            </View>
                        }
                        {
                            this.props.hideRightNav ?
                                null
                                :
                                <Image
                                    style={{
                                        width: 8,
                                        height: 13,
                                        marginLeft: 15,
                                    }}
                                    source={require( '../imgs/ic_right_arrow.png' )}
                                />
                        }

                        {
                            // 自定义组件右边
                            this.props.rightNav ? this.props.rightNav : null
                        }


                    </View>
                </TouchableOpacity>

                {
                    this.props.footerInterval ?
                        <View
                            style={[ commonStyles.commonBorderBottom,
                                this.props.footerIntervalStyle ]}
                        >
                        </View>
                        :
                        null
                }
            </View>
        );
    }
}

const styles = StyleSheet.create( { container: {} } );

export default TouchableItemComponent;
