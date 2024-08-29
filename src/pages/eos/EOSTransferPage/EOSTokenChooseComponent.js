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
import commonStyles from "../../../styles/commonStyles";
import PopupDialog from 'react-native-popup-dialog';
import Util from "../../../util/Util";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";

class EOSTokenChooseComponent extends React.Component {
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
                    backgroundColor: 'white',
                } ]}>
                    <View style={[ {
                        paddingLeft: 15,
                        paddingRight: 15,
                        flexDirection: 'row',
                        paddingVertical: 10,
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    } ]}>
                        <View>
                            <Text style={[ {
                                fontSize: 16,
                            }, commonStyles.commonTextColorStyle, commonStyles.wrapper
                            ]}>
                                {item.name}
                            </Text>

                            <Text style={{
                                color: '#888888',
                                fontSize: 12
                            }}>
                                {item.publisher}
                            </Text>
                        </View>
                        {
                            item.name === (this.props.defaultValue && this.props.defaultValue.name) ?
                                <Image
                                    source={require( '../../../imgs/all_icon_selected.png' )}
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
                    dialogStyle={{ position: 'absolute', bottom: 0, borderRadius: 0, paddingBottom: 100 }}
                >
                    <View style={[ {
                        backgroundColor: 'white',
                    } ]}>
                        <View style={[ commonStyles.mgl_normal, {
                            flexDirection: 'row',
                            height: 44,
                            marginLeft: 15
                        } ]}>
                            <Text style={[ {
                                fontSize: 16,
                                marginTop: 14
                            }, commonStyles.wrapper, commonStyles.commonTextColorStyle ]}>{ I18n.t( Keys.choose_token ) }</Text>
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
                                        source={require( '../../../imgs/all_btn_close_modal.png' )}
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
                                        height: Util.getDpFromPx( 1 ),
                                        marginLeft: 15,
                                    } ]}/>
                                )
                            }}
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

export default connect( select )( EOSTokenChooseComponent );
