import { Platform, StatusBar } from "react-native";
import Util from "../util/Util";
import { Header } from 'react-navigation';

const constStyles = {
    STATE_BAR_HEIGHT: Platform.OS === 'ios' ? (Util.isiPhoneFullDisplay() ? 44 : 20) : StatusBar.currentHeight,
    ACTION_BAR_HEIGHT: Header.HEIGHT,
    NAVI_BAR_HEIGHT: Platform.OS === 'ios' ? 44 : 56,

    THEME_COLOR: "#1ACE9A",
    DIVIDER_COLOR: '#e7e7e7',
    PROGRESS_COLOR: [ 'red', 'green', 'blue' ],
    DISABLED_BG_COLOR: '#B5B5B5',
    PLACE_HOLDER_TEXT_COLOR: "#B5B5B5",
    multiline: true,

    STATE_BAR_OFFY_KEYBOARD: Platform.OS === 'ios' ? (Util.isiPhoneFullDisplay() ? 44 : 0) : StatusBar.currentHeight,
};
export default constStyles;

