import React, { Component } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import axios from "axios";
import { Avatar } from "react-native-elements";
import SocketIOClient from "socket.io-client";
import { createStackNavigator } from "react-navigation";
const uuidv4 = require("uuid/v4");

import { GiftedChat } from "react-native-gifted-chat-video-support";
import {
  DotIndicator,
  SkypeIndicator,
  WaveIndicator
} from "react-native-indicators";
import VoiceView from "./VoiceView";
import InputBar from "./InputBar";
export default class ChatPage extends Component {
  constructor(state) {
    super(state);
    this.state = {
      room: this.props.navigation.getParam("room", "Mainroom"),
      color: this.props.navigation.getParam("room", "#26BFBF"),
      fetching: false,
      me: {
        _id: uuidv4()
      },
      messages: []
    };
    this._requestAndroidPermission();
    this.GetUserDetails();
    this.onReceivedMessage = this.onReceivedMessage.bind(this);
    this.onSend = this.onSend.bind(this);
    this._storeMessages = this._storeMessages.bind(this);
    this.socket = SocketIOClient("https://chatroom-test-hbb.herokuapp.com");
    this.socket.emit("userJoined", { name: "maher" }, "roomtest");
    this.socket.on("message", this.onReceivedMessage);
  }

  componentDidMount() {
    this.props.navigation.setParams({
      color: this.state.color,
      room: this.state.room
    });
  }

  GetUserDetails = () => {
    this.setState({ fetching: true });
    axios
      .get(`https://randomuser.me/api/?seed=${this.state.me._id}`, {
        timeout: 5000
      })
      .then(response => {
        console.log(
          "response.data.results[0].picture.medium === ",
          response.data.results[0].picture.medium
        );
        let user = {
          _id: this.state.me._id,
          name: response.data.results[0].login.username,
          avatar: response.data.results[0].picture.medium
        };
        this.setState({
          me: user,
          fetching: false
        });
      })
      .catch(error => {
        console.log("rerror === ", error);
        this.setState({
          fetching: false
        });
      });
  };

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
  };

  initPath = async() => {
    await this.checkDir()
    const nowPath = `${AudioUtils.DocumentDirectoryPath}/voice/voice${Date.now()}.aac`
    this.setState({ audioPath: nowPath, currentTime: 0 })
    this.prepareRecordingPath(nowPath)
  }

  _requestAndroidPermission = async() => {
    try {
      const rationale = {
        title: 'Permission',
        message: 'give that permission baliz.',
        buttonPositive: 'take it :p ',
      }
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
      this.setState({ hasPermission: granted === PermissionsAndroid.RESULTS.GRANTED })
    } catch (e) {
      console.log(e)
    }
  }

  audioProgress = () => {
    AudioRecorder.onProgress = (data) => {
      if (data.currentTime === 0) {
        this.setState((prevState) => ({ currentTime: Math.floor(prevState.currentTime + 0.25) }))
      } else {
        this.setState({ currentTime: Math.floor(data.currentTime) })
      }
      this._setVoiceHandel(false)
      this.setState({volume: Math.floor(data.currentMetering) })
      this.random()
    }
  }

  audioFinish = () => {
    AudioRecorder.onFinished = (data) => this._finishRecording(data.status === 'OK', data.audioFileURL)
  }

  random = () => {
    if (this.timer) return
    console.log('start')
    this.timer = setInterval(()=> {
      const num =  Math.floor(Math.random() * 10)
      this.setState({
        voiceVolume: num
      })
    }, 500)
  }

  _record = async() => {
    try {
      await AudioRecorder.startRecording()
    } catch (error) {
      console.log(error)
    }
  }

  _pause = async() => {
    try{
      await AudioRecorder.pauseRecording() // Android 由于API问题无法使用此方法
    }catch (e) {
      console.log(e)
    }
  }

  _stop = async() => {
    try {
      await AudioRecorder.stopRecording()
      this.timer && clearInterval(this.timer)
      if (Platform.OS === 'android') {
        this._finishRecording(true)
      }
    } catch (error) {
      console.log(error)
    }
  }

    _resume = async() => {
    try{
      await AudioRecorder.resumeRecording() // Android 由于API问题无法使用此方法
    }catch (e) {
      console.log(e)
    }
  }

  _finishRecording (didSucceed, filePath) {
    console.log(filePath)
    this.setState({ finished: didSucceed })
  }

  _setVoiceHandel = (status) => {
    this.setState({voiceHandle: status})
  }

  _onVoiceStart = () => {
    this.setState({ voiceEnd: true })
    this.voice.show()
  }

  _changeMethod () {
    this.setState({ showVoice: !this.state.showVoice },
      async () => {
        if (Platform.OS === 'android' && this.state.showVoice && !this.androidHasAudioPermission) {
          const hasPermission = await this.props.checkPermission()
          this.androidHasAudioPermission = hasPermission
          if (!hasPermission) {
            this._requestAndroidPermission();
          }
        }
      }
    )
    this.setState({ saveChangeSize: this.state.inputChangeSize })
    this.time && clearTimeout(this.time)
    this.time = setTimeout(() => this.InputBar.input && this.InputBar.input.focus(), 300)
    if (!this.state.showVoice && this.state.panelShow) {
      this.setState({ xHeight: this.props.iphoneXBottomPadding })
      //return this.closePanel(true)
    }
    if (!this.state.showVoice && this.state.emojiShow) {
      this.setState({ xHeight: this.props.iphoneXBottomPadding })
      //return this.closeEmoji(true)
    }
  }

  _onVoiceEnd = () => {
    this.voice.close()
    this.setState({ voiceEnd: false })
  }

  changeVoiceStatus = (status) => {
    this.setState({ isVoiceContinue: status })
  }

  renderVoiceRecord = () => {
    return (
      <View style={{
        flex: 1,
        backgroundColor: 'red'
      }}>
        <InputBar
         sendUnableIcon={this.props.sendUnableIcon}
         ref={e => (this.InputBar = e)}
         isIphoneX={false}
         placeholder={this.props.placeholder}
         useVoice={this.props.useVoice}
         onMethodChange={this._changeMethod.bind(this)}
         showVoice={this.state.showVoice}
         onSubmitEditing={(type, content) => this.onSend(content)}
         messageContent={''}
         textChange={null}
         onContentSizeChange={null}
         voiceStart={this._onVoiceStart}
         voiceEnd={this._onVoiceEnd}
         isVoiceEnd={this.state.voiceEnd}
         voiceStatus={this.state.isVoiceContinue}
         changeVoiceStatus={this.changeVoiceStatus}
         hasPermission={this.state.hasPermission}
        />
        
      </View>
    );
  };
  componentWillMount() {}

  onReceivedMessage(messages) {
    this._storeMessages(messages);
  }

  onSend(messages = []) {
    if (messages[0].text.trim(" ").length > 1) {
      let msg = messages[0];
      msg.room = "roomtest";
      console.log(messages[0].text.trim(""));
      this.socket.emit("message", msg);
      this._storeMessages(messages);
    }
  }

  _storeMessages(messages) {
    this.setState(previousState => {
      return {
        messages: GiftedChat.append(previousState.messages, messages)
      };
    });
  }

  renderWelcomCard = () => {
    return (
      <Avatar
        rounded
        size="small"
        source={{
          uri: this.state.me.avatars
        }}
      />
    );
  };

  render() {
    console.disableYellowBox = true;
    return (
      <View style={styles.container}>
        {this.state.fetching && (
          <View
            style={{
              position: "absolute",
              height: "100%",
              width: "100%",
              backgroundColor: "rgba(0, 0, 0, 0)",
              justifyContent: "center"
            }}
          >
            <SkypeIndicator count={3} color={"##03a9f4"} size={10} />
          </View>
        )}
        <GiftedChat
          alwaysShowSend
          showUserAvatar
          scrollToBottom
          // renderActions={() => null}
          // renderInputToolbar={() => this.renderVoiceRecord()}
          messageIdGenerator={uuidv4}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={this.state.me}
          // renderSend={() => null}
        />
        <VoiceView
          ref={e => (this.voice = e)}
          sendVoice={(type, content) => this._sendMessage(type, content)}
          changeVoiceStatus={this.changeVoiceStatus}
          voiceStatus={this.state.isVoiceContinue}
          audioPath={this.props.audioPath}
          audioHasPermission={this.state.hasPermission}
          audioPermissionState={this.state.hasPermission}
          audioOnProgress={this.audioProgress}
          audioOnFinish={this.audioFinish}
          audioInitPath={this.initPath}
          audioRecord={this._record}
          audioStopRecord={this._stop}
          audioPauseRecord={this._pause}
          audioCurrentTime={this.state.currentTime}
          audioResumeRecord={this._resume}
          audioHandle={this.state.voiceHandle}
          setAudioHandle={this._setVoiceHandel}
          errorIcon={this.props.voiceErrorIcon}
          cancelIcon={this.props.voiceCancelIcon}
          errorText={this.props.voiceErrorText}
          voiceCancelText={this.props.voiceCancelText}
          voiceNoteText={this.props.voiceNoteText}
          renderVoiceView={this.props.renderVoiceView}
          voiceVolume={this.props.voiceVolume}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingBottom: 5
  }
});
