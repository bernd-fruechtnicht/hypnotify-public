import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatementCard } from './StatementCard';
import { MeditationStatement } from '../types';

interface DraggableStatementListProps {
  statements: MeditationStatement[];
  onReorder: (reorderedStatements: MeditationStatement[]) => void;
  onRemove?: (statement: MeditationStatement, index: number) => void;
  onPress?: (statement: MeditationStatement, index: number) => void;
  showDragHandles?: boolean;
  showRemoveButtons?: boolean;
  compact?: boolean;
  emptyMessage?: string;
}

interface DragItem {
  statement: MeditationStatement;
  index: number;
  translateY: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
}

export const DraggableStatementList: React.FC<DraggableStatementListProps> = ({
  statements,
  onReorder,
  onRemove,
  onPress,
  showDragHandles = true,
  showRemoveButtons = true,
  compact = false,
  emptyMessage,
}) => {
  const { t } = useTranslation();
  const [_draggedIndex, _setDraggedIndex] = useState<number | null>(null);
  const [dragItems, setDragItems] = useState<DragItem[]>([]);

  // Initialize drag items when statements change
  React.useEffect(() => {
    const items: DragItem[] = statements.map((statement, index) => ({
      statement,
      index,
      translateY: new Animated.Value(0),
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
    }));
    setDragItems(items);
  }, [statements]);

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      handleReorder(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < statements.length - 1) {
      handleReorder(index, index + 1);
    }
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newStatements = [...statements];
    const [movedStatement] = newStatements.splice(fromIndex, 1);
    newStatements.splice(toIndex, 0, movedStatement);

    onReorder(newStatements);
  };

  const handleRemove = (statement: MeditationStatement, index: number) => {
    if (onRemove) {
      onRemove(statement, index);
    }
  };

  const handlePress = (statement: MeditationStatement, index: number) => {
    if (onPress) {
      onPress(statement, index);
    }
  };

  if (statements.length === 0) {
    return (
      <View
        style={[styles.emptyContainer, compact && styles.compactEmptyContainer]}
      >
        <Text style={[styles.emptyText, compact && styles.compactEmptyText]}>
          {emptyMessage || t('draggableList.emptyMessage')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, compact && styles.compactContainer]}
      showsVerticalScrollIndicator={false}
    >
      {dragItems.map((item, index) => (
        <Animated.View
          key={`${item.statement.id}-${index}`}
          style={[
            styles.dragItem,
            compact && styles.compactDragItem,
            {
              transform: [{ scale: item.scale }],
              opacity: item.opacity,
            },
          ]}
        >
          <View style={styles.itemContainer}>
            {/* Move Up Button */}
            {showDragHandles && index > 0 && (
              <TouchableOpacity
                style={styles.moveButton}
                onPress={() => handleMoveUp(index)}
              >
                <Text style={styles.moveButtonText}>↑</Text>
              </TouchableOpacity>
            )}

            {/* Statement Card */}
            <View style={styles.statementContainer}>
              <StatementCard
                statement={item.statement}
                onPress={() => handlePress(item.statement, index)}
                compact={compact}
              />
            </View>

            {/* Move Down Button */}
            {showDragHandles && index < statements.length - 1 && (
              <TouchableOpacity
                style={styles.moveButton}
                onPress={() => handleMoveDown(index)}
              >
                <Text style={styles.moveButtonText}>↓</Text>
              </TouchableOpacity>
            )}

            {/* Remove Button */}
            {showRemoveButtons && onRemove && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(item.statement, index)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            )}

            {/* Order Number */}
            <View style={styles.orderNumber}>
              <Text style={styles.orderNumberText}>{index + 1}</Text>
            </View>
          </View>
        </Animated.View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  compactContainer: {
    maxHeight: 300,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  compactEmptyContainer: {
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  compactEmptyText: {
    fontSize: 14,
  },
  dragItem: {
    marginVertical: 4,
  },
  compactDragItem: {
    marginVertical: 2,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moveButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  moveButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  statementContainer: {
    flex: 1,
  },
  removeButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 18,
    color: '#F44336',
    fontWeight: 'bold',
  },
  orderNumber: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
