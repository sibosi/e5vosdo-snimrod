import { Pressable, Text } from 'react-native';

export function Button() {
  return (
    <Pressable className="bg-green-500 p-8 rounded-lg mt-4">
      <Text className="text-white text-center text-lg">Huge Button</Text>
    </Pressable>
  );
}
