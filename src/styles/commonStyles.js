/**
 * @class StylesCommon
 * @desc 通用样式
 */
import React, { Dimensions, StyleSheet, Platform } from "react-native";
import constStyles from "./constStyles";
import Util from "../util/Util";

let totalWidth = Dimensions.get( 'window' ).width;
let totalHeight = Dimensions.get( 'window' ).height;
let textSize = totalWidth / 18;
let readingUITitleHeight = textSize * 6;
let diaryBodyLine = totalHeight / textSize - 6;
let returnButtonHeight = textSize * 5;

const commonStyles = StyleSheet.create(
    {
        monospace: {
            fontFamily: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
            // letterSpacing: 1
        },
        wrapper: {
            flex: 1
        },
        commonBG: {
            backgroundColor: '#fafafa'
        },
        paddingCommon: {
            paddingTop: 20,
            paddingBottom: 20,
            paddingLeft: 20,
            paddingRight: 20
        },
        marginCommon: {
            marginTop: 20,
            marginBottom: 20,
            marginLeft: 20,
            marginRight: 20
        },
        mgt_normal: {
            marginTop: 20
        },
        mgb_normal: {
            marginBottom: 20
        },
        mgl_normal: {
            marginLeft: 20
        },
        mgr_normal: {
            marginRight: 20
        },
        pdt_normal: {
            paddingTop: 20
        },
        pdb_normal: {
            paddingBottom: 20
        },
        pdl_normal: {
            paddingLeft: 20
        },
        pdr_normal: {
            paddingRight: 20
        },

        justAlignCenter: {
            alignItems: 'center',
            justifyContent: 'center'
        },
        modalBoxStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
            width: 100,
            backgroundColor: 'rgba(0, 0, 0, 0)'
        },
        commonTextColorStyle: {
            color: '#323232'
        },
        commonTextStyle: {
            fontSize: 16,
            color: '#323232'
        },
        commonInputTextStyle: {
            color: '#323232',
            fontSize: 20
        },

        commonSubTextColorStyle: {
            color: '#888888'
        },
        commonSubTextStyle: {
            color: '#888888',
            fontSize: 16
        },
        commonSmallSubTextStyle: {
            color: '#888888',
            fontSize: 14
        },
        commonIntervalStyle: {
            height: Util.getDpFromPx( 1 ),
            backgroundColor: '#e8e8e8'
        },
        newsIntervalStyle: {
            height: 10,
            backgroundColor: '#f5f5f5'
        },
        commonBorderTop: {
            borderTopWidth: Util.getDpFromPx( 1 ),
            borderTopColor: '#e8e8e8',
        },

        commonBorderBottom: {
            borderBottomWidth: Util.getDpFromPx( 1 ),
            borderBottomColor: '#e8e8e8',
        },
        commonInput: {
            height: 44,
            fontSize: 16,
            backgroundColor: '#ffffff',
        },
        jsWebView: {
            height: 0,
            width: 0,
            padding: 0,
            opacity: 0,
            backgroundColor: 'white'
        },

        buttonContainerStyle: {
            paddingLeft: 10,
            paddingRight: 10,
            height: 44,
            overflow: 'hidden',
            backgroundColor: constStyles.THEME_COLOR,
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonContainerDisabledStyle: {
            paddingLeft: 10,
            paddingRight: 10,
            height: 44,
            overflow: 'hidden',
            backgroundColor: '#B5B5B5',
            alignItems: 'center',
            justifyContent: 'center'
        },

        buttonRoundContainerStyle: {
            paddingLeft: 24,
            paddingRight: 24,
            height: 44,
            overflow: 'hidden',
            borderRadius: 22,
            flexDirection: 'row',
            backgroundColor: constStyles.THEME_COLOR,
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonRoundContainerDisabledStyle: {
            paddingLeft: 24,
            paddingRight: 24,
            height: 44,
            overflow: 'hidden',
            borderRadius: 22,
            backgroundColor: '#B5B5B5',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
        },

        buttonContentStyle: {
            fontSize: 18,
            color: 'white',
            fontWeight: 'normal'
        },
        buttonDisabledStyle: {
            fontSize: 18,
            color: 'white',
            fontWeight: 'normal'
        },
        top_info_right_btn: {
            marginRight: 15,
            color: '#323232',
            fontSize: 16
        },
        top_info_left_btn: {
            marginLeft: 15,
            color: '#323232',
            fontSize: 16
        },
        bottomButton: {
            fontSize: 18,
            lineHeight: 44,
            color: "#fff",
            textAlign: "center",
            backgroundColor: "#3D4144",
            position: "absolute",
            bottom: 5,
            width: "94%",
            left: "3%",
        },

        //eos
        // modal的样式
        modalStyle: {
            // backgroundColor:'#ccc',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
        },
        // modal上子View的样式
        subView: {
            marginLeft: 60,
            marginRight: 60,
            backgroundColor: '#fff',
            alignSelf: 'stretch',
            justifyContent: 'center',
            borderRadius: 10,
            borderWidth: 0.5,
            borderColor: '#ccc',
        },
        // 标题
        titleText: {
            marginTop: 10,
            marginBottom: 5,
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        // 内容
        contentText: {
            margin: 10,
            paddingBottom: 20,
            paddingTop: 10,
            fontSize: 14,
            textAlign: 'center',
        },
        // 水平的分割线
        horizontalLine: {
            marginTop: 5,
            height: 1,
            backgroundColor: '#ccc',
        },
        // 按钮
        buttonView: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        buttonStyle: {
            flex: 1,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
        },
        // 竖直的分割线
        verticalLine: {
            width: 1,
            height: 44,
            backgroundColor: '#ccc',
        },
        buttonText: {
            fontSize: 16,
            color: '#3393F2',
            textAlign: 'center',
        },

    }
);
export default commonStyles;
