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
  ['ErrorContainer', 'system_error_container'],
  ['OnErrorContainer', 'system_on_error_container'],

  ['PrimaryFixed', 'system_primary_fixed'],
  ['PrimaryFixedDim', 'system_primary_fixed_dim'],
  ['OnPrimaryFixed', 'system_on_primary_fixed'],
  ['OnPrimaryFixedVariant', 'system_on_primary_fixed_variant'],

  ['SecondaryFixed', 'system_secondary_fixed'],
  ['SecondaryFixedDim', 'system_secondary_fixed_dim'],
  ['OnSecondaryFixed', 'system_on_secondary_fixed'],
  ['OnSecondaryFixedVariant', 'system_on_secondary_fixed_variant'],

  ['TertiaryFixed', 'system_tertiary_fixed'],
  ['TertiaryFixedDim', 'system_tertiary_fixed_dim'],
  ['OnTertiaryFixed', 'system_on_tertiary_fixed'],
  ['OnTertiaryFixedVariant', 'system_on_tertiary_fixed_variant'],

  ['Background', 'system_background'],
  ['Surface', 'system_surface'],
  ['SurfaceDim', 'system_surface_dim'],
  ['SurfaceBright', 'system_surface_bright'],

  ['SurfaceContainerLowest', 'system_surface_container_lowest'],
  ['SurfaceContainerLow', 'system_surface_container_low'],
  ['SurfaceContainer', 'system_surface_container'],
  ['SurfaceContainerHigh', 'system_surface_container_high'],
  ['SurfaceContainerHighest', 'system_surface_container_highest'],

  ['OnSurface', 'system_on_surface'],
  ['OnSurfaceVariant', 'system_on_surface_variant'],

  ['InverseSurface', 'system_inverse_surface'],
  ['InverseOnSurface', 'system_inverse_on_surface'],
  ['InversePrimary', 'system_inverse_primary'],

  ['Outline', 'system_outline'],
  ['OutlineVariant', 'system_outline_variant'],

  ['Scrim', 'system_scrim'],
  ['Shadow', 'system_shadow'],
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

      if (!resBase.includes('fixed')) {
        colors[lightKey] = PlatformColor(`@android:color/${resBase}_light`);
        colors[darkKey] = PlatformColor(`@android:color/${resBase}_dark`);
        colors[themedKey] =
          scheme === 'dark' ? colors[darkKey] : colors[lightKey];
      } else {
        colors[themedKey] = PlatformColor(`@android:color/${resBase}`);
      }
    });

    return colors;
  }, [scheme]);
}
