#!/bin/sh

#1. please install 'atom' to edit release note
#   please test by open -a atom ./release_notes_template.md
#2. please install md5sha1sum: brew install md5sha1sum
#3. install "jq" to deal with json data: brew install jq
#4. config aws:
#    curl -O https://bootstrap.pypa.io/get-pip.py
#    sudo python get-pip.py
#    sudo pip install awscli
#    aws configure
#5. config the "aapt" environment path:
#    export PATH="$HOME/Library/Android/sdk/build-tools/22.0.1:$PATH"
#6. install yarn
#   npm install -g yarn react-native-cli
#hockapp api: https://support.hockeyapp.net/kb/api/api-versions
#ios build: http://www.jianshu.com/p/2247f76404eb

CURRENT_PATH=$(cd `dirname $0`; pwd)/../
ALTOOL=/Applications/Xcode.app/Contents/Applications/Application\ Loader.app/Contents/Frameworks/ITunesSoftwareService.framework/Support/altool
FD_KEYSTORES=~/Documents/meet
APPLE_ACCOUNT=
APPLE_PASSWORD=
HOCKEY_APP_TOKEN=
HOCKEY_APP_ANDROID_STAGE_ID=
HOCKEY_APP_ANDROID_PRODUCTION_ID=
HOCKEY_APP_IOS_STAGE_ID=
HOCKEY_APP_IOS_PRODUCTION_ID=


modifyReleaseNote(){
    checkCommandExist atom

    #date +%Y%m%d-%H:%M
    rm -r -f ./release_notes.md
	cp ./release_notes_template.md ./release_notes.md

	open -a atom ./release_notes.md

	echo "Please modify release notes, press any key to continue?"
	read ANS
}

mergerReleaseNote(){
	echo `date +%Y%m%d-%H:%M` >> ./tmp.md
	cat ./release_notes.md >> ./tmp.md
	echo  >> ./tmp.md
	echo -------------------------------------------------------------------------------- >> ./tmp.md
	echo  >> ./tmp.md
	cat ./release_notes_history.md >> ./tmp.md


	rm -r -f ./release_notes.md
	rm -r -f ./release_notes_history.md
	mv ./tmp.md ./release_notes_history.md
}

loadAppleDevelopAccount() {
    if [ -f "$FD_KEYSTORES/appleAccount.ini" ]
        then
    APPLE_ACCOUNT=$(awk -F "=" '/account/ {print $2}' ${FD_KEYSTORES}/appleAccount.ini)
    APPLE_PASSWORD=$(awk -F "=" '/password/ {print $2}' ${FD_KEYSTORES}/appleAccount.ini)
    fi
}

loadHockeyAppIni() {
    if [ -f "$FD_KEYSTORES/hockeyApp.ini" ]
        then
    HOCKEY_APP_TOKEN=$(awk -F "=" '/HockeyAppToken/ {print $2}' ${FD_KEYSTORES}/hockeyApp.ini)
    HOCKEY_APP_ANDROID_STAGE_ID=$(awk -F "=" '/androidStage/ {print $2}' ${FD_KEYSTORES}/hockeyApp.ini)
    HOCKEY_APP_ANDROID_PRODUCTION_ID=$(awk -F "=" '/androidProduction/ {print $2}' ${FD_KEYSTORES}/hockeyApp.ini)
    HOCKEY_APP_IOS_STAGE_ID=$(awk -F "=" '/iosStage/ {print $2}' ${FD_KEYSTORES}/hockeyApp.ini)
    HOCKEY_APP_IOS_PRODUCTION_ID=$(awk -F "=" '/iosProduction/ {print $2}' ${FD_KEYSTORES}/hockeyApp.ini)
    fi
}

killReactNativeCli(){
    kill -9 $(lsof -ti tcp:8081)
}

clearAndroidBundle(){
    rm -r -f ./android/app/src/main/assets_rct/* && rm -r -f ./android/app/src/main/assets_rct/.need_submit_git && echo >> ./android/app/src/main/assets_rct/.need_submit_git
    rm -r -f ./android/app/src/main/res_rct/* && rm -r -f ./android/app/src/main/res_rct/.need_submit_git && echo >> ./android/app/src/main/res_rct/.need_submit_git
}

clearIOSBundle(){
    rm -r -f ./ios/bundle/* && rm -r -f ./ios/bundle/.need_submit_git && echo >> ./ios/bundle/.need_submit_git
}

clearAndroidBuildCache(){
    ./android/gradlew  -p android/app clean
}

clearIOSBuildCache(){
#    http://www.jianshu.com/p/2247f76404eb
    xcodebuild clean -workspace ./ios/meet.xcworkspace -scheme meetArchive -configuration Release
}

buildAndroidBundle(){
#    react-native bundle --platform='android' --dev=false --entry-file='index.android.js' --bundle-output='android/app/src/main/assets_rct/index.android.bundle' --assets-dest='android/app/src/main/res_rct/'
    npm  run bundle-android
}

buildIOSBundle(){
#    react-native bundle --platform='ios' --dev=false --entry-file='index.ios.js' --bundle-output='./ios/bundle/index.ios.jsbundle'   --assets-dest='./ios/bundle/'
    npm  run bundle-ios
}

archiveAndroidForHockApp() {
    clearAndroidBundle
    buildAndroidBundle

#    clearAndroidBuildCache

    ./android/gradlew -p android/app assembleRelease
    uploadToHockApp ./release_notes.md ./android/app/build/outputs/apk/meet-release.apk "" ${HOCKEY_APP_ANDROID_PRODUCTION_ID}

    clearAndroidBundle

#    clearAndroidBuildCache
}


archiveAndroidForAppStore() {
    clearAndroidBundle
    buildAndroidBundle

#    clearAndroidBuildCache

    ./android/gradlew -p android/app assembleRelease
#    uploadToHockApp ./release_notes.md ./android/app/build/outputs/apk/gtbwallet-release.apk "" ${HOCKEY_APP_ANDROID_PRODUCTION_ID}

    clearAndroidBundle

#    clearAndroidBuildCache
}

doBuildIOSByScheme(){
    xcodebuild archive -workspace ./ios/meet.xcworkspace -configuration Release -scheme $1 -archivePath ./$1/$1.xcarchive
    xcodebuild -exportArchive -allowProvisioningUpdates -archivePath ./$1/$1.xcarchive -exportPath ./$1/ -exportOptionsPlist $2
    cd ./$1/$1.xcarchive/
    zip -r $1.dSYMs.zip dSYMs

    mv $1.dSYMs.zip ${CURRENT_PATH}/$1
    cd ${CURRENT_PATH}
}


archiveIOSForHockApp() {
#    echo $PATH
#
#    nvm currentnpm --version
#    npm --version
#    node --version
#
#    echo $NPM_CONFIG_PREFIX


    clearIOSBundle
    buildIOSBundle

#    clearIOSBuildCache

    rm -r -f ./meetArchive && mkdir ./meetArchive

    killReactNativeCli
    doBuildIOSByScheme meetArchive ./ios/ad_hoc_exportOptions.plist
    uploadToHockApp ./release_notes.md ./meetArchive/meetArchive.ipa ./meetArchive/meetArchive.dSYMs.zip ${HOCKEY_APP_IOS_PRODUCTION_ID}

#    clearIOSBundle
##    clearIOSBuildCache
}

archiveIOSForAppStore() {
#    echo $PATH
#
#    nvm currentnpm --version
#    npm --version
#    node --version
#
#    echo $NPM_CONFIG_PREFIX


    clearIOSBundle
    buildIOSBundle

#    clearIOSBuildCache

    rm -r -f ./meetArchive && mkdir ./meetArchive

    killReactNativeCli
    doBuildIOSByScheme meetArchive ./ios/app_store_exportOptions.plist
    "$ALTOOL" --upload-app -f ./meetArchive/meetArchive.ipa -u ${APPLE_ACCOUNT} -p ${APPLE_PASSWORD}

#    clearIOSBundle
##    clearIOSBuildCache
}

uploadHockApp() {
    modifyReleaseNote

    archiveAndroidForHockApp

    archiveIOSForHockApp

    mergerReleaseNote
}

uploadAndroidHockApp() {
    modifyReleaseNote

    archiveAndroidForHockApp

    mergerReleaseNote
}

uploadIOSHockApp() {
    modifyReleaseNote

    archiveIOSForHockApp

    mergerReleaseNote
}

uploadToHockApp() {
    CMD="curl "
    CMD=${CMD}"-F \"status=2\" "
    CMD=${CMD}"-F \"notify=1\" "
    CMD=${CMD}"-F \"notes=<$1\" "
    CMD=${CMD}"-F \"notes_type=0\" "
    CMD=${CMD}"-F \"mandatory=1\" "
    CMD=${CMD}"-F \"ipa=@$2\" "

    if [[ ${#3} > 0 ]]; then
       CMD=${CMD}"-F \"dsym=@$3\" "
    fi

    CMD=${CMD}"-H \"X-HockeyAppToken:$HOCKEY_APP_TOKEN\" "
    CMD=${CMD}"https://rink.hockeyapp.net/api/2/apps/$4/app_versions/upload"

    echo ${CMD}

    RESULT=`eval ${CMD}`

    echo ${RESULT}
}

function errorInputTip(){
    echo
    echo
    echo "we support follow operation："
    echo
    echo clearAndroidBundle
    echo clearIOSBundle
    echo clearAndroidBuildCache
    echo clearIOSBuildCache
    echo buildAndroidBundle
    echo buildIOSBundle
    echo archiveAndroidForHockApp
    echo archiveAndroidForAppStore
    echo archiveIOSForHockApp
    echo uploadHockApp
    echo uploadAndroidHockApp
    echo uploadIOSHockApp
    echo archiveIOSForAppStore

#    echo tempChangeNodeModule

    echo
    echo
    echo "Please select your operation:"

    read ANS
    dealWithUserInput ${ANS}
}

function dealWithUserInput(){
	case $1 in
	clearAndroidBundle)
		clearAndroidBundle
	;;
	clearIOSBundle)
		clearIOSBundle
	;;
	clearAndroidBuildCache)
		clearAndroidBuildCache
	;;
	clearIOSBuildCache)
		clearIOSBuildCache
	;;
	buildAndroidBundle)
		buildAndroidBundle
	;;
	buildIOSBundle)
		buildIOSBundle
	;;
	archiveAndroidForHockApp)
		archiveAndroidForHockApp
	;;
	archiveAndroidForAppStore)
	    archiveAndroidForAppStore
	;;
	archiveIOSForHockApp)
		archiveIOSForHockApp
	;;
	uploadHockApp)
		uploadHockApp
	;;
	uploadAndroidHockApp)
		uploadAndroidHockApp
	;;
	uploadIOSHockApp)
		uploadIOSHockApp
	;;
	archiveIOSForAppStore)
		archiveIOSForAppStore
	;;
	*)
	    errorInputTip
	;;
	esac
}

function checkCommandExist(){
    command -v $1 >/dev/null 2>&1 || { echo "I require $1 but it's not installed.  Aborting." >&2; exit 1; }
}

loadAppleDevelopAccount
loadHockeyAppIni
yarn run secret-copy


#echo APPLE_ACCOUNT=$APPLE_ACCOUNT
#echo APPLE_PASSWORD=$APPLE_PASSWORD
#echo HOCKEY_APP_TOKEN=$HOCKEY_APP_TOKEN
#echo HOCKEY_APP_ANDROID_STAGE_ID=$HOCKEY_APP_ANDROID_STAGE_ID
#echo HOCKEY_APP_ANDROID_PRODUCTION_ID=$HOCKEY_APP_ANDROID_PRODUCTION_ID
#echo HOCKEY_APP_IOS_STAGE_ID=$HOCKEY_APP_IOS_STAGE_ID
#echo HOCKEY_APP_IOS_PRODUCTION_ID=$HOCKEY_APP_IOS_PRODUCTION_ID

if test $# != 1  ; then
	errorInputTip
else
	dealWithUserInput $1
fi
