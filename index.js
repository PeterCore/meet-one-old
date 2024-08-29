import './shim.js'
import './InitImport';

import { AppRegistry } from 'react-native';
import { setup } from "./src/setup";

AppRegistry.registerComponent( 'meet', setup, false );
