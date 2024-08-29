/*
 * the request of API in Discovery module
 * @Author: JohnTrump
 * @Date: 2018-06-14 14:14:48
 * @Last Modified by: Dai.Bing
 * @Last Modified time: 2018-12-18 17:52:01
 */
import request from 'superagent';
import superagent_prefix from 'superagent-prefix';
import logger from './logger/superagent-logger';
import apiCNDomainParse from './parse/apiCNDomainParse';
import Util from '../util/Util';
import header from './header/headerRequest';

import {
    getBestNodeServerHost,
} from '../reducers/meta/metaReducer';

header(request);
apiCNDomainParse(request);

// 获取游戏中心游戏列表
export function getGameList(
    { sort = 'hot', page = 1, category = 0 },
    callback
) {
    request
        .get('/v2/rn/gamecenter')
        .use(superagent_prefix(getBestNodeServerHost()))
        .query({ sort, page, category })
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

// 根据ids获取游戏中心列表
export function getGameListByIds(ids = [], callback) {
    request
        .get('/v2/rn/gamecenter/recent')
        .use(superagent_prefix(getBestNodeServerHost()))
        .query({ ids })
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

// 获取游戏中心推荐游戏列表
export function getGameFeatured(callback) {
    request
        .get('/v2/rn/gamecenter/featured')
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

// 获取Dapps中心热门应用
export function getDappsFeatured(callback) {
    request
        .get('/v2/rn/dappscenter/featured')
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

// 根据搜索获取游戏列表
export function getGameBySearch(
    { key = '', page = 1, sort = 'hot', category = 0 },
    callback
) {
    request
        .get('/v2/rn/gamecenter/search')
        .use(superagent_prefix(getBestNodeServerHost()))
        .query({ key, page, sort, category })
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

// 获取可切换的节点列表
export function getEOSNetworks( data, callback) {
    request
        .get('/rn/eosnetwork')
        .use(superagent_prefix(getBestNodeServerHost()))
        .query(data)
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

// 获取历史记录节点
export function getHistoryNetwork(data, callback) {
    request
        .get('/rn/historynetwork')
        .use(superagent_prefix(getBestNodeServerHost()))
        .query(data)
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

// 获取Token列表
export function getEOSTokens( data, callback) {
    request
        .get('/rn/supporttokens')
        .use(superagent_prefix(getBestNodeServerHost()))
        .query(data)
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

// 获取交易所列表
export function getExchangeList( callback) {
    request
        .get('/rn/supportexchanges')
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

export function getTokenPrice ( data, callback) {
    request
        .get('/token/price')
        .use(superagent_prefix(getBestNodeServerHost()))
        .query(data)
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

// 获取 Token 详情
export function getTokenInfo(id = 1, callback) {
    request
        .get('/rn/token')
        .query({ id })
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

// 获取侧链切换选项
export function getSideChainData(callback) {
    request
        .get('/rn/sidechain_chainlist')
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

// 获取节点列表
export function getNodeList(callback) {
    request
        .get('/v2/nodes')
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}
// 根据 id 获取节点详情
export function getNodeDetail(id = 1, callback) {
    request
        .get('/v2/nodes/detail')
        .query({ id })
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .apiCNDomainParse()
        .end(callback);
}
// 获取投票代理列表
export function getVoteProxyList(callback) {
    request
        .get('/nodes/proxies')
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

// 服务端注册新账号
export function netNewAccount(data, callback) {
    request
        .get('/rn/new_eos_account')
        .query(data)
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

// 获取Discovery启动页面参数等
export function netDiscovery(data, callback) {
    request
        .get('/v2/rn/discovery')
        .query(data)
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

// 获取空钱包页是否显示合约注册
export function netEmptyWallet(callback) {
    request
        .get('/rn/emptywallet')
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

// CPU爆了浮动按钮和资源页一元租赁配置
export function netCpubaoleBtn(callback) {
    request
        .get('/rn/cpubaole_btn_info')
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

// 注册页如何获取邀请码配置
export function getInviteCodeBtn(callback) {
    request
        .get('/rn/how_to_get_invitecode')
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

export function getBOSAccount(data, callback) {
    request
        .post('/rn/get_bos_accounts')
        .send(data)
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}

/**
 * 获取糖果推荐
 * @param {Function} callback 回调函数
 */
export function netCandyFeatured(callback) {
    request
        .get('/candies/featured')
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .apiCNDomainParse()
        .end(callback);
}

/**
 * 获取糖果列表
 * @param {Object} {type = 'airdrop', sort = 'timeline', page = 1, time = new Date()}
 * @param {Function} callback 回调函数
 */
export function netCandyList(
    { type = 'airdrop', sort = 'timeline', page = 1, time = Util.formatDate() },
    callback
) {
    if (type === 'airdrop') {
        // when the type is 'airdrop'
        request
            .get('/candies')
            .query({ sort, page, time })
            .use(superagent_prefix(getBestNodeServerHost()))
            .use(logger)
            .apiCNDomainParse()
            .end(callback);
    } else {
        // when the type is 'snapshot'
        request
            .get('/candies/snapshot')
            .query({ sort, page, time })
            .use(superagent_prefix(getBestNodeServerHost()))
            .use(logger)
            .apiCNDomainParse()
            .end(callback);
    }
}

/**
 * 根据id获取糖果信息详情
 * @param {String} id 糖果id
 * @param {Function} callback 回调函数
 */
export function netCandyDetail(id = 20, callback) {
    request
        .get('/candies/detail')
        .query({ id })
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .apiCNDomainParse()
        .end(callback);
}

/**
 * 获取分享的图片
 * @param {number} [id=20] 糖果id
 * @param {Function} callback 回调函数
 */
export function netCandyDetailShare(id = 20, callback) {
    request
        .get('/wechat/candy/share')
        .query({
            id,
            is_meetone: 1
        })
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .apiCNDomainParse()
        .end(callback);
}
