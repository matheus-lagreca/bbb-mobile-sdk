import styled from 'styled-components/native';
import userAvatar from '../../user-avatar';
import textInput from '../../text-input';
import Colors from '../../../constants/colors';

const Card = styled.View`
  padding: 8px;
`;

const FlatList = styled.FlatList`
  width: 100%;
`;

const MessageAuthor = styled.Text`
  color: ${Colors.lightGray400};
  font-weight: 500;
`;

const UserAvatar = styled(userAvatar)``;

const MessageContent = styled.Text`
  color: ${Colors.lightGray300};
`;

const ContainerItem = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 90%;
  padding: 12px;
`;

const Container = styled.View`
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0;
`;

const SendMessageContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 8px 8px 32px 8px;
`;

const TextInput = styled(textInput)`
  width: 85%;
`;

export default {
  Card,
  FlatList,
  UserAvatar,
  ContainerItem,
  MessageAuthor,
  MessageContent,
  Container,
  SendMessageContainer,
  TextInput,
};
