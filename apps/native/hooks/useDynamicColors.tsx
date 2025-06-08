import { useMemo } from 'react';
import { PlatformColor, useColorScheme } from 'react-native';

const definitions = [
  ['Primary', 'system_palette_key_color_primary'],
  ['OnPrimary', 'system_on_primary'],
  ['PrimaryContainer', 'system_primary_container'],
  ['OnPrimaryContainer', 'system_on_primary_container'],

  ['Secondary', 'system_palette_key_color_secondary'],
  ['OnSecondary', 'system_on_secondary'],
  ['SecondaryContainer', 'system_secondary_container'],
  ['OnSecondaryContainer', 'system_on_secondary_container'],

  ['Tertiary', 'system_palette_key_color_tertiary'],
  ['OnTertiary', 'system_on_tertiary'],
  ['TertiaryContainer', 'system_tertiary_container'],
  ['OnTertiaryContainer', 'system_on_tertiary_container'],

  ['Error', 'system_error'],
  ['OnError', 'system_on_error'],

  ['Background', 'system_background'],

  ['Surface', 'system_surface'],
  ['SurfaceVariant', 'system_surface_variant'],
  ['OnSurface', 'system_on_surface'],
  ['OnSurfaceVariant', 'system_on_surface_variant'],

  ['Outline', 'system_outline'],
] as const;

type Attr = (typeof definitions)[number][0];
type ThemedKey<A extends string> = Uncapitalize<A>;
type LightKey<A extends string> = `${Uncapitalize<A>}Light`;
type DarkKey<A extends string> = `${Uncapitalize<A>}Dark`;

export type DynamicColors = {
  [A in Attr as ThemedKey<A>]: ReturnType<typeof PlatformColor>;
} & { [A in Attr as LightKey<A>]: ReturnType<typeof PlatformColor> } & {
  [A in Attr as DarkKey<A>]: ReturnType<typeof PlatformColor>;
};

export default function useDynamicColors(): DynamicColors {
  const scheme = useColorScheme();

  return useMemo(() => {
    const colors = {} as DynamicColors;

    definitions.forEach(([attr, resBase]) => {
      const keyBase = (attr.charAt(0).toLowerCase() +
        attr.slice(1)) as Uncapitalize<Attr>;
      const lightKey = `${keyBase}Light` as keyof DynamicColors;
      const darkKey = `${keyBase}Dark` as keyof DynamicColors;
      const themedKey = keyBase as keyof DynamicColors;

      colors[lightKey] = PlatformColor(`@android:color/${resBase}_light`);
      colors[darkKey] = PlatformColor(`@android:color/${resBase}_dark`);
      colors[themedKey] =
        scheme === 'dark' ? colors[darkKey] : colors[lightKey];
    });

    return colors;
  }, [scheme]);
}
