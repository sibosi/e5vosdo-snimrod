import { useState, useEffect } from 'react';
import { ScrollView, View, ViewStyle } from 'react-native';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import menzaMenu from '@repo/resources/mindenkorimenu.json';
import { PossibleUserType } from '@repo/types/index';
import useDynamicColors from '../../hooks/useDynamicColors';
import Text from '../Text';
import { useDateContext } from './DateContext';

type MenuType = Record<string, { A: string[]; B: string[]; nap: string }>;
const mindenkorimenu = menzaMenu as unknown as MenuType;

const MenuCard = ({ menu, items }: { menu: 'A' | 'B'; items: string[] }) => {
  const colors = useDynamicColors();
  const backgroundColor =
    menu === 'A' ? colors.secondaryContainer : colors.tertiaryContainer;
  const textColor =
    menu === 'A' ? colors.onSecondaryContainer : colors.onTertiaryContainer;
  const borderColor = menu === 'A' ? colors.secondary : colors.tertiary;

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        gap: 32,
        paddingHorizontal: 32,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor,
        alignItems: 'center',
        width: 330,
        minHeight: 120,
      }}
    >
      <View
        style={{
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
      <View
        style={{
          marginTop: 8,
          justifyContent: 'center',
          flex: 1,
        }}
      >
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

export const MenuTray = ({
  menu,
  style,
}: {
  menu?: 'A' | 'B';
  style?: ViewStyle;
}) => {
  const [realMenu, setRealMenu] = useState<'A' | 'B' | undefined>(menu);
  const { date } = useDateContext();

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
    <ScrollView
      horizontal
      contentContainerStyle={{
        gap: 16,
        ...style,
      }}
      showsHorizontalScrollIndicator={false}
    >
      <MenuCard menu="A" items={dayMenu.A} />
      <MenuCard menu="B" items={dayMenu.B} />
    </ScrollView>
  );
};
