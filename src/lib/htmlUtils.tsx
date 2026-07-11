import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

/**
 * Parses image_url column value, supporting fallback for single string URLs
 * or structured JSON arrays of multiple image/video media items.
 */
export const getMediaItems = (imageUrl: string | null | undefined): MediaItem[] => {
  if (!imageUrl) return [];
  const trimmed = imageUrl.trim();
  if (trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed) as MediaItem[];
    } catch (e) {
      console.warn('[getMediaItems] Failed to parse JSON media array:', e);
    }
  }
  return [{ type: 'image', url: trimmed }];
};

/**
 * Strips all HTML tags and decodes basic entities to return plain text.
 */
export const stripHTML = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

/**
 * Parses simple HTML string and returns React Native Text/View components.
 */
export const parseHTML = (html: string) => {
  if (!html) return null;

  // Replace br tags with newlines
  const processed = html.replace(/<br\s*\/?>/gi, '\n');

  // Regex to split by tags
  const tagRegex = /(<\/?[a-zA-Z1-6]+(?:\s+[^>]*?)?>)/g;
  const parts = processed.split(tagRegex);

  const elements: React.ReactNode[] = [];
  const currentStyles: any = {};
  let currentParagraphText: React.ReactNode[] = [];
  let keyCounter = 0;

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith('<')) {
      const tagName = part.replace(/[<\/>]/g, '').split(' ')[0].toLowerCase();
      const isClosing = part.startsWith('</');

      if (tagName === 'p') {
        if (isClosing) {
          if (currentParagraphText.length > 0) {
            elements.push(
              <Text key={`p-${keyCounter++}`} style={styles.paragraph}>
                {currentParagraphText}
              </Text>
            );
            currentParagraphText = [];
          } else {
            elements.push(<View key={`p-empty-${keyCounter++}`} style={styles.emptyParagraph} />);
          }
        }
      } else if (tagName === 'strong' || tagName === 'b') {
        currentStyles.fontWeight = isClosing ? undefined : 'bold';
      } else if (tagName === 'em' || tagName === 'i') {
        currentStyles.fontStyle = isClosing ? undefined : 'italic';
      } else if (tagName === 'u') {
        currentStyles.textDecorationLine = isClosing ? undefined : 'underline';
      } else if (tagName === 'h1') {
        currentStyles.fontSize = isClosing ? undefined : 24;
        currentStyles.fontWeight = isClosing ? undefined : 'bold';
      } else if (tagName === 'h2') {
        currentStyles.fontSize = isClosing ? undefined : 20;
        currentStyles.fontWeight = isClosing ? undefined : 'bold';
      } else if (tagName === 'h3') {
        currentStyles.fontSize = isClosing ? undefined : 18;
        currentStyles.fontWeight = isClosing ? undefined : 'bold';
      }
    } else {
      const decodedText = part
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      const textStyle = {
        fontWeight: currentStyles.fontWeight,
        fontStyle: currentStyles.fontStyle,
        textDecorationLine: currentStyles.textDecorationLine,
        fontSize: currentStyles.fontSize,
      };

      currentParagraphText.push(
        <Text key={`txt-${keyCounter++}`} style={textStyle}>
          {decodedText}
        </Text>
      );
    }
  }

  if (currentParagraphText.length > 0) {
    elements.push(
      <Text key={`p-rem-${keyCounter++}`} style={styles.paragraph}>
        {currentParagraphText}
      </Text>
    );
  }

  return <View style={styles.container}>{elements}</View>;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  paragraph: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 26,
    marginBottom: 12,
  },
  emptyParagraph: {
    height: 12,
  },
});
