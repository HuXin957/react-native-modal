import React from "react";
import Mask from './ModalView';
import AlertContainer from './AlertContainer';
import Portal from '@huxin957/react-native-portal';


const Modal = (props) => (
  <Mask
    visible={props.visible}
    animationType={props.animationType}
    maskClosable
    animateAppear
    onClose={() => {
      props.onClose && props.onClose();
    }}
    {...props}
  >
    {props.children}
  </Mask>
)

const alert = (title, content, actions, onBackHandler) => {
  const key = Portal.add(
    <AlertContainer
      title={title}
      content={content}
      actions={actions}
      onAnimationEnd={(visible) => {
        if (!visible) {
          Portal.remove(key)
        }
      }}
      onBackHandler={onBackHandler}
    />,
  )
  return key
}


Modal.alert = alert;

export default Modal;

