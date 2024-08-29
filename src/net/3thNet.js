/**
 *
 * @param memberId
 * @param callback
 * ignore member Id
 */
import request from "superagent";
import superagent_prefix from "superagent-prefix";
import logger from "./logger/superagent-logger";
import * as env from "../env";
import { getBestNodeServerHost } from "../reducers/meta/metaReducer";

export function netGetExchangeRates(callback) {
    request
        .post('/v1/ticker')
        .query({
            convert: 'CNY',
        })
        .use(superagent_prefix(env.coinmarketcap_api))
        .use(logger)
        .end(callback);
}

export function getAccountActions(data, callback) {
    request
        .post('/account_info/v1/get_account_actions')
        .send(data)
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .end(callback);
}

export function getAccountTokens(data, callback) {
    request
        .post('/account_info/v1/get_account')
        .send(data)
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .end(callback);
}

export function getAccountTokensPromise(data) {
    return (
        request
            .post('/account_info/v1/get_account')
            .send(data)
            .use(superagent_prefix(getBestNodeServerHost()))
            .use(logger)
    )
}

export function getEOSPrice(callback) {
    request
        .get('/eos_price/eos_usd')
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .end(callback);
}

export function getTokenListPrice(callback) {
    request
        .get('/eos_price/tokens_eos')
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .end(callback);
}

// 获取分享口令
export function getShareCode(options, callback) {
    request
        .post('/api/encrypt')
        .send({
            code: JSON.stringify(options),
        })
        .use(superagent_prefix(env.moreAPIDomain))
        .use(logger)
        .end(callback)

}

// 解析分享口令
export function encryptShareCode(code, callback) {
    let encrypt_code = code.trim();
    request
        .get('/api/encrypt')
        .query({
            encrypt_code
        })
        .use(superagent_prefix(env.moreAPIDomain))
        .use(logger)
        .end(callback)
}
