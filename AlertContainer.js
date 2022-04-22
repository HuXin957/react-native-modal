import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Modal from "./index";
import y from "react-native-line-style";

export default class AlertContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
    };
  }

  onBackAndroid = () => {
    const { onBackHandler } = this.props;
    if (typeof onBackHandler === "function") {
      const flag = onBackHandler();
      if (flag) {
        this.onClose();
      }
      return flag;
    }
    if (this.state.visible) {
      this.onClose();
      return true;
    }
    return false;
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const { title, actions, content } = this.props;
    const footer = actions.map((button) => {
      const orginPress = button.onPress || function () {};

      button.onPress = () => {
        const res = orginPress();
        if (res && res.then) {
          res.then(() => {
            this.onClose();
          });
        } else {
          this.onClose();
        }
      };
      return button;
    });

    return (
      <Modal
        animationType={"fade"}
        visible={this.state.visible}
        onClose={this.onBackAndroid}
        maskClosable={false}
      >
        <View
          style={[
            y.bgColor("#fff"),
            y.radiusA(16),
            y.pt(16),
            y.minh(140),
            y.minw(240),
            y.maxw(300),
            y.uac,
          ]}
        >
          <Text style={[y.color("#222"), y.fSize(16), y.fWeight("bold")]}>
            {title}
          </Text>
          {content ? (
            <View style={[y.uf1, y.mt(12), y.plr(12)]}>
              <Text style={[y.fSize(14), y.color("#222"), y.utxc]}>
                {content}
              </Text>
            </View>
          ) : null}
          <View
            style={[y.udr, y.uac, y.bt(1), y.bdColor("#F5F6F7")]}
          >
            {footer.map((item, index) => (
              <TouchableOpacity
                onPress={item.onPress}
                style={[
                  y.uf1,
                  y.ujc,
                  y.uac,
                  y.ptb(12),
                  y.br(index !== footer.length - 1 ? 1 : 0),
                  y.bdColor("#F5F6F7"),
                ]}
              >
                <Text style={[y.fSize(14), item.style]}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    );
  }
}
