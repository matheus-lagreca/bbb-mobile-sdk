import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableRipple } from 'react-native-paper';
import { View } from 'react-native';
import Colors from '../../../constants/colors';

const ContainerPressable = styled(TouchableRipple).attrs(({ isActive, isStarting, disabled }) => ({
  disabled: disabled || false,
}))`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  background-color: ${({ isActive }) => isActive ? '#2E7D32' : Colors.blueGray};
  border-radius: 12px;
  padding: 12px;
  width: 100%;
  gap: 12px;
  opacity: ${({ isStarting, disabled }) => (isStarting || disabled) ? 0.6 : 1};
  border: ${({ isActive }) => isActive ? '2px solid #4CAF50' : 'none'};
`;

const ScreenshareIcon = styled(MaterialIcons)`
  padding: 4px;
`;

const ScreenshareIconContainer = styled(View)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ScreenshareText = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${({ isActive }) => isActive ? '#4CAF50' : Colors.white};
  flex: 1;
`;

export default {
  ScreenshareIcon,
  ScreenshareText,
  ContainerPressable,
  ScreenshareIconContainer
};
