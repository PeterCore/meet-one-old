import Toast from "react-native-root-toast";

import Keys from "../../configs/Keys";
import I18n from "../../I18n";

/**
 * 处理错误信息
 */
export function handleError(err, callback) {
    if (err && err.status) {
        // 没有互联网连接
        Toast.show(I18n.t(Keys.no_internet_connect), { position: Toast.positions.CENTER } );
    } else if (err && err.message) {
        // 如果有错误信息的话，直接打印（兼容之前写的`callback(Error(..)`的写法)）
        Toast.show(err.message, {position: Toast.positions.CENTER});
    } else {
        try {
            // 错误处理
            const errorObj = JSON.parse(err);
            const errCode = errorObj.error.code;
            const keys = Keys['error_' + errCode];
            if (errCode == 3050003) {
                const message = errorObj.error.details[0] && errorObj.error.details[0].message
                Toast.show(message, {
                    position: Toast.positions.CENTER,
                    duration: 4000
                });
            } else {
                if (keys) {
                    console.error(err);
                    Toast.show(I18n.t(keys), { position: Toast.positions.CENTER } );
                } else {
                    Toast.show(err, { position: Toast.positions.CENTER } );
                }
            }
        } catch (error) {
            // 遇到这种情况，多半是JSON.parse有异常抛出
            Toast.show(I18n.t(Keys.error_parse), { position: Toast.positions.CENTER } );
        }
    }
    callback && callback(err);
}
