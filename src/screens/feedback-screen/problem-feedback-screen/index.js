import React, { useCallback, useState } from 'react';
import {
  BackHandler, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import logger from '../../../services/logger';
import Settings from '../../../../settings.json';
import Colors from '../../../constants/colors';
import Styled from './styles';
import customFeedbackData from '../customFeedback.json';
import Service from '../service';

const POST_ROUTE = Settings.feedback.custom.route;

const ProblemFeedbackScreen = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  let questionTitle;
  let feedbackOptions;
  const skipButton = t('app.customFeedback.defaultButtons.skip');
  const { rating } = route.params.payload;
  if (rating >= 8) {
    questionTitle = t('app.customFeedback.like.title');

    feedbackOptions = customFeedbackData.like.options.map((option) => ({
      label: option.textLabel ? t(option.textLabel.id) : '',
      code: option.value,
      next: option.next,
    }));
  } else {
    questionTitle = t('mobileSdk.feedback.questionTitle');

    feedbackOptions = customFeedbackData.problem.options.map((option) => ({
      label: option.textLabel ? t(option.textLabel.id) : '',
      code: option.value,
      next: option.next,
    }));
  }

  const initialState = {};
  feedbackOptions.forEach((option) => {
    initialState[option.code] = false;
  });

  const [optionsStatus, changeStatus] = useState(initialState);
  const [stepDetalied, setStepDetalied] = useState('');

  // disables android go back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // do nothing
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  const flipOption = (optionCode) => {
    changeStatus((prevState) => {
      const otherOptions = prevState[optionCode] ? prevState : initialState;
      return ({
        ...otherOptions,
        [optionCode]: !prevState[optionCode],
      });
    });
  };

  const checkOption = (optionCode) => {
    if (!optionsStatus[optionCode]) {
      flipOption(optionCode);
    }
  };

  const activateSendProblem = () => {
    const anyOptionChecked = Service.isAnyOptionChecked(optionsStatus);
    const otherSelected = optionsStatus['other'];

    if (anyOptionChecked && !otherSelected) return true;

    return (otherSelected && stepDetalied.trim().length > 0);
  };

  const getProblem = () => {
    const answer = {};
    Object.entries(optionsStatus).forEach(([key, value]) => {
      if (value === true) {
        answer.problem = key;
        if (key === 'other') {
          answer.problem_described = stepDetalied;
        }
      }
    });

    return answer;
  };

  const getLike = () => {
    const answer = {};
    Object.entries(optionsStatus).forEach(([key, value]) => {
      if (value === true) {
        answer.like = key;
        if (key === 'other') {
          answer.like_described = stepDetalied;
        }
      }
    });

    return answer;
  };

  const buildStepData = () => {
    let stepCode;
    let stepOption;
    let stepType;

    if (rating < 8) {
      stepCode = getProblem().problem;
      stepOption = customFeedbackData.problem.options.find(
        (option) => option.value === getProblem().problem
      );
      stepType = stepOption.next;
    } else {
      stepCode = getLike().like;
      stepOption = customFeedbackData.like.options.find(
        (option) => option.value === getLike().like
      );
      stepType = stepOption.next;
    }

    const stepData = {
      stepCode,
      stepOption,
      stepType,
    };

    return stepData;
  };

  const buildFeedback = () => {
    const payload = { ...route.params.payload };
    let feedbackData;

    if (payload.rating < 8) {
      feedbackData = getProblem();
    } else {
      feedbackData = getLike();
    }

    const newFeedback = {
      ...payload,
      feedback: {
        ...feedbackData,
      },
    };

    return { ...payload, ...newFeedback };
  };

  const sendFeedback = () => {
    const { host } = route.params.meetingData;
    const payload = buildFeedback();

    axios.post(`https://${host}${POST_ROUTE}`, payload).catch((e) => {
      logger.warn({
        logCode: 'app_user_feedback_not_sent_error',
        extraInfo: {
          errorName: e.name,
          errorMessage: e.message,
        },
      }, `Unable to send feedback: ${e.message}`);
    });
  };

  const handleSendProblem = () => {
    if (activateSendProblem()) {
      const { host } = route.params.meetingData;
      const payload = buildFeedback();
      const stepData = buildStepData();
      sendFeedback();
      if (stepData.stepType === 'email') {
        navigation.navigate('EmailFeedbackScreen', { payload, host });
      } else {
        navigation.navigate('SpecificProblemFeedbackScreen', { payload, host, stepData });
      }
    }
  };

  const handleSkip = () => {
    // The feedback was skipped. We need to send it as is.
    sendFeedback();
    navigation.navigate('EndSessionScreen');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Styled.ContainerView>
        <Styled.Title>{questionTitle}</Styled.Title>
        <Styled.OptionsContainer>
          {
          feedbackOptions.map((option) => {
            return (
              <Styled.CheckContainerItem key={option.code}>
                <Styled.Option
                  status={optionsStatus[option.code] ? 'checked' : 'unchecked'}
                  color={Colors.white}
                  onPress={() => flipOption(option.code)}
                />
                <Styled.LabelOption>{option.label}</Styled.LabelOption>
              </Styled.CheckContainerItem>
            );
          })
          }
        </Styled.OptionsContainer>

        <KeyboardAvoidingView
          style={{ width: '100%' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Styled.TextInputOther
            onFocus={() => checkOption('other')}
            multiline
            value={stepDetalied}
            onChangeText={(newText) => {
              setStepDetalied(newText);
            }}
          />
        </KeyboardAvoidingView>

        <Styled.ButtonContainer>
          <Styled.ConfirmButton
            disabled={!activateSendProblem()}
            onPress={handleSendProblem}
          >
            {t('app.customFeedback.defaultButtons.next')}
          </Styled.ConfirmButton>
        </Styled.ButtonContainer>

        <Styled.QuitSessionButtonContainer>
          <Styled.QuitSessionButton
            onPress={handleSkip}
          >
            {skipButton}
          </Styled.QuitSessionButton>
        </Styled.QuitSessionButtonContainer>
      </Styled.ContainerView>

    </TouchableWithoutFeedback>
  );
};

export default ProblemFeedbackScreen;
