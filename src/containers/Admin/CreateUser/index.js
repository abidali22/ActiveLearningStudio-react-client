/*eslint-disable*/
import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal, Button, Alert } from 'react-bootstrap';
import EmailCheckForm from 'containers/Admin/CreateUser/EmailCheckForm';
import CreateUserForm from 'containers/Admin/formik/createuser';
import { removeActiveAdminForm } from 'store/actions/admin';
import './style.scss';

const CreateUser = (props) => {
  const {
    match,
    mode,
  } = props;
  const dispatch = useDispatch();
  const [step, setStep] = useState('emailCheck');
  // Init
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [match]);

  const handleEmailChecked = (result) => {
    if (result === 'new-user') {
      setStep('createUser');
    }

    if (result === 'added-to-org') {
      setStep('done');
    }
  };

  return (
    <>
      {mode === 'create_user' && step === 'emailCheck' && (
        <Modal className="create-user-modal" show={true} onHide={() => dispatch(removeActiveAdminForm())}>
          <Modal.Header className="create-user-modal-header" closeButton>
            <Modal.Title>Add User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <EmailCheckForm handleEmailChecked={handleEmailChecked} />
          </Modal.Body>
        </Modal>
      )}
      {mode === 'create_user' && step === 'createUser' && (
        <div className="form-new-popup-admin">
          <div className="inner-form-content">
            <CreateUserForm />
          </div>
        </div>
      )}
      {mode === 'create_user' && step === 'done' && (
        <Modal className="create-user-done" show={true} onHide={() => dispatch(removeActiveAdminForm())}>
          <Modal.Header closeButton>
          </Modal.Header>
          <Modal.Body className="text-center">
            <FontAwesomeIcon icon="check-circle" className="mr-2" />
            <h1>User added successfully</h1>
            <Button variant="primary" onClick={() => dispatch(removeActiveAdminForm())}>Close</Button>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

CreateUser.propTypes = {
  match: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  currentOrg: state.organization.currentOrganization,
});

export default withRouter(connect(mapStateToProps)(CreateUser));
