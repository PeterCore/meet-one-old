import React, { Component } from 'react';
import { StyleSheet, Switch, View, TouchableOpacity } from 'react-native';

class CustomSwitch extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            switchStatus: props.switchStatus
        }
    }

    _toggleSwitch () {
        const result = !this.state.switchStatus;
        this.props.toggleAction(result);
        this.setState({
            switchStatus: result
        })
    }

    render() {
        return (
            <View>
                {/* https://github.com/facebook/react-native/issues/15632  RN 💊 */}
                {/* 用一个层挡住 Switch 控件，实际操作 state 进行变化 */}
                <TouchableOpacity
                    onPress={() => {
                        this._toggleSwitch();
                    }}
                    style={this.props.modalStyle ? this.props.modalStyle : styles.modal}>
                    <View style={this.props.modalStyle ? this.props.modalStyle : styles.modal}></View>
                </TouchableOpacity>
                <Switch
                    onTintColor={this.props.onTintColor ? this.props.onTintColor : ''}
                    value={this.state.switchStatus}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    modal: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        zIndex: 2
    }
});

export default CustomSwitch;
