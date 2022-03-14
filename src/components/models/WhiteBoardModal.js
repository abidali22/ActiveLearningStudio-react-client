/* eslint-disable */
import React, { useState, useEffect } from 'react';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
const WhiteBoardModal = ({ show, onHide, url, loading }) => {
  return (
    <Modal
      open={show}
      onClose={onHide}
      size="lg"
      center
      classNames={{
        overlay: 'customOverlaySize',
        modal: 'customModalSize',
      }}
    >
      <div className="model-box-view">
        <div className="modal-header"></div>
        <div className="model-body">
          {loading && <p className="loading-classes">Loading White Board....</p>}
          <iframe src={url} height="650px" width="100%" title="White Board"></iframe>
        </div>
      </div>
    </Modal>
  );
};

export default WhiteBoardModal;
