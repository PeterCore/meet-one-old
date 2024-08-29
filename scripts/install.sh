#!/bin/sh

yarn install

npm run rnnodeify

cd ios

pod install

cd ../

sed -i '' '31 s/@Override/\/\/@Override \/\/ Deprecated RN 0.47/g' ./node_modules/react-native-os/android/src/main/java/com/peel/react/RNOSModule.java

sed -i '' '7 s/defaultConfig {/defaultConfig { manifestPlaceholders = [XG_ACCESS_ID: "2100279540", XG_ACCESS_KEY: "A51MF2N9C2IR", HW_APPID: "100243781"]\/\//g' ./node_modules/react-native-xinge-push/android/build.gradle

sed -i '' "s/var scrypt = require('scrypt-js');/import crypto from 'react-native-fast-crypto';/g" ./node_modules/ethers/wallet/secret-storage.js
sed -i '' "s/scrypt(/crypto.scrypt_1(/g" ./node_modules/ethers/wallet/secret-storage.js


sed -i '' "s/var scrypt = require('scrypt-js');/import crypto from 'react-native-fast-crypto';/g" ./node_modules/ethers/dist/ethers.js
sed -i '' "s/scrypt(/crypto.scrypt_1(/g" ./node_modules/ethers/dist/ethers.js

sed -i '' "s/var scrypt = require('scrypt-js');/import crypto from 'react-native-fast-crypto';/g" ./node_modules/ethers/wallet/wallet.js
sed -i '' "s/scrypt(/crypto.scrypt_1(/g" ./node_modules/ethers/wallet/wallet.js


# for eos
sed -i '' "s/require('isomorphic-fetch');/\/\/require('isomorphic-fetch');/g" ./node_modules/eosjs-api/lib/apigen.js

#sed -i '' "s/var protocol = isBrowser/var protocol = 'http';\/\/var protocol = isBrowser/g" ./node_modules/eosjs-api/lib/testnet.js


sed -i '' "s/export default class {/export default class RootSiblings {/g" ./node_modules/react-native-root-siblings/index.js


sed -i '' "s/module.exports = require('crypto').randomBytes/module.exports = require('react-native-crypto').randomBytes/g" ./node_modules/randombytes/index.js
sed -i '' "s/module.exports = randomBytes/module.exports = require('react-native-crypto').randomBytes/g" ./node_modules/randombytes/browser.js
sed -i '' "s/module.exports = oldBrowser/module.exports = require('react-native-crypto').randomBytes/g" ./node_modules/randombytes/browser.js

sed -i '' "s/compileSdkVersion 23/compileSdkVersion 27/g" ./node_modules/react-native-exit-app/android/build.gradle
sed -i '' "s/compileSdkVersion 23/compileSdkVersion 27/g" ./node_modules/react-native-fast-crypto/android/build.gradle
sed -i '' "s/compileSdkVersion 25/compileSdkVersion 27/g" ./node_modules/react-native-fs/android/build.gradle
sed -i '' "s/compileSdkVersion 25/compileSdkVersion 27/g" ./node_modules/react-native-i18n/android/build.gradle
sed -i '' "s/compileSdkVersion 25/compileSdkVersion 27/g" ./node_modules/react-native-image-picker/android/build.gradle
sed -i '' "s/compileSdkVersion 23/compileSdkVersion 27/g" ./node_modules/react-native-measure-text/android/build.gradle
sed -i '' "s/compileSdkVersion 23/compileSdkVersion 27/g" ./node_modules/react-native-os/android/build.gradle
sed -i '' "s/compileSdkVersion 23/compileSdkVersion 27/g" ./node_modules/react-native-qrcode-local-image/android/build.gradle
sed -i '' "s/compileSdkVersion 23/compileSdkVersion 27/g" ./node_modules/react-native-randombytes/android/build.gradle
sed -i '' "s/compileSdkVersion 23/compileSdkVersion 27/g" ./node_modules/react-native-splash-screen/android/build.gradle
sed -i '' "s/compileSdkVersion 23/compileSdkVersion 27/g" ./node_modules/react-native-svg/android/build.gradle
sed -i '' "s/compileSdkVersion 23/compileSdkVersion 27/g" ./node_modules/react-native-tcp/android/build.gradle
sed -i '' "s/compileSdkVersion 23/compileSdkVersion 27/g" ./node_modules/react-native-udp/android/build.gradle
