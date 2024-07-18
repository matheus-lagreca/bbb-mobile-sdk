import styled from 'styled-components/native';
import { Divider } from 'react-native-paper';
import { css } from 'styled-components';
import userAvatar from '../../components/user-avatar';
import Colors from '../../constants/colors';
import Pressable from '../../components/pressable';
import iconButton from '../../components/icon-button';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 20px 10px;

  ${({ orientation }) => orientation === 'LANDSCAPE'
    && `
    flex-direction: row;
    justify-content: center;
  `}
`;

const CardPressable = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
  },
}))`
  ${() => css`
    background-color: ${Colors.white};
    min-height: 20px;
    border-radius: 12px;
    border: 4px ${Colors.white} solid;
    padding: 8px;
    flex-direction: row;
    align-items: center;
    margin-bottom: 12px;

    ${({ isMe }) => isMe && `
      border-color: ${Colors.orange};
    `}
  `}
`;

const UserName = styled.Text`
  color: black;
  padding-left: 20px;
  font-size: 16px;
`;

const UserAvatar = styled(userAvatar)``;
const FlatList = styled.FlatList`
  width: 100%;
  border-radius: 12px;
  padding: 12px;
  padding-top: 16px;
  display: flex;
`;

const Block = styled.View`
  display: flex;
  flex-direction: column;

  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
    width: 90%;
    max-height: 95%;
  `}
`;

const GuestMenuContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px;
`;

const GuestPolicyIcon = styled(iconButton)`
  position: absolute;
  right: 0px;
`;

const GuestPolicyText = styled.Text`
  font-size: 18px;
  font-weight: 500;
  color: ${Colors.white};
  padding-left: 12px;
`;

const DividerTop = styled(Divider)`
  display: flex;
  margin-left: 12px;
  margin-right: 12px;
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-color: ${Colors.white};
`;

const LoadingWrapper = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  alignItems: center;
  justifyContent: center;
`;

export default {
  UserAvatar,
  UserName,
  CardPressable,
  FlatList,
  ContainerView,
  GuestMenuContainer,
  GuestPolicyText,
  DividerTop,
  Block,
  GuestPolicyIcon,
  LoadingWrapper
};
