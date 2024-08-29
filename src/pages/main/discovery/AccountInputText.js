import React, { Component } from "react";
import {TextInput, View, Text, StyleSheet, TouchableOpacity} from "react-native";
import PopupDialog from 'react-native-popup-dialog';
import PropTypes from 'prop-types';

import commonStyles from "../../../styles/commonStyles";
import constStyles from "../../../styles/constStyles";
import IconSet from "../../../components/IconSet";

class AccountInputText extends Component {

    static defaultProps = {
        text: '',
        errorMsg: '',
        length: 12
    }

    static propTypes = {
        text: PropTypes.string, // 初始输入框内容， 默认为空
        length: PropTypes.number // 输入框长度，默认为12
    }

    constructor(props) {
        super(props);
        this.state = {
            errorMsg: this.props.errorMsg
        }
    }

    render() {
        const msg = this.props.errorMsg.length > 0 ?
                        ( <Text style={{ fontSize: 14, color: '#F65858'}}>{this.props.errorMsg}</Text>)
                        : null;
        return (
            <View style={[{ }]}>
                {/* delete Icon */}
                <TextInput
                    style={[
                        styles.inputComponent,
                        styles.normalInput,
                        commonStyles.monospace,
                        this.props.errorMsg.length > 0 ? styles.errorInput : {},
                        {
                            paddingHorizontal: 10,
                            fontSize: 18,
                            opacity: 1,
                            position: 'relative',
                            zIndex: 99,
                            top: -5
                        }
                    ]}
                    value={this.props.text}
                    // clearButtonMode={'always'}
                    ref={(ref) => this.textInput = ref}
                    // 最高12位
                    maxLength={this.props.length}
                    spellCheck={false}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    keyboardType={'email-address'}
                    underlineColorAndroid={'transparent'}
                    onBlur={(e) => {
                        this._onValidate(this.props.index, this.props.text);
                    }}
                    onChangeText={
                        (text) => {

                            this.props.onChangeText(this.props.index, text);

                            // reacti-native  0.55.4 版本 onchangeText没有阻塞input，会造成 state 与 UI 显示不一致
                            {/* const reg = /^[a-z1-5]+$/;
                            if (reg.test(text) || text.length === 0) {
                                this.props.onChangeText(this.props.index, text);
                            } else {
                                return false;
                            } */}
                        }
                    }/>
                    {
                        this._getInputItem()
                    }

                    {/* 删除按钮 */}
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            right: 0,
                            backgroundColor: 'transparent',
                            zIndex: 99
                        }}
                        activeOpacity={0.7}
                        onPress={() => {
                            this.props.delete(this.props.index);
                            this.setState({ errorMsg: '' })
                        }}>
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            width: 50,
                            height: 50
                        }}>
                            <IconSet name="icon-CombinedShapexhdpi" style={{
                                color: this.state.errorMsg.length > 0 ? '#F65858' : constStyles.DIVIDER_COLOR,
                                fontSize: 14,
                            }}/>
                        </View>
                    </TouchableOpacity>

                    {/* tips */}
                    <View style={{paddingVertical: 10}}>
                        {msg}
                    </View>
            </View>
        )
    }

    // 验证输入是否合法
    _onValidate = (index, text) => {
        this.props.isValidate(index, text);
    }

    // 渲染 ----
    _getInputItem = () => {
        let inputItem = [];
        let {text} = this.props;
        for (let i =0; i < this.props.length; i++) {
            inputItem.push(
                <View key={i} style={[
                ]}>
                    { i < text.length ?
                        // 透明掉
                        <Text style={[commonStyles.monospace, styles.underLinePlaceholder, {opacity: 0}]}>{text[i]}</Text> :
                        <View style={[styles.underLinePlaceholder]}></View>
                    }
                </View>
            )
        }

        return (
            <View style={[ {flexDirection: 'row', position: 'absolute', zIndex: 99, top: 25, left: 10} ]}>
                {inputItem}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    underLinePlaceholder: {
        width: 6,
        height: 2,
        backgroundColor: '#e8e8e8',
        borderRadius: 100,
        marginHorizontal: 2.5,
        // marginHorizontal: 1
    },
    inputComponent: {
        height: 50,
        borderWidth: 1,
        borderRadius: 2,
        marginVertical: 5
    },

    normalInput: {
        backgroundColor: '#fff',
        borderColor: '#e8e8e8',
    },

    errorInput: {
        backgroundColor: '#rgba(246,88,88,0.05)',
        borderColor: '#F65858'
    }
});

export default AccountInputText;
