import { useMutation, useSubscription } from '@apollo/client';
import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrientation } from '../../../hooks/use-orientation';
import ScreenWrapper from '../../../components/screen-wrapper';
import Styled from './styles';
import Colors from '../../../constants/colors';
import { SUBMIT_APPROVAL_STATUS } from '../../../graphql/mutations/guestPolicy';
import useGuestWaitingList from '../../../graphql/hooks/useGuestWaitingList'
import useCurrentUser from '../../../graphql/hooks/useCurrentUser'

const ALLOW_STATUS = 'ALLOW';
const DENY_STATUS = 'DENY';

console.log("WAITING SCREEN")
const WaitingUsersScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { data: currentUserData, loading, error } = useCurrentUser();
  const { data: pendingUsersData } = useGuestWaitingList();
  const currentUser = currentUserData?.user_current[0];
  const pendingUsers = pendingUsersData?.user_guest;
  // const [dispatchSubmitApprovalStatus] = useMutation(SUBMIT_APPROVAL_STATUS);

  // update this method  to handle arrays
  // const handleDispatchSubmitApprovalStatus = (guests) => {
  //   dispatchSubmitApprovalStatus({
  //     variables: {
  //       guests
  //     }
  //   })
  // };

  const handleUsersName = useCallback(() => {
    if (!pendingUsers) return [];

    return pendingUsers.map(({ user: { name, role, color } }) => ({
      name: name,
      role: role,
      color: color,
    }));
  }, [pendingUsersData]);

  const orientation = useOrientation();

  const renderItem = ({ item, index }) => {
    return (
      <Styled.UserCard>
        <Styled.UserAvatar
          userName={item.name}
          userRole={item.role}
          userColor={item.color}
        />
        <Styled.UserName>{item.name}</Styled.UserName>
        <Styled.AllowButton
          icon="check-circle-outline"
          iconColor={Colors.green}
          animated
          size={32}
          // onPress={() => { handleDispatchSubmitApprovalStatus([pendingUsers[index]], ALLOW_STATUS); }}
          onPress={() => {}}
        />
        <Styled.DenyButton
          icon="close-circle-outline"
          iconColor={Colors.red}
          animated
          size={32}
          // onPress={() => { handleDispatchSubmitApprovalStatus([pendingUsers[index]], DENY_STATUS); }}
          onPress={() => {}}
        />
      </Styled.UserCard>
    );
  };

  // lifecycle methods
  useEffect(() => {
    // user got demoted to viewer, go out of this screen as he does not have
    // permission to use it
    if (!loading) {
      if (!currentUser?.isModerator || error) {
        console.log("go back")
        navigation.goBack();
      }
    }
  }, [currentUserData, loading, error]);

  return (
    <ScreenWrapper>
      <Styled.ContainerView orientation={orientation}>
        <Styled.WaitingUsersView orientation={orientation}>
          <Styled.WaitingUsersTop>
            <Styled.BackIcon
              icon="arrow-left"
              iconColor={Colors.white}
              onPress={() => { navigation.goBack(); }}
            />
            <Styled.WaitingUsersTopText>{t('mobileSdk.userList.waitingAtendees')}</Styled.WaitingUsersTopText>
          </Styled.WaitingUsersTop>
          <Styled.DividerTop />
          <Styled.AccRejContainer>
            <Styled.AccRejButtons>
              <Styled.AccRejButtonsText
                disabled={pendingUsers?.length === 0}
                onPress={() => {
                  // handleAllowPendingUsers(pendingUsers, ALLOW_STATUS)
                  navigation.goBack();
                }}
              >
                {t('app.userList.guest.allowEveryone')}
              </Styled.AccRejButtonsText>
            </Styled.AccRejButtons>
            <Styled.AccRejButtons>
              <Styled.AccRejButtonsText
                disabled={pendingUsers?.length === 0}
                onPress={() => {
                  // handleAllowPendingUsers(pendingUsers, DENY_STATUS)
                  navigation.goBack();
                }}
              >
                {t('app.userList.guest.denyEveryone')}
              </Styled.AccRejButtonsText>
            </Styled.AccRejButtons>
          </Styled.AccRejContainer>
          {pendingUsers?.length > 0
            ? <Styled.FlatList data={handleUsersName()} renderItem={renderItem} />
            : (
              <Styled.NoPendingUsersText>
                {t('app.userList.guest.noPendingUsers')}
              </Styled.NoPendingUsersText>
            )}
        </Styled.WaitingUsersView>
      </Styled.ContainerView>
    </ScreenWrapper>
  );
};

export default WaitingUsersScreen;
