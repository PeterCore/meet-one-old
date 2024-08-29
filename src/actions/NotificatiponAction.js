// import notificationTest from "./../../data/demo/notificationTest.json";
import { netNotificationList } from "../net/NotificationNet";

export function getNotification( ownerId, pageNum, pageSize, callback ) {
    return ( dispatch ) => {
        netNotificationList( ownerId, pageNum, pageSize, ( err, resBody ) => {
            if ( err ) {
                callback( err, null )
            }
            else {
                const data = [];
                const res = JSON.parse( JSON.stringify( resBody ) ).data;
                if ( res && res.length > 0 ) {


                    for ( let index = 0; index < res.length; index++ ) {
                        let notification = {}
                        notification.type = res[ index ].type;
                        notification.id = res[ index ].id;
                        notification.ownerId = res[ index ].ownerId;
                        // notification.custom = res[ index ].custom;
                        notification.oppoId = res[ index ].oppoId;
                        notification.read = res[ index ].read;
                        notification.content = res[ index ].content;
                        notification.title = res[ index ].subject;
                        notification.time = res [ index ].createdAt;

                        data.push( notification );
                    }
                }

                callback( err, { data: data } )
            }
        } )
        // let count = pageSize;
        // if ( pageNum > 2 ) {
        //     count = pageSize - 5;
        // }
        //
        // if ( count < 0 ) {
        //     count = 0;
        // }
        //
        // const data = [];
        //
        // const timestampStep = 1000 * 60 * 60 * 36;
        // const baseTime = Date.parse( new Date() ) - pageNum * timestampStep;
        // for ( let index = 0; index < count; index++ ) {
        //     const notification = JSON.parse( JSON.stringify( notificationTest ) );
        //
        //     notification.id = pageSize * pageNum + index;
        //     notification.type = index % 4;
        //     notification.title = "" + (pageNum * pageSize + index) + " Notification Test Title Test Titl";
        //     notification.time = baseTime - timestampStep / pageSize * index;
        //     notification.content = "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;";
        //
        //     data.push( notification );
        // }
        //
        // setTimeout( () => {
        //     callback && callback( null, { data: data } );
        // }, 300 )
    };
}


export function getNotificationIcon( type ) {
    switch ( type ) {
        case 0: {
            return require( '../imgs/message_img_alarm.png' );
        }
        case 1: {
            return require( '../imgs/message_img_notification.png' );
        }
        case 2: {
            return require( '../imgs/message_img_success.png' );
        }
        case 3:
        default : {
            return require( '../imgs/message_img_transfer.png' );
        }
    }
}