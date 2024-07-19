import { useMemo } from 'react';
import { useSubscription } from '@apollo/client';
// import CURRENT_USER_SUBSCRIPTION from './queries';
import Queries from '../user-join-screen/queries';


console.log("call current");
const useCurrentUser = () => {
  const { data, loading, error } = useSubscription(Queries.USER_CURRENT_SUBSCRIPTION);

  console.log("useCurrentUser - data:", data);
  console.log("useCurrentUser - loading:", loading);
  console.log("useCurrentUser - error:", error);

  const currentUserData = useMemo(() => {
      // currentUserData: data?.user_current || null,
    return {
      data: data ? data : null,
      loading,
      error
    };
  }, [data, loading, error]);

  return currentUserData;
};

export default useCurrentUser;

