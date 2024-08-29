import moment from "moment/moment";

export default class TimeUtil {
    static formatWithTimeZone( time ) {
        return moment( time ).format( 'YYYY-M-D HH:mm:ss' ) + ' ' + TimeUtil.timeZoneStr()
    }

    static timeZoneStr() {
        var offSetHour = (new Date()).getTimezoneOffset() / 60;
        offSetHour = offSetHour > 0 ? Math.floor( offSetHour ) : Math.ceil( offSetHour )
        var offSetMinute = (new Date()).getTimezoneOffset() % 60;
        var result;
        if ( offSetHour > 0 ) {
            if ( offSetHour < 10 ) {
                result = 'UTC-0' + offSetHour;
            } else {
                result = 'UTC-' + offSetHour;
            }
        } else {
            if ( -offSetHour < 10 ) {
                result = 'UTC+0' + -offSetHour;
            } else {
                result = 'UTC+' + -offSetHour;
            }
        }

        if ( offSetMinute > 0 ) {
            if ( offSetMinute < 10 ) {
                result += ('0' + offSetMinute);
            } else {
                result += (offSetMinute);
            }
        } else {
            if ( -offSetMinute < 10 ) {
                result += ('0' + -offSetMinute);
            } else {
                result += (-offSetMinute);
            }
        }

        return result
    }
}