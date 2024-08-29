import React from "react";

import { ActivityIndicator, Text, View } from "react-native";
import I18n from "../I18n";
import Keys from "../configs/Keys";
import commonStyles from "../styles/commonStyles";

class LoadingView extends React.Component {
    constructor( props ) {
        super( props );
    }

    render() {
        return (
            <View style={[
                {
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: '#88000000'
                },
                commonStyles.justAlignCenter ]}>
                <View style={[ { backgroundColor: '#5a5a5a', height: 80, width: 80, borderRadius: 12, } ]}>
                    <ActivityIndicator
                        color={'white'}
                        size={'large'}
                        style={{ flex: 1, marginBottom: 10 }}
                    />

                    <View style={[ {
                        flex: 1,
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'absolute',
                    } ]}>
                        <Text style={[ {
                            top: 40,
                            height: 50,
                            fontSize: 12,
                            color: 'white'
                        } ]}>{I18n.t( Keys.loading )}</Text>
                    </View>
                </View>
            </View>
        );
    }
}


export default LoadingView;
