import React from "react";
import dismissKeyboard from "react-native/Libraries/Utilities/dismissKeyboard";
import { Image, Text, TextInput, TouchableOpacity, View, ViewPropTypes } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import lodash from "lodash";
import Util from "../util/Util";
import I18n from "../I18n";
import Keys from "../configs/Keys";
import constStyles from "../styles/constStyles";
import commonStyles from "../styles/commonStyles";

const PropTypes = require( 'prop-types' );

class SearchBar extends React.Component {

    static propTypes = {
        returnKeyType: PropTypes.string,
        onSearchChange: PropTypes.func,
        onEndEditing: PropTypes.func,
        onSubmitEditing: PropTypes.func,
        onClose: PropTypes.func,
        onStartSearch: PropTypes.func,
        onlyShow: PropTypes.bool,
        autoFocus: PropTypes.bool,
        placeholder: PropTypes.string,
        style: ViewPropTypes.style,
        isMain: PropTypes.bool,
        showSubmit: PropTypes.bool
    };

    static defaultProps = {
        onSearchChange: ( text ) => { },
        onEndEditing: ( text ) => { },
        onSubmitEditing: ( text ) => { },
        onClose: () => { },
        onStartSearch: () => { },
        returnKeyType: "search",
        showSubmit: true,
        onlyShow: false,
        autoFocus: false, // 自动
        placeholder: 'Search'
    };

    constructor( props ) {
        super( props );
        this.state = {
            isOnFocus: false,
            text: ''
        };
        this._onFocus = this._onFocus.bind( this );
        this._onBlur = this._onBlur.bind( this );
        this._onClose = this._onClose.bind( this );
        this._onSearchChange = this._onSearchChange.bind( this );
        this._onEndEditing = this._onEndEditing.bind( this );
        this._onSubmitEditing = this._onSubmitEditing.bind( this );
    }

    static _dismissKeyboard() {
        dismissKeyboard()
    }

    blur() {
        this._textInput.blur();
    }

    _onClose() {
        SearchBar._dismissKeyboard();

        if ( this.props.onClose ) {
            this.props.onClose();
        }
    }

    _onFocus() {
        this.setState( { isOnFocus: true } );
        if ( this.props.onFocus ) {
            this.props.onFocus();
        }
    }

    _onBlur() {
        this.setState( { isOnFocus: false } );
        if ( this.props.onBlur ) {
            this.props.onBlur();
        }
        SearchBar._dismissKeyboard();
    }

    _onSearchChange( text ) {
        if ( text !== this.state.text ) {
            this.setState( { text: text } );
        }

        if ( this.props.onSearchChange ) {
            this.props.onSearchChange( text );
        }
    }

    _onEndEditing() {
        if ( this.props.onEndEditing ) {
            this.props.onEndEditing( this.state.text );
        }
    }

    _onSubmitEditing() {
        if ( this.props.onSubmitEditing ) {
            if (!this.props.showSubmit) return
            this.props.onSubmitEditing( this.state.text );
        }
    }

    render() {
        const { returnKeyType } = this.props;

        return (
            <View
                onStartShouldSetResponder={SearchBar._dismissKeyboard}
                style={[
                    {
                        flexDirection: 'row',
                        height: 44,
                        alignItems: 'center'
                    },
                    this.props.style
                ]}
            >

                <View
                    style={
                        [
                            {
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderRadius: 5,
                                paddingLeft: 10,
                                paddingRight: 0,
                                height: 44,
                                backgroundColor: '#fff',
                                borderWidth: Util.getDpFromPx(1),
                                borderColor: '#e8e8e8',
                                shadowOpacity: 0.1,
                                shadowRadius: 10,
                                shadowColor: '#000',
                                shadowOffset: { height: 2, width: 0 }
                            },

                        ]
                    }>

                    <View
                        style={[
                            {
                                flex: 1,
                                backgroundColor: 'transparent',
                                flexDirection: 'row',
                                alignItems: 'center',
                            },
                        ]}>

                        <Image
                            source={require( '../imgs/all_icon_search.png' )}
                            style={[ {
                                marginLeft: 5,
                                width: 14,
                                height: 14,
                            }]}/>


                        <TextInput
                            autoCorrect={false}
                            ref={( c ) => (this._textInput = c)}
                            returnKeyType={returnKeyType}
                            onFocus={this._onFocus}
                            onBlur={this._onBlur}
                            // onChangeText={ lodash.debounce(this._onSearchChange, 250) }
                            onChangeText={ this._onSearchChange }
                            onEndEditing={this._onEndEditing}
                            onSubmitEditing={this._onSubmitEditing}
                            underlineColorAndroid="transparent"
                            placeholder={this.props.placeholder}
                            placeholderTextColor={constStyles.PLACE_HOLDER_TEXT_COLOR}
                            defaultValue={this.state.text}
                            autoFocus={this.props.autoFocus}
                            style={[
                                {
                                    flex: 1,
                                    fontSize: 16,
                                    padding: 0,
                                    marginLeft: 10,
                                    alignItems: 'center',
                                    height: 44
                                },
                                commonStyles.commonTextColorStyle
                            ]} />

                            {
                                (!this.props.showSubmit) && this.state.text.length > 0 ? (
                                    <TouchableOpacity onPress={() => {
                                        this.setState({ text: '' }, () => {
                                            this._onSearchChange('');
                                        })
                                    }}>
                                        <View style={{
                                            marginRight: 15,
                                            marginLeft: 5,
                                            width: 18,
                                            height: 18,
                                            alignItems: 'center',
                                            justifyContent: 'center' }}>
                                            <Icon
                                                name={'md-close'}
                                                size={18}
                                                color={'#999999'}>
                                            </Icon>
                                        </View>
                                    </TouchableOpacity>
                                ) : null
                            }
                    </View>

                    {
                        this.props.showSubmit ? (
                            <TouchableOpacity
                                style={{
                                    paddingVertical: 12,
                                    paddingHorizontal: 16
                                }}
                                onPress={() => {
                                    if ( this.props.onSubmitEditing ) {
                                        this.props.onSubmitEditing( this.state.text );
                                    }
                                }}>
                                <Text style={{
                                    color: '#4A90E2',
                                    fontSize: 14,
                                    lineHeight: 22
                                }}>{I18n.t(Keys.search)}</Text>
                            </TouchableOpacity>
                        ) : null
                    }
                </View>
            </View>
        );
    }
}

export default SearchBar;
