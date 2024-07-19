import { View, Text } from 'react-native';
import { useCurrentUser } from '../useCurrentUser';

console.log("TEST SCREEN")
const TestComp = () => {
  const { data, loading, error } = useCurrentUser();
  const currentUser = data?.user_current[0];


  if (!loading && !error) {
    console.log("load", loading)
    console.log("error", error)
    // eslint-disable-next-line no-prototype-builtins
    if (!data?.hasOwnProperty('user_current')
      // eslint-disable-next-line eqeqeq
      || data.user_current.length == 0
    ) {
      return (
        <Text>
          Error: User not found
        </Text>
      );
    }

    return (
      <Text style={{ color: 'black' }}>Loading...</Text>
    );
  }

  return (
    <View>
      <Text>User ID: {currentUser?.userId}</Text>
      <Text>Is Moderator: {currentUser?.isModerator ? 'Yes' : 'No'}</Text>
    </View>
  );
};

export default TestComp;
