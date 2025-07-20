import React from 'react';
import { View, Text } from 'react-native';

const DisplayJSON = ({
  data,
  title = 'Data',
  isLoading = false,
  error,
}: {
  data: any;
  title?: string;
  isLoading?: boolean;
  error?: Error;
}) => {
  if (isLoading) return <View>Loading...</View>;
  if (error) return <View>Error: {error.message}</View>;
  return (
    <View>
      <Text>{title}</Text>
      <Text>{JSON.stringify(data, null, 2)}</Text>
    </View>
  );
};

export default DisplayJSON;
