import { Image, StyleSheet, Text, View, ViewPropTypes } from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/Ionicons";
import commonStyles from "../styles/commonStyles";
import Util from "../util/Util";
import PropTypes from 'prop-types';

class ImageWithPlaceHolder extends React.Component {
    static propTypes = {
        style: ViewPropTypes.style,
        placeholderForIcon: PropTypes.string,
        placeholderForSource: PropTypes.oneOfType( [
            PropTypes.number,
            PropTypes.shape( {
                uri: PropTypes.string,
            } ),
        ] ),
        source: PropTypes.oneOfType( [
            PropTypes.number,
            PropTypes.shape( {
                uri: PropTypes.string,
            } ),
        ] ),
        emptyTip: PropTypes.string,
        emptyTipColor: PropTypes.string
    };

    constructor( props ) {
        super( props );
        this.state = {};
    }


    calcIconSize( style ) {
        let width = null;
        let height = null;
        if ( style ) {
            if ( Util.isArray( style ) ) {
                for ( let index = 0; index < style.length; index++ ) {
                    const result = this.calcIconSize( style[ index ] );

                    width = result.width ? result.width : width;
                    height = result.height ? result.height : height;
                }
            } else {
                width = style.width ? style.width : width;
                height = style.height ? style.height : height;
            }
        }

        return { width: width, height: height };
    }

    renderImage( isNeedBackground, isAbsolute ) {
        return (
            <View
                style={[ isAbsolute ? { position: 'absolute' } : {}, this.props.style, commonStyles.justAlignCenter ]}>
                <Image
                    style={[ isNeedBackground ? { backgroundColor: 'transparent' } : {}, this.props.style, ]}
                    source={this.props.source}
                />
                {
                    !this.props.source && this.props.emptyTip ?
                        <Text
                            style={{
                                color: this.props.emptyTipColor ? this.props.emptyTipColor : '#fff',
                                backgroundColor: '#00000000',
                                fontSize: 10,
                                position: 'absolute',
                                textAlign: 'center'
                            }}
                        >
                            {this.props.emptyTip}
                        </Text>
                        :
                        null
                }
            </View>
        );
    }

    render() {
        if ( this.props.placeholderForIcon ) {
            const { width, height } = this.calcIconSize( this.props.style );
            let size = (width > height ? height : width) / 3 * 2;

            if ( size > 150 ) {
                size = 150;
            }

            return (
                <View
                    style={[ { backgroundColor: 'transparent' }, this.props.style, commonStyles.justAlignCenter ]}>
                    <Icon
                        style={[ {} ]}
                        name={this.props.placeholderForIcon}
                        size={size}
                        color={'white'}>
                    </Icon>

                    {this.renderImage( false, true )}
                </View>
            );
        } else if ( this.props.placeholderForSource ) {
            return (
                <View
                    style={[ { backgroundColor: 'transparent' }, this.props.style, commonStyles.justAlignCenter ]}
                >
                    <Image
                        style={[ this.props.style, ]}
                        resizeMode={Image.resizeMode.contain}
                        source={this.props.placeholderForSource}
                    >
                    </Image>
                    {this.renderImage( false, true )}
                </View>
            );
        } else {
            return this.renderImage( true, false )
        }
    }
}

const styles = StyleSheet.create( {} );

export default ImageWithPlaceHolder;
