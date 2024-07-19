import { gql } from '@apollo/client';

const GET_GUEST_WAITING_USERS_SUBSCRIPTION = gql`
  subscription getGuestWaitingUsers {
    user_guest(where: {isWaiting: {_eq: true}}) {
      guestLobbyMessage
      isAllowed
      isDenied
      userId
      user {
        authed
        userId
        name
        color
        role
        avatar
      }
    }
  }
`;

const SUBMIT_APPROVAL_STATUS = gql`
  mutation SubmitApprovalStatus($guests: [GuestUserApprovalStatus]!) {
    guestUsersSubmitApprovalStatus(guests: $guests)
  }
`;

export { GET_GUEST_WAITING_USERS_SUBSCRIPTION, SUBMIT_APPROVAL_STATUS };
