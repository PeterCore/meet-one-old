import ethers from 'ethers';

const { HDNode, providers, utils, Wallet } = ethers;

const ETHWalletUtil = {
    optHexStringWith64Len: function ( hexString ) {
        let tmpString = hexString;
        if ( hexString.startsWith( '0x' ) ) {
            tmpString = tmpString.substring( 2 );
        }

        const length = tmpString.length;
        for ( let index = 0; index < 64 - length; index++ ) {
            tmpString = '0' + tmpString;
        }

        tmpString = '0x' + tmpString;

        return tmpString;
    },

    optHexStringRemove64Len: function ( hexString ) {
        let tmpString = hexString;
        if ( hexString.startsWith( '0x' ) ) {
            tmpString = tmpString.substring( 2 + 24 );
        }

        tmpString = '0x' + tmpString;

        return tmpString;
    },

    formatDisplayETHBalance: function ( weiBalance, options ) {
        let balance1 = parseFloat( utils.formatEther( weiBalance ) );
        balance1 = balance1 * 100000;
        balance1 = parseInt( balance1 );
        balance1 = utils.formatUnits( balance1, 5, options );

        if ( balance1 === '0.0' ) {
            return '0';
        }

        return balance1;
    },

    formatDisplayTokenBalance: function ( weiBalance, decimals, options ) {
        let balance1 = parseFloat( utils.formatUnits( weiBalance, decimals ) );
        balance1 = balance1 * 100000;
        balance1 = parseInt( balance1 );
        balance1 = utils.formatUnits( balance1, 5, options );

        if ( balance1 === '0.0' ) {
            return '0';
        }

        return balance1;
    },

    formatDisplayMoneyValue: function ( worthValueTotalFloat, options ) {
        let balance1 = worthValueTotalFloat * 100;
        balance1 = parseInt( balance1 );
        balance1 = utils.formatUnits( balance1, 2, options );

        if ( balance1 === '0.0' ) {
            return '0';
        }

        return balance1;
    },

    formatETHAddressShortForDisplay: function ( address ) {
        const header = address.substr( 2, 5 );
        const footer = address.substr( address.length - 5, 5 );

        return '0x' + header + '...' + footer;
    },

};

export default ETHWalletUtil;