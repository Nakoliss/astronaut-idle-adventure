const Resource = ({
  icon,
  value,
}: {
  icon: string;
  value: string | number;
}) => (
  <div className="flex items-center gap-1">
    <img src={`/icons/${icon}.svg`} className="w-4 h-4" />
    <span>{value}</span>
  </div>
);

export const TopBar = () => (
  <div className="flex gap-3 text-sm text-zinc-200">
    <Resource icon="scrap" value="12.4k" />
    <Resource icon="ice" value="7.8k" />
    <Resource icon="protein" value="3.2k" />
    <Resource icon="fuel" value="540" />
  </div>
);
