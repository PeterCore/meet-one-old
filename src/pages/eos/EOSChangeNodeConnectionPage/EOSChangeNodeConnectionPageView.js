import React, { Component } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-navigation';

class EOSChangeNodeConnectionPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;
        return {
            title: 'Change Node'
        };
    };

    constructor( props ) {
        super( props );

        this.state = {};


    }

    componentWillReceiveProps( nextProps ) {
    }

    componentDidMount() {

    }


    render() {
        return (
            <SafeAreaView style={[ { flex: 1 } ]}>

                <ScrollView>
                    <Text>
                        Eos Network
                    </Text>
                    <View style={[ styles.nodeContainer ]}>
                        <View style={{ flex: 2 }}>
                            <Image style={[ styles.image ]}
                                   source={{ uri: 'https://steemitimages.com/DQmeY3HLRU3Q2dhKgdqcuj52sbw7wdQdBvzzCjP2s2izNdU/2017-05-11%20(2).png' }}/>
                        </View>
                        <View style={{ flex: 8 }}>
                            <Text style={{ flex: 1 }}>
                                Meet.ONE
                            </Text>
                            <Text style={{ flex: 1 }}>
                                http://meet.one
                            </Text>
                        </View>
                    </View>
                    <View style={[ styles.nodeContainer ]}>
                        <View style={{ flex: 2 }}>
                            <Image style={[ styles.image ]}
                                   source={{ uri: 'https://steemitimages.com/DQmeY3HLRU3Q2dhKgdqcuj52sbw7wdQdBvzzCjP2s2izNdU/2017-05-11%20(2).png' }}/>
                        </View>
                        <View style={{ flex: 8 }}>
                            <Text style={{ flex: 1 }}>
                                Meet.ONE
                            </Text>
                            <Text style={{ flex: 1 }}>
                                http://meet.one
                            </Text>
                        </View>
                    </View>
                    <Text>
                        EOS Testnet
                    </Text>
                    <View style={[ styles.nodeContainer ]}>
                        <View style={{ flex: 2 }}>
                            <Image style={[ styles.image ]}
                                   source={{ uri: 'https://steemitimages.com/DQmeY3HLRU3Q2dhKgdqcuj52sbw7wdQdBvzzCjP2s2izNdU/2017-05-11%20(2).png' }}/>
                        </View>
                        <View style={{ flex: 8 }}>
                            <Text style={{ flex: 1 }}>
                                Meet.ONE
                            </Text>
                            <Text style={{ flex: 1 }}>
                                http://meet.one
                            </Text>
                        </View>
                    </View>

                </ScrollView>


            </SafeAreaView>
        );
    }


}


const styles = StyleSheet.create( {

    image: {
        width: 40,
        height: 40
    },

    nodeContainer: {
        flexDirection: 'row',
        flex: 1,
        paddingTop: 10,
        paddingBottom: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: 'black',
    }
} );

export default EOSChangeNodeConnectionPageView;