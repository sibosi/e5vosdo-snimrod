import { View, Text, Pressable } from 'react-native';
import { Button } from '@repo/ui/index';
import { MenuInSection } from '@repo/ui/src/android/Menu';
import './global.css';

export default function App() {
  const demoUser = { id: '1', name: 'Sibosi', email: 'Sibosi@idk.hu' };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold mb-4">Hello, {demoUser.name}!</Text>
      <Pressable className="bg-blue-500 p-4 rounded-lg">
        <Text className="text-white text-center">Hi</Text>
      </Pressable>

      <Pressable className="bg-green-500 p-8 rounded-lg mt-4">
        <Text className="text-white text-center text-lg">Huge Button</Text>
      </Pressable>
      <Button />

      <MenuInSection selfUser={undefined} />
    </View>
  );
}
