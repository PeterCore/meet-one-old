import React, { Component } from 'react'
import { connect } from "react-redux";
import { NetInfo } from "react-native";
import * as env from "./env";

class EtherScanSocket extends Component {
    constructor( props ) {
        super( props );

        this.state = {
            ws: null,
            connectionInfo: null,
            isNetConnected: false,
            isWebSocketConnecting: false,
            isWebSocketConnected: false,
        };

        this._handleConnectivityChange = this.handleConnectivityChange.bind( this );
    }

    componentDidMount() {
        NetInfo.isConnected.addEventListener(
            'connectionChange',
            this._handleConnectivityChange
        );

        this.connect();
    }

    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener(
            'connectionChange',
            this._handleConnectivityChange
        );

        this.closeConnect();
    }

    shouldComponentUpdate( nextProps, nextState ) {
        if ( nextState.isWebSocketConnected && !this.state.isWebSocketConnected ) {
            this.startPing();
        }

        if ( !this.state.isNetConnected && nextState.isNetConnected ) {
            this.connect();
        }

        if ( this.state.isNetConnected && !nextState.isNetConnected ) {
            this.closeConnect();
        }

        return false;
    }

    render() {
        return null
    }

    handleConnectivityChange( isConnected ) {
        console.log( "EtherScanSocket: handleFirstConnectivityChange: " + isConnected );
        this.setState( {
            isNetConnected: isConnected
        } );
    }

    connect() {
        if ( this.state.ws ) {
            this.closeConnect();
        }

        NetInfo.isConnected.fetch().done( ( isConnected ) => {
            if ( isConnected ) {
                console.log( "EtherScanSocket connect" );

                const ws = new WebSocket( env.eth_web_socket );
                this.setState( {
                    ws: ws,
                    isWebSocketConnecting: true,
                    isWebSocketConnected: false
                } );

                ws.onopen = () => {
                    console.log( "EtherScanSocket ws.onopen" );

                    this.setState( {
                        ws: ws,
                        isWebSocketConnecting: false,
                        isWebSocketConnected: true
                    } );
                };
                ws.onmessage = ( event ) => {
                    console.log( "EtherScanSocket ws.onmessage event: " + event );
                    console.log( event.data )
                };
                ws.onerror = ( error ) => {
                    console.log( "EtherScanSocket ws.onerror error: " + error );

                    this.closeConnect();
                };
                ws.onclose = () => {
                    console.log( "EtherScanSocket ws.onclose" );

                    this.closeConnect();
                };
            }
        } );
    }

    closeConnect() {
        if ( this.state.ws ) {
            if ( this.state.isWebSocketConnecting || this.state.isWebSocketConnected ) {
                this.stopPing();

                console.log( "EtherScanSocket close connect" );

                this.state.ws.close();

                this.state.ws.onopen = null;
                this.state.ws.onmessage = null;
                this.state.ws.onerror = null;
                this.state.ws.onclose = null;

                this.setState( {
                    ws: null,
                    isWebSocketConnecting: false,
                    isWebSocketConnected: false
                } );
            }
        }
    }

    startPing() {
        console.log( "EtherScanSocket startPing" );

        this.pingTimer && clearTimeout( this.pingTimer );

        this.pingTimer = setTimeout(
            () => {
                console.log( "EtherScanSocket doPing" );
                this.send( '{"event": "ping"}' );

                this.startPing();
            },
            5 * 1000
        );
    }

    stopPing() {
        console.log( "EtherScanSocket stopPing" );
        this.pingTimer && clearTimeout( this.pingTimer );
    }

    send( data ) {
        if ( this.state.ws ) {
            this.state.ws.send( data )
        }
    }
}

function select( store ) {
    return {};
}

export default connect( select )( EtherScanSocket );
