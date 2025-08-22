import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { registerRootComponent } from "expo";
import "./src/config/amplifyConfig"; // Configure Amplify before importing App
import App from "./App";

registerRootComponent(App);
