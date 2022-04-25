import React from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  TouchableWithoutFeedback,
  View,
  Keyboard,
  Platform,
} from "react-native";
import Portal from "@huxin957/react-native-portal";
import y from "react-native-line-style";

const isIOS = Platform.OS === "ios";
const screen = Dimensions.get("window");

export default class RCModal extends React.Component {
  static defaultProps = {
    animationType: "slide-up",
    animateAppear: true,
    animationDuration: 300,
    visible: false,
    maskClosable: true,
    onClose() {},
    onAnimationEnd(_visible) {},
  };

  animMask = null;
  animDialog = null;

  constructor(props) {
    super(props);
    const { visible } = props;

    this.state = {
      position: new Animated.Value(this.getPosition(visible)),
      scale: new Animated.Value(this.getScale(visible)),
      opacity: new Animated.Value(this.getOpacity(visible)),
      modalVisible: visible,
      keyboardHeight: 0,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.shouldComponentUpdate(nextProps, null)) {
      this.setState({
        modalVisible: true,
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.visible || this.props.visible !== nextProps.visible) {
      return true;
    }
    if (nextState) {
      if (nextState.modalVisible !== this.state.modalVisible) {
        return true;
      }
    }
    return false;
  }

  componentDidMount() {
    if (isIOS) {
      Keyboard.addListener("keyboardDidShow", this._keyboardDidShow.bind(this));
      Keyboard.addListener("keyboardDidHide", this._keyboardDidHide.bind(this));
    }

    if (this.props.animateAppear && this.props.animationType !== "none") {
      BackHandler.addEventListener(
        "hardwareBackPress",
        this.onBackAndroid.bind(this)
      );
      this.componentDidUpdate({});
    }
  }

  componentDidUpdate(prevProps) {
    const { props } = this;
    if (prevProps.visible !== props.visible) {
      this.animateDialog(props.visible);
    }
  }

  componentWillUnmount() {
    if (isIOS) {
      Keyboard.removeListener(
        "keyboardDidShow",
        this._keyboardDidShow.bind(this)
      );
      Keyboard.removeListener(
        "keyboardDidHide",
        this._keyboardDidHide.bind(this)
      );
    }

    BackHandler.removeEventListener(
      "hardwareBackPress",
      this.onBackAndroid.bind(this)
    );
    this.stopDialogAnim();
  }

  _keyboardDidShow = (e) => {
    this.setState({ keyboardHeight: e.endCoordinates.height });
  };

  _keyboardDidHide = () => {
    this.setState({ keyboardHeight: 0 });
  };

  onBackAndroid = () => {
    const { onRequestClose } = this.props;
    if (typeof onRequestClose === "function") {
      return onRequestClose();
    }

    if (this.state.modalVisible) {
      this.onMaskClose();
      return true;
    }
    return false;
  };
  animateMask = (visible) => {
    this.stopMaskAnim();
    this.state.opacity.setValue(this.getOpacity(!visible));
    this.animMask = Animated.timing(this.state.opacity, {
      toValue: this.getOpacity(visible),
      duration: this.props.animationDuration,
      useNativeDriver: true,
    });
    this.animMask.start(() => {
      this.animMask = null;
    });
  };
  stopMaskAnim = () => {
    if (this.animMask) {
      this.animMask.stop();
      this.animMask = null;
    }
  };
  stopDialogAnim = () => {
    if (this.animDialog) {
      this.animDialog.stop();
      this.animDialog = null;
    }
  };
  animateDialog = (visible) => {
    this.stopDialogAnim();
    this.animateMask(visible);

    let { animationType, animationDuration } = this.props;
    if (animationType !== "none") {
      if (animationType === "slide-up" || animationType === "slide-down") {
        this.state.position.setValue(this.getPosition(!visible));
        this.animDialog = Animated.timing(this.state.position, {
          toValue: this.getPosition(visible),
          duration: animationDuration,
          easing: visible ? Easing.elastic(0.8) : undefined,
          useNativeDriver: true,
        });
      } else if (animationType === "fade") {
        this.animDialog = Animated.parallel([
          Animated.timing(this.state.opacity, {
            toValue: this.getOpacity(visible),
            duration: animationDuration,
            easing: visible ? Easing.elastic(0.8) : undefined,
            useNativeDriver: true,
          }),
          Animated.spring(this.state.scale, {
            toValue: this.getScale(visible),
            useNativeDriver: true,
          }),
        ]);
      }

      this.animDialog.start(() => {
        this.animDialog = null;
        if (!visible) {
          this.setState({
            modalVisible: false,
          });
          BackHandler.removeEventListener(
            "hardwareBackPress",
            this.onBackAndroid
          );
        }
        if (this.props.onAnimationEnd) {
          this.props.onAnimationEnd(visible);
        }
      });
    } else {
      if (!visible) {
        this.setState({
          modalVisible: false,
        });
        BackHandler.removeEventListener(
          "hardwareBackPress",
          this.onBackAndroid
        );
      }
    }
  };
  close = () => {
    this.animateDialog(false);
  };
  onMaskClose = () => {
    if (this.props.maskClosable && this.props.onClose) {
      this.props.onClose();
      BackHandler.removeEventListener(
        "hardwareBackPress",
        this.onBackAndroid.bind(this)
      );
    }
  };
  getPosition = (visible) => {
    if (visible) {
      return 0;
    }
    return this.props.animationType === "slide-down"
      ? -screen.height
      : screen.height;
  };
  getScale = (visible) => {
    return visible ? 1 : 1.05;
  };
  getOpacity = (visible) => {
    return visible ? 1 : 0;
  };

  render() {
    const { animationType, style = [] } = this.props;
    const { keyboardHeight, scale, opacity, position, modalVisible } =
      this.state;

    if (!modalVisible) {
      return null;
    }

    const animationStyleMap = {
      none: {},
      "slide-up": { transform: [{ translateY: position }] },
      "slide-down": { transform: [{ translateY: position }] },
      fade: {
        opacity,
        transform: [{ scale }],
      },
    };

    const positionMap = {
      none: [],
      "slide-up": [y.uje],
      fade: [y.ujc, y.uac],
      "slide-down": [y.ujs],
    };
    // 不能使用KeyboardAvoidingView 的原因：modal 里没有输入框
    return (
      <Portal>
        <View
          style={[
            y.uf1,
            y.pb_(keyboardHeight),
            ...style,
            ...positionMap[animationType],
          ]}
        >
          <TouchableWithoutFeedback onPress={this.onMaskClose}>
            <Animated.View
              style={[
                y.upa,
                y.top(0),
                y.left(0),
                y.right(0),
                y.bottom(0),
                { opacity },
              ]}
            >
              <View
                style={[
                  y.upa,
                  y.top(0),
                  y.left(0),
                  y.right(0),
                  y.bottom(0),
                  y.bgColor("rgba(0,0,0,.5)"),
                ]}
              />
            </Animated.View>
          </TouchableWithoutFeedback>
          <Animated.View style={[animationStyleMap[animationType]]}>
            {this.props.children}
          </Animated.View>
        </View>
      </Portal>
    );
  }
}
