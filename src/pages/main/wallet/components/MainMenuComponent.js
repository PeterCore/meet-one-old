import React from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View
} from "react-native";
import Svg, { Polygon } from "react-native-svg";
import commonStyles from "../../../../styles/commonStyles";
import constStyles from "../../../../styles/constStyles";
import PropTypes from 'prop-types';

class MainMenuComponent extends React.Component {
    static propTypes = {
        menuOpen: PropTypes.bool,
        menuData: PropTypes.array,
        onSelectMenu: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    // Mounting
    constructor( props ) {
        super( props );

        this.state = {
            data: this.props.menuData,
            menuOpen: props.menuOpen
        };
    }

    componentWillReceiveProps( nextProps ) {
        if (
            nextProps.menuOpen !== this.state.menuOpen
        ) {
            this.setState( {
                menuOpen: nextProps.menuOpen
            } );
        }
    }

    closeModal() {
        this.setState( { menuOpen: false } );

        if ( this.props.onClose ) {
            this.props.onClose();
        }
    }

    renderItem( { item, index } ) {
        return (
            <TouchableHighlight
                underlayColor='#ddd'
                onPress={() => {
                    if ( this.props.onSelect !== null ) {
                        this.props.onSelectMenu( item );
                    }

                    this.closeModal();
                }}
                style={[ { height: 44 } ]}>
                <View style={[
                    commonStyles.wrapper,
                    commonStyles.justAlignCenter,
                    {
                        alignItems: 'center',
                        flexDirection: 'row',
                        paddingLeft: 15
                    }
                ]}>
                    <Image
                        style={{
                            width: 20,
                            height: 20,
                        }}
                        source={item.image}
                    />
                    <Text style={[ {
                        fontSize: 16,
                        marginLeft: 10
                    }, commonStyles.commonTextColorStyle, commonStyles.wrapper ]}>{item.title}</Text>
                </View>
            </TouchableHighlight>
        );
    }

    renderContent() {
        const viewHeight = 44;
        const separatorHeight = 1;

        return (
            <View style={[ {
                width: 140,
                marginRight: 25,
                marginLeft: Dimensions.get( 'window' ).width - 140 - 10,
                marginTop: 44 + (Platform.OS === 'ios' ? constStyles.STATE_BAR_HEIGHT : 0),
            } ]}>

                <Svg
                    height="10"
                    width="20"
                    style={[ { marginLeft: 110 - 6 } ]}
                >
                    <Polygon
                        points="0,10 10,0 20,10"
                        fill="white"
                    />
                </Svg>

                <View
                    style={[ {
                        backgroundColor: 'white',
                        borderRadius: 5,
                        borderColor: 'white',
                        borderWidth: 1
                    } ]}>

                    <FlatList
                        data={this.state.data}
                        keyExtractor={( item, index ) => {
                            return index;
                        }}
                        renderItem={( { item, index } ) => {
                            return this.renderItem( { item, index } );
                        }}
                        ItemSeparatorComponent={() => {
                            return <View
                                style={[ commonStyles.commonIntervalStyle, { marginLeft: 10, marginRight: 10, } ]}/>;
                        }}
                        getItemLayout={( data, index ) => (
                            { length: viewHeight, offset: (viewHeight + separatorHeight) * index, index }
                        )}
                    />
                </View>
            </View>
        );
    }

    render() {


        return (
            this.state.menuOpen ?
                <Modal
                    transparent={true}
                    visible={true}
                >
                    <View style={[ {
                        flex: 1,
                        position: 'absolute',
                        height: Dimensions.get( 'window' ).height,
                        top: 0,
                        left: 0,
                        right: 0,
                    } ]}>
                        <TouchableOpacity
                            style={[ {
                                flex: 1,
                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                height: Dimensions.get( 'window' ).height,
                            } ]}
                            onPress={() => {
                                this.closeModal();
                            }}
                        >
                            {this.renderContent()}

                        </TouchableOpacity>
                    </View>
                </Modal>
                :
                null
        );
    }
}


const styles = StyleSheet.create( {
    operation: {
        width: 28,
        height: 28,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 14,
    },
    arrow: {
        marginLeft: 5,
        marginTop: 1,
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderWidth: 6,
        borderTopColor: '#fff',//下箭头颜色
        borderLeftColor: '#f76260',//右箭头颜色
        borderBottomColor: '#fff',//上箭头颜色
        borderRightColor: '#fff'//左箭头颜色
    }
} );


export default MainMenuComponent;


