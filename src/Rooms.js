import React, { Component } from "react";
import { Text, View, FlatList, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import Color from "../Color";
import FastImage from '@stevenmasini/react-native-fast-image';

export default class Rooms extends Component {
  state = {
    data: [],
    refreshing: false,
    getting: false,
    modalVisible: false,
    name: '',
    uri: '',
    color: '#000'
  };

  componentDidMount() {
    this.getChatrooms();
  }

  renderItem = ({item}) => {
    console.log(item)
    return(
        <TouchableOpacity
        activeOpacity={0.6}
        onPress={()=>{
            this.props.navigation.navigate('Chat',{
                room: item.name,
                color: item.color
            })
        }}
        style={{
            flex: 1,
            flexDirection: 'row',
            height: 60,
            backgroundColor: '#FFFFFF',
            //marginTop: 5,
            marginBottom: 5,
            elevation: 2,
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: 10,
        }}>
        <FastImage
            style={{
              height: 30,
              width: 30,
              marginRight: 10,
            }}
            source={{
                uri: !item.avatarUrl ? 'https://img.icons8.com/material/96/000000/room.png' : item.avatarUrl,
                priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.contain}
            />
            <Text
                style={{
                    //flex: 1,
                    fontSize: 18,
                    textAlign: 'center',
                    justifyContent: "center",
                    fontWeight: '500',
                    color: '#00000'
                }}
            >{item.name}</Text>
        </TouchableOpacity>
    )
  }

  addChatRoom = () => {
    if(this.state.name.trim(''.length > 1)){
        let data = {}
        data.name = this.state.name;
        if(this.state.uri.trim(''.length > 1)){
            data.avatarUrl = this.state.uri;
        }
        if(this.state.color.trim(''.length > 1) && this.state.color.length > 3 && this.state.color !== '#000'){
            data.color = this.state.color
        }
        axios
        .post(`https://chatroom-test-hbb.herokuapp.com/rooms`, data)
        .then(response => {
            this.setState({modalVisible: false},() => this.getChatrooms())
        })
        .catch(error => {
            this.setState({ getting: false, refreshing: false, modalVisible: false }, ()=>{
                Alert.alert(
                    'Problem',
                    JSON.stringify(error.data),
                    [
                      {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                      {text: 'OK', onPress: () => console.log('OK Pressed')},
                    ],
                    {cancelable: false},
                  );
            });
            console.log(error.response);
        });
    }
  }

  renderPlusButton = () => {
    return (
        <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => this.setState({modalVisible: true})}
            style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: '#FFFFFF',
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 5,
                top: 20,
                right: 30,
                zIndex: 5,
            }}
        >
             <Icon name="plus" size={30} color={Color.sec} />
        </TouchableOpacity>
    )
  }

  getChatrooms = () => {
    axios
      .get(`https://chatroom-test-hbb.herokuapp.com/rooms`)
      .then(response => {
        this.setState({
          data: response.data.chatrooms,
          refreshing: false,
          getting: false
        });
      })
      .catch(error => {
        this.setState({ getting: false, refreshing: false });
        console.log(error.response);
      });
  };

  onPullTorefresh = () => {
    this.setState(
      {
        data: [],
        refreshing: true,
        getting: false
      },
      () => this.getChatrooms()
    );
  };

  render() {
      console.log(this.state.data)
    return (
      <View
        style={{
            flex: 1
        }}
      >
          {this.renderPlusButton()}
        <FlatList
            contentContainerStyle={{
                marginTop: 5,
            }}
            data={this.state.data}
            renderItem={this.renderItem} 
            keyExtractor={item => item._id}
            refreshControl={
                <RefreshControl
                  colors={[Color.main, Color.main]}
                  refreshing={this.state.refreshing}
                  onRefresh={this.onPullTorefresh}
                />
              }
        />
        <Modal
          animationType="slide"
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => {
            //Alert.alert('Modal has been closed.');
          }}>
          <View style={{
              position: 'absolute', bottom: 0, 
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 250,
                padding: 10,
                width: '100%',
                backgroundColor: '#FFFFFF'

                }}>
              <Text>Add a new Chatroom</Text>
              <TextInput
                style={{height: 40, width: '70%', borderColor: 'gray', borderWidth: 1, margin: 5}}
                onChangeText={(text) => this.setState({name: text})}
                value={this.state.name}
                placeholder={'Chatroom name'}
            />
            <TextInput
                style={{height: 40,width: '70%', borderColor: 'gray', borderWidth: 1, margin: 5}}
                onChangeText={(text) => this.setState({uri: text})}
                value={this.state.uri}
                placeholder={'Chatroom avatar uri'}
            />
            <TextInput
                style={{height: 40,width: '70%', borderColor: 'gray', borderWidth: 1, margin: 5}}
                onChangeText={(text) => this.setState({color: text})}
                value={this.state.color}
                placeholder={'Chatroom Color : EX #000'}
            />
            <View
                style={{
                    flex: 1,
                    width: '70%',
                    flexDirection: 'row'
                }}
            >
            <TouchableOpacity
                onPress={this.addChatRoom}
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: 5
                }}
                activeOpacity={0.6}
            >
                <Text
                    style={{
                        fontSize: 16,
                        textAlign: 'center',
                        justifyContent: "center",
                        fontWeight: '500',
                        color: '#7AFF96'
                    }}
                >Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
             style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                margin: 5
            }}
            activeOpacity={0.6}
            onPress={() => this.setState({modalVisible: false})}
            >
                <Text
                    style={{
                        fontSize: 16,
                        textAlign: 'center',
                        justifyContent: "center",
                        fontWeight: '500',
                        color: '#B23242'
                    }}
                >Cancel</Text>
            </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}
