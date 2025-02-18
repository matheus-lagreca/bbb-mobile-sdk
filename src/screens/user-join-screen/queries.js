import { gql } from "@apollo/client";

const GET_USER_CURRENT = gql`
  subscription getUserCurrent {
    user_current {
      userId
      authToken
      joinErrorCode
      joinErrorMessage
      joined
      ejectReasonCode
      loggedOut
      guestStatus
      meeting {
        meetingId
        name
        ended
        endedReasonCode
        endedByUserName
        logoutUrl
      }
      guestStatusDetails {
        guestLobbyMessage
        positionInWaitingQueue
        isAllowed
      }
    }
  }
`;

const USER_JOIN_MUTATION = gql`
  mutation UserJoin($authToken: String!, $clientType: String!) {
    userJoinMeeting(
      authToken: $authToken
      clientType: $clientType
      clientIsMobile: $clientIsMobile
    )
  }
`;

export { GET_USER_CURRENT, USER_JOIN_MUTATION };
