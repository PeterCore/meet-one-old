import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import Icon from "react-native-vector-icons/Ionicons";
import I18n from "../../../../I18n";
import commonStyles from "../../../../styles/commonStyles";
import Keys from "../../../../configs/Keys";

class OperationBottomComponent extends React.Component {
    static propTypes = {
        totalData: PropTypes.array.isRequired,
        isOpenSelected: PropTypes.bool.isRequired,
        onShowSelected: PropTypes.func.isRequired,
        onVote: PropTypes.func.isRequired,
    };

    constructor( props ) {
        super( props );

    }

    componentWillMount() {

    }

    componentWillUnmount() {

    }

    componentWillReceiveProps( nextProps ) {

    }


    render() {

        let selectedNumber = 0;
        this.props.totalData.map( ( bp ) => {
            if ( bp.voting ) {
                selectedNumber += 1
            }
        } )

        let voteText = I18n.t( Keys.Node_Vote );
        let chooseText = I18n.t( Keys.Node_Choose );

        return (
            <View style={[ { flexDirection: 'row', height: 44, backgroundColor: 'white' } ]}>
                <View style={[ { flex: 3, height: 44 } ]}>
                    <TouchableOpacity
                        onPress={() => {
                            if ( this.props.onShowSelected ) {
                                this.props.onShowSelected();
                            }
                        }}>
                        <View style={[ { flexDirection: 'row', height: 44, alignItems: 'center', paddingLeft: 15 } ]}>
                            <Text style={[ commonStyles.commonTextColorStyle, { fontSize: 14 } ]}>{chooseText}</Text>
                            <Text style={[ commonStyles.commonSubTextColorStyle, {
                                fontSize: 14,
                                marginLeft: 10,
                            } ]}>{(this.props.totalData) ? selectedNumber + '/' + '30' : ''}</Text>
                            <Icon
                                style={[ {
                                    marginLeft: 10,
                                } ]}
                                name={this.props.isOpenSelected ? 'ios-arrow-up' : 'ios-arrow-down'}
                                size={14}
                                color={'#999999'}>
                            </Icon>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={[ { flex: 1, height: 44 } ]}>
                    <TouchableOpacity
                        onPress={() => {
                            if ( this.props.onVote ) {
                                this.props.onVote();
                            }
                        }}>
                        <View style={[ { backgroundColor: '#3c4144', height: 44 }, commonStyles.justAlignCenter ]}>
                            <Text style={[ { color: 'white' } ]}>{voteText}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

function select( store ) {
    return {}
}

export default connect( select )( OperationBottomComponent );
