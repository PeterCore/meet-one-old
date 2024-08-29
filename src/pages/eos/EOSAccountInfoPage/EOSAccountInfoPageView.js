import React, { Component } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Clipboard, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Button from "react-native-button";
import commonStyles from "../../../styles/commonStyles";
import I18n from "../../../I18n";
import Keys from "../../../configs/Keys";
import TouchableItemComponent from "../../../components/TouchableItemComponent";
import Util from "../../../util/Util";
import Toast from "react-native-root-toast";
import AnalyticsUtil from "../../../util/AnalyticsUtil";

const moment = require('moment-timezone');
const DeviceInfo = require('react-native-device-info');
const timezone = DeviceInfo.getTimezone();

class EOSAccountInfoPageView extends Component {
    static navigationOptions = ( props ) => {
        const { navigation } = props;
        const { state, setParams } = navigation;
        const { params } = state;

        return {
            title: I18n.t( Keys.account_info_title ),
        };
    };

    constructor( props ) {
        super( props );
        this.state = {

        };
    }

    componentWillMount() {
        this.props.updateAccountData(this.props.account);
    }

    componentDidMount() {
        AnalyticsUtil.onEvent('WAaccountdetail');
    }

    render() {
        if ( !this.props.account ) {
            return <View/>
        }

        const account = this.props.account;

        let isOwner = false, isActive = false;

        if (account && account.permissions) {
            account.permissions.forEach(perm => {
                perm.required_auth.keys.forEach(key => {
                    if (perm.perm_name === 'owner') {
                        if (key.key === account.accountPublicKey) {
                            isOwner = true;
                        }
                    }

                    if (perm.perm_name === 'active') {
                        if (key.key === account.accountPublicKey) {
                            isActive = true;
                        }
                    }
                })
            });
        }

        const cpu_limit = account.cpu_limit;
        const cpu_available_ms = cpu_limit && (cpu_limit.available / 1000).toFixed(2);
        const cpu_used_ms = cpu_limit && (cpu_limit.used / 1000).toFixed(2);
        const cpu_max_ms = cpu_limit && (cpu_limit.max / 1000).toFixed(2);

        const net_limit = account.net_limit;
        const net_available_kb = net_limit && (net_limit.available / 1024).toFixed(2);
        const net_used_kb = net_limit && (net_limit.used / 1024).toFixed(2);
        const net_max_kb = net_limit && (net_limit.max / 1024).toFixed(2);

        const cpu_weight = account.total_resources && account.total_resources.cpu_weight;
        const net_weight = account.total_resources && account.total_resources.net_weight;
        const total_weight = (parseFloat(cpu_weight) + parseFloat(net_weight)).toFixed(4);

        const ram_available_kb = account.ram_usage && ((account.ram_quota - account.ram_usage) / 1024).toFixed(2);
        const ram_used_kb = account.ram_usage && (account.ram_usage / 1024).toFixed(2);
        const ram_quota_kb = account.ram_usage && (account.ram_quota / 1024).toFixed(2);

        return (
            <SafeAreaView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                <ScrollView style={[ commonStyles.wrapper, commonStyles.commonBG ]}>
                    <TouchableItemComponent
                        onPress={()=>{
                            Clipboard.setString( account.account_name );
                            Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                        }}
                        title={ I18n.t( Keys.eos_account_name ) }
                        content={account.account_name}
                        headerInterval={true}
                        footerInterval={true}
                        headerIntervalStyle={{}}
                        footerIntervalStyle={{ marginLeft: 15 }}
                        containerStyle={{}}
                        style={{
                            minHeight: 44,
                            height: 44,
                            paddingTop: 0,
                            paddingBottom: 0
                        }}
                        titleStyle={{}}
                        contentStyle={{
                            fontSize: 16,
                            color: '#999999'
                        }}
                        leftElement={null}
                        children={null}
                        hideRightNav={true}
                    />

                    <TouchableItemComponent
                        onPress={()=>{
                            Clipboard.setString( Util.numberStandard(account.currencyBalance, 4) + ' ' + this.props.systemToken );
                            Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                        }}
                        title={ I18n.t( Keys.token_detail_balance ) }
                        content={
                            Util.numberStandard(account.currencyBalance, 4) + ' ' + this.props.systemToken
                        }
                        headerInterval={false}
                        footerInterval={true}
                        headerIntervalStyle={{}}
                        footerIntervalStyle={{ marginLeft: 15 }}
                        containerStyle={{}}
                        style={{
                            minHeight: 44,
                            height: 44,
                            paddingTop: 0,
                            paddingBottom: 0
                        }}
                        titleStyle={{}}
                        contentStyle={{
                            fontSize: 16,
                            color: '#999999'
                        }}
                        leftElement={null}
                        children={null}
                        hideRightNav={true}
                    />

                    <TouchableItemComponent
                        onPress={()=>{
                            Clipboard.setString( moment.utc(account.created).tz(timezone).format( 'YYYY-MM-DD' ) );
                            Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                        }}
                        title={ I18n.t( Keys.account_info_create_time ) }
                        content={
                            moment.utc(account.created).tz(timezone).format( 'YYYY-MM-DD' )
                        }
                        headerInterval={false}
                        footerInterval={true}
                        headerIntervalStyle={{}}
                        footerIntervalStyle={{}}
                        containerStyle={{}}
                        style={{
                            minHeight: 44,
                            height: 44,
                            paddingTop: 0,
                            paddingBottom: 0
                        }}
                        titleStyle={{}}
                        contentStyle={{
                            fontSize: 16,
                            color: '#999999'
                        }}
                        leftElement={null}
                        children={null}
                        hideRightNav={true}
                    />

                    <Text style={styles.label}>
                        { I18n.t( Keys.public_key )  }
                    </Text>

                    <View style={commonStyles.commonIntervalStyle} />

                    <View style={{ position: 'relative' }}>
                        <TouchableOpacity onPress={()=>{
                            Clipboard.setString( account.accountPublicKey );
                            Toast.show( I18n.t( Keys.copy_success ), { position: Toast.positions.CENTER } );
                        }}>
                            <Text style={[ styles.pk_style, commonStyles.commonTextStyle, commonStyles.monospace ]} numberOfLines={5}>
                                {account.accountPublicKey}
                            </Text>
                        </TouchableOpacity>

                        {
                            (isOwner || isActive)
                            ?
                            <View style={[
                                {
                                    position: 'absolute',
                                    paddingHorizontal: 2,
                                    paddingVertical: 2,
                                    fontSize: 10,
                                    bottom: 15,
                                    right: 15,
                                    backgroundColor: '#4a90e2',
                                    borderRadius: 2,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                },
                                isOwner ?
                                { backgroundColor: '#1ace9a' }
                                :
                                { }
                            ]}>
                                <Text style={{
                                    fontSize: 12,
                                    color: '#ffffff'
                                }}>{ isOwner ? 'Owner' : 'Active' }</Text>
                            </View>
                            :
                            null
                        }
                    </View>

                    <TouchableItemComponent
                        onPress={()=>{
                            this.props.navigation.navigate( "EOSAuthManagePage", {
                                primaryKey: account.primaryKey
                            } );
                        }}
                        title={ I18n.t( Keys.account_info_auth_manage ) }
                        content={''}
                        headerInterval={true}
                        footerInterval={true}
                        headerIntervalStyle={{ marginLeft: 15 }}
                        footerIntervalStyle={{}}
                        containerStyle={{}}
                        style={{
                            minHeight: 44,
                            height: 44,
                            paddingTop: 0,
                            paddingBottom: 0
                        }}
                        titleStyle={{}}
                        contentStyle={{
                            fontSize: 16,
                            color: '#999999'
                        }}
                        leftElement={null}
                        children={null}
                        hideRightNav={false}
                    />

                    <Text style={styles.label}>
                        { I18n.t( Keys.resource ) }
                    </Text>

                    <TouchableItemComponent
                        onPress={()=>{
                            this.props.navigation.navigate( "EOSResourcesPage", {
                                primaryKey: account.primaryKey
                            } );
                        }}
                        title={ I18n.t( Keys.delegated_balance ) }
                        content={`${total_weight} ${this.props.systemToken}`}
                        headerInterval={true}
                        footerInterval={true}
                        headerIntervalStyle={{}}
                        footerIntervalStyle={{ marginLeft: 15 }}
                        containerStyle={{}}
                        style={{
                            minHeight: 44,
                            height: 44,
                            paddingTop: 0,
                            paddingBottom: 0
                        }}
                        titleStyle={{}}
                        contentStyle={{
                            fontSize: 16,
                            color: '#323232'
                        }}
                        leftElement={null}
                        children={null}
                        hideRightNav={false}
                    />

                    {/* 已占用 */}
                    <ProgressItem
                        titleText={ I18n.t( Keys.account_info_cpu_used ) }
                        contentText={`${cpu_used_ms} ms / ${cpu_max_ms} ms`}
                        value={cpu_used_ms}
                        max={cpu_max_ms}
                    />
                    {/* 余量 */}
                    {/* <ProgressItem
                        titleText={ I18n.t( Keys.account_info_cpu_available ) }
                        contentText={`${cpu_available_ms} ms / ${cpu_max_ms} ms`}
                        value={cpu_available_ms}
                        max={cpu_max_ms}
                    /> */}

                    <View style={[commonStyles.commonIntervalStyle, { marginLeft: 15 }]} />

                    {/* 已占用 */}
                    <ProgressItem
                        titleText={ I18n.t( Keys.account_info_net_used ) }
                        contentText={`${net_used_kb} KB / ${net_max_kb} KB`}
                        value={net_used_kb}
                        max={net_max_kb}
                    />
                    {/* 余量 */}
                    {/* <ProgressItem
                        titleText={ I18n.t( Keys.account_info_net_available ) }
                        contentText={`${net_available_kb} KB / ${net_max_kb} KB`}
                        value={net_available_kb}
                        max={net_max_kb}
                    /> */}

                    <View style={[commonStyles.commonIntervalStyle]} />

                    <TouchableItemComponent
                        onPress={()=>{
                            if (this.props.netType === 'EOS') {
                                this.props.navigation.navigate( "RAMExchangePage", {
                                    primaryKey: account.primaryKey
                                });
                            } else {
                                this.props.navigation.navigate( "SideChainRamExchangePage", {
                                    primaryKey: account.primaryKey
                                });
                            }
                        }}
                        title={ I18n.t( Keys.account_info_holdingRAM ) }
                        content={`${ram_quota_kb} KB`}
                        headerInterval={true}
                        footerInterval={true}
                        headerIntervalStyle={{}}
                        footerIntervalStyle={{ marginLeft: 15 }}
                        containerStyle={{ marginTop: 10 }}
                        style={{
                            minHeight: 44,
                            height: 44,
                            paddingTop: 0,
                            paddingBottom: 0
                        }}
                        titleStyle={{}}
                        contentStyle={{
                            fontSize: 16,
                            color: '#323232'
                        }}
                        leftElement={null}
                        children={null}
                        hideRightNav={false}
                    />

                    {/* 已用 */}
                    <ProgressItem
                        titleText={ I18n.t( Keys.account_info_ram_used ) }
                        contentText={`${ram_used_kb} KB / ${ram_quota_kb} KB`}
                        value={ram_used_kb}
                        max={ram_quota_kb}
                    />
                    {/* 余量 */}
                    {/* <ProgressItem
                        titleText={ I18n.t( Keys.account_info_ram_available ) }
                        contentText={`${ram_available_kb} KB / ${ram_quota_kb} KB`}
                        value={ram_available_kb}
                        max={ram_quota_kb}
                    /> */}

                    <View style={[commonStyles.commonIntervalStyle]} />

                    <TouchableItemComponent
                        onPress={()=>{
                            this.props.navigation.navigate( "EOSWalletInfoPage", {
                                primaryKey: this.props.account.primaryKey,
                            } );
                        }}
                        title={ I18n.t( Keys.account_info_advanced ) }
                        content={''}
                        headerInterval={true}
                        footerInterval={true}
                        headerIntervalStyle={{}}
                        footerIntervalStyle={{}}
                        containerStyle={{ marginTop: 10, marginBottom: 40 }}
                        style={{
                            minHeight: 44,
                            height: 44,
                            paddingTop: 0,
                            paddingBottom: 0
                        }}
                        titleStyle={{}}
                        contentStyle={{
                            fontSize: 16,
                            color: '#323232'
                        }}
                        leftElement={null}
                        children={null}
                        hideRightNav={false}
                    />

                </ScrollView>
            </SafeAreaView>
        );
    }
}

class ProgressItem extends Component {

    constructor( props ) {
        super( props );
    }

    render() {

        let percent = ((this.props.value / this.props.max) * 100).toFixed(0);

        let barColor = '#1ace9a';
        if (percent > 90) {
            barColor = "#f65858";
        } else if (percent > 70) {
            barColor = "#f6bc58";
        }

        if (percent > 100) {
            percent = '100%';
        } else if (percent < 0) {
            percent = '0%';
        } else {
            percent = percent + '%';
        }

        return (
            <View style={{ paddingHorizontal: 15, backgroundColor: '#ffffff' }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 24,
                    marginTop: 10
                }}>
                    <Text style={{
                        fontSize: 16,
                        color: '#323232'
                    }}>
                        {this.props.titleText}
                    </Text>

                    <Text style={{
                        fontSize: 14,
                        color: '#999999'
                    }}>
                        {this.props.contentText}
                    </Text>
                </View>

                {/* progressbar */}
                <View style={[{
                    marginTop: 10,
                    marginBottom: 15,
                    width: '100%',
                    height: 10,
                    borderRadius: 2,
                    backgroundColor: '#f5f5f5'
                }]}>
                    <View style={[{
                        width: percent,
                        height: 10,
                        borderRadius: 2,
                        backgroundColor: barColor
                    }]}></View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        color: '#999999',
        marginLeft: 15,
        marginTop: 20,
        marginBottom: 10
    },
    pk_style: {
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: '#ffffff',
        fontSize: 16,
        lineHeight: 24
    }
});

export default EOSAccountInfoPageView;
