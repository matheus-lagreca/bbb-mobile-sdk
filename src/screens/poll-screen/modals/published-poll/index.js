import React from 'react';
import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import PreviousPollCard from '../../previous-polls-screen/poll-card';
import { hide } from '../../../../store/redux/slices/wide-app/modal';
import { isPresenter } from '../../../../store/redux/slices/current-user';
import Styled from './styles';

const PublishedPollModal = () => {
  const dispatch = useDispatch();
  const modalCollection = useSelector((state) => state.modal);
  const lastPublishedPoll = modalCollection.extraInfo.lastPublishedPoll;
  const amIPresenter = useSelector(isPresenter);

  if (amIPresenter) {
    dispatch(hide());
    return null;
  }

  return (
    <Modal
      visible={modalCollection.isShow}
      onDismiss={() => dispatch(hide())}
    >
      <Styled.Container onPress={() => dispatch(hide())}>
        <Styled.InsideContainer>
          <PreviousPollCard pollObj={lastPublishedPoll} />
        </Styled.InsideContainer>
      </Styled.Container>
    </Modal>
  );
};

export default PublishedPollModal;
