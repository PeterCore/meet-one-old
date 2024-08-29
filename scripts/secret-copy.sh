#!/bin/sh

CURRENT_PATH=$(cd `dirname $0`; pwd)/../
FD_KEYSTORES=~/Documents/meet

cp ${FD_KEYSTORES}/meet.keystore ${CURRENT_PATH}/android/keystores/
cp ${FD_KEYSTORES}/meetkeystore.properties ${CURRENT_PATH}/android/keystores/