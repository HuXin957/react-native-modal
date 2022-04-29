import React from "react";
import Mask from './ModalView';

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

export default Modal;