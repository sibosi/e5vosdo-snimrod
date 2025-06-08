import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import menzaMenu from '@repo/resources/mindenkorimenu.json';
import { PossibleUserType } from '@repo/types/index';
import { Section } from './Section'; // Import the Section component

// Utility to format dates
function formatDate(date: Date, simple = false) {
  if (simple) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 0) return 'Ma';
    if (diff === 1) return 'Holnap';
    if (diff === -1) return 'Tegnap';
    return format(d, 'MM.dd EEE', { locale: hu });
  }
  return format(date, 'yyyy.MM.dd', { locale: hu });
}

type MenuType = Record<string, { A: string[]; B: string[]; nap: string }>;
const mindenkorimenu = menzaMenu as unknown as MenuType;

// MenuCard component
const MenuCard = ({ menu, items }: { menu: 'A' | 'B'; items: string[] }) => {
  const bg = menu === 'A' ? 'bg-blue-100' : 'bg-orange-100';
  const textColor = menu === 'A' ? 'text-blue-700' : 'text-orange-700';
  return (
    <View className={`flex-1 m-2 p-4 rounded-xl ${bg} items-center`}>
      <View className="w-10 h-10 items-center justify-center">
        <Text className={`text-2xl font-bold ${textColor}`}>{menu}</Text>
      </View>
      <View className="mt-2 w-full">
        {items.length > 0 ? (
          items.map((fogas, i) =>
            fogas ? (
              <Text
                key={i}
                className={`py-1 ${
                  i > 0
                    ? menu === 'A'
                      ? 'border-t border-blue-400'
                      : 'border-t border-orange-400'
                    : ''
                }`}
              >
                {fogas}
              </Text>
            ) : null
          )
        ) : (
          <Text className={`py-1 font-light ${textColor}`}>
            Nincs információ
          </Text>
        )}
      </View>
    </View>
  );
};

// DatePicker component
const DatePicker = ({
  date,
  setDate,
}: {
  date: Date;
  setDate: (d: Date) => void;
}) => {
  const changeDate = (offset: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + offset);
    setDate(newDate);
  };

  return (
    <View className="flex-row items-center bg-blue-100 rounded-full p-2">
      <TouchableOpacity onPress={() => changeDate(-1)} className="px-2">
        <Text className="text-blue-700">◀︎</Text>
      </TouchableOpacity>
      <Text className="text-blue-700 font-medium">
        {formatDate(date, true)}
      </Text>
      <TouchableOpacity onPress={() => changeDate(1)} className="px-2">
        <Text className="text-blue-700">▶︎</Text>
      </TouchableOpacity>
    </View>
  );
};

// Main Menu component
export const Menu = ({
  menu,
  date = new Date(),
}: {
  menu?: 'A' | 'B';
  date?: Date;
}) => {
  const [realMenu, setRealMenu] = useState<'A' | 'B' | undefined>(menu);

  useEffect(() => {
    fetch('/api/getAuth')
      .then((res) => res.json())
      .then((data: PossibleUserType) => {
        if (data?.food_menu === 'A' || data?.food_menu === 'B') {
          setRealMenu(data.food_menu);
        }
      });
  }, []);

  const key = format(date, 'yyyy.MM.dd', { locale: hu });
  const dayMenu = mindenkorimenu[key] || { A: [], B: [], nap: key };

  return (
    <View className="flex-row">
      {realMenu !== 'B' && <MenuCard menu="A" items={dayMenu.A} />}
      {realMenu !== 'A' && <MenuCard menu="B" items={dayMenu.B} />}
    </View>
  );
};

// MenuInSection using the Section component
export const MenuInSection = ({
  selfUser,
  dropdownable = true,
  defaultStatus,
}: {
  selfUser: PossibleUserType | null | undefined;
  dropdownable?: boolean;
  defaultStatus?: 'opened' | 'closed';
}) => {
  const [date, setDate] = useState(new Date());

  return (
    <Section
      title="Mi a mai menü?"
      dropdownable={dropdownable}
      defaultStatus={defaultStatus}
      sideComponent={<DatePicker date={date} setDate={setDate} />}
    >
      <Menu
        date={date}
        menu={
          selfUser?.food_menu === 'A' || selfUser?.food_menu === 'B'
            ? selfUser?.food_menu
            : undefined
        }
      />
    </Section>
  );
};
