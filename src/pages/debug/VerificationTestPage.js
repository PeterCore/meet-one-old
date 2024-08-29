import React, { Component } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-navigation';


import Verification from 'react-native-verification'
import commonStyles from "../../styles/commonStyles";

class VerificationTestPage extends Component {
    render() {
        return (
            <SafeAreaView style={commonStyles.wrapper}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
                        <Verification
                            type={'number'}  //number - 数字验证    img - 图片验证
                            num={5} //num - 数字验证的数量
                            getValue={( value ) => console.log( value )}  //返回内容，如果是数字验证，返回随机的内容，如果是图片验证，返回true／false

                        />

                    </View>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
                        <Verification
                            type={'img'}  //number - 数字验证    img - 图片验证
                            getValue={( value ) => console.log( value )}  //返回内容，如果是数字验证，返回随机的内容，如果是图片验证，返回true／false

                        />
                    </View>
                </View>
            </SafeAreaView>
        );
    }
}


export default VerificationTestPage;