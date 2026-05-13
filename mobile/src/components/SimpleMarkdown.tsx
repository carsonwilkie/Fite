import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

interface Props {
  children: string;
}

// Pure-JS markdown renderer — no native dependencies.
// Handles: ## headings, **bold**, bullet lists (- or *), plain paragraphs.
export function SimpleMarkdown({ children }: Props) {
  const lines = (children ?? '').split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines (add small spacer)
    if (line.trim() === '') {
      elements.push(<View key={key++} style={styles.spacer} />);
      continue;
    }

    // ## Heading
    if (line.startsWith('## ')) {
      elements.push(
        <Text key={key++} style={styles.h2}>
          {line.slice(3).trim()}
        </Text>
      );
      continue;
    }

    // # Heading
    if (line.startsWith('# ')) {
      elements.push(
        <Text key={key++} style={styles.h1}>
          {line.slice(2).trim()}
        </Text>
      );
      continue;
    }

    // Bullet list item (- or *)
    if (/^[-*]\s/.test(line)) {
      elements.push(
        <View key={key++} style={styles.bulletRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>{renderInline(line.slice(2).trim())}</Text>
        </View>
      );
      continue;
    }

    // Plain paragraph
    elements.push(
      <Text key={key++} style={styles.paragraph}>
        {renderInline(line.trim())}
      </Text>
    );
  }

  return <View>{elements}</View>;
}

// Render inline **bold** and *italic* within a line
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match **bold** or *italic*
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(<Text key={key++}>{text.slice(last, match.index)}</Text>);
    }
    if (match[0].startsWith('**')) {
      parts.push(<Text key={key++} style={styles.bold}>{match[2]}</Text>);
    } else {
      parts.push(<Text key={key++} style={styles.italic}>{match[3]}</Text>);
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(<Text key={key++}>{text.slice(last)}</Text>);
  }

  return parts.length > 0 ? parts : [<Text key={0}>{text}</Text>];
}

const styles = StyleSheet.create({
  h1: {
    color: Colors.secondary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.base,
    marginBottom: Spacing.xs,
  },
  h2: {
    color: Colors.secondary,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.base,
    marginBottom: Spacing.xs,
  },
  paragraph: {
    color: Colors.text,
    fontSize: Typography.sizes.base,
    lineHeight: 24,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingLeft: Spacing.sm,
  },
  bullet: {
    color: Colors.secondary,
    fontSize: Typography.sizes.base,
    marginRight: Spacing.sm,
    lineHeight: 24,
  },
  bulletText: {
    color: Colors.text,
    fontSize: Typography.sizes.base,
    lineHeight: 24,
    flex: 1,
  },
  bold: {
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  italic: {
    fontStyle: 'italic',
    color: Colors.text,
  },
  spacer: {
    height: Spacing.xs,
  },
});
