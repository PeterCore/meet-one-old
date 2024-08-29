import React from 'react';
import { connect } from "react-redux";
import MineRecommendMeetPageView from "./MineRecommendMeetPageView";


const mapStoreToProps = ( state, ownProps ) => {
    return {}
};


const mapDispatchToProps = ( dispatch, ownProps ) => ({
    // openTerms: () => {
    //     Linking.openURL( "https://meet.one/terms.html" ).catch( err => console.error( 'An error occurred', err ) );
    // },
    // openTelegramWebsit: () => {
    //     Linking.openURL( "https://t.me/MeetOne" ).catch( err => console.error( 'An error occurred', err ) );
    // },
    // openOfficalWebsit: () => {
    //     Linking.openURL( "https://meet.one/" ).catch( err => console.error( 'An error occurred', err ) );
    // },
});

const MineRecommendMeetPage = connect(
    mapStoreToProps,
    mapDispatchToProps
)( MineRecommendMeetPageView );

export default MineRecommendMeetPage;
