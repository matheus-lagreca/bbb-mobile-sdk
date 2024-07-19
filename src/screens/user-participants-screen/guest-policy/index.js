import { useMutation } from '@apollo/client';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useOrientation } from '../../../hooks/use-orientation';
import ScreenWrapper from '../../../components/screen-wrapper';
import Styled from './styles';
import { selectUsersProp } from '../../../store/redux/slices/meeting';
import Service from './service';
import Colors from '../../../constants/colors';
import useCurrentUser from '../../../graphql/hooks/useCurrentUser'
import { SET_POLICY } from './queries';

const guestPolicies = {
  ASK_MODERATOR: 'ASK_MODERATOR',
  ALWAYS_ACCEPT: 'ALWAYS_ACCEPT',
  ALWAYS_DENY: 'ALWAYS_DENY'
};

console.log("Policy")
const GuestPolicyScreen = ({ navigation }) => {
  const guestPolicy = useSelector((state) => selectUsersProp(state, 'guestPolicy'));
  const orientation = useOrientation();
  const { t } = useTranslation();
  const [dispatchSetPolicy] = useMutation(SET_POLICY);

  const { data: currentUserData, loading, error } = useCurrentUser();
  const currentUser = currentUserData?.user_current[0];

  const handleDispatchSetPolicy = (guestPolicy) => {
    dispatchSetPolicy({
      variables: {
        guestPolicy
      }
    })
  };

  // lifecycle methods
  useEffect(() => {
    // user got demoted to viewer, go out of this screen as he does not have
    // permission to use it
    if (!currentUser?.isModerator) {
      navigation.goBack();
    }
  }, [currentUser]);

  return (
    <ScreenWrapper>
      <Styled.ContainerView orientation={orientation}>
        <Styled.GuestPolicyView orientation={orientation}>
          <Styled.GuestPolicyTop>
            <Styled.BackIcon
              icon="arrow-left"
              iconColor={Colors.white}
              onPress={() => { navigation.goBack(); }}
            />
            <Styled.GuestPolicyTopText>{t('app.guest-policy.title')}</Styled.GuestPolicyTopText>
          </Styled.GuestPolicyTop>
          <Styled.DividerTop />
          <Styled.OptionsButtonsContainer>
            <Styled.OptionsButton
              selected={guestPolicy === guestPolicies.ASK_MODERATOR}
              disabled={guestPolicy === guestPolicies.ASK_MODERATOR}
              onPress={() => {
                handleDispatchSetPolicy(guestPolicies.ASK_MODERATOR);
              }}
            >
              {t('app.guest-policy.button.askModerator')}
            </Styled.OptionsButton>
            <Styled.OptionsButton
              selected={guestPolicy === guestPolicies.ALWAYS_ACCEPT}
              disabled={guestPolicy === guestPolicies.ALWAYS_ACCEPT}
              onPress={() => {
                handleDispatchSetPolicy(guestPolicies.ALWAYS_ACCEPT);
              }}
            >
              {t('app.userList.guest.allowEveryone')}
            </Styled.OptionsButton>
            <Styled.OptionsButton
              selected={guestPolicy === guestPolicies.ALWAYS_DENY}
              disabled={guestPolicy === guestPolicies.ALWAYS_DENY}
              onPress={() => {
                handleDispatchSetPolicy(guestPolicies.ALWAYS_DENY);
              }}
            >
              {t('app.userList.guest.denyEveryone')}
            </Styled.OptionsButton>
          </Styled.OptionsButtonsContainer>
        </Styled.GuestPolicyView>
      </Styled.ContainerView>
    </ScreenWrapper>
  );
};

export default GuestPolicyScreen;
