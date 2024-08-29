import * as env from "../src/env";

const ERC20TokenMap = {};

for ( let index = 0; index < env.ERC20Token.length; index++ ) {
    ERC20TokenMap[ env.ERC20Token[ index ].name ] = env.ERC20Token[ index ];
}

export default ERC20TokenMap;