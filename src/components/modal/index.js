import React from 'react';
import { useSelector } from 'react-redux';
import BreakoutInviteModal from '../../screens/breakout-room-screen/breakout-invite-modal';
import CantCreatePollModal from './poll/cant-create-poll';
import RecordControlsModal from './record-controls-modal';
import RecordStatusModal from './record-status-modal';
import Settings from '../../../settings.json';
import Styled from './styles';

const ModalControllerComponent = () => {
  const modalCollection = useSelector((state) => state.modal);

  if (modalCollection.profile === 'breakout_invite' && Settings.showBreakouts) {
    return (
      <BreakoutInviteModal />
    );
  }
  if (modalCollection.profile === 'create_poll_permission') {
    return (
      <CantCreatePollModal />
    );
  }
  if (modalCollection.profile === 'record_controls') {
    return (
      <RecordControlsModal />
    );
  }
  if (modalCollection.profile === 'record_status') {
    return (
      <RecordStatusModal />
    );
  }

  return null;
};

export default ModalControllerComponent;
