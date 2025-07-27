import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import menzaMenu from '@repo/resources/mindenkorimenu.json';
import { PossibleUserType } from '@repo/types/index';
import { Section } from './Section'; // Import the Section component
import useDynamicColors from '../hooks/useDynamicColors'; // Import the custom hook for dynamic colors
import ArrowIcon from 'packages/icons/src/arrow.svg';
import Text from './Text';

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
  const colors = useDynamicColors();
  const backgroundColor =
    menu === 'A' ? colors.secondaryContainer : colors.tertiaryContainer;
  const textColor =
    menu === 'A' ? colors.onSecondaryContainer : colors.onTertiaryContainer;
  const borderColor = colors.outlineVariant;

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 36,
            fontWeight: '700',
            color: textColor,
          }}
        >
          {menu}
        </Text>
      </View>
      <View style={{ marginTop: 8, width: '100%' }}>
        {items.length > 0 ? (
          items.map((fogas, i) =>
            fogas ? (
              <Text
                key={i}
                style={{
                  paddingVertical: 4,
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: borderColor,
                  textAlign: 'center',
                }}
              >
                {fogas}
              </Text>
            ) : null
          )
        ) : (
          <Text
            style={{
              paddingVertical: 4,
              fontWeight: '300',
              color: textColor,
              textAlign: 'center',
            }}
          >
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

  const colors = useDynamicColors();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryContainer,
        borderRadius: 9999,
        paddingHorizontal: 8,
        gap: 8,
        height: 32,
      }}
    >
      <TouchableOpacity onPress={() => changeDate(-1)}>
        <ArrowIcon
          width={16}
          height={16}
          fill={colors.onPrimaryContainer}
          rotation={90}
        />
      </TouchableOpacity>
      <Text
        style={{
          color: colors.onPrimaryContainer,
          fontWeight: '500',
        }}
      >
        {formatDate(date, true)}
      </Text>
      <TouchableOpacity onPress={() => changeDate(1)}>
        <ArrowIcon
          width={16}
          height={16}
          fill={colors.onPrimaryContainer}
          rotation={270}
        />
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
    <View
      style={{
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
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
