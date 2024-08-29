import React from "react";
import {
    BackHandler,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View
} from "react-native";
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import commonStyles from "../../../../styles/commonStyles";
import PopupDialog from 'react-native-popup-dialog';
import Util from "../../../../util/Util";

class EOSNetworkChooseComponent extends React.Component {
    static propTypes = {
        options: PropTypes.array.isRequired,
        defaultValue: PropTypes.object,
        isOpen: PropTypes.bool.isRequired,
        onResult: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    constructor( props ) {
        super( props );

        this.state = {
            isOpen: props.isOpen
        };

        this._onBack = this.onBack.bind( this );
    }

    componentWillMount() {
        BackHandler.addEventListener( 'hardwareBackPress', this._onBack );
    }

    componentWillUnmount() {
        BackHandler.removeEventListener( 'hardwareBackPress', this._onBack );
    }

    componentWillReceiveProps( nextProps ) {
        if (
            nextProps.isOpen !== this.state.isOpen
        ) {
            this.setState( {
                isOpen: nextProps.isOpen
            } );
        }
    }

    onBack() {
        if ( this.state.isOpen ) {
            this.closeModal();

            return true;
        }
        return false;
    }

    closeModal() {
        if ( this.props.onClose ) {
            this.props.onClose();
        }

        this.setState(
            {
                isOpen: false,
            }
        );
    }


    renderItem( { item, index } ) {
        return (
            <TouchableOpacity
                onPress={() => {
                    if ( this.props.onResult ) {
                        this.props.onResult( item )
                    }
                    this.closeModal();
                }}>
                <View style={[ {
                    height: 44,
                    backgroundColor: 'white',
                } ]}>
                    <View style={[ {
                        paddingLeft: 15,
                        paddingRight: 15,
                        flexDirection: 'row',
                        paddingTop: 14
                    }, commonStyles.justAlignCenter ]}>

                        <Text style={[ {
                            fontSize: 16,
                        }, commonStyles.commonTextColorStyle, commonStyles.wrapper
                        ]}>
                            {item.name}
                        </Text>

                        {
                            item.name === (this.props.defaultValue && this.props.defaultValue.name) ?
                                <Image
                                    source={require( '../../../../imgs/all_icon_selected.png' )}
                                    style={[ { width: 16, height: 16, } ]}
                                />
                                :
                                null
                        }
                    </View>
                </View>
            </TouchableOpacity>
        );
    }


    render() {
        const viewHeight = 64;
        const separatorHeight = Util.getDpFromPx( 1 );

        return (
            <Modal
                transparent={true}
                visible={this.state.isOpen}
            >
                <PopupDialog
                    onDismissed={() => {
                        this.closeModal();
                    }}
                    width={Dimensions.get( 'window' ).width}
                    height={Dimensions.get( "window" ).height / 3}
                    show={this.state.isOpen}
                    dialogStyle={{ position: 'absolute', bottom: 0, borderRadius: 0, }}
                >
                    <View style={[ {
                        backgroundColor: 'white',
                    } ]}>
                        <View style={[ commonStyles.mgl_normal, {
                            flexDirection: 'row',
                            height: 44
                        } ]}>
                            <Text style={[ {
                                fontSize: 16,
                                marginTop: 14
                            }, commonStyles.wrapper, commonStyles.commonTextColorStyle ]}>{'选择 Chain'}</Text>
                            <TouchableHighlight
                                underlayColor='#ddd'
                                onPress={() => {
                                    this.closeModal()
                                }}
                                style={[ { height: 44, width: 44 } ]}>
                                <View style={[
                                    commonStyles.wrapper,
                                    commonStyles.justAlignCenter,
                                    {
                                        alignItems: 'center', height: 44, width: 44
                                    }
                                ]}>
                                    <Image
                                        source={require( '../../../../imgs/all_btn_close_modal.png' )}
                                        style={[ { width: 14, height: 14 } ]}
                                    />
                                </View>
                            </TouchableHighlight>
                        </View>
                        <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                        <FlatList
                            data={this.props.options}
                            keyExtractor={( item, index ) => {
                                return index;
                            }}
                            renderItem={( { item, index } ) => {
                                return this.renderItem( { item, index } );
                            }}
                            ItemSeparatorComponent={() => {
                                return (
                                    <View style={[ commonStyles.commonIntervalStyle, {
                                        height: separatorHeight,
                                        marginLeft: 15,
                                    } ]}/>
                                )
                            }}
                            getItemLayout={( data, index ) => (
                                { length: viewHeight, offset: (viewHeight + separatorHeight) * index, index }
                            )}
                        />

                    </View>

                </PopupDialog>

            </Modal>
        );
    }
}

function select( store ) {
    return {}
}

export default connect( select )( EOSNetworkChooseComponent );
