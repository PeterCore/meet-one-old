/*
 * 国内接口的处理逻辑封装
 * @Author: JohnTrump
 * @Date: 2018-06-14 15:12:38
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-07-03 12:53:11
 */
import Keys from "../../configs/Keys";
import I18n from "../../I18n";

export default function ( superagent ) {
    const Request = superagent.Request;
    Request.prototype.apiCNDomainParse = apiDomainParse;
    return superagent;
};

function apiDomainParse( manualParse ) {
    const self = this;
    const oldEnd = this.end;

    this.end = function ( fn ) {
        function attemptParse() {
            return oldEnd.call( self, function ( errTmp, resTmp ) {
                let err1 = errTmp;
                let res1 = resTmp;

                if ( manualParse ) {
                    let { err, res } = manualParse( err1, res1 );
                    err1 = err;
                    res1 = res;
                }

                return fn && fn(
                    parseError( err1, res1 ),
                    res1 ? res1.text : res1,
                    self
                );
            } );
        }

        return attemptParse();
    };

    return this;
}

export function parseError( err, res ) {

    if ( err ) {
        if ( err.status === 404 || !err.status ) {
            return Error( I18n.t( Keys.no_internet_connect ) );
        }
        return err;
    }

    if ( !res ) {
        return err;
    }

    if (!res.text) {
        return Error('res.text');
    } else {
        var resObj = JSON.parse(res.text);
        // if (resObj.code !== 0) {
        //     let error1 = Error(res)
        //     return error1;
        // }
    }

    return null;
}
