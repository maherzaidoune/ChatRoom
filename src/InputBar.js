import React, { PureComponent } from "react";
import {
  PanResponder,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Animated,
  TextInput,
  Text,
  Dimensions
} from "react-native";

const { width, height } = Dimensions.get("window");

export default class InputBar extends PureComponent {
  constructor(props) {
    super(props);
    this.createPanResponder();
    this.inputHeight = 0;
  }

  createPanResponder() {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gestureState) => true,
      onStartShouldSetPanResponderCapture: (e, gestureState) => false,
      onMoveShouldSetPanResponder: (e, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (e, gestureState) => false,
      onPanResponderGrant: (e, gestureState) =>
        this.onPanResponderGrant(e, gestureState),
      onPanResponderMove: (e, gestureState) =>
        this.onPanResponderMove(e, gestureState),
      onPanResponderTerminationRequest: (e, gestureState) => false,
      onPanResponderRelease: (e, gestureState) =>
        this.onPanResponderRelease(e, gestureState),
      onPanResponderTerminate: (e, gestureState) => null,
      onShouldBlockNativeResponder: (e, gestureState) => true
    });
  }

  onPanResponderGrant(e, gestureState) {
    const { showVoice, voiceStart } = this.props;
    if (showVoice) {
      voiceStart();
    }
  }
  onPanResponderMove(e, gestureState) {
    const {
      showVoice,
      voiceStatus,
      changeVoiceStatus,
      rootHeight
    } = this.props;
    if (showVoice) {
      const compare =
        Platform.OS === "ios" ? height - this.inputHeight : rootHeight;
      if (e.nativeEvent.pageY < compare) {
        if (!voiceStatus) return undefined;
        changeVoiceStatus(false);
      } else {
        if (voiceStatus) return undefined;
        changeVoiceStatus(true);
      }
    }
  }
  onPanResponderRelease(e, gestureState) {
    const { showVoice, voiceEnd } = this.props;
    if (showVoice) {
      voiceEnd();
    }
  }

  renderIcon = () => {
    const {
      sendIcon,
      plusIcon,
      usePlus,
      messageContent,
      sendUnableIcon,
      ImageComponent
    } = this.props;
    const sendAbleIcon = sendIcon ? (
      sendIcon
    ) : (
      <ImageComponent
        source={require("./img/sendAble.png")}
        style={{ width: 30, height: 30 }}
      />
    );
    const sendUnableIconDefault = sendUnableIcon ? (
      sendUnableIcon
    ) : (
      <ImageComponent
        source={require("./img/send.png")}
        style={{ width: 30, height: 30 }}
      />
    );
  };

  renderEmojieIcon = () => {
    const { isEmojiShow, keyboardIcon, emojiIcon, ImageComponent } = this.props;
    if (isEmojiShow) {
      return keyboardIcon ? (
        keyboardIcon
      ) : (
        <ImageComponent
          source={require("./img/keyboard.png")}
          style={{ width: 30, height: 30 }}
        />
      );
    } else {
      return emojiIcon ? (
        emojiIcon
      ) : (
        <ImageComponent
          source={require("./img//emoji.png")}
          style={{ width: 30, height: 30 }}
        />
      );
    }
  };

  render() {
    const {
      messageContent,
      onSubmitEditing = () => {},
      textChange = () => {},
      onMethodChange = () => {},
      onContentSizeChange = () => {},
      showVoice,
      inputStyle,
      inputOutContainerStyle,
      inputContainerStyle,
      inputHeightFix,
      xHeight,
      isVoiceEnd,
      useVoice,
      useEmoji,
      usePlus,
      inputChangeSize,
      placeholder,
      pressInText,
      pressOutText,
      isShowPanel,
      isPanelShow,
      paddingHeight,
      onFocus,
      isEmojiShow,
      isIphoneX,
      ImageComponent
    } = this.props;
    const enabled = (() => {
      if (Platform.OS === "android") {
        if (isPanelShow) {
          return true;
        }
        if (isEmojiShow) {
          return true;
        }
        return false;
      } else {
        return false;
      }
    })();
    return (
      <Animated.View
        style={[
          styles.commentBar,
          inputOutContainerStyle,
          Platform.OS === "ios"
            ? { paddingBottom: isIphoneX ? xHeight : 0 }
            : {}
        ]}
        onLayout={e => (this.inputHeight = e.nativeEvent.layout.height)}
      >
        <View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 8,
              paddingHorizontal: 10
            },
            inputContainerStyle
          ]}
        >
          {useVoice ? (
            <View
              style={{
                height: 35 + inputHeightFix,
                justifyContent: "center",
                alignItems: "center"
              }}
              activeOpacity={0.7}
            >
              <TouchableOpacity onPress={onMethodChange} activeOpacity={0.7}>
                {showVoice ? (
                  this.props.keyboardIcon ? (
                    this.props.keyboardIcon
                  ) : (
                    <ImageComponent
                      source={require("./img/keyboard.png")}
                      style={{ width: 30, height: 30 }}
                    />
                  )
                ) : this.props.voiceIcon ? (
                  this.props.voiceIcon
                ) : (
                  <ImageComponent
                    source={require("./img/voice.png")}
                    style={{ width: 30, height: 30 }}
                  />
                )}
              </TouchableOpacity>
            </View>
          ) : null}
          <View
            style={{
              marginHorizontal: 8,
              borderRadius: 18,
              borderColor: "#ccc",
              flex: 1,
              borderWidth: StyleSheet.hairlineWidth,
              paddingVertical: 0.8
            }}
          >
            <View
              style={{
                borderRadius: 18,
                backgroundColor: isVoiceEnd ? "#bbb" : "#f5f5f5"
              }}
              {...this.panResponder.panHandlers}
            >
              <View
                style={[
                  {
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                    height: 35 + 20,
                    borderRadius: 18
                  }
                ]}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", color: "#555" }}
                >
                  {isVoiceEnd ? `${pressOutText}` : `${pressInText}`}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  commentBar: {
    width: width,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    borderColor: "#ccc",
    borderTopWidth: StyleSheet.hairlineWidth
  },
  commentBar__input: {
    borderRadius: 18,
    height: 26,
    width: "100%",
    padding: 0,
    paddingHorizontal: 20
    // backgroundColor: '#f9f9f9'
  }
});
