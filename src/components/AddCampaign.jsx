'use client';

export default function AddCampaign({ onAdd }) {
  return (
    <div 
      onClick={onAdd}
      className="aspect-square bg-card border border-border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center hover:bg-accent/10"
    >
      <div className="text-6xl font-light text-foreground/50 hover:text-foreground/80 transition-colors">
        +
      </div>
    </div>
  );
}
