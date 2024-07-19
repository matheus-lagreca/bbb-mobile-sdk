import { gql } from '@apollo/client';

const GET_GUEST_WAITING_USERS_SUBSCRIPTION = gql`
  subscription getGuestWaitingUsers{
    user_guest(where: {isWaiting: {_eq: true}}) {
      user {
        color
        name
        role
      }
    }
  }
`;

const SET_POLICY = gql`
  mutation SetPolicy($guestPolicy: String!) {
    guestUsersSetPolicy(guestPolicy: $guestPolicy)
  }
`;

export { GET_GUEST_WAITING_USERS_SUBSCRIPTION, SET_POLICY };
