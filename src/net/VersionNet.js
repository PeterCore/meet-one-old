import superagent_prefix from "superagent-prefix";
import request from "superagent";
import logger from "./logger/superagent-logger";
import apiCNDomainParse from "./parse/apiCNDomainParse";
import header from "./header/headerRequest";
import {getBestNodeServerHost} from "../reducers/meta/metaReducer";

header( request );
apiCNDomainParse(request);

/**
 * 检查更新
 * @author JohnTrump
 */
export function fetchVersionList( callback ) {
    request.get('/rn/updating')
        .use( superagent_prefix(getBestNodeServerHost()))
        .use( logger )
        .headerRequest()
        .apiCNDomainParse()
        .end( callback );
}

/**
 * 上报信息
 * @author JohnTrump
 */
export function getInfo({accountName, publicKey}) {
    request.post('/rn/get_info')
        .use( superagent_prefix(getBestNodeServerHost()))
        .send({accountName, publicKey})
        .use( logger )
        .headerRequest()
        .apiCNDomainParse()
        .end( null );
}

/**
 * 获取当前的全局变量配置
 */
export function fetchConfig(callback) {
    request.get('/rn/config')
        .use(superagent_prefix(getBestNodeServerHost()))
        .use(logger)
        .headerRequest()
        .apiCNDomainParse()
        .end(callback);
}
