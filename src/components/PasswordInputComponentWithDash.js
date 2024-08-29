/*
 * @Desc 一个满足设计的密码输入框 (with dash line)
 * @Author: JohnTrump
 * @Date: 2018-09-17 21:04:01
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-09-26 15:49:02
 */

import React, {
    Component,
} from 'react';

import {
    StyleSheet,
    View,
    TextInput,
    TouchableHighlight,
    InteractionManager,
} from 'react-native';

const PropTypes = require('prop-types');

export default class Password extends Component {
    static propTypes = {
        style: PropTypes.style,
        inputItemStyle: PropTypes.style,
        iconStyle: PropTypes.style,
        maxLength: TextInput.propTypes.maxLength.isRequired,
        onChange: PropTypes.func,
        onEnd: PropTypes.func,
        autoFocus: PropTypes.bool,
    };

    static defaultProps = {
        autoFocus: true,
        onChange: () => { },
        onEnd: () => { },
    };

    constructor(props) {
        super(props);
        this.state = {
            text: ''
        }
    }

    componentDidMount() {
        if (this.props.autoFocus) {
            InteractionManager.runAfterInteractions(() => {
                this._onPress();
            });
        }
    }

    // 清空输入
    _clearInput() {
        this.setState({ text: '' });
        this.refs.textInput.clear();
    }

    render() {
        return (
            <TouchableHighlight
                onPress={this._onPress.bind(this)}
                activeOpacity={1}
                underlayColor='transparent'>
                <View style={[styles.container, this.props.style]} >
                    <TextInput
                        ref="textInput"
                        style={{ height: 45, zIndex: 99, position: 'absolute', width: 45 * 6, opacity: 0 }}
                        maxLength={this.props.maxLength}
                        autoFocus={false}
                        keyboardType="numeric"
                        value={this.state.text}
                        onChangeText={
                            (text) => {
                                this.setState({ text });
                                this.props.onChange(text);
                                if (text.length === this.props.maxLength) {
                                    this.props.onEnd(text);
                                }
                            }
                        }
                    />
                    {
                        this._getInputItem()
                    }
                </View>
            </TouchableHighlight>
        )

    }
    _getInputItem() {
        let inputItem = [];
        let { text } = this.state;
        for (let i = 0; i < parseInt(this.props.maxLength); i++) {
            inputItem.push(
                <View
                    key={i}
                    style={[
                        styles.inputItem,
                        i <= text.length - 1 ? styles.inputItemBorderLeftWidthActive : styles.inputItemBorderLeftWidthNormal,
                        this.props.inputItemStyle
                    ]}>
                    {
                        i < text.length ?
                        <View style={[styles.iconStyle, this.props.iconStyle]}></View>
                        :
                        null
                    }
                </View>)
        }
        return inputItem;
    }

    _onPress() {
        if (this.refs.textInput) {
            this.refs.textInput.focus();
        }
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#fff'
    },
    inputItem: {
        height: 45,
        width: 35,
        margin: 7.5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    inputItemBorderLeftWidthActive: {
        // active status
        borderBottomWidth: 2,
        borderColor: '#1ACE9A'
    },
    inputItemBorderLeftWidthNormal: {
        // normal status
        borderBottomWidth: 2,
        borderColor: '#E8E8E8'
    },
    iconStyle: {
        width: 16,
        height: 16,
        backgroundColor: '#222',
        borderRadius: 8,
    },
});
