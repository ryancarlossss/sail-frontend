import { View, Text } from "react-native";

interface SummaryCardProps {
  title: string;
  value: string | number;
  prefix?: string;
}

function SummaryCard({ title, value, prefix }: SummaryCardProps) {
  return (
    <View className="flex-1 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <Text className="text-xs text-gray-500 mb-1">{title}</Text>
      <Text className="text-lg font-bold text-white">
        {prefix && <Text className="text-primary">{prefix}</Text>}
        {value}
      </Text>
    </View>
  );
}

interface SummaryCardsProps {
  cards: SummaryCardProps[];
}

export function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <View className="flex-row gap-3 mb-6">
      {cards.map((card, index) => (
        <SummaryCard key={index} {...card} />
      ))}
    </View>
  );
}
