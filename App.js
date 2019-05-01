import React, {Component} from 'react';
import { createStackNavigator } from 'react-navigation';


import Rooms from './src/Rooms';
import ChatPage from './src/ChatPage';

const RootStack = createStackNavigator({
  Home: {
    screen: Rooms,
    navigationOptions: ({ navigation, screenProps }) => ({
      headerTitle: 'Choose your room ',
      headerMode: 'float',
      headerTintColor: '#000',
      headerTitleStyle: {
        backgroundColor: '#fff',
        flex: 1
      },
      headerTitleAllowFontScaling: false,
      headerBackTitle: null
    })
  },
  Chat: {
    screen: ChatPage,
    navigationOptions: ({ navigation, screenProps }) => ({
      headerTitle: navigation.state.params && navigation.state.params.room ? navigation.state.params.room  : '',
      headerStyle: {
        backgroundColor: navigation.state.params && navigation.state.params.color ? navigation.state.params.color : '#FFF'
      },
      headerMode: 'float',
      //headerTintColor: '#fff',
      // headerTitleStyle: {
      //   backgroundColor: '#fff',
      //   flex: 1
      // },
      headerTitleAllowFontScaling: false,
      headerBackTitle: null
    })
  }
});

export default class App extends Component {
  render() {
    return <RootStack />;
    
  }
}


