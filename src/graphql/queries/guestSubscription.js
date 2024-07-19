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


export { GET_GUEST_WAITING_USERS_SUBSCRIPTION };
