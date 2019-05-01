
import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import axios from 'axios';
import { Avatar } from 'react-native-elements';
import SocketIOClient from 'socket.io-client';
import { createStackNavigator } from 'react-navigation';
const uuidv4 = require('uuid/v4');

import { GiftedChat } from 'react-native-gifted-chat-video-support'
import {
  DotIndicator,
  SkypeIndicator,
  WaveIndicator,
} from 'react-native-indicators';
export default class ChatPage extends Component {
    constructor(state) {
        super(state);
        this.state = {
          room: this.props.navigation.getParam('room', 'Mainroom'),
          color: this.props.navigation.getParam('room', '#26BFBF'),
          fetching: false,
          me: {
            _id: uuidv4()
          },
          messages: [],
        }
        this.GetUserDetails();
        this.onReceivedMessage = this.onReceivedMessage.bind(this);
        this.onSend = this.onSend.bind(this);
        this._storeMessages = this._storeMessages.bind(this);
        this.socket = SocketIOClient('https://chatroom-test-hbb.herokuapp.com');
        this.socket.emit('userJoined', {'name': 'maher'}, 'roomtest');
        this.socket.on('message', this.onReceivedMessage);
      }

      componentDidMount(){
        this.props.navigation.setParams({
            color: this.state.color,
            room: this.state.room
        })
      }
      
    
      GetUserDetails = () => {
        this.setState({fetching: true})
        axios
        .get(`https://randomuser.me/api/?seed=${this.state.me._id}`, {
            timeout: 5000
        })
        .then(response => {
          console.log("response.data.results[0].picture.medium === ",response.data.results[0].picture.medium)
          let user = {
            _id: this.state.me._id,
            name: response.data.results[0].login.username,
            avatar: response.data.results[0].picture.medium
          }
          this.setState({
            me: user,
            fetching: false
          })
        })
        .catch(error => {
          console.log("rerror === ",error)
          this.setState({
            fetching: false
          })
        });
      }
     
      renderLeftIcon = () => {
        return (
          <Avatar
            rounded
            size={42}
            source={{
              uri: this.state.me.avatar
            }}
          />
          );
        }
      componentWillMount() {
      }
    
      onReceivedMessage(messages) {
        this._storeMessages(messages);
      }
     
      onSend(messages = []) {
        if(messages[0].text.trim(' ').length > 1){
          let msg = messages[0]
          msg.room = 'roomtest';
          console.log(messages[0].text.trim(''))
          this.socket.emit('message', msg);
          this._storeMessages(messages);
        }
      }
      
      _storeMessages(messages) {
        this.setState((previousState) => {
          return {
            messages: GiftedChat.append(previousState.messages, messages),
          };
        });
      }
    
      renderWelcomCard = () => {
        return(
          <Avatar
            rounded
            size="small"
            source={{ 
              uri: this.state.me.avatars
            }}
          />  
        );
      }
    
  render() {
    console.disableYellowBox = true;
    return (
      <View style={styles.container}>
      {this.state.fetching &&  <View
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0)',
                  justifyContent: 'center'
                }}
              >
                <SkypeIndicator count={3} color={'##03a9f4'} size={10} />
              </View> }
         <GiftedChat
            alwaysShowSend
            showUserAvatar
            scrollToBottom
            renderActions={this.renderLeftIcon}
            messageIdGenerator={uuidv4}
            messages={this.state.messages}
            onSend={messages => this.onSend(messages)}
            user={this.state.me}
      />
      </View>
    );
  }
}
const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      flex: 1,
      paddingBottom: 5,
    }
  });