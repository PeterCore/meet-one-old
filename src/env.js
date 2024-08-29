import ERC20TokenProduction from "../data/ERC20TokenProduction";
import ERC20TokenRopsent from "../data/ERC20TokenRopsent";

// process.env.NODE_ENV === 'production'
const eth_env = 'production';

export const apiDomain = "https://api.meet.one";

export const ethers_network = (eth_env === 'production') ? 'mainnet' : 'ropsten';
export const tx_explorer = (eth_env === 'production') ? 'https://etherscan.io/tx/' : 'https://ropsten.etherscan.io/tx/';
export const eth_api = (eth_env === 'production') ? 'https://api.etherscan.io' : 'https://api-ropsten.etherscan.io';
export const eth_web_socket = (eth_env === 'production') ? 'wss://socket.etherscan.io/wshandler' : 'wss://socket.etherscan.io/wshandler';

export const eth_api_token = 'PN3MCPIZ7VY8QCD6EHSQ84ZRV7Y3YZFD6X';

export const ERC20Token = (eth_env === 'production') ? ERC20TokenProduction : ERC20TokenRopsent;

export const coinmarketcap_api = "https://api.coinmarketcap.com";

export const ethplorer_api = "https://api.ethplorer.io";

export const eos_mapping_contract_address = "0xd0a6E6C54DbC68Db5db3A091B171A77407Ff7ccf";
export const eos_mapping_contract_owner = "0xd0a6E6C54DbC68Db5db3A091B171A77407Ff7ccf";

export const HOCKEY_APP_ID_ANDROID = "f0258cf1b3da4abf8ec3a4bcf08ef43c";
export const HOCKEY_APP_ID_IOS = "0c557091ab9f42a0ac598ef68ab51946";

export const meet_terms_url = "https://meet.one/terms.html";

export const meet_url = "https://meet.one";


//eos pomelo
export const versionNumber = '1.0';

export const chainId = 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f';

export const contributorInfo = 'https://api.eosio.sg/bp/info';

export const defaultLogoUrl = 'http://images.eosio.sg/eos.png';

export const IS_DEBUG = true;

export const IS_STORE = false;

export const IS_INTL = false;

// 国内这边写的接口
export const apiCNDomain = IS_DEBUG ? "http://39.108.187.237:6677" : "https://www.ethte.com";
// More那边的接口地址
export const moreAPIDomain = IS_DEBUG ? "http://101.37.146.65" : "https://more.ethte.com";

// SG mainnet
// export const getNetInfoURL = 'https://api.eosio.sg/network';

export const url_decrypt_key = 'ViJDmQj8rf7T87UNmeetonen>U9@%2)4w2.XFU#';

export const channel_id = IS_STORE ? '0001' : '0000';
export const remain_id = '00000';
