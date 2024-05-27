import React, {
  useCallback, useEffect, useMemo, useRef
} from 'react';
import { View } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useOrientation } from '../../../hooks/use-orientation';
import ActionsBar from '../index';
import { setExpandActionsBar, setDetailedInfo } from '../../../store/redux/slices/wide-app/layout';
import DebugControl from '../debug-control';
import Screenshare from '../screenshare-button';
import DeviceSelectorControl from '../audio-device-selector-control';
import Settings from '../../../../settings.json';
import Styled from './styles';

const BottomSheetActionsBar = ({ alwaysOpen }) => {
  // ref
  const bottomSheetRef = useRef(null);
  const route = useRoute();
  const orientation = useOrientation();
  const dispatch = useDispatch();

  const detailedInfo = useSelector((state) => state.layout.detailedInfo);
  const expandedActionsBar = useSelector((state) => state.layout.expandActionsBar);
  const isModalShow = useSelector((state) => state.modal.isShow);

  const isFullscreen = route.name === 'FullscreenWrapperScreen';
  const { showDebugToggle, showNotImplementedFeatures } = Settings;

  // variables
  const handleSizeOfActionsBar = () => {
    const variables = [showDebugToggle, showNotImplementedFeatures, true];
    return variables.reduce((base, item) => base + (item ? 85 : 0), 110);
  };

  const snapPoints = useMemo(() => {
    if (orientation === 'PORTRAIT') {
      return [110, handleSizeOfActionsBar()];
    }
    return [110];
  }, [orientation]);

  // callbacks
  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      dispatch(setDetailedInfo(false));
    }
  }, []);

  useEffect(() => {
    if (detailedInfo) {
      bottomSheetRef.current?.snapToIndex?.(0);
    } else {
      bottomSheetRef.current?.close?.();
    }
  }, [detailedInfo]);

  useEffect(() => {
    if (expandedActionsBar) {
      bottomSheetRef.current?.snapToIndex?.(1);
      dispatch(setExpandActionsBar(false));
    }
  }, [expandedActionsBar]);

  useEffect(() => {
    if (isModalShow) {
      dispatch(setDetailedInfo(false));
      bottomSheetRef.current?.snapToIndex?.(-1);
    }
  }, [isModalShow]);

  // renders
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={detailedInfo ? 0 : -1}
      enablePanDownToClose={!alwaysOpen}
      snapPoints={snapPoints}
      handleIndicatorStyle={Styled[isFullscreen ? 'fullscreenStyles' : 'styles'].indicatorStyle}
      style={Styled[isFullscreen ? 'fullscreenStyles' : 'styles'].style}
      handleStyle={Styled[isFullscreen ? 'fullscreenStyles' : 'styles'].handleStyle}
      backgroundStyle={Styled[isFullscreen ? 'fullscreenStyles' : 'styles'].backgroundStyle}
      onChange={handleSheetChanges}
    >
      <View style={Styled[isFullscreen ? 'fullscreenStyles' : 'styles'].contentContainer}>
        <ActionsBar />
        <BottomSheetScrollView>
          <Styled.ControlsContainer>
            <DeviceSelectorControl />
            <DebugControl />
            <Screenshare />
          </Styled.ControlsContainer>
        </BottomSheetScrollView>
      </View>
    </BottomSheet>
  );
};

export default BottomSheetActionsBar;
