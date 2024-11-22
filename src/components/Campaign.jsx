'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cross } from '@/components/ui/cross';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Campaign({ 
  id, 
  name, 
  description, 
  startDate, 
  endDate, 
  platforms, 
  onDelete 
}) {
  const router = useRouter();
  const [deleteState, setDeleteState] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (deleteState) {
      onDelete(id);
    } else {
      setDeleteState(true);
      setTimeout(() => {
        setDeleteState(false);
      }, 3000);
    }
  };

  const handleMouseLeave = () => {
    setDeleteState(false);
  };

  const handleClick = () => {
    router.push(`/campaign/${id}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div 
      className="aspect-square bg-card border border-border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer relative group"
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all z-10">
        <Button
          variant={deleteState ? "destructive" : "ghost"}
          size="sm"
          className={`h-8 ${deleteState ? 'min-w-[4rem]' : 'w-8'} hover:bg-${deleteState ? 'destructive/90' : 'background/90'} hover:text-${deleteState ? 'destructive-foreground' : 'foreground'}`}
          onClick={handleDelete}
        >
          {deleteState ? (
            <span className="text-sm font-medium">really?</span>
          ) : (
            <Cross className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="p-4 h-full flex flex-col">
        <h3 className="text-lg font-medium text-foreground truncate mb-2">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>
        
        <div className="flex gap-2 mb-4">
          {platforms.map((platform) => (
            <Badge 
              key={platform}
              variant="secondary"
              className={`${
                platform === 'facebook' ? 'bg-blue-100 text-blue-800' : 
                platform === 'instagram' ? 'bg-pink-100 text-pink-800' : ''
              }`}
            >
              {platform}
            </Badge>
          ))}
        </div>

        <div className="mt-auto space-y-1">
          <p className="text-sm text-muted-foreground flex justify-between">
            <span>Start:</span>
            <span>{formatDate(startDate)}</span>
          </p>
          <p className="text-sm text-muted-foreground flex justify-between">
            <span>End:</span>
            <span>{formatDate(endDate)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
