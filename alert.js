import React from "react";
import AlertContainer from "./AlertContainer";
import Portal from "@huxin957/react-native-portal";

const alert = (title, content, actions, onBackHandler) => {
  const key = Portal.add(
    <AlertContainer
      title={title}
      content={content}
      actions={actions}
      onAnimationEnd={(visible) => {
        if (!visible) {
          Portal.remove(key);
        }
      }}
      onBackHandler={onBackHandler}
    />
  );
  return key;
};

export default alert;