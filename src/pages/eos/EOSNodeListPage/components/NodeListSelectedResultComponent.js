import React from "react";
import {
    BackHandler,
    Dimensions,
    FlatList,
    Modal,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View
} from "react-native";
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import PopupDialog from 'react-native-popup-dialog';
import Icon from "react-native-vector-icons/Ionicons";
import OperationBottomComponent from "./OperationBottomComponent";
import I18n from "../../../../I18n";
import Util from "../../../../util/Util";
import commonStyles from "../../../../styles/commonStyles";
import Keys from "../../../../configs/Keys";

class NodeListSelectedResultComponent extends React.Component {
    static propTypes = {
        totalData: PropTypes.array.isRequired,
        isOpen: PropTypes.bool.isRequired,
        onRemoveNode: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
        onVote: PropTypes.func.isRequired,
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
        if ( !item.voting ) {
            return
        }
        return (
            <View style={[ {
                flex: 1,
                backgroundColor: 'white',
                paddingLeft: 15,
                paddingRight: 15,
                flexDirection: 'row',
                height: 44,
                alignItems: 'center'
            } ]}>
                <Text style={[ commonStyles.commonTextColorStyle, { fontSize: 18 }, commonStyles.wrapper ]}>
                    {this.props.bpProducerDic[ item.owner ] ? this.props.bpProducerDic[ item.owner ].organization_name : item.owner}
                </Text>

                <View>
                    <TouchableOpacity
                        onPress={() => {
                            if ( this.props.onRemoveNode ) {
                                this.props.onRemoveNode( item, item.votingIndex );
                            }
                        }}>
                        <Icon
                            style={[ {
                                marginLeft: 10,
                            } ]}
                            name={'ios-remove-circle-outline'}
                            size={30}
                            color={'#3c4144'}>
                        </Icon>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    render() {
        const viewHeight = 44;
        const separatorHeight = Util.getDpFromPx( 1 );

        let voteList = I18n.t( Keys.Node_Vote_List );

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
                    height={Dimensions.get( "window" ).height / 5 * 2}
                    show={this.state.isOpen}
                    dialogStyle={{ position: 'absolute', bottom: 0, borderRadius: 0, }}
                >
                    <View style={[ {
                        backgroundColor: 'white',
                    }, commonStyles.wrapper ]}>
                        <View style={[ commonStyles.mgl_normal, {
                            flexDirection: 'row',
                            height: 44
                        } ]}>
                            <Text style={[ {
                                fontSize: 16,
                                marginTop: 14
                            }, commonStyles.wrapper, commonStyles.commonTextColorStyle ]}>{voteList}</Text>
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
                                    <Icon
                                        style={[ {} ]}
                                        name={'md-close'}
                                        size={28}
                                        color={'#cccccc'}>
                                    </Icon>
                                </View>
                            </TouchableHighlight>
                        </View>
                        <View style={[ commonStyles.commonIntervalStyle, {} ]}/>

                        <View style={[ commonStyles.wrapper ]}>
                            <FlatList
                                data={this.props.totalData}
                                keyExtractor={( item, index ) => {
                                    return index + '';
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

                        <OperationBottomComponent
                            totalData={this.props.totalData}
                            isOpenSelected={true}
                            onShowSelected={() => {
                                this.closeModal();
                            }}
                            onVote={() => {
                                if ( this.props.onVote ) {
                                    this.props.onVote();
                                }

                                this.closeModal();
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

export default connect( select )( NodeListSelectedResultComponent );
