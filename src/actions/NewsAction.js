import { netPostGet, netPostList } from "../net/NewsNet"

export function getNews( pageNum, pageSize, type, callback ) {
    return ( dispatch ) => {

        netPostList( type, pageNum, pageSize, ( err, resBody ) => {
            if ( err ) {
                callback( err, null )
            }
            else {
                const data = [];
                const res = JSON.parse( JSON.stringify( resBody ) ).data;
                if ( res && res.length > 0 ) {


                    for ( let index = 0; index < res.length; index++ ) {
                        let newsItem = {}
                        newsItem.type = type;
                        newsItem.id = res[ index ].id;
                        newsItem.icon = res[ index ].icon ? res[ index ].icon : null;
                        newsItem.auth = res[ index ].author ? res[ index ].author : null;
                        newsItem.title = res[ index ].title ? res[ index ].title : null;
                        newsItem.time = res[ index ].publishedAt;
                        newsItem.content = res[ index ].content ? res[ index ].content : null;
                        newsItem.image = res[ index ].image ? res[ index ].image : null;
                        newsItem.contentTranslated = res[ index ].contents ? res[ index ].contents : null;
                        newsItem.url = res[ index ].url ? res[ index ].url : '';
                        newsItem.picUrl = res[ index ].picUrl ? res[ index ].picUrl : '';
                        newsItem.authorId = res[ index ].authorId;
                        newsItem.authorLogo = res[ index ].authorLogo ? res[ index ].authorLogo : '';

                        data.push( newsItem );
                    }
                }

                callback && callback( err, { data: data } )
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
        //     const news = JSON.parse( JSON.stringify( newsTest ) );
        //
        //     news.type = type;
        //     news.id = pageSize * pageNum + index;
        //
        //     switch ( type ) {
        //         case constants.NEWS_MEET_SELF:
        //             news.icon = null;
        //             news.auth = null;
        //             news.title = null;
        //             news.time = baseTime - timestampStep / pageSize * index;
        //             news.content = index % 2 === 0 ? "测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1测试1" :
        //                 "测试22222222222测试22222222222测试22222222222测试222";
        //             news.image = null;
        //             news.contentTranslated = null;
        //             break;
        //         case constants.NEWS_TWITTER:
        //             news.icon = "https://pbs.twimg.com/profile_images/582352199814008832/GVZJ5FiC_400x400.jpg";
        //             news.auth = "" + index + "Twitter Test Auth";
        //             news.title = null;
        //             news.time = baseTime - timestampStep / pageSize * index;
        //             news.content = "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;";
        //             news.image = null;
        //             news.contentTranslated = "" + index + "Twitter Test Content Translated;" + "" + index + "Twitter Test Content Translated;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;";
        //             break;
        //         case constants.NEWS_WEI_BO:
        //             news.icon = "https://pbs.twimg.com/profile_images/582352199814008832/GVZJ5FiC_400x400.jpg";
        //             news.auth = "" + index + "Weibo Test Auth";
        //             news.title = null;
        //             news.time = baseTime - timestampStep / pageSize * index;
        //             news.content = "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;";
        //             news.image = null;
        //             news.contentTranslated = null;
        //             break;
        //         case constants.NEWS_WEI_CHAT:
        //             news.icon = "https://pbs.twimg.com/profile_images/582352199814008832/GVZJ5FiC_400x400.jpg";
        //             news.auth = "" + index + "Weichat Test Auth";
        //             news.title = "" + index + "Weichat Test Title";
        //             news.time = baseTime - timestampStep / pageSize * index;
        //             news.content = "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;" + "" + index + "Twitter Test Content;";
        //             news.image = "http://giztrendzone.com/wp-content/uploads/2016/07/asdsadsadsa-e1468994930624.jpg";
        //             news.contentTranslated = null;
        //             break;
        //     }
        //
        //     news.idMarkRed = index % 3 === 0;
        //
        //     data.push( news );
        // }
        //
        //
        // setTimeout( () => {
        //     callback && callback( null, { data: data } );
        // }, 300 )
    };
}


export function getNewsDetail( id, callback ) {
    return ( dispatch ) => {

        netPostGet( id, ( err, resBody ) => {
                if ( err ) {
                    callback && callback( err, null )
                }
                else {

                    let newsItem = {};
                    newsItem.type = resBody.data.source;
                    newsItem.id = resBody.data.id;
                    newsItem.icon = resBody.data.icon ? resBody.data.icon : null;
                    newsItem.auth = resBody.data.author ? resBody.data.author : null;
                    newsItem.title = resBody.data.title ? resBody.data.title : null;
                    newsItem.time = resBody.data.publishedAt;
                    newsItem.content = resBody.data.content ? resBody.data.content : null;
                    newsItem.image = resBody.data.image ? res[ index ].image : null;
                    newsItem.contentTranslated = resBody.data.contents ? resBody.data.contents : null;
                    newsItem.url = resBody.data.url ? resBody.data.url : '';
                    newsItem.picUrl = resBody.data.picUrl ? resBody.data.picUrl : '';
                    newsItem.authorId = resBody.data.authorId;
                    newsItem.authorLogo = resBody.data.authorLogo ? resBody.data.authorLogo : '';

                    callback && callback( err, { data: newsItem } )
                }

            }
        )
    };
}
