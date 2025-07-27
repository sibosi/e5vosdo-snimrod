import useDynamicColors from '../hooks/useDynamicColors';
import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import Text from './Text';
import RenderHTML from 'react-native-render-html';

type SideCardProps = {
  title: string;
  image?: string;
  details?: string;
  description: string;
  popup: boolean;
  children?: React.ReactNode;
  makeStringToHTML?: boolean;
};

function detailsPreview(details: React.ReactNode) {
  if (typeof details === 'string') {
    const detailsList = details
      .split('\n')
      .filter((line) => line.trim() !== '');
    if (
      details.split('\n')[0].startsWith('Kedves ') ||
      details.split('\n')[0].startsWith('Tisztelt ')
    ) {
      return detailsList.slice(1).join('\n').trim();
    }
  }
  return details;
}

export const SideCard = ({
  title,
  image,
  details,
  popup,
  children,
  makeStringToHTML,
}: SideCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const colors = useDynamicColors();

  return (
    <>
      <TouchableOpacity
        style={{
          backgroundColor: colors.surfaceContainer,
          width: '100%',
          maxWidth: 400,
          borderRadius: 16,
        }}
        onPress={() => setIsModalOpen(true)}
        activeOpacity={0.7}
      >
        {image !== undefined && (
          <View
            style={{
              overflow: 'hidden',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              height: 180,
            }}
          >
            <Image
              source={{ uri: image }}
              style={{
                width: '100%',
                height: '100%',
              }}
              resizeMode="cover"
            />
            <View
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0)', // bg-foreground-100 bg-opacity-10
                padding: 16, // p-4
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}
              >
                {children}
              </View>
            </View>
          </View>
        )}

        <View style={{ marginHorizontal: 16, marginTop: 12, marginBottom: 16 }}>
          <Text
            style={{
              color: colors.onSurface,
              fontSize: 22,
              fontWeight: '500',
            }}
          >
            {title}
          </Text>

          {details && (
            <Text
              numberOfLines={3}
              style={{
                marginTop: 6,
                color: colors.onSurface,
                fontWeight: '300',
              }}
            >
              {detailsPreview(details)}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalOpen && popup}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
        presentationStyle="pageSheet"
        statusBarTranslucent={true}
        style={{
          justifyContent: 'flex-end',
          margin: 0,
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {image && (
                <Image
                  source={{ uri: image }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              )}

              {details && (
                <ScrollView>
                  {makeStringToHTML ? (
                    <RenderHTML
                      source={{ html: details.replace(/\n/g, '<br />') }}
                      contentWidth={300}
                    />
                  ) : (
                    <Text style={styles.detailsText}>{details}</Text>
                  )}
                </ScrollView>
              )}
            </View>

            <TouchableOpacity
              style={styles.okButton}
              onPress={() => setIsModalOpen(false)}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '96%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
  },
  closeButton: {
    fontSize: 24,
    color: '#718096',
  },
  modalBody: {
    maxHeight: '80%',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  detailsText: {
    fontSize: 14,
    color: '#2D3748',
    lineHeight: 20,
  },
  okButton: {
    backgroundColor: '#4299E1', // bg-selfprimary-300
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 15,
  },
  okButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
